const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

// Helper to make HTTP requests to test server
function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        let parsed = body;
        try { parsed = JSON.parse(body); } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed
        });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

// We will launch a test instance of server or use the server module
let serverInstance;
const TEST_PORT = 3891;

test.before(async () => {
  // Set test port and load server
  process.env.PORT = TEST_PORT;
  serverInstance = require('../server.js');
  // Wait 200ms for listen
  await new Promise(r => setTimeout(r, 200));
});

test.after(async () => {
  if (serverInstance && serverInstance.close) {
    serverInstance.close();
  }
});

test('API 1: POST /api/extract-table auto-parses transactions into normalized columns', async () => {
  const payload = {
    format: 'auto',
    content: `2026-09-01  TRANSFER IN KBANK MOBILE   REF098231   45000.00
2026-09-02  DIRECT DEBIT OFFICE LEASE  REF098232   -28000.00`
  };

  const res = await request({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/extract-table',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, payload);

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.strictEqual(res.data.totalRows >= 2, true);
  assert.deepStrictEqual(res.data.columns, ['Date', 'Description', 'Reference', 'Withdrawal', 'Deposit', 'Balance']);
});

test('API 2: GET /api/leads generates enriched B2B leads with category and location', async () => {
  const res = await request({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/leads?q=Dental%20Clinic&loc=Bangkok&limit=10',
    method: 'GET'
  });

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.strictEqual(res.data.query, 'Dental Clinic');
  assert.strictEqual(res.data.location, 'Bangkok');
  assert.strictEqual(res.data.deliveredCount, 10);
  assert.strictEqual(res.data.sampleFreeCount, 5);
  assert.strictEqual(res.data.leads.length, 10);

  const sampleLead = res.data.leads[0];
  assert.ok(sampleLead.businessName);
  assert.ok(sampleLead.phone);
  assert.ok(sampleLead.email);
  assert.strictEqual(sampleLead.status, 'VERIFIED');
});

test('API 3: POST /api/f/:formId captures headless form submissions', async () => {
  const formId = 'test-form-' + Date.now();
  const subData = {
    name: 'Somchai Tech',
    email: 'somchai@testbiz.com',
    message: 'Testing headless endpoint capture.'
  };

  const res = await request({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: `/api/f/${formId}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, subData);

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.submissionId);

  // Verify retrieval
  const getRes = await request({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: `/api/f/${formId}/submissions`,
    method: 'GET'
  });

  assert.strictEqual(getRes.statusCode, 200);
  assert.strictEqual(getRes.data.count, 1);
  assert.strictEqual(getRes.data.submissions[0].name, 'Somchai Tech');
});

test('API 4: POST /api/f/:formId honeypot filters spam bot submissions', async () => {
  const formId = 'test-form-spam';
  const spamData = {
    name: 'Spam Bot 3000',
    email: 'bot@spamnetwork.xyz',
    message: 'Buy cheap watches',
    _gotcha: 'honeypot_value_present'
  };

  const res = await request({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: `/api/f/${formId}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, spamData);

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.spamFiltered, true);
});

test('API 5: POST /api/checkout/mock validates payment simulation and issues token', async () => {
  const orderData = {
    plan: 'pro_monthly',
    amount: 19
  };

  const res = await request({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/checkout/mock',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, orderData);

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.orderId.startsWith('ORD-'));
  assert.strictEqual(res.data.details.status, 'PAID');
  assert.ok(res.data.details.unlockedToken.startsWith('UNLOCK_'));
});
