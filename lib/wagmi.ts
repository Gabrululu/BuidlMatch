import { createConfig, http, injected } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";

export const wagmiConfig = createConfig({
  chains: [baseSepolia, base],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC),
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_MAINNET_RPC),
  },
  connectors: [injected()],
});
