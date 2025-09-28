import algosdk from "algosdk";

export const algodClient = new algosdk.Algodv2(
  process.env.ALGOD_TOKEN || "",
  process.env.ALGOD_SERVER || "https://testnet-api.algonode.cloud",
  process.env.ALGOD_PORT ? Number(process.env.ALGOD_PORT) : undefined
);
