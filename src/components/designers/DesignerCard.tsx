import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BeforeAfterSlider } from '@/components/ui/before-after-slider';
import { formatCurrency, type Designer } from '@/data/MockData';

interface DesignerCardProps {
  designer: Designer;
  index?: number;
}

export function DesignerCard({ designer, index = 0 }: DesignerCardProps) {
  const hasPortfolio = designer.portfolio.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{ y: -12, transition: { duration: 0.4 } }}
      className="group"
    >
      <Link to={`/designer/${designer.id}`} className="block">
        <div className="card-elevated rounded-3xl overflow-hidden shadow-soft group-hover:shadow-strong transition-all duration-500 bg-card">
          {/* Hero Image / Before-After */}
          <div className="relative h-64 overflow-hidden">
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
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
            )}

            {/* Dark overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Hover CTA overlay */}
            <div className="absolute inset-0 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10">
              <div className="text-white">
                <p className="font-display text-2xl font-bold mb-2">View Full Profile</p>
                <p className="text-sm opacity-90">Portfolio • Reviews • Contact</p>
              </div>
              <ArrowRight className="w-8 h-8 ml-auto" />
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 lg:p-8 space-y-5">
            {/* Avatar + Name + Location + Badges */}
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <img
                  src={designer.avatar}
                  alt={designer.name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-cream shadow-medium"
                />
                {designer.verified && (
                  <CheckCircle2 className="absolute -bottom-2 -right-2 w-7 h-7 text-primary bg-card rounded-full shadow-soft p-1" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-display text-xl lg:text-2xl font-bold text-foreground">
                    {designer.name}
                  </h3>

                  {/* Badges moved here */}
                  {designer.superVerified && (
                    <Badge className="bg-gradient-to-r from-gold to-accent text-white border-0 shadow-glow animate-pulse-slow">
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      Super Verified
                    </Badge>
                  )}
                  {designer.verified && !designer.superVerified && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-muted-foreground mt-2">
                  <MapPin className="w-4 h-4" />
                  <span>{designer.location}</span>
                </div>
              </div>
            </div>

            {/* Rating + Response */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(designer.rating)
                          ? 'text-gold fill-gold'
                          : 'text-muted stroke-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-foreground">
                  {designer.rating} ({designer.reviewCount} reviews)
                </span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Replies in {designer.responseTime}</span>
              </div>
            </div>

            {/* Styles */}
            <div className="flex flex-wrap gap-2">
              {designer.styles.map((style) => (
                <Badge key={style} variant="outline" className="border-primary/30 text-primary">
                  {style}
                </Badge>
              ))}
            </div>

            {/* Price + CTA */}
            <div className="flex items-end justify-between pt-4 border-t border-border/50">
              <div>
                <p className="text-sm text-muted-foreground">Starting from</p>
                <p className="font-display text-2xl lg:text-3xl font-bold text-primary">
                  {formatCurrency(designer.startingPrice)}
                </p>
              </div>

              <Button size="lg" className="shadow-soft hover:shadow-medium">
                View Profile
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}