import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: string;
  title: string;
  style: string;
  designerName: string;
  onUseStyle?: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export function ImageModal({
  isOpen,
  onClose,
  image,
  title,
  style,
  designerName,
  onUseStyle,
  isSaved,
  onToggleSave,
}: ImageModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative max-w-4xl w-full bg-card rounded-3xl overflow-hidden shadow-strong"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Save Button */}
            <button
              onClick={onToggleSave}
              className={cn(
                'absolute top-4 left-4 z-10 w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors',
                isSaved ? 'bg-secondary text-secondary-foreground' : 'bg-background/80 hover:bg-background'
              )}
            >
              <Heart className={cn('w-5 h-5', isSaved && 'fill-current')} />
            </button>

            {/* Image */}
            <img
              src={image}
              alt={title}
              className="w-full aspect-[4/3] object-cover"
            />

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <span className="inline-block px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm font-medium mb-2">
                  {style}
                </span>
                <h3 className="font-display text-2xl font-semibold text-foreground">
                  {title}
                </h3>
                <p className="text-muted-foreground">
                  By {designerName}
                </p>
              </div>

              <Button
                onClick={onUseStyle}
                variant="terracotta"
                size="lg"
                className="w-full"
              >
                Use This Style in My Project
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
