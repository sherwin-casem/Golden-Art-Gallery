import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Gavel } from 'lucide-react';
import { ethers } from 'ethers';
import { NFTCard } from '../components/NFTCard';
import { CollectionCard } from '../components/CollectionCard';
import { useWallet } from '../lib/WalletContext';

// ABIs
import FactoryABI from '../abis/CollectionFactory.json';
import MarketplaceABI from '../abis/GalleryMarketplace.json';
import GalleryABI from '../abis/GalleryNFT.json';

const ipfs = (uri: string) => uri?.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') || '';

interface HomePageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { isConnected, connect } = useWallet();
  const [featuredNFTs, setFeaturedNFTs] = useState<any[]>([]);
  const [featuredCollections, setFeaturedCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedContent();
  }, []);

  async function loadFeaturedContent() {
    try {
      setLoading(true);
      if (!(window as any).ethereum) return;
      
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const factory = new ethers.Contract(
        (import.meta as any).env.VITE_FACTORY_ADDRESS,
        FactoryABI.abi,
        provider
      );
      const market = new ethers.Contract(
        (import.meta as any).env.VITE_MARKETPLACE_ADDRESS,
        MarketplaceABI.abi,
        provider
      );

      const addresses: string[] = await factory.getAllCollections();
      
      // Load first 3 collections
      const collectionsData = await Promise.all(
        addresses.slice(0, 3).map(async (addr) => {
          const nftContract = new ethers.Contract(addr, GalleryABI.abi, provider);
          const [name, uri] = await Promise.all([nftContract.name(), nftContract.collectionURI()]);
          let meta: any = {};
          if (uri) {
            try { meta = await fetch(ipfs(uri)).then(r => r.json()); } catch {}
          }
          return {
            id: addr,
            address: addr,
            name: name || meta.name,
            artistName: meta.artistName || 'Unknown',
            coverImage: meta.banner ? ipfs(meta.banner) : 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
            description: meta.description,
            nftCount: Number(await nftContract.tokenCounter()),
            floorPrice: '0.1', // Simplified for home page
            volume: '1.2'
          };
        })
      );
      setFeaturedCollections(collectionsData);

      // Load some listed NFTs from the first collection for "Featured"
      if (addresses.length > 0) {
        const firstAddr = addresses[0];
        const nftContract = new ethers.Contract(firstAddr, GalleryABI.abi, provider);
        const total = Math.min(Number(await nftContract.tokenCounter()), 4);
        const nfts = [];

        for (let i = 1; i <= total; i++) {
          const listing = await market.listings(firstAddr, i);
          if (listing.price > 0n) {
            const uri = await nftContract.tokenURI(i);
            const meta = await fetch(ipfs(uri)).then(r => r.json());
            nfts.push({
              id: `${firstAddr}-${i}`,
              collection: firstAddr,
              tokenId: i,
              name: meta.name,
              image: ipfs(meta.image),
              artist: meta.attributes?.[0]?.value || 'Unknown',
              price: ethers.formatEther(listing.price),
              collectionName: collectionsData[0]?.name || 'Collection',
              isListed: true
            });
          }
        }
        setFeaturedNFTs(nfts);
      }
    } catch (err) {
      console.error("Failed to load home page content", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center vignette overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1718359760007-4b11d377689c?w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 backdrop-blur-sm bg-black/40" />
        
        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[var(--gold)] rounded-full"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--gold)]/20 backdrop-blur border border-[var(--gold)]/30 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-[var(--gold)]" />
              <span className="text-sm text-[var(--gold)]">Curated Digital Art Archive</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-6xl md:text-7xl mb-6 text-[var(--ivory)] font-serif"
          >
            A New Era of
            <br />
            <span className="golden-underline text-[var(--gold)]">Digital Sovereignty</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl text-[var(--champagne)] mb-12 max-w-2xl mx-auto opacity-80"
          >
            Experience the world's most prestigious digital art marketplace. Where timeless elegance meets blockchain innovation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex items-center justify-center gap-4"
          >
            <button
              onClick={() => onNavigate('collections')}
              className="px-8 py-4 bg-gradient-to-r from-[var(--gold)] to-[var(--antique-brass)] text-[var(--deep-black)] rounded hover-lift flex items-center gap-3 transition-all font-bold"
            >
              <span>Enter Gallery</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('auctions')}
              className="px-8 py-4 border-2 border-[var(--gold)] text-[var(--gold)] rounded hover-glow transition-all flex items-center gap-2"
            >
              <Gavel className="w-5 h-5" />
              Live Auctions
            </button>
          </motion.div>
        </div>
      </section>

      {/* Featured Artworks Section */}
      {featuredNFTs.length > 0 && (
        <section className="relative py-24 px-4 bg-[var(--deep-black)]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="mb-4 text-[var(--ivory)]">Featured Acquisitions</h2>
              <p className="text-[var(--champagne)] opacity-60">Hand-picked masterpieces from our verified collections</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredNFTs.map((nft, index) => (
                <NFTCard
                  key={nft.id}
                  nft={nft}
                  onClick={() => onNavigate('nft-detail', { nft: nft })}
                  index={index}
                />  
              ))}
            </div>  
          </div>
        </section>
      )}

      {/* Curated Collections Section */}
      <section className="relative py-24 px-4 bg-black/40"
	style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1746270084016-89dc78f6e63c?w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
	>
	<div className="absolute inset-0 backdrop-blur-md bg-black/60" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-[var(--ivory)]">Exhibition Halls</h2>
            <p className="text-[var(--champagne)] opacity-60">Thematic galleries curated by world-renowned artists</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCollections.map((collection, index) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                coverImage={collection.coverImage}
                index={index}
                onClick={() =>  onNavigate('collections', { collection })}  />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 bg-gradient-to-b from-transparent to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-6 text-[var(--ivory)] font-serif">Begin Your Legacy</h2>
          <p className="text-xl text-[var(--champagne)] mb-12 opacity-80">
            Join a global community of elite collectors and visionary digital artists.
          </p>
          <div className="flex items-center justify-center gap-4">
            {!isConnected ? (
              <button
                onClick={connect}
                className="px-8 py-4 bg-[var(--gold)] text-[var(--deep-black)] rounded-full font-bold hover:scale-105 transition-transform"
              >
                Connect Wallet
              </button>
            ) : (
              <button
                onClick={() => onNavigate('mint-nft')}
                className="px-8 py-4 bg-[var(--gold)] text-[var(--deep-black)] rounded-full font-bold hover:scale-105 transition-transform"
              >
                Mint Artwork
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}