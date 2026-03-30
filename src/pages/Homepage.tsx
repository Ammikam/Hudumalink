// src/pages/HomePage.tsx - 
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
import { ClientTipsTicker } from '@/components/Home/ClientTipsTicker';

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
    currentPhotos?: string[];
    beforePhotos?: string[];
    afterPhotos?: string[];
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

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function SliderSkeleton() {
  return (
    <div className="aspect-[4/3] rounded-2xl overflow-hidden relative bg-muted">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Left half — slightly darker */}
      <div className="absolute inset-y-0 left-0 w-1/2 bg-muted-foreground/10" />

      {/* Right half */}
      <div className="absolute inset-y-0 right-0 w-1/2 bg-muted-foreground/5" />

      {/* Divider line */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-px w-0.5 bg-muted-foreground/20" />

      {/* Drag handle circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-10 h-10 rounded-full bg-muted-foreground/20 animate-pulse" />

      {/* Before label pill */}
      <div className="absolute top-4 left-4 h-6 w-24 rounded-full bg-muted-foreground/20 animate-pulse" />

      {/* After label pill */}
      <div className="absolute top-4 right-4 h-6 w-24 rounded-full bg-muted-foreground/20 animate-pulse" />

      {/* Caption bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-5 space-y-2
                      bg-gradient-to-t from-black/30 to-transparent">
        <div className="h-4 w-44 rounded bg-muted-foreground/30 animate-pulse" />
        <div className="h-3 w-64 rounded bg-muted-foreground/20 animate-pulse" />
      </div>
    </div>
  );
}

// ─── Stats Skeleton ───────────────────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="flex items-center gap-6 sm:gap-8 pt-4 text-sm">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-6 sm:gap-8">
          {i > 1 && <div className="w-px h-10 bg-border" />}
          <div className="space-y-1.5">
            <div className="h-8 w-16 rounded bg-muted animate-pulse" />
            <div className="h-3 w-24 rounded bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

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

  const displayStats = stats ?? {
    verifiedDesigners: 0,
    completedProjects: 0,
    averageRating: 0,
  };

  // Smart photo selection for before/after slider
  const featuredProject = stats?.featuredProject;

  const currentPhotos = featuredProject?.currentPhotos || featuredProject?.beforePhotos || [];
  const afterPhotos = featuredProject?.afterPhotos || [];
  const allPhotos = featuredProject?.photos || [];

  const beforeImage = currentPhotos[0] || allPhotos[0] || null;

  const afterImage =
    afterPhotos[0] ||
    (allPhotos.length >= 2 ? allPhotos[1] : null) ||
    (currentPhotos.length >= 2 ? currentPhotos[1] : null) ||
    null;

  const hasSliderImages = !loading && beforeImage && afterImage;

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-hero-pattern">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12 w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* ── Left column ── */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex max-w-full overflow-hidden"
              >
                <ClientTipsTicker />
              </motion.div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Transform Your Space with{' '}
                <span className="text-secondary">Kenya's Best</span>{' '}
                Interior Designers
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
                Get matched with verified designers in 24 hours. From modern minimalism to African fusion.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 pt-2">
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

              {/* Stats */}
              {loading ? (
                <StatsSkeleton />
              ) : (
                <div className="flex items-center gap-6 sm:gap-8 pt-4 text-sm">
                  <div>
                    <p className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                      {displayStats.verifiedDesigners}+
                    </p>
                    <p className="text-muted-foreground text-xs sm:text-sm">Verified Designers</p>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div>
                    <p className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                      {displayStats.completedProjects.toLocaleString()}+
                    </p>
                    <p className="text-muted-foreground text-xs sm:text-sm">Projects Completed</p>
                  </div>
                  {displayStats.averageRating > 0 && (
                    <>
                      <div className="w-px h-10 bg-border hidden sm:block" />
                      <div className="hidden sm:block">
                        <p className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                          {displayStats.averageRating}★
                        </p>
                        <p className="text-muted-foreground text-xs sm:text-sm">Average Rating</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.div>

            {/* ── Right column — before/after slider or skeleton ── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="relative mt-4 lg:mt-0"
            >
              {loading ? (
                // Skeleton while fetching
                <SliderSkeleton />
              ) : hasSliderImages ? (
                // Real slider once data is ready
                <>
                  <BeforeAfterSlider
                    beforeImage={beforeImage!}
                    afterImage={afterImage!}
                    beforeLabel="Before Design"
                    afterLabel="After Design"
                    className="aspect-[4/3] rounded-2xl shadow-strong w-full"
                  />

                  {/* Caption */}
                  {stats?.featuredProject && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pb-5 text-white pointer-events-none rounded-b-2xl">
                      <p className="font-semibold text-sm">{stats.featuredProject.title}</p>
                      <p className="text-white/80 text-xs sm:text-sm">
                        {stats.featuredProject.location} · KSh {(stats.featuredProject.budget / 1_000_000).toFixed(1)}M
                        {stats.featuredProject.timeline && ` · ${stats.featuredProject.timeline}`}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                // No real project data — tasteful empty state
                <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10
                                flex flex-col items-center justify-center text-center p-8
                                border border-dashed border-primary/20">
                  <div className="text-6xl mb-4">🛋️</div>
                  <p className="font-display text-xl font-semibold text-foreground mb-2">
                    Your Dream Space, Realized
                  </p>
                  <p className="text-muted-foreground text-sm max-w-xs mb-4">
                    See real before & after transformations from Kenya's top designers
                  </p>
                  <Link to="/inspiration">
                    <Button variant="outline" size="sm">Browse Inspirations</Button>
                  </Link>
                </div>
              )}

              {/* Designer badge — only shown when real data loaded */}
              {!loading && stats?.featuredProject?.designer && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -bottom-6 -right-4 lg:-right-6 hidden md:block z-10"
                >
                  <Link
                    to={`/designers/${stats.featuredProject.designer._id}`}
                    className="block bg-card p-3 lg:p-4 rounded-2xl shadow-medium hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 lg:w-12 lg:h-12 ring-2 ring-border flex-shrink-0">
                        <AvatarImage src={stats.featuredProject.designer.avatar} />
                        <AvatarFallback>
                          {stats.featuredProject.designer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground text-sm flex items-center gap-2">
                          {stats.featuredProject.designer.name}
                          {stats.featuredProject.designer.rating >= 4.5 && (
                            <Badge variant="secondary" className="text-xs">
                              {stats.featuredProject.designer.rating}★
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">Designed this space</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Quote Calculator ── */}
      {/* <section className="py-8 lg:py-10 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <QuoteCalculator />
        </div>
      </section> */}

      {/* ── Featured Designers ── */}
      <FeaturedDesigners />

      {/* ── Inspiration Teaser ── */}
      <InspirationTeaser />

      {/* ── How It Works ── */}
      <HowItWorks />

      {/* ── Bottom CTA ── */}
      <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-5"
          >
            Ready to Transform Your Space?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg opacity-90 max-w-2xl mx-auto mb-8"
          >
            Post your project and receive proposals from Kenya's top designers, typically within 48 hours.
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