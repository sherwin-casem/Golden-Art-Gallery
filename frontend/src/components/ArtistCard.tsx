import React from 'react';
import { motion } from 'motion/react';
import { Award, TrendingUp } from 'lucide-react';

// Define the type locally or in a shared types file to avoid mockData dependency
export interface Artist {
  id: string | number;
  name: string;
  avatar: string;
  walletAddress: string;
  bio: string;
  nftsMinted: number;
  totalVolume: string | number; // Accept both for flexibility
  joinedDate: string | number;
}

interface ArtistCardProps {
  artist: Artist;
  onClick: () => void;
  index?: number;
}

export function ArtistCard({ artist, onClick, index = 0 }: ArtistCardProps) {
  // Helper to safely truncate the address
  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="museum-frame overflow-hidden hover-lift h-full bg-[rgba(26,26,26,0.6)]">
        {/* Artist Header */}
        <div className="relative p-6 bg-gradient-to-br from-[var(--gold)]/15 to-transparent">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-[var(--gold)]/50 ring-offset-2 ring-offset-[var(--deep-black)]">
                <img
                  src={artist.avatar}
                  alt={artist.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--gold)] rounded-full flex items-center justify-center">
                <Award className="w-3 h-3 text-[var(--deep-black)]" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-[var(--ivory)] mb-0.5 truncate">{artist.name}</h4>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                {truncateAddress(artist.walletAddress)}
              </p>
            </div>
          </div>
        </div>

        {/* Artist Bio */}
        <div className="p-6 pt-4 flex flex-col justify-between">
          <p className="text-sm text-[var(--champagne)] opacity-70 line-clamp-2 mb-6 min-h-[40px]">
            {artist.bio}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[var(--gold)]/10">
            <div>
              <p className="text-[9px] text-muted-foreground uppercase mb-1 tracking-tighter">Artworks</p>
              <p className="text-sm text-[var(--ivory)]">{artist.nftsMinted}</p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground uppercase mb-1 tracking-tighter">Volume</p>
              <p className="text-sm text-[var(--gold)] flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {typeof artist.totalVolume === 'number' ? artist.totalVolume.toFixed(1) : artist.totalVolume}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-muted-foreground uppercase mb-1 tracking-tighter">Member</p>
              <p className="text-[var(--ivory)] text-[10px]">
                {new Date(artist.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}