import algosdk from "algosdk";
import { algodClient } from "../utils/index.js";
import { printAppState, printAccount } from "../utils/debug.js";

async function main() {
  // Sandbox default accounts (replace with your own if needed)
  const acctMnemonic = "impact spray twist exhibit goat merry pluck clap salad tool avoid before wait stove awful clog release staff destroy drama apology jaguar liberty absent put";
  const acct = algosdk.mnemonicToSecretKey(acctMnemonic);

  // Example: check balance
  await printAccount(acct.addr);

  // Example: ping an existing app
  const appId = 1002; // replace with your contract id
  await printAppState(appId);

  // Example: simple app call (no args)
  const sp = await algodClient.getTransactionParams().do();
  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    from: acct.addr,
    appIndex: appId,
    appArgs: [new Uint8Array(Buffer.from("hello"))], // method name
    suggestedParams: sp,
  });
  const signed = txn.signTxn(acct.sk);
  const { txId } = await algodClient.sendRawTransaction(signed).do();
  console.log("Sent txn:", txId);
  await algosdk.waitForConfirmation(algodClient, txId, 4);
}

main().catch(console.error);
