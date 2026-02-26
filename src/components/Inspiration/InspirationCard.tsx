// src/components/Inspiration/InspirationCard.tsx - UPDATED
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Eye, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { BeforeAfterSlider } from '@/components/ui/before-after-slider';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useStore } from '../../store/use-store';
import { cn } from '../../lib/utils';
import { InspirationDetailModal } from './InspirationDetailModal';
import { useNavigate } from 'react-router-dom';

interface InspirationCardProps {
  inspiration: {
    _id?: string;
    id?: string;
    title: string;
    description?: string;
    beforeImage?: string;
    afterImage?: string;
    image?: string;
    style: string;
    styles?: string[];
    designerName?: string;
    designerId?: string;
    designerAvatar?: string;
    verified?: boolean;
    likes?: number;
    views?: number;
    isPreferred?: boolean; // For personalized feed
  };
  index?: number;
}

export function InspirationCard({ inspiration, index = 0 }: InspirationCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const { isIdeaSaved, toggleSaveIdea } = useStore();
  const isSaved = isIdeaSaved(inspiration._id || inspiration.id || '');

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveIdea(inspiration._id || inspiration.id || '');
  };

  const handleImageError = () => {
    console.error('Image failed to load for inspiration:', inspiration.title);
    setImageError(true);
  };

  const handleViewDesigner = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inspiration.designerId) {
      navigate(`/designers/${inspiration.designerId}`);
    }
  };

  const handleCardClick = () => {
    setShowDetail(true);
  };

  // Handle different image structures
  const beforeImage = inspiration.beforeImage || inspiration.image || '';
  const afterImage = inspiration.afterImage || inspiration.image || '';

  // If no images at all, show placeholder
  if (!beforeImage && !afterImage) {
    return (
      <div className="rounded-2xl overflow-hidden bg-muted p-8 text-center">
        <p className="text-muted-foreground">No images available</p>
        <p className="text-xs text-muted-foreground mt-2">{inspiration.title}</p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-medium hover:shadow-strong transition-all"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* Preferred Badge */}
        {inspiration.isPreferred && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-primary/90 backdrop-blur-sm gap-1 shadow-lg">
              <Sparkles className="w-3 h-3" />
              For You
            </Badge>
          </div>
        )}

        {/* Before/After Slider or Single Image */}
        <div className="aspect-[4/5] bg-muted">
          {beforeImage && afterImage && beforeImage !== afterImage ? (
            <BeforeAfterSlider
              beforeImage={beforeImage}
              afterImage={afterImage}
              className="w-full h-full"
            />
          ) : (
            <img
              src={beforeImage || afterImage}
              alt={inspiration.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={handleImageError}
            />
          )}
          
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <p className="text-muted-foreground text-sm">Image not available</p>
            </div>
          )}
        </div>

        {/* Hover Overlay with Designer Info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
          <div className="translate-y-8 group-hover:translate-y-0 transition-transform duration-500 space-y-3">
            {/* Title & Style */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                  {inspiration.style}
                </Badge>
              </div>
              <h3 className="font-display text-xl font-bold text-white line-clamp-2">
                {inspiration.title}
              </h3>
            </div>

            {/* Designer Info */}
            {inspiration.designerName && (
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/20">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Avatar className="w-8 h-8 ring-2 ring-white/30">
                    <AvatarImage src={inspiration.designerAvatar} />
                    <AvatarFallback className="text-xs bg-primary text-white">
                      {inspiration.designerName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm flex items-center gap-1 truncate">
                      {inspiration.designerName}
                      {inspiration.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      )}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white text-black text-xs h-7 px-3"
                  onClick={handleViewDesigner}
                >
                  <User className="w-3 h-3 mr-1" />
                  View
                </Button>
              </div>
            )}

            {/* Stats */}
            {(inspiration.views || inspiration.likes) && (
              <div className="flex items-center gap-4 text-white/80 text-xs">
                {inspiration.views !== undefined && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {inspiration.views.toLocaleString()}
                  </div>
                )}
                {inspiration.likes !== undefined && (
                  <div className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" />
                    {inspiration.likes.toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={cn(
            'absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg z-10',
            isSaved
              ? 'bg-secondary text-secondary-foreground scale-100'
              : 'bg-white/90 backdrop-blur-sm text-foreground opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
          )}
        >
          <Heart className={cn('w-5 h-5', isSaved && 'fill-current')} />
        </button>
      </motion.div>

      {/* Detail Modal */}
      {showDetail && (
        <InspirationDetailModal
          inspirationId={inspiration._id || inspiration.id || ''}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}