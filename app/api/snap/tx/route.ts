import { NextRequest, NextResponse } from "next/server";

// USDC on Base Sepolia / Mainnet
const USDC: Record<string, `0x${string}`> = {
  sepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  mainnet: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};

// ERC-20 transfer(address,uint256) selector
const TRANSFER_SELECTOR = "0xa9059cbb";

function encodeTransfer(to: string, amountUsdc: number): string {
  const paddedTo = to.replace("0x", "").padStart(64, "0");
  const units = BigInt(Math.round(amountUsdc * 1_000_000)); // USDC = 6 decimals
  const paddedAmount = units.toString(16).padStart(64, "0");
  return TRANSFER_SELECTOR + paddedTo + paddedAmount;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet") ?? "";
  const amount = parseFloat(searchParams.get("amount") ?? "1");
  const chain = process.env.NEXT_PUBLIC_CHAIN ?? "sepolia";

  if (!wallet.startsWith("0x")) {
    return NextResponse.json({ error: "invalid wallet" }, { status: 400 });
  }

  const usdcAddress = USDC[chain] ?? USDC.sepolia;
  const calldata = encodeTransfer(wallet, amount);

  // Frame tx response spec: https://docs.farcaster.xyz/developers/frames/v2/spec#tx-action
  return NextResponse.json({
    chainId: chain === "mainnet" ? "eip155:8453" : "eip155:84532",
    method: "eth_sendTransaction",
    params: {
      abi: [],
      to: usdcAddress,
      data: calldata,
      value: "0",
    },
  });
}
