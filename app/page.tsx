import { parseHosts } from "@/lib/hosts";
import {
  buildDeployCommands,
  RAW_URL,
  REPO_URL,
  resolveBaseUrlByHost,
  UNIX_SCRIPT_URL,
  WINDOWS_SCRIPT_URL,
} from "@/lib/site-config";
import { headers } from "next/headers";
import CopyButton from "./copy-hosts-button";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function Home() {
  const requestHeaders = await headers();
  const requestHost = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";
  const baseUrl = resolveBaseUrlByHost(requestHost);
  const { windowsOneLiner, unixOneLiner } = buildDeployCommands(baseUrl);
  const { raw, updateTime, entries } = await parseHosts(requestHost);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>🚀 GitHub Hosts</h1>
          <p className={styles.subtitle}>
            通过修改 Hosts 解决部分地区 GitHub 访问问题
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
          <details className={styles.usageDetails} open>
            <summary className={styles.usageSummary}>🧠 原理</summary>
            <div className={styles.usageContent}>
              <p className={styles.principleText}>
                部分网络环境会对 GitHub 域名的 DNS 查询结果进行污染，导致域名被解析到错误 IP，出现无法访问或连接异常。本项目通过提供可用的 Hosts 映射，从而恢复对 GitHub 相关服务的访问。
              </p>
              <p className={styles.principleText}>
                需要注意的是，Hosts 只能解决 DNS 污染问题，如果网络环境还存在其他类型的干扰（例如 IP 屏蔽、流量劫持等），可能仍然无法访问。
              </p>
              <p className={styles.principleText}>
                若你担心安全问题，可以在 Github 检查本项目的源代码。
              </p>
            </div>
          </details>
        </section>

        <section className={styles.section}>
          <details className={styles.usageDetails} open>
            <summary className={styles.usageSummary}>⚡ 一键部署</summary>
            <div className={styles.usageContent}>
              <p className={styles.principleText}>
                在终端执行如下命令，即可自动完成下载、备份、写入和 DNS 刷新。
              </p>
              <div className={styles.deployBox}>
                <div className={styles.commandTitleRow}>
                  <p className={styles.deployTitle}>Windows PowerShell</p>
                  <CopyButton
                    text={windowsOneLiner}
                    ariaLabel="复制 Windows 一键命令"
                    className={styles.commandCopyBtn}
                  />
                </div>
                <pre className={styles.commandBox}>
                  <code>{windowsOneLiner}</code>
                </pre>
                <div className={styles.commandTitleRow}>
                  <p className={styles.deployTitle}>Linux / macOS</p>
                  <CopyButton
                    text={unixOneLiner}
                    ariaLabel="复制 Linux / macOS 一键命令"
                    className={styles.commandCopyBtn}
                  />
                </div>
                <pre className={styles.commandBox}>
                  <code>{unixOneLiner}</code>
                </pre>
                <p className={styles.deployHint}>
                  直接下载脚本：
                  <a href={WINDOWS_SCRIPT_URL} target="_blank" rel="noopener noreferrer">
                    Windows
                  </a>
                  <span> · </span>
                  <a href={UNIX_SCRIPT_URL} target="_blank" rel="noopener noreferrer">
                    Linux / macOS
                  </a>
                </p>
              </div>
            </div>
          </details>
        </section>

        <section className={styles.section}>
          <details className={styles.usageDetails}>
            <summary className={styles.usageSummary}>📋 手动应用</summary>
            <div className={styles.usageContent}>
              <section className={styles.platformSection}>
                <h3 className={styles.platformTitle}>Windows</h3>
                <ol className={styles.steps}>
                  <li>
                    复制下方 Hosts 内容，或访问{" "}
                    <a href={RAW_URL} target="_blank" rel="noopener noreferrer">
                      原始文本
                    </a>
                    。
                  </li>
                  <li>
                    以管理员身份编辑 <code>C:\Windows\System32\drivers\etc\hosts</code>，粘贴并保存。
                  </li>
                  <li>
                    执行 <code>ipconfig /flushdns</code> 后重试访问。
                  </li>
                </ol>
              </section>

              <section className={styles.platformSection}>
                <h3 className={styles.platformTitle}>Linux / Mac</h3>
                <ol className={styles.steps}>
                  <li>
                    复制下方 Hosts 内容，或访问{" "}
                    <a href={RAW_URL} target="_blank" rel="noopener noreferrer">
                      原始文本
                    </a>
                    。
                  </li>
                  <li>
                    使用 <code>sudo</code> 编辑 <code>/etc/hosts</code>，粘贴并保存。
                  </li>
                  <li>
                    Mac 可执行 <code>sudo killall -HUP mDNSResponder</code>，Linux 按发行版刷新 DNS 缓存。
                  </li>
                </ol>
              </section>

              <section className={styles.platformSection}>
                <h3 className={styles.platformTitle}>移动设备</h3>
                <ol className={styles.steps}>
                  <li>
                    <strong>Android 已 Root 设备：</strong>可使用 Hosts 模块工具（例如{" "}
                    <a
                      href="https://github.com/bindhosts/bindhosts"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Bindhosts
                    </a>
                    ）订阅本项目 Hosts{" "}
                    <a href={RAW_URL} target="_blank" rel="noopener noreferrer">
                      原始文本
                    </a>。
                  </li>
                  <li>
                    <strong>未 Root 设备或 iOS 设备：</strong>使用具备自定义 DNS 规则能力的代理软件，并在规则中处理相关域名解析。
                  </li>
                </ol>
              </section>
            </div>
          </details>
        </section>

        <section className={styles.section}>
          <details className={styles.usageDetails}>
            <summary className={styles.usageSummary}>
              <span>📄 Hosts</span>
              <CopyButton
                text={raw}
                ariaLabel="复制 Hosts 内容"
                preventParentToggle
              />
            </summary>
            <div className={styles.usageContent}>
              <div className={styles.hostsBlock}>
                <pre className={styles.hostsPre}>{raw.trimEnd()}</pre>
              </div>
            </div>
          </details>
        </section>
      </div>
    </main>
  );
}
