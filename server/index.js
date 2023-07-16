const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes, toHex } = require("ethereum-cryptography/utils");
const secp = require("ethereum-cryptography/secp256k1");

app.use(cors());
app.use(express.json());

const balances = {
  "0x115879db969c55f0f8faa7072e55f0c0352976da": 100, // 8aee90298356d4c775cea5136e08a5d557547d6d59b72e045ac317aaeadd4160
  "0x6b20f006e19ec601df36a315706051b5bd25f1a8": 50, // 699d2eaab1072c151d79932e0240ba7bc8a80bdb8b42fbed1fdada2497719f80
  "0x5c6824a4d97d1bae94cb1aa3dea8a5a9c4ae768b": 75, // 80cb864194b915b92b4102ac42e4a524e2af41c8e31b3a0072bb94a2cd70c6a9
};

const nonces = {
  "0x115879db969c55f0f8faa7072e55f0c0352976da": 0,
  "0x6b20f006e19ec601df36a315706051b5bd25f1a8": 0,
  "0x5c6824a4d97d1bae94cb1aa3dea8a5a9c4ae768b": 0,
}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  const nonce = nonces[address] || 0;
  res.send({ balance, nonce });
});

app.post("/send", (req, res) => {
  const { amount, recipient, signatureRecovery, hexMessage, signature } = req.body;

  let sig = secp.secp256k1.Signature.fromCompact(signature);
  sig = sig.addRecoveryBit(parseInt(signatureRecovery));
  let sender = sig.recoverPublicKey(hexMessage).toRawBytes();
  let senderAddress = `0x${toHex(keccak256(sender.slice(1)).slice(-20))}`;

  setInitialBalance(senderAddress);
  setInitialBalance(recipient);

  setInitialNonce(senderAddress);
  setInitialNonce(recipient);

  if(secp.secp256k1.verify(sig, hexMessage, sender)){
    if (balances[senderAddress] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[senderAddress] -= amount;
      balances[recipient] += amount;
      nonces[senderAddress] += 1;
      res.send({ balance: balances[senderAddress], nonce: nonces[senderAddress]});
    }
  } else {
    res.status(400).send({ message: "Signature not valid for transaction"})
  }

  
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function setInitialNonce(address) {
  if (!nonces[address]) {
    nonces[address] = 0;
  }
}
