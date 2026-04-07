#!/usr/bin/env bash
set -euo pipefail

HOSTS_URL_OVERRIDE="${1:-}"
TMP_FILE="$(mktemp)"
MERGED_FILE="$(mktemp)"

cleanup() {
  rm -f "$TMP_FILE"
  rm -f "$MERGED_FILE"
}
trap cleanup EXIT

if [[ "${EUID}" -ne 0 ]]; then
  echo "Error: root privileges required. Please rerun with sudo or as root." >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1 && ! command -v wget >/dev/null 2>&1; then
  echo "Error: curl or wget is required." >&2
  exit 1
fi

if [[ -n "$HOSTS_URL_OVERRIDE" ]]; then
  SOURCE_URLS=("$HOSTS_URL_OVERRIDE")
else
  SOURCE_URLS=(
    "https://gh-hosts.dogespace.cn/api/hosts"
    "https://github-hosts.vercel.app/api/hosts"
  )
fi

DOWNLOAD_OK=0
for source_url in "${SOURCE_URLS[@]}"; do
  echo "Downloading hosts from: ${source_url}"

  if command -v curl >/dev/null 2>&1; then
    if ! curl -fsSL "$source_url" -o "$TMP_FILE"; then
      echo "Failed source: ${source_url}" >&2
      continue
    fi
  else
    if ! wget -qO "$TMP_FILE" "$source_url"; then
      echo "Failed source: ${source_url}" >&2
      continue
    fi
  fi

  if grep -q "#Github Hosts Start" "$TMP_FILE"; then
    echo "Using source: ${source_url}"
    DOWNLOAD_OK=1
    break
  fi

  echo "Failed source (invalid content): ${source_url}" >&2
done

if [[ "$DOWNLOAD_OK" -ne 1 ]]; then
  echo "Error: failed to download valid hosts from all sources." >&2
  exit 1
fi

HOSTS_PATH="/etc/hosts"
BACKUP_PATH="${HOSTS_PATH}.bak.gh-hosts"

cp "$HOSTS_PATH" "$BACKUP_PATH"

if grep -q "#Github Hosts Start" "$HOSTS_PATH" && grep -q "#Github Hosts End" "$HOSTS_PATH"; then
  awk '
    BEGIN { skip = 0 }
    /#Github Hosts Start/ { skip = 1; next }
    /#Github Hosts End/ { skip = 0; next }
    skip == 0 { print }
  ' "$HOSTS_PATH" > "$MERGED_FILE"
  printf '\n' >> "$MERGED_FILE"
  cat "$TMP_FILE" >> "$MERGED_FILE"
else
  cat "$HOSTS_PATH" > "$MERGED_FILE"
  printf '\n' >> "$MERGED_FILE"
  cat "$TMP_FILE" >> "$MERGED_FILE"
fi

cp "$MERGED_FILE" "$HOSTS_PATH"
chmod 644 "$HOSTS_PATH"

echo "Backed up current hosts to: ${BACKUP_PATH}"
echo "Trying to flush DNS cache..."

case "$(uname -s)" in
  Darwin)
    dscacheutil -flushcache || true
    killall -HUP mDNSResponder || true
    ;;
  Linux)
    resolvectl flush-caches 2>/dev/null || true
    systemd-resolve --flush-caches 2>/dev/null || true
    ;;
esac

echo "Done. Latest GitHub hosts have been applied."
