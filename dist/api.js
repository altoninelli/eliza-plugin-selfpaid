/**
 * SelfPaidPal API Client for elizaOS
 * Native zero-dependency client for https://selfpaid.cryptofolio.it
 */

const https = require('https');

const DEFAULT_API_BASE = process.env.SELFPAY_API_URL || 'https://selfpaid.cryptofolio.it';

function request(path, options = {}) {
  const { method = 'GET', body, timeout = 6000 } = options;
  const baseUrl = options.baseUrl || DEFAULT_API_BASE;
  const fullUrl = new URL(path, baseUrl);

  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname: fullUrl.hostname,
        port: fullUrl.port || 443,
        path: fullUrl.pathname + fullUrl.search,
        method,
        headers: {
          'User-Agent': 'elizaOS-plugin-selfpaid/1.0.0',
          'Accept': 'application/json',
          ...(payload ? {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          } : {})
        },
        timeout
      },
      res => {
        let raw = '';
        res.on('data', chunk => (raw += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(raw);
            if (res.statusCode >= 400) {
              reject(new Error(data.error || `HTTP ${res.statusCode}: ${raw}`));
            } else {
              resolve(data);
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message} (Raw: ${raw.substring(0, 100)})`));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timed out after ${timeout}ms`));
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function getRates() {
  return request('/api/v1/payment/rates');
}

async function getQuote({ amount, protocol = 'auto', collateral, buffer }) {
  const query = new URLSearchParams({
    amount: String(amount),
    protocol,
    ...(collateral ? { collateral: String(collateral) } : {}),
    ...(buffer ? { buffer: String(buffer) } : {})
  });
  return request(`/api/v1/payment/quote?${query}`);
}

async function buildPayment({ amount, recipient, sender, protocol = 'auto', collateral, buffer }) {
  return request('/api/v1/payment/build', {
    method: 'POST',
    body: {
      amount,
      recipient,
      sender,
      protocol,
      collateral,
      buffer
    }
  });
}

async function getTreasury(walletAddress) {
  return request(`/api/v1/payment/treasury?wallet=${encodeURIComponent(walletAddress)}`);
}

async function buildWithdrawal({ protocol = 'aave', amount, walletAddress }) {
  return request('/api/v1/payment/withdraw', {
    method: 'POST',
    body: {
      protocol,
      amount,
      walletAddress
    }
  });
}

module.exports = {
  request,
  getRates,
  getQuote,
  buildPayment,
  getTreasury,
  buildWithdrawal
};
