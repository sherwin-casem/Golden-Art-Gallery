import React, { useState } from 'react';
import { Search, Menu, X, Wallet, LogOut, User } from 'lucide-react';
import { useWallet } from '../lib/WalletContext';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onSearch: (query: string) => void;
}

export function Navbar({ onNavigate, currentPage, onSearch }: NavbarProps) {
  const { isConnected, address, disconnect, connect } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { label: 'Home', value: 'home' },
    { label: 'Collections', value: 'collections' },
    { label: 'Auctions', value: 'auctions' },
    ...(isConnected ? [{ label: 'My NFTs', value: 'my-nfts' }] : []),
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

    const truncateAddress = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[var(--deep-black)]/80 backdrop-blur-xl border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="cursor-pointer flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded bg-gradient-to-br from-[var(--gold)] to-[var(--antique-brass)] flex items-center justify-center group-hover:shadow-lg group-hover:shadow-[var(--gold-glow)] transition-shadow duration-300">
              <span className="text-[var(--deep-black)] font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-serif hidden sm:block text-[var(--gold)]">Artisan</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => onNavigate(item.value)}
                className={`cursor-pointer relative py-2 transition-colors duration-300 ${
                  currentPage === item.value
                    ? 'text-[var(--gold)]'
                    : 'text-[var(--ivory)] hover:text-[var(--gold)]'
                }`}
              >
                {item.label}
                {currentPage === item.value && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--gold)] to-[var(--antique-brass)]"
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search artworks, artists, collections..."
                className="w-full pl-10 pr-4 py-2 bg-[var(--input-background)] border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)] transition-all"
              />
            </div>
          </form>

          {/* Wallet Info & User Menu */}
          <div className="flex items-center gap-4">
            {isConnected && address ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="cursor-pointer flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-[var(--gold)] to-[var(--antique-brass)] text-[var(--deep-black)] rounded hover-glow transition-all duration-300"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">
                    {truncateAddress(address)}
                    </span>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-48 museum-frame p-2"
                    >
                      <button
                        onClick={() => {
                          disconnect();
                          setShowUserMenu(false);
                        }}
                        className="cursor-pointer w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-[var(--muted)] rounded transition-colors text-destructive"
                      >
                        <LogOut className="w-4 h-4" />
                        Disconnect
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={connect} // Or call connect() from context
                className="px-6 py-2 border border-[var(--gold)] text-[var(--gold)] rounded hover:bg-[var(--gold)] hover:text-[var(--deep-black)] transition-all duration-300 text-sm font-medium"
              >
                Connect Wallet
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="cursor-pointer lg:hidden text-[var(--ivory)] hover:text-[var(--gold)] transition-colors"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-border py-4 space-y-2"
            >
              {navItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    onNavigate(item.value);
                    setShowMobileMenu(false);
                  }}
                  className={`block w-full text-left px-4 py-2 rounded transition-colors ${
                    currentPage === item.value
                      ? 'bg-[var(--muted)] text-[var(--gold)]'
                      : 'text-[var(--ivory)] hover:bg-[var(--muted)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
