'use strict';

// Mock coupon service. Replace with real implementation later.
// Contract:
// validate(code, { userId, subtotal }) -> { valid, code, discountAmount, message }

async function validate(code, { userId: _userId, subtotal }) {
  if (!code) {
    return { valid: false, code: null, discountAmount: 0, message: 'No coupon' };
  }

  const normalized = String(code).trim().toUpperCase();

  if (normalized === 'SALE10') {
    const discountAmount = Math.min(subtotal * 0.1, 100000); // 10% capped 100k
    return { valid: true, code: normalized, discountAmount, message: 'Applied SALE10 10% up to 100k' };
  }

  if (normalized === 'FREESHIP') {
    // Shipping discount is applied at order calc layer. Here return a note.
    return { valid: true, code: normalized, discountAmount: 0, message: 'Free shipping code (handled separately)' };
  }

  return { valid: false, code: normalized, discountAmount: 0, message: 'Invalid coupon' };
}

module.exports = { validate };
