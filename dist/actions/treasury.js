/**
 * elizaOS Action: CHECK_TREASURY_RECOVERY
 * Queries live on-chain balances for liquid USDC, active Aave/Morpho yield tokens,
 * and recovery progress for the agent's treasury on Base Mainnet.
 */

const { getTreasury } = require('../api');

function extractAddress(text) {
  const match = text.match(/0x[a-fA-F0-9]{40}/);
  return match ? match[0] : null;
}

const checkTreasuryAction = {
  name: 'CHECK_TREASURY_RECOVERY',
  similes: [
    'SELFPAY_TREASURY',
    'CHECK_COLLATERAL_BALANCE',
    'TREASURY_STATUS',
    'HOW_MUCH_YIELD_EARNED'
  ],
  description: 'Inspect live on-chain treasury status: liquid USDC, active yield-bearing collateral (aBasUSDC & maUSDC), and capital recovery progress on Base.',

  validate: async () => true,

  handler: async (runtime, message, state, options, callback) => {
    const text = message.content?.text || '';
    const specifiedWallet = extractAddress(text);

    const wallet = specifiedWallet ||
      options?.wallet ||
      runtime?.getSetting?.('WALLET_PUBLIC_KEY') ||
      runtime?.getSetting?.('EVM_PUBLIC_KEY') ||
      '0x20469527C24d17113920D1C312Bd489C967E6c8F'; // Fallback reference

    try {
      const data = await getTreasury(wallet);
      const b = data.balances;

      const responseText = `🏛️ **SelfPaid Treasury & Recovery Hub** (\`${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}\`):\n` +
        `• **Liquid USDC**: ${parseFloat(b.liquidUsdc).toFixed(2)} USDC\n` +
        `• **Active Yield Collateral**: ${parseFloat(b.totalCollateralUsdc).toFixed(2)} USDC\n` +
        `  - Aave V3 (\`aBasUSDC\`): ${parseFloat(b.aaveYieldUsdc).toFixed(2)} USDC (${(data.protocols.aave.apy * 100).toFixed(2)}% APY)\n` +
        `  - Morpho Vault (\`maUSDC\`): ${parseFloat(b.morphoYieldUsdc).toFixed(2)} USDC (${(data.protocols.morpho.apy * 100).toFixed(2)}% APY)\n` +
        `• **Total Net Worth**: **${parseFloat(b.totalNetWorthUsdc).toFixed(2)} USDC**\n` +
        `🛡️ **Zero Lockup**: Collateral is 100% redeemable back to liquid USDC at any time.`;

      if (callback) {
        callback({
          text: responseText,
          content: data
        });
      }

      return true;

    } catch (err) {
      if (callback) {
        callback({ text: `⚠️ Error checking treasury status: ${err.message}` });
      }
      return false;
    }
  },

  examples: [
    [
      {
        user: '{{user1}}',
        content: { text: 'Check our treasury recovery status' }
      },
      {
        user: '{{agentName}}',
        content: {
          text: '🏛️ SelfPaid Treasury & Recovery Hub:\n• Liquid USDC: 3.53 USDC\n• Active Yield Collateral: 3.08 USDC (Aave V3 at 4.11% APY)\n• Total Net Worth: 6.61 USDC\nZero Lockup: 100% redeemable anytime.',
          action: 'CHECK_TREASURY_RECOVERY'
        }
      }
    ],
    [
      {
        user: '{{user1}}',
        content: { text: 'How much yield collateral do we hold on Base?' }
      },
      {
        user: '{{agentName}}',
        content: {
          text: 'Fetching on-chain balances... You hold 3.08 USDC in Aave aBasUSDC actively earning yield.',
          action: 'CHECK_TREASURY_RECOVERY'
        }
      }
    ]
  ]
};

module.exports = { checkTreasuryAction };
