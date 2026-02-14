import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Gavel } from 'lucide-react';
import { ethers } from 'ethers';
import { NFTCard } from '../components/NFTCard';
import { CollectionCard } from '../components/CollectionCard';
import { useWallet } from '../lib/WalletContext';

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
      if (!(window as any).ethereum) return
      setLoading(true)

      const provider = new ethers.BrowserProvider((window as any).ethereum)

      const factory = new ethers.Contract(
        (import.meta as any).env.VITE_FACTORY_ADDRESS,
        FactoryABI.abi,
        provider
      )

      const market = new ethers.Contract(
        (import.meta as any).env.VITE_MARKETPLACE_ADDRESS,
        MarketplaceABI.abi,
        provider
      )

      const collectionAddresses: string[] =
        await factory.getAllCollections()

      const collections: any[] = []
      const allNFTs: any[] = []

      for (const addr of collectionAddresses) {
        const nftContract = new ethers.Contract(
          addr,
          GalleryABI.abi,
          provider
        )

        const [name, uri, totalSupply] = await Promise.all([
          nftContract.name(),
          nftContract.collectionURI(),
          nftContract.tokenCounter(),
        ])

        let meta: any = {}
        if (uri) {
          try {
            meta = await fetch(ipfs(uri)).then((r) => r.json())
          } catch {}
        }

        let floorPrice = Infinity
        let volume = 0
        let listedCount = 0

        for (let tokenId = 1; tokenId <= Number(totalSupply); tokenId++) {
          const listing = await market.listings(addr, tokenId)
          if (listing.price === 0n) continue

          const price = Number(ethers.formatEther(listing.price))
          volume += price
          listedCount++
          if (price < floorPrice) floorPrice = price

          const tokenURI = await nftContract.tokenURI(tokenId)
          const tokenMeta = await fetch(ipfs(tokenURI)).then((r) => r.json())

          allNFTs.push({
            id: `${addr}-${tokenId}`,
            collection: addr,
            tokenId,
            name: tokenMeta.name,
            image: ipfs(tokenMeta.image),
            price,
            isListed: true,
            collectionName: name,
            collectionVolume: volume,
            collectionFloor: floorPrice === Infinity ? 0 : floorPrice,
          })
        }

        collections.push({
          id: addr,
          address: addr,
          name: name || meta.name,
          description: meta.description || '',
          coverImage:
            meta.banner
              ? ipfs(meta.banner)
              : 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
          nftCount: listedCount,
          floorPrice: floorPrice === Infinity ? 0 : floorPrice,
          volume,
        })
      }

      // Sort collections by volume
      collections.sort((a, b) => b.volume - a.volume)
      setFeaturedCollections(collections.slice(0, 3))

      // Sort NFTs: hot collections first, then lowest price
      const featured = allNFTs
        .sort(
          (a, b) =>
            b.collectionVolume - a.collectionVolume ||
            a.price - b.price
        )
        .slice(0, 4)

      setFeaturedNFTs(featured)
    } catch (err) {
      console.error('HomePage load failed:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading gallery…
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center vignette overflow-hidden"
        style={{
          backgroundImage: 'url(https://v3b.fal.media/files/b/0a8ba8c2/OGo8XE1LeCnXDdKbxVbvL.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 backdrop-blur-sm bg-black/60" />
        
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
            A New Era of Digital
            <br />
            <span className="golden-underline text-[var(--gold)] ">Art Exhibitions</span>
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
              className="cursor-pointer px-8 py-4 bg-gradient-to-r from-[var(--gold)] to-[var(--antique-brass)] text-[var(--deep-black)] rounded hover-lift flex items-center gap-3 transition-all font-bold"
            >
              <span>Enter Gallery</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('auctions')}
              className="cursor-pointer px-8 py-4 border-2 border-[var(--gold)] text-[var(--gold)] rounded hover-glow transition-all flex items-center gap-2"
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
                className="cursor-pointer px-8 py-4 bg-[var(--gold)] text-[var(--deep-black)] rounded-full font-bold hover:scale-105 transition-transform"
              >
                Connect Wallet
              </button>
            ) : (
              <button
                onClick={() => onNavigate('mint-nft')}
                className="cursor-pointer px-8 py-4 bg-[var(--gold)] text-[var(--deep-black)] rounded-full font-bold hover:scale-105 transition-transform"
              >
                Mint Artwork
              </button>
            )}
          </div>
        </div>
      </section>
      {/* Footer */}
<footer className="relative bg-[var(--deep-black)] border-t border-white/10">
  <div className="max-w-7xl mx-auto px-6">

    {/* Top Divider */}
    <div className="pt-24 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-12">

      {/* Identity */}
      <div className="lg:col-span-5">
        <h2 className="font-serif text-3xl text-[var(--ivory)] mb-6 tracking-wide">
          Gallery
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-[var(--champagne)] opacity-70">
          A sovereign digital art institution. Curated collections, verifiable
          provenance, and on-chain permanence — designed for collectors who
          value legacy over hype.
        </p>
      </div>

      <div className=" grid grid-cols-3 md:grid-cols-4 gap-12">
        {/* Navigation */}
        <div className="lg:col-span-3">
          <h4 className="text-xs uppercase tracking-[0.2em] text-[var(--gold)] mb-6">
            Marketplace
          </h4>
          <ul className="space-y-4 text-sm">
            <li
              onClick={() => onNavigate('collections')}
              className="cursor-pointer text-[var(--ivory)] opacity-70 hover:opacity-100 transition"
            >
              Collections
            </li>
            <li
              onClick={() => onNavigate('auctions')}
              className="cursor-pointer text-[var(--ivory)] opacity-70 hover:opacity-100 transition"
            >
              Live Auctions
            </li>
            <li
              onClick={() => onNavigate('mint-nft')}
              className="cursor-pointer text-[var(--ivory)] opacity-70 hover:opacity-100 transition"
            >
              Mint Artwork
            </li>
          </ul>
        </div>

        {/* Institution */}
        <div className="lg:col-span-2">
          <h4 className="text-xs uppercase tracking-[0.2em] text-[var(--gold)] mb-6">
            Institution
          </h4>
          <ul className="space-y-4 text-sm text-[var(--ivory)] opacity-70">
            <li>Artists</li>
            <li>Collectors</li>
            <li>Curators</li>
          </ul>
        </div>

        {/* Legal */}
        <div className="lg:col-span-2">
          <h4 className="text-xs uppercase tracking-[0.2em] text-[var(--gold)] mb-6">
            Legal
          </h4>
          <ul className="space-y-4 text-sm text-[var(--ivory)] opacity-70">
            <li>Terms of Service</li>
            <li>Privacy Policy</li>
            <li>Protocol Disclaimer</li>
          </ul>
        </div>
      </div>

    </div>

    {/* Bottom Bar */}
    <div className="border-t border-white/10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
      <span className="text-xs tracking-wide text-[var(--champagne)] opacity-50">
        © {new Date().getFullYear()} Golden Era Art Gallery — All Rights Reserved
      </span>

      <div className="flex items-center gap-6 text-xs text-[var(--champagne)] opacity-50">
        <span>Ethereum Native</span>
        <span className="w-px h-4 bg-white/20" />
        <span>On-chain Provenance</span>
      </div>
    </div>
  </div>
</footer>

    </div>
  );
}