import { sha256 } from 'js-sha256';

/**
 * Generates canonical string representation of block data for SHA-256 hashing.
 * Deterministic serialization ensures identical hashes across client and hardware nodes.
 */
export function getCanonicalBlockString(block) {
  const index = block.block_index !== undefined ? block.block_index : 0;
  const ts = block.timestamp || '';
  const dht = Number(block.temp_dht).toFixed(2);
  const ntc = Number(block.temp_ntc).toFixed(2);
  const batt = Number(block.batt_v).toFixed(2);
  const pwr = block.power_mode || 'LOW_POWER';
  const enc = block.enclosure || 'VERIFIED_SAFE';
  const prev = block.prev_hash || '0000000000000000000000000000000000000000000000000000000000000000';

  return `BLOCK:${index}|TS:${ts}|DHT:${dht}|NTC:${ntc}|BATT:${batt}|PWR:${pwr}|ENC:${enc}|PREV:${prev}`;
}

/**
 * Computes the SHA-256 signature hash for a cold chain block.
 */
export function computeBlockHash(block) {
  const canonical = getCanonicalBlockString(block);
  return sha256(canonical);
}

/**
 * Truncates a 64-character SHA-256 hex string for UI display.
 * e.g., 465b4dcc...998296
 */
export function truncateHash(hash, lead = 6, tail = 6) {
  if (!hash) return '0x0000...0000';
  const clean = hash.startsWith('0x') ? hash.slice(2) : hash;
  if (clean.length <= lead + tail) return `0x${clean}`;
  return `0x${clean.slice(0, lead)}...${clean.slice(-tail)}`;
}

/**
 * Verifies an entire sequence of ledger blocks.
 * If any block's data has been tampered with, its computed hash will not match its signature_hash,
 * OR its prev_hash will not match the previous block's signature_hash.
 * 
 * In a cryptographic blockchain/ledger, once a block is broken, THAT BLOCK AND ALL SUBSEQUENT
 * BLOCKS ARE INVALIDATED ("AUDIT BROKEN - RECORD FALSIFIED").
 */
export function verifyLedgerChain(blocks) {
  let brokenIndex = null;
  let brokenReason = null;

  const verified = blocks.map((block, idx) => {
    // If the chain is already broken earlier, this block is also broken by cascade
    if (brokenIndex !== null) {
      return {
        ...block,
        is_valid: false,
        is_broken: true,
        cascade_broken: true,
        broken_origin: brokenIndex,
        break_reason: `Broken cryptographic continuity: Parent block #${blocks[brokenIndex].block_index} failed verification.`,
      };
    }

    const recomputedHash = computeBlockHash(block);
    
    // Check 1: Has this block's internal payload been altered compared to its signature?
    if (recomputedHash.toLowerCase() !== (block.signature_hash || '').toLowerCase()) {
      brokenIndex = idx;
      brokenReason = `Hash mismatch! Recomputed SHA-256 (${truncateHash(recomputedHash)}) != Signed Hash (${truncateHash(block.signature_hash)}). Record temperature/payload was falsified!`;
      return {
        ...block,
        recomputed_hash: recomputedHash,
        is_valid: false,
        is_broken: true,
        cascade_broken: false,
        broken_origin: idx,
        break_reason: brokenReason,
      };
    }

    // Check 2: Does this block link to the previous block's signature_hash?
    if (idx > 0) {
      const prevBlock = blocks[idx - 1];
      const expectedPrevHash = prevBlock.signature_hash;
      if ((block.prev_hash || '').toLowerCase() !== (expectedPrevHash || '').toLowerCase()) {
        brokenIndex = idx;
        brokenReason = `Chain linkage broken! Block prev_hash does not match Block #${prevBlock.block_index} signature hash.`;
        return {
          ...block,
          recomputed_hash: recomputedHash,
          is_valid: false,
          is_broken: true,
          cascade_broken: false,
          broken_origin: idx,
          break_reason: brokenReason,
        };
      }
    }

    // Passed verification
    return {
      ...block,
      recomputed_hash: recomputedHash,
      is_valid: true,
      is_broken: false,
      cascade_broken: false,
      break_reason: null,
    };
  });

  return {
    isChainIntact: brokenIndex === null,
    brokenIndex,
    brokenReason,
    verifiedBlocks: verified,
  };
}
