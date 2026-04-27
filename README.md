# BuidlMatch

Platform for Latino Web3/Farcaster builders. Matches projects with co-builders using AI and an onchain registry on Base.

---

## What is it

BuidlMatch has two integrated products:

**Co-Builder (Farcaster Miniapp)**
Describe your project idea, select the skills you need, and four Gemini agents generate a complete plan via streaming: design/product, smart contracts, frontend, and go-to-market. When done, the app suggests matching builders from the registry and lets you publish the project onchain.

**Snap (Farcaster Frame)**
A frame to discover builders at random. Users spin, see a builder's profile (username, bio, skills), follow them on Warpcast, or send them a USDC tip directly from the frame via an onchain transaction.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styles | Tailwind CSS + shadcn/ui |
| AI | Google Gemini (`gemini-2.0-flash`) |
| Database | Neon (PostgreSQL serverless) |
| Blockchain | Base Sepolia / Base Mainnet |
| Web3 | wagmi v3 + viem v2 |
| Farcaster | `@farcaster/miniapp-sdk` |
| Contracts | Foundry |

---

## Architecture

```
app/
  (miniapp)/         # Farcaster miniapp UI
  api/
    agents/plan/     # SSE endpoint: runs 4 Gemini agents in series
    registry/        # REST: reads builders and projects from Neon
    snap/            # Farcaster Frame: image, action (spin/tip), tx
  .well-known/       # Farcaster manifest
agents/
  prompts.ts         # System prompts for each agent (design, contracts, frontend, gtm)
components/
  co-builder/        # Form, plan tabs, builder suggestions, publish button
  ui/                # shadcn components
lib/
  contracts.ts       # BuilderRegistry ABI and address resolver
  db.ts              # Neon client and shared types
  types.ts           # Shared types (AgentKey, Skill, etc.)
  wagmi.ts           # wagmi config
db/
  schema.sql         # builders and projects tables + dev seed data
contracts/           # Foundry project with BuilderRegistry
```

### Co-Builder flow

1. The user enters their idea and selects required skills.
2. The frontend sends `POST /api/agents/plan` with the idea and skills.
3. The server runs 4 Gemini agents in series, emitting SSE events (`agent_start`, `agent_chunk`, `agent_done`, `done`).
4. The client renders each section of the plan in real time as chunks arrive.
5. On completion, `GET /api/registry/builders` filters builders by skill overlap.
6. The "Publish" button calls `publishProject` on the `BuilderRegistry` contract.

### Snap (Frame) flow

1. `GET /api/snap` delivers the initial frame with a "Spin" button.
2. `POST /api/snap/action` picks a random builder from Neon and returns the frame with an image, a follow button (link), and a tip button (tx).
3. `GET /api/snap/image` generates the frame image with the builder's data via JSX/OG.
4. `GET /api/snap/tx` returns the USDC transaction data for the tip.

---

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key |
| `DATABASE_URL` | Neon connection string |
| `NEYNAR_API_KEY` | Neynar API key (Farcaster) |
| `NEXT_PUBLIC_BASE_SEPOLIA_RPC` | Base Sepolia RPC URL |
| `NEXT_PUBLIC_BASE_MAINNET_RPC` | Base Mainnet RPC URL |
| `NEXT_PUBLIC_REGISTRY_ADDRESS_SEPOLIA` | Contract address on Sepolia |
| `NEXT_PUBLIC_REGISTRY_ADDRESS_MAINNET` | Contract address on Mainnet |
| `NEXT_PUBLIC_APP_URL` | Public URL of the app |
| `NEXT_PUBLIC_CHAIN` | `sepolia` or `mainnet` |
| `FARCASTER_MANIFEST_HEADER` | Signed manifest header |
| `FARCASTER_MANIFEST_PAYLOAD` | Signed manifest payload |
| `FARCASTER_MANIFEST_SIGNATURE` | Manifest signature |

### 3. Database

Run the schema in the Neon SQL Editor (neon.tech → your project → SQL Editor):

```bash
# Creates tables + loads dev seed data
db/schema.sql
```

### 4. Development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Smart Contracts

The project uses Foundry. The main contract is `BuilderRegistry`, which exposes:

| Function | Description |
|---|---|
| `register(fid, username, bio, skills, wallet)` | Registers a builder onchain |
| `publishProject(ownerFid, title, metadataUri)` | Publishes a project and returns its `projectId` |
| `isRegistered(fid)` | Checks whether a FID is registered |

### Foundry commands

```bash
cd contracts

# Compile
forge build

# Test
forge test

# Deploy
forge script script/<Script>.s.sol --rpc-url <rpc_url> --private-key <key>
```

---

## Farcaster Manifest

To register the app as a Farcaster miniapp, sign the manifest with:

```bash
npx @farcaster/create-miniapp sign-manifest --domain your-app.vercel.app
```

Copy `header`, `payload`, and `signature` into the corresponding environment variables.

---

## Available scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # Linter
```

---

## Deploy

The fastest way is Vercel. Make sure to set all environment variables in the Vercel dashboard before deploying.

```bash
vercel --prod
```
