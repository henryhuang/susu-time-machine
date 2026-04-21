# 酥酥时光机小程序接入 API 文档

这份文档用于给“小程序项目里的 Codex”作为 API 参考。更任务化的接入说明见 `docs/miniprogram-codex-guide.md`。小程序只负责展示酥酥成长故事，不需要后台登录，也不需要调用管理接口。

## 1. 接入目标

小程序需要从「酥酥时光机」网站服务读取公开故事数据，并展示：

- 成长故事列表 / 时间轴
- 故事详情
- 封面图
- 多张故事配图
- 标签
- 故事日期

当前小程序先调用访问权限检查接口。通过后再读取故事列表和详情；不需要后台登录 Cookie，也不要调用管理接口。

## 2. 线上服务地址

生产环境 Base URL：

```text
http://susu-time-machine.cnhalo.com
```

如果后续切换 HTTPS，只需要把 Base URL 改成：

```text
https://susu-time-machine.cnhalo.com
```

小程序端建议统一封装：

```ts
const API_BASE_URL = "http://susu-time-machine.cnhalo.com";
```

## 3. 接口总览

| 场景 | 方法 | 路径 |
| --- | --- | --- |
| 检查用户访问权限 | POST | `/api/public/access/check` |
| 获取故事列表 | GET | `/api/public/stories` |
| 获取故事详情 | GET | `/api/public/stories/:id` |

后台管理接口不要在小程序里调用：

```text
/api/admin/*
/api/auth/*
/api/upload/*
```

## 4. 检查用户访问权限

小程序启动后先调用这个接口。当前版本按白名单控制：后台管理页把用户设为“允许访问”后，接口返回 `allowed: true`。

### 请求

```http
POST /api/public/access/check
Content-Type: application/json
```

完整示例：

```text
http://susu-time-machine.cnhalo.com/api/public/access/check
```

### Body 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `openId` | string | 条件必填 | 微信用户 openid，`openId` 和 `unionId` 至少传一个 |
| `unionId` | string | 条件必填 | 微信 unionid，`openId` 和 `unionId` 至少传一个 |
| `nickname` | string | 否 | 昵称，用于后台识别 |
| `avatarUrl` | string | 否 | 头像 URL |
| `phone` | string | 否 | 手机号，可后续接入手机号授权后传入 |

请求示例：

```json
{
  "openId": "oWxExampleOpenId",
  "nickname": "酥酥家人"
}
```

### 响应示例

已允许访问：

```json
{
  "allowed": true,
  "permissions": ["story:read"],
  "user": {
    "id": "cmoxxxxx001",
    "openId": "oWxExampleOpenId",
    "unionId": null,
    "nickname": "酥酥家人",
    "avatarUrl": null,
    "phone": null,
    "remark": "家人",
    "allowed": true,
    "source": "manual",
    "lastCheckedAt": "2026-04-21T08:00:00.000Z",
    "lastAllowedAt": "2026-04-21T08:00:00.000Z",
    "createdAt": "2026-04-21T07:00:00.000Z",
    "updatedAt": "2026-04-21T08:00:00.000Z"
  }
}
```

未允许访问：

```json
{
  "allowed": false,
  "permissions": [],
  "user": {
    "id": "cmoxxxxx002",
    "openId": "oWxPendingOpenId",
    "unionId": null,
    "nickname": "待审核用户",
    "avatarUrl": null,
    "phone": null,
    "remark": null,
    "allowed": false,
    "source": "mini-program",
    "lastCheckedAt": "2026-04-21T08:00:00.000Z",
    "lastAllowedAt": null,
    "createdAt": "2026-04-21T08:00:00.000Z",
    "updatedAt": "2026-04-21T08:00:00.000Z"
  }
}
```

如果用户不存在，服务端会自动创建一条 `allowed: false` 的待审核记录。管理员进入后台「小程序权限」页面打开允许访问即可。

### 小程序端建议

- `allowed === true`：进入故事列表，继续调用 `/api/public/stories`
- `allowed === false`：展示无权限页面，例如“暂未开通访问，请联系管理员”
- 权限判断只需要在进入小程序时执行一次。进入后浏览列表、详情、分页、刷新等普通操作不需要重复调用权限检查接口。

## 5. 获取故事列表

### 请求

```http
GET /api/public/stories?page=1&pageSize=10
```

完整示例：

```text
http://susu-time-machine.cnhalo.com/api/public/stories?page=1&pageSize=10
```

### Query 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `page` | number | 否 | `1` | 页码，从 1 开始 |
| `pageSize` | number | 否 | `10` | 每页数量，服务端最多返回 50 条 |

### 排序

故事按日期倒序返回：

```text
最新故事在前
```

### 响应示例

```json
{
  "items": [
    {
      "id": "cmoxxxxx001",
      "title": "酥酥搭了一座小城堡",
      "summary": "今天酥酥在客厅地垫上搭了很久的积木。",
      "content": "今天酥酥在客厅地垫上搭了很久的积木。她先把粉色和蓝色的积木分开，又把最高的一块放在中间，说这是城堡的塔。",
      "coverImage": "https://susu-img-wx.cnhalo.com/mini-app/user-susu/2026/04/demo.jpg",
      "storyDate": "2026-04-20T00:00:00.000Z",
      "tags": ["日常", "成长"],
      "images": [
        {
          "id": "cmoxxxxx101",
          "imageUrl": "https://susu-img-wx.cnhalo.com/mini-app/user-susu/2026/04/demo.jpg",
          "sortOrder": 0,
          "createdAt": "2026-04-20T08:00:00.000Z"
        }
      ],
      "createdAt": "2026-04-20T08:00:00.000Z",
      "updatedAt": "2026-04-20T08:30:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 1,
  "hasMore": false
}
```

### 字段说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `items` | `Story[]` | 当前页故事列表 |
| `page` | number | 当前页码 |
| `pageSize` | number | 当前每页数量 |
| `total` | number | 总故事数 |
| `hasMore` | boolean | 是否还有下一页 |

### 小程序端分页建议

- 首次进入页面请求 `page=1&pageSize=10`
- 下拉刷新时重置为 `page=1`
- 上拉加载更多时，如果 `hasMore === true`，请求下一页
- 如果 `hasMore === false`，停止继续请求

## 6. 获取故事详情

### 请求

```http
GET /api/public/stories/:id
```

完整示例：

```text
http://susu-time-machine.cnhalo.com/api/public/stories/cmoxxxxx001
```

### Path 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | string | 是 | 故事 ID，来自列表接口的 `items[].id` |

### 响应示例

```json
{
  "story": {
    "id": "cmoxxxxx001",
    "title": "酥酥搭了一座小城堡",
    "summary": "今天酥酥在客厅地垫上搭了很久的积木。",
    "content": "今天酥酥在客厅地垫上搭了很久的积木。\n她先把粉色和蓝色的积木分开。\n最后她给小熊留了一扇门。",
    "coverImage": "https://susu-img-wx.cnhalo.com/mini-app/user-susu/2026/04/demo-cover.jpg",
    "storyDate": "2026-04-20T00:00:00.000Z",
    "tags": ["日常", "成长"],
    "images": [
      {
        "id": "cmoxxxxx101",
        "imageUrl": "https://susu-img-wx.cnhalo.com/mini-app/user-susu/2026/04/demo-1.jpg",
        "sortOrder": 0,
        "createdAt": "2026-04-20T08:00:00.000Z"
      },
      {
        "id": "cmoxxxxx102",
        "imageUrl": "https://susu-img-wx.cnhalo.com/mini-app/user-susu/2026/04/demo-2.jpg",
        "sortOrder": 1,
        "createdAt": "2026-04-20T08:01:00.000Z"
      }
    ],
    "createdAt": "2026-04-20T08:00:00.000Z",
    "updatedAt": "2026-04-20T08:30:00.000Z"
  }
}
```

### 404 响应

如果故事不存在：

```json
{
  "message": "故事不存在"
}
```

HTTP 状态码：

```text
404
```

## 7. Story 数据结构

小程序端可以按下面的 TypeScript 类型建模：

```ts
export type StoryImage = {
  id?: string;
  imageUrl: string;
  sortOrder: number;
  createdAt?: string;
};

export type Story = {
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

export type StoryListResponse = {
  items: Story[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};

export type StoryDetailResponse = {
  story: Story;
};
```

## 8. 日期处理建议

接口返回的时间是 ISO 字符串：

```text
2026-04-20T00:00:00.000Z
```

小程序展示建议转成：

```text
2026年4月20日
```

示例函数：

```ts
export function formatStoryDate(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}
```

如果小程序端担心时区造成日期偏差，可以只取前 10 位：

```ts
export function formatStoryDateStable(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${Number(year)}年${Number(month)}月${Number(day)}日`;
}
```

## 9. 图片处理建议

图片字段：

- 封面图：`story.coverImage`
- 详情配图：`story.images[].imageUrl`

图片 URL 是完整地址，示例：

```text
https://susu-img-wx.cnhalo.com/mini-app/user-susu/2026/04/xxx.jpg
```

小程序端直接把 URL 传给 `<image />` 即可，不需要拼接域名。

建议：

- `coverImage` 可能为 `null`，小程序端要准备默认占位图
- `images` 可能为空数组
- 按 `sortOrder` 升序展示图片
- 点击图片时使用 `wx.previewImage`

微信小程序需要在后台配置合法域名：

```text
request 合法域名：
http://susu-time-machine.cnhalo.com

downloadFile 合法域名 / 图片域名：
https://susu-img-wx.cnhalo.com
```

如果微信后台不允许配置 HTTP request 域名，生产服务需要切换到 HTTPS。

## 10. 微信小程序请求封装示例

```ts
const API_BASE_URL = "http://susu-time-machine.cnhalo.com";

type RequestOptions = {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
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

## 11. 小程序 API 方法示例

```ts
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

export function checkAccess(profile: {
  openId?: string;
  unionId?: string;
  nickname?: string;
  avatarUrl?: string;
  phone?: string;
}) {
  return request<{
    allowed: boolean;
    permissions: string[];
    user: {
      id: string;
      openId: string | null;
      unionId: string | null;
      nickname: string | null;
      allowed: boolean;
    };
  }>({
    url: "/api/public/access/check",
    method: "POST",
    data: profile
  });
}
```

## 12. 页面实现建议

### 时间轴 / 列表页

页面状态建议：

```ts
type State = {
  stories: Story[];
  page: number;
  pageSize: number;
  hasMore: boolean;
  loading: boolean;
  refreshing: boolean;
};
```

交互逻辑：

- `onLoad` 调用 `fetchStories(1, 10)`
- `onPullDownRefresh` 清空列表，重新请求第一页
- `onReachBottom` 判断 `hasMore`，有更多再请求下一页
- 点击故事卡片跳转详情页，传 `id`

### 详情页

页面参数：

```text
/pages/story-detail/index?id=storyId
```

详情页逻辑：

- `onLoad(options)` 读取 `options.id`
- 调用 `fetchStoryDetail(id)`
- 正文 `content` 可以按 `\n` 分段渲染
- 图片数组按 `sortOrder` 排序
- 点击图片调用 `wx.previewImage`

## 13. 错误和空状态

列表为空：

```text
还没有故事
```

网络失败：

```text
故事加载失败，请稍后再试
```

无访问权限：

```text
暂未开通访问，请联系管理员
```

详情 404：

```text
这条故事不存在或已经被删除
```

图片加载失败：

- 使用本地默认图
- 不要影响整页展示

## 14. 注意事项

1. 小程序只调用 `/api/public/*`。
2. 不要在小程序里保存或使用后台管理员账号密码。
3. 图片 URL 已经是完整 URL，不要再拼接 Base URL。
4. `content` 当前是普通多行文本，不是 HTML。
5. `tags` 是字符串数组，可能为空。
6. `coverImage` 可能为空，小程序端必须兜底。
7. 如果后端域名从 HTTP 切到 HTTPS，只改 `API_BASE_URL`。
8. 微信正式版通常要求 HTTPS 合法域名；如果当前 HTTP 域名无法加入合法域名，需要给网站配置 HTTPS。

## 15. 给小程序 Codex 的任务描述

可以把下面这段直接交给小程序项目里的 Codex：

```text
请基于 docs/miniprogram-api.md 接入酥酥时光机公开 API。

目标：
1. 小程序进入时，先拿到微信 openid，再调用一次 POST /api/public/access/check。
2. 如果 allowed 为 false，展示无权限页面，不进入故事列表。
3. 如果 allowed 为 true，实现成长故事列表页，调用 GET /api/public/stories?page=1&pageSize=10；后续浏览列表、详情、分页、刷新都不要重复调用权限检查接口。
4. 支持下拉刷新和上拉加载更多。
5. 列表卡片展示 coverImage、title、summary、storyDate、tags。
6. 点击故事进入详情页。
7. 详情页调用 GET /api/public/stories/:id。
8. 详情页展示 title、storyDate、tags、coverImage、content 和 images。
9. content 按换行分段渲染。
10. images 按 sortOrder 排序，点击图片使用 wx.previewImage 预览。
11. coverImage 为空或图片加载失败时使用本地默认图。
12. 只调用 /api/public/*，不要调用后台管理接口。

Base URL：
http://susu-time-machine.cnhalo.com

图片 URL 是完整 URL，直接用于 <image />。
```
