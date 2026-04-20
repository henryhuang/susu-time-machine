# 酥酥时光机

一个用于记录和展示酥酥成长故事的内容管理型网站。首版采用 Next.js App Router 一体化实现，包含前台展示、后台控制台、管理员登录、SQLite 数据存储、Prisma ORM 和腾讯云 COS 图片上传。

## 技术方案说明

- 前端与后端：Next.js + TypeScript + App Router
- 样式：Tailwind CSS，视觉沿用原型里的桃粉、浅蓝、浅绿、白色卡片和 8px 圆角
- 数据库：SQLite
- ORM：Prisma
- 鉴权：单管理员账号，bcrypt 密码哈希，HTTP Only JWT Cookie
- 图片：后台经服务端接口上传到腾讯云 COS，前端不暴露 SecretId / SecretKey
- 部署：支持普通 Linux 服务器和 Docker

## 项目目录结构

```text
.
├─ prisma/
│  └─ schema.prisma
├─ public/
├─ scripts/
│  └─ seed-admin.ts
├─ src/
│  ├─ app/
│  │  ├─ (site)/
│  │  │  ├─ page.tsx
│  │  │  └─ stories/
│  │  ├─ admin/
│  │  │  ├─ login/
│  │  │  ├─ page.tsx
│  │  │  └─ stories/
│  │  └─ api/
│  │     ├─ auth/
│  │     ├─ public/
│  │     ├─ admin/
│  │     └─ upload/
│  ├─ components/
│  │  ├─ admin/
│  │  ├─ site/
│  │  └─ ui/
│  ├─ lib/
│  ├─ server/
│  └─ types/
├─ .env.example
├─ Dockerfile
├─ package.json
└─ README.md
```

## Prisma 数据模型设计

核心模型位于 `prisma/schema.prisma`：

```prisma
model Admin {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Story {
  id          String       @id @default(cuid())
  title       String
  summary     String
  content     String
  coverImage  String?
  storyDate   DateTime
  tags        String       @default("[]")
  images      StoryImage[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model StoryImage {
  id        String   @id @default(cuid())
  storyId   String
  imageUrl  String
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  story     Story    @relation(fields: [storyId], references: [id], onDelete: Cascade)
}
```

`tags` 首版用 JSON 字符串保存，降低复杂度；后续如果需要标签页、统计和批量管理，可迁移为独立 Tag 表。

## 前台页面实现代码

- 首页：`src/app/(site)/page.tsx`
- 时间轴列表：`src/app/(site)/stories/page.tsx`
- 故事详情：`src/app/(site)/stories/[id]/page.tsx`
- 前台布局：`src/app/(site)/layout.tsx`
- 404：`src/app/not-found.tsx`
- 加载态：`src/app/(site)/loading.tsx`
- 故事卡片：`src/components/site/story-card.tsx`
- 图片预览：`src/components/site/image-preview.tsx`

## 后台控制台实现代码

- 登录页：`src/app/admin/login/page.tsx`
- 仪表盘：`src/app/admin/page.tsx`
- 故事列表：`src/app/admin/stories/page.tsx`
- 新增故事：`src/app/admin/stories/new/page.tsx`
- 编辑故事：`src/app/admin/stories/[id]/edit/page.tsx`
- 后台框架：`src/components/admin/admin-shell.tsx`
- 故事表单：`src/components/admin/story-form.tsx`
- 上传组件：`src/components/admin/upload-widget.tsx`
- 删除确认：`src/components/admin/delete-story-button.tsx`

## 登录鉴权实现代码

- 会话逻辑：`src/server/auth.ts`
- 登录接口：`src/app/api/auth/login/route.ts`
- 登出接口：`src/app/api/auth/logout/route.ts`
- 当前管理员：`src/app/api/auth/me/route.ts`
- 后台页面保护：`src/components/admin/protected-admin.tsx`

鉴权使用 HTTP Only Cookie，Cookie 内是由 `AUTH_SECRET` 签名的 JWT。后台页面和管理接口都会校验登录状态。

## 图片上传实现代码

- COS 客户端与路径生成：`src/server/cos.ts`
- 上传接口：`src/app/api/upload/image/route.ts`
- 后台上传 UI：`src/components/admin/upload-widget.tsx`

上传路径格式示例：

```text
susu/stories/2026/04/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.jpg
```

前端只把图片文件提交给 `/api/upload/image`，由服务端读取 COS 配置并上传。

## API 接口实现代码

认证：

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

公开接口：

- `GET /api/public/stories?page=1&pageSize=10`
- `GET /api/public/stories/:id`

后台管理接口：

- `GET /api/admin/stories`
- `POST /api/admin/stories`
- `GET /api/admin/stories/:id`
- `PUT /api/admin/stories/:id`
- `DELETE /api/admin/stories/:id`

上传：

- `POST /api/upload/image`

## 公共组件与工具函数

- 按钮：`src/components/ui/button.tsx`
- 输入框：`src/components/ui/field.tsx`
- 标签：`src/components/ui/tag.tsx`
- 日期格式化：`src/lib/dates.ts`
- 图片兜底：`src/lib/images.ts`
- 标签解析：`src/lib/tags.ts`
- 表单校验：`src/lib/validators.ts`
- Story 服务层：`src/server/stories.ts`

## .env.example

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

关键配置：

```env
DATABASE_URL="file:./dev.db"
APP_URL="http://localhost:3000"
AUTH_SECRET="replace-with-at-least-32-random-characters"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="change-me-before-deploy"

TENCENT_COS_SECRET_ID=""
TENCENT_COS_SECRET_KEY=""
TENCENT_COS_BUCKET=""
TENCENT_COS_REGION="ap-shanghai"
TENCENT_COS_PUBLIC_BASE_URL=""
TENCENT_COS_UPLOAD_PREFIX="susu/stories"
```

COS 说明：

- `TENCENT_COS_SECRET_ID` 和 `TENCENT_COS_SECRET_KEY` 只配置在服务端
- `TENCENT_COS_BUCKET` 示例：`my-bucket-1250000000`
- `TENCENT_COS_REGION` 示例：`ap-shanghai`
- 如果绑定了 CDN 或自定义域名，把 `TENCENT_COS_PUBLIC_BASE_URL` 设置为公开访问域名
- 如果不设置公开域名，系统会使用 `https://{Bucket}.cos.{Region}.myqcloud.com/{key}`

## 本地运行

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run seed
npm run dev
```

打开：

- 前台：http://localhost:3000
- 后台：http://localhost:3000/admin

## Docker 部署示例

推荐使用 Docker Compose。先准备环境变量：

```bash
cp .env.example .env
mkdir -p ./data
```

生产环境可以使用仓库里的 `.env.prod` 模板：

```bash
cp .env.prod .env
```

复制后请先替换 `AUTH_SECRET`、`ADMIN_PASSWORD` 和腾讯云 COS 配置。`.env.prod` 已加入 `.gitignore`，不要提交真实生产密钥。

Compose 默认把容器端数据库放在 `/app/data/app.db`，宿主机持久化目录是 `./data`。如果你想改容器内数据库路径，可以在 `.env` 里设置：

```env
DOCKER_DATABASE_URL="file:/app/data/app.db"
APP_PORT=5174
```

启动服务：

```bash
docker compose up -d --build app
```

首次部署或更新 schema 时，执行迁移：

```bash
docker compose --profile tools run --rm migrate
```

初始化或重置管理员密码：

```bash
docker compose --profile tools run --rm admin-cli
```

查看日志：

```bash
docker compose logs -f app
```

## Nginx 反向代理

已提供一份宿主机 Nginx 配置：

```text
nginx/susu-time-machine.conf
```

默认反代到 Docker Compose 暴露的本机端口：

```text
127.0.0.1:5174
```

使用步骤：

```bash
sudo cp nginx/susu-time-machine.conf /etc/nginx/conf.d/susu-time-machine.conf
sudo nginx -t
sudo systemctl reload nginx
```

上线前需要替换配置里的：

```text
your-domain.com
www.your-domain.com
```

这份配置只启用 HTTP，不包含 HTTPS 跳转和证书配置。如果后续要启用 HTTPS，再增加 `443 ssl` server 即可。

也可以只用 Docker 命令手动运行：

```bash
docker build -t susu-time-machine .
docker run -d \
  --name susu-time-machine \
  --env-file .env \
  -e DATABASE_URL="file:/app/data/app.db" \
  -p 5174:3000 \
  -v "$PWD/data:/app/data" \
  susu-time-machine
```

## GitHub Actions 部署

已提供三个 workflow：

- `.github/workflows/ci.yml`：PR 和分支 push 时执行 Prisma 校验、Prisma Client 生成和 Next 构建
- `.github/workflows/cd.yml`：push 到 `main` / `dev` 或手动触发时，构建镜像并部署
- `.github/workflows/deploy-only.yml`：不重新构建，只部署已有镜像标签

部署流程针对国内服务器做了优化：GitHub Actions 会把 Docker 镜像保存成 `susu-time-machine-image.tar.gz`，通过 SSH/SCP 上传到服务器，然后在服务器执行 `docker load`。服务器不再直接 `docker pull ghcr.io/...`，避免阿里云访问 GHCR 过慢或超时。

需要在 GitHub 仓库的 `Settings -> Secrets and variables -> Actions` 里配置：

```text
REMOTE_HOST
REMOTE_USER
SSH_PRIVATE_KEY
APP_ENV_FILE
```

`APP_ENV_FILE` 是服务器上的 `.env` 完整内容，示例：

```env
DATABASE_URL="file:./dev.db"
APP_URL="https://your-domain.com"
APP_PORT=5174
DOCKER_DATABASE_URL="file:/app/data/app.db"
AUTH_SECRET="replace-with-at-least-32-random-characters"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-strong-password"

TENCENT_COS_SECRET_ID="xxx"
TENCENT_COS_SECRET_KEY="xxx"
TENCENT_COS_BUCKET="xxx"
TENCENT_COS_REGION="ap-shanghai"
TENCENT_COS_PUBLIC_BASE_URL="https://susu-img-wx.cnhalo.com"
TENCENT_COS_UPLOAD_PREFIX="mini-app/user-susu"
```

部署目录默认是：

```text
/app/susu-time-machine
```

镜像默认推送到：

```text
ghcr.io/<github-owner>/susu-time-machine
```

`deploy-only.yml` 仍然支持选择已有镜像标签，但拉取 GHCR 的动作发生在 GitHub runner 上，不发生在阿里云服务器上。

## 初始化管理员的方法

首版使用 Prisma seed 脚本初始化或更新单管理员：

```bash
ADMIN_USERNAME=admin ADMIN_PASSWORD='your-strong-password' npm run seed
```

脚本会执行 upsert：

- 管理员不存在时创建
- 管理员已存在时更新密码哈希

服务器部署后同样可以运行同一条命令。请务必把 `.env` 中的 `ADMIN_PASSWORD` 改成强密码。

## 后续第二阶段优化建议

1. 增加 COS 临时密钥直传，保留服务端签发权限，减少服务器带宽压力。
2. 引入轻量富文本，例如 Markdown 编辑与安全渲染。
3. 标签独立建表，支持标签页、聚合统计和批量维护。
4. 增加故事草稿、发布状态和预览链接。
5. 增加图片压缩、缩略图和 EXIF 日期读取。
6. 增加 Playwright 端到端测试，覆盖登录、增删改和前台展示。
7. 数据库迁移到 PostgreSQL，适配更长期的数据增长。
