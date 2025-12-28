import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Clock, Sparkles, Calendar, MessageCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { BeforeAfterSlider } from '@/components/ui/before-after-slider';
import { useStore } from '@/store/use-store';
import { formatCurrency } from '@/data/MockData';
import { Layout } from '@/components/Layout/Layout';
import { SendMessageModal } from '@/components/designers/SendMessageModal';

export default function DesignerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { designers } = useStore();
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const designer = designers.find((d) => d.id === id);

  if (!designer) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <h1 className="font-display text-4xl font-bold mb-4">Designer Not Found</h1>
          <p className="text-muted-foreground">The designer you're looking for doesn't exist.</p>
        </div>
      </Layout>
    );
  }

  const filledStars = Math.floor(designer.rating);
  const hasHalfStar = designer.rating - filledStars >= 0.5;

  return (
    <Layout>
      {/* Hero with Cover */}
      <div className="relative h-96 lg:h-[28rem] overflow-hidden">
        <img
          src={designer.coverImage}
          alt={`${designer.name} cover`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        
        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8">
              <div className="relative -mt-20 lg:-mt-32">
                <img
                  src={designer.avatar}
                  alt={designer.name}
                  className="w-40 h-40 lg:w-56 lg:h-56 rounded-3xl object-cover border-8 border-cream shadow-2xl"
                />
                {designer.verified && (
                  <CheckCircle2 className="absolute bottom-0 right-0 w-12 h-12 text-primary bg-cream rounded-full p-2 shadow-xl translate-x-4 translate-y-4" />
                )}
              </div>

              <div className="flex-1 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="font-display text-4xl lg:text-6xl font-bold">
                    {designer.name}
                  </h1>
                  {designer.superVerified && (
                    <Badge className="bg-gradient-to-r from-gold to-accent text-white px-5 py-2 text-lg shadow-glow animate-pulse-slow">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Super Verified
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-6 text-lg mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {designer.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < filledStars
                              ? 'text-gold fill-gold'
                              : i === filledStars && hasHalfStar
                              ? 'text-gold fill-gold [mask-image:linear-gradient(to_right,black_50%,transparent_50%)]'
                              : 'text-white/30'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold">{designer.rating} ({designer.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Replies in {designer.responseTime}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-8">
                  {designer.styles.map((style) => (
                    <Badge key={style} variant="secondary" className="bg-white/20 border-white/30 text-white">
                      {style}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                 <Button size="xl" className="btn-primary shadow-soft hover:shadow-medium" onClick={() => setMessageModalOpen(true)}>
  <MessageCircle className="w-6 h-6 mr-3" />
  Send Message
</Button>
                  {designer.calendlylink ? (
  <Button
  size="xl"
  variant="secondary"
  onClick={() => {
    if (designer.calendlylink) {
      Calendly.initPopupWidget({ url: designer.calendlylink });
    }
  }}
  disabled={!designer.calendlylink}
>
  <Calendar className="w-6 h-6 mr-3" />
  {designer.calendlylink ? 'Book 15-min Call' : 'Calendar Not Available'}
</Button>
) : (
  <Button size="xl" variant="secondary" disabled>
    <Calendar className="w-6 h-6 mr-3" />
    Calendar Not Available
  </Button>
)}
                  <Button size="xl" variant="outline" className="border-white/50 text-white hover:bg-white/20">
                    Invite to My Project
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column */}
            <div className="space-y-8">
              {/* About */}
              <Card className="card-premium p-8">
                <h2 className="font-display text-2xl font-bold mb-6">About {designer.name.split(' ')[0]}</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {designer.about}
                </p>
              </Card>

              {/* Stats */}
              <Card className="card-premium p-8">
                <h3 className="font-display text-xl font-bold mb-6">Professional Stats</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Projects Completed</span>
                    <span className="font-display text-3xl font-bold text-primary">{designer.projectsCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Client Rating</span>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-3xl font-bold text-primary">{designer.rating}</span>
                      <Star className="w-8 h-8 text-gold fill-gold" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Starting Price</span>
                    <span className="font-display text-3xl font-bold text-primary">
                      {formatCurrency(designer.startingPrice)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Portfolio & Reviews */}
            <div className="lg:col-span-2 space-y-16">
              {/* Portfolio */}
              {designer.portfolio.length > 0 && (
                <div>
                  <h2 className="font-display text-3xl font-bold mb-8">Portfolio Showcase</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    {designer.portfolio.map((project, i) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="card-elevated rounded-3xl overflow-hidden group"
                        whileHover={{ y: -8 }}
                      >
                        <BeforeAfterSlider
                          beforeImage={project.beforeImage}
                          afterImage={project.afterImage}
                          className="aspect-[4/3]"
                        />
                        <div className="p-6 space-y-3">
                          <h3 className="font-display text-xl font-bold">{project.title}</h3>
                          <p className="text-muted-foreground">{project.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="font-medium text-primary">{formatCurrency(project.budget)}</span>
                            <span className="text-muted-foreground">{project.timeline}</span>
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">{project.style}</span>
                            <span className="text-muted-foreground">{project.location}</span>
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
                  <h2 className="font-display text-3xl font-bold mb-8">Client Reviews</h2>
                  <div className="grid gap-6">
                    {designer.reviews.map((review) => (
                      <Card key={review.id} className="card-premium p-8">
                        <div className="flex items-start gap-6">
                          <img
                            src={review.clientAvatar}
                            alt={review.clientName}
                            className="w-16 h-16 rounded-2xl object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="font-display text-xl font-bold">{review.clientName}</p>
                                <p className="text-sm text-muted-foreground">{review.date}</p>
                              </div>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-5 h-5 ${i < review.rating ? 'text-gold fill-gold' : 'text-muted'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">"{review.comment}"</p>
                            {review.projectImage && (
                              <img
                                src={review.projectImage}
                                alt="Project"
                                className="mt-4 rounded-xl w-full h-64 object-cover"
                              />
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <SendMessageModal
  designer={designer}
  open={messageModalOpen}
  onOpenChange={setMessageModalOpen}
/>
    </Layout>
  );
}