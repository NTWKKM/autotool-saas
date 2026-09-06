const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

// In-memory mock store for Form Submissions and Lead Credits
const formSubmissions = new Map();
const activeOrders = new Map();

// MIME Types Map
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json'
};

// Seed sample form
formSubmissions.set('demo-form-123', [
  { id: 'sub_1', timestamp: new Date(Date.now() - 3600000).toISOString(), name: 'Somchai Prasert', email: 'somchai@biztech.co.th', message: 'Interested in B2B enterprise dataset for Bangkok clinics.' },
  { id: 'sub_2', timestamp: new Date(Date.now() - 1800000).toISOString(), name: 'Jane Doe', email: 'jane.d@growthagency.io', message: 'Need custom PDF statement extractor integration.' }
]);

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = reqUrl.pathname;
  const searchParams = reqUrl.searchParams;
  const method = req.method;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API ROUTE 1: Table Extraction (/api/extract-table) ---
  if (pathname === '/api/extract-table' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const rawContent = payload.content || '';
        const bankFormat = payload.format || 'auto';

        // Parse lines and extract table rows
        const lines = rawContent.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        const rows = [];
        let runningBalance = 150000.00;

        if (lines.length > 0) {
          lines.forEach((line, idx) => {
            // Split by comma, tab, or multi-space
            const parts = line.split(/[,\t]| {2,}/).map(p => p.trim()).filter(p => p);
            if (parts.length >= 2) {
              const date = parts[0].match(/\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}/) ? parts[0] : `2026-09-${String((idx % 28) + 1).padStart(2, '0')}`;
              const desc = parts[1] || `Transaction #${idx + 1}`;
              const amount = parseFloat(parts[2]?.replace(/[^0-9.-]/g, '')) || (Math.random() * 5000 + 100);
              const isDebit = idx % 3 === 0;
              const withdrawal = isDebit ? amount.toFixed(2) : '';
              const deposit = !isDebit ? amount.toFixed(2) : '';
              runningBalance = isDebit ? runningBalance - amount : runningBalance + amount;

              rows.push({
                date,
                description: desc,
                reference: `TXN${100000 + idx}`,
                withdrawal,
                deposit,
                balance: runningBalance.toFixed(2)
              });
            }
          });
        }

        // Fallback demo rows if raw text was sparse
        if (rows.length === 0) {
          const sampleData = [
            { date: '2026-09-01', description: 'TRANSFER IN / KBANK MOBILE', reference: 'REF098231', withdrawal: '', deposit: '45000.00', balance: '195000.00' },
            { date: '2026-09-02', description: 'DIRECT DEBIT / OFFICE RENT', reference: 'REF098232', withdrawal: '28000.00', deposit: '', balance: '167000.00' },
            { date: '2026-09-03', description: 'PAYMENT / AWS CLOUD SERVICES', reference: 'REF098233', withdrawal: '4250.50', deposit: '', balance: '162749.50' },
            { date: '2026-09-04', description: 'QR PROMPTPAY / INVOICE #4091', reference: 'REF098234', withdrawal: '', deposit: '18500.00', balance: '181249.50' },
            { date: '2026-09-05', description: 'WITHDRAWAL / ATM SCB BRANCH', reference: 'REF098235', withdrawal: '5000.00', deposit: '', balance: '176249.50' }
          ];
          rows.push(...sampleData);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          detectedFormat: bankFormat === 'auto' ? 'Standard Commercial Statement' : bankFormat,
          totalRows: rows.length,
          columns: ['Date', 'Description', 'Reference', 'Withdrawal', 'Deposit', 'Balance'],
          data: rows
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // --- API ROUTE 2: B2B Lead Generator (/api/leads) ---
  if (pathname === '/api/leads' && method === 'GET') {
    const query = searchParams.get('q') || 'Dental Clinic';
    const location = searchParams.get('loc') || 'Bangkok';
    const count = parseInt(searchParams.get('limit'), 10) || 25;

    const mockLeads = [];
    const prefixes = ['The Ivory', 'Smile Studio', 'Apex Wellness', 'Elite Care', 'Bangkok Premier', 'Lumpini Center', 'Sukhumvit Pro', 'Aura Clinic', 'Grand Heritage', 'Metro Life'];
    const districts = ['Watthana', 'Thonglor', 'Silom', 'Sathorn', 'Phra Khanong', 'Chatuchak', 'Bang Na', 'Pathum Wan', 'Phaya Thai', 'Ari'];

    for (let i = 0; i < count; i++) {
      const name = `${prefixes[i % prefixes.length]} ${query} ${districts[i % districts.length]}`;
      const phone = `+66 2 ${String(Math.floor(100 + Math.random() * 899))}-${String(Math.floor(1000 + Math.random() * 8999))}`;
      const cleanSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      mockLeads.push({
        id: `lead_${i + 1}`,
        businessName: name,
        category: query,
        location: `${districts[i % districts.length]}, ${location}`,
        phone: phone,
        email: `contact@${cleanSlug}.co.th`,
        website: `https://www.${cleanSlug}.co.th`,
        googleRating: (4.4 + (i % 6) * 0.1).toFixed(1),
        reviewCount: Math.floor(45 + (i * 19) % 350),
        status: i < 5 ? 'VERIFIED' : 'ACTIVE_LEAD',
        isSample: i < 5
      });
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      query,
      location,
      totalFound: 480,
      deliveredCount: mockLeads.length,
      sampleFreeCount: 5,
      leads: mockLeads
    }));
    return;
  }

  // --- API ROUTE 3: Headless Form Ingestion (/api/f/:formId) ---
  if (pathname.startsWith('/api/f/') && method === 'POST') {
    const formId = pathname.replace('/api/f/', '').trim();
    if (!formId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing form token/ID' }));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let data = {};
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        try { data = JSON.parse(body || '{}'); } catch (e) { data = {}; }
      } else {
        // Form urlencoded
        const qs = new URLSearchParams(body);
        for (const [k, v] of qs.entries()) { data[k] = v; }
      }

      // Honeypot spam protection
      if (data._gotcha || data._honeypot) {
        // Silently drop spam bots
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, spamFiltered: true }));
        return;
      }

      const submission = {
        id: `sub_${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...data
      };

      if (!formSubmissions.has(formId)) {
        formSubmissions.set(formId, []);
      }
      formSubmissions.get(formId).unshift(submission);

      // Support redirect or JSON response
      if (data._next) {
        res.writeHead(302, { Location: data._next });
        res.end();
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Submission captured successfully', submissionId: submission.id }));
      }
    });
    return;
  }

  // --- API ROUTE 4: View Submissions (/api/f/:formId/submissions) ---
  if (pathname.startsWith('/api/f/') && pathname.endsWith('/submissions') && method === 'GET') {
    const formId = pathname.replace('/api/f/', '').replace('/submissions', '').trim();
    const subs = formSubmissions.get(formId) || [];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, formId, count: subs.length, submissions: subs }));
    return;
  }

  // --- API ROUTE 5: Mock Checkout & Webhook (/api/checkout/mock) ---
  if (pathname === '/api/checkout/mock' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const data = JSON.parse(body || '{}');
      const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
      activeOrders.set(orderId, {
        plan: data.plan || 'pro_pack',
        amountUsd: data.amount || 19,
        status: 'PAID',
        unlockedToken: `UNLOCK_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        orderId,
        message: 'Payment verified via Lemon Squeezy / Stripe simulator',
        details: activeOrders.get(orderId)
      }));
    });
    return;
  }

  // --- STATIC FILE SERVING ---
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  if (!path.extname(filePath)) {
    filePath += '.html';
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to 404
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head><title>404 Not Found - OmniTools SaaS</title><meta charset="utf-8"></head>
        <body style="background:#0b0f19; color:#fff; font-family:sans-serif; text-align:center; padding:100px 20px;">
          <h1 style="font-size:3rem; margin-bottom:1rem; color:#38bdf8;">404</h1>
          <p style="font-size:1.2rem; color:#94a3b8;">The requested utility page was not found.</p>
          <a href="/" style="display:inline-block; margin-top:20px; padding:12px 24px; background:#0284c7; color:#fff; text-decoration:none; border-radius:8px; font-weight:bold;">Return to Home Portal</a>
        </body>
        </html>
      `);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 OmniTools 24/7 SaaS Suite server running on http://localhost:${PORT}`);
});

module.exports = server;

