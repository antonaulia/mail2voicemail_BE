const fs = require('fs');

function readKey(filename) {
  return fs.readFileSync(`${__dirname}/../secrets/${filename}`, 'utf-8');
}

module.exports = {
  privateKey: readKey(process.env.PRIVATE_KEY),
  publicKey: readKey(process.env.PUBLIC_KEY),
};
