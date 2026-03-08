// src/components/projects/ProjectDetailModal.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MapPin, DollarSign, Calendar, Check, ChevronLeft, ChevronRight,
  Lightbulb, Camera, MessageSquare, ExternalLink, Images,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { cn } from '@/lib/utils';

interface ProjectDetailModalProps {
  project: {
    _id: string;
    title: string;
    description: string;
    location: string;
    budget: number;
    timeline: string;
    styles: string[];
    photos: string[];
    beforePhotos?: string[];
    inspirationPhotos?: string[];
    inspirationNotes?: string;
    status: string;
    createdAt: string;
    client?: { name: string; avatar?: string };
  };
  variant?: 'open' | 'active';
  alreadySent?: boolean;
  onClose: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

export function ProjectDetailModal({
  project,
  variant = 'open',
  alreadySent,
  onClose,
  onAction,
  actionLabel = 'Send Proposal',
}: ProjectDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullscreen, setShowFullscreen]       = useState(false);
  const [currentSection, setCurrentSection]       = useState<'before' | 'inspiration'>('before');

  const beforePhotos      = project.beforePhotos      || [];
  const inspirationPhotos = project.inspirationPhotos || [];
  const hasBeforePhotos      = beforePhotos.length > 0;
  const hasInspirationPhotos = inspirationPhotos.length > 0;
  const hasSeparatePhotos    = hasBeforePhotos || hasInspirationPhotos;
  const fallbackPhotos       = project.photos || [];

  const displayPhotos = hasSeparatePhotos
    ? (currentSection === 'before' ? beforePhotos : inspirationPhotos)
    : fallbackPhotos;

  const totalPhotos = hasSeparatePhotos
    ? beforePhotos.length + inspirationPhotos.length
    : fallbackPhotos.length;

  useEffect(() => {
    if (hasSeparatePhotos) setCurrentSection(hasBeforePhotos ? 'before' : 'inspiration');
  }, [hasBeforePhotos, hasInspirationPhotos, hasSeparatePhotos]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => { setCurrentImageIndex(0); }, [currentSection]);

  const nextImage = () => displayPhotos.length > 0 && setCurrentImageIndex(p => (p + 1) % displayPhotos.length);
  const prevImage = () => displayPhotos.length > 0 && setCurrentImageIndex(p => (p - 1 + displayPhotos.length) % displayPhotos.length);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const formatCurrency = (n: number) => `KSh ${n.toLocaleString()}`;

  return (
    <AnimatePresence>
      {/* ── Backdrop ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* ── Modal — bottom sheet on mobile, centered dialog on lg ── */}
      <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center lg:p-4 pointer-events-none">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 280 }}
          className="pointer-events-auto w-full lg:max-w-5xl xl:max-w-6xl bg-background rounded-t-3xl lg:rounded-2xl shadow-2xl overflow-hidden"
          style={{ maxHeight: '92vh' }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── Mobile drag handle ── */}
          <div className="flex justify-center pt-3 pb-1 lg:hidden">
            <div className="w-10 h-1.5 bg-muted-foreground/20 rounded-full" />
          </div>

          {/* ── Close button (always visible) ── */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>

          {/* ── Layout: stacked on mobile, 2-col on lg ── */}
          <div className="flex flex-col lg:grid lg:grid-cols-2" style={{ maxHeight: 'calc(92vh - 1.5rem)' }}>

            {/* ── Image panel ── */}
            <div className="relative bg-muted h-56 sm:h-72 lg:h-full flex-shrink-0">
              {displayPhotos.length > 0 ? (
                <div className="h-full relative group">
                  <OptimizedImage
                    src={displayPhotos[currentImageIndex]}
                    alt={`${project.title} - ${currentImageIndex + 1}`}
                    preset="portfolio"
                    size="full"
                    className="w-full h-full cursor-pointer"
                    objectFit="cover"
                    onClick={() => setShowFullscreen(true)}
                  />

                  {/* Prev / Next arrows */}
                  {displayPhotos.length > 1 && (
                    <>
                      <button
                        onClick={e => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition lg:opacity-0 lg:group-hover:opacity-100"
                      >
                        <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition lg:opacity-0 lg:group-hover:opacity-100"
                      >
                        <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                    </>
                  )}

                  {/* Counter */}
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
                    {currentImageIndex + 1} / {displayPhotos.length}
                  </div>

                  {/* Fullscreen */}
                  <button
                    onClick={() => setShowFullscreen(true)}
                    className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg hover:bg-black/80 transition flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Full
                  </button>

                  {/* Section tabs — only if both types exist */}
                  {hasBeforePhotos && hasInspirationPhotos && (
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {[
                        { id: 'before' as const, icon: Camera, label: 'Before', count: beforePhotos.length, active: 'bg-primary' },
                        { id: 'inspiration' as const, icon: Lightbulb, label: 'Inspo', count: inspirationPhotos.length, active: 'bg-secondary' },
                      ].map(({ id, icon: Icon, label, count, active }) => (
                        <button
                          key={id}
                          onClick={() => setCurrentSection(id)}
                          className={cn(
                            'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white transition',
                            currentSection === id ? active : 'bg-black/40 backdrop-blur-sm hover:bg-black/60'
                          )}
                        >
                          <Icon className="w-3 h-3" />
                          {label} ({count})
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Single type badge */}
                  {hasSeparatePhotos && !(hasBeforePhotos && hasInspirationPhotos) && (
                    <div className="absolute top-3 left-3">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white',
                        hasBeforePhotos ? 'bg-primary' : 'bg-secondary'
                      )}>
                        {hasBeforePhotos ? <><Camera className="w-3 h-3" /> Current Space</> : <><Lightbulb className="w-3 h-3" /> Inspiration</>}
                      </span>
                    </div>
                  )}

                  {/* Thumbnail strip */}
                  {displayPhotos.length > 1 && (
                    <div className="absolute bottom-10 left-0 right-0 px-3">
                      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                        {displayPhotos.map((photo, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={cn(
                              'flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 rounded-lg overflow-hidden border-2 transition',
                              idx === currentImageIndex ? 'border-white shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'
                            )}
                          >
                            <img src={photo} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Images className="w-12 h-12 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No photos</p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Details panel ── */}
            <div className="flex flex-col min-h-0">
              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-7 space-y-5">

                {/* Header */}
                <div>
                  {variant === 'active' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500 text-white text-xs font-bold mb-2">
                      In Progress
                    </span>
                  )}
                  <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold mb-2 leading-tight">
                    {project.title}
                  </h1>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {project.styles.map(style => (
                      <span key={style} className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-medium">
                        {style}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Posted {formatDate(project.createdAt)}</p>
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Description</p>
                  <p className="text-sm leading-relaxed">{project.description}</p>
                </div>

                {/* Inspiration notes */}
                {project.inspirationNotes && (
                  <div className="p-4 rounded-2xl bg-secondary/8 border border-secondary/15">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-secondary" />
                      <p className="font-semibold text-sm">Client's Vision</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{project.inspirationNotes}</p>
                  </div>
                )}

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { icon: MapPin,    label: 'Location', value: project.location,            color: '' },
                    { icon: DollarSign,label: 'Budget',   value: formatCurrency(project.budget), color: 'text-primary font-bold' },
                    { icon: Calendar,  label: 'Timeline', value: project.timeline,             color: '' },
                    { icon: Images,    label: 'Photos',   value: hasSeparatePhotos
                        ? [hasBeforePhotos && `${beforePhotos.length} before`, hasInspirationPhotos && `${inspirationPhotos.length} inspo`].filter(Boolean).join(' · ')
                        : `${totalPhotos} total`,
                      color: '' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="p-3.5 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">{label}</span>
                      </div>
                      <p className={cn('text-sm font-semibold leading-tight', color)}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Client */}
                {project.client && (
                  <div className="pt-4 border-t border-border/60">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Posted By</p>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 ring-2 ring-border flex-shrink-0">
                        <AvatarImage src={project.client.avatar} />
                        <AvatarFallback className="text-sm bg-gradient-to-br from-primary to-secondary text-white font-bold">
                          {project.client.name?.[0]?.toUpperCase() || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{project.client.name}</p>
                        <p className="text-xs text-muted-foreground">Client</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Sticky footer CTA ── */}
              <div className="flex-shrink-0 px-5 sm:px-6 lg:px-7 py-4 border-t bg-background flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none sm:min-w-[100px]">
                  Close
                </Button>
                {onAction && (
                  <Button
                    onClick={onAction}
                    disabled={alreadySent}
                    variant={alreadySent ? 'secondary' : 'default'}
                    className="flex-1 gap-2"
                  >
                    {alreadySent ? (
                      <><Check className="w-4 h-4" />Proposal Sent</>
                    ) : variant === 'active' ? (
                      <><MessageSquare className="w-4 h-4" />Open Chat</>
                    ) : (
                      actionLabel
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Fullscreen lightbox ── */}
      <AnimatePresence>
        {showFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setShowFullscreen(false)}
          >
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
              <img
                src={displayPhotos[currentImageIndex]}
                alt="Fullscreen"
                className="w-full h-auto max-h-[88vh] object-contain rounded-xl"
              />
              {displayPhotos.length > 1 && (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-4 py-1.5 rounded-full font-medium">
                    {currentImageIndex + 1} / {displayPhotos.length}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}