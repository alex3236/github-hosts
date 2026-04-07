param(
  [string]$HostsUrl = ""
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

chcp 65001 | Out-Null

$ErrorActionPreference = "Stop"

function Test-Admin {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($identity)
  return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Admin)) {
  Write-Error "Administrator privileges required. Please rerun this command in an elevated PowerShell window."
  exit 1
}

$hostsPath = Join-Path $env:SystemRoot "System32\drivers\etc\hosts"
$backupPath = "$hostsPath.bak.gh-hosts"
$tempPath = Join-Path $env:TEMP "github-hosts-$(Get-Date -Format 'yyyyMMddHHmmss').txt"

function Merge-HostsContent {
  param(
    [string]$Current,
    [string]$Block
  )

  $normalizedBlock = ($Block.TrimEnd() -replace "`r?`n", "`r`n") + "`r`n"
  $pattern = "(?ms)#Github Hosts Start.*?#Github Hosts End\r?\n?"

  if ($Current -match $pattern) {
    return [Regex]::Replace($Current, $pattern, $normalizedBlock)
  }

  $separator = if ([string]::IsNullOrWhiteSpace($Current) -or $Current.EndsWith("`r`n`r`n") -or $Current.EndsWith("`n`n")) { "" } else { "`r`n" }
  return $Current + $separator + $normalizedBlock
}

$sourceUrls = if ([string]::IsNullOrWhiteSpace($HostsUrl)) {
  @(
    "https://gh-hosts.dogespace.cn/api/hosts",
    "https://github-hosts.vercel.app/api/hosts"
  )
} else {
  @($HostsUrl)
}

$content = ""
$downloadedFrom = ""
$lastError = ""

foreach ($url in $sourceUrls) {
  try {
    Write-Host "Downloading hosts from: $url"
    Invoke-WebRequest -Uri $url -OutFile $tempPath -UseBasicParsing

    $candidate = Get-Content -LiteralPath $tempPath -Raw
    if ([string]::IsNullOrWhiteSpace($candidate) -or $candidate -notmatch "#Github Hosts Start") {
      throw "expected marker not found"
    }

    $content = $candidate
    $downloadedFrom = $url
    break
  } catch {
    $lastError = $_.Exception.Message
    Write-Host "Failed source: $url"
  }
}

if ([string]::IsNullOrWhiteSpace($downloadedFrom)) {
  throw "Failed to download valid hosts from all sources. Last error: $lastError"
}

Write-Host "Using source: $downloadedFrom"

Copy-Item -LiteralPath $hostsPath -Destination $backupPath -Force
$currentHosts = if (Test-Path -LiteralPath $hostsPath) {
  Get-Content -LiteralPath $hostsPath -Raw
} else {
  ""
}
$mergedHosts = Merge-HostsContent -Current $currentHosts -Block $content
Set-Content -LiteralPath $hostsPath -Value $mergedHosts -Encoding ascii -Force

Write-Host "Backed up current hosts to: $backupPath"
Write-Host "Flushing DNS cache..."
ipconfig /flushdns | Out-Null

Remove-Item -LiteralPath $tempPath -Force -ErrorAction SilentlyContinue
Write-Host "Done. Latest GitHub hosts have been applied."
