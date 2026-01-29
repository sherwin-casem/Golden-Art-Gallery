import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArtistCard } from '../components/ArtistCard';
import { NFTCard } from '../components/NFTCard';
import { mockArtists, mockNFTs, Artist } from '../lib/mockData';
import { ArrowLeft, Edit, Award, TrendingUp, Calendar } from 'lucide-react';
import { useWallet } from '../lib/WalletContext';

interface ArtistsPageProps {
  onNavigate: (page: string, data?: any) => void;
  initialArtist?: Artist;
}

export function ArtistsPage({ onNavigate, initialArtist }: ArtistsPageProps) {
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(
    initialArtist || null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const { userType, address } = useWallet();

  if (selectedArtist) {
    const artistNFTs = mockNFTs.filter((nft) => nft.artistId === selectedArtist.id);
    const isOwnProfile = userType === 'artist' && selectedArtist.id === '1'; // Simplified check

    const handleSaveBio = () => {
      alert('Profile updated successfully!');
      setIsEditing(false);
    };

    return (
      <div
        className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1746270084016-89dc78f6e63c?w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 backdrop-blur-sm bg-black/60" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setSelectedArtist(null)}
            className="flex items-center gap-2 text-[var(--gold)] hover:text-[var(--antique-brass)] mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Artists
          </motion.button>

          {/* Artist Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="museum-frame p-8 mb-12"
          >
            <div className="grid md:grid-cols-3 gap-8">
              {/* Avatar & Name */}
              <div className="text-center md:text-left">
                <div className="inline-block relative mb-6">
                  <div className="w-48 h-48 rounded-full overflow-hidden ring-4 ring-[var(--gold)] ring-offset-4 ring-offset-[var(--deep-black)]">
                    <img
                      src={selectedArtist.avatar}
                      alt={selectedArtist.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-2 right-2 w-12 h-12 bg-gradient-to-br from-[var(--gold)] to-[var(--antique-brass)] rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-[var(--deep-black)]" />
                  </div>
                </div>
                <h2 className="text-[var(--ivory)] mb-2">{selectedArtist.name}</h2>
                <p className="text-sm text-muted-foreground font-mono mb-4">
                  {selectedArtist.walletAddress}
                </p>
                {isOwnProfile && (
                  <button
                    onClick={() => {
                      setIsEditing(!isEditing);
                      setEditedBio(selectedArtist.bio);
                    }}
                    className="px-4 py-2 border-2 border-[var(--gold)] text-[var(--gold)] rounded hover-glow transition-all duration-400 flex items-center gap-2 mx-auto md:mx-0"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <h4 className="text-[var(--ivory)] mb-4">About the Artist</h4>
                {isEditing ? (
                  <div>
                    <textarea
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--gold)] resize-none text-[var(--ivory)] mb-4"
                    />
                    <div className="flex gap-4">
                      <button
                        onClick={handleSaveBio}
                        className="px-6 py-2 bg-gradient-to-r from-[var(--gold)] to-[var(--antique-brass)] text-[var(--deep-black)] rounded hover-lift transition-all duration-400"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 border-2 border-[var(--border)] text-[var(--ivory)] rounded hover:border-[var(--gold)] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[var(--champagne)] leading-relaxed mb-6">
                    {selectedArtist.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-[var(--gold)]" />
                      <p className="text-sm text-muted-foreground uppercase">Works</p>
                    </div>
                    <p className="text-3xl text-[var(--ivory)]">{selectedArtist.nftsMinted}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-[var(--gold)]" />
                      <p className="text-sm text-muted-foreground uppercase">Volume</p>
                    </div>
                    <p className="text-3xl text-[var(--gold)]">{selectedArtist.totalVolume} ETH</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-[var(--gold)]" />
                      <p className="text-sm text-muted-foreground uppercase">Joined</p>
                    </div>
                    <p className="text-xl text-[var(--ivory)]">
                      {new Date(selectedArtist.joinedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Artist's NFTs */}
          <div>
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 text-[var(--ivory)]"
            >
              Artworks by {selectedArtist.name}
            </motion.h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {artistNFTs.map((nft, index) => (
                <NFTCard
                  key={nft.id}
                  nft={nft}
                  onClick={() => onNavigate('nft-detail', { nft })}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 vignette"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1746270084016-89dc78f6e63c?w=1920)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 backdrop-blur-sm bg-black/60" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="mb-4 text-[var(--ivory)]">Featured Artists</h1>
          <p className="text-xl text-[var(--champagne)] max-w-2xl mx-auto">
            Discover the visionaries shaping the future of digital art
          </p>
        </motion.div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockArtists.map((artist, index) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onClick={() => setSelectedArtist(artist)}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
