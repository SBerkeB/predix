import algosdk from "algosdk";
import fs from "fs";
import { algodClient } from "./utils/index.js"; // from earlier

async function deployApp() {
  // Load compiled TEAL bytecode
  const approval = new Uint8Array(fs.readFileSync("./approval.tealc"));
  const clear = new Uint8Array(fs.readFileSync("./clear.tealc"));

  // Replace with Sandbox account (export private key from `goal account export`)
  const sk = algosdk.mnemonicToSecretKey("<25-word-mnemonic>");

  const params = await algodClient.getTransactionParams().do();

  const txn = algosdk.makeApplicationCreateTxnFromObject({
    sender: sk.addr,
    approvalProgram: approval,
    clearProgram: clear,
    numGlobalInts: 1,
    numGlobalByteSlices: 1,
    numLocalInts: 0,
    numLocalByteSlices: 0,
    suggestedParams: params,
    onComplete: algosdk.OnApplicationComplete.NoOpOC
  });

  const signed = txn.signTxn(sk.sk);
  const { txid } = await algodClient.sendRawTransaction(signed).do();
  const result = await algosdk.waitForConfirmation(algodClient, txid, 4);

  console.log("App deployed with ID:", result["applicationIndex"]);
}

deployApp().catch(console.error);
