import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ethers } from 'ethers'
import { Package, TrendingUp, DollarSign, Plus } from 'lucide-react'

import FactoryABI from '../abis/CollectionFactory.json'
import GalleryABI from '../abis/GalleryNFT.json'
import MarketplaceABI from '../abis/GalleryMarketplace.json'
import AuctionABI from '../abis/GalleryAuction.json'
import { NFTCard } from '../components/NFTCard'

interface MyNFTsPageProps {
  onNavigate: (page: string, data?: any) => void
}

interface OwnedNFT {
  collection: string
  tokenId: number
  image: string
  name: string
  price: bigint
  listed: boolean
}

const ipfs = (u?: string) =>
  u && u.startsWith('ipfs://')
    ? u.replace('ipfs://', 'https://ipfs.io/ipfs/')
    : u || ''


export function MyNFTsPage({ onNavigate }: MyNFTsPageProps) {
  const [nfts, setNfts] = useState<OwnedNFT[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'owned' | 'minted'>('owned')

  /* =========================
     LOAD USER NFTS (REAL LOGIC)
  ========================== */
  useEffect(() => {
    loadNFTs()
  }, [])

  async function loadNFTs() {
    try {
      setLoading(true)

      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()
      const user = (await signer.getAddress()).toLowerCase()
      const marketplaceAddress = (import.meta as any).env.VITE_MARKETPLACE_ADDRESS.toLowerCase()
      const auctionAddress = (import.meta as any).env.VITE_AUCTION_ADDRESS.toLowerCase()


      const factory = new ethers.Contract(
        (import.meta as any).env.VITE_FACTORY_ADDRESS,
        FactoryABI.abi,
        provider
      )

      const market = new ethers.Contract(
        (import.meta as any).env.VITE_MARKETPLACE_ADDRESS,
        MarketplaceABI.abi,
        provider
      )

      const auctionContract = new ethers.Contract(
        auctionAddress,
        AuctionABI.abi,
        provider
      )

      const auctionMap = new Map<string, { seller: string; price: bigint }>()
      try {
        const totalAuctions = await auctionContract.auctionCounter()
        for (let i = 1; i <= Number(totalAuctions); i++) {
          const a = await auctionContract.auctions(i)
          if (!a.settled) {
            const key = `${a.nft.toLowerCase()}-${Number(a.tokenId)}`
            auctionMap.set(key, { 
              seller: a.seller.toLowerCase(), 
              price: a.highestBid 
            })
          }
        }
      } catch (err) {
        console.warn('Failed to load auctions:', err)
      }

      const collections: string[] = await factory.getAllCollections()
      const owned: OwnedNFT[] = []

      for (const collection of collections) {
        const nft = new ethers.Contract(
          collection,
          GalleryABI.abi,
          provider
        )

        let total: bigint
        try {
          total = await nft.tokenCounter()
        } catch {
          continue
        }

        for (let tokenId = 1; tokenId <= Number(total); tokenId++) {
          let owner: string

          try {
            owner = (await nft.ownerOf(tokenId)).toLowerCase()
          } catch {
            continue
          }

          const listing = await market.listings(collection, tokenId)
          const auctionData = auctionMap.get(`${collection.toLowerCase()}-${tokenId}`)

          const isOwned =
            owner === user ||
            (owner === marketplaceAddress &&
              listing.price > 0n &&
              listing.seller.toLowerCase() === user) ||
            (owner === auctionAddress &&
              auctionData?.seller === user)

          if (!isOwned) continue

          /* Metadata */
          let meta: any = {}
          try {
            const uri = await nft.tokenURI(tokenId)
            if (!uri) throw new Error('Empty tokenURI')
            const res = await fetch(ipfs(uri))
            const text = await res.text()
            if (!text.startsWith('<')) meta = JSON.parse(text)
          } catch (err) {
            console.warn('Failed to fetch metadata', err)
          }
          
          owned.push({
            collection,
            tokenId,
            image: meta.image ? ipfs(meta.image) : '',
            name: meta.name || `NFT #${tokenId}`,
            price: listing.price,
            listed: listing.price > 0n,
          })
        }
      }

      setNfts(owned)
    } catch (err) {
      console.error('MyNFTs load failed:', err)
    } finally {
      setLoading(false)
    }
  }

  /* =========================
     STATS
  ========================== */
  const totalListed = nfts.filter((nft) => nft.listed).length
  const totalValue = nfts.reduce(
    (sum, nft) => sum + Number(ethers.formatEther(nft.price || 0n)),
    0
  )

  /* =========================
     UI STATES
  ========================== */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading your collection…
      </div>
    )
  }

  return (
    <div
      className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative"
      style={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1718359760007-4b11d377689c?w=1920)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 backdrop-blur-sm bg-black/60" />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="relative mb-12">
            {/* Absolute positioned button */}
            <div className="absolute -top-4 right-0">
              <button
                onClick={() => onNavigate('mint-nft')}
                className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--gold)] to-[var(--antique-brass)] text-[var(--deep-black)] rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[var(--gold)]/20"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Mint New Artwork</span>
              </button>
            </div>

        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="mb-2 text-[var(--ivory)] font-serif text-4xl">My Private Gallery</h1>
          <p className="text-lg text-[var(--champagne)] opacity-80">
            Artworks you own or have listed
          </p>
        </motion.div>
      </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="museum-frame p-6">
            <Package className="text-[var(--gold)] mb-2" />
            <p className="text-sm text-muted-foreground uppercase">Total NFTs</p>
            <p className="text-2xl text-[var(--ivory)]">{nfts.length}</p>
          </div>

          <div className="museum-frame p-6">
            <TrendingUp className="text-[var(--gold)] mb-2" />
            <p className="text-sm text-muted-foreground uppercase">Listed</p>
            <p className="text-2xl text-[var(--ivory)]">{totalListed}</p>
          </div>

          <div className="museum-frame p-6">
            <DollarSign className="text-[var(--gold)] mb-2" />
            <p className="text-sm text-muted-foreground uppercase">Total Value</p>
            <p className="text-2xl text-[var(--gold)]">
              {totalValue.toFixed(2)} ETH
            </p>
          </div>
        </div>

        {/* NFT GRID */}
        {nfts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            You don’t own any artworks yet
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {nfts.map((nft, index) => (
              <NFTCard
                key={`${nft.collection}-${nft.tokenId}`}
                nft={{
                  id: `${nft.collection}-${nft.tokenId}`,
                  image: nft.image,
                  name: nft.name,
                  price: Number(ethers.formatEther(nft.price || 0n)),
                  isListed: nft.listed,
                  artist: "Me",
                  collectionName: "",
                }}
                index={index}
                onClick={() => onNavigate('nft-detail', { nft: nft })
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
