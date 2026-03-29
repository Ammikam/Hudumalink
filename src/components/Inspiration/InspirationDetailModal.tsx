// src/components/Inspiration/InspirationDetailModal.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MapPin, DollarSign, ExternalLink,
  Sparkles, CheckCircle2, Calendar, User, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BeforeAfterSlider } from '@/components/ui/before-after-slider';

interface InspirationDetailModalProps {
  inspirationId: string;
  onClose: () => void;
  canDelete?: boolean;
  onDeleted?: () => void;
}

interface InspirationDetail {
  _id: string;
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  styles: string[];
  location?: string;
  projectCost?: number;
  designerName: string;
  designerId: string;
  designerAvatar?: string;
  designerLocation?: string;
  verified: boolean;
  createdAt: string;
}

export function InspirationDetailModal({
  inspirationId,
  onClose,
  canDelete = false,
  onDeleted,
}: InspirationDetailModalProps) {
  const navigate = useNavigate();
  const [inspiration, setInspiration]     = useState<InspirationDetail | null>(null);
  const [loading, setLoading]             = useState(true);
  const [showFullImage, setShowFullImage] = useState(false);
  const [currentView, setCurrentView]     = useState<'before' | 'after'>('before');

  useEffect(() => {
    const fetchInspiration = async () => {
      try {
        const res  = await fetch(`http://localhost:5000/api/inspirations/${inspirationId}`);
        const data = await res.json();
        if (data.success) setInspiration(data.inspiration);
      } catch (error) {
        console.error('Failed to fetch inspiration:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInspiration();
  }, [inspirationId]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const formatCurrency = (amount: number) => `KSh ${amount.toLocaleString()}`;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-white" />
          <p className="text-white/70 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!inspiration) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* ── Modal ── */}
      <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center lg:p-6 pointer-events-none">
        <motion.div
          key="modal"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 280 }}
          className="pointer-events-auto w-full lg:max-w-5xl bg-background rounded-t-3xl lg:rounded-2xl shadow-2xl overflow-hidden"
          // Fixed height on desktop so nothing gets cut off
          style={{ height: 'min(92vh, 680px)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close button — always visible, top right */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Mobile drag handle */}
          <div className="flex justify-center pt-3 pb-1 lg:hidden">
            <div className="w-10 h-1.5 bg-muted-foreground/20 rounded-full" />
          </div>

          {/* ── Layout: stacked mobile / two-col desktop ── */}
          <div className="flex flex-col lg:flex-row h-full">

            {/* ── Left: Image (fixed height mobile, full height desktop) ── */}
            <div className="relative bg-muted flex-shrink-0
              h-52 sm:h-64          /* mobile: fixed height so content shows below */
              lg:w-[52%] lg:h-full  /* desktop: half width, full height */
            ">
              <BeforeAfterSlider
                beforeImage={inspiration.beforeImage}
                afterImage={inspiration.afterImage}
                className="w-full h-full"
              />

              {/* Before/After labels + Full View */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <Badge className="bg-black/60 backdrop-blur-sm text-white border-white/20 text-xs">Before</Badge>
                  <Badge className="bg-primary text-xs">After</Badge>
                </div>
                <button
                  onClick={() => setShowFullImage(true)}
                  className="px-2.5 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs rounded-lg hover:bg-black/80 transition flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Full View
                </button>
              </div>
            </div>

            {/* ── Right: Details + CTA (scrollable content, sticky footer) ── */}
            <div className="flex flex-col flex-1 min-h-0">

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-4">

                {/* Title + badges */}
                <div>
                  <h1 className="font-display text-xl sm:text-2xl font-bold mb-2 leading-tight pr-8">
                    {inspiration.title}
                  </h1>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {inspiration.styles.map(style => (
                      <Badge key={style} variant="secondary" className="text-xs">{style}</Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(inspiration.createdAt)}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    About This Project
                  </p>
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {inspiration.description}
                  </p>
                </div>

                {/* Location + Budget */}
                {(inspiration.location || inspiration.projectCost) && (
                  <div className="grid grid-cols-2 gap-3">
                    {inspiration.location && (
                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">Location</span>
                        </div>
                        <p className="text-sm font-semibold">{inspiration.location}</p>
                      </div>
                    )}
                    {inspiration.projectCost && (
                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">Project Budget</span>
                        </div>
                        <p className="text-sm font-bold text-primary">
                          {formatCurrency(inspiration.projectCost)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Designer card */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Designer</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-11 h-11 ring-2 ring-border flex-shrink-0">
                      <AvatarImage src={inspiration.designerAvatar} />
                      <AvatarFallback className="text-sm bg-gradient-to-br from-primary to-secondary text-white font-bold">
                        {inspiration.designerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="font-bold text-sm truncate">{inspiration.designerName}</p>
                        {inspiration.verified && (
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      {inspiration.designerLocation && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {inspiration.designerLocation}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0 h-8 text-xs gap-1"
                      onClick={() => { navigate(`/designers/${inspiration.designerId}`); onClose(); }}
                    >
                      <User className="w-3.5 h-3.5" /> Profile
                    </Button>
                  </div>
                </div>

                {/* Tip */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60">
                  <p className="text-xs text-amber-800">
                    💡 <strong>Tip:</strong> Contact the designer to discuss similar projects or get a custom quote for your space.
                  </p>
                </div>
              </div>

              {/* ── Sticky CTA footer — always visible ── */}
              <div className="flex-shrink-0 px-5 sm:px-6 py-4 border-t bg-background flex gap-2.5"
                style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-none px-4"
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { navigate(`/designers/${inspiration.designerId}`); onClose(); }}
                  className="flex-1 gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>View Profile</span>
                </Button>
                <Button
                  onClick={() => { navigate(`/designers/${inspiration.designerId}?hire=true`); onClose(); }}
                  className="flex-1 gap-2"
                >
                  <span>Hire Designer</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Full image lightbox */}
      {showFullImage && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <button
            onClick={() => setShowFullImage(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            <img
              src={currentView === 'before' ? inspiration.beforeImage : inspiration.afterImage}
              alt={currentView}
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <button
                onClick={e => { e.stopPropagation(); setCurrentView('before'); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  currentView === 'before' ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >Before</button>
              <button
                onClick={e => { e.stopPropagation(); setCurrentView('after'); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  currentView === 'after' ? 'bg-primary text-white' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >After</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}