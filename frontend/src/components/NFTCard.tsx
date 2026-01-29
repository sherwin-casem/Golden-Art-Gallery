import React from 'react';
import { motion } from 'motion/react';
import { Eye, Heart } from 'lucide-react';
interface NFT {
  id: string;
  name: string;
  description?: string;
  image: string;
  artist: string;
  artistId?: string;
  price: number;
  collectionId?: string;
  collectionName: string;
  isListed: boolean;
  owner?: string;
  ownerId?: string;
  createdAt?: string;
  attributes?: { trait_type: string; value: string }[];
}
interface NFTCardProps {
  nft: NFT;
  onClick: () => void;
  index?: number;
}

export function NFTCard({ nft, onClick, index = 0 }: NFTCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="museum-frame overflow-hidden hover-lift">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-[var(--deep-black)]">
          <img
            src={nft.image}
            alt={nft.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-6">
            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-400">
              <p className="text-sm text-[var(--champagne)] mb-2">{nft.collectionName}</p>
              <h4 className="text-[var(--ivory)] mb-1">{nft.name}</h4>
              <p className="text-sm text-[var(--gold)]">{nft.artist}</p>
            </div>
          </div>

          {/* Status Badge */}
          {nft.isListed && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-[var(--gold)] text-[var(--deep-black)] text-xs uppercase rounded">
              Listed
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="p-4 bg-gradient-to-b from-[rgba(26,26,26,0.95)] to-[rgba(18,18,18,0.98)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="truncate text-[var(--ivory)] text-sm">{nft.name}</h4>
              <p className="text-xs text-muted-foreground truncate">{nft.artist}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Price</p>
              <p className="text-[var(--gold)]">{nft.price} ETH</p>
            </div>
            
            <div className="flex items-center gap-3 text-muted-foreground">
              <button className="hover:text-[var(--gold)] transition-colors">
                <Heart className="w-4 h-4" />
              </button>
              <button className="hover:text-[var(--gold)] transition-colors">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
