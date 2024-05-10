const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  "d32cbada7edabaf5d9d594d8c7bcb3a9c79e3627": 100,
  "80eb212d2e2f2cb9093b52fb6c072f4bbe12b507": 50,
  "87a8e2011b0a05b8829017177d713c594b0c27d3": 75,
};
const privkeys = {
  "d32cbada7edabaf5d9d594d8c7bcb3a9c79e3627": "5878fa207d092e957990b98e6c7ae2ff6fdd69e05ad69ce64099859006c59bcb",
  "80eb212d2e2f2cb9093b52fb6c072f4bbe12b507": "e653838aa613459f0442a05cccc8fdc8b0365a3c808274106c0a572b6a9c1f73",
  "87a8e2011b0a05b8829017177d713c594b0c27d3": "2e2797432e14d55c532a533d94ce3f3dc74df70fa2992d15ad8117d4ed575158",
}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount } = req.body;
  const transaction = req.body.toString();
  const txnHash = hashMessage(transaction);
  
  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  }
  if (privkeys[sender]) {
      signature = signMessage(transaction, privkeys[sender]);
  } else {
    res.status(400).send({ message: "Invalid Address"});
  }
  
  const publicKey = secp256k1.getPublicKey(privkeys[sender]);
  const publKey = getAddress(publicKey);
  //console.log('public address:', toHex(publKey));
  //console.log('public key:', publicKey);
  //console.log('sender:', sender);

  const isSigned = secp256k1.verify(signature, txnHash, publicKey);

  if (isSigned && sender == toHex(publKey)) {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  } else {
    res.status(400).send({ message: "Valid signature required to send funds!"});
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

function hashMessage(mess) {
  const bytes = utf8ToBytes(mess);
  return keccak256(bytes);
}

function signMessage(msg, PRIVATE_KEY) {
  const hasha = hashMessage(msg);
  const sig = secp256k1.sign(hasha, PRIVATE_KEY, {Recovered:true});
  return sig;
}

function getAddress(pubKey) {
  const sliceKey = pubKey.slice(1);
  const hashKey = keccak256(sliceKey);
  return hashKey.slice(-20);
}
