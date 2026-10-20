/**
 * elizaOS Context Provider: selfPaidProvider
 * Automatically injects real-time yield rates and treasury status into
 * the agent's LLM context so the agent proactively knows it can execute zero-cost payments.
 */

const { getRates, getTreasury } = require('../api');

const selfPaidProvider = {
  get: async (runtime, message, state) => {
    try {
      const rates = await getRates();
      const aavePct = (rates.aave * 100).toFixed(2);
      const morphoPct = (rates.morpho * 100).toFixed(2);
      const best = (rates.best || 'morpho').toUpperCase();

      let context = `[SelfPaidPal DeFi Capabilities on Base Mainnet]\n` +
        `- Zero-Net-Cost Payments: Enabled via automated collateral yield recovery.\n` +
        `- Current Live APY: Aave V3 (${aavePct}%), Morpho Vault (${morphoPct}%). Best: ${best}.\n` +
        `- Guarantee: Non-custodial, Zero Lockup. Principal & yield 100% redeemable anytime.\n`;

      const wallet = runtime?.getSetting?.('WALLET_PUBLIC_KEY') || runtime?.getSetting?.('EVM_PUBLIC_KEY');
      if (wallet && /^0x[a-fA-F0-9]{40}$/i.test(wallet)) {
        try {
          const treasury = await getTreasury(wallet);
          context += `- Agent Treasury: Liquid ${treasury.balances.liquidUsdc} USDC | Collateral ${treasury.balances.totalCollateralUsdc} USDC (Net: ${treasury.balances.totalNetWorthUsdc} USDC).\n`;
        } catch {
          // Graceful ignore if wallet is empty or RPC fails
        }
      }

      return context;
    } catch (err) {
      return `[SelfPaidPal]: Zero-net-cost payments enabled on Base Mainnet.`;
    }
  }
};

module.exports = { selfPaidProvider };
