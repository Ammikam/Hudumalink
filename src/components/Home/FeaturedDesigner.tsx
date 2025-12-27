import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DesignerCard } from '../designers/DesignerCard';
import { Button } from '../ui/button';
import { useStore } from '../../store/use-store';

export function FeaturedDesigners() {
  const { designers } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  let intervalId: NodeJS.Timeout | null = null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Auto-play with pause on hover
  useEffect(() => {
    if (isHovered || designers.length === 0) return;

    intervalId = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scroll('right');
        }
      }
    }, 5000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isHovered, designers.length]);

  const featuredDesigners = designers.slice(0, 9);

  if (designers.length === 0) {
    return (
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="font-display text-4xl font-bold text-center mb-12">Loading Designers...</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-premium animate-pulse rounded-2xl overflow-hidden">
                <div className="h-64 bg-muted" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-cream to-transparent">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-12 gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-4"
            >
              <Sparkles className="w-6 h-6 text-gold" />
              <span className="text-gold font-semibold uppercase tracking-wider text-sm">
                Top Rated in Kenya
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl lg:text-5xl font-bold text-foreground"
            >
              Meet Our Featured Designers
            </motion.h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
              Hand-picked professionals with proven track records. From modern minimalism to authentic African fusion.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => scroll('left')} className="hidden lg:flex">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => scroll('right')} className="hidden lg:flex">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-6 -mx-4 px-4 lg:mx-0 lg:px-0"
        >
          {featuredDesigners.map((designer, index) => (
            <motion.div
              key={designer.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 w-[300px] lg:w-[380px] snap-start"
            >
              <DesignerCard designer={designer} />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/designers">
            <Button size="xl" className="btn-primary shadow-soft hover:shadow-medium">
              Explore All Designers
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}