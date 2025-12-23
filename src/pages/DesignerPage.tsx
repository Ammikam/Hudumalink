import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { DesignerCard } from '../components/designers/DesignerCard';
//import { Button } from '@/components/ui/button';
import { useStore } from '../store/use-store';

const locations = ['All', 'Nairobi', 'Mombasa', 'Kisumu'];
const styles = ['All', 'Modern', 'African Fusion', 'Minimalist', 'Luxury', 'Budget-Friendly'];

export default function DesignersPage() {
  const { designers } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('All');
  const [style, setStyle] = useState('All');

  const filteredDesigners = designers.filter((designer) => {
    const matchesSearch = designer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = location === 'All' || designer.location.includes(location);
    const matchesStyle = style === 'All' || designer.styles.includes(style);
    return matchesSearch && matchesLocation && matchesStyle;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Browse Designers
          </h1>
          <p className="text-muted-foreground">
            Find the perfect interior designer for your project
          </p>
        </motion.div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search designers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-muted border-0 text-foreground focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-10 px-4 rounded-xl bg-muted border-0 text-foreground"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>
              ))}
            </select>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="h-10 px-4 rounded-xl bg-muted border-0 text-foreground"
            >
              {styles.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All Styles' : s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDesigners.map((designer, index) => (
            <DesignerCard key={designer.id} designer={designer} index={index} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
