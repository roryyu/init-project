# Init Project

基于 Nuxt 4 + Vue 3 + Element Plus + Prisma + PostgreSQL 的全栈认证应用框架。

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Nuxt (Vue 3 + Vite) | ^4.4.8 |
| UI 组件库 | Element Plus | ^2.14.2 |
| ORM | Prisma | ^7.8.0 |
| 数据库 | PostgreSQL | - |
| 认证 | @sidebase/nuxt-auth (JWT) | ^1.3.0 |
| 请求校验 | Zod | ^4.4.3 |

## Code Wiki

### 项目结构

```
init-project/
├── app/                          # 前端应用
│   ├── layouts/
│   │   └── default.vue           # 默认布局（导航栏、退出登录按钮）
│   ├── middleware/
│   │   └── auth.ts               # 路由守卫，未登录自动跳转 /login
│   ├── pages/
│   │   ├── index.vue             # 首页，需登录后访问，展示用户信息
│   │   ├── login.vue             # 登录页
│   │   ├── register.vue          # 注册页
│   │   ├── forgot-password.vue   # 忘记密码，输入邮箱申请重置
│   │   └── reset-password.vue    # 重置密码，通过 token 设置新密码
│   └── app.vue                   # 根组件
├── server/                       # 后端 API
│   ├── api/auth/
│   │   ├── register.post.ts      # POST /api/auth/register  用户注册
│   │   ├── login.post.ts         # POST /api/auth/login     用户登录
│   │   ├── me.get.ts             # GET  /api/auth/me        获取当前用户
│   │   ├── logout.post.ts        # POST /api/auth/logout    退出登录
│   │   ├── forgot-password.post.ts  # POST /api/auth/forgot-password  发送重置令牌
│   │   └── reset-password.post.ts   # POST /api/auth/reset-password   重置密码
│   └── utils/
│       ├── prisma.ts             # Prisma 客户端单例（防止开发环境热重载创建多实例）
│       └── auth.ts               # JWT 签发/验证 + bcrypt 密码哈希工具函数
├── prisma/
│   ├── schema.prisma             # 数据模型定义
│   └── migrations/               # 数据库迁移文件（执行 migrate 后生成）
├── prisma.config.ts              # Prisma 7 数据源配置
├── nuxt.config.ts                # Nuxt 配置（模块注册、认证策略）
├── .env                          # 环境变量（不提交到 Git）
└── package.json
```

### 数据模型

**User 表**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| email | String | 唯一，用于登录 |
| phone | String? | 唯一，可选手机号 |
| password | String | bcrypt 哈希后的密码 |
| name | String? | 可选姓名 |
| role | String | 用户角色，默认为 "USER" |
| tenantId | String? | 可选租户ID |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

**PasswordReset 表**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| email | String | 关联用户邮箱 |
| token | String | 唯一，32 字节随机 hex |
| expiresAt | DateTime | 过期时间（1小时） |
| used | Boolean | 是否已使用 |
| createdAt | DateTime | 创建时间 |

### 认证流程

```
注册: 前端 -> POST /api/auth/register -> bcrypt 加密密码 -> 写入 User 表 -> 返回 JWT
登录: 前端 -> POST /api/auth/login -> bcrypt 验证密码 -> 返回 JWT
鉴权: 前端请求头带 Bearer <token> -> GET /api/auth/me -> 验证 JWT -> 返回用户信息
重置密码:
  1. POST /api/auth/forgot-password -> 生成 token 存入 PasswordReset 表
  2. 用户通过邮件中的链接访问 /reset-password?token=xxx
  3. POST /api/auth/reset-password -> 验证 token -> 更新密码 -> 标记 token 已使用
```

JWT 有效期为 24 小时，token 通过 `Authorization: Bearer <token>` 请求头传递。

### API 接口

| 方法 | 路径 | 说明 | 请求体 |
|------|------|------|--------|
| POST | `/api/auth/register` | 注册 | `{ email, password, name?, phone?, tenantId? }` |
| POST | `/api/auth/login` | 登录 | `{ email, password }` |
| GET | `/api/auth/me` | 获取当前用户 | - |
| POST | `/api/auth/logout` | 退出登录 | - |
| POST | `/api/auth/forgot-password` | 申请密码重置 | `{ email }` |
| POST | `/api/auth/reset-password` | 执行密码重置 | `{ token, password }` |

所有接口使用 Zod 进行请求体校验，校验失败返回 400。

---

## 安装手册

### 环境要求

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

### 1. 克隆项目

```bash
git clone git@github.com:roryyu/init-project.git
cd init-project
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制并编辑 `.env` 文件：

```bash
cp .env.example .env
```

修改以下内容：

```env
# PostgreSQL 连接字符串，按实际情况修改用户名、密码、数据库名
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/init_project?schema=public"

# 应用访问地址
AUTH_ORIGIN="http://localhost:3000"

# JWT 密钥，生产环境请替换为随机字符串
AUTH_SECRET="your-secret-key-change-this-in-production"
```

### 4. 创建数据库

确保 PostgreSQL 服务运行中，然后手动创建数据库：

```bash
psql -U postgres -c "CREATE DATABASE init_project;"
```

### 5. 执行数据库迁移

```bash
npx prisma migrate dev --name init
```

首次执行会自动创建 `User` 和 `PasswordReset` 表。后续修改模型时运行：

```bash
npx prisma migrate dev --name <migration_name>
```

### 6. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 即可使用。

### 常用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
npx prisma studio    # 打开数据库可视化管理界面
npx prisma migrate dev   # 执行新的数据库迁移
npx prisma generate      # 重新生成 Prisma Client
```

### 生产部署

```bash
npm run build
node .output/server/index.mjs
```

生产环境请务必修改 `.env` 中的 `AUTH_SECRET` 为强随机字符串，并使用真实的 PostgreSQL 连接地址。
