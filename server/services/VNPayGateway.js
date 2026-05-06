'use strict';

const crypto = require('crypto');
const qs = require('qs');

function sortObject(obj) {
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
}

function buildVNPayParams({ orderNumber, amount }) {
  const tmnCode = process.env.VNPAY_TMN_CODE;
  const secretKey = process.env.VNPAY_HASH_SECRET;
  const vnpUrl = process.env.VNPAY_PAYMENT_URL;
  const returnUrl = process.env.VNPAY_RETURN_URL;

  if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
    throw new Error('VNPay environment variables are not fully configured');
  }

  const createDate = new Date();
  const dateFormat = (d) => {
    const pad = (n) => (n < 10 ? '0' + n : '' + n);
    return (
      d.getFullYear().toString() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      pad(d.getSeconds())
    );
  };

  const vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Amount: amount * 100,
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderNumber,
    vnp_OrderInfo: `Thanh toan don hang ${orderNumber}`,
    vnp_OrderType: 'other',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: '127.0.0.1',
    vnp_CreateDate: dateFormat(createDate)
  };

  return { vnp_Params, vnpUrl, secretKey };
}

async function createIntent({ orderNumber, amount }) {
  const { vnp_Params, vnpUrl, secretKey } = buildVNPayParams({ orderNumber, amount });

  const sorted = sortObject(vnp_Params);
  const signData = qs.stringify(sorted, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  sorted.vnp_SecureHash = signed;

  const redirectUrl = `${vnpUrl}?${qs.stringify(sorted, { encode: false })}`;

  return {
    gateway: 'vnpay',
    amount,
    redirectUrl,
    transactionCode: orderNumber
  };
}

function verifyCore(params) {
  const secretKey = process.env.VNPAY_HASH_SECRET;
  if (!secretKey) {
    throw new Error('VNPay secret key is not configured');
  }

  const receivedSecureHash = params.vnp_SecureHash || params.vnp_SecureHashType || '';
  // Clone object and remove hash fields
  const input = { ...params };
  delete input.vnp_SecureHash;
  delete input.vnp_SecureHashType;

  const sorted = sortObject(input);
  const signData = qs.stringify(sorted, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  const isValid = signed === receivedSecureHash;
  const isSuccess = isValid && String(params.vnp_ResponseCode) === '00';

  return {
    success: isSuccess,
    transactionCode: params.vnp_TxnRef,
    amount: params.vnp_Amount ? Number(params.vnp_Amount) / 100 : 0
  };
}

async function verifyReturn(query) {
  return verifyCore(query);
}

async function verifyIPN(payload) {
  return verifyCore(payload);
}

module.exports = {
  createIntent,
  verifyReturn,
  verifyIPN
};
