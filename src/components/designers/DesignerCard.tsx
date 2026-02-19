// src/components/designers/DesignerCard.tsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Star, CheckCircle2, Sparkles, Clock, DollarSign, Images } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Designer } from '@/types/designer';


interface DesignerCardProps {
  designer: Designer;
  index?: number;
}

export function DesignerCard({ designer, index = 0 }: DesignerCardProps) {
  const hasPortfolio  = designer.portfolioImages?.length > 0;
  const hasCover      = !!designer.coverImage;
  const heroImage     = designer.coverImage || designer.portfolioImages?.[0] || null;
  const portfolioPreview = designer.portfolioImages?.slice(0, 3) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      layout
    >
      <Link
        to={`/designers/${designer._id}`}
        className="block group rounded-2xl overflow-hidden border bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      >
        {/* ── Hero image / portfolio strip ──────────────────────────────── */}
        <div className="relative h-52 bg-muted overflow-hidden">
          {heroImage ? (
            <img
              src={heroImage}
              alt={`${designer.name}'s work`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : hasPortfolio ? (
            // Triptych of portfolio images when no cover set
            <div className="flex h-full">
              {portfolioPreview.map((url, i) => (
                <div
                  key={i}
                  className="flex-1 overflow-hidden"
                  style={{ flexBasis: i === 0 ? '50%' : '25%' }}
                >
                  <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          ) : (
            // Gradient placeholder
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 flex items-center justify-center">
              <span className="text-5xl font-bold text-primary/20">
                {designer.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Overlay gradient at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Portfolio count pill */}
          {designer.portfolioImages?.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Images className="w-3 h-3" />
              {designer.portfolioImages.length}
            </div>
          )}

          {/* Verified badge */}
          {(designer.verified || designer.superVerified) && (
            <div className="absolute top-3 left-3">
              {designer.superVerified ? (
                <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs px-2.5 py-1 shadow-md">
                  <Sparkles className="w-3 h-3 mr-1" fill="black" />Super Verified
                </Badge>
              ) : (
                <Badge className="bg-white/90 text-primary text-xs px-2.5 py-1 shadow-md">
                  <CheckCircle2 className="w-3 h-3 mr-1" />Verified
                </Badge>
              )}
            </div>
          )}

          {/* Rating pill — sits at bottom of hero */}
          {designer.rating > 0 && (
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{designer.rating.toFixed(1)}</span>
              <span className="text-white/70">({designer.reviewCount})</span>
            </div>
          )}
        </div>

        {/* ── Card body ─────────────────────────────────────────────────── */}
        <div className="p-5">
          {/* Name + avatar row */}
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-12 h-12 ring-2 ring-border flex-shrink-0">
              <AvatarImage src={designer.avatar} alt={designer.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {designer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="font-bold text-base leading-tight truncate">{designer.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{designer.tagline}</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{designer.location}</span>
          </div>

          {/* Style tags */}
          {designer.styles?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {designer.styles.slice(0, 3).map(s => (
                <Badge key={s} variant="secondary" className="text-xs px-2 py-0.5">{s}</Badge>
              ))}
              {designer.styles.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5 text-muted-foreground">
                  +{designer.styles.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-3 mb-4">
            {designer.projectsCompleted > 0 && (
              <span className="flex items-center gap-1">
                <span className="font-semibold text-foreground">{designer.projectsCompleted}</span>
                project{designer.projectsCompleted !== 1 ? 's' : ''}
              </span>
            )}
            {designer.responseTime && designer.responseTime !== 'Not set' && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {designer.responseTime}
              </span>
            )}
            {designer.startingPrice > 0 && (
              <span className="flex items-center gap-1 ml-auto font-semibold text-foreground">
                <DollarSign className="w-3 h-3" />
                From KSh {(designer.startingPrice / 1000).toFixed(0)}k
              </span>
            )}
          </div>

          {/* CTA */}
          <Button className="w-full" size="sm" asChild>
            <span>View Profile</span>
          </Button>
        </div>
      </Link>
    </motion.div>
  );
}