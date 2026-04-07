# GitHub-Hosts

通过修改Hosts解决国内Github经常抽风访问不到

## 一键应用

### Windows

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "iwr https://gh-hosts.dogespace.cn/api/scripts/windows -UseBasicParsing | iex"
```

### Linux / macOS

```bash
curl -fsSL https://gh-hosts.dogespace.cn/api/scripts/unix | bash
```
