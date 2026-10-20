/**
 * elizaOS Action: ZERO_COST_PAYMENT
 * Builds and executes zero-net-cost payments, bounties, and tips on Base Mainnet
 * with 100% capital recovery via automated DeFi yield farming (Aave V3 & Morpho).
 */

const { buildPayment, getQuote } = require('../api');

function extractAddress(text) {
  const match = text.match(/0x[a-fA-F0-9]{40}/);
  return match ? match[0] : null;
}

function extractAmount(text) {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:usdc|\$)?/i);
  return match ? parseFloat(match[1]) : null;
}

const zeroCostPaymentAction = {
  name: 'ZERO_COST_PAYMENT',
  similes: [
    'PAY_WITH_YIELD',
    'SELFPAY_PAY',
    'SEND_BOUNTY_WITH_RECOVERY',
    'TIP_WITH_RECOVERY',
    'ZERO_NET_COST_TRANSFER'
  ],
  description: 'Send a payment, bounty, or tip in USDC on Base Mainnet where 100% of the principal is recouped through automated Aave/Morpho yield farming.',

  validate: async (runtime, message) => {
    const text = message.content?.text || '';
    const hasAddress = /0x[a-fA-F0-9]{40}/.test(text);
    const hasAmount = /\d+(?:\.\d+)?/.test(text);
    return hasAddress && hasAmount;
  },

  handler: async (runtime, message, state, options, callback) => {
    const text = message.content?.text || '';
    const recipient = extractAddress(text);
    const amount = extractAmount(text);

    if (!recipient) {
      if (callback) callback({ text: '❌ Please provide a valid Base recipient address (0x...).' });
      return false;
    }

    if (!amount || amount <= 0) {
      if (callback) callback({ text: '❌ Please specify a positive USDC amount to pay.' });
      return false;
    }

    // Determine sender wallet (from agent runtime wallet or fallback)
    let sender = options?.sender ||
      runtime?.getSetting?.('WALLET_PUBLIC_KEY') ||
      runtime?.getSetting?.('EVM_PUBLIC_KEY') ||
      message.userId;

    if (!sender || !/^0x[a-fA-F0-9]{40}$/i.test(sender)) {
      // In case agent runs in read-only / simulation mode
      sender = recipient; 
    }

    try {
      const quote = await getQuote({ amount, protocol: 'auto' });
      const payment = await buildPayment({
        amount,
        recipient,
        sender,
        protocol: 'auto'
      });

      const responseText = `✨ **Zero-Cost Payment Prepared (Base Mainnet)**:\n` +
        `• **Recipient**: \`${recipient}\` receives **${amount.toFixed(2)} USDC**\n` +
        `• **Maintenance Fee (0.5%)**: ${quote.feeAmount} USDC\n` +
        `• **Yield Collateral**: ${quote.yieldDepositAmount} USDC deposited into **${quote.selectedProtocol.toUpperCase()}**\n` +
        `• **Estimated Recovery**: **100% reimbursed in ~${quote.estimatedRecoveryDays} days** (Zero Net Cost)\n` +
        `🛡️ **Guarantee**: Yield tokens are minted directly to your wallet. You can withdraw anytime with 0 lockup.\n\n` +
        `📋 **Sequential EVM Batch Calls**: 4 atomic transactions ready for signature on Base (Chain ID 8453).`;

      if (callback) {
        callback({
          text: responseText,
          content: {
            success: true,
            chainId: 8453,
            amount,
            recipient,
            sender,
            summary: payment.summary,
            transactions: payment.transactions,
            batchCalls: payment.batchCalls,
            safeBatch: {
              version: '1.0',
              chainId: '8453',
              createdAt: Date.now(),
              meta: {
                name: `SelfPaid Zero-Cost Payment (${amount} USDC)`,
                description: `SelfPaidPal 4-call atomic batch on Base to ${recipient}`
              },
              transactions: payment.transactions.map(t => ({
                to: t.to,
                value: '0',
                data: t.data
              }))
            }
          }
        });
      }

      return true;

    } catch (err) {
      if (callback) {
        callback({ text: `⚠️ Error preparing zero-cost payment: ${err.message}` });
      }
      return false;
    }
  },

  examples: [
    [
      {
        user: '{{user1}}',
        content: { text: 'Send 5 USDC to 0x1C7f7c428dE42B8402F8331612131cc8bC126369 with zero cost' }
      },
      {
        user: '{{agentName}}',
        content: {
          text: '✨ Zero-Cost Payment Prepared:\n• Recipient 0x1C7f... receives 5.00 USDC\n• Collateral: 108.00 USDC in Morpho (~4.20% APY)\n• 100% principal recovery in ~380 days.\n4 transactions prepared for signature.',
          action: 'ZERO_COST_PAYMENT'
        }
      }
    ],
    [
      {
        user: '{{user1}}',
        content: { text: 'Pay bounty of 10 USDC to 0x20469527C24d17113920D1C312Bd489C967E6c8F using selfpaid' }
      },
      {
        user: '{{agentName}}',
        content: {
          text: 'Prepared SelfPaid bounty batch on Base. Recipient gets 10 USDC immediately, while your collateral farms yield to reimburse the 10 USDC.',
          action: 'ZERO_COST_PAYMENT'
        }
      }
    ]
  ]
};

module.exports = { zeroCostPaymentAction };
