import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { InspirationCard } from '../Inspiration/InspirationCard';

interface PortfolioItem {
  _id: string;
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  style: string;
  designerName: string;
  designerId: string;
  budget?: number;
}

export function InspirationTeaser() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch portfolio items from designers
  useEffect(() => {
    api.getDesigners()
      .then(designers => {
        const allItems: PortfolioItem[] = [];
        designers.forEach((designer: any) => {
          if (designer.portfolio && designer.portfolio.length > 0) {
            designer.portfolio.forEach((item: any) => {
              allItems.push({
                _id: item._id || `${designer._id}-${item.id}`,
                title: item.title,
                description: item.description,
                beforeImage: item.beforeImage,
                afterImage: item.afterImage,
                style: item.style,
                designerName: designer.name,
                designerId: designer._id || designer.id,
                budget: item.budget,
              });
            });
          }
        });
        setPortfolioItems(allItems);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading inspiration:', err);
        setError('Failed to load inspiration');
        setLoading(false);
      });
  }, []);

  // Show only first 8 items for teaser
  const teaserItems = portfolioItems.slice(0, 8);

  // Loading State
  if (loading) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-b from-transparent to-cream">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-6" />
            <h2 className="font-display text-4xl font-bold">Loading Inspiration...</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[4/5] bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error State
  if (error) {
    return (
      <section className="py-16 lg:py-24">
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
      <section className="py-16 lg:py-24 bg-gradient-to-b from-transparent to-cream">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <p className="text-muted-foreground text-xl">No inspiration available yet</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-transparent to-cream">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <Sparkles className="w-6 h-6 text-gold" />
            <span className="text-gold font-semibold uppercase tracking-wider text-sm">
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
          {teaserItems.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="break-inside-avoid"
            >
              <InspirationCard inspiration={item} index={index} />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/inspiration">
            <Button size="xl" className="btn-primary shadow-soft hover:shadow-medium">
              View All Inspiration ({portfolioItems.length})
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}