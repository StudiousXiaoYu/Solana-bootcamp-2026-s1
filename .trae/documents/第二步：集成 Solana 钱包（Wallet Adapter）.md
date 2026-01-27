## 目标
- 在现有 Next.js 前端中接入 Solana Wallet Adapter，实现 Connect/Disconnect。
- 打卡仍用 mock，但数据按真实钱包地址隔离（localStorage key 使用 address）。

## 现状确认（已完成）
- 前端位于 `finalProject/checkin-dapp/frontend`，App Router。
- `checkin/page.tsx` 目前使用 `MOCK_ADDRESS` 读取/写入 mock 数据。
- 依赖里已有 `@solana/web3.js`，尚未安装 `@solana/wallet-adapter-*`。

## 实现方案
### 1) 安装 Wallet Adapter 依赖
- 修改 `frontend/package.json`
- 增加：`@solana/wallet-adapter-base`、`@solana/wallet-adapter-react`、`@solana/wallet-adapter-react-ui`、`@solana/wallet-adapter-wallets`

### 2) 增加全局 Providers（Connection + Wallet + Modal）
- 新增 `frontend/src/app/providers.tsx`（client component）
- Provider 组合：
  - `ConnectionProvider`：endpoint 使用 `getSolanaFrontendConfig().rpcUrl`
  - `WalletProvider`：最小先支持 Phantom（后续可扩展 Solflare/Backpack）
  - `WalletModalProvider`：提供 `WalletMultiButton` 的连接弹窗
- 修改 `frontend/src/app/layout.tsx`：在 `<body>` 内用 `<Providers>{children}</Providers>` 包裹

### 3) 引入 wallet-adapter UI 样式
- 修改 `frontend/src/app/globals.css`
- 在最顶部加入 `@import "@solana/wallet-adapter-react-ui/styles.css";`（必须放在 `@tailwind` 之前）

### 4) 打卡页改为使用真实地址驱动 mock 数据
- 修改 `frontend/src/app/checkin/page.tsx`
- 变更点：
  - 去掉 `MOCK_ADDRESS`，改用 `useWallet().publicKey?.toBase58()` 得到 `address`
  - Header 右侧替换为 `WalletMultiButton`（自动显示 Connect/Disconnect/地址缩写）
  - 数据加载逻辑改为：
    - 未连接：不读写 localStorage（stats/badges/history 置空或默认值），打卡按钮禁用，并显示“请先连接钱包”提示
    - 已连接：用 `address` 调用 `mockCheckInService.getStats/getBadges/getHistory/checkIn`
  - 切换地址时（断开再连接或更换钱包账户）：自动重新加载对应地址的数据

## 验证方式（实现后我会自测）
- 连接钱包后：页面显示地址/按钮状态正确，mock 数据以地址为维度存储。
- 同一浏览器切换不同地址：累计次数/历史/徽章互不影响。
- 断开钱包：页面回到未连接状态，无法触发打卡。

## 可选增强（不影响第二步验收）
- 增加一次性 `signMessage` 的“签名登录”状态（仅前端保存，不做服务端校验）。