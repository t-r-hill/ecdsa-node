const secp = require("ethereum-cryptography/secp256k1");
const utils = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

let keys = {};
for (let i = 0; i < 3; i++){
    let privateKey = utils.toHex(secp.secp256k1.utils.randomPrivateKey());
    let publicKey = secp.secp256k1.getPublicKey(privateKey);
    let address = `0x${utils.toHex(keccak256(publicKey.slice(1)).slice(-20))}`;
    keys[address] = privateKey;
    console.log(`${address}:${keys[address]}\n`);
}
