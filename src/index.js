/**
 * @altoninelli/eliza-plugin-selfpaid
 * Official elizaOS plugin for SelfPaidPal — Zero-Net-Cost Payments on Base Mainnet.
 */

const { checkYieldRatesAction } = require('./actions/rates');
const { zeroCostPaymentAction } = require('./actions/pay');
const { checkTreasuryAction } = require('./actions/treasury');
const { redeemCollateralAction } = require('./actions/withdraw');
const { selfPaidProvider } = require('./providers/treasuryProvider');
const api = require('./api');

const selfPaidPlugin = {
  name: 'selfpaid',
  description: 'Zero-net-cost autonomous payments, bounties, and tips with 100% capital recovery via automated DeFi yield on Base (Aave V3 & Morpho).',
  actions: [
    zeroCostPaymentAction,
    checkYieldRatesAction,
    checkTreasuryAction,
    redeemCollateralAction
  ],
  providers: [
    selfPaidProvider
  ],
  evaluators: [],
  services: []
};

module.exports = {
  selfPaidPlugin,
  default: selfPaidPlugin,
  actions: {
    zeroCostPaymentAction,
    checkYieldRatesAction,
    checkTreasuryAction,
    redeemCollateralAction
  },
  providers: {
    selfPaidProvider
  },
  api
};
