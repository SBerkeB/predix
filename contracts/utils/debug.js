import { algodClient } from "./index.js";

export async function printAppState(appId) {
  const appInfo = await algodClient.getApplicationByID(appId).do();
  console.log("Global State:");
  for (let kv of appInfo.params["global-state"] || []) {
    const key = Buffer.from(kv.key, "base64").toString();
    const val = kv.value;
    console.log(`  ${key}:`, val);
  }
}

export async function printAccount(addr) {
  const acc = await algodClient.accountInformation(addr).do();
  console.log(`Account ${addr} → Balance: ${acc.amount} microAlgos`);
}
