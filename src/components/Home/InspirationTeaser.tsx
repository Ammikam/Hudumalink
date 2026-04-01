// src/components/Home/InspirationTeaser.tsx - FIXED API ENDPOINT
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InspirationCard } from '../Inspiration/InspirationCard';

interface InspirationItem {
  _id: string;
  title: string;
  description?: string;
  beforeImage?: string;
  afterImage?: string;
  image?: string;
  style: string;
  styles?: string[];
  designer: {
    _id: string;
    name: string;
    avatar?: string;
    designerProfile?: {
      verified?: boolean;
    };
  };
  likes?: number;
  views?: number;
}

export function InspirationTeaser() {
  const [inspirationItems, setInspirationItems] = useState<InspirationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  
  useEffect(() => {
    const fetchInspiration = async () => {
      try {
        const res = await fetch('https://hudumalink-backend.onrender.com/api/inspirations?limit=12');
        const data = await res.json();

        if (data.success && data.inspirations) {
          setInspirationItems(data.inspirations);
        } else {
          console.error('Failed to load inspiration:', data.error);
          setError('Failed to load inspiration');
        }
      } catch (err) {
        console.error('Error loading inspiration:', err);
        setError('Failed to load inspiration');
      } finally {
        setLoading(false);
      }
    };

    fetchInspiration();
  }, []);

  // Show only first 8 items for teaser
  const teaserItems = inspirationItems.slice(0, 8);

  // Loading State
  if (loading) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-b from-transparent to-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-6" />
            <h2 className="font-display text-4xl font-bold">Loading Inspiration...</h2>
          </div>
          <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse break-inside-avoid">
                <div className="aspect-[4/5] bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error State
  if (error && inspirationItems.length === 0) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-b from-transparent to-muted/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <p className="text-destructive text-xl">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-6">
            Retry
          </Button>
        </div>
      </section>
    );
  }

  // Empty State
  if (teaserItems.length === 0) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-b from-transparent to-muted/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-2xl font-bold mb-2">No Inspiration Yet</h3>
          <p className="text-muted-foreground text-lg">
            Our designers are working on amazing projects. Check back soon!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-2 lg:py-4 bg-gradient-to-b from-transparent to-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <span className="text-secondary font-semibold uppercase tracking-wider text-sm">
              Real Transformations
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4"
          >
            Get Inspired by Stunning Makeovers
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Browse through beautiful before & after transformations by Kenya's top designers
          </motion.p>
        </div>

        {/* Masonry Grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6 mb-12">
          {teaserItems.map((item, index) => {
            // Transform data to match InspirationCard props
            const transformedItem = {
              _id: item._id,
              id: item._id,
              title: item.title,
              description: item.description,
              beforeImage: item.beforeImage || item.image,
              afterImage: item.afterImage || item.image,
              image: item.image,
              style: item.style || (item.styles && item.styles[0]) || 'Modern',
              styles: item.styles,
              designerName: item.designer?.name,
              designerId: item.designer?._id,
              designerAvatar: item.designer?.avatar,
              verified: item.designer?.designerProfile?.verified,
              likes: item.likes,
              views: item.views,
            };

            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="break-inside-avoid"
              >
                <InspirationCard inspiration={transformedItem} index={index} />
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/inspiration">
            <Button size="xl" className="shadow-soft hover:shadow-medium">
              View All Inspiration
              {inspirationItems.length > 8 && ` (${inspirationItems.length}+)`}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}