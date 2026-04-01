// src/pages/designerpages/MyInspirationsPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { InspirationDetailModal } from '@/components/Inspiration/InspirationDetailModal';
import {
  Loader2, Plus, Images, MapPin, DollarSign,
  Calendar, Trash2, Eye, Sparkles,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface MyInspiration {
  _id: string;
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  styles: string[];
  location?: string;
  projectCost?: number;
  status: string;
  createdAt: string;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function MyInspirationsPage() {
  const { getToken }   = useAuth();
  const navigate       = useNavigate();
  const { toast }      = useToast();

  const [inspirations, setInspirations]       = useState<MyInspiration[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [selectedId, setSelectedId]           = useState<string | null>(null);

  const fetchMyInspirations = useCallback(async () => {
    try {
      const token = await getToken();
      // Uses the /designer/:designerId route — get own user ID first
      const profileRes  = await fetch('https://hudumalink-backend.onrender.com/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();
      if (!profileData.success) return;

      const res  = await fetch(
        `https://hudumalink-backend.onrender.com/api/inspirations/designer/${profileData.user._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) setInspirations(data.inspirations || []);
    } catch (e) {
      console.error('Error fetching inspirations:', e);
      toast({ title: 'Error', description: 'Failed to load your inspirations', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchMyInspirations(); }, [fetchMyInspirations]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Loading your inspirations…</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/20 to-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-5xl">

          {/* ── Header ── */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold">My Inspirations</h1>
                {inspirations.length > 0 && (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {inspirations.length}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Your portfolio in the inspiration gallery</p>
            </div>
            <Button asChild className="gap-2 flex-shrink-0">
              <Link to="/designer/add-inspiration">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add New</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </Button>
          </motion.div>

          {/* ── Empty state ── */}
          {inspirations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center px-4"
            >
              <div className="w-20 h-20 rounded-3xl bg-primary/8 flex items-center justify-center mb-6">
                <Images className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">No inspirations yet</h2>
              <p className="text-muted-foreground text-sm max-w-sm mb-8">
                Share your best before & after transformations to attract clients and build your portfolio.
              </p>
              <Button asChild className="gap-2">
                <Link to="/designer/add-inspiration">
                  <Plus className="w-4 h-4" /> Share Your First Work
                </Link>
              </Button>
            </motion.div>
          ) : (
            <>
              {/* ── Grid ── */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {inspirations.map((insp) => (
                  <motion.div key={insp._id} variants={itemVariants}>
                    <div className="group rounded-2xl border border-border/60 bg-background overflow-hidden hover:border-border hover:shadow-md transition-all duration-200">

                      {/* Thumbnail */}
                      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                        <img
                          src={insp.afterImage || insp.beforeImage}
                          alt={insp.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Before/after preview strip */}
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2 gap-1">
                          <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/30 flex-shrink-0">
                            <img src={insp.beforeImage} alt="before" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-white text-[10px] font-medium">Before →</span>
                        </div>

                        {/* Hover overlay with actions */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => setSelectedId(insp._id)}
                            className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center transition-transform hover:scale-110"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base line-clamp-1">{insp.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                            {insp.description}
                          </p>
                        </div>

                        {/* Style tags */}
                        <div className="flex flex-wrap gap-1">
                          {insp.styles.slice(0, 2).map(s => (
                            <Badge key={s} variant="secondary" className="text-[10px] px-2 py-0.5">{s}</Badge>
                          ))}
                          {insp.styles.length > 2 && (
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5">+{insp.styles.length - 2}</Badge>
                          )}
                        </div>

                        {/* Meta */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/60">
                          <div className="flex items-center gap-3">
                            {insp.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {insp.location}
                              </span>
                            )}
                            {insp.projectCost && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" /> KSh {insp.projectCost.toLocaleString()}
                              </span>
                            )}
                            {!insp.location && !insp.projectCost && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {formatDate(insp.createdAt)}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => setSelectedId(insp._id)}
                            className="text-xs text-primary hover:underline font-medium"
                          >
                            View →
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* ── Summary ── */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/15 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{inspirations.length} inspiration{inspirations.length !== 1 ? 's' : ''} published</p>
                  <p className="text-xs text-muted-foreground">Visible to all clients browsing the gallery</p>
                </div>
                <Button asChild size="sm" variant="outline" className="flex-shrink-0 text-xs gap-1">
                  <Link to="/designer/add-inspiration">
                    <Plus className="w-3.5 h-3.5" /> Add More
                  </Link>
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* ── Detail modal with delete capability ── */}
      {selectedId && (
        <InspirationDetailModal
          inspirationId={selectedId}
          onClose={() => setSelectedId(null)}
          canDelete={true}
          onDeleted={() => {
            setInspirations(prev => prev.filter(i => i._id !== selectedId));
            setSelectedId(null);
          }}
        />
      )}
    </Layout>
  );
}