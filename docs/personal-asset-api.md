# 个人资产详情小程序 API

所有接口统一使用 `/api/personal-asset` 前缀。

## 登录

```http
POST /api/personal-asset/auth/login
Content-Type: application/json
```

请求：

```json
{
  "code": "wx.login 返回的 code"
}
```

响应：

```json
{
  "success": true,
  "data": {
    "openid": "o_xxx",
    "openId": "o_xxx",
    "authorized": true,
    "token": "signed-session-token"
  }
}
```

后续接口携带：

```http
Authorization: Bearer <token>
```

## 访问状态

```http
GET /api/personal-asset/auth/state
```

## 快照

- `GET /api/personal-asset/snapshots`
- `GET /api/personal-asset/snapshots/latest`
- `GET /api/personal-asset/snapshots/:id`
- `POST /api/personal-asset/snapshots`
- `PUT /api/personal-asset/snapshots/:id`
- `DELETE /api/personal-asset/snapshots/:id`

快照结构：

```json
{
  "id": "snapshot_xxx",
  "recordDate": "2026-04-27",
  "title": "2026-04-27 资产快照",
  "remark": "",
  "assets": [],
  "loans": [],
  "cards": [],
  "createdAt": "2026-04-27T10:00:00.000Z",
  "updatedAt": "2026-04-27T10:00:00.000Z"
}
```

## 导入导出

- `GET /api/personal-asset/data/export`
- `POST /api/personal-asset/data/import`
- `POST /api/personal-asset/data/import/append`
- `DELETE /api/personal-asset/data/all`

导入 body：

```json
{
  "snapshots": []
}
```

## 权限与数据隔离

- 白名单用户访问 `real` 数据。
- 非白名单用户访问 `demo` 数据。
- `real` 和 `demo` 使用同一张表的 `dataScope` 字段隔离，所有查询与写入都带 `ownerOpenId + dataScope` 条件。
- 白名单来源优先支持 `MiniProgramUser.allowed`，同时支持环境变量 `PERSONAL_ASSET_AUTHORIZED_OPENIDS`。
