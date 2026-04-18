export const REGISTRY_ABI = [
  {
    name: "register",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "fid", type: "uint256" },
      { name: "username", type: "string" },
      { name: "bio", type: "string" },
      { name: "skills", type: "string[]" },
      { name: "wallet", type: "address" },
    ],
    outputs: [],
  },
  {
    name: "publishProject",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "ownerFid", type: "uint256" },
      { name: "title", type: "string" },
      { name: "metadataUri", type: "string" },
    ],
    outputs: [{ name: "projectId", type: "uint256" }],
  },
  {
    name: "isRegistered",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "fid", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export function registryAddress(): `0x${string}` {
  const addr =
    process.env.NEXT_PUBLIC_CHAIN === "mainnet"
      ? process.env.NEXT_PUBLIC_REGISTRY_ADDRESS_MAINNET
      : process.env.NEXT_PUBLIC_REGISTRY_ADDRESS_SEPOLIA;

  return (addr ?? "0x0000000000000000000000000000000000000000") as `0x${string}`;
}
