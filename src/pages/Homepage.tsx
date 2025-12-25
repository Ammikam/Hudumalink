import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { BeforeAfterSlider } from '../components/ui/before-after-slider';
import { QuoteCalculator } from '../components/Home/QuoteCalculator';
import { ActivityFeed } from '../components/Home/ActivityFeed';
import { FeaturedDesigners } from '../components/Home/FeaturedDesigner';
import { InspirationTeaser } from '../components/Home/InspirationTeaser';
import { HowItWorks } from '../components/Home/HowitWorks';
import { Button } from '../components/ui/button';

export default function HomePage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-hero-pattern">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        
        <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <ActivityFeed />
              
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Transform Your Space with{' '}
                <span className="text-secondary">Kenya's Best</span>{' '}
                Interior Designers
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-xl">
                Connect with verified designers across Nairobi, Mombasa, and Kisumu. 
                From modern minimalism to African fusion – find the perfect designer for your dream space.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/post-project">
                  <Button variant="hero" size="xl">
                    Post Your Project
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/designers">
                  <Button variant="outline" size="xl">
                    Browse Designers
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-6 text-sm">
                <div>
                  <p className="font-display text-3xl font-bold text-foreground">500+</p>
                  <p className="text-muted-foreground">Verified Designers</p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div>
                  <p className="font-display text-3xl font-bold text-foreground">2,000+</p>
                  <p className="text-muted-foreground">Projects Completed</p>
                </div>
                <div className="w-px h-12 bg-border hidden sm:block" />
                <div className="hidden sm:block">
                  <p className="font-display text-3xl font-bold text-foreground">4.9★</p>
                  <p className="text-muted-foreground">Average Rating</p>
                </div>
              </div>
            </motion.div>

            {/* Right - Before/After Slider */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <BeforeAfterSlider
                beforeImage="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
                afterImage="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800"
                className="aspect-[4/3] shadow-strong"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-6 -left-6 bg-card p-4 rounded-2xl shadow-medium hidden lg:block"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100"
                    alt="Designer"
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">Wanjiku M.</p>
                    <p className="text-sm text-muted-foreground">Designed this space</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quote Calculator */}
      <section className="py-5 lg:py-5 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <QuoteCalculator />
        </div>
      </section>

      {/* Featured Designers */}
      <FeaturedDesigners />

      {/* Inspiration Teaser */}
      <InspirationTeaser />

      {/* How It Works */}
      <HowItWorks />

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl lg:text-5xl font-bold mb-6"
          >
            Ready to Transform Your Space?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg opacity-90 max-w-2xl mx-auto mb-8"
          >
            Post your project today and receive proposals from Kenya's top interior designers within 24 hours.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/post-project">
              <Button variant="secondary" size="xl">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
