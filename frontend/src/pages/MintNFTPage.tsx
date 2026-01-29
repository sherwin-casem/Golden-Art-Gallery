import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Upload, Check, ArrowRight, ArrowLeft } from 'lucide-react'
import { ethers } from 'ethers'

import FactoryABI from '../abis/CollectionFactory.json'
import GalleryABI from '../abis/GalleryNFT.json'
import { uploadToPinata, uploadJSONToPinata } from '../utils/pinata'

const ipfs = (url: string) => url?.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');

interface Collection {
  id: string; // Add this if you use 'id'
  address: string;
  name: string;
  coverImage: string;
  nftCount: number;
  floorPrice: string;
}

export function MintNFTPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    image: '', // preview URL
    name: '',
    description: '',
    artist: '',
    collectionId: '', // The address of the selected NFT contract
  });

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  /* =========================
     LOAD ACTIVE COLLECTIONS
  ========================== */
  useEffect(() => {
    async function loadCollections() {
      try {
        if (!(window as any).ethereum) return;
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const factory = new ethers.Contract(
          (import.meta as any).env.VITE_FACTORY_ADDRESS,
          FactoryABI.abi,
          provider
        );

        const addresses: string[] = await factory.getAllCollections();

        const data = await Promise.all(
          addresses.map(async (addr: string) => {
            const active = await factory.isCollectionActive(addr);
            if (!active) return null;

            const nft = new ethers.Contract(addr, GalleryABI.abi, provider);
            const [name, uri] = await Promise.all([nft.name(), nft.collectionURI()]);

            let meta = { banner: '' };
            if (uri) {
              try { meta = await fetch(ipfs(uri)).then(r => r.json()); } catch (e) {}
            }

            return {
              address: addr,
              name,
              coverImage: meta.banner ? ipfs(meta.banner) : 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400',
              nftCount: 0,
              floorPrice: '0',
            };
          })
        );

        setCollections(data.filter((c): c is Collection => c !== null));
      } catch (err) {
        console.error('Load collections failed:', err);
      }
    }
    loadCollections();
  }, []);


    /* =========================
     IMAGE UPLOAD TRIGGER
  ========================== */
  const triggerFileInput = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setFormData(prev => ({
      ...prev,
      image: URL.createObjectURL(file), // Create local preview URL
    }));
  };

  /* =========================
     MINT LOGIC (REAL)
  ========================== */
  async function handleMint() {
    if (
      !formData.collectionId ||
      !formData.name ||
      !formData.description ||
      !imageFile
    ) {
      setError('All fields are required')
      return
    }

    try {
      setLoading(true)
      setError('')

      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()

      /* 1️⃣ Upload image */
      const imageURI = await uploadToPinata(imageFile)

      /* 2️⃣ Upload metadata */
      const metadata = {
        name: formData.name,
        description: formData.description,
        image: imageURI,
        attributes: [{ trait_type: "Artist", value: formData.artist }]
      }

      const tokenURI = await uploadJSONToPinata(metadata)

      /* 3️⃣ Mint */
      const nftContract = new ethers.Contract(formData.collectionId, GalleryABI.abi, signer);
      const mintFee = await nftContract.mintFee();

      const tx = await nftContract.mint(tokenURI, {
        value: mintFee.toString(),
      });
      
      await tx.wait();
      setSuccess(true);
      setTimeout(() => onNavigate('my-nfts'), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.reason || 'Mint failed. Ensure you have enough ETH for gas and fees.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1718359760007-4b11d377689c?w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 backdrop-blur-md bg-black/70" />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--antique-brass)] flex items-center justify-center mx-auto mb-6 animate-glow"
          >
            <Check className="w-12 h-12 text-[var(--deep-black)]" />
          </motion.div>
          <h2 className="mb-4 text-[var(--ivory)]">NFT Minted Successfully</h2>
          <p className="text-[var(--champagne)] mb-2">Your artwork is now on the blockchain</p>
          <p className="text-sm text-muted-foreground">Redirecting to your gallery...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1718359760007-4b11d377689c?w=1920)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 backdrop-blur-sm bg-black/60" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-400 ${
                    step >= s
                      ? 'bg-gradient-to-br from-[var(--gold)] to-[var(--antique-brass)] text-[var(--deep-black)]'
                      : 'border-2 border-[var(--border)] text-muted-foreground'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-16 h-0.5 transition-colors duration-400 ${
                      step > s ? 'bg-[var(--gold)]' : 'bg-[var(--border)]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-[var(--ivory)]">
              {step === 1 && 'Upload Artwork'}
              {step === 2 && 'Add Metadata'}
              {step === 3 && 'Preview & Select Collection'}
              {step === 4 && 'Mint NFT'}
            </h2>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form Steps */}
          <div>
            <AnimatePresence mode="wait">
              {/* Step 1: Upload */}
              {step === 1 && (
    <div className="museum-frame p-8">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*" 
      />
      {formData.image ? (
        <div className="space-y-6">
          <div className="aspect-square rounded overflow-hidden">
            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-4">
            <button onClick={triggerFileInput} className="flex-1 px-6 py-3 border border-[var(--gold)] text-[var(--gold)] rounded transition-colors">Change Image</button>
            <button onClick={() => setStep(2)} className="flex-1 px-6 py-3 bg-[var(--gold)] text-black rounded font-bold">Next Step</button>
          </div>
        </div>
      ) : (
        <button
          onClick={triggerFileInput}
          className="w-full aspect-square border-2 border-dashed border-white/20 rounded flex flex-col items-center justify-center gap-4 hover:border-[var(--gold)] transition-all"
        >
          <Upload className="w-12 h-12 text-white/40" />
          <p className="text-white/60">Drop your artwork here or click to browse</p>
        </button>
      )}
    </div>
  )}

              {/* Step 2: Metadata */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="museum-frame p-6">
                    <label className="block mb-3">Artwork Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter artwork name..."
                      className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--gold)] text-[var(--ivory)]"
                    />
                  </div>

                  <div className="museum-frame p-6">
                    <label className="block mb-3">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your artwork..."
                      rows={4}
                      className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--gold)] resize-none text-[var(--ivory)]"
                    />
                  </div>

                  <div className="museum-frame p-6">
                    <label className="block mb-3">Artist Name</label>
                    <input
                      type="text"
                      value={formData.artist}
                      onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                      placeholder="Your name or pseudonym..."
                      className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--gold)] text-[var(--ivory)]"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-3 border-2 border-[var(--border)] text-[var(--ivory)] rounded hover:border-[var(--gold)] transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!formData.name || !formData.description || !formData.artist}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--gold)] to-[var(--antique-brass)] text-[var(--deep-black)] rounded hover-lift transition-all duration-400 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Collection Selection */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="museum-frame p-6">
                    <label className="block mb-4">Select Collection</label>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {collections.map((collection) => (
                        <button
                          key={collection.address}
                          onClick={() => setFormData({ ...formData, collectionId: collection.address})}
                          className={`w-full p-4 rounded border-2 transition-all duration-300 text-left ${
                            formData.collectionId === collection.address
                              ? 'border-[var(--gold)] bg-[var(--gold)]/10'
                              : 'border-[var(--border)] hover:border-[var(--gold)]/50'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={collection.coverImage}
                              alt={collection.name}
                              className="w-16 h-16 rounded object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="text-[var(--ivory)] mb-1">{collection.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {collection.nftCount} items • Floor {collection.floorPrice} ETH
                              </p>
                            </div>
                            {formData.collectionId === collection.address && (
                              <Check className="w-5 h-5 text-[var(--gold)]" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(2)}
                      className="px-6 py-3 border-2 border-[var(--border)] text-[var(--ivory)] rounded hover:border-[var(--gold)] transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      disabled={!formData.collectionId}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--gold)] to-[var(--antique-brass)] text-[var(--deep-black)] rounded hover-lift transition-all duration-400 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Preview <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Mint */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="museum-frame p-8 space-y-6"
                >
                  <div>
                    <h3 className="text-[var(--ivory)] mb-4">Review & Mint</h3>
                    <p className="text-muted-foreground mb-6">
                      Please review your NFT details before minting. This action cannot be undone.
                    </p>
                  </div>

                  <div className="space-y-3 py-4 border-y border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gas Fee</span>
                      <span className="text-[var(--ivory)]">~0.005 ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform Fee</span>
                      <span className="text-[var(--ivory)]">2.5%</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="text-[var(--gold)]">Total Cost</span>
                      <span className="text-[var(--gold)]">~0.005 ETH</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(3)}
                      className="px-6 py-3 border-2 border-[var(--border)] text-[var(--ivory)] rounded hover:border-[var(--gold)] transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      onClick={handleMint} disabled={loading}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-[var(--gold)] to-[var(--antique-brass)] text-[var(--deep-black)] rounded hover-lift transition-all duration-400"
                    >
                      Mint NFT
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="museum-frame p-6">
              <h3 className="mb-6 text-[var(--ivory)]">Preview</h3>
              
              {formData.image ? (
                <div className="museum-frame overflow-hidden">
                  <div className="aspect-square bg-[var(--deep-black)]">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 bg-gradient-to-b from-[rgba(26,26,26,0.95)] to-[rgba(18,18,18,0.98)]">
                    <h4 className="text-[var(--ivory)] mb-1">
                      {formData.name || 'Artwork Name'}
                    </h4>
                    <p className="text-sm text-[var(--gold)] mb-4">
                      {formData.artist || 'Artist Name'}
                    </p>
                    {formData.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {formData.description}
                      </p>
                    )}
                    {formData.collectionId && (
                      <p className="text-xs text-muted-foreground">
                        Collection: {collections.find((c) => c.address === formData.collectionId)?.name}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="aspect-square rounded border-2 border-dashed border-[var(--border)] flex items-center justify-center">
                  <p className="text-muted-foreground">Upload artwork to preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
