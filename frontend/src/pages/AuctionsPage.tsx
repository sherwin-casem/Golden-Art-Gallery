import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AuctionCard } from '../components/AuctionCard';
import { ArrowLeft, Gavel, Clock, TrendingUp } from 'lucide-react';
import { useWallet } from '../lib/WalletContext';
import { ethers } from 'ethers'
import AuctionABI from '../abis/GalleryAuction.json'
import GalleryABI from '../abis/GalleryNFT.json'

interface ChainAuction {
  id: number
  seller: string
  nft: string
  tokenId: bigint
  endTime: bigint
  highestBid: bigint
  settled: boolean
  startPrice: number
  bids: Bid[];
}

export interface Bid {
  id: string | number;
  bidder: string;
  amount: bigint;
  bidderAddress: string;
  timestamp: number;
}
interface AuctionView {
  id: number
  nft: {
    name: string
    image: string
    collection: string
    tokenId: number
  }
  seller: string
  highestBid: bigint
  endTime: bigint
  isActive: boolean
  startPrice: number
  bids: Bid[];
}

interface AuctionsPageProps {
  onNavigate: (page: string, data?: any) => void;
  initialAuction?: AuctionView;
}




export function AuctionsPage({ onNavigate, initialAuction }: AuctionsPageProps) {
  const [selectedAuction, setSelectedAuction] = useState<AuctionView | null>(
    initialAuction || null
  );
  const [bidAmount, setBidAmount] = useState('');
  const { userType } = useWallet();
  const [auctions, setAuctions] = useState<AuctionView[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState('')

  useEffect(() => {
    ;(async () => {
      if (!(window as any).ethereum) return
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()
      setUser((await signer.getAddress()).toLowerCase())
    })()
  }, [])

  useEffect(() => {
    loadAuctions()
  }, [])

  async function loadAuctions() {
    try {
      setLoading(true)

      if (!(window as any).ethereum) return

      const provider = new ethers.BrowserProvider((window as any).ethereum)

      const auctionContract = new ethers.Contract(
        (import.meta as any).env.VITE_AUCTION_ADDRESS,
        AuctionABI.abi,
        provider
      )

      const total = await auctionContract.auctionCounter()
      const items: AuctionView[] = []

      for (let i = 1; i <= Number(total); i++) {
        const a: ChainAuction = await auctionContract.auctions(i)
        if (a.settled) continue

        // load NFT metadata
        const nftContract = new ethers.Contract(a.nft, GalleryABI.abi, provider)

        let meta: any = {}
        try {
          const uri = await nftContract.tokenURI(a.tokenId)
          const res = await fetch(
            uri.replace('ipfs://', 'https://ipfs.io/ipfs/')
          )
          meta = await res.json()
        } catch {}

        items.push({
          id: i,
          nft: {
            name: meta.name || `NFT #${a.tokenId}`,
            image: meta.image
              ? meta.image.replace('ipfs://', 'https://ipfs.io/ipfs/')
              : '',
            collection: a.nft,
            tokenId: Number(a.tokenId),
          },
          seller: a.seller.toLowerCase(),
          highestBid: a.highestBid,
          endTime: a.endTime,
          isActive: Date.now() / 1000 < Number(a.endTime),
          startPrice: a.startPrice,
          bids: a.bids,
        })
      }

      setAuctions(items)
    } catch (err) {
      console.error('Failed to load auctions:', err)
    } finally {
      setLoading(false)
    }
  }
 
  async function handleBid() {
    if (!selectedAuction) return
    if (!bidAmount || Number(bidAmount) <= 0) {
      return alert('Enter a valid bid')
    }

    if (isAuctionSeller) {
      return alert('Seller cannot bid on own auction')
    }

    if (Number(bidAmount) <= minBid) {
      return alert(`Bid must be higher than ${minBid} ETH`)
    }

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()

      const auctionContract = new ethers.Contract(
        (import.meta as any).env.VITE_AUCTION_ADDRESS,
        AuctionABI.abi,
        signer
      )

      await (
        await auctionContract.bid(selectedAuction.id, {
          value: ethers.parseEther(bidAmount),
        })
      ).wait()

      setBidAmount('')
      await loadAuctions()
    } catch (err: any) {
      alert(err.reason || 'Bidding failed')
    }
  }


  const handleStopAuction = () => {
    alert('Auction stopped successfully');
    setSelectedAuction(null);
  };

  const auctionSeller = selectedAuction?.seller?.toLowerCase() || null
  const isAuctionSeller = auctionSeller === user

  const isAuctionActive =
    selectedAuction &&
    Date.now() / 1000 < Number(selectedAuction.endTime)

   const minBid =
    selectedAuction && selectedAuction.highestBid > 0n
      ? Number(ethers.formatEther(selectedAuction.highestBid))
      : 0



  if (selectedAuction) {
    
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
                  {selectedAuction.nft.collection}
                </div>
                <h1 className="text-4xl mb-4 text-[var(--ivory)]">{selectedAuction.nft.name}</h1>                
              </div>

              {/* Current Bid */}
              <div className="museum-frame p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase mb-2">Highest Bid</p>
                    <p className="text-5xl text-[var(--gold)] flex items-center gap-3">
                      <Gavel className="w-8 h-8" />
                      {selectedAuction.highestBid} ETH
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      ≈ ${(Number(ethers.formatEther(selectedAuction.highestBid)) * 2000).toLocaleString()} USD

                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground uppercase mb-2">Start Price</p>
                    <p className="text-xl text-[var(--ivory)]">{selectedAuction.startPrice} ETH</p>
                    <div className="flex items-center gap-1 text-green-500 mt-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">
                        +{selectedAuction.startPrice > 0n
                          ? (
                              ( (Number(selectedAuction.highestBid) - Number(selectedAuction.startPrice)) / 
                                Number(selectedAuction.startPrice) 
                              ) * 100
                            ).toFixed(0)
                          : '0'}%
                      </span>
                    </div>
                  </div>
                </div>                
              </div>

              {/* Bid Actions */}
              {isAuctionActive && !isAuctionSeller && (
                <div className="museum-frame p-6">
                  <input
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Bid amount (ETH)"
                    className="w-full bg-black/40 border p-4 rounded"
                  />

                  <button
                    onClick={async () => {
                      const provider = new ethers.BrowserProvider((window as any).ethereum)
                      const signer = await provider.getSigner()

                      const auctionContract = new ethers.Contract(
                        (import.meta as any).env.VITE_AUCTION_ADDRESS,
                        AuctionABI.abi,
                        signer
                      )

                      await auctionContract.bid(selectedAuction.id, {
                        value: ethers.parseEther(bidAmount),
                      })

                      setBidAmount('')
                      await loadAuctions()
                    }}
                    className="w-full py-4 mt-4 bg-gradient-to-r from-[var(--gold)] to-[var(--antique-brass)] rounded font-bold"
                  >
                    Place Bid
                  </button>
                </div>
              )}

              {!isAuctionActive && (isAuctionSeller || selectedAuction.highestBid > 0n) && (
                <button
                  onClick={async () => {
                    const provider = new ethers.BrowserProvider((window as any).ethereum)
                    const signer = await provider.getSigner()

                    const auctionContract = new ethers.Contract(
                      (import.meta as any).env.VITE_AUCTION_ADDRESS,
                      AuctionABI.abi,
                      signer
                    )

                    await (await auctionContract.settleAuction(selectedAuction.id)).wait()
                    setSelectedAuction(null)
                    await loadAuctions()
                  }}
                  className="w-full py-4 border rounded"
                >
                  Settle Auction
                </button>
              )}


              {loading && (
                <div className="text-center text-muted-foreground">
                  Loading auctions…
                </div>
              )}

              {!loading && auctions.length === 0 && (
                <div className="text-center text-muted-foreground">
                  No active auctions
                </div>
              )}

              {/* Bid History */}
              <div className="museum-frame p-6">
                <h4 className="text-[var(--ivory)] mb-4">Bid History</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedAuction.bids?.map((bid) => (
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
                      {Math.floor((new Date(Number(selectedAuction.endTime) * 1000).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
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
          {auctions.map((auction, index) => (
            <AuctionCard
              key={auction.id}
              auction={{
                id: auction.id,
                nft: {
                  name: auction.nft.name,
                  image: auction.nft.image,
                  collection: auction.nft.collection,
                },
                highestBid: Number(ethers.formatEther(auction.highestBid)),
                endTime: Number(auction.endTime) * 1000,
                isActive: auction.isActive,
                bids: auction.bids || [], 
                startPrice: auction.startPrice,
              }}
              onClick={() =>
                onNavigate('nft-detail', {
                  collection: auction.nft.collection,
                  tokenId: auction.nft.tokenId,
                })
              }
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
