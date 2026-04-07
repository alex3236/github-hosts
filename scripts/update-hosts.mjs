#!/usr/bin/env node
// update-hosts.mjs
// Resolves IPv4 addresses for GitHub-related domains via DNS and writes
// data/hosts-cache.json as the cache consumed by the Next.js app.

import dns from "node:dns/promises";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Canonical list of GitHub domains to resolve
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

async function resolveIp(domain) {
  try {
    const addresses = await dns.resolve4(domain);
    return addresses[0] ?? null;
  } catch {
    console.warn(`  [warn] Could not resolve ${domain}`);
    return null;
  }
}

async function main() {
  const updateTime = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  console.log(`Resolving ${GITHUB_DOMAINS.length} domains...`);
  const results = await Promise.all(
    GITHUB_DOMAINS.map(async (domain) => {
      const ip = await resolveIp(domain);
      if (ip) console.log(`  ${ip.padEnd(18)} ${domain}`);
      return ip ? { ip, domain } : null;
    })
  );

  const entries = results.filter(Boolean);
  console.log(`\nResolved ${entries.length} / ${GITHUB_DOMAINS.length} domains.`);

  const cache = { updateTime, entries };

  const cachePath = path.join(ROOT, "data", "hosts-cache.json");
  await fs.mkdir(path.dirname(cachePath), { recursive: true });
  await fs.writeFile(cachePath, JSON.stringify(cache, null, 2) + "\n", "utf-8");
  console.log(`Wrote ${cachePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

