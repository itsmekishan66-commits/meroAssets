const CryptoJS = require('crypto-js');

const encryptPassword = (plainText, key) => {
  return CryptoJS.AES.encrypt(plainText, key).toString();
};

const decryptPassword = (cipherText, key) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = { encryptPassword, decryptPassword };
