export const RAW_URL = "/api/hosts";
export const WINDOWS_SCRIPT_URL = "/api/scripts/windows";
export const UNIX_SCRIPT_URL = "/api/scripts/unix";
export const REPO_URL = "https://github.com/alex3236/github-hosts";

export const ALLOWED_BASE_URLS = [
  "https://gh-hosts.dogespace.cn",
  "https://github-hosts.vercel.app",
] as const;

export const DEFAULT_BASE_URL = ALLOWED_BASE_URLS[0];

function getHostnameFromInput(hostOrUrl?: string): string {
  if (!hostOrUrl) {
    return "";
  }

  try {
    if (hostOrUrl.startsWith("http://") || hostOrUrl.startsWith("https://")) {
      return new URL(hostOrUrl).hostname.toLowerCase();
    }

    return new URL(`https://${hostOrUrl}`).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function resolveBaseUrlByHost(hostOrUrl?: string): string {
  const hostname = getHostnameFromInput(hostOrUrl);
  if (!hostname) {
    return DEFAULT_BASE_URL;
  }

  const matched = ALLOWED_BASE_URLS.find((baseUrl) => {
    try {
      return new URL(baseUrl).hostname.toLowerCase() === hostname;
    } catch {
      return false;
    }
  });

  return matched ?? DEFAULT_BASE_URL;
}

export function buildDeployCommands(baseUrl: string): {
  windowsOneLiner: string;
  unixOneLiner: string;
} {
  return {
    windowsOneLiner: `powershell -NoProfile -ExecutionPolicy Bypass -Command \"iwr ${baseUrl}${WINDOWS_SCRIPT_URL} -UseBasicParsing | iex\"`,
    unixOneLiner: `curl -fsSL ${baseUrl}${UNIX_SCRIPT_URL} | bash`,
  };
}
