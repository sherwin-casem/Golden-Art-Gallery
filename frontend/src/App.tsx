import React, { useState } from 'react';
import { WalletProvider } from './lib/WalletContext';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './lib/wagmi';
import { WalletConnectModal } from './components/WalletConnectModal';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { CollectionsPage } from './pages/CollectionsPage';
import { NFTDetailPage } from './pages/NFTDetailPage';
import { MyNFTsPage } from './pages/MyNFTsPage';
import { CreateCollectionPage } from './pages/CreateCollectionPage';
import { MintNFTPage } from './pages/MintNFTPage';
import { AuctionsPage } from './pages/AuctionsPage';
import { SearchPage } from './pages/searchPage';
import './styles/globals.css';

type Page = 'home' | 'collections' | 'nft-detail' | 'collection-detail' | 'my-nfts' | 'create-collection' | 'mint-nft' | 'auctions' | 'auction-detail' |'search';

interface PageData {
  nft?: any;
  collection?: any;
  auction?: any;
  query?: string;
}

const queryClient = new QueryClient();

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [pageData, setPageData] = useState<PageData>({});
  const [pageHistory, setPageHistory] = useState<Array<{ page: Page; data: PageData }>>([]);
  
  const handleNavigate = (page: string, data?: any) => {
    // Save current page to history
    setPageHistory([...pageHistory, { page: currentPage, data: pageData }]);
    
    setCurrentPage(page as Page);
    setPageData(data || {});
  };

  const handleBack = () => {
    if (pageHistory.length > 0) {
      const previous = pageHistory[pageHistory.length - 1];
      setCurrentPage(previous.page);
      setPageData(previous.data);
      setPageHistory(pageHistory.slice(0, -1));
    } else {
      setCurrentPage('home');
      setPageData({});
    }
  };

  const handleSearch = (query: string) => {
  if (!query.trim()) return;
  handleNavigate('search', { query });
};

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <div className="min-h-screen bg-[var(--deep-black)] text-[var(--ivory)]">
            <WalletConnectModal />
            <Navbar
              onNavigate={handleNavigate}
              currentPage={currentPage}
              onSearch={handleSearch}
            />
        
        <main>
          {currentPage === 'home' && (
            <HomePage onNavigate={handleNavigate} />
          )}
          
          {currentPage === 'collections' && (
            <CollectionsPage
              onNavigate={handleNavigate}
              initialCollection={pageData.collection}
            />
          )}
                    
          
          {currentPage === 'nft-detail' && pageData.nft && (
            <NFTDetailPage
              data={pageData.nft}
              onNavigate={handleNavigate}
              onBack={handleBack}
            />
          )}
          
          {currentPage === 'my-nfts' && (
            <MyNFTsPage onNavigate={handleNavigate} />
          )}
          
          {currentPage === 'create-collection' && (
            <CreateCollectionPage onNavigate={handleNavigate} />
          )}
          
          {currentPage === 'mint-nft' && (
            <MintNFTPage onNavigate={handleNavigate} />
          )}
          
          {currentPage === 'auctions' && (
            <AuctionsPage
              onNavigate={handleNavigate}
              initialAuction={pageData.auction}
            />
          )}

          {currentPage === 'search' && pageData.query && (
            <SearchPage
              query={pageData.query}
              onNavigate={handleNavigate}
            />
          )}

                    
        </main>
      </div>
    </WalletProvider>
    </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;