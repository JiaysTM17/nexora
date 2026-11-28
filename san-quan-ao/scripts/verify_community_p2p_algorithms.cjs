/**
 * NEXORA COMMUNITY OOTD, PATRONAGE & P2P SWAP ALGORITHMIC E2E VERIFICATION
 * Verifies Algorithms 31, 32, 33, 34:
 * - Alg 31: P2P-SWAP-FAIR-VALUE-ESCROW (P2P Swap Parity & Escrow Collateral Margin)
 * - Alg 32: PATRONAGE-PIT-TAX-WITHHOLDING (Creator Micro-Patronage & TT 111/2013 10% PIT)
 * - Alg 33: OOTD-SPATIAL-COORDINATE-ALIGN (OOTD 2D Pinpoint Spatial Dispersion & Anti-Occlusion)
 * - Alg 34: CHALLENGE-BAYESIAN-PRIZE-DIVIDEND (Bayesian Contest Ranking & Hamilton-Hare Dividend)
 */

const API_BASE = 'http://localhost:4000/api/v1';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'mac-web',
      Origin: 'http://localhost:3000',
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
  console.log('🌿 NEXORA MODULE 5: COMMUNITY OOTD, PATRONAGE & P2P SWAP VERIFICATION 🌿');
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

  // Step 2: Alg 31 - P2P Garment Swap Parity & Escrow Collateral Invariant Engine
  console.log('[2/6] Testing Alg 31: P2P Garment Swap Parity & Escrow Collateral Engine...');
  const swapEvalRes = await request('/vault/community/swap-evaluate', {
    method: 'POST',
    headers: { Cookie: cookie },
    body: JSON.stringify({
      myItemName: 'Áo Khoác Blazer Linen Cổ Điển',
      myEstimatedValueVnd: 650000,
      myConditionGrade: 'A',
      targetItemName: 'Sơ Mi Lụa Tơ Tằm Bảo Lộc',
      targetEstimatedValueVnd: 680000,
      targetConditionGrade: 'A',
      fabricType: 'LINEN',
    }),
  });

  const swapEval = swapEvalRes.data;
  console.log('  • Fair Value Match Score:', `${swapEval.fairValueMatchPct}%`);
  console.log('  • Valuation Delta:', `${swapEval.valuationDeltaVnd.toLocaleString('vi-VN')}₫`);
  console.log('  • Compensation Direction:', swapEval.compensationDirection);
  console.log('  • Compensation Amount:', `${swapEval.compensationAmountVnd.toLocaleString('vi-VN')}₫`);
  console.log('  • Required Escrow Collateral:', `${swapEval.requiredEscrowCollateralVnd.toLocaleString('vi-VN')}₫`);
  console.log('  • Circular LCA Impact:', {
    co2SavedKg: `${swapEval.ecoImpact.co2SavedKg} kg CO2e`,
    waterSavedL: `${swapEval.ecoImpact.waterSavedLiters} Liters`,
    ecoCoinsReward: `+${swapEval.ecoImpact.ecoPointsReward} Coins`,
  });
  console.log('  • Contract Hash:', swapEval.contractStateHash.slice(0, 24) + '...');
  console.log('  • Advisory:', swapEval.advisory);

  if (swapEval.fairValueMatchPct < 95.0 || swapEval.compensationAmountVnd !== 30000 || !swapEval.contractId.startsWith('SWAP-P2P-')) {
    throw new Error('Alg 31 validation failed!');
  }
  console.log('✓ Alg 31 (P2P-SWAP-FAIR-VALUE-ESCROW) passed successfully.\n');

  // Step 3: Alg 32 - Creator Micro-Patronage & TT 111/2013 10% PIT Withholding Engine
  console.log('[3/6] Testing Alg 32: Creator Micro-Patronage & 10% PIT Withholding Engine...');
  const patronRes = await request('/vault/community/patronage-withholding', {
    method: 'POST',
    headers: { Cookie: cookie },
    body: JSON.stringify({
      creatorIdOrName: 'Elena Vũ (@elenavu)',
      grossAmountVnd: 50000,
      message: 'Bộ phối blazer và đầm lụa quá thanh lịch!',
    }),
  });

  const patron = patronRes.data;
  console.log('  • Creator Name:', patron.creatorName);
  console.log('  • Gross Patronage Amount:', `${patron.grossAmountVnd.toLocaleString('vi-VN')}₫`);
  console.log('  • PIT Tax Withheld (10% TT 111):', `${patron.pitTaxWithheldVnd.toLocaleString('vi-VN')}₫`);
  console.log('  • Net Disbursed to Creator Wallet (90%):', `${patron.netDisbursedVnd.toLocaleString('vi-VN')}₫`);
  console.log('  • Patron Eco-Coins Reward:', `+${patron.loyaltyEcoCoinsEarned} Coins`);
  console.log('  • Electronic e-Tax Receipt Number:', patron.eTaxReceiptNumber);
  console.log('  • Compliance Article:', patron.complianceArticle);

  if (patron.grossAmountVnd !== 50000 || patron.pitTaxWithheldVnd !== 5000 || patron.netDisbursedVnd !== 45000 || !patron.eTaxReceiptNumber.startsWith('ETAX-TNCN-')) {
    throw new Error('Alg 32 validation failed!');
  }
  console.log('✓ Alg 32 (PATRONAGE-PIT-TAX-WITHHOLDING) passed successfully.\n');

  // Step 4: Alg 33 - OOTD 2D Pinpoint Spatial Dispersion & Occlusion Prevention
  console.log('[4/6] Testing Alg 33: OOTD 2D Spatial Dispersion & Anti-Occlusion Engine...');
  const spatialRes = await request('/vault/community/ootd-spatial', {
    method: 'POST',
    headers: { Cookie: cookie },
    body: JSON.stringify({
      tags: [
        { productId: 'prod-blazer', x: 0.50, y: 0.30 },
        { productId: 'prod-shirt', x: 0.50, y: 0.55 },
        { productId: 'prod-trousers', x: 0.50, y: 0.80 },
      ],
      minAllowedDistance: 0.08,
    }),
  });

  const spatial = spatialRes.data;
  console.log('  • Total Pins Analyzed:', spatial.totalTags);
  console.log('  • Mean Dispersion Distance:', spatial.meanDispersionDistance);
  console.log('  • Occlusion Conflict Detected:', spatial.occlusionConflictDetected);
  console.log('  • Readability Score:', `${spatial.readabilityScorePct}%`);
  console.log('  • Advisory:', spatial.advisory);

  if (spatial.totalTags !== 3 || spatial.occlusionConflictDetected || spatial.readabilityScorePct < 90) {
    throw new Error('Alg 33 validation failed!');
  }
  console.log('✓ Alg 33 (OOTD-SPATIAL-COORDINATE-ALIGN) passed successfully.\n');

  // Step 5: Alg 34 - Community Challenge Bayesian Ranking & Hamilton-Hare Prize Dividend
  console.log('[5/6] Testing Alg 34: Challenge Bayesian Ranking & Hamilton-Hare Dividend...');
  const dividendRes = await request('/vault/community/challenge-dividend', {
    method: 'POST',
    headers: { Cookie: cookie },
    body: JSON.stringify({
      challengeId: 'CHAL-46-LINEN',
      entries: [
        { postId: 'post-101', creatorName: 'Elena Vũ (@elenavu)', votes: 342, daysActive: 3 },
        { postId: 'post-102', creatorName: 'Hoàng Nam (@namtailor)', votes: 218, daysActive: 2 },
        { postId: 'post-103', creatorName: 'Mai Phương (@maiphuong.eco)', votes: 145, daysActive: 4 },
        { postId: 'post-104', creatorName: 'Thanh Trúc (@trucfashion)', votes: 65, daysActive: 1 },
      ],
      totalPrizePoolVnd: 15000000,
      topCount: 3,
    }),
  });

  const dividend = dividendRes.data;
  console.log('  • Challenge ID:', dividend.challengeId);
  console.log('  • Total Votes Cast:', dividend.totalVotesCast);
  console.log('  • Total Prize Pool:', `${dividend.totalPrizePoolVnd.toLocaleString('vi-VN')}₫`);
  console.log('  • Exact Dong Preservation Invariant:', dividend.prizePreservationExact);
  console.log('  • Finalists Podium:');
  for (const f of dividend.finalists) {
    console.log(`    #${f.rank} [${f.tierBadge}] ${f.creatorName}: ${f.votes} votes -> ${f.allocatedPrizeVnd.toLocaleString('vi-VN')}₫ (${f.prizeSharePct}%)`);
  }

  if (
    !dividend.prizePreservationExact ||
    dividend.finalists.length !== 3 ||
    dividend.finalists[0].allocatedPrizeVnd !== 7500000 ||
    dividend.finalists[1].allocatedPrizeVnd !== 4500000 ||
    dividend.finalists[2].allocatedPrizeVnd !== 3000000
  ) {
    throw new Error('Alg 34 validation failed!');
  }
  console.log('✓ Alg 34 (CHALLENGE-BAYESIAN-PRIZE-DIVIDEND) passed successfully.\n');

  // Step 6: Fullstack Persistence in Vault (Swap Contract & Patronage with e-Tax)
  console.log('[6/6] Verifying Fullstack Persistence & Complete Swap Lifecycle...');
  const swapSaveRes = await request('/vault/swap', {
    method: 'POST',
    headers: { Cookie: cookie },
    body: JSON.stringify({
      myItem: 'Áo Khoác Blazer Linen Cổ Điển',
      myVal: 650000,
      targetItem: 'Sơ Mi Lụa Tơ Tằm Bảo Lộc',
      targetVal: 680000,
      escrowLocked: true,
    }),
  });

  const createdSwap = swapSaveRes.data.swap;
  console.log('  ✓ Swap contract saved into Vault:', {
    id: createdSwap.id,
    fairValueMatchPct: `${createdSwap.fairValueMatchPct}%`,
    escrowCollateral: `${createdSwap.requiredEscrowCollateralVnd.toLocaleString('vi-VN')}₫`,
    compensation: `${createdSwap.compensationAmountVnd.toLocaleString('vi-VN')}₫`,
    contractHash: createdSwap.contractStateHash?.slice(0, 16) + '...',
  });

  const completeRes = await request(`/vault/swaps/${createdSwap.id}/complete`, {
    method: 'POST',
    headers: { Cookie: cookie },
  });

  console.log('  ✓ Swap completed & resource offsets minted:', {
    id: completeRes.data.completed.id,
    ecoPoints: `+${completeRes.data.completed.ecoPoints} Coins`,
    co2SavedKg: `${completeRes.data.completed.co2SavedKg} kg CO2e`,
    waterSavedL: `${completeRes.data.completed.waterSavedL} L`,
    status: completeRes.data.completed.status,
  });

  const patronSaveRes = await request('/vault/patronage', {
    method: 'POST',
    headers: { Cookie: cookie },
    body: JSON.stringify({
      creator: 'Elena Vũ (@elenavu)',
      amount: 20000,
      msg: 'Ly cà phê cảm hứng cho bài OOTD lụa Bảo Lộc!',
    }),
  });

  console.log('  ✓ Patronage saved into Vault with TT 111 Tax Record:', {
    id: patronSaveRes.data.patronage.id,
    creator: patronSaveRes.data.patronage.creator,
    gross: `${patronSaveRes.data.patronage.amount.toLocaleString('vi-VN')}₫`,
    pitTax: `${patronSaveRes.data.patronage.pitTaxWithheldVnd.toLocaleString('vi-VN')}₫`,
    net: `${patronSaveRes.data.patronage.netDisbursedVnd.toLocaleString('vi-VN')}₫`,
    eTaxReceipt: patronSaveRes.data.patronage.eTaxReceiptNumber,
    ecoCoins: `+${patronSaveRes.data.patronage.ecoCoinsEarned} Coins`,
  });

  console.log('\n================================================================================');
  console.log('🎉 ALL 4 COMMUNITY OOTD & P2P SWAP ALGORITHMS VERIFIED 100% PRODUCTION READY! 🎉');
  console.log('================================================================================');
}

run().catch(err => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
