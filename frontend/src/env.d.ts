/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FACTORY_ADDRESS: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0;
  readonly VITE_MARKETPLACE_ADDRESS: 0x5FbDB2315678afecb367f032d93F642f64180aa3;
  readonly VITE_AUCTION_ADDRESS: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
  readonly VITE_BLINK_PROJECT_ID: string;
  readonly VITE_BLINK_PUBLISHABLE_KEY: string;
  // add other variables as needed...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}