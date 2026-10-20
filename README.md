# @altoninelli/eliza-plugin-selfpaid

[![npm version](https://img.shields.io/npm/v/@altoninelli/eliza-plugin-selfpaid.svg)](https://www.npmjs.com/package/@altoninelli/eliza-plugin-selfpaid)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Base Mainnet](https://img.shields.io/badge/Network-Base%20Mainnet%20(8453)-blue.svg)](https://basescan.org)
[![elizaOS Plugin](https://img.shields.io/badge/elizaOS-Compatible%20Plugin-purple.svg)](https://github.com/elizaos/eliza)

Official **elizaOS** (ai16z) plugin for **SelfPaidPal** — Autonomous Zero-Net-Cost Payments, Bounties, and Tipping on **Base Mainnet (Chain ID 8453)** with 100% principal recovery via automated DeFi yield farming (Aave V3 & Morpho Vault).

---

## 💡 The Problem & The SelfPaid Solution

### The Problem: The "Bankrupt Bot" Syndrome
Autonomous community bots, social agents, and gaming bots frequently run out of money. Whether distributing tipping rewards on Twitter/X, paying contributors on Discord, or rewarding bug bounties, sending cash directly depletes the bot's treasury until it goes broke.

### The Solution: The "Perpetual Bounty Bot"
With **SelfPaidPal**, the recipient receives **liquid USDC immediately**, while the bot's treasury deposits collateral into audited lending protocols (**Aave V3** or **Morpho**). Over time, the DeFi yield completely reimburses the principal and developer fees.
- **Recipient**: Gets paid instantly.
- **Bot Treasury**: Retains 100% of its capital in auto-rebasing yield tokens (`aBasUSDC` / `maUSDC`).
- **Zero Lockup**: The bot can withdraw its collateral at any moment in a single click.

---

## 📦 Installation

Install into your elizaOS agent workspace via Bun or npm:

```bash
# Using bun (recommended for elizaOS)
bun add @altoninelli/eliza-plugin-selfpaid

# Or using npm
npm install @altoninelli/eliza-plugin-selfpaid
```

---

## ⚙️ Configuration

Register the plugin in your elizaOS character configuration (e.g. `characters/bounty-bot.json`):

```json
{
  "name": "BountyBot",
  "plugins": [
    "@altoninelli/eliza-plugin-selfpaid"
  ],
  "settings": {
    "secrets": {
      "EVM_PUBLIC_KEY": "0xYourAgentWalletAddressOnBase"
    }
  }
}
```

Or import and register directly in your agent runtime:

```typescript
import { selfPaidPlugin } from "@altoninelli/eliza-plugin-selfpaid";

const runtime = new AgentRuntime({
  plugins: [selfPaidPlugin],
  // ... other runtime settings
});
```

---

## ⚡ Available Actions

### 1. `ZERO_COST_PAYMENT`
Constructs and executes a 4-call atomic zero-cost payment or bounty batch on Base Mainnet.
* **Similes**: `PAY_WITH_YIELD`, `SELFPAY_PAY`, `SEND_BOUNTY_WITH_RECOVERY`, `TIP_WITH_RECOVERY`
* **Trigger Examples**:
  - *"Send 5 USDC to 0x1C7f7c428dE42B8402F8331612131cc8bC126369 with zero cost"*
  - *"Tip 2 USDC to @contributor 0x2046... using selfpaid"*
  - *"Pay bounty of 10 USDC with yield recovery"*

### 2. `CHECK_YIELD_RATES`
Fetches live on-chain supply APY across Aave V3 and Morpho Vault on Base to select the highest yield.
* **Similes**: `GET_YIELD_RATES`, `CHECK_APY`, `SELFPAY_RATES`, `COMPARE_AAVE_MORPHO`
* **Trigger Examples**:
  - *"What is the current yield rate on Base?"*
  - *"Compare Aave and Morpho yield"*

### 3. `CHECK_TREASURY_RECOVERY`
Inspects real-time on-chain balances: liquid USDC, active yield collateral (`aBasUSDC` / `maUSDC`), and capital recovery progress.
* **Similes**: `SELFPAY_TREASURY`, `CHECK_COLLATERAL_BALANCE`, `TREASURY_STATUS`
* **Trigger Examples**:
  - *"Check our treasury recovery status"*
  - *"How much yield collateral do we have in Aave?"*

### 4. `REDEEM_YIELD_COLLATERAL`
Constructs a single ready-to-sign EVM withdrawal transaction to redeem collateral back to liquid USDC with zero lockup penalty.
* **Similes**: `SELFPAY_WITHDRAW`, `WITHDRAW_COLLATERAL`, `REDEEM_AAVE`, `REDEEM_MORPHO`
* **Trigger Examples**:
  - *"Withdraw 5 USDC from Aave collateral"*
  - *"Redeem all collateral from Morpho to liquid USDC"*

---

## 🧠 Context Provider (`selfPaidProvider`)

The plugin includes an automatic context provider that injects live DeFi supply rates and treasury health directly into the agent's LLM context window. The agent proactively understands that it has zero-net-cost payment capabilities on Base without requiring explicit prompting.

---

## 🛡️ Non-Custodial & Zero-Lockup Guarantee

* **100% Non-Custodial**: Neither SelfPaidPal nor any intermediary holds custody of your funds.
* **Direct Wallet Minting**: When collateral is supplied, yield tokens (`aBasUSDC` on Aave or `maUSDC` on Morpho) are minted directly to the **agent's own wallet**.
* **Instant 1-Click Redemption**: No time lockup or penalty. Funds can be redeemed at any time.
* **Safe Multisig Compatible**: Emits Safe Transaction Builder JSON payload for DAO treasuries.

---

## 📜 Verified Live On-Chain Proofs (BaseScan)

Every payment executes 4 deterministic calls on Base Mainnet:

| Step | Action | Contract Target | Live BaseScan Reference |
| :--- | :--- | :--- | :--- |
| **1** | **Fee (0.5%)** | USDC (`0x8335...2913`) | [View Fee Tx](https://basescan.org/tx/0xe44e985008de30c4fb98ce006b7b6205f2b016208983939041b9e82e173e7db5) |
| **2** | **Payment** | USDC (`0x8335...2913`) | [View Payment Tx](https://basescan.org/tx/0x23a6332e4936e2bc0a6ce0fd2b8094d8a965acaef5d1a547dde8a97d77e8e3a4) |
| **3** | **Approve** | USDC (`0x8335...2913`) | [View Approve Tx](https://basescan.org/tx/0x76ca04981d4786f61eb1328b08047428842822ac35bce490007b1601c200507b) |
| **4** | **Supply** | Aave Pool (`0xA238...d1c5`) | [View Supply Tx](https://basescan.org/tx/0x1e43ae7775947730c8fe4a62291a091ecd7a268fe7a0a6f1f44cbcb4ee89026a) |

---

## 🌐 Ecosystem & Links

* **Official Homepage**: [https://selfpaid.cryptofolio.it](https://selfpaid.cryptofolio.it)
* **Standalone MCP Connector**: [`selfpaid-mcp`](https://www.npmjs.com/package/selfpaid-mcp)
* **BaseScan Contract Explorer**: [BaseScan 8453](https://basescan.org)
* **GitHub Repository**: [https://github.com/altoninelli/eliza-plugin-selfpaid](https://github.com/altoninelli/eliza-plugin-selfpaid)

## 📄 License

MIT © Alessandro Toninelli
