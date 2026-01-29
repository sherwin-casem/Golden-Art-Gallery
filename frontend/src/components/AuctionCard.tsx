import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Auction } from '../lib/mockData';
import { Clock, TrendingUp, Gavel } from 'lucide-react';

interface AuctionCardProps {
  auction: Auction;
  onClick: () => void;
  index?: number;
}

export function AuctionCard({ auction, onClick, index = 0 }: AuctionCardProps) {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date().getTime();
      const end = new Date(auction.endTime).getTime();
      const difference = end - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
          setTimeRemaining(`${days}d ${hours}h`);
        } else if (hours > 0) {
          setTimeRemaining(`${hours}h ${minutes}m`);
        } else {
          setTimeRemaining(`${minutes}m`);
        }
      } else {
        setTimeRemaining('Ended');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [auction.endTime]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="museum-frame overflow-hidden hover-lift">
        {/* NFT Image */}
        <div className="relative aspect-square overflow-hidden bg-[var(--deep-black)]">
          <img
            src={auction.nft.image}
            alt={auction.nft.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Live Badge */}
          {auction.isActive && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-xs uppercase rounded flex items-center gap-2 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-white" />
              Live Auction
            </div>
          )}

          {/* Time Remaining */}
          <div className="absolute top-4 right-4 px-3 py-1 bg-black/80 backdrop-blur text-[var(--gold)] text-xs uppercase rounded flex items-center gap-2">
            <Clock className="w-3 h-3" />
            {timeRemaining}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-6">
            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-400">
              <p className="text-sm text-[var(--champagne)] mb-2">{auction.nft.collectionName}</p>
              <h4 className="text-[var(--ivory)] mb-1">{auction.nft.name}</h4>
              <p className="text-sm text-[var(--gold)]">{auction.nft.artist}</p>
            </div>
          </div>
        </div>

        {/* Auction Info */}
        <div className="p-4 bg-gradient-to-b from-[rgba(26,26,26,0.95)] to-[rgba(18,18,18,0.98)]">
          <div className="space-y-3">
            {/* Current Bid */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Current Bid</p>
                <p className="text-xl text-[var(--gold)] flex items-center gap-2">
                  <Gavel className="w-4 h-4" />
                  {auction.currentBid} ETH
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase mb-1">Start Price</p>
                <p className="text-sm text-[var(--ivory)]">{auction.startPrice} ETH</p>
              </div>
            </div>

            {/* Highest Bidder */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase mb-1">Highest Bidder</p>
                <p className="text-sm text-[var(--ivory)] truncate">{auction.highestBidder}</p>
              </div>
              <div className="flex items-center gap-1 text-green-500">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">
                  {((auction.currentBid - auction.startPrice) / auction.startPrice * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Bid Count */}
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {auction.bids.length} bid{auction.bids.length !== 1 ? 's' : ''} placed
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
