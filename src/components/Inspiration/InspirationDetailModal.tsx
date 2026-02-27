// src/components/Inspiration/InspirationDetailModal.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MapPin, DollarSign, Eye, Heart, ExternalLink,
  Sparkles, CheckCircle2, Calendar, User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BeforeAfterSlider } from '@/components/ui/before-after-slider';

interface InspirationDetailModalProps {
  inspirationId: string;
  onClose: () => void;
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
  likes: number;
  views: number;
  createdAt: string;
}

export function InspirationDetailModal({ inspirationId, onClose }: InspirationDetailModalProps) {
  const navigate = useNavigate();
  const [inspiration, setInspiration] = useState<InspirationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullImage, setShowFullImage] = useState(false);
  const [currentView, setCurrentView] = useState<'before' | 'after'>('before');

  useEffect(() => {
    const fetchInspiration = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/inspirations/${inspirationId}`);
        const data = await res.json();
        if (data.success) {
          setInspiration(data.inspiration);
        }
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
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `KSh ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!inspiration) return null;

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
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Two-column layout */}
            <div className="grid lg:grid-cols-2 max-h-[90vh]">

              {/* Left: Image */}
              <div className="relative bg-muted min-h-[400px] lg:h-[90vh]">
                <BeforeAfterSlider
                  beforeImage={inspiration.beforeImage}
                  afterImage={inspiration.afterImage}
                  className="w-full h-full"
                />

                {/* Image Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge className="bg-black/60 backdrop-blur-sm text-white border-white/20">
                      Before
                    </Badge>
                    <Badge className="bg-primary">After</Badge>
                  </div>
                  <button
                    onClick={() => setShowFullImage(true)}
                    className="px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-sm rounded-lg hover:bg-black/80 transition flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Full View
                  </button>
                </div>
              </div>

              {/* Right: Details — flex column so footer stays pinned */}
              <div className="flex flex-col lg:h-[90vh]">

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  {/* Header */}
                  <div>
                    <h1 className="font-display text-3xl font-bold mb-2">
                      {inspiration.title}
                    </h1>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {inspiration.styles.map(style => (
                        <Badge key={style} variant="secondary">
                          {style}
                        </Badge>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        {inspiration.views.toLocaleString()} views
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4" />
                        {inspiration.likes.toLocaleString()} likes
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {formatDate(inspiration.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="font-semibold mb-2">About This Project</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {inspiration.description}
                    </p>
                  </div>

                  {/* Project Details */}
                  {(inspiration.location || inspiration.projectCost) && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-xl">
                      {inspiration.location && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Location</p>
                          <p className="font-semibold flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            {inspiration.location}
                          </p>
                        </div>
                      )}
                      {inspiration.projectCost && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Project Budget</p>
                          <p className="font-semibold flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4" />
                            {formatCurrency(inspiration.projectCost)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Designer Info */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">Designer</h3>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16 ring-2 ring-border">
                        <AvatarImage src={inspiration.designerAvatar} />
                        <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-accent text-white">
                          {inspiration.designerName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-lg">{inspiration.designerName}</h4>
                          {inspiration.verified && (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        {inspiration.designerLocation && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {inspiration.designerLocation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tip */}
                  <div className="text-xs text-muted-foreground bg-muted/50 p-4 rounded-lg">
                    <p>
                      💡 <strong>Tip:</strong> Contact the designer to discuss similar projects or get a custom quote for your space.
                    </p>
                  </div>
                </div>

                {/* Sticky CTA Footer — always visible */}
                <div className="shrink-0 px-8 py-5 border-t bg-background grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate(`/designers/${inspiration.designerId}`);
                      onClose();
                    }}
                    className="gap-2"
                  >
                    <User className="w-4 h-4" />
                    View Profile
                  </Button>
                  <Button
                    onClick={() => {
                      navigate(`/designers/${inspiration.designerId}?hire=true`);
                      onClose();
                    }}
                    className="gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Hire Designer
                  </Button>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Full Image Lightbox */}
      {showFullImage && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <button
            onClick={() => setShowFullImage(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="relative max-w-7xl w-full">
            <img
              src={currentView === 'before' ? inspiration.beforeImage : inspiration.afterImage}
              alt={currentView === 'before' ? 'Before' : 'After'}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentView('before'); }}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  currentView === 'before'
                    ? 'bg-white text-black'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Before
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentView('after'); }}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  currentView === 'after'
                    ? 'bg-primary text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                After
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}