import { useState } from "react";
import server from "./server";
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils";
import secp from "ethereum-cryptography/secp256k1";

function Transfer({ address, setBalance, nonce, setNonce }) {
  const [sendAmount, setSendAmount] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [signatureRecovery, setSignatureRecovery] = useState("");
  const [signature, setSignature] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  const message = {
    sender: address,
    amount: parseInt(sendAmount),
    nonce: parseInt(nonce),
    recipient
  };

  let hashedMessage = JSON.stringify(message);
  let bytes = utf8ToBytes(hashedMessage);
  let hashBytes = keccak256(bytes);
  let hexMessage = toHex(hashBytes);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const {
        data: { balance, nonce },
      } = await server.post(`send`, {
        amount: parseInt(sendAmount),
        recipient,
        signatureRecovery,
        hexMessage,
        signature
      });
      setBalance(balance);
      setNonce(nonce);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <div className="container transfer">
      <form onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <div className="balance">Message hash: {hexMessage}</div>

      <label>
        Signature: recovery
        <input
          placeholder="Enter signed message using below 'Message hash'"
          value={signatureRecovery}
          onChange={setValue(setSignatureRecovery)}
        ></input>
      </label>

      <label>
        Signature:
        <input
          placeholder="Enter signed message using below 'Message hash'"
          value={signature}
          onChange={setValue(setSignature)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
    </div>
      
  );
}

export default Transfer;
