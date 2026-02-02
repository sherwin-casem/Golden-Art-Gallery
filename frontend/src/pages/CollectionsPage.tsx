import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CollectionCard } from '../components/CollectionCard';
import { NFTCard } from '../components/NFTCard';
import { ArrowLeft, Plus } from 'lucide-react';
import { ethers } from 'ethers';

import FactoryABI from '../abis/CollectionFactory.json';
import GalleryABI from '../abis/GalleryNFT.json';
import MarketplaceABI from '../abis/GalleryMarketplace.json'
export interface Collection {
  address: string;
  name: string;
  description: string;
  coverImage: string;
  nftCount: number;
  floorPrice: number;
  artistName: string;
  volume: number;
}

interface CollectionsPageProps {
  onNavigate: (page: string, data?: any) => void;
  initialCollection?: Collection;
}

const ipfs = (u: string) => u?.replace('ipfs://', 'https://ipfs.io/ipfs/');

export function CollectionsPage({ onNavigate, initialCollection }: CollectionsPageProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<any | null>(
    initialCollection || null
  );
  const [collectionNFTs, setCollectionNFTs] = useState<any[]>([]);
  const [loadingNFTs, setLoadingNFTs] = useState(false);

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      loadCollectionNFTs(selectedCollection.address);
    }
  }, [selectedCollection]);

  async function loadCollectionNFTs(addr: string) {
    try {
      setLoadingNFTs(true)

      const provider = new ethers.BrowserProvider(
        (window as any).ethereum
      )

      const nftContract = new ethers.Contract(
        addr,
        GalleryABI.abi,
        provider
      )

      const market = new ethers.Contract(
        (import.meta as any).env.VITE_MARKETPLACE_ADDRESS,
        MarketplaceABI.abi,
        provider
      )

      let total: bigint
      try {
        total = await nftContract.tokenCounter()
      } catch {
        console.warn('tokenCounter not found for collection', addr)
        return
      }

      const nfts: any[] = []

      for (let tokenId = 1; tokenId <= Number(total); tokenId++) {
        try {
          // 🔹 get listing info
          const listing = await market.listings(addr, tokenId)

          // 🔴 PUBLIC COLLECTION → only listed NFTs
          if (listing.price === 0n) continue

          const uri = await nftContract.tokenURI(tokenId)
          const meta = await fetch(ipfs(uri)).then(r => r.json())

          nfts.push({
            id: `${addr}-${tokenId}`,
            tokenId,
            collection: addr,
            name: meta.name || `Artwork #${tokenId}`,
            image: meta.image ? ipfs(meta.image) : '',
            description: meta.description || '',
            price: Number(ethers.formatEther(listing.price)),
            isListed: true,
          })
        } catch (err) {
          console.warn(`Failed to load token ${tokenId}`, err)
        }
      }

      setCollectionNFTs(nfts)
    } catch (err) {
      console.error('Error loading collection NFTs', err)
    } finally {
      setLoadingNFTs(false)
    }
  }



  async function loadCollections() {
    try {
      setLoading(true);
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

      const data = await Promise.all(
        addresses.map(async (addr) => {
          const disabled = await factory.disabledCollections(addr);
          if (disabled) return null;

          const nftContract = new ethers.Contract(addr, GalleryABI.abi, provider);
          // Fetch name and the URI containing our Pinata metadata
          const [name, uri] = await Promise.all([
            nftContract.name(), 
            nftContract.collectionURI()
          ]);

          let meta: any = {};
          if (uri) {
            try {
              // Convert ipfs:// to gateway URL and fetch
              meta = await fetch(ipfs(uri)).then((r) => r.json());
            } catch (err) {
              console.error("Metadata fetch error for", addr, err);
            }
          }

          const total = Number(await nftContract.tokenCounter());

          let floorPrice = Infinity;
          let listedCount = 0;
          let volume = 0;

          for (let tokenId = 1; tokenId <= total; tokenId++) {
            const listing = await market.listings(addr, tokenId);

            if (listing.price > 0n) {
              listedCount++;

              const price = Number(
                ethers.formatEther(listing.price)
              );

              volume += price;

              if (price < floorPrice) {
                floorPrice = price;
              }
            }
          }

          return {
            address: addr,
            name: name || meta.name,
            description: meta.description || '',
            coverImage: meta.banner ? ipfs(meta.banner) : '',
            nftCount: listedCount, // only listed NFTs
            floorPrice: floorPrice === Infinity ? 0 : floorPrice, //  live floor
            artistName: meta.artistName,
            volume: volume,
          };
        })
      );

      setCollections(data.filter(Boolean) as Collection[]);
    } catch (err) {
      console.error('Collections load failed:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading exhibitions…
      </div>
    );
  }

  if (!loading && collections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        No exhibitions available
      </div>
    );
  }


  if (selectedCollection) {

    return (
      <div
        className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 vignette"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1766128867459-064fcbfa8781?w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 backdrop-blur-sm bg-black/50" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setSelectedCollection(null)}
            className="flex items-center gap-2 text-[var(--gold)] hover:text-[var(--antique-brass)] mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Collections
          </motion.button>

          {/* Collection Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="museum-frame p-8 mb-12"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="relative aspect-video rounded overflow-hidden">
                <img
                  src={selectedCollection.coverImage}
                  alt={selectedCollection.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="golden-underline inline-block mb-4 text-[var(--ivory)]">
                  {selectedCollection.name}
                </h2>
                <p className="text-[var(--champagne)] mb-6">
                  {selectedCollection.description}
                </p>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Items</p>
                    <p className="text-xl text-[var(--ivory)]">{selectedCollection.nftCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Floor Price</p>
                    <p className="text-xl text-[var(--gold)]">{selectedCollection.floorPrice} ETH</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Volume</p>
                    <p className="text-xl text-[var(--ivory)]">
                      {selectedCollection.volume} ETH
                    </p>
                  </div>
                </div>
                <p className="text-sm text-[var(--gold)]">
                  Curated by {selectedCollection.artistName}
                </p>
              </div>
            </div>
          </motion.div>    

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {collectionNFTs.map((nft, index) => (
            <NFTCard
              key={nft.id}
              nft={{
                id: nft.id,
                image: nft.image,
                name: nft.name,
                price: nft.price,
                isListed: nft.isListed,
                artist: selectedCollection.artistName,
                collectionName: selectedCollection.name,
              }}
              index={index}
              onClick={() =>
                onNavigate('nft-detail', {
                  nft: {
                    collection: nft.collection,
                    tokenId: nft.tokenId,
                  }                  
                })
              }
            />
          ))}
        </div>     
          
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 vignette"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1766128867459-064fcbfa8781?w=1920)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 backdrop-blur-sm bg-black/50" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="absolute -top-4 right-0 z-20">
          <button
            onClick={() => onNavigate('create-collection')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--gold)] to-[var(--antique-brass)] text-[var(--deep-black)] rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[var(--gold)]/20"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Create Collection</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="mb-4 text-[var(--ivory)]">Exhibition Halls</h1>
          <p className="text-xl text-[var(--champagne)] max-w-2xl mx-auto">
            Explore curated collections from the world's finest digital artists
          </p>
        </motion.div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection, index) => (
            <CollectionCard
              key={collection.address}
              collection={collection}
              coverImage={collection.coverImage}
              onClick={() => setSelectedCollection(collection)}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
