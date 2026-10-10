// Encrypts guest-names.js -> guest-names.enc.js (AES-256-GCM, PBKDF2-SHA256 key).
// Usage: node tools/encrypt-guests.js "<passphrase>"
const fs = require('fs'), c = require('crypto');
const pass = process.argv[2];
if (!pass) { console.error('Usage: node tools/encrypt-guests.js "<passphrase>"'); process.exit(1); }
const salt = c.randomBytes(16), iv = c.randomBytes(12);
const key = c.pbkdf2Sync(pass, salt, 200000, 32, 'sha256');
const ci = c.createCipheriv('aes-256-gcm', key, iv);
const enc = Buffer.concat([ci.update(fs.readFileSync('guest-names.js')), ci.final(), ci.getAuthTag()]); // WebCrypto expects tag appended
const b64 = (b) => b.toString('base64');
fs.writeFileSync('guest-names.enc.js',
  `window.GUEST_CIPHER=${JSON.stringify({ s: b64(salt), i: b64(iv), d: b64(enc) })};\n`);
console.log('Wrote guest-names.enc.js');
