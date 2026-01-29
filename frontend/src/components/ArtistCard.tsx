import React from 'react';
import { motion } from 'motion/react';
import { Artist } from '../lib/mockData';
import { Award, TrendingUp } from 'lucide-react';

interface ArtistCardProps {
  artist: Artist;
  onClick: () => void;
  index?: number;
}

export function ArtistCard({ artist, onClick, index = 0 }: ArtistCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="museum-frame overflow-hidden hover-lift">
        {/* Artist Header */}
        <div className="relative p-6 bg-gradient-to-br from-[var(--gold)]/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-[var(--gold)] ring-offset-2 ring-offset-[var(--deep-black)]">
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
            
            <div className="flex-1">
              <h4 className="text-[var(--ivory)] mb-1">{artist.name}</h4>
              <p className="text-xs text-muted-foreground">{artist.walletAddress}</p>
            </div>
          </div>
        </div>

        {/* Artist Bio */}
        <div className="p-6 pt-4">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {artist.bio}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">Works</p>
              <p className="text-[var(--ivory)]">{artist.nftsMinted}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">Volume</p>
              <p className="text-[var(--gold)] flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {artist.totalVolume}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">Member</p>
              <p className="text-[var(--ivory)] text-xs">
                {new Date(artist.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
