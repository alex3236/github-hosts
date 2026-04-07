import "server-only";
import dns from "node:dns/promises";

export interface HostsData {
  raw: string;
  updateTime: string;
  entries: { ip: string; hostname: string }[];
}

interface HostsCache {
  updateTime: string;
  fetchedAt?: string;
  entries: { ip: string; domain: string }[];
}

const CACHE_TTL_MS = Number(process.env.HOSTS_CACHE_TTL_MS ?? 12 * 60 * 60 * 1000);

const GITHUB_DOMAINS = [
  "alive.github.com",
  "live.github.com",
  "github.githubassets.com",
  "central.github.com",
  "desktop.githubusercontent.com",
  "assets-cdn.github.com",
  "camo.githubusercontent.com",
  "github.map.fastly.net",
  "github.global.ssl.fastly.net",
  "gist.github.com",
  "github.io",
  "github.com",
  "github.blog",
  "api.github.com",
  "raw.githubusercontent.com",
  "user-images.githubusercontent.com",
  "favicons.githubusercontent.com",
  "avatars5.githubusercontent.com",
  "avatars4.githubusercontent.com",
  "avatars3.githubusercontent.com",
  "avatars2.githubusercontent.com",
  "avatars1.githubusercontent.com",
  "avatars0.githubusercontent.com",
  "avatars.githubusercontent.com",
  "codeload.github.com",
  "github-cloud.s3.amazonaws.com",
  "github-com.s3.amazonaws.com",
  "github-production-release-asset-2e65be.s3.amazonaws.com",
  "github-production-user-asset-6210df.s3.amazonaws.com",
  "github-production-repository-file-5c1aeb.s3.amazonaws.com",
  "githubstatus.com",
  "github.community",
  "github.dev",
  "collector.github.com",
  "pipelines.actions.githubusercontent.com",
  "media.githubusercontent.com",
  "cloud.githubusercontent.com",
  "objects.githubusercontent.com",
];

let cachedHosts: HostsCache | null = null;
let refreshPromise: Promise<HostsCache | null> | null = null;

function isCacheFresh(cache: HostsCache): boolean {
  const base = cache.fetchedAt ?? cache.updateTime;
  const timestamp = new Date(base).getTime();
  if (!Number.isFinite(timestamp)) return false;
  return Date.now() - timestamp < CACHE_TTL_MS;
}

async function resolveIp(domain: string): Promise<string | null> {
  try {
    const addresses = await dns.resolve4(domain);
    return addresses[0] ?? null;
  } catch {
    return null;
  }
}

async function refreshCacheFromDns(): Promise<HostsCache | null> {
  const results = await Promise.all(
    GITHUB_DOMAINS.map(async (domain) => {
      const ip = await resolveIp(domain);
      return ip ? { ip, domain } : null;
    })
  );

  const entries = results.filter((item): item is { ip: string; domain: string } => item !== null);
  if (entries.length === 0) {
    return null;
  }

  const now = new Date();
  const cache: HostsCache = {
    updateTime: now.toISOString().slice(0, 10),
    fetchedAt: now.toISOString(),
    entries,
  };

  cachedHosts = cache;
  return cache;
}

function toHostsData(cache: HostsCache): HostsData {
  const { updateTime, entries: cacheEntries } = cache;

  const hostsLines = [
    "#Github Hosts Start",
    `#Update Time: ${updateTime}`,
    "#Project Address: https://github.com/alex3236/github-hosts",
    `#Update URL: https://${process.env.NEXT_PUBLIC_BASE_URL}/api/hosts`,
    ...cacheEntries.map(({ ip, domain }) => `${ip} ${domain}`),
    "#Github Hosts End",
  ];

  return {
    raw: hostsLines.join("\n") + "\n",
    updateTime,
    entries: cacheEntries.map(({ ip, domain }) => ({ ip, hostname: domain })),
  };
}

export async function parseHosts(): Promise<HostsData> {
  const cache = cachedHosts;

  if (cache && isCacheFresh(cache)) {
    return toHostsData(cache);
  }

  if (!refreshPromise) {
    refreshPromise = refreshCacheFromDns().finally(() => {
      refreshPromise = null;
    });
  }

  const refreshed = await refreshPromise;
  if (refreshed) {
    return toHostsData(refreshed);
  }

  if (cache) {
    return toHostsData(cache);
  }

  return { raw: "", updateTime: "", entries: [] };
}

export async function getHostsContent(): Promise<string> {
  return (await parseHosts()).raw;
}

