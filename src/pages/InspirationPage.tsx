import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search} from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { InspirationCard } from '../components/Inspiration/InspirationCard';
import { Button } from '../components/ui/button';
import { useStore } from '../store/use-store';

const styles = ['All', 'Modern', 'African Fusion', 'Bohemian', 'Minimalist', 'Luxury', 'Budget-Friendly', 'Airbnb', 'Coastal'];

export default function InspirationPage() {
  const { inspirations } = useStore();
  const [activeStyle, setActiveStyle] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInspirations = inspirations.filter((item) => {
    const matchesStyle = activeStyle === 'All' || item.style === activeStyle;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.designerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStyle && matchesSearch;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Get Inspired
          </h1>
          <p className="text-muted-foreground">
            Browse stunning interior designs by Kenya's best designers
          </p>
        </motion.div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search designs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {styles.map((style) => (
              <Button
                key={style}
                variant={activeStyle === style ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveStyle(style)}
                className="flex-shrink-0"
              >
                {style}
              </Button>
            ))}
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {filteredInspirations.map((inspiration, index) => (
            <div key={inspiration.id} className="break-inside-avoid">
              <InspirationCard inspiration={inspiration} index={index} />
            </div>
          ))}
        </div>

        {filteredInspirations.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No designs found matching your criteria.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
