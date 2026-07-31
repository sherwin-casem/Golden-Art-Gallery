import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, SlidersHorizontal } from 'lucide-react';
import { mockCollections, mockArtists } from '../lib/mockData';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
}

interface FilterOptions {
  priceRange: { min: number; max: number };
  category: string;
  artist: string;
  sortBy: string;
}

export function FilterModal({ isOpen, onClose, onApply }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: { min: 0, max: 100 },
    category: '',
    artist: '',
    sortBy: 'newest',
  });

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      priceRange: { min: 0, max: 100 },
      category: '',
      artist: '',
      sortBy: 'newest',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl museum-frame p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-6 h-6 text-[var(--gold)]" />
                <h3 className="text-[var(--ivory)]">Filters & Sorting</h3>
              </div>
              <button
                onClick={onClose}
                className="btn btn-icon"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters */}
            <div className="space-y-6">
              {/* Price Range */}
              <div>
                <label className="block mb-3">Price Range (ETH)</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={filters.priceRange.min}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        priceRange: { ...filters.priceRange, min: Number(e.target.value) },
                      })
                    }
                    placeholder="Min"
                    className="px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--gold)] text-[var(--ivory)]"
                  />
                  <input
                    type="number"
                    value={filters.priceRange.max}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        priceRange: { ...filters.priceRange, max: Number(e.target.value) },
                      })
                    }
                    placeholder="Max"
                    className="px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--gold)] text-[var(--ivory)]"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block mb-3">Collection</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--gold)] text-[var(--ivory)]"
                >
                  <option value="">All Collections</option>
                  {mockCollections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Artist */}
              <div>
                <label className="block mb-3">Artist</label>
                <select
                  value={filters.artist}
                  onChange={(e) => setFilters({ ...filters, artist: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--gold)] text-[var(--ivory)]"
                >
                  <option value="">All Artists</option>
                  {mockArtists.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block mb-3">Sort By</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'newest', label: 'Newest' },
                    { value: 'oldest', label: 'Oldest' },
                    { value: 'price-high', label: 'Price: High to Low' },
                    { value: 'price-low', label: 'Price: Low to High' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilters({ ...filters, sortBy: option.value })}
                      className={`btn btn-md ${
                        filters.sortBy === option.value
                          ? 'btn-toggle-active'
                          : 'btn-toggle'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-border">
              <button
                onClick={handleReset}
                className="btn btn-outline btn-md btn-flex-1"
              >
                Reset
              </button>
              <button
                onClick={handleApply}
                className="btn btn-primary btn-md btn-flex-1"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
