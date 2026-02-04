import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { NFTCard } from '../components/NFTCard';
import { CollectionCard } from '../components/CollectionCard';

import FactoryABI from '../abis/CollectionFactory.json';
import GalleryABI from '../abis/GalleryNFT.json';
import MarketplaceABI from '../abis/GalleryMarketplace.json';

const ipfs = (u?: string) =>
  u?.startsWith('ipfs://')
    ? u.replace('ipfs://', 'https://ipfs.io/ipfs/')
    : u || '';

type Filter = 'all' | 'collection' | 'nft';

interface SearchPageProps {
  query: string;
  onNavigate: (page: string, data?: any) => void;
}

export function SearchPage({ query, onNavigate }: SearchPageProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [collections, setCollections] = useState<any[]>([]);
  const [nfts, setNFTs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runSearch();
  }, [query]);

  async function runSearch() {
    try {
      setLoading(true);

      const provider = new ethers.BrowserProvider(
        (window as any).ethereum
      );

      const factory = new ethers.Contract(
        (import.meta as any).env.VITE_FACTORY_ADDRESS,
        FactoryABI.abi,
        provider
      );

      const market = new ethers.Contract(
        (import.meta as any).env.VITE_MARKETPLACE_ADDRESS,
        MarketplaceABI.abi,
        provider
      );

      const addresses: string[] = await factory.getAllCollections();
      const q = query.toLowerCase();

      const foundCollections: any[] = [];
      const foundNFTs: any[] = [];

      for (const addr of addresses) {
        const nft = new ethers.Contract(addr, GalleryABI.abi, provider);
        const [name, uri, total] = await Promise.all([
          nft.name(),
          nft.collectionURI(),
          nft.tokenCounter(),
        ]);

        let meta: any = {};
        try {
          meta = uri ? await fetch(ipfs(uri)).then(r => r.json()) : {};
        } catch {}

        let floorPrice = Infinity;
            let listedCount = 0;
            let volume = 0;
            
            for (let tokenId = 1; tokenId <= total; tokenId++) {
                const listing = await market.listings(addr, tokenId);
            
                if (listing.price > 0n) {
                listedCount++;
            
                const price = Number(
                    ethers.formatEther(listing.price)
                );
            
                volume += price;
            
                if (price < floorPrice) {
                    floorPrice = price;
                }
                }
            }

        /* COLLECTION MATCH */
        if (
          name?.toLowerCase().includes(q) ||
          meta?.description?.toLowerCase().includes(q)
        ) {
          foundCollections.push({
            address: addr,
            name,
            description: meta.description || '',
            coverImage: meta.banner ? ipfs(meta.banner) : '',
            nftCount: listedCount, // only listed NFTs
            floorPrice: floorPrice === Infinity ? 0 : floorPrice, //  live floor
            artistName: meta.artistName,
            volume: volume,
          });
        }

        /* NFT MATCH */
        for (let tokenId = 1; tokenId <= Number(total); tokenId++) {
          const listing = await market.listings(addr, tokenId);
          if (listing.price === 0n) continue;

          let tokenMeta: any = {};
          try {
            const uri = await nft.tokenURI(tokenId);
            tokenMeta = await fetch(ipfs(uri)).then(r => r.json());
          } catch {}

          if (
            tokenMeta?.name?.toLowerCase().includes(q) ||
            tokenMeta?.description?.toLowerCase().includes(q)
          ) {
            foundNFTs.push({
              id: `${addr}-${tokenId}`,
              collection: addr,
              tokenId,
              name: tokenMeta.name,
              image: ipfs(tokenMeta.image),
              price: Number(
                ethers.formatEther(listing.price)
              ),
              isListed: true,
            });
          }
        }
      }

      setCollections(foundCollections);
      setNFTs(foundNFTs);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  }

  const showCollections = filter === 'all' || filter === 'collection';
  const showNFTs = filter === 'all' || filter === 'nft';

  return (
    <div className="min-h-screen pt-24 px-6 flex gap-8">
      {/* SIDEBAR */}
      <aside className="w-48 space-y-4">
        {['all', 'collection', 'nft'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as Filter)}
            className={`block w-full text-left px-4 py-2 rounded ${
              filter === f
                ? 'bg-[var(--gold)] text-black'
                : 'text-[var(--ivory)] hover:bg-white/10'
            }`}
          >
            {f === 'all'
              ? 'All'
              : f === 'collection'
              ? 'Collections'
              : 'NFTs'}
          </button>
        ))}
      </aside>

      {/* RESULTS */}
      <main className="flex-1">
        {loading ? (
          <div className="text-gray-400">Searching…</div>
        ) : (
          <>
            {showCollections && collections.length > 0 && (
              <>
                <h2 className="mb-4">Collections</h2>
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  {collections.map((c, i) => (
                    <CollectionCard
                      key={c.address}
                      collection={c}
                      coverImage={c.coverImage}
                      index={i}
                      onClick={() =>
                        onNavigate('collections', {
                          collection: c,
                        })
                      }
                    />
                  ))}
                </div>
              </>
            )}

            {showNFTs && nfts.length > 0 && (
              <>
                <h2 className="mb-4">NFTs</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {nfts.map((nft, i) => (
                    <NFTCard
                      key={nft.id}
                      nft={nft}
                      index={i}
                      onClick={() =>
                        onNavigate('nft-detail', {
                          nft: {
                            collection: nft.collection,
                            tokenId: nft.tokenId,
                          },
                        })
                      }
                    />
                  ))}
                </div>
              </>
            )}

            {collections.length === 0 && nfts.length === 0 && (
              <div className="text-gray-500">
                No results found
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
