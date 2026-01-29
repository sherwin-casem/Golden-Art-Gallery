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
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  
  const [userType, setUserType] = useState<'artist' | 'collector' | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);

  useEffect(() => {
    if (isConnected && !userType) {
      // Logic to determine user type (e.g., fetching from an API or checking NFT ownership)
      setUserType('collector'); 
    } else if (!isConnected) {
      setUserType(null);
    }
  }, [isConnected]);

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