import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArtistCard } from '../components/ArtistCard';
import { NFTCard } from '../components/NFTCard';
import { ethers } from 'ethers';
import { ArrowLeft, Edit, Award, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { useWallet } from '../lib/WalletContext';

// ABIs
import FactoryABI from '../abis/CollectionFactory.json';
import GalleryABI from '../abis/GalleryNFT.json';

const ipfs = (uri: string) => uri?.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') || '';

interface Artist {
  id: string;
  name: string;
  avatar: string;
  walletAddress: string;
  bio: string;
  nftsMinted: number;
  totalVolume: number;
  joinedDate: string;
}

interface ArtistsPageProps {
  onNavigate: (page: string, data?: any) => void;
  initialArtist?: Artist;
}

export function ArtistsPage({ onNavigate, initialArtist }: ArtistsPageProps) {
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(initialArtist || null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistNFTs, setArtistNFTs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const { userType, address } = useWallet();

  useEffect(() => {
    loadArtists();
  }, []);

  useEffect(() => {
    if (selectedArtist) {
      loadArtistWorks(selectedArtist.walletAddress);
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
      const artistMap = new Map<string, any>();

      // Aggregate data from collections to find unique artists
      for (const collAddr of collections) {
        const nft = new ethers.Contract(collAddr, GalleryABI.abi, provider);
        const [owner, count, uri] = await Promise.all([
          nft.owner(),
          nft.tokenCounter(),
          nft.collectionURI()
        ]);

        if (!artistMap.has(owner)) {
          let meta = { name: `Artist ${owner.slice(0,6)}`, bio: "A digital visionary in the Artisan gallery." };
          if (uri) {
            try { meta = await fetch(ipfs(uri)).then(r => r.json()); } catch {}
          }

          artistMap.set(owner, {
            id: owner,
            name: meta.name || `Artist ${owner.slice(0,6)}`,
            avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${owner}`,
            walletAddress: owner,
            bio: meta.bio || "This artist has not yet uploaded a biography.",
            nftsMinted: Number(count),
            totalVolume: "0", // This would ideally come from a subgraph or marketplace events
            joinedDate: new Date().toISOString(), // Mocking date as factory doesn't store it
          });
        } else {
          const existing = artistMap.get(owner);
          existing.nftsMinted += Number(count);
        }
      }

      setArtists(Array.from(artistMap.values()));
    } catch (err) {
      console.error("Failed to load artists:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadArtistWorks(artistAddr: string) {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const factory = new ethers.Contract(
        (import.meta as any).env.VITE_FACTORY_ADDRESS,
        FactoryABI.abi,
        provider
      );

      const allCollections: string[] = await factory.getAllCollections();
      const nfts = [];

      for (const collAddr of allCollections) {
        const nft = new ethers.Contract(collAddr, GalleryABI.abi, provider);
        const owner = await nft.owner();
        
        if (owner.toLowerCase() === artistAddr.toLowerCase()) {
          const count = Number(await nft.tokenCounter());
          const collName = await nft.name();
          for (let i = 1; i <= Math.min(count, 8); i++) {
            const uri = await nft.tokenURI(i);
            const meta = await fetch(ipfs(uri)).then(r => r.json());
            nfts.push({
              id: `${collAddr}-${i}`,
              collection: collAddr,
              tokenId: i,
              name: meta.name,
              image: ipfs(meta.image),
              artist: selectedArtist?.name,
              collectionName: collName
            });
          }
        }
      }
      setArtistNFTs(nfts);
    } catch (err) {
      console.error("Failed to load works:", err);
    } finally {
      setLoading(false);
    }
  }

  const isOwnProfile = address && selectedArtist?.walletAddress.toLowerCase() === address.toLowerCase();

  if (selectedArtist) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-[var(--deep-black)]">
        <div className="relative z-10 max-w-7xl mx-auto">
          <button
            onClick={() => setSelectedArtist(null)}
            className="flex items-center gap-2 text-[var(--gold)] hover:text-[var(--antique-brass)] mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Artists
          </button>

          {/* Profile Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="museum-frame p-8 mb-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center md:text-left">
                <div className="inline-block relative mb-6">
                  <img src={selectedArtist.avatar} className="w-48 h-48 rounded-full ring-4 ring-[var(--gold)] object-cover" alt="" />
                  <div className="absolute bottom-2 right-2 w-12 h-12 bg-[var(--gold)] rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-black" />
                  </div>
                </div>
                <h2 className="text-[var(--ivory)] mb-2">{selectedArtist.name}</h2>
                <p className="font-mono text-xs text-muted-foreground mb-4">{selectedArtist.walletAddress}</p>
                {isOwnProfile && (
                  <button onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-2 px-4 py-2 border border-[var(--gold)] text-[var(--gold)] rounded hover-glow">
                    <Edit className="w-4 h-4" /> Edit Bio
                  </button>
                )}
              </div>

              <div className="md:col-span-2">
                <h4 className="text-[var(--ivory)] mb-4">Biography</h4>
                <p className="text-[var(--champagne)] italic opacity-80 mb-8">{selectedArtist.bio}</p>
                
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Total Assets</p>
                    <p className="text-3xl text-[var(--ivory)]">{selectedArtist.nftsMinted}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Listed Volume</p>
                    <p className="text-3xl text-[var(--gold)]">{selectedArtist.totalVolume.toFixed(2)} ETH</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Joined</p>
                    <p className="text-xl text-[var(--ivory)]">{new Date(selectedArtist.joinedDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric'})}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <h3 className="mb-8 text-[var(--ivory)]">Archive of Works</h3>
          {loading ? (
             <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[var(--gold)]" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {artistNFTs.map((nft, idx) => (
                <NFTCard key={nft.id} nft={nft} onClick={() => onNavigate('nft-detail', { collection: nft.collection, tokenId: nft.tokenId })} index={idx} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-[var(--ivory)] mb-4">Prominent Creators</h1>
          <p className="text-[var(--champagne)] opacity-60">The visionaries populating the Artisan ecosystem</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-[var(--gold)]" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artists.map((artist, idx) => (
              <ArtistCard key={artist.id} artist={artist} onClick={() => setSelectedArtist(artist)} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}