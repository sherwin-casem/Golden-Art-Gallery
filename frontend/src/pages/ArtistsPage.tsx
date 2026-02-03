import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArtistCard, Artist } from '../components/ArtistCard'; // Import Artist type
import { NFTCard } from '../components/NFTCard';
import { ethers } from 'ethers';
import { ArrowLeft, Award, Loader2 } from 'lucide-react';
import { useWallet } from '../lib/WalletContext';

import FactoryABI from '../abis/CollectionFactory.json';
import GalleryABI from '../abis/GalleryNFT.json';

const ipfs = (uri: string) => uri?.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') || '';

interface ArtistsPageProps {
  onNavigate: (page: string, data?: any) => void;
  initialArtist?: Artist;
}

export function ArtistsPage({ onNavigate, initialArtist }: ArtistsPageProps) {
  // Use local state for the list and the selection
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(initialArtist || null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistNFTs, setArtistNFTs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { address } = useWallet();

  useEffect(() => {
    loadArtists();
  }, []);

  // Separate effect to load works when selection changes
  useEffect(() => {
    if (selectedArtist) {
      loadArtistWorks(selectedArtist);
    } else {
      setArtistNFTs([]); // Clear works when going back
    }
  }, [selectedArtist]);

  async function loadArtists() {
    try {
      setLoading(true);
      if (!(window as any).ethereum) return;
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const factory = new ethers.Contract(
        (import.meta as any).env.VITE_FACTORY_ADDRESS,
        FactoryABI.abi,
        provider
      );

      const collections: string[] = await factory.getAllCollections();
      const artistMap = new Map<string, Artist>();

      for (const collAddr of collections) {
        const nft = new ethers.Contract(collAddr, GalleryABI.abi, provider);
        const [owner, count, uri] = await Promise.all([
          nft.owner(),
          nft.tokenCounter(),
          nft.collectionURI()
        ]);

        const ownerAddr = owner.toLowerCase();

        if (!artistMap.has(ownerAddr)) {
          let meta: any = {};
          if (uri) {
            try { meta = await fetch(ipfs(uri)).then(r => r.json()); } catch {}
          }

          artistMap.set(ownerAddr, {
            id: ownerAddr,
            name: meta.name || `Artist ${owner.slice(0,6)}`,
            avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${ownerAddr}`,
            walletAddress: owner,
            bio: meta.bio || "A distinguished creator in the Artisan ecosystem.",
            nftsMinted: Number(count),
            totalVolume: 0,
            joinedDate: new Date().toISOString(),
          });
        } else {
          const existing = artistMap.get(ownerAddr)!;
          existing.nftsMinted += Number(count);
        }
      }

      setArtists(Array.from(artistMap.values()));
    } catch (err) {
      console.error("Load Artists error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadArtistWorks(artist: Artist) {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const factory = new ethers.Contract(
        (import.meta as any).env.VITE_FACTORY_ADDRESS,
        FactoryABI.abi,
        provider
      );

      const allCollections: string[] = await factory.getAllCollections();
      const works = [];

      for (const collAddr of allCollections) {
        const nftContract = new ethers.Contract(collAddr, GalleryABI.abi, provider);
        const owner = await nftContract.owner();
        
        if (owner.toLowerCase() === artist.walletAddress.toLowerCase()) {
          const total = Number(await nftContract.tokenCounter());
          const collName = await nftContract.name();
          
          for (let i = 1; i <= Math.min(total, 12); i++) {
            try {
              const uri = await nftContract.tokenURI(i);
              const meta = await fetch(ipfs(uri)).then(r => r.json());
              works.push({
                id: `${collAddr}-${i}`,
                collection: collAddr,
                tokenId: i,
                name: meta.name,
                image: ipfs(meta.image),
                artist: artist.name,
                collectionName: collName,
                price: "0", // Price logic usually requires Market contract scan
                isListed: false
              });
            } catch (e) { continue; }
          }
        }
      }
      setArtistNFTs(works);
    } catch (err) {
      console.error("Load works error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Handle clicking back
  const handleBack = () => {
    setSelectedArtist(null);
    setLoading(false);
  };

  // 1. DETAIL VIEW
  if (selectedArtist) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-[var(--deep-black)]">
        <div className="max-w-7xl mx-auto">
          <button onClick={handleBack} className="flex items-center gap-2 text-[var(--gold)] mb-8">
            <ArrowLeft className="w-5 h-5" /> Back to Collective
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="museum-frame p-8 mb-12">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              <img src={selectedArtist.avatar} className="w-32 h-32 rounded-full ring-2 ring-[var(--gold)]" alt="" />
              <div>
                <h2 className="text-[var(--ivory)]">{selectedArtist.name}</h2>
                <p className="text-xs font-mono text-muted-foreground mb-4 uppercase">{selectedArtist.walletAddress}</p>
                <p className="text-[var(--champagne)] opacity-80 max-w-2xl">{selectedArtist.bio}</p>
              </div>
            </div>
          </motion.div>

          <h3 className="mb-8 text-[var(--ivory)]">Artistic Catalog</h3>
          {loading ? (
             <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[var(--gold)]" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {artistNFTs.map((nft, idx) => (
                <NFTCard 
                  key={nft.id} 
                  nft={nft} 
                  onClick={() => onNavigate('nft-detail', { collection: nft.collection, tokenId: nft.tokenId })} 
                  index={idx} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. LIST VIEW
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-[var(--ivory)]">The Collective</h1>
          <p className="text-[var(--champagne)] opacity-60 italic">World-class visionaries defining the next era of digital art</p>
        </div>

        {loading && artists.length === 0 ? (
          <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-[var(--gold)]" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artists.map((artist, idx) => (
              <ArtistCard 
                key={artist.id} 
                artist={artist} 
                onClick={() => setSelectedArtist(artist)} 
                index={idx} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}