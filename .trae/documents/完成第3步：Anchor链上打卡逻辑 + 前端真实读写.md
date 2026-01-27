## 现状核对
- 合约端目前还是 Anchor 默认模板，仅有 `initialize`，未实现 `UserCheckin`、`initialize_user`、`check_in`。[lib.rs](file:///d:/project/web3/Solana-bootcamp-2026-s1/finalProject/checkin-dapp/program/programs/program/src/lib.rs)
- 前端打卡页仍在调用 `mockCheckInService`，钱包已接入，但链上读写未接入。[page.tsx](file:///d:/project/web3/Solana-bootcamp-2026-s1/finalProject/checkin-dapp/frontend/src/app/checkin/page.tsx)

## 合约（Anchor Program）实现
1. **新增账户模型 `UserCheckin`（PDA）**
- 字段：`authority: Pubkey`、`total_checkins: u32`、`last_checkin_day: i64`、`streak: u16`、`bump: u8`
- PDA seeds：`["user_checkin", authority]`（固定前缀 + 用户地址）
- 初始化默认值：`total_checkins=0`、`streak=0`、`last_checkin_day=-1`

2. **新增指令 `initialize_user()`**
- 作用：创建 `UserCheckin` PDA（payer=用户），写入默认字段与 bump

3. **新增指令 `check_in()`**
- 读取 `Clock.unix_timestamp`，计算 `day_index = unix_timestamp / 86400`（UTC 天粒度）
- 若 `day_index == last_checkin_day`：返回自定义错误（今天已打卡）
- streak 逻辑：
  - 首次/断档：`streak = 1`
  - 连续：`day_index == last_checkin_day + 1` 时 `streak += 1`
- 更新：`total_checkins += 1`、`last_checkin_day = day_index`

4. **错误码**
- `AlreadyCheckedInToday`
-（可选）`Unauthorized`（确保 PDA authority 一致）

## 测试（Anchor Tests）
1. **修复并重写 TS 测试**
- 解决当前 `tests/program.ts` 重复 import/类型冲突问题，按新 IDL 调用 `initializeUser` / `checkIn`。
- 用同样的 PDA seeds 在测试侧派生 PDA，并断言初始化后字段正确。
- 同一天连续打两次：第二次应抛 `AlreadyCheckedInToday`。

2. **跨天 streak 测试方案（推荐：仅测试构建启用）**
- 为了在本地测试里可控“跨天”，我会在合约里添加一个 **仅在 `feature="test"` 编译时才存在** 的测试辅助指令（例如 `check_in_with_day(day_index: i64)` 或 `set_last_checkin_day(day_index: i64)`）。
- `anchor test` 时带 `-- --features test` 运行，验证 streak 增长/重置；正常 `anchor build/deploy` 不开启该 feature，不会暴露该指令到 IDL/线上。

## 前端接链改造
1. **补齐前端依赖与 IDL**
- 前端增加 `@coral-xyz/anchor` 依赖（用于浏览器侧 Program/Provider 调用）。
- 将合约生成的 IDL（`target/idl/*.json`）复制一份到前端工程内（例如 `src/idl/program.json`），避免 Next.js 跨项目目录 import 的限制。

2. **实现链上版 CheckInService（替换 mock）**
- 新增 `CheckInService` 接口（对齐现有 UI 需要的：`getStats/checkIn/getBadges/getHistory`）。
- 新增 `AnchorCheckInService`：
  - 读取 `NEXT_PUBLIC_RPC_URL` 与 `NEXT_PUBLIC_PROGRAM_ID`（已存在读取工具：[env.ts](file:///d:/project/web3/Solana-bootcamp-2026-s1/finalProject/checkin-dapp/frontend/src/lib/solana/env.ts)）
  - 通过 `useConnection` + `useAnchorWallet` 组装 `AnchorProvider`，创建 `Program`
  - `getStats`：fetch `UserCheckin`；若账户不存在返回全 0，并把 `canCheckIn=true`
  - `checkIn`：若 PDA 不存在先调用 `initialize_user`，然后 `check_in`，确认后刷新
  - 错误映射：把链上 `AlreadyCheckedInToday` 显示为“今天已经打过卡啦”
- `getBadges`：仍按阈值用链上 `total_checkins` 计算 unlocked（claimed 先保持 false，等第4步做 NFT 领取）。
- `getHistory`：按第3步“可简化”原则，先仅标记“今天是否打卡”（其余天 false），保证 UI 可用。

3. **打卡页接入链上服务**
- [page.tsx](file:///d:/project/web3/Solana-bootcamp-2026-s1/finalProject/checkin-dapp/frontend/src/app/checkin/page.tsx) 从“直接用 mock”改为“根据配置优先用链上服务（PROGRAM_ID 存在则用 AnchorCheckInService，否则 fallback mock）”。
- 保持原有状态机：未连接/打卡中/今日已打卡/失败提示。

4. **环境变量示例**
- 更新 `.env.example`：增加 `NEXT_PUBLIC_RPC_URL`、`NEXT_PUBLIC_PROGRAM_ID`（第3步默认可用 devnet RPC；PROGRAM_ID 由部署得到）。

## 验证方式（我会在实现后执行）
- 合约：`anchor test`（在 WSL 终端运行）通过：初始化、重复打卡失败、跨天 streak 测试。
- 前端：本地启动后连接钱包，在本地链或 devnet 完整走通：首次打卡自动初始化 → 成功写入 → 再点一次提示“今日已打卡”。

如果你确认这个方案，我将开始按以上步骤直接落地代码与测试。