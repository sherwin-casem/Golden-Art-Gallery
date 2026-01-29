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
  const [artist, setArtist] = useState('')
  const [loading, setLoading] = useState(true)
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
     ACTIONS
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

  const isListed = !!listing
  const isSeller = isListed && listing!.seller === user

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
            <div className="flex gap-4">
              {!isSeller && isListed && (
                <button
                  onClick={handleBuy}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-[var(--gold)] to-[var(--antique-brass)] rounded"
                >
                  Purchase Now
                </button>
              )}

              {isSeller && (
                <button
                  onClick={handleCancel}
                  className="flex-1 px-6 py-4 border-2 border-destructive text-destructive rounded"
                >
                  Cancel Listing
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
