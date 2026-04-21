# 给小程序 Codex 的接入任务说明

请在微信小程序项目中接入「酥酥时光机」后端 API，实现微信登录换 openId、访问权限检查、故事列表和故事详情。

## 目标

小程序进入时先获取微信登录 code，用后端公开接口换取 openId，然后检查一次当前微信用户是否有访问权限：

- 有权限：进入故事列表 / 时间轴。
- 无权限：展示无权限页面，不请求故事数据。

故事数据来自后端公开 API，小程序不要调用后台管理接口，不要保存后台管理员账号密码。

## 服务地址

生产环境 Base URL：

```ts
const API_BASE_URL = "http://susu-time-machine.cnhalo.com";
```

如果后续服务切到 HTTPS，只需要改成：

```ts
const API_BASE_URL = "https://susu-time-machine.cnhalo.com";
```

## 必须接入的接口

### 1. 微信登录换 openId

```http
POST /api/public/wechat/login
Content-Type: application/json
```

请求 body：

```ts
type WechatLoginRequest = {
  code: string;
};
```

响应：

```ts
type WechatLoginResponse = {
  openId: string;
  unionId: string | null;
};
```

小程序端调用顺序：

```text
wx.login()
  -> 拿到 code
  -> POST /api/public/wechat/login
  -> 拿到 openId
  -> POST /api/public/access/check
```

注意：

- 不要在小程序端调用微信 `jscode2session`。
- 不要在小程序端保存或暴露 AppSecret。
- 后端不会把 `session_key` 返回给小程序。

### 2. 检查访问权限

```http
POST /api/public/access/check
Content-Type: application/json
```

请求 body：

```ts
type AccessCheckRequest = {
  openId?: string;
  unionId?: string;
  nickname?: string;
  avatarUrl?: string;
  phone?: string;
};
```

`openId` 和 `unionId` 至少传一个。当前优先使用 `openId`。

响应：

```ts
type AccessCheckResponse = {
  allowed: boolean;
  permissions: string[];
  user: {
    id: string;
    openId: string | null;
    unionId: string | null;
    nickname: string | null;
    avatarUrl: string | null;
    phone: string | null;
    remark: string | null;
    allowed: boolean;
    source: string;
    lastCheckedAt: string | null;
    lastAllowedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
};
```

规则：

- `allowed === true`：允许进入故事页面。
- `allowed === false`：展示无权限页面，例如“暂未开通访问，请联系管理员”。
- 如果用户第一次访问，服务端会自动创建一条待审核记录，管理员会在后台开启权限。

### 3. 获取故事列表

```http
GET /api/public/stories?page=1&pageSize=10
```

响应：

```ts
type StoryImage = {
  id?: string;
  imageUrl: string;
  sortOrder: number;
  createdAt?: string;
};

type Story = {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string | null;
  storyDate: string;
  tags: string[];
  images: StoryImage[];
  createdAt: string;
  updatedAt: string;
};

type StoryListResponse = {
  items: Story[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};
```

分页规则：

- 首次加载：`page=1&pageSize=10`
- 下拉刷新：重置为第一页
- 上拉加载更多：只有 `hasMore === true` 时请求下一页

### 4. 获取故事详情

```http
GET /api/public/stories/:id
```

响应：

```ts
type StoryDetailResponse = {
  story: Story;
};
```

详情页从列表项拿 `id`，跳转时传入详情页参数。

## 建议文件结构

请优先贴合小程序项目现有结构。如果没有现成封装，可以新增类似文件：

```text
utils/request.ts
services/api.ts
services/access.ts
services/stories.ts
pages/index/index
pages/story-detail/index
pages/no-access/index
```

如果项目已经有 `api`、`request`、`store`、`pages` 等目录，请沿用已有命名。

## 请求封装示例

```ts
const API_BASE_URL = "http://susu-time-machine.cnhalo.com";

type RequestOptions = {
  url: string;
  method?: "GET" | "POST";
  data?: Record<string, unknown>;
};

export function request<T>({ url, method = "GET", data }: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}${url}`,
      method,
      data,
      timeout: 10000,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T);
          return;
        }

        reject(new Error(`请求失败：${res.statusCode}`));
      },
      fail: reject
    });
  });
}
```

API 方法示例：

```ts
export function loginWechat(code: string) {
  return request<WechatLoginResponse>({
    url: "/api/public/wechat/login",
    method: "POST",
    data: { code }
  });
}

export function checkAccess(profile: AccessCheckRequest) {
  return request<AccessCheckResponse>({
    url: "/api/public/access/check",
    method: "POST",
    data: profile
  });
}

export function fetchStories(page = 1, pageSize = 10) {
  return request<StoryListResponse>({
    url: `/api/public/stories?page=${page}&pageSize=${pageSize}`
  });
}

export function fetchStoryDetail(id: string) {
  return request<StoryDetailResponse>({
    url: `/api/public/stories/${id}`
  });
}
```

## 获取 openId

小程序端先调用 `wx.login()` 获取 `code`，再调用后端接口换取 openId：

```ts
export function wxLoginCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (res.code) {
          resolve(res.code);
          return;
        }
        reject(new Error("wx.login 未返回 code"));
      },
      fail: reject
    });
  });
}
```

组合方法示例：

```ts
async function getCurrentOpenId() {
  const code = await wxLoginCode();
  const result = await loginWechat(code);
  return result.openId;
}
```

拿到 openId 后再传给权限检查：

```ts
checkAccess({ openId });
```

实现页面流程时，不要把故事接口和 openId 获取逻辑写死在页面里，尽量放到 service 层。

## 首页流程

小程序入口页建议流程：

```text
小程序进入
  -> wx.login 获取 code
  -> POST /api/public/wechat/login 换 openId
  -> 调用 POST /api/public/access/check
  -> allowed=false：跳转或展示 no-access 状态
  -> allowed=true：请求故事列表第一页
```

伪代码：

```ts
async function bootstrap() {
  try {
    setData({ loading: true });
    const openId = await getCurrentOpenId();
    const access = await checkAccess({ openId });

    if (!access.allowed) {
      setData({ loading: false, noAccess: true });
      return;
    }

    await loadStories({ reset: true });
  } catch (error) {
    setData({ loading: false, error: "加载失败，请稍后再试" });
  }
}
```

权限判断只需要在进入小程序时执行一次。进入后浏览故事列表、详情、分页、刷新等普通操作不需要重复调用权限检查接口。

## 列表页要求

列表页展示字段：

- `coverImage`
- `title`
- `summary`
- `storyDate`
- `tags`

交互：

- 支持下拉刷新
- 支持上拉加载更多
- 点击故事卡片进入详情页
- `coverImage` 为空或加载失败时使用本地默认图

日期格式建议：

```ts
export function formatStoryDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${Number(year)}年${Number(month)}月${Number(day)}日`;
}
```

## 详情页要求

详情页通过路由参数读取故事 `id`，调用：

```ts
fetchStoryDetail(id);
```

展示字段：

- `title`
- `storyDate`
- `tags`
- `coverImage`
- `content`
- `images`

正文处理：

- `content` 是普通多行文本，不是 HTML。
- 可以按 `\n` 分段渲染。

图片处理：

- `images` 按 `sortOrder` 升序展示。
- 点击图片时调用 `wx.previewImage`。
- 图片 URL 是完整地址，不要拼接 Base URL。

## 无权限页要求

当 `allowed === false` 时展示无权限状态：

```text
暂未开通访问，请联系管理员
```

可以展示当前用户标识，方便用户发给管理员：

```text
用户标识：openId 后 6 位
```

不要展示完整敏感信息到明显位置；如果需要调试，可以只在开发环境打印完整 openId。

## 错误和空状态

建议文案：

```text
无权限：暂未开通访问，请联系管理员
列表为空：还没有故事
网络失败：故事加载失败，请稍后再试
详情 404：这条故事不存在或已经被删除
```

## 微信后台域名配置

需要配置合法域名：

```text
request 合法域名：
http://susu-time-machine.cnhalo.com

downloadFile 合法域名 / 图片域名：
https://susu-img-wx.cnhalo.com
```

如果微信后台不允许 HTTP request 域名，生产服务需要改成 HTTPS，并同步修改 `API_BASE_URL`。

## 禁止事项

- 不要调用 `/api/admin/*`
- 不要调用 `/api/auth/*`
- 不要调用 `/api/upload/*`
- 不要在小程序里保存后台管理员账号密码
- 不要在小程序里保存或暴露微信 AppSecret
- 不要把真实 openId 写死在代码里
- 不要把图片 URL 再拼接 Base URL

## 验收清单

- 首次进入小程序会先检查访问权限。
- 首次进入小程序会通过 `wx.login` 和 `/api/public/wechat/login` 换取 openId。
- 小程序内浏览列表、详情、分页、刷新时不会重复检查权限。
- 未授权用户不会请求故事列表。
- 未授权用户会看到清晰的无权限页面。
- 授权用户能看到故事列表。
- 列表支持下拉刷新和上拉加载更多。
- 点击列表项能进入详情页。
- 详情页能展示正文和多张图片。
- 图片点击后能预览。
- `coverImage` 为空或图片失败时有默认图兜底。
- 所有请求失败都有用户可理解的提示。

## 可直接交给 Codex 的任务提示

```text
请根据 docs/miniprogram-codex-guide.md 接入酥酥时光机 API。

实现目标：
1. 封装统一 request 方法，Base URL 使用 http://susu-time-machine.cnhalo.com。
2. 封装 loginWechat、checkAccess、fetchStories、fetchStoryDetail 四个 API 方法。
3. 小程序进入时先调用 wx.login 获取 code，再调用 POST /api/public/wechat/login 换 openId。
4. 拿到 openId 后调用一次 POST /api/public/access/check。
5. 如果 allowed=false，展示无权限页面或无权限状态，不请求故事列表。
6. 如果 allowed=true，加载 GET /api/public/stories?page=1&pageSize=10，后续浏览列表、详情、分页、刷新都不要重复调用权限检查接口。
7. 实现故事列表，展示 coverImage、title、summary、storyDate、tags。
8. 实现下拉刷新和上拉加载更多。
9. 点击故事进入详情页，详情页调用 GET /api/public/stories/:id。
10. 详情页展示 title、storyDate、tags、coverImage、content 和 images。
11. content 按换行分段渲染，images 按 sortOrder 排序，点击图片使用 wx.previewImage。
12. coverImage 为空或图片加载失败时使用本地默认图。
13. 只调用 /api/public/*，不要调用后台管理接口。

注意：
- 不要硬编码真实 openId。
- 不要在小程序端出现 WECHAT_MINI_APP_SECRET 或 AppSecret。
- 代码风格、目录结构和组件写法要贴合当前小程序项目。
```
