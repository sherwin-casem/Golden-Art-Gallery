import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, X } from 'lucide-react';
import { useWallet } from '../lib/WalletContext';

export function WalletConnectModal() {
  const { showConnectModal, setShowConnectModal, connect } = useWallet();

  const handleConnect = async () => {
    await connect();
  };

  return (
    <AnimatePresence>
      {showConnectModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          onClick={() => setShowConnectModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md museum-frame p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowConnectModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--antique-brass)] mb-6 animate-glow">
                <Wallet className="w-10 h-10 text-[var(--deep-black)]" />
              </div>
              <h2 className="mb-3">Welcome to the Gallery</h2>
              <p className="text-muted-foreground">
                Connect your wallet to enter the world's most prestigious digital art marketplace
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleConnect}
                className="w-full py-4 px-6 bg-gradient-to-r from-[var(--gold)] to-[var(--antique-brass)] text-[var(--deep-black)] rounded hover-lift flex items-center justify-center gap-3 transition-all duration-400"
              >
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet</span>
              </button>

              <p className="text-xs text-center text-muted-foreground">
                By connecting, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                New to Web3?{' '}
                <a href="#" className="text-[var(--gold)] hover:underline">
                  Learn how to get started
                </a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
