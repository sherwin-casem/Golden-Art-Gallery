import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  userType: 'artist' | 'collector' | null;
  connect: () => void;
  disconnect: () => void;
  showConnectModal: boolean;
  setShowConnectModal: (show: boolean) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected, status } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  
  const [userType, setUserType] = useState<'artist' | 'collector' | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);

  const [mounted, setMounted] = useState(false); 

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
     if (mounted && isConnected && status === 'connected' && !userType) {
      setUserType('collector'); 
    } else if (!isConnected) {
      setUserType(null);
    }
  }, [isConnected, status, mounted]);

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address: address ?? null,
        userType,
        connect: handleConnect,
        disconnect: () => disconnect(),
        showConnectModal,
        setShowConnectModal,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}