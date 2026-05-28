# Golden-Art-Gallery

Luxury NFT art marketplace (frontend + Ethereum smart contracts).

This repository contains:
- a **Vite + React** frontend app in `frontend/`
- **Hardhat** smart contracts in `contracts/` (NFT collection factory, marketplace, and auctions)

## Project structure

- **`frontend/`**: UI application (Vite/React, wagmi, ethers, Tailwind-style UI components)
- **`contracts/`**: Solidity contracts + Hardhat config/tests
  - `contracts/contracts/`: Solidity sources
  - `contracts/test/`: Hardhat tests
  - `contracts/artifacts/`: compiled ABIs (the frontend imports ABIs from here)

## Tech stack

- **Frontend**: React 18, Vite, `ethers`, `wagmi`, `@tanstack/react-query`, Radix UI components
- **Contracts**: Solidity `0.8.20`, Hardhat, OpenZeppelin
- **Storage (optional)**: Pinata IPFS uploads (proxied through the Vite dev server)

## Prerequisites

- Node.js (LTS recommended) and npm
- A wallet extension (MetaMask) for interacting with the dApp

For contracts development/deployment:
- Node.js + npm
- An RPC provider (e.g. Infura) if deploying to Sepolia

## Quick start (frontend)

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Environment variables

### Frontend (`frontend/.env`)

The frontend uses Vite environment variables:

- **`VITE_PINATA_API_KEY`**: Pinata API key (used by `frontend/src/utils/pinata.ts`)
- **`VITE_PINATA_SECRET`**: Pinata secret key
- **`VITE_FACTORY_ADDRESS`**: Deployed `CollectionFactory` contract address (used by `frontend/src/utils/contracts.js`)
- **`VITE_MARKETPLACE_ADDRESS`**: Deployed marketplace contract address
- **`VITE_AUCTION_ADDRESS`**: Deployed auction contract address

Notes:
- The dev server proxies Pinata calls through `/pinata-api` to `https://api.pinata.cloud` (see `frontend/vite.config.ts`).
- Keep secrets out of git. Prefer using a local-only file (for example `.env.local`) and/or rotating keys if they were committed.

### Contracts (`contracts/.env`)

`contracts/hardhat.config.js` loads `contracts/.env` and uses these variables for Sepolia:

- **`INFURA_KEY`**: Infura project key
- **`PRIVATE_KEY`**: Deployer private key (never commit this)

Example:

```bash
INFURA_KEY=...
PRIVATE_KEY=0x...
```

## Smart contracts

### What’s included

- **`GalleryNFT.sol`**: ERC-721 collection with per-token artist royalties (ERC-2981) and a mint fee
- **`collectionFactory.sol`**: deploys new `GalleryNFT` collections with fixed royalty (5%) and fixed mint fee (0.0001 ETH)
- **`GalleryMarketplace.sol`**: fixed-price listings with escrow + marketplace fee + ERC-2981 royalties
- **`Auction.sol`** (`GalleryAuction`): auction escrow + bids + settlement, marketplace fee, and ERC-2981 royalties

### Common Hardhat commands

From the `contracts/` directory:

```bash
cd contracts
npm install

# compile
npx hardhat compile

# run tests
npx hardhat test

# start local chain
npx hardhat node
```

Deploy (example shown in `contracts/README.md` for Ignition):

```bash
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

After deployment, copy the deployed addresses into `frontend/.env` (the app reads them via `import.meta.env.*`).

## Design / UI source

The initial UI bundle references a Figma design in `frontend/README.md`.

## Additional docs

- `frontend/README.md`: frontend bundle notes and how to run the UI
- `contracts/README.md`: Hardhat sample project notes
