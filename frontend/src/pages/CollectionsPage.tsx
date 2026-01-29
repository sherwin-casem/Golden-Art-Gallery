import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CollectionCard } from '../components/CollectionCard';
import { NFTCard } from '../components/NFTCard';
import { ArrowLeft } from 'lucide-react';
import { ethers } from 'ethers';
import FactoryABI from '../abis/CollectionFactory.json';
import GalleryABI from '../abis/GalleryNFT.json';

export interface Collection {
  address: string;
  name: string;
  description: string;
  coverImage: string;
  nftCount: number;
  floorPrice: number;
  artistName: string;
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

  useEffect(() => {
    loadCollections();
  }, []);

  async function loadCollections() {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const factory = new ethers.Contract(
        (import.meta as any).env.VITE_FACTORY_ADDRESS,
        FactoryABI.abi,
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

          return {
            id: addr, // Mapping address to id for component keys
            address: addr,
            name: name || meta.name,
            description: meta.description || '',
            coverImage: meta.banner ? ipfs(meta.banner)! : '',
            nftCount: meta.nftCount || 0,
            floorPrice: meta.floorPrice || 0,
            artistName: meta.artistName || 'Verified Artist',
            artistId: meta.artistId || addr, 
            createdAt: meta.createdAt || new Date().toISOString(),
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
                      {(selectedCollection.floorPrice * selectedCollection.nftCount).toFixed(1)} ETH
                    </p>
                  </div>
                </div>
                <p className="text-sm text-[var(--gold)]">
                  Curated by {selectedCollection.artistName}
                </p>
              </div>
            </div>
          </motion.div>         
          
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
