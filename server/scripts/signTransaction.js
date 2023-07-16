const secp = require("ethereum-cryptography/secp256k1");
const utils = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

const args = process.argv;

let privateKey = args[3];
let hashedMessage = args[2];

function signMessage(hashedMessage, privateKey){
    const signature = secp.secp256k1.sign(hashedMessage, privateKey);
    return signature;
}

const signature = signMessage(hashedMessage, privateKey);
const hexSignature = signature.toCompactHex();

console.log(hexSignature);