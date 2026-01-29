import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, Check } from 'lucide-react';
import { ethers } from 'ethers'
import FactoryABI from '../abis/CollectionFactory.json'
import { uploadToPinata, uploadJSONToPinata } from '../utils/pinata'

interface CreateCollectionPageProps {
  onNavigate: (page: string) => void;
}

export function CreateCollectionPage({ onNavigate }: CreateCollectionPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverFile: '',
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (file: File) => {
    setCoverFile(file);
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      coverFile: previewUrl,
    }));
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !coverFile) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      /* 1️⃣ Upload banner */
      const bannerURI = await uploadToPinata(coverFile);

      /* 2️⃣ Upload metadata */
      const metadata = {
        name: formData.name,
        description: formData.description,
        banner: bannerURI,
      };

      const collectionURI = await uploadJSONToPinata(metadata);

      /* 3️⃣ Factory call */
      const factory = new ethers.Contract(
        (import.meta as any).env.VITE_FACTORY_ADDRESS,
        FactoryABI.abi,
        signer
      );

      const tx = await factory.createCollection(
        formData.name,
        formData.name.toUpperCase().slice(0, 5),
        collectionURI
      );

      await tx.wait();

      setSuccess(true);

      setTimeout(() => {
        onNavigate('collections');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('Collection creation failed');
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="mb-4 text-[var(--ivory)]">Collection Created Successfully</h2>
          <p className="text-[var(--champagne)]">Redirecting to your gallery...</p>
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
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="mb-4 text-[var(--ivory)]">Create New Collection</h1>
          <p className="text-xl text-[var(--champagne)]">
            Curate a new exhibition for your digital masterpieces
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Collection Name */}
              <div className="museum-frame p-6">
                <label className="block mb-3">Collection Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter collection name..."
                  required
                  className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--gold)] transition-all text-[var(--ivory)]"
                />
              </div>

              {/* Description */}
              <div className="museum-frame p-6">
                <label className="block mb-3">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your collection's theme and vision..."
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--gold)] transition-all resize-none text-[var(--ivory)]"
                />
              </div>

              {/* Cover Image */}
              <div className="museum-frame p-6">
                <label className="block mb-3">Cover Image</label>
                  <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onFileChange}
                  accept="image/*"
                  className="hidden"
                />
                {formData.coverFile ? (
                  <div className="relative aspect-video rounded overflow-hidden mb-4">
                    <img
                      src={formData.coverFile}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute top-2 right-2 px-3 py-1 bg-black/80 text-white text-sm rounded hover:bg-black transition-colors"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-video border-2 border-dashed border-[var(--border)] rounded flex flex-col items-center justify-center gap-4 hover:border-[var(--gold)] transition-colors group"
                  >
                    <Upload className="w-12 h-12 text-muted-foreground group-hover:text-[var(--gold)] transition-colors" />
                    <div className="text-center">
                      <p className="text-[var(--ivory)] mb-1">Upload Cover Image</p>
                      <p className="text-sm text-muted-foreground">
                        Recommended: 1920x1080px
                      </p>
                    </div>
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setPreview(!preview)}
                  className="flex-1 px-6 py-4 border-2 border-[var(--gold)] text-[var(--gold)] rounded hover-glow transition-all duration-400"
                >
                  {preview ? 'Edit' : 'Preview'}
                </button>
                <button
                  type="submit"
                  disabled={!formData.name || !formData.description || !formData.coverFile}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-[var(--gold)] to-[var(--antique-brass)] text-[var(--deep-black)] rounded hover-lift transition-all duration-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:sticky lg:top-24"
          >
            <div className="museum-frame p-6">
              <h3 className="mb-6 text-[var(--ivory)]">Live Preview</h3>
              
              {formData.coverFile ? (
                <div className="museum-frame overflow-hidden">
                  <div className="relative aspect-video overflow-hidden bg-[var(--deep-black)]">
                    <img
                      src={formData.coverFile}
                      alt="Collection preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h4 className="text-[var(--ivory)] mb-2 golden-underline inline-block">
                        {formData.name || 'Collection Name'}
                      </h4>
                      <p className="text-sm text-[var(--champagne)] line-clamp-2">
                        {formData.description || 'Your collection description will appear here...'}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-b from-[rgba(26,26,26,0.95)] to-[rgba(18,18,18,0.98)]">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase mb-1">Items</p>
                        <p className="text-[var(--ivory)]">0</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase mb-1">Floor</p>
                        <p className="text-[var(--gold)]">-- ETH</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase mb-1">Volume</p>
                        <p className="text-[var(--ivory)]">0 ETH</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video rounded border-2 border-dashed border-[var(--border)] flex items-center justify-center">
                  <p className="text-muted-foreground">Upload a cover image to see preview</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
