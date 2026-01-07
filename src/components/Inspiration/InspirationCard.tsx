import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { BeforeAfterSlider } from '@/components/ui/before-after-slider'
import { Badge } from '@/components/ui/badge';
import { useStore } from '../../store/use-store';
import { cn } from '../../lib/utils';

interface InspirationCardProps {
  inspiration: {
    _id?: string;
    id?: string;
    title: string;
    description?: string;
    beforeImage?: string;
    afterImage?: string;
    image?: string; // Some inspirations might only have a single image
    style: string;
    designerName?: string;
    designerId?: string;
    likes?: number;
  };
  index?: number;
}

export function InspirationCard({ inspiration, index = 0 }: InspirationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { isIdeaSaved, toggleSaveIdea } = useStore();
  const isSaved = isIdeaSaved(inspiration._id || inspiration.id || '');

  // Debug: Log the inspiration data to see what's coming from MongoDB
  useEffect(() => {
    console.log('Inspiration data:', inspiration);
    console.log('Before image:', inspiration.beforeImage);
    console.log('After image:', inspiration.afterImage);
    console.log('Single image:', inspiration.image);
  }, [inspiration]);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveIdea(inspiration._id || inspiration.id || '');
  };

  const handleImageError = () => {
    console.error('Image failed to load for inspiration:', inspiration.title);
    setImageError(true);
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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-medium hover:shadow-strong transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Before/After Slider or Single Image */}
      <div className="aspect-[4/5] bg-muted">
        {beforeImage && afterImage && beforeImage !== afterImage ? (
          <BeforeAfterSlider
            beforeImage={beforeImage}
            afterImage={afterImage}
            className="w-full h-full"
          />
        ) : (
          // Fallback to single image if before/after are the same or one is missing
          <img
            src={beforeImage || afterImage}
            alt={inspiration.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        )}
        
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <p className="text-muted-foreground text-sm">Image not available</p>
          </div>
        )}
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
        <div className="translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
          <Badge variant="secondary" className="mb-3 bg-white/20 text-white border-white/30">
            {inspiration.style}
          </Badge>
          <h3 className="font-display text-2xl font-bold text-white mb-2">
            {inspiration.title}
          </h3>
          {inspiration.description && (
            <p className="text-white/90 text-sm mb-4 line-clamp-3">
              {inspiration.description}
            </p>
          )}
          {inspiration.designerName && (
            <p className="text-white font-medium">
              by {inspiration.designerName}
            </p>
          )}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={cn(
          'absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg',
          isSaved
            ? 'bg-secondary text-secondary-foreground'
            : 'bg-background/90 backdrop-blur-sm text-foreground opacity-0 group-hover:opacity-100'
        )}
      >
        <Heart className={cn('w-6 h-6', isSaved && 'fill-current')} />
      </button>

      {/* Bottom Always Visible */}
      {inspiration.designerName && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          {/* <p className="text-white font-medium text-sm">
            by {inspiration.designerName}
          </p> */}
        </div>
      )}
    </motion.div>
  );
}