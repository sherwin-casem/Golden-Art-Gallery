import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Heart, Share2 } from 'lucide-react'
import { ethers } from 'ethers'

import GalleryABI from '../abis/GalleryNFT.json'
import MarketplaceABI from '../abis/GalleryMarketplace.json'
import AuctionABI from '../abis/GalleryAuction.json'

interface Auction {
  id: number
  seller: string
  nft: string
  tokenId: bigint
  endTime: bigint
  highestBid: bigint
  settled: boolean
}

interface NFTDetailPageProps {
  data: {
    collection: string
    tokenId: number
  }
  onNavigate: (page: string, data?: any) => void
  onBack: () => void
}

interface Listing {
  seller: string
  price: bigint
}

interface NFTData {
  name: string
  image: string
  description: string
  owner: string
}

const ipfs = (u?: string) =>
  u ? u.replace('ipfs://', 'https://ipfs.io/ipfs/') : ''

export function NFTDetailPage({
  data,
  onNavigate,
  onBack,
}: NFTDetailPageProps) {
  const { collection, tokenId } = data

  const [user, setUser] = useState('')
  const [nft, setNft] = useState<NFTData | null>(null)
  const [listing, setListing] = useState<Listing | null>(null)
  const [listPrice, setListPrice] = useState('')
  const [artist, setArtist] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [liked, setLiked] = useState(false)
  const [auction, setAuction] = useState<any | null>(null)
  const [startPrice, setStartPrice] = useState('')
  const [duration, setDuration] = useState('24')
  const [bidAmount, setBidAmount] = useState('')


  /* =========================
     LOAD NFT
  ========================== */
  useEffect(() => {
    if (!collection || tokenId === undefined) return
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection, tokenId])

  async function load() {
    try {
      setLoading(true)

      if (!(window as any).ethereum) {
        throw new Error('Wallet not found')
      }

      const provider = new ethers.BrowserProvider(
        (window as any).ethereum
      )
      const signer = await provider.getSigner()
      const userAddr = (await signer.getAddress()).toLowerCase()
      setUser(userAddr)

      const nftContract = new ethers.Contract(
        collection,
        GalleryABI.abi,
        provider
      )

      const market = new ethers.Contract(
        (import.meta as any).env.VITE_MARKETPLACE_ADDRESS,
        MarketplaceABI.abi,
        provider
      )

      const auctionContract = new ethers.Contract(
        (import.meta as any).env.VITE_AUCTION_ADDRESS,
        AuctionABI.abi,
        provider
      )

      // find active auction for this NFT
      let found = null
      const total = await auctionContract.auctionCounter()

      for (let i = 1; i <= Number(total); i++) {
        const a = await auctionContract.auctions(i)
        if (
          a.nft.toLowerCase() === collection.toLowerCase() &&
          Number(a.tokenId) === tokenId &&
          !a.settled
        ) {
          found = { id: i, ...a }
          break
        }
      }

      setAuction(found)


      const owner = (await nftContract.ownerOf(tokenId)).toLowerCase()
      const listingData = await market.listings(collection, tokenId)

      /* Artist (royalty receiver) */
      try {
        const [receiver] = await nftContract.royaltyInfo(
          tokenId,
          ethers.parseEther('1')
        )
        setArtist(receiver.toLowerCase())
      } catch {
        setArtist('')
      }

      /* Metadata */
      let meta: any = {}
      try {
        const uri = await nftContract.tokenURI(tokenId)
        const res = await fetch(ipfs(uri))
        const text = await res.text()
        if (!text.startsWith('<')) meta = JSON.parse(text)
      } catch {}

      setNft({
        name: meta.name || `NFT #${tokenId}`,
        image: meta.image ? ipfs(meta.image) : '',
        description: meta.description || '',
        owner,
      })

      setListing(
        listingData.price > 0n
          ? {
              seller: listingData.seller.toLowerCase(),
              price: listingData.price,
            }
          : null
      )
    } catch (err) {
      console.error('NFT load failed:', err)
    } finally {
      setLoading(false)
    }
  }

    /* =========================
     LISTING LOGIC
  ========================== */
  async function handleList() {
    if (!listPrice || isNaN(Number(listPrice))) return alert('Enter valid price')

    try {
      setActionLoading(true)
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()
      const marketplaceAddress = (import.meta as any).env.VITE_MARKETPLACE_ADDRESS

      // 1. Approve Marketplace to move this NFT
      const nftContract = new ethers.Contract(collection, GalleryABI.abi, signer)
      const isApproved = await nftContract.getApproved(tokenId)
      
      if (isApproved.toLowerCase() !== marketplaceAddress.toLowerCase()) {
        const approveTx = await nftContract.approve(marketplaceAddress, tokenId)
        await approveTx.wait()
      }

      // 2. List on Marketplace
      const market = new ethers.Contract(marketplaceAddress, MarketplaceABI.abi, signer)
      const priceWei = ethers.parseEther(listPrice)
      const tx = await market.listItem(collection, tokenId, priceWei)
      await tx.wait()

      await load() // Refresh UI
    } catch (err: any) {
      console.error('Listing failed:', err)
      alert(err.reason || 'Transaction failed')
    } finally {
      setActionLoading(false)
    }
  }

  /* =========================
     Buying
  ========================== */
  async function handleBuy() {
    if (!listing) return

    const provider = new ethers.BrowserProvider(
      (window as any).ethereum
    )
    const signer = await provider.getSigner()

    const market = new ethers.Contract(
      (import.meta as any).env.VITE_MARKETPLACE_ADDRESS,
      MarketplaceABI.abi,
      signer
    )

    const tx = await market.buyItem(collection, tokenId, {
      value: listing.price,
    })
    await tx.wait()

    onNavigate('my-nfts')
  }

  async function handleCancel() {
    const provider = new ethers.BrowserProvider(
      (window as any).ethereum
    )
    const signer = await provider.getSigner()

    const market = new ethers.Contract(
      (import.meta as any).env.VITE_MARKETPLACE_ADDRESS,
      MarketplaceABI.abi,
      signer
    )

    const tx = await market.cancelListing(collection, tokenId)
    await tx.wait()

    await load()
  }

  async function handleCreateAuction() {
    if (!startPrice || Number(startPrice) <= 0) return alert('Invalid start price')

    try {
      setActionLoading(true)
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()
      const auctionAddress = (import.meta as any).env.VITE_AUCTION_ADDRESS

      const nftContract = new ethers.Contract(collection, GalleryABI.abi, signer)
      const auctionContract = new ethers.Contract(auctionAddress, AuctionABI.abi, signer)

      // 1. Approve Auction Contract
      const approved = await nftContract.getApproved(tokenId)
      if (approved.toLowerCase() !== auctionAddress.toLowerCase()) {
        await (await nftContract.approve(auctionAddress, tokenId)).wait()
      }

      // 2. Start Auction (Duration in seconds)
      const durationSec = Number(duration) * 3600
      const tx = await auctionContract.createAuction(
        collection,
        tokenId,
        ethers.parseEther(startPrice),
        durationSec
      )
      await tx.wait()
      
      await load()
    } catch (err: any) {
      console.error('Create auction failed:', err)
      alert(err.reason || 'Failed to start auction')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleBid() {
    if (!auction) return
    if (!bidAmount || Number(bidAmount) <= 0) {
      return alert('Enter a valid bid amount')
    }

    // Prevent seller from bidding
    if (isAuctionSeller) {
      return alert('Seller cannot bid on own auction')
    }

    // Enforce minimum bid
    const min =
      auction.highestBid > 0n
        ? Number(ethers.formatEther(auction.highestBid))
        : 0

    if (Number(bidAmount) <= min) {
      return alert(`Bid must be higher than ${min} ETH`)
    }

    try {
      setActionLoading(true)

      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()

      const auctionContract = new ethers.Contract(
        (import.meta as any).env.VITE_AUCTION_ADDRESS,
        AuctionABI.abi,
        signer
      )

      await (
        await auctionContract.bid(auction.id, {
          value: ethers.parseEther(bidAmount),
        })
      ).wait()

      setBidAmount('')
      await load()
    } catch (err: any) {
      alert(err.reason || 'Bidding failed')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleSettleAuction() {
    try {
      setActionLoading(true)
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()
      const auctionContract = new ethers.Contract(
        (import.meta as any).env.VITE_AUCTION_ADDRESS,
        AuctionABI.abi,
        signer
      )

      await (await auctionContract.settleAuction(auction.id)).wait()
      onNavigate('my-nfts')
    } catch (err: any) {
      alert(err.reason || 'Settlement failed')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleWithdraw() {
    const provider = new ethers.BrowserProvider((window as any).ethereum)
    const signer = await provider.getSigner()

    const auctionContract = new ethers.Contract(
      (import.meta as any).env.VITE_AUCTION_ADDRESS,
      AuctionABI.abi,
      signer
    )

    await (await auctionContract.withdraw()).wait()
  }

    async function handleCancelAuction() {
      try {
        setActionLoading(true)
        const provider = new ethers.BrowserProvider((window as any).ethereum)
        const signer = await provider.getSigner()
        const auctionContract = new ethers.Contract(
          (import.meta as any).env.VITE_AUCTION_ADDRESS,
          AuctionABI.abi,
          signer
        )

        const tx = await auctionContract.cancelAuction(auction.id)
        await tx.wait()
        await load()
      } catch (err: any) {
        console.error('Cancel auction failed:', err)
        alert(err.reason || 'Failed to cancel auction')
      } finally {
        setActionLoading(false)
      }
    }


  /* =========================
     UI STATES
  ========================== */
  if (loading || !nft) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading artwork…
      </div>
    )
  }

  const auctionSeller = auction?.seller ? auction.seller.toLowerCase() : null
  const isOwner = nft?.owner === user || auctionSeller === user
  const isAuctionSeller = auctionSeller === user
  const isListed = !!listing
  const isSeller = isListed && listing!.seller === user
  const canListAuction = isOwner && !isListed && !auction
  const isAuctionActive = auction && Date.now() / 1000 < Number(auction.endTime)

  const minBid =
    auction && auction.highestBid > 0n
      ? ethers.formatEther(auction.highestBid)
      : '0'

  console.log("buttonplay>>>", isSeller, isListed, isOwner, isAuctionSeller);

  return (
    <div
      className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1687676627083-e7df45578c8a?w=1920)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 backdrop-blur-md bg-black/70" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Back */}
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--gold)] mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </motion.button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="museum-frame overflow-hidden sticky top-28">
            {nft.image ? (
              <img
                src={nft.image}
                alt={nft.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="aspect-square flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <h1 className="text-5xl text-[var(--ivory)]">{nft.name}</h1>
            <p className="text-[var(--gold)] font-mono">Owner: {nft.owner.slice(0,6)}...{nft.owner.slice(-4)}</p>

            {artist && (
              <p className="text-[var(--gold)] font-mono">
                Artist: {artist.slice(0, 6)}…{artist.slice(-4)}
              </p>
            )}

            {nft.description && (
              <div className="museum-frame p-6">
                <p className="text-[var(--champagne)]">
                  {nft.description}
                </p>
              </div>
            )}

            {isListed && (
              <div className="museum-frame p-6">
                <p className="text-4xl text-[var(--gold)]">
                  {ethers.formatEther(listing!.price)} ETH
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4">
              {!isSeller && isListed && (
                <button onClick={handleBuy} className="w-full py-4 bg-gradient-to-r from-[var(--gold)] to-[var(--antique-brass)] rounded font-bold">
                  Purchase for {ethers.formatEther(listing!.price)} ETH
                </button>
              )}

              {/* 2. OWNER VIEW: Not listed yet */}
            {isOwner && !isListed && !auction && (
              <div className="museum-frame p-6 flex flex-col gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="List Price (ETH)"
                    value={listPrice}
                    onChange={(e) => setListPrice(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 p-4 rounded text-white"
                  />
                  <span className="absolute right-4 top-4 text-[var(--gold)]">ETH</span>
                </div>
                <button 
                  onClick={handleList} 
                  disabled={actionLoading}
                  className="w-full py-4 bg-[var(--gold)] text-black rounded font-bold flex items-center justify-center gap-2"
                >                  
                  List for Sale
                </button>
              </div>
            )}

             {auction && (
              <div className="museum-frame p-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--gold)] uppercase font-bold">Active Auction</span>
                  <span className="text-muted-foreground">
                    Ends: {new Date(Number(auction.endTime) * 1000).toLocaleString()}
                  </span>
                </div>

                <p className="text-3xl text-[var(--gold)]">
                  {auction.highestBid > 0n
                    ? `${ethers.formatEther(auction.highestBid)} ETH`
                    : 'No bids yet'}
                </p>

                {isAuctionActive ? (
                  isAuctionSeller ? (
                    <button
                      onClick={handleCancelAuction}
                      disabled={actionLoading}
                      className="w-full py-4 border-2 border-red-500/50 text-red-500 rounded font-bold hover:bg-red-500/10"
                    >
                      Cancel Auction
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder="Bid amount (ETH)"
                        className="flex-1 bg-black/40 border p-4 rounded"
                      />
                      <button
                        onClick={handleBid}
                        disabled={actionLoading}
                        className="px-8 bg-gradient-to-r from-[var(--gold)] to-[var(--antique-brass)] rounded font-bold"
                      >
                        Bid
                      </button>
                    </div>
                  )
                ) : (
                  <button
                    onClick={handleSettleAuction}
                    disabled={actionLoading}
                    className="w-full py-4 bg-[var(--gold)] text-black rounded font-bold"
                  >
                    Settle Auction
                  </button>
                )}
              </div>
            )}
            
            {canListAuction && (
              <div className="museum-frame p-6 space-y-4">
                <input
                  value={startPrice}
                  onChange={(e) => setStartPrice(e.target.value)}
                  placeholder="Start price (ETH)"
                  className="w-full bg-black/40 border p-4 rounded"
                />

                <input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Duration (hours)"
                  className="w-full bg-black/40 border p-4 rounded"
                />

                <button
                  onClick={handleCreateAuction}
                  className="w-full py-4 border rounded font-bold"
                >
                  Start Auction
                </button>
              </div>
            )}


              {/* 3. OWNER/SELLER VIEW: Already listed */}
            {isSeller && (
              <button onClick={handleCancel} className="w-full py-4 border-2 border-red-500/50 text-red-500 rounded font-bold hover:bg-red-500/10">
                Cancel Listing ({ethers.formatEther(listing!.price)} ETH)
              </button>
            )}

              <button
                onClick={() => setLiked(!liked)}
                className="px-4 py-4 border rounded"
              >
                <Heart
                  className={
                    liked
                      ? 'fill-red-500 text-red-500'
                      : 'text-muted-foreground'
                  }
                />
              </button>

              <button className="px-4 py-4 border rounded">
                <Share2 />
              </button>
            </div>

            {/* Blockchain */}
            <div className="museum-frame p-6 text-sm text-muted-foreground">
              <p>Contract: {collection.slice(0, 6)}…</p>
              <p>Token ID: #{tokenId}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
