import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Clock, Sparkles, Calendar } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { BeforeAfterSlider } from '../components/ui/before-after-slider';
import { Button } from '../components/ui/button';
import { useStore } from '../store/use-store';
import { formatCurrency } from '../data/MockData';

export default function DesignerProfilePage() {
  const { id } = useParams();
  const { designers } = useStore();
  const designer = designers.find((d) => d.id === id);

  if (!designer) {
    return <Layout><div className="container py-20 text-center">Designer not found</div></Layout>;
  }

  return (
    <Layout>
      {/* Cover */}
      <div className="relative h-64 lg:h-80">
        <img src={designer.coverImage} alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 -mt-20 relative z-10 pb-20">
        {/* Profile Header */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <img src={designer.avatar} alt={designer.name} className="w-32 h-32 rounded-2xl border-4 border-background shadow-medium object-cover" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="font-display text-3xl font-bold text-foreground">{designer.name}</h1>
              {designer.superVerified && (
                <span className="flex items-center gap-1 px-2 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                  <Sparkles className="w-3 h-3" /> Super Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-muted-foreground mb-4">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{designer.location}</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-accent fill-accent" />{designer.rating} ({designer.reviewCount})</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{designer.responseTime}</span>
            </div>
            <div className="flex gap-3">
              <Button variant="terracotta">Invite to My Project</Button>
              <Button variant="outline"><Calendar className="w-4 h-4 mr-2" />Book 15-min Call</Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card-premium p-4 text-center">
            <p className="font-display text-2xl font-bold text-foreground">{designer.projectsCompleted}</p>
            <p className="text-sm text-muted-foreground">Projects</p>
          </div>
          <div className="card-premium p-4 text-center">
            <p className="font-display text-2xl font-bold text-foreground">{designer.rating}★</p>
            <p className="text-sm text-muted-foreground">Rating</p>
          </div>
          <div className="card-premium p-4 text-center">
            <p className="font-display text-2xl font-bold text-foreground">{formatCurrency(designer.startingPrice)}</p>
            <p className="text-sm text-muted-foreground">Starting</p>
          </div>
        </div>

        {/* About */}
        <div className="card-premium p-6 mb-8">
          <h2 className="font-display text-xl font-semibold mb-4">About</h2>
          <p className="text-muted-foreground">{designer.about}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {designer.styles.map((style) => (
              <span key={style} className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm">{style}</span>
            ))}
          </div>
        </div>

        {/* Portfolio */}
        {designer.portfolio.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-2xl font-semibold mb-6">Portfolio</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {designer.portfolio.map((project) => (
                <motion.div key={project.id} className="card-elevated overflow-hidden" whileHover={{ y: -4 }}>
                  <BeforeAfterSlider beforeImage={project.beforeImage} afterImage={project.afterImage} className="aspect-video" />
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-1">{project.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{formatCurrency(project.budget)}</span>
                      <span>{project.timeline}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {designer.reviews.length > 0 && (
          <div>
            <h2 className="font-display text-2xl font-semibold mb-6">Reviews</h2>
            <div className="space-y-4">
              {designer.reviews.map((review) => (
                <div key={review.id} className="card-premium p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={review.clientAvatar} alt={review.clientName} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-foreground">{review.clientName}</p>
                      <div className="flex text-accent">{Array(review.rating).fill(0).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
