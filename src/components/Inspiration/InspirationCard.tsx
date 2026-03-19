// src/components/Inspiration/InspirationCard.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { BeforeAfterSlider } from '@/components/ui/before-after-slider';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
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
    isPreferred?: boolean;
  };
  index?: number;
}

export function InspirationCard({ inspiration, index = 0 }: InspirationCardProps) {
  const navigate = useNavigate();
  const [showDetail, setShowDetail] = useState(false);
  const { isIdeaSaved, toggleSaveIdea } = useStore();
  const isSaved = isIdeaSaved(inspiration._id || inspiration.id || '');

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveIdea(inspiration._id || inspiration.id || '');
  };

  const handleViewDesigner = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inspiration.designerId) {
      navigate(`/designers/${inspiration.designerId}`);
    }
  };

  const beforeImage = inspiration.beforeImage || inspiration.image || '';
  const afterImage  = inspiration.afterImage  || inspiration.image || '';
  const hasSlider   = beforeImage && afterImage && beforeImage !== afterImage;

  if (!beforeImage && !afterImage) {
    return (
      <div className="rounded-2xl overflow-hidden bg-muted p-8 text-center">
        <p className="text-muted-foreground text-sm">No images available</p>
        <p className="text-xs text-muted-foreground mt-1">{inspiration.title}</p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.4 }}
        className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300"
        onClick={() => setShowDetail(true)}
      >
        {/* Preferred badge */}
        {inspiration.isPreferred && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <Badge className="bg-primary/90 backdrop-blur-sm gap-1 shadow-md text-xs">
              <Sparkles className="w-3 h-3" />
              For You
            </Badge>
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          className={cn(
            'absolute top-2.5 right-2.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-md z-10',
            isSaved
              ? 'bg-secondary text-secondary-foreground scale-100 opacity-100'
              : 'bg-white/90 backdrop-blur-sm text-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 scale-90 group-hover:scale-100'
          )}
        >
          <Heart className={cn('w-4 h-4', isSaved && 'fill-current')} />
        </button>

        {/* Image */}
        <div className="aspect-[4/5] bg-muted">
          {hasSlider ? (
            <BeforeAfterSlider
              beforeImage={beforeImage}
              afterImage={afterImage}
              className="w-full h-full"
            />
          ) : (
            <OptimizedImage
              src={beforeImage || afterImage}
              alt={inspiration.title}
              preset="inspiration"
              size="card"
              className="w-full h-full"
              objectFit="cover"
              showPlaceholder
            />
          )}
        </div>

        {/* ── Info overlay ── */}
        {/* Mobile: always visible at bottom. Desktop: slides up on hover */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent',
          'flex flex-col justify-end p-3 sm:p-4',
          // Mobile: always show. Desktop: animate on hover
          'sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity sm:duration-400',
        )}>
          <div className={cn(
            'space-y-2',
            // Mobile: static. Desktop: slide up
            'sm:translate-y-6 sm:group-hover:translate-y-0 sm:transition-transform sm:duration-400',
          )}>
            {/* Style tag */}
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm"
            >
              {inspiration.style}
            </Badge>

            {/* Title */}
            <h3 className="font-display text-sm sm:text-base lg:text-lg font-bold text-white line-clamp-2 leading-snug">
              {inspiration.title}
            </h3>

            {/* Designer row */}
            {inspiration.designerName && (
              <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/20">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <Avatar className="w-6 h-6 sm:w-7 sm:h-7 ring-1 ring-white/30 flex-shrink-0">
                    <AvatarImage src={inspiration.designerAvatar} />
                    <AvatarFallback className="text-[10px] bg-primary text-white">
                      {inspiration.designerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-white text-xs sm:text-sm font-medium truncate flex items-center gap-1">
                    {inspiration.designerName}
                    {inspiration.verified && (
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-blue-300" />
                    )}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white text-black text-[10px] sm:text-xs h-6 sm:h-7 px-2 sm:px-3 flex-shrink-0"
                  onClick={handleViewDesigner}
                >
                  <User className="w-3 h-3 sm:mr-1" />
                  <span className="hidden sm:inline">View</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {showDetail && (
        <InspirationDetailModal
          inspirationId={inspiration._id || inspiration.id || ''}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}