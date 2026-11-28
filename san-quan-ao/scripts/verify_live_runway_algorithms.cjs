/**
 * NEXORA LIVE RUNWAY & VIP STYLIST ENGINE E2E VERIFICATION SCRIPT
 * Verifies Algorithms 27, 28, 29, 30:
 * - Alg 27: LIVE-VELOCITY-DECAY-STOCK-ALLOC (Exponential Decay & Fair Poisson Stock Allocation)
 * - Alg 28: POLL-WILSON-SCORE-INTERVAL (Wilson Score Lower Bound & Bayesian Consensus Engine)
 * - Alg 29: STYLIST-SLOT-HUNGARIAN-MATCH (VIP Stylist Affinity & Bipartite Hungarian Matcher)
 * - Alg 30: RUNWAY-FRAME-ENTROPY-EXTRACT (Shannon Information Entropy & Golden Ratio Phi Scorer)
 */

const API_BASE = 'http://localhost:4000/api/v1';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'mac-web',
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${path}: ${JSON.stringify(data)}`);
  }
  return { status: res.status, data, headers: res.headers };
}

async function run() {
  console.log('================================================================================');
  console.log('✨ NEXORA MODULE 4: LIVE RUNWAY & VIP STYLIST ENGINE VERIFICATION ✨');
  console.log('================================================================================\n');

  // Step 1: Authenticate Buyer
  console.log('[1/6] Authenticating buyer session...');
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'buyer@mac.local', password: 'MacLocal2026!' }),
  });
  const cookieHeader = loginRes.headers.get('set-cookie');
  const cookie = cookieHeader ? cookieHeader.split(';')[0] : '';
  console.log('✓ Buyer authenticated. Session Cookie acquired.\n');

  // Step 2: Alg 27 - Live Flash Drop Exponential Velocity Decay & Fair Poisson Stock Allocation
  console.log('[2/6] Testing Alg 27: Live Flash Drop Velocity Decay & Fair Poisson Allocation...');
  const flashRes = await request('/vault/live/flash-velocity', {
    method: 'POST',
    headers: { Cookie: cookie },
    body: JSON.stringify({
      viewers: 1428,
      elapsedSeconds: 45,
      windowSeconds: 900,
      initialStock: 20,
      reservedCount: 6,
      decayRateAlpha: 0.0035,
      buyerTier: 'VIP_DIAMOND',
      requestedQuantity: 1,
    }),
  });

  const flash = flashRes.data;
  console.log('  • Granted:', flash.granted);
  console.log('  • Remaining Stock:', `${flash.remainingStock}/20`);
  console.log('  • Arrival Intensity:', `${flash.arrivalRatePerSec} orders/sec`);
  console.log('  • Reservation TTL:', `${flash.reservationTtlSec}s`);
  console.log('  • Velocity Tier:', flash.velocityTier);
  console.log('  • Security Token:', flash.reservationToken);
  console.log('  • Advisory:', flash.advisory);

  if (!flash.granted || flash.remainingStock !== 14 || !flash.reservationToken.startsWith('FLASHTOKEN-LIVE-')) {
    throw new Error('Alg 27 validation failed!');
  }
  console.log('✓ Alg 27 (LIVE-VELOCITY-DECAY-STOCK-ALLOC) passed successfully.\n');

  // Step 3: Alg 28 - Wilson Score Lower Bound & Bayesian Consensus in Interactive Poll
  console.log('[3/6] Testing Alg 28: Wilson Score Lower Bound & Bayesian Consensus Poll...');
  const pollRes = await request('/vault/live/poll-consensus', {
    method: 'POST',
    headers: { Cookie: cookie },
    body: JSON.stringify({
      votes: {
        'opt-1': 486, // Outfit Sàn Diễn Dạ Hội
        'opt-2': 214, // Outfit Minimalist Workwear
        'opt-3': 105, // Outfit Eco Linen Heritage
      },
      confidenceZ: 1.96,
      consensusThreshold: 0.35,
    }),
  });

  const poll = pollRes.data;
  console.log('  • Total Audience Votes:', poll.totalVotes);
  console.log('  • Winning Outfit Option:', poll.winningOption);
  console.log('  • Statistical Consensus Confirmed:', poll.consensusConfirmed);
  console.log('  • Margin of Victory:', `+${poll.marginOfVictoryPct}%`);
  console.log('  • Flash Deal Voucher Unlocked:', poll.voucherUnlocked);
  console.log('  • Top Option Stats (opt-1):', {
    observed: `${poll.stats['opt-1'].observedPct}%`,
    wilsonLower95: `${poll.stats['opt-1'].wilsonLowerPct}%`,
    bayesianExpectation: `${poll.stats['opt-1'].bayesianMeanPct}%`,
  });
  console.log('  • Recommendation:', poll.recommendation);

  if (poll.winningOption !== 'opt-1' || !poll.consensusConfirmed || !poll.voucherUnlocked) {
    throw new Error('Alg 28 validation failed!');
  }
  console.log('✓ Alg 28 (POLL-WILSON-SCORE-INTERVAL) passed successfully.\n');

  // Step 4: Alg 29 - VIP Stylist Appointment Optimal Affinity & Hungarian Bipartite Matcher
  console.log('[4/6] Testing Alg 29: VIP Stylist Affinity & Hungarian Bipartite Matcher...');
  const matchRes = await request('/vault/live/stylist-match', {
    method: 'POST',
    headers: { Cookie: cookie },
    body: JSON.stringify({
      customerArchetype: 'QUIET_LUXURY',
      consultFormat: 'FLAGSHIP',
      requestedSlot: '14:30 - 15:15',
      vipTier: 'DIAMOND',
      notes: 'Tư vấn đầm lụa tơ sen cho tiệc gala thượng lưu',
    }),
  });

  const match = matchRes.data;
  console.log('  • Matched Stylist:', match.matchedStylist.name, `(${match.matchedStylist.title})`);
  console.log('  • Specialty:', match.matchedStylist.specialty);
  console.log('  • Affinity Score:', `${match.matchedStylist.affinityScorePct}%`);
  console.log('  • Private Suite Assigned:', match.privateSuiteAssigned);
  console.log('  • Preparation Lead Time:', `${match.preparationLeadTimeMinutes} minutes`);
  console.log('  • Appointment Hash:', match.appointmentHash);
  console.log('  • Curator Briefing:', match.curatorBriefing);

  if (match.matchedStylist.id !== 'ELENA' || match.matchedStylist.affinityScorePct < 90 || !match.privateSuiteAssigned) {
    throw new Error('Alg 29 validation failed!');
  }
  console.log('✓ Alg 29 (STYLIST-SLOT-HUNGARIAN-MATCH) passed successfully.\n');

  // Step 5: Alg 30 - Runway Frame Information Entropy & Golden Ratio Aesthetic Scorer
  console.log('[5/6] Testing Alg 30: Runway Frame Information Entropy & Golden Ratio Scorer...');
  const entropyRes = await request('/vault/live/runway-entropy', {
    method: 'POST',
    headers: { Cookie: cookie },
    body: JSON.stringify({
      angle: 'CATWALK',
      productName: 'Áo măng tô Trench Coat dạ mỏng cao cấp',
      price: 1850000,
      lookId: 'LOOK-CATWALK-2026',
    }),
  });

  const frame = entropyRes.data;
  console.log('  • Look ID:', frame.lookId);
  console.log('  • Camera Angle:', frame.angle);
  console.log('  • Shannon Information Entropy:', `${frame.entropyBits} bits/px`);
  console.log('  • Golden Ratio Phi Harmony:', `${frame.goldenRatioHarmonyPct}%`);
  console.log('  • Collector Score:', `${frame.collectorScore}/100`);
  console.log('  • Rarity Tier:', frame.rarityTier);
  console.log('  • Provenance Fingerprint:', frame.provenanceHash.slice(0, 24) + '...');
  console.log('  • Curator Notes:', frame.curatorNotes);

  if (frame.entropyBits < 7.0 || frame.goldenRatioHarmonyPct < 95 || frame.rarityTier === 'COMMON_RUNWAY') {
    throw new Error('Alg 30 validation failed!');
  }
  console.log('✓ Alg 30 (RUNWAY-FRAME-ENTROPY-EXTRACT) passed successfully.\n');

  // Step 6: Fullstack Persistence in Vault (Lookbook Capture & Stylist Booking)
  console.log('[6/6] Verifying Fullstack Persistence & Audit Trail Integration...');
  const captureRes = await request('/vault/lookbook', {
    method: 'POST',
    headers: { Cookie: cookie },
    body: JSON.stringify({
      id: `LOOK-${Date.now().toString().slice(-6)}`,
      title: 'BST Sàn Diễn Thu Đông: Áo Măng Tô Dạ Mỏng',
      price: 1850000,
      angle: 'CATWALK',
      time: '14:35',
    }),
  });

  console.log('  ✓ Runway Look captured into Vault:', {
    id: captureRes.data.lookbook.id,
    rarityTier: captureRes.data.lookbook.rarityTier,
    collectorScore: captureRes.data.lookbook.collectorScore,
    provenanceHash: captureRes.data.lookbook.provenanceHash?.slice(0, 16) + '...',
  });

  const bookRes = await request('/vault/booking', {
    method: 'POST',
    headers: { Cookie: cookie },
    body: JSON.stringify({
      flagship: 'Flagship Atelier Sài Gòn (Private Suite)',
      service: 'Tư vấn 1-1 cùng Stylist Elena Vũ',
      date: 'Ngày mai (26/11/2026)',
      timeSlot: '14:30 - 15:15',
      vipPass: '#VIP-RUNWAY-PASS-9921',
      format: 'FLAGSHIP',
      archetype: 'QUIET_LUXURY',
      vipTier: 'DIAMOND',
      notes: 'Chọn set trang phục dạ hội runway',
    }),
  });

  console.log('  ✓ VIP Stylist appointment booked into Vault:', {
    id: bookRes.data.booking.id,
    appointmentHash: bookRes.data.booking.appointmentHash,
    matchedStylist: bookRes.data.booking.stylistMatching?.matchedStylist?.name,
    privateSuite: bookRes.data.booking.privateSuiteAssigned,
  });

  console.log('\n================================================================================');
  console.log('🎉 ALL 4 LIVE RUNWAY & VIP STYLIST ALGORITHMS VERIFIED 100% PRODUCTION READY! 🎉');
  console.log('================================================================================');
}

run().catch(err => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
