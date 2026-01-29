import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--gold)]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-[var(--antique-brass)]/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="px-4 py-1.5 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/5 text-[var(--gold)] text-xs uppercase tracking-widest font-medium mb-6 inline-block">
              The World's Premier Digital Art Gallery
            </span>
            <h1 className="text-5xl md:text-7xl font-serif text-[var(--ivory)] mb-8 leading-[1.1]">
              Collect Rare <span className="text-gradient">Masterpieces</span> <br />
              in the Digital Age
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Experience the intersection of luxury and technology. Discover curated collections 
              from world-renowned artists and emerging visionaries.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-6"
          >
            <button className="px-8 py-4 bg-gradient-to-r from-[var(--gold)] to-[var(--antique-brass)] text-[var(--deep-black)] font-semibold rounded hover-glow transition-all flex items-center gap-2">
              Explore Collections
              <ArrowUpRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 border border-[var(--border)] text-[var(--ivory)] font-semibold rounded hover:bg-[var(--white)]/5 transition-all">
              Create Your Art
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-20 pt-10 border-t border-[var(--border)]"
          >
            <div>
              <p className="text-3xl font-serif text-[var(--gold)]">24k+</p>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">Artworks</p>
            </div>
            <div>
              <p className="text-3xl font-serif text-[var(--gold)]">150+</p>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">Artists</p>
            </div>
            <div className="col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-[var(--border)] pt-8 md:pt-0 md:pl-8">
              <div className="flex items-center justify-center gap-4 text-left">
                <div className="p-3 rounded bg-[var(--gold)]/10 text-[var(--gold)]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[var(--ivory)] font-medium">Verified Assets</p>
                  <p className="text-xs text-muted-foreground">Blockchain authenticated</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}