# 服务器部署说明

## 部署包生成

在项目根目录执行：

```bash
npm run package:deploy
```

生成结果：

- `release/ai-diviner-deploy/`：可直接上传到服务器的部署目录
- `release/ai-diviner-deploy.zip`：Windows 本机自动生成的压缩包

## 部署包内容

- `dist/`：前端生产资源
- `server/`：Express 服务端
- `image/`：塔罗牌图片资源
- `.env.example`：环境变量模板
- `deploy/deploy.sh`：Linux/macOS 一键部署脚本
- `deploy/deploy.ps1`：Windows Server 一键部署脚本

## Linux 服务器一键部署

1. 将 `release/ai-diviner-deploy.zip` 或 `release/ai-diviner-deploy/` 上传到服务器
2. 解压后进入部署目录
3. 首次执行前，按需修改 `.env`
4. 执行：

```bash
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

脚本会自动：

- 检查 `.env`
- 安装生产依赖
- 停止旧进程
- 后台启动应用并写入 `logs/app.log`

如果你希望服务器重启后自动拉起应用，推荐继续配置 `systemd`：

```bash
chmod +x deploy/install-systemd.sh
sudo ./deploy/install-systemd.sh /opt/ai-diviner
```

说明：

- `/opt/ai-diviner` 替换为你的实际部署目录
- 脚本会把 `deploy/systemd/ai-diviner.service` 安装到 `/etc/systemd/system/`
- 会自动执行 `systemctl daemon-reload`、`enable` 和 `restart`

## Windows Server 一键部署

1. 将部署包上传并解压
2. 进入部署目录
3. 首次执行前，按需修改 `.env`
4. 在 PowerShell 执行：

```powershell
./deploy/deploy.ps1
```

## Nginx 反向代理

如果希望使用 80/443 端口对外提供访问，建议让 Node 仅监听本机端口，再由 Nginx 转发。

模板文件：`deploy/nginx/ai-diviner.conf`

典型流程：

1. 将模板复制到 `/etc/nginx/conf.d/ai-diviner.conf` 或站点目录
2. 将其中的 `server_name` 改成你的域名或服务器 IP
3. 执行 `sudo nginx -t`
4. 执行 `sudo systemctl reload nginx`

启用后可通过 `http://你的域名` 访问，由 Nginx 转发到 `127.0.0.1:8787`

## systemd 开机自启

模板文件：`deploy/systemd/ai-diviner.service`

核心配置：

- `WorkingDirectory`：应用解压后的目录
- `EnvironmentFile`：部署目录中的 `.env`
- `ExecStart`：使用 Node 直接启动 `server/index.js`
- `Restart=always`：进程退出后自动重启

查看状态与日志：

```bash
sudo systemctl status ai-diviner
sudo journalctl -u ai-diviner -f
```

## 环境变量

至少需要配置：

```env
OPENAI_API_KEY=你的密钥
OPENAI_MODEL=gpt-4.1-mini
OPENAI_BASE_URL=https://api.openai.com/v1
PORT=8787
VITE_ONLY_MAJOR_ARCANA=false
```

## 访问方式

部署完成后，前端页面和 API 都由同一个 Node 服务提供：

- 页面：`http://服务器IP:8787`
- 健康检查：`http://服务器IP:8787/api/health`

如果配置了 Nginx，则通常对外访问：

- 页面：`http://你的域名`
- 健康检查：`http://你的域名/api/health`

## 前置条件

- Node.js 18+
- npm 可用
- 服务器开放应用端口（默认 `8787`）

## 卸载应用

部署包中包含卸载脚本，用于完全清理部署的应用和系统配置。

### Linux 卸载

```bash
sudo ./deploy/uninstall.sh
```

脚本会自动：

- 停止 systemd 服务
- 禁用服务开机自启
- 删除 systemd 服务文件
- 询问是否删除 Nginx 配置
- 重载 systemd

应用目录需手动删除：

```bash
sudo rm -rf /path/to/ai-diviner
```

### Windows 卸载

```powershell
./deploy/uninstall.ps1
```

脚本会自动：

- 停止应用进程
- 删除日志目录
- 清理 npm 依赖

应用目录需手动删除。

### 清理 Nginx 配置

如果使用了 Nginx 反向代理但上面的卸载脚本未删除配置，可手动清理：

```bash
sudo rm -f /etc/nginx/conf.d/ai-diviner.conf
sudo nginx -t && sudo systemctl reload nginx
```