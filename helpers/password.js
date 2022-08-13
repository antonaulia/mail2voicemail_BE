const crypto = require('crypto');

function hashPassword(password) {
  const iteration = 2048;
  const keylen = 32;
  const digest = 'sha512';

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, iteration, keylen, digest).toString('hex');

  return [hash, salt, iteration, keylen, digest].join('$');
}

function verifyPassword(plain, hashed) {
  const splitted = hashed.split('$');
  const realHash = splitted[0];
  const salt = splitted[1];
  const iteration = Number(splitted[2]);
  const keylen = Number(splitted[3]);
  const digest = splitted[4];

  const tempHashed = crypto.pbkdf2Sync(plain, salt, iteration, keylen, digest).toString('hex');
  return realHash === tempHashed;
}

module.exports = { hashPassword, verifyPassword };
