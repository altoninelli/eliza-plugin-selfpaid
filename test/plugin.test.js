/**
 * Integration Test Suite for @altoninelli/eliza-plugin-selfpaid
 */

const { selfPaidPlugin, actions, providers, api } = require('../src/index');

let passed = 0;
let failed = 0;

function assert(description, condition, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${description}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${description} ${details}`);
    failed++;
  }
}

async function runTests() {
  console.log('🧪 Starting elizaOS SelfPaid Plugin Integration Tests...\n');

  // 1. Structure Verification
  console.log('1. elizaOS Plugin Compliance:');
  assert('Plugin has correct name', selfPaidPlugin.name === 'selfpaid');
  assert('Plugin provides description', typeof selfPaidPlugin.description === 'string');
  assert('Plugin exposes 4 actions', selfPaidPlugin.actions.length === 4);
  assert('Plugin exposes 1 provider', selfPaidPlugin.providers.length === 1);

  selfPaidPlugin.actions.forEach(action => {
    assert(`Action ${action.name} has description`, typeof action.description === 'string');
    assert(`Action ${action.name} has similes array`, Array.isArray(action.similes) && action.similes.length > 0);
    assert(`Action ${action.name} has validate function`, typeof action.validate === 'function');
    assert(`Action ${action.name} has handler function`, typeof action.handler === 'function');
    assert(`Action ${action.name} has examples`, Array.isArray(action.examples) && action.examples.length > 0);
  });

  // 2. CHECK_YIELD_RATES Action
  console.log('\n2. Action: CHECK_YIELD_RATES:');
  let ratesOutput = null;
  const ratesResult = await actions.checkYieldRatesAction.handler(
    null,
    { content: { text: 'What is the yield rate on Base?' } },
    null,
    null,
    res => { ratesOutput = res; }
  );
  assert('CHECK_YIELD_RATES executes successfully', ratesResult === true);
  assert('Returns formatted text', ratesOutput && ratesOutput.text.includes('Live DeFi Yield'));
  assert('Contains Aave APY', ratesOutput.content.aave > 0);
  assert('Contains Morpho APY', ratesOutput.content.morpho > 0);

  // 3. ZERO_COST_PAYMENT Action
  console.log('\n3. Action: ZERO_COST_PAYMENT:');
  const testRecipient = '0x1C7f7c428dE42B8402F8331612131cc8bC126369';
  const testSender = '0x20469527C24d17113920D1C312Bd489C967E6c8F';

  const isValid = await actions.zeroCostPaymentAction.validate(
    null,
    { content: { text: `Pay 5 USDC to ${testRecipient}` } }
  );
  assert('Validates message with amount and recipient', isValid === true);

  let payOutput = null;
  const payResult = await actions.zeroCostPaymentAction.handler(
    null,
    { content: { text: `Send 5 USDC to ${testRecipient} with zero cost` }, userId: testSender },
    null,
    { sender: testSender },
    res => { payOutput = res; }
  );
  assert('ZERO_COST_PAYMENT executes successfully', payResult === true);
  assert('Constructs 4 sequential EVM transactions', payOutput.content.transactions.length === 4);
  assert('Constructs 4 EIP-5792 batchCalls', payOutput.content.batchCalls.length === 4);
  assert('Generates Safe Transaction Builder JSON payload', payOutput.content.safeBatch && payOutput.content.safeBatch.version === '1.0');
  assert('Fee is clamped or calculated correctly', payOutput.content.summary.feeAmount === '0.1');

  // 4. CHECK_TREASURY_RECOVERY Action
  console.log('\n4. Action: CHECK_TREASURY_RECOVERY:');
  let treasuryOutput = null;
  const treasuryResult = await actions.checkTreasuryAction.handler(
    null,
    { content: { text: `Check treasury status for ${testSender}` } },
    null,
    { wallet: testSender },
    res => { treasuryOutput = res; }
  );
  assert('CHECK_TREASURY_RECOVERY executes successfully', treasuryResult === true);
  assert('Reads liquid USDC on Base', typeof treasuryOutput.content.balances.liquidUsdc === 'string');
  assert('Reads active Aave collateral', typeof treasuryOutput.content.balances.aaveYieldUsdc === 'string');
  assert('Provides Zero-Lockup guarantee in text', treasuryOutput.text.includes('Zero Lockup'));

  // 5. REDEEM_YIELD_COLLATERAL Action
  console.log('\n5. Action: REDEEM_YIELD_COLLATERAL:');
  let redeemOutput = null;
  const redeemResult = await actions.redeemCollateralAction.handler(
    null,
    { content: { text: 'Withdraw 2 USDC from Aave collateral' } },
    null,
    { wallet: testSender },
    res => { redeemOutput = res; }
  );
  assert('REDEEM_YIELD_COLLATERAL executes successfully', redeemResult === true);
  assert('Builds single EVM withdrawal transaction', redeemOutput.content.transaction.name === 'AAVE_WITHDRAW');
  assert('Target is Aave V3 Pool', redeemOutput.content.transaction.to.toLowerCase() === '0xa238dd80c259a72e81d7e4664a9801593f98d1c5');

  // 6. selfPaidProvider Context Provider
  console.log('\n6. Context Provider: selfPaidProvider:');
  const contextString = await providers.selfPaidProvider.get(
    { getSetting: key => (key === 'WALLET_PUBLIC_KEY' ? testSender : null) },
    {},
    {}
  );
  assert('Provider returns non-empty context string', typeof contextString === 'string' && contextString.length > 50);
  assert('Context highlights Zero-Net-Cost capabilities', contextString.includes('Zero-Net-Cost Payments'));
  assert('Context contains live APYs', contextString.includes('APY'));

  console.log('\n========================================');
  console.log(`ELIZA PLUGIN RESULTS: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
