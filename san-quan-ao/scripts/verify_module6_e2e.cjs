const http = require('http');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Load environment variables if not present
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

const prisma = new PrismaClient();

function request(url, options = {}, body = null, cookie = '') {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const headers = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'mac-web',
      ...(options.headers || {})
    };
    if (cookie) {
      headers['Cookie'] = cookie;
    }

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers,
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = data ? JSON.parse(data) : null;
        } catch (e) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  console.log('--- START VERIFYING MODULE 6: VIP PASSPORT, BESPOKE & ATELIER VAULT ---');

  // Step 1: Verify Web /tai-khoan returns 200
  console.log('[Step 1] Checking GET http://localhost:3000/tai-khoan...');
  const accountRes = await request('http://localhost:3000/tai-khoan');
  if (accountRes.status !== 200) {
    throw new Error(`Web /tai-khoan returned status ${accountRes.status}`);
  }
  console.log('✓ /tai-khoan profile & VIP passport page is online and returning 200 OK');

  // Step 2: Login as buyer-demo
  console.log('[Step 2] Authenticating as buyer@mac.local...');
  const loginRes = await request('http://localhost:4000/api/v1/auth/login', { method: 'POST' }, {
    email: 'buyer@mac.local',
    password: 'MacLocal2026!'
  });
  if (loginRes.status !== 200 && loginRes.status !== 201) {
    throw new Error(`Login failed with status ${loginRes.status}: ${JSON.stringify(loginRes.data)}`);
  }
  const setCookie = loginRes.headers['set-cookie'];
  if (!setCookie) throw new Error('No set-cookie returned upon login');
  const sessionCookie = setCookie.map(c => c.split(';')[0]).join('; ');
  console.log('✓ Successfully authenticated buyer session.');

  // Step 3: Save VIP Passport Measurements
  console.log('[Step 3] Updating VIP Fashion Passport measurements via POST /api/v1/vault/passport...');
  const passportPayload = {
    height: 172,
    weight: 62,
    chest: 92,
    waist: 72,
    hip: 96,
    fitPref: 'SLIM',
    footLength: 260,
    footWidth: 98,
    archType: 'HIGH_ARCH',
  };
  const passportRes = await request('http://localhost:4000/api/v1/vault/passport', { method: 'POST' }, passportPayload, sessionCookie);
  if (passportRes.status !== 200 && passportRes.status !== 201) {
    throw new Error(`Failed to save passport: ${passportRes.status} ${JSON.stringify(passportRes.data)}`);
  }
  console.log(`✓ VIP Passport saved: ${passportRes.data.passport.height}cm, chest ${passportRes.data.passport.chest}cm, fit: ${passportRes.data.passport.fitPref}`);

  // Step 4: Save Bespoke Atelier Order
  console.log('[Step 4] Saving Bespoke Order via POST /api/v1/vault/bespoke...');
  const bespokeId = `BESPOKE-TEST-${Date.now().toString().slice(-4)}`;
  const bespokePayload = {
    id: bespokeId,
    productName: 'Áo Khoác Blazer Linen Normandy Khâu Tay Độc Bản',
    monogram: 'LAN-ANH-VIP',
    lining: 'Lụa Tơ Tằm Bảo Lộc Hoạ Tiết Chìm',
    notes: 'Khuy sừng trâu tự nhiên dập vân chìm',
    queuePos: 3
  };
  const bespokeRes = await request('http://localhost:4000/api/v1/vault/bespoke', { method: 'POST' }, bespokePayload, sessionCookie);
  if (bespokeRes.status !== 200 && bespokeRes.status !== 201) {
    throw new Error(`Failed to save bespoke order: ${bespokeRes.status}`);
  }
  console.log(`✓ Bespoke Order saved: Monogram "${bespokeRes.data.bespoke.monogram}", Queue Pos: ${bespokeRes.data.bespoke.queuePos}`);

  // Step 5: Save Style Moodboard Pin
  console.log('[Step 5] Saving Style Moodboard Pin via POST /api/v1/vault/moodboard...');
  const moodboardId = `PIN-TEST-${Date.now().toString().slice(-4)}`;
  const pinPayload = {
    id: moodboardId,
    title: 'Normandy Linen Sartorial SS26',
    palette: '#D6CBBA',
    note: 'Sợi lanh thô dệt thưa tông cát mộc mạc thư thái',
    tag: '#QuietLuxury'
  };
  const pinRes = await request('http://localhost:4000/api/v1/vault/moodboard', { method: 'POST' }, pinPayload, sessionCookie);
  if (pinRes.status !== 200 && pinRes.status !== 201) {
    throw new Error(`Failed to save moodboard pin: ${pinRes.status}`);
  }
  console.log(`✓ Style Moodboard Pin saved: "${pinRes.data.pin.title}" (${pinRes.data.pin.tag})`);

  // Step 6: Save Fashion Calendar Event
  console.log('[Step 6] Saving Fashion Calendar Event via POST /api/v1/vault/event...');
  const eventId = `EV-TEST-${Date.now().toString().slice(-4)}`;
  const eventPayload = {
    id: eventId,
    title: 'Gala Khai Mạc Tuần Lễ Thời Trang Nexora',
    date: 'Thứ 6, 29/11',
    time: '19:30',
    occasion: 'Black Tie Gala Dinner',
    outfit: 'Đầm Lụa Satin Sơn Mài Đen + Khăn Cài Tơ Tằm',
    weather: 'Gió mát 24°C',
    vasReminder: true
  };
  const eventRes = await request('http://localhost:4000/api/v1/vault/event', { method: 'POST' }, eventPayload, sessionCookie);
  if (eventRes.status !== 200 && eventRes.status !== 201) {
    throw new Error(`Failed to save fashion event: ${eventRes.status}`);
  }
  console.log(`✓ Fashion Calendar Event saved: "${eventRes.data.event.title}" on ${eventRes.data.event.date}`);

  // Step 7: Book Garment Hibernation Vault
  console.log('[Step 7] Booking Garment Hibernation Vault via POST /api/v1/vault/hibernation...');
  const hibId = `HIB-TEST-${Date.now().toString().slice(-4)}`;
  const hibPayload = {
    id: hibId,
    item: 'Áo Măng Tô Dạ Cashmere Ý Sartorial',
    duration: '6 Tháng (Gói Mùa Mưa)',
    fee: 240000,
    code: `HIBERNATE-VAULT-${Date.now().toString().slice(-4)}`,
    date: '24/11/2026'
  };
  const hibRes = await request('http://localhost:4000/api/v1/vault/hibernation', { method: 'POST' }, hibPayload, sessionCookie);
  if (hibRes.status !== 200 && hibRes.status !== 201) {
    throw new Error(`Failed to save hibernation booking: ${hibRes.status}`);
  }
  console.log(`✓ Garment Hibernation booked: "${hibRes.data.hibernation.item}" - Pass: ${hibRes.data.hibernation.code}`);

  // Step 8: Fetch complete Vault via GET /api/v1/vault
  console.log('[Step 8] Fetching full Vault aggregate via GET /api/v1/vault...');
  const vaultRes = await request('http://localhost:4000/api/v1/vault', { method: 'GET' }, null, sessionCookie);
  if (vaultRes.status !== 200) {
    throw new Error(`Failed to get vault: ${vaultRes.status}`);
  }
  const vault = vaultRes.data;
  if (!vault.passport || vault.passport.height !== 172) {
    throw new Error('Passport data not properly reflected in vault');
  }
  if (!vault.moodboards.some(m => m.id === moodboardId)) {
    throw new Error(`Moodboard pin ${moodboardId} not found in vault`);
  }
  if (!vault.events.some(e => e.id === eventId)) {
    throw new Error(`Fashion event ${eventId} not found in vault`);
  }
  if (!vault.hibernations.some(h => h.id === hibId)) {
    throw new Error(`Hibernation ${hibId} not found in vault`);
  }
  console.log(`✓ All vault entities verified in aggregate: Passport, ${vault.moodboards.length} Moodboards, ${vault.events.length} Events, ${vault.hibernations.length} Hibernations.`);

  // Step 9: Clean up created test entities
  console.log('[Step 9] Cleaning up test entities...');
  const delPin = await request(`http://localhost:4000/api/v1/vault/moodboard/${moodboardId}`, { method: 'DELETE' }, null, sessionCookie);
  const delEv = await request(`http://localhost:4000/api/v1/vault/event/${eventId}`, { method: 'DELETE' }, null, sessionCookie);
  const delHib = await request(`http://localhost:4000/api/v1/vault/hibernation/${hibId}`, { method: 'DELETE' }, null, sessionCookie);
  if (delPin.status !== 200 || delEv.status !== 200 || delHib.status !== 200) {
    throw new Error('Failed to delete test entities');
  }
  console.log('✓ Cleaned up test moodboard, event, and hibernation records successfully.');

  console.log('\n========================================================================');
  console.log('🎉 ALL 9 CHECKS FOR MODULE 6 (VIP PASSPORT & ATELIER VAULT) PASSED 100%!');
  console.log('========================================================================\n');
}

run()
  .catch((err) => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
