import React from 'react';
import { motion } from 'motion/react';
import { Collection } from '../pages/CollectionsPage';
import { TrendingUp } from 'lucide-react';

interface CollectionCardProps {
  collection: Collection;
  coverImage: string;
  onClick: () => void;
  index?: number;
}

export function CollectionCard({ collection, onClick, index = 0 }: CollectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="museum-frame overflow-hidden hover-lift">
        {/* Cover Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-[var(--deep-black)]">
          <img
            src={collection.coverImage}
            alt={collection.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          {/* Collection Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-[var(--ivory)] mb-2 golden-underline inline-block">{collection.name}</h3>
                <p className="text-sm text-[var(--champagne)] mb-3 line-clamp-2">
                  {collection.description}
                </p>
                <p className="text-xs text-[var(--gold)]">by {collection.artistName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Collection Stats */}
        <div className="p-4 bg-gradient-to-b from-[rgba(26,26,26,0.95)] to-[rgba(18,18,18,0.98)]">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">Items</p>
              <p className="text-[var(--ivory)]">{collection.nftCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">Floor</p>
              <p className="text-[var(--gold)] flex items-center gap-1">
                {collection.floorPrice} ETH
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">Volume</p>
              <p className="text-[var(--ivory)] flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                {(collection.floorPrice * collection.nftCount).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
