import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { BeforeAfterSlider } from '../ui/before-after-slider';
import { formatCurrency, type Designer } from '../../data/MockData';
//import { cn } from '../lib/utils';

interface DesignerCardProps {
  designer: Designer;
  index?: number;
}

export function DesignerCard({ designer, index = 0 }: DesignerCardProps) {
  const hasPortfolio = designer.portfolio.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="card-elevated overflow-hidden group"
    >
      {/* Before/After or Cover Image */}
      <div className="relative h-48 overflow-hidden">
        {hasPortfolio ? (
          <BeforeAfterSlider
            beforeImage={designer.portfolio[0].beforeImage}
            afterImage={designer.portfolio[0].afterImage}
            className="h-full"
          />
        ) : (
          <img
            src={designer.coverImage}
            alt={designer.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {/* Verified Badge */}
        {designer.superVerified && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full shadow-glow">
            <Sparkles className="w-3.5 h-3.5" />
            Super Verified
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Designer Info */}
        <div className="flex items-start gap-3">
          <div className="relative">
            <img
              src={designer.avatar}
              alt={designer.name}
              className="w-14 h-14 rounded-xl object-cover border-2 border-background shadow-soft"
            />
            {designer.verified && (
              <CheckCircle2 className="absolute -bottom-1 -right-1 w-5 h-5 text-primary bg-background rounded-full" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-semibold text-foreground truncate">
              {designer.name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{designer.location}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-accent fill-accent" />
            <span className="font-semibold text-foreground">{designer.rating}</span>
            <span className="text-muted-foreground">({designer.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{designer.responseTime}</span>
          </div>
        </div>

        {/* Styles */}
        <div className="flex flex-wrap gap-2">
          {designer.styles.slice(0, 3).map((style) => (
            <span
              key={style}
              className="px-2.5 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full"
            >
              {style}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Starting from</p>
            <p className="font-semibold text-foreground">
              {formatCurrency(designer.startingPrice)}
            </p>
          </div>
          <Link to={`/designer/${designer.id}`}>
            <Button size="sm">
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
