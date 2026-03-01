// src/components/projects/ProjectDetailModal.tsx - FIXED VERSION
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MapPin, DollarSign, Calendar, Check, ChevronLeft, ChevronRight,
  Lightbulb, Camera, MessageSquare, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
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
    client?: {
      name: string;
      avatar?: string;
    };
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
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [currentSection, setCurrentSection] = useState<'before' | 'inspiration'>('before');

  // ✅ FIXED: Properly separate photo arrays
  const beforePhotos = project.beforePhotos || [];
  const inspirationPhotos = project.inspirationPhotos || [];
  
  // ✅ FIXED: Only use fallback if BOTH arrays are empty
  const hasBeforePhotos = beforePhotos.length > 0;
  const hasInspirationPhotos = inspirationPhotos.length > 0;
  const hasSeparatePhotos = hasBeforePhotos || hasInspirationPhotos;
  
  // ✅ FIXED: Fallback to photos array only if no separate arrays
  const fallbackPhotos = project.photos || [];

  // ✅ FIXED: Current photos based on section (only if we have separate arrays)
  const displayPhotos = hasSeparatePhotos
    ? (currentSection === 'before' ? beforePhotos : inspirationPhotos)
    : fallbackPhotos;

  // ✅ FIXED: Set initial section to whichever has photos
  useEffect(() => {
    if (hasSeparatePhotos) {
      setCurrentSection(hasBeforePhotos ? 'before' : 'inspiration');
    }
  }, [hasBeforePhotos, hasInspirationPhotos, hasSeparatePhotos]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ✅ FIXED: Reset image index when switching sections
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [currentSection]);

  const nextImage = () => {
    if (displayPhotos.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % displayPhotos.length);
    }
  };

  const prevImage = () => {
    if (displayPhotos.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + displayPhotos.length) % displayPhotos.length);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

  const formatCurrency = (amount: number) => `KSh ${amount.toLocaleString()}`;

  // ✅ FIXED: Total photo count
  const totalPhotos = hasSeparatePhotos
    ? beforePhotos.length + inspirationPhotos.length
    : fallbackPhotos.length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-background rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Two-column layout */}
            <div className="grid lg:grid-cols-2 max-h-[90vh]">

              {/* Left: Image Gallery */}
              <div className="relative bg-muted min-h-[400px] lg:h-[90vh]">
                {displayPhotos.length > 0 ? (
                  <>
                    <div className="h-full relative group">
                      <OptimizedImage
                        src={displayPhotos[currentImageIndex]}
                        alt={`${project.title} - Image ${currentImageIndex + 1}`}
                        preset="portfolio"
                        size="full"
                        className="w-full h-full cursor-pointer"
                        objectFit="cover"
                        onClick={() => setShowFullscreen(true)}
                      />

                      {/* Navigation Arrows */}
                      {displayPhotos.length > 1 && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        </>
                      )}

                      {/* Image Counter */}
                      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full font-medium">
                        {currentImageIndex + 1} / {displayPhotos.length}
                      </div>

                      {/* Fullscreen Button */}
                      <button
                        onClick={() => setShowFullscreen(true)}
                        className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-lg hover:bg-black/80 transition flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Full
                      </button>
                    </div>

                    {/* ✅ FIXED: Section Tabs - only show if we have BOTH types */}
                    {hasBeforePhotos && hasInspirationPhotos && (
                      <div className="absolute top-4 left-4 flex gap-2">
                        <button
                          onClick={() => setCurrentSection('before')}
                          className={cn(
                            'px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2',
                            currentSection === 'before'
                              ? 'bg-primary text-white shadow-lg'
                              : 'bg-black/40 backdrop-blur-sm text-white hover:bg-black/60'
                          )}
                        >
                          <Camera className="w-4 h-4" />
                          Before ({beforePhotos.length})
                        </button>
                        <button
                          onClick={() => setCurrentSection('inspiration')}
                          className={cn(
                            'px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2',
                            currentSection === 'inspiration'
                              ? 'bg-accent text-white shadow-lg'
                              : 'bg-black/40 backdrop-blur-sm text-white hover:bg-black/60'
                          )}
                        >
                          <Lightbulb className="w-4 h-4" />
                          Inspiration ({inspirationPhotos.length})
                        </button>
                      </div>
                    )}

                    {/* ✅ FIXED: Single section badge if only one type */}
                    {hasSeparatePhotos && !hasBeforePhotos && hasInspirationPhotos && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-accent text-white px-4 py-2 text-sm flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Inspiration Photos
                        </Badge>
                      </div>
                    )}
                    
                    {hasSeparatePhotos && hasBeforePhotos && !hasInspirationPhotos && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-primary text-white px-4 py-2 text-sm flex items-center gap-2">
                          <Camera className="w-4 h-4" />
                          Current Space
                        </Badge>
                      </div>
                    )}

                    {/* Thumbnail Strip */}
                    {displayPhotos.length > 1 && (
                      <div className="absolute bottom-16 left-0 right-0 px-4">
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                          {displayPhotos.map((photo, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={cn(
                                'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition',
                                idx === currentImageIndex
                                  ? 'border-white shadow-lg'
                                  : 'border-transparent opacity-60 hover:opacity-100'
                              )}
                            >
                              <img
                                src={photo}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center bg-muted">
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No photos available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Details — flex column so footer stays pinned */}
              <div className="flex flex-col lg:h-[90vh]">

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  {/* Header */}
                  <div>
                    {variant === 'active' && (
                      <Badge className="bg-blue-500 text-white mb-3">In Progress</Badge>
                    )}
                    <h1 className="font-display text-3xl font-bold mb-3">{project.title}</h1>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.styles.map(style => (
                        <Badge key={style} variant="secondary">{style}</Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Posted {formatDate(project.createdAt)}
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Project Description</h3>
                    <p className="text-muted-foreground leading-relaxed">{project.description}</p>
                  </div>

                  {/* Inspiration Notes */}
                  {project.inspirationNotes && (
                    <div className="p-4 bg-accent/10 rounded-xl border border-accent/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-5 h-5 text-accent" />
                        <h3 className="font-semibold text-lg">Client's Vision</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {project.inspirationNotes}
                      </p>
                    </div>
                  )}

                  {/* Project Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 bg-muted/50">
                      <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs font-medium">Location</span>
                      </div>
                      <p className="font-semibold">{project.location}</p>
                    </Card>

                    <Card className="p-4 bg-muted/50">
                      <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xs font-medium">Budget</span>
                      </div>
                      <p className="font-semibold text-primary">{formatCurrency(project.budget)}</p>
                    </Card>

                    <Card className="p-4 bg-muted/50">
                      <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-medium">Timeline</span>
                      </div>
                      <p className="font-semibold">{project.timeline}</p>
                    </Card>

                    <Card className="p-4 bg-muted/50">
                      <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                        <Camera className="w-4 h-4" />
                        <span className="text-xs font-medium">Photos</span>
                      </div>
                      <p className="font-semibold text-xs">
                        {hasSeparatePhotos ? (
                          <>
                            {hasBeforePhotos && <span>{beforePhotos.length} before</span>}
                            {hasBeforePhotos && hasInspirationPhotos && <span> • </span>}
                            {hasInspirationPhotos && <span>{inspirationPhotos.length} inspiration</span>}
                          </>
                        ) : (
                          `${totalPhotos} total`
                        )}
                      </p>
                    </Card>
                  </div>

                  {/* Client Info */}
                  {project.client && (
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-lg mb-4">Posted By</h3>
                      <div className="flex items-center gap-4">
                        <Avatar className="w-14 h-14 ring-2 ring-border">
                          <AvatarImage src={project.client.avatar} />
                          <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-accent text-white">
                            {project.client.name?.[0]?.toUpperCase() || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-lg">{project.client.name}</p>
                          <p className="text-sm text-muted-foreground">Client</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sticky CTA Footer — always visible */}
                <div className="shrink-0 px-8 py-5 border-t bg-background flex gap-3">
                  <Button variant="outline" onClick={onClose} className="flex-1">
                    Close
                  </Button>
                  {onAction && (
                    <Button
                      onClick={onAction}
                      disabled={alreadySent}
                      className="flex-1"
                      variant={alreadySent ? 'secondary' : 'default'}
                    >
                      {alreadySent ? (
                        <><Check className="w-4 h-4 mr-2" />Proposal Sent</>
                      ) : variant === 'active' ? (
                        <><MessageSquare className="w-4 h-4 mr-2" />Open Chat</>
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
      </div>

      {/* Fullscreen Lightbox */}
      {showFullscreen && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowFullscreen(false)}
        >
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="relative max-w-7xl w-full">
            <img
              src={displayPhotos[currentImageIndex]}
              alt="Fullscreen view"
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {displayPhotos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full font-medium">
                  {currentImageIndex + 1} / {displayPhotos.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}