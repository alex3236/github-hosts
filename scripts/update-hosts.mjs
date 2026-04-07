#!/usr/bin/env node
// update-hosts.mjs
// Resolves IPv4 addresses for GitHub-related domains via DNS and writes:
//   - hosts      (plain-text hosts file committed as cache)
//   - README.md  (rendered from README_TEMPLATE.md pattern)

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

  // Build hosts file content
  const hostsLines = [
    "#Github Hosts Start",
    `#Update Time: ${updateTime}`,
    `#Project Address: https://github.com/alex3236/github-hosts`,
    `#Update URL: https://raw.githubusercontent.com/alex3236/github-hosts/master/hosts`,
    ...entries.map(({ ip, domain }) => `${ip} ${domain}`),
    "#Github Hosts End",
    "",
  ];
  const hostsContent = hostsLines.join("\n");

  // Write hosts file
  const hostsPath = path.join(ROOT, "hosts");
  await fs.writeFile(hostsPath, hostsContent, "utf-8");
  console.log(`\nWrote ${hostsPath}`);

  // Update README.md
  const readmePath = path.join(ROOT, "README.md");
  let readme = await fs.readFile(readmePath, "utf-8");

  // Replace the fenced code block between the 2.1 heading and the timestamp line
  readme = readme.replace(
    /(### 2\.1 复制下面的内容\n```bash\n)[\s\S]*?(```\n最后更新时间：`)[^\n]*/,
    `$1${hostsContent}$2${updateTime}\``
  );

  await fs.writeFile(readmePath, readme, "utf-8");
  console.log(`Updated ${readmePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
