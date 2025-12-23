import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { InspirationCard } from '../Inspiration/InspirationCard';
import { Button } from '../ui/button';
import { useStore } from '../../store/use-store';

export function InspirationTeaser() {
  const { inspirations } = useStore();
  const featuredInspirations = inspirations.slice(0, 6);

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-secondary font-medium mb-2 block"
          >
            Get Inspired
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4"
          >
            Beautiful Spaces by Kenyan Designers
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Browse through stunning interior designs created by our talented designers across Kenya. Save your favorites and use them as inspiration for your own project.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {featuredInspirations.map((inspiration, index) => (
            <InspirationCard
              key={inspiration.id}
              inspiration={inspiration}
              index={index}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/inspiration">
            <Button variant="terracotta" size="lg">
              Explore All Inspirations
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
