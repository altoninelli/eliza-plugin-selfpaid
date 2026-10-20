/**
 * elizaOS Action: CHECK_YIELD_RATES
 * Queries real-time on-chain supply APY across Aave V3 and Morpho on Base Mainnet.
 */

const { getRates } = require('../api');

const checkYieldRatesAction = {
  name: 'CHECK_YIELD_RATES',
  similes: [
    'GET_YIELD_RATES',
    'CHECK_APY',
    'SELFPAY_RATES',
    'COMPARE_AAVE_MORPHO',
    'DEFI_RATES'
  ],
  description: 'Check real-time supply APYs on Base Mainnet across Aave V3 and Morpho Vault to find the highest yield for capital recovery.',

  validate: async () => true,

  handler: async (runtime, message, state, options, callback) => {
    try {
      const data = await getRates();
      const aavePct = (data.aave * 100).toFixed(2);
      const morphoPct = (data.morpho * 100).toFixed(2);
      const bestName = (data.best || 'morpho').toUpperCase();
      const bestRate = (data.bestApy * 100).toFixed(2);

      const responseText = `🌾 **Live DeFi Yield on Base Mainnet (Chain ID 8453)**:\n` +
        `• **Aave V3**: ${aavePct}% APY\n` +
        `• **Morpho Vault**: ${morphoPct}% APY\n` +
        `🏆 **Optimal Strategy**: ${bestName} earning **${bestRate}% APY** for autonomous capital recovery.`;

      if (callback) {
        callback({
          text: responseText,
          content: {
            aave: data.aave,
            morpho: data.morpho,
            best: data.best,
            bestApy: data.bestApy
          }
        });
      }

      return true;
    } catch (err) {
      if (callback) {
        callback({
          text: `⚠️ Failed to fetch live yield rates: ${err.message}`
        });
      }
      return false;
    }
  },

  examples: [
    [
      {
        user: '{{user1}}',
        content: { text: 'What is the current yield rate on Base?' }
      },
      {
        user: '{{agentName}}',
        content: {
          text: '🌾 Live DeFi Yield on Base Mainnet (Chain ID 8453):\n• Aave V3: 4.11% APY\n• Morpho Vault: 3.97% APY\n🏆 Optimal Strategy: AAVE earning 4.11% APY.',
          action: 'CHECK_YIELD_RATES'
        }
      }
    ],
    [
      {
        user: '{{user1}}',
        content: { text: 'Check SelfPaid APY rates' }
      },
      {
        user: '{{agentName}}',
        content: {
          text: 'Checking on-chain rates... Morpho Vault offers 4.50% and Aave V3 offers 3.80%.',
          action: 'CHECK_YIELD_RATES'
        }
      }
    ]
  ]
};

module.exports = { checkYieldRatesAction };
