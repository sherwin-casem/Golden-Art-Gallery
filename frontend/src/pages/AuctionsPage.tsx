import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AuctionCard } from '../components/AuctionCard';
import { mockAuctions, Auction } from '../lib/mockData';
import { ArrowLeft, Gavel, Clock, TrendingUp } from 'lucide-react';
import { useWallet } from '../lib/WalletContext';

interface AuctionsPageProps {
  onNavigate: (page: string, data?: any) => void;
  initialAuction?: Auction;
}

export function AuctionsPage({ onNavigate, initialAuction }: AuctionsPageProps) {
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(
    initialAuction || null
  );
  const [bidAmount, setBidAmount] = useState('');
  const { userType } = useWallet();

  const handlePlaceBid = () => {
    if (bidAmount && parseFloat(bidAmount) > (selectedAuction?.currentBid || 0)) {
      alert(`Bid of ${bidAmount} ETH placed successfully!`);
      setBidAmount('');
    }
  };

  const handleStopAuction = () => {
    alert('Auction stopped successfully');
    setSelectedAuction(null);
  };

  if (selectedAuction) {
    const isArtist = userType === 'artist';
    const isCollector = userType === 'collector';
    const minBid = selectedAuction.currentBid + 0.1;

    return (
      <div
        className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1687676627083-e7df45578c8a?w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 backdrop-blur-md bg-black/70" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setSelectedAuction(null)}
            className="flex items-center gap-2 text-[var(--gold)] hover:text-[var(--antique-brass)] mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Auctions
          </motion.button>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* NFT Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="museum-frame overflow-hidden"
            >
              <div className="aspect-square bg-[var(--deep-black)] relative">
                <img
                  src={selectedAuction.nft.image}
                  alt={selectedAuction.nft.name}
                  className="w-full h-full object-cover"
                />
                {selectedAuction.isActive && (
                  <div className="absolute top-6 left-6 px-4 py-2 bg-red-600 text-white uppercase rounded flex items-center gap-2 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-white" />
                    Live Auction
                  </div>
                )}
              </div>
            </motion.div>

            {/* Auction Details */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <div className="inline-flex items-center px-3 py-1 bg-[var(--gold)]/20 border border-[var(--gold)]/30 rounded text-sm text-[var(--gold)] mb-4">
                  {selectedAuction.nft.collectionName}
                </div>
                <h1 className="text-4xl mb-4 text-[var(--ivory)]">{selectedAuction.nft.name}</h1>
                <p className="text-xl text-[var(--gold)]">by {selectedAuction.nft.artist}</p>
              </div>

              {/* Current Bid */}
              <div className="museum-frame p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase mb-2">Current Bid</p>
                    <p className="text-5xl text-[var(--gold)] flex items-center gap-3">
                      <Gavel className="w-8 h-8" />
                      {selectedAuction.currentBid} ETH
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      ≈ ${(selectedAuction.currentBid * 2000).toLocaleString()} USD
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground uppercase mb-2">Start Price</p>
                    <p className="text-xl text-[var(--ivory)]">{selectedAuction.startPrice} ETH</p>
                    <div className="flex items-center gap-1 text-green-500 mt-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">
                        +{((selectedAuction.currentBid - selectedAuction.startPrice) / selectedAuction.startPrice * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-1">Highest Bidder</p>
                  <p className="text-[var(--ivory)]">{selectedAuction.highestBidder}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    {selectedAuction.highestBidderAddress}
                  </p>
                </div>
              </div>

              {/* Bid Actions */}
              {isCollector && selectedAuction.isActive && (
                <div className="museum-frame p-6">
                  <label className="block mb-3">Place Your Bid</label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`Min ${minBid} ETH`}
                        step="0.1"
                        min={minBid}
                        className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--gold)] text-[var(--ivory)]"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Minimum bid: {minBid} ETH
                      </p>
                    </div>
                    <button
                      onClick={handlePlaceBid}
                      disabled={!bidAmount || parseFloat(bidAmount) < minBid}
                      className="px-8 py-3 bg-gradient-to-r from-[var(--gold)] to-[var(--antique-brass)] text-[var(--deep-black)] rounded hover-lift transition-all duration-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Place Bid
                    </button>
                  </div>
                </div>
              )}

              {isArtist && (
                <button
                  onClick={handleStopAuction}
                  className="w-full px-6 py-4 border-2 border-destructive text-destructive rounded hover:bg-destructive hover:text-white transition-all duration-400"
                >
                  Stop Auction
                </button>
              )}

              {/* Bid History */}
              <div className="museum-frame p-6">
                <h4 className="text-[var(--ivory)] mb-4">Bid History</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedAuction.bids.map((bid) => (
                    <div
                      key={bid.id}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <div className="flex-1">
                        <p className="text-[var(--ivory)]">{bid.bidder}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {bid.bidderAddress}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[var(--gold)]">{bid.amount} ETH</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(bid.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Remaining */}
              <div className="museum-frame p-6 bg-gradient-to-br from-[var(--gold)]/10 to-transparent border-[var(--gold)]">
                <div className="flex items-center gap-4">
                  <Clock className="w-8 h-8 text-[var(--gold)]" />
                  <div>
                    <p className="text-sm text-muted-foreground uppercase">Auction Ends In</p>
                    <p className="text-2xl text-[var(--gold)]">
                      {Math.floor((new Date(selectedAuction.endTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 vignette"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1687676627083-e7df45578c8a?w=1920)',
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 backdrop-blur border border-red-600/30 rounded-full mb-6">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm text-red-400">Live Auctions</span>
          </div>
          <h1 className="mb-4 text-[var(--ivory)]">Auction House</h1>
          <p className="text-xl text-[var(--champagne)] max-w-2xl mx-auto">
            Place your bids on exclusive digital artworks
          </p>
        </motion.div>

        {/* Auctions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockAuctions.map((auction, index) => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              onClick={() => setSelectedAuction(auction)}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
