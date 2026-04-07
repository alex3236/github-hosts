import fs from "fs";
import path from "path";

export interface HostsData {
  raw: string;
  updateTime: string;
  entries: { ip: string; hostname: string }[];
}

interface HostsCache {
  updateTime: string;
  entries: { ip: string; domain: string }[];
}

function loadCache(): HostsCache | null {
  const cachePath = path.join(process.cwd(), "data", "hosts-cache.json");
  if (!fs.existsSync(cachePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(cachePath, "utf-8")) as HostsCache;
  } catch {
    return null;
  }
}

export function parseHosts(): HostsData {
  const cache = loadCache();

  if (!cache) {
    return { raw: "", updateTime: "", entries: [] };
  }

  const { updateTime, entries: cacheEntries } = cache;

  const hostsLines = [
    "#Github Hosts Start",
    `#Update Time: ${updateTime}`,
    "#Project Address: https://github.com/alex3236/github-hosts",
    "#Update URL: https://raw.githubusercontent.com/alex3236/github-hosts/master/hosts",
    ...cacheEntries.map(({ ip, domain }) => `${ip} ${domain}`),
    "#Github Hosts End",
  ];
  const raw = hostsLines.join("\n") + "\n";

  const entries = cacheEntries.map(({ ip, domain }) => ({ ip, hostname: domain }));

  return { raw, updateTime, entries };
}

export function getHostsContent(): string {
  return parseHosts().raw;
}

