## 目标结构

* 在 [finalProject](file:///d:/web3/Solana-bootcamp-2026-s1/finalProject) 下新增一个独立工程目录 `checkin-dapp/`

* 前端与合约完全分离、可独立安装依赖与启动：

  * `finalProject/checkin-dapp/frontend/`：Next.js + TypeScript（后续接 Wallet Adapter）

  * `finalProject/checkin-dapp/program/`：Anchor workspace（Rust 合约 + TS 测试）

## 前端（Next.js）初始化内容

* 创建 `frontend/package.json`、`tsconfig.json`、`next.config.*`、`app/` 路由骨架

* 页面占位：

  * `/`：项目介绍 + 进入打卡页按钮

  * `/checkin`：打卡页骨架（按钮/统计/徽章区先用占位组件）

* 预埋 Web3 配置但不强绑定：

  * `src/lib/solana/`：RPC、cluster、programId 的读取（来自 `.env.local`）

  * `.env.example`：`NEXT_PUBLIC_RPC_URL`、`NEXT_PUBLIC_PROGRAM_ID` 示例

* 代码注释约定：所有新增 TS 函数添加函数级注释（按你的偏好）

## 合约（Anchor）初始化内容

* 在 `program/` 手工搭建一个最小可 `anchor build/test` 的 workspace（不依赖 `anchor init`）：

  * `program/Anchor.toml`

  * `program/Cargo.toml`（workspace）

  * `program/programs/checkin_dapp/Cargo.toml`

  * `program/programs/checkin_dapp/src/lib.rs`（先放最小 program 骨架）

  * `program/tests/` + `program/tsconfig.json` + `program/package.json`（TS 测试脚手架）

* 合约先只初始化骨架与错误码占位；打卡逻辑（day\_index=unix\_timestamp/86400、一天一次）会按任务计划第 3 步再逐步补全

* Rust 函数也会补齐 doc 注释（函数级）

## 顶层联动与文档

* 新增 `finalProject/checkin-dapp/README.md`：说明目录、环境变量、启动方式（前端/合约分别）

* 约定后续产物衔接方式：Anchor build 生成的 IDL/TypeScript types 将通过复制/脚本同步到前端（先在 README 里写清楚，暂不实现自动化）

## 验证方式（你确认计划后我会按此执行）

* 由于当前工作区规则要求命令在 WSL 中执行，初始化完成后我会在 README 给出你可在 WSL 里运行的校验命令：

  * 前端：安装依赖 + `dev` 启动

  * 合约：`anchor build` / `anchor test`

确认后我将开始创建目录与脚手架文件，并把两边都整理到可直接安装依赖的状态。
