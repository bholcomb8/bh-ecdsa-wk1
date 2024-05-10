const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

const privateKey = secp256k1.utils.randomPrivateKey();
console.log('private key', toHex(privateKey));

const publicKey = secp256k1.getPublicKey(privateKey);
slice1 = publicKey.slice(1);
hash = keccak256(slice1);

console.log('public key', toHex(hash.slice(-20)));



