/**
 * elizaOS Action: REDEEM_YIELD_COLLATERAL
 * Constructs a single ready-to-sign EVM withdrawal transaction to redeem
 * collateral/yield from Aave V3 or Morpho Vault back to user/agent wallet.
 */

const { buildWithdrawal } = require('../api');

function extractProtocol(text) {
  if (/morpho/i.test(text)) return 'morpho';
  return 'aave';
}

function extractAmount(text) {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:usdc|\$)?/i);
  return match ? parseFloat(match[1]) : undefined;
}

const redeemCollateralAction = {
  name: 'REDEEM_YIELD_COLLATERAL',
  similes: [
    'SELFPAY_WITHDRAW',
    'WITHDRAW_COLLATERAL',
    'REDEEM_AAVE',
    'REDEEM_MORPHO',
    'CLAIM_PRINCIPAL'
  ],
  description: 'Redeem active yield-bearing collateral (aBasUSDC or maUSDC) back to liquid USDC with 1-click single-transaction execution.',

  validate: async () => true,

  handler: async (runtime, message, state, options, callback) => {
    const text = message.content?.text || '';
    const protocol = extractProtocol(text);
    const amount = extractAmount(text);

    const wallet = options?.wallet ||
      runtime?.getSetting?.('WALLET_PUBLIC_KEY') ||
      runtime?.getSetting?.('EVM_PUBLIC_KEY') ||
      '0x20469527C24d17113920D1C312Bd489C967E6c8F';

    try {
      const withdrawal = await buildWithdrawal({
        protocol,
        amount,
        walletAddress: wallet
      });

      const protoName = protocol === 'morpho' ? 'Morpho Vault' : 'Aave V3 Pool';
      const amtStr = amount ? `${amount} USDC` : 'ALL available collateral';

      const responseText = `🔓 **Redemption Transaction Ready (${protoName})**:\n` +
        `• **Action**: Withdraw ${amtStr} to \`${wallet}\`\n` +
        `• **Target Contract**: \`${withdrawal.transaction.to}\`\n` +
        `• **Chain ID**: Base Mainnet (8453)\n` +
        `⚡ **Single Transaction**: Zero extra approvals needed. Sign to execute redemption.`;

      if (callback) {
        callback({
          text: responseText,
          content: withdrawal
        });
      }

      return true;

    } catch (err) {
      if (callback) {
        callback({ text: `⚠️ Error constructing redemption: ${err.message}` });
      }
      return false;
    }
  },

  examples: [
    [
      {
        user: '{{user1}}',
        content: { text: 'Withdraw 5 USDC from Aave collateral' }
      },
      {
        user: '{{agentName}}',
        content: {
          text: '🔓 Redemption Transaction Ready (Aave V3 Pool):\n• Action: Withdraw 5 USDC to your wallet.\nTransaction prepared for signature.',
          action: 'REDEEM_YIELD_COLLATERAL'
        }
      }
    ],
    [
      {
        user: '{{user1}}',
        content: { text: 'Redeem all my collateral from Morpho' }
      },
      {
        user: '{{agentName}}',
        content: {
          text: 'Prepared Morpho Vault redeem call. Single transaction ready to convert your shares back into liquid USDC.',
          action: 'REDEEM_YIELD_COLLATERAL'
        }
      }
    ]
  ]
};

module.exports = { redeemCollateralAction };
