// src/pages/DesignersPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Users, SlidersHorizontal, X } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { DesignerCard } from '../components/designers/DesignerCard';
import { Card } from '@/components/ui/card';
import type { Designer } from '@/types/designer';


// ─── Types ────────────────────────────────────────────────────────────────────

// export interface Designer {
//   _id: string;
//   name: string;
//   avatar: string;
//   coverImage: string;
//   tagline: string;
//   location: string;
//   verified: boolean;
//   superVerified: boolean;
//   rating: number;
//   reviewCount: number;
//   projectsCompleted: number;
//   responseTime: string;
//   startingPrice: number;
//   styles: string[];
//   portfolioImages: string[];
//   about: string;
// }

// ─── Filter options ───────────────────────────────────────────────────────────

const LOCATIONS = ['All', 'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];
const STYLES    = ['All', 'Modern', 'African Fusion', 'Minimalist', 'Luxury',
                   'Bohemian', 'Coastal', 'Budget-Friendly', 'Industrial', 'Scandinavian', 'Art Deco'];
const SORT_OPTIONS = [
  { value: 'rating',   label: 'Highest Rated'    },
  { value: 'reviews',  label: 'Most Reviewed'     },
  { value: 'projects', label: 'Most Experienced'  },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DesignersPage() {
  const [designers, setDesigners]   = useState<Designer[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation]       = useState('All');
  const [style, setStyle]             = useState('All');
  const [sortBy, setSortBy]           = useState('rating');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchDesigners = async () => {
      try {
        setLoading(true);
        // Public endpoint — no auth required
        const res  = await fetch('http://localhost:5000/api/designers');
        const data = await res.json();
        if (data.success) setDesigners(data.designers);
        else throw new Error(data.error || 'Failed to load');
      } catch (err: any) {
        setError(err.message || 'Failed to load designers');
      } finally {
        setLoading(false);
      }
    };
    fetchDesigners();
  }, []);

  // ─── Filter + sort (client-side — fast, no extra round-trips) ────────────
  const filtered = useMemo(() => {
    let list = designers.filter(d => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        d.name.toLowerCase().includes(q) ||
        d.tagline.toLowerCase().includes(q) ||
        d.about.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q);

      const matchLocation = location === 'All' ||
        d.location.toLowerCase().includes(location.toLowerCase());

      const matchStyle = style === 'All' ||
        d.styles.some(s => s.toLowerCase() === style.toLowerCase());

      const matchVerified = !verifiedOnly || d.verified || d.superVerified;

      return matchSearch && matchLocation && matchStyle && matchVerified;
    });

    // Sort
    switch (sortBy) {
      case 'rating':     list = [...list].sort((a, b) => b.rating - a.rating); break;
      case 'reviews':    list = [...list].sort((a, b) => b.reviewCount - a.reviewCount); break;
      case 'projects':   list = [...list].sort((a, b) => b.projectsCompleted - a.projectsCompleted); break;
      case 'price_asc':  list = [...list].sort((a, b) => a.startingPrice - b.startingPrice); break;
      case 'price_desc': list = [...list].sort((a, b) => b.startingPrice - a.startingPrice); break;
    }

    return list;
  }, [designers, searchQuery, location, style, sortBy, verifiedOnly]);

  const hasFilters = searchQuery || location !== 'All' || style !== 'All' || verifiedOnly;

  const clearFilters = () => {
    setSearchQuery('');
    setLocation('All');
    setStyle('All');
    setVerifiedOnly(false);
    setSortBy('rating');
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Browse Designers
          </h1>
          <p className="text-muted-foreground text-lg">
            {loading ? 'Finding designers...' : `${designers.length} verified designers ready to transform your space`}
          </p>
        </motion.div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, style, location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-muted border-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-3">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />

            <select value={location} onChange={e => setLocation(e.target.value)}
              className="h-10 px-4 rounded-xl bg-muted border-0 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
              {LOCATIONS.map(loc => (
                <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>
              ))}
            </select>

            <select value={style} onChange={e => setStyle(e.target.value)}
              className="h-10 px-4 rounded-xl bg-muted border-0 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
              {STYLES.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Styles' : s}</option>
              ))}
            </select>

            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="h-10 px-4 rounded-xl bg-muted border-0 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Verified toggle */}
            <button
              onClick={() => setVerifiedOnly(v => !v)}
              className={`h-10 px-4 rounded-xl text-sm font-medium transition-colors border ${
                verifiedOnly
                  ? 'bg-primary text-white border-primary'
                  : 'bg-muted border-transparent text-foreground hover:border-primary'
              }`}
            >
              ✓ Verified Only
            </button>

            {/* Clear filters */}
            {hasFilters && (
              <button onClick={clearFilters}
                className="h-10 px-3 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                <X className="w-3.5 h-3.5" />Clear
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-muted-foreground mb-6">
            {filtered.length === designers.length
              ? `Showing all ${designers.length} designers`
              : `Showing ${filtered.length} of ${designers.length} designers`}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-32">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Loading designers...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="p-12 text-center">
            <p className="text-destructive font-semibold mb-2">Failed to load designers</p>
            <p className="text-muted-foreground text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-primary text-sm underline">
              Try again
            </button>
          </Card>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <Card className="p-16 text-center">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-bold mb-2">No designers found</h3>
            <p className="text-muted-foreground mb-6">
              {hasFilters ? 'Try adjusting your filters' : 'No approved designers yet — check back soon!'}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-primary font-medium hover:underline">
                Clear all filters
              </button>
            )}
          </Card>
        )}

        {/* Grid */}
        {!loading && !error && filtered.length > 0 && (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((designer, index) => (
                <DesignerCard key={designer._id} designer={designer} index={index} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </Layout>
  );
}