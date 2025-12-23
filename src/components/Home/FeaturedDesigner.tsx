import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DesignerCard } from '../designers/DesignerCard';
import { Button } from '../ui/button';
import { useStore } from '../../store/use-store';

export function FeaturedDesigners() {
  const { designers } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const featuredDesigners = designers.slice(0, 6);

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-secondary font-medium mb-2 block"
            >
              Top Rated
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl lg:text-4xl font-bold text-foreground"
            >
              Featured Designers
            </motion.h2>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 lg:mx-0 lg:px-0"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {featuredDesigners.map((designer, index) => (
            <div
              key={designer.id}
              className="flex-shrink-0 w-[300px] lg:w-[340px]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <DesignerCard designer={designer} index={index} />
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-10">
          <Link to="/designers">
            <Button variant="outline" size="lg">
              View All Designers
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
