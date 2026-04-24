# Ashi Tea 阿喜茶

台灣茶葉品牌線上商店。嚴選台灣高山茶葉，支援中英雙語、藍新金流、超商取貨。

## 技術棧

| 功能 | 套件 |
|------|------|
| Framework | Next.js 15 + React 19 (App Router) |
| Database | Drizzle ORM + Supabase Postgres |
| Auth | Better-Auth（Google OAuth + Email/Password） |
| i18n | next-intl（zh-TW 預設，en） |
| Email | Resend |
| Payment | 藍新金流 NewebPay MPG |
| UI | Tailwind v4 + shadcn/ui |

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

```bash
cp .env.example .env.local
```

填入以下必要項目：

| 變數 | 取得方式 |
|------|---------|
| `DATABASE_URL` | [Supabase](https://supabase.com/dashboard) → Settings → Database → Connection string（Transaction mode, port 6543） |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `AUTH_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth client ID |
| `RESEND_API_KEY` | [Resend](https://resend.com/api-keys) |
| `NEWEBPAY_MERCHANT_ID` / `NEWEBPAY_HASH_KEY` / `NEWEBPAY_HASH_IV` | 藍新金流商家後台 |

> Google OAuth redirect URI 設定：`http://localhost:3000/api/auth/callback/google`

### 3. 推送資料庫 Schema

```bash
npx drizzle-kit push
```

### 4. 啟動開發伺服器

```bash
npm run dev
# 開啟 http://localhost:3000
```

## Scripts

| 指令 | 說明 |
|------|------|
| `npm run dev` | 開發伺服器（Turbopack） |
| `npm run build` | 生產環境 build |
| `npm run tests` | 執行所有測試（Node 22 built-in runner） |
| `npm run db:push` | 同步 schema 到資料庫 |
| `npm run db:studio` | 開啟 Drizzle Studio（資料庫 GUI） |
| `npm run db:seed` | 匯入範例茶品資料（可重複執行，idempotent） |

## 專案結構

```
src/
├── app/
│   ├── page.tsx                    # 首頁（Hero、茶園介紹、Why Us、CTA）
│   ├── products/                   # 商品列表 + 詳情頁
│   ├── cart/                       # 購物車頁
│   ├── terms/                      # 服務條款
│   ├── privacy/                    # 隱私權政策
│   ├── refund-policy/              # 退款政策
│   ├── shipping-info/              # 出貨說明
│   ├── checkout/                   # 結帳頁 + 付款結果頁
│   │   ├── page.tsx
│   │   ├── result/page.tsx
│   │   └── _components/checkout-form.tsx
│   ├── account/                    # 會員中心
│   │   ├── layout.tsx
│   │   ├── page.tsx                # redirect → /account/orders
│   │   ├── orders/                 # 訂單列表 + 訂單詳情
│   │   ├── profile/                # 個人資料（ProfileForm）
│   │   └── _components/account-nav.tsx
│   ├── actions/
│   │   ├── products.ts             # getProducts / getProductById
│   │   ├── cart.ts                 # DB 購物車 CRUD
│   │   ├── orders.ts               # createOrder + getUserOrders
│   │   └── user.ts                 # updateProfile
│   └── api/
│       └── newebpay/
│           ├── notify/route.ts     # 藍新背景通知（付款完成回調）
│           └── return/route.ts     # 藍新前景跳轉（使用者付款後導回）
├── db/
│   └── schema/
│       ├── users/                  # 使用者（Better-Auth + phone 欄位）
│       ├── products/               # 商品 + 變體（克數／口味／禮盒）
│       ├── orders/                 # 訂單 + 訂單明細（含藍新、物流欄位）
│       ├── cart/                   # 購物車
│       └── uploads/                # 上傳檔案
├── i18n/
│   ├── routing.ts                  # 語言路由（zh-TW 無前綴，en → /en/）
│   └── request.ts                  # Server-side next-intl 設定
├── lib/
│   ├── auth.ts                     # Better-Auth（Google + Email/Password）
│   ├── newebpay.ts                 # 藍新金流：AES 加解密、TradeSha、MPG
│   └── shipping.ts                 # 運費計算（宅配/超商，滿 NT$1200 免運）
└── ui/                             # UI 元件

messages/
├── zh-TW.json                      # 繁體中文（預設）
└── en.json                         # English

.tests/                             # 測試（Node 22 built-in runner）
├── env.test.ts                     # 環境變數格式驗證
├── schema.test.ts                  # DB schema 結構
├── i18n.test.ts                    # 翻譯完整性（key parity）
├── build.test.ts                   # TypeScript + 設定檔
├── payments.test.ts                # 藍新金流加密邏輯
├── phase2.test.ts                  # 商品頁面 + 購物車 Server Actions
├── phase3.test.ts                  # 結帳 + 藍新金流 + 訂單建立
├── phase5.test.ts                  # 會員中心（訂單列表、個人資料）
└── phase8.test.ts                  # 消費者權益頁面 + Footer
```

## i18n

- 預設語言 `zh-TW`：路由無前綴（`/`、`/products`）
- 英文 `en`：有 `/en` 前綴（`/en/products`）
- 所有內部連結必須使用 `next-intl` 的 `<Link>` 元件

## 開發進度

- [x] Phase 1：基礎建設（DB schema、Auth、i18n、環境變數、設計 Token）
- [x] Phase 2：商品頁面（listing、detail、購物車 UI + Server Actions）
- [x] Phase 3：結帳 + 藍新金流（168/168 tests pass）
- [x] Phase 5：會員中心（我的訂單、個人資料）
- [x] Phase 6：首頁設計（Hero、茶園介紹、Why Us、CTA）
- [x] Phase 8：消費者權益（服務條款、隱私權政策、退款政策、出貨說明）+ Footer（236/236 tests pass）
- [ ] Phase 4：Email 通知（Resend）
- [ ] Phase 7：Analytics（GA4 + Meta Pixel）

## License

MIT

## Attributions

<a href="https://www.flaticon.com/free-icons/plant" title="plant icons">Plant icons created by dDara - Flaticon</a>
