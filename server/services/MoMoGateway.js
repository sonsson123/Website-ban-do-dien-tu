'use strict';

const crypto = require('crypto');
const https = require('https');

function createSignature(rawSignature, secretKey) {
  return crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
}

function requestMoMo(endpoint, payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint);

    const data = JSON.stringify(payload);

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

async function createIntent({ orderNumber, amount }) {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const endpoint = process.env.MOMO_ENDPOINT;
  const returnUrl = process.env.MOMO_RETURN_URL;
  const ipnUrl = process.env.MOMO_IPN_URL;

  if (!partnerCode || !accessKey || !secretKey || !endpoint || !returnUrl || !ipnUrl) {
    throw new Error('MoMo environment variables are not fully configured');
  }

  const requestId = `${partnerCode}-${Date.now()}`;
  const orderId = orderNumber;
  const orderInfo = `Thanh toan don hang ${orderNumber}`;
  const requestType = 'captureWallet';
  const extraData = '';

  const rawSignature = [
    `accessKey=${accessKey}`,
    `amount=${amount}`,
    `extraData=${extraData}`,
    `ipnUrl=${ipnUrl}`,
    `orderId=${orderId}`,
    `orderInfo=${orderInfo}`,
    `partnerCode=${partnerCode}`,
    `redirectUrl=${returnUrl}`,
    `requestId=${requestId}`,
    `requestType=${requestType}`
  ].join('&');

  const signature = createSignature(rawSignature, secretKey);

  const payload = {
    partnerCode,
    accessKey,
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl: returnUrl,
    ipnUrl,
    extraData,
    requestType,
    signature,
    lang: 'vi'
  };

  const response = await requestMoMo(endpoint, payload);

  if (response.resultCode !== 0) {
    throw new Error(`MoMo create payment error: ${response.message || response.localMessage || response.resultCode}`);
  }

  return {
    gateway: 'momo',
    amount,
    redirectUrl: response.payUrl || response.deeplink || '',
    transactionCode: orderNumber
  };
}

function verifyCore(payload) {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;

  if (!partnerCode || !accessKey || !secretKey) {
    throw new Error('MoMo environment variables are not fully configured');
  }

  const {
    orderId,
    requestId,
    amount,
    orderInfo,
    orderType,
    transId,
    resultCode,
    message,
    payType,
    responseTime,
    extraData,
    signature
  } = payload;

  const rawSignature = [
    `accessKey=${accessKey}`,
    `amount=${amount}`,
    `extraData=${extraData || ''}`,
    `message=${message}`,
    `orderId=${orderId}`,
    `orderInfo=${orderInfo}`,
    `orderType=${orderType || ''}`,
    `partnerCode=${partnerCode}`,
    `payType=${payType || ''}`,
    `requestId=${requestId}`,
    `responseTime=${responseTime}`,
    `resultCode=${resultCode}`,
    `transId=${transId}`
  ].join('&');

  const expectedSignature = createSignature(rawSignature, secretKey);
  const isValid = expectedSignature === signature;
  const isSuccess = isValid && Number(resultCode) === 0;

  return {
    success: isSuccess,
    transactionCode: orderId,
    amount: Number(amount || 0)
  };
}

async function verifyReturn(query) {
  // MoMo thường redirect với ít tham số hơn IPN, nhưng vẫn có signature/resultCode
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
