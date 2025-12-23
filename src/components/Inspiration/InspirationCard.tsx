import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { ImageModal } from '../ui/image-modal';
import { useStore } from '../../store/use-store';
import type { Inspiration } from '../../data/MockData';
import { cn } from '../../lib/utils';

interface InspirationCardProps {
  inspiration: Inspiration;
  index?: number;
}

export function InspirationCard({ inspiration, index = 0 }: InspirationCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isIdeaSaved, toggleSaveIdea } = useStore();
  const isSaved = isIdeaSaved(inspiration.id);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveIdea(inspiration.id);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        className="group relative cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Image Container */}
        <div className="relative overflow-hidden rounded-2xl aspect-[4/5]">
          <img
            src={inspiration.image}
            alt={inspiration.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Save Button */}
          <button
            onClick={handleSave}
            className={cn(
              'absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
              isSaved
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-background/80 backdrop-blur-sm text-foreground opacity-0 group-hover:opacity-100'
            )}
          >
            <Heart className={cn('w-5 h-5', isSaved && 'fill-current')} />
          </button>

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <span className="inline-block px-2.5 py-1 bg-secondary/90 text-secondary-foreground text-xs font-medium rounded-full mb-2">
              {inspiration.style}
            </span>
            <h3 className="font-display text-lg font-semibold text-white">
              {inspiration.title}
            </h3>
            <p className="text-white/80 text-sm">
              by {inspiration.designerName}
            </p>
          </div>
        </div>

        {/* Likes */}
        <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
          <Heart className="w-4 h-4" />
          <span className="text-sm">{inspiration.likes}</span>
        </div>
      </motion.div>

      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        image={inspiration.image}
        title={inspiration.title}
        style={inspiration.style}
        designerName={inspiration.designerName}
        isSaved={isSaved}
        onToggleSave={() => toggleSaveIdea(inspiration.id)}
        onUseStyle={() => {
          setIsModalOpen(false);
          // Navigate to post project with style
        }}
      />
    </>
  );
}
