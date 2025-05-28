import CryptoJS from 'crypto-js';

export const encryptData = (data: string, key: string) => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

export const decryptData = (encrypted: string, key: string) => {
  return CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);
};