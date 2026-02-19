// src/pages/HomePage.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { BeforeAfterSlider } from '../components/ui/before-after-slider';
import { QuoteCalculator } from '../components/Home/QuoteCalculator';
import { FeaturedDesigners } from '../components/Home/FeaturedDesigner';
import { InspirationTeaser } from '../components/Home/InspirationTeaser';
import { HowItWorks } from '../components/Home/HowitWorks';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface PlatformStats {
  verifiedDesigners: number;
  completedProjects: number;
  averageRating: number;
  featuredProject: {
    _id: string;
    title: string;
    location: string;
    budget: number;
    timeline: string;
    photos: string[];
    clientName: string;
    designer: {
      _id: string;
      name: string;
      avatar: string;
      rating: number;
    } | null;
  } | null;
}

export default function HomePage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/stats');
        const data = await res.json();
        if (data.success) setStats(data.stats);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Fallback stats while loading
  const displayStats = stats ?? {
    verifiedDesigners: 0,
    completedProjects: 0,
    averageRating: 0,
  };

  // Featured project images (before/after if available, otherwise fallback)
  const beforeImage = stats?.featuredProject?.photos?.[0] ??
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';
  const afterImage = stats?.featuredProject?.photos?.[1] ??
    stats?.featuredProject?.photos?.[0] ??
    'https://images.unsplash.com/photo-1618221195710-dd6dabb60b29?w=800';

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
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Transform Your Space with{' '}
                <span className="text-secondary">Kenya's Best</span>{' '}
                Interior Designers
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl">
                Get matched with verified designers in 24 hours. From modern minimalism to African fusion.
              </p>

              {/* CTA Buttons — primary action is larger */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/post-project">
                  <Button size="xl" className="shadow-lg hover:shadow-xl transition-shadow">
                    Post Your Project
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/designers">
                  <Button variant="outline" size="lg">
                    Browse Designers
                  </Button>
                </Link>
              </div>

              {/* Real stats */}
              <div className="flex items-center gap-8 pt-6 text-sm">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div>
                      <p className="font-display text-3xl font-bold text-foreground">
                        {displayStats.verifiedDesigners}+
                      </p>
                      <p className="text-muted-foreground">Verified Designers</p>
                    </div>
                    <div className="w-px h-12 bg-border" />
                    <div>
                      <p className="font-display text-3xl font-bold text-foreground">
                        {displayStats.completedProjects.toLocaleString()}+
                      </p>
                      <p className="text-muted-foreground">Projects Completed</p>
                    </div>
                    {displayStats.averageRating > 0 && (
                      <>
                        <div className="w-px h-12 bg-border hidden sm:block" />
                        <div className="hidden sm:block">
                          <p className="font-display text-3xl font-bold text-foreground">
                            {displayStats.averageRating}★
                          </p>
                          <p className="text-muted-foreground">Average Rating</p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </motion.div>

            {/* Right - Before/After Slider with featured project */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <BeforeAfterSlider
                beforeImage={beforeImage}
                afterImage={afterImage}
                className="aspect-[4/3] shadow-strong"
              />

              {/* Caption bar — shows project location + budget if available */}
              {stats?.featuredProject && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white text-sm">
                  <p className="font-semibold">{stats.featuredProject.title}</p>
                  <p className="text-white/80">
                    {stats.featuredProject.location} · KSh {(stats.featuredProject.budget / 1000000).toFixed(1)}M
                    {stats.featuredProject.timeline && ` · ${stats.featuredProject.timeline}`}
                  </p>
                </div>
              )}

              {/* Designer card — now clickable */}
              {stats?.featuredProject?.designer && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -bottom-6 -left-6 hidden lg:block"
                >
                  <Link
                    to={`/designers/${stats.featuredProject.designer._id}`}
                    className="block bg-card p-4 rounded-2xl shadow-medium hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 ring-2 ring-border">
                        <AvatarImage src={stats.featuredProject.designer.avatar} />
                        <AvatarFallback>
                          {stats.featuredProject.designer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground flex items-center gap-2">
                          {stats.featuredProject.designer.name}
                          {stats.featuredProject.designer.rating >= 4.5 && (
                            <Badge variant="secondary" className="text-xs">
                              {stats.featuredProject.designer.rating}★
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">Designed this space</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}
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
            Post your project and receive proposals from Kenya's top designers — typically within 48 hours.
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
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}