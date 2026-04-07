import fs from "fs";
import path from "path";

export function getHostsContent(): string {
  const hostsPath = path.join(process.cwd(), "hosts");
  if (!fs.existsSync(hostsPath)) {
    return "#Github Hosts Start\n#Github Hosts End\n";
  }
  return fs.readFileSync(hostsPath, "utf-8");
}

export interface HostsData {
  raw: string;
  updateTime: string;
  entries: { ip: string; hostname: string }[];
}

export function parseHosts(): HostsData {
  const raw = getHostsContent();
  const lines = raw.split("\n");

  let updateTime = "";
  const entries: { ip: string; hostname: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#Update Time:")) {
      updateTime = trimmed.replace("#Update Time:", "").trim();
    } else if (trimmed && !trimmed.startsWith("#")) {
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 2) {
        entries.push({ ip: parts[0], hostname: parts[1] });
      }
    }
  }

  return { raw, updateTime, entries };
}
