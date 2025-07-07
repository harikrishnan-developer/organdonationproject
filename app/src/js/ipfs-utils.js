// Utility to encrypt and upload match results to IPFS via Pinata
// Requires: axios, crypto-js

// Remove import statements for browser use
// import axios from 'axios';
// import CryptoJS from 'crypto-js';

const PINATA_API_KEY = '350531f9e37ca1aa769c';
const PINATA_API_SECRET = '9dcfc1c999d976e8952ba3ad5ff84f16d6dffd4613f287efe65cb883d013250e';
const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

// Encrypts data with password using AES
function encryptData(data, password) {
  const iv = CryptoJS.lib.WordArray.random(16);
  const key = CryptoJS.PBKDF2(password, CryptoJS.enc.Utf8.parse('salt'), { keySize: 256/32 });
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return {
    iv: iv.toString(CryptoJS.enc.Hex),
    data: encrypted.ciphertext.toString(CryptoJS.enc.Hex)
  };
}

// Uploads encrypted data to IPFS via Pinata
async function uploadMatchResultToIPFS(matchResult, password) {
  console.log('Uploading match result to IPFS:', matchResult); // Debug log
  const encrypted = encryptData(matchResult, password);
  try {
    const response = await axios.post(PINATA_API_URL, {
      pinataContent: encrypted
    }, {
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_API_SECRET
      }
    });
    if (response.data && response.data.IpfsHash) {
      return response.data.IpfsHash;
    } else {
      throw new Error('No IpfsHash returned from Pinata');
    }
  } catch (err) {
    throw new Error('IPFS upload failed: ' + err.message);
  }
}

// Expose for browser
window.uploadMatchResultToIPFS = uploadMatchResultToIPFS; 