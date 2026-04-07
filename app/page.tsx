import { parseHosts } from "@/lib/hosts";
import styles from "./page.module.css";

const RAW_URL = "/api/hosts";
const REPO_URL = "https://github.com/alex3236/github-hosts";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { raw, updateTime, entries } = await parseHosts();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>🚀 GitHub Hosts</h1>
          <p className={styles.subtitle}>
            通过修改 Hosts 解决国内 GitHub 访问问题
          </p>
          <div className={styles.meta}>
            <span>最后更新：{updateTime || "未知"}</span>
            <span>·</span>
            <span>{entries.length} 条记录</span>
          </div>
        </header>

        <section className={styles.links}>
          <a
            href={RAW_URL}
            className={`${styles.linkBtn} ${styles.linkBtnRaw}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            📄 原始文本
          </a>
          <a
            href={REPO_URL}
            className={`${styles.linkBtn} ${styles.linkBtnGithub}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            ⭐ GitHub
          </a>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📋 使用方法</h2>
          <ol className={styles.steps}>
            <li>
              复制下方 Hosts 内容，或直接访问{" "}
              <a href={RAW_URL} target="_blank" rel="noopener noreferrer">
                原始文本
              </a>{" "}
              获取原始文件。
            </li>
            <li>
              打开 Hosts 文件：
              <ul>
                <li>
                  Windows：<code>C:\Windows\System32\drivers\etc\hosts</code>
                </li>
                <li>
                  Mac / Linux：<code>/etc/hosts</code>
                </li>
              </ul>
            </li>
            <li>将内容追加到文件末尾并保存。</li>
            <li>
              刷新 DNS：
              <ul>
                <li>
                  Windows：<code>ipconfig /flushdns</code>
                </li>
                <li>
                  Mac：<code>sudo killall -HUP mDNSResponder</code>
                </li>
                <li>
                  Linux：<code>sudo nscd restart</code>
                </li>
              </ul>
            </li>
          </ol>
        </section>

        <section className={styles.section}>
          <div className={styles.hostsHeader}>
            <h2 className={styles.sectionTitle}>📄 Hosts 内容</h2>
            <span className={styles.rawLink}>
              Raw URL:{" "}
              <a href={RAW_URL} target="_blank" rel="noopener noreferrer">
                {RAW_URL}
              </a>
            </span>
          </div>
          <div className={styles.hostsBlock}>
            <pre className={styles.hostsPre}>{raw.trimEnd()}</pre>
          </div>
        </section>
      </div>
    </main>
  );
}
