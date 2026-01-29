import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { NFTCard } from '../components/NFTCard';
import { CollectionCard } from '../components/CollectionCard';
import { ArtistCard } from '../components/ArtistCard';
import { mockNFTs, mockCollections, mockArtists } from '../lib/mockData';
import { useWallet } from '../lib/WalletContext';

interface HomePageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { isConnected, connect } = useWallet();
  const featuredNFTs = mockNFTs.slice(0, 4);
  const featuredCollections = mockCollections.slice(0, 3);
  const featuredArtists = mockArtists.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center vignette"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1718359760007-4b11d377689c?w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Blur Overlay */}
        <div className="absolute inset-0 backdrop-blur-sm bg-black/40" />
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[var(--gold)] rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--gold)]/20 backdrop-blur border border-[var(--gold)]/30 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-[var(--gold)]" />
              <span className="text-sm text-[var(--gold)]">Curated Digital Art Since 2026</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-6xl md:text-7xl mb-6 text-[var(--ivory)]"
          >
            A New Era of
            <br />
            <span className="golden-underline text-[var(--gold)]">Digital Art Exhibitions</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl text-[var(--champagne)] mb-12 max-w-2xl mx-auto"
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
              className="px-8 py-4 bg-gradient-to-r from-[var(--gold)] to-[var(--antique-brass)] text-[var(--deep-black)] rounded hover-lift flex items-center gap-3 transition-all duration-400"
            >
              <span>Enter Gallery</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('artists')}
              className="px-8 py-4 border-2 border-[var(--gold)] text-[var(--gold)] rounded hover-glow transition-all duration-400"
            >
              Explore Artists
            </button>
          </motion.div>
        </div>
      </section>

      {/* Featured Artworks Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[var(--deep-black)]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 text-[var(--ivory)]">Featured Artworks</h2>
            <p className="text-[var(--champagne)] max-w-2xl mx-auto">
              Carefully selected pieces from our most distinguished artists
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredNFTs.map((nft, index) => (
              <NFTCard
                key={nft.id}
                nft={nft}
                onClick={() => onNavigate('nft-detail', { nft })}
                index={index}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <button
              onClick={() => onNavigate('collections')}
              className="px-6 py-3 border border-[var(--gold)] text-[var(--gold)] rounded hover-glow transition-all duration-400"
            >
              View All Artworks
            </button>
          </motion.div>
        </div>
      </section>

      {/* Curated Collections Section */}
      <section
        className="relative py-24 px-4 sm:px-6 lg:px-8 vignette"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1746270084016-89dc78f6e63c?w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 backdrop-blur-md bg-black/60" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 text-[var(--ivory)]">Curated Collections</h2>
            <p className="text-[var(--champagne)] max-w-2xl mx-auto">
              Explore thematic exhibitions from world-renowned digital artists
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCollections.map((collection, index) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onClick={() => onNavigate('collection-detail', { collection })}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artists Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[var(--deep-black)]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 text-[var(--ivory)]">Featured Artists</h2>
            <p className="text-[var(--champagne)] max-w-2xl mx-auto">
              Discover the visionaries shaping the future of digital art
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArtists.map((artist, index) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                onClick={() => onNavigate('artist-detail', { artist })}
                index={index}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <button
              onClick={() => onNavigate('artists')}
              className="px-6 py-3 border border-[var(--gold)] text-[var(--gold)] rounded hover-glow transition-all duration-400"
            >
              Discover All Artists
            </button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--deep-black)] to-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-6 text-[var(--ivory)]">Begin Your Collection</h2>
            <p className="text-xl text-[var(--champagne)] mb-12">
              Join collectors and artists from around the world in the premier digital art marketplace
            </p>
            <div className="flex items-center justify-center gap-4">
              {!isConnected ? (
                <button
                  onClick={connect}
                  className="px-8 py-4 bg-gradient-to-r from-[var(--gold)] to-[var(--antique-brass)] text-[var(--deep-black)] rounded hover-lift flex items-center gap-3 transition-all duration-400 font-bold"
                >
                  Connect Wallet
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('collections')}
                    className="px-8 py-4 bg-gradient-to-r from-[var(--gold)] to-[var(--antique-brass)] text-[var(--deep-black)] rounded hover-lift transition-all duration-400"
                  >
                    Start Collecting
                  </button>
                  <button
                    onClick={() => onNavigate('mint-nft')}
                    className="px-8 py-4 border-2 border-[var(--gold)] text-[var(--gold)] rounded hover-glow transition-all duration-400"
                  >
                    Become an Artist
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}