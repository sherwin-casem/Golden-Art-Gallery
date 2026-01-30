import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Heart, Share2 } from 'lucide-react'
import { ethers } from 'ethers'

import GalleryABI from '../abis/GalleryNFT.json'
import MarketplaceABI from '../abis/GalleryMarketplace.json'

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

  const isOwner = !listing && nft?.owner === user
  const isListed = !!listing
  const isSeller = isListed && listing!.seller === user

  console.log("buttonplay>>>", isSeller, isListed, isOwner);

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
            {isOwner && !isListed && (
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
