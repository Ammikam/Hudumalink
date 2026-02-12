// src/pages/designerpages/DesignerProfilePage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { 
  MapPin, Star, Clock, Sparkles, CheckCircle2, Loader2,
  Edit, Plus, Settings, Eye, BarChart3, MessageSquare,
  Briefcase, AlertCircle, Instagram, Globe, Link as LinkIcon,
  DollarSign, Calendar, Image
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/Layout/Layout';
import { useToast } from '@/components/ui/use-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CompletedProject {
  _id: string;
  title: string;
  description: string;
  location: string;
  budget: number;
  timeline: string;
  styles: string[];
  photos: string[];
  thumbnail: string;
  completedAt: string;
  clientName: string;
}

interface Review {
  _id?: string;
  clientName: string;
  clientAvatar?: string;
  rating: number;
  comment: string;
  date?: string;
  projectImage?: string;
}

interface Designer {
  _id: string;
  clerkId: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  coverImage?: string;
  tagline?: string;
  location: string;
  verified: boolean;
  superVerified: boolean;
  rating: number;
  reviewCount: number;
  responseTime: string;
  startingPrice: number;
  about: string;
  styles: string[];
  projectsCompleted: number;
  portfolioImages: string[];
  completedProjects: CompletedProject[];
  reviews: Review[];
  calendlyLink?: string;
  socialLinks?: {
    instagram?: string;
    pinterest?: string;
    website?: string;
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DesignerProfilePage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [designer, setDesigner] = useState<Designer | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { navigate('/sign-in'); return; }

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await getToken();
        if (!token) throw new Error('No auth token available');

        // Step 1: Clerk ID → Mongo ID
        const mongoRes = await fetch(
          `http://localhost:5000/api/users/mongo-id/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!mongoRes.ok) throw new Error(`Mongo ID fetch failed (${mongoRes.status})`);
        const mongoData = await mongoRes.json();
        if (!mongoData.success || !mongoData.mongoId) throw new Error('No MongoDB ID returned');

        // Step 2: Fetch designer profile (now includes completedProjects)
        const profileRes = await fetch(
          `http://localhost:5000/api/designers/${mongoData.mongoId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!profileRes.ok) throw new Error(`Designer fetch failed (${profileRes.status})`);
        const profileData = await profileRes.json();
        if (!profileData.success || !profileData.designer) {
          throw new Error(profileData.error || 'Designer profile not found');
        }

        setDesigner(profileData.designer);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load profile';
        setError(msg);
        toast({ title: 'Profile Error', description: msg, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isLoaded, user, navigate, getToken, toast]);

  // ─── Loading / Error states ────────────────────────────────────────────────

  if (!isLoaded || loading) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading your designer profile...</p>
        </div>
      </Layout>
    );
  }

  if (error || !designer) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
          <h1 className="text-3xl font-bold mb-4">Profile Not Loaded</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {error || "We couldn't load your designer profile."}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.location.reload()}>Retry</Button>
            <Button variant="outline" onClick={() => navigate('/designer/apply')}>
              Set Up Profile
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const filledStars = Math.floor(designer.rating);

  const formatCurrency = (n: number) =>
    `KSh ${n.toLocaleString()}`;

  const formatDate = (ds: string) =>
    new Date(ds).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Layout>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img
          src={designer.coverImage || 'https://images.unsplash.com/photo-1618221195710-dd2dabb60b29?w=1600'}
          alt="Cover"
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

        <Button
          variant="secondary" size="sm"
          className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm hover:bg-white/20"
          onClick={() => navigate('/designer/apply')}
        >
          <Edit className="w-4 h-4 mr-2" />Edit Cover
        </Button>

        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 lg:px-8 pb-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8">

              {/* Avatar */}
              <motion.div
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <Avatar className="w-32 h-32 lg:w-40 lg:h-40 ring-8 ring-white/50 shadow-2xl">
                  <AvatarImage src={designer.avatar || user?.imageUrl} alt={designer.name} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent text-white">
                    {designer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {designer.verified && (
                  <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                )}
              </motion.div>

              {/* Name + stats */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex-1 text-white"
              >
                <div className="flex items-center flex-wrap gap-4 mb-4">
                  <h1 className="font-display text-4xl lg:text-6xl font-bold drop-shadow-lg">
                    {designer.name}
                  </h1>
                  {designer.superVerified && (
                    <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-4 py-2">
                      <Sparkles className="w-5 h-5 mr-2" fill="black" />Super Verified
                    </Badge>
                  )}
                </div>

                <p className="text-xl lg:text-2xl mb-6 opacity-90">
                  {designer.tagline || 'Creative Interior Designer & Space Planner'}
                </p>

                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-base mb-8">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />{designer.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < filledStars ? 'fill-amber-400 text-amber-400' : 'text-white/40'}`} />
                      ))}
                    </div>
                    <span className="font-bold">{designer.rating.toFixed(1)} ({designer.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />{designer.responseTime}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-accent" onClick={() => navigate('/designer/apply')}>
                    <Edit className="w-5 h-5 mr-2" />Edit Profile
                  </Button>
                  <Button size="lg" variant="secondary" onClick={() => window.open(`/designer/${designer._id}`, '_blank')}>
                    <Eye className="w-5 h-5 mr-2" />Preview Public View
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={() => setActiveTab('settings')}>
                    <Settings className="w-5 h-5 mr-2" />Settings
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <section className="py-12 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 h-14">
              <TabsTrigger value="overview" className="text-base">
                <BarChart3 className="w-4 h-4 mr-2" />Overview
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="text-base">
                <Briefcase className="w-4 h-4 mr-2" />Portfolio
              </TabsTrigger>
              <TabsTrigger value="reviews" className="text-base">
                <MessageSquare className="w-4 h-4 mr-2" />Reviews
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-base">
                <Settings className="w-4 h-4 mr-2" />Settings
              </TabsTrigger>
            </TabsList>

            {/* ── Overview ── */}
            <TabsContent value="overview" className="space-y-8">
              <div className="grid lg:grid-cols-3 gap-8">
                <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-muted-foreground">Projects Completed</h3>
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-4xl font-bold text-primary">{designer.projectsCompleted}</div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-muted-foreground">Average Rating</h3>
                    <Star className="w-5 h-5 text-accent fill-accent" />
                  </div>
                  <div className="text-4xl font-bold text-accent">{designer.rating.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground mt-1">from {designer.reviewCount} reviews</p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-muted-foreground">Response Time</h3>
                    <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold text-blue-500">{designer.responseTime}</div>
                </Card>
              </div>

              {/* About */}
              <Card className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold">About</h2>
                  <Button variant="outline" size="sm" onClick={() => navigate('/designer/apply')}>
                    <Edit className="w-4 h-4 mr-2" />Edit
                  </Button>
                </div>
                <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {designer.about || 'Add a description about your work and expertise...'}
                </p>
              </Card>

              {/* Styles */}
              {designer.styles?.length > 0 && (
                <Card className="p-8">
                  <h2 className="font-display text-2xl font-bold mb-6">Design Styles</h2>
                  <div className="flex flex-wrap gap-3">
                    {designer.styles.map((style, i) => (
                      <Badge key={i} variant="secondary" className="px-4 py-2 text-base">{style}</Badge>
                    ))}
                  </div>
                </Card>
              )}

              {/* Social links */}
              {designer.socialLinks && Object.values(designer.socialLinks).some(Boolean) && (
                <Card className="p-8">
                  <h2 className="font-display text-2xl font-bold mb-6">Connect</h2>
                  <div className="flex flex-wrap gap-4">
                    {designer.socialLinks.instagram && (
                      <Button variant="outline" onClick={() => window.open(designer.socialLinks!.instagram, '_blank')}>
                        <Instagram className="w-5 h-5 mr-2" />Instagram
                      </Button>
                    )}
                    {designer.socialLinks.pinterest && (
                      <Button variant="outline" onClick={() => window.open(designer.socialLinks!.pinterest, '_blank')}>
                        <LinkIcon className="w-5 h-5 mr-2" />Pinterest
                      </Button>
                    )}
                    {designer.socialLinks.website && (
                      <Button variant="outline" onClick={() => window.open(designer.socialLinks!.website, '_blank')}>
                        <Globe className="w-5 h-5 mr-2" />Website
                      </Button>
                    )}
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* ── Portfolio ── */}
            <TabsContent value="portfolio" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-3xl font-bold">Portfolio</h2>
                  <p className="text-muted-foreground mt-1">
                    {designer.completedProjects?.length || 0} completed project{designer.completedProjects?.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* ✅ Completed projects with full info */}
              {designer.completedProjects?.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {designer.completedProjects.map(project => (
                    <Card key={project._id} className="overflow-hidden group">

                      {/* Photo */}
                      <div className="relative h-56 overflow-hidden bg-muted">
                        {project.photos?.length > 0 ? (
                          <>
                            <img
                              src={project.photos[0]}
                              alt={project.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Photo count badge */}
                            {project.photos.length > 1 && (
                              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <Image className="w-3 h-3" />
                                {project.photos.length} photos
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Briefcase className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        {/* Style badges overlay */}
                        {project.styles?.length > 0 && (
                          <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                            {project.styles.slice(0, 2).map(s => (
                              <Badge key={s} className="bg-black/60 text-white text-xs border-0">{s}</Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-5">
                        <h3 className="font-bold text-lg mb-2 line-clamp-1">{project.title}</h3>
                        {project.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {project.description}
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{project.location || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 flex-shrink-0" />
                            <span>{formatCurrency(project.budget)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span>{project.timeline}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>{formatDate(project.completedAt)}</span>
                          </div>
                        </div>

                        {/* Expand to see all photos */}
                        {project.photos?.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => setExpandedProject(
                              expandedProject === project._id ? null : project._id
                            )}
                          >
                            {expandedProject === project._id ? 'Hide photos' : `View all ${project.photos.length} photos`}
                          </Button>
                        )}

                        {/* Extra photos grid */}
                        {expandedProject === project._id && project.photos?.length > 1 && (
                          <div className="grid grid-cols-3 gap-2 mt-3">
                            {project.photos.slice(1).map((photo, i) => (
                              <img
                                key={i}
                                src={photo}
                                alt={`${project.title} ${i + 2}`}
                                className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                                onClick={() => window.open(photo, '_blank')}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                // ─── Empty state ─────────────────────────────────────────────
                <Card className="p-12 text-center">
                  <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-2xl font-bold mb-2">No completed projects yet</h3>
                  <p className="text-muted-foreground mb-2">
                    Projects you complete on the platform will appear here automatically
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Browse open projects and send proposals to get started
                  </p>
                </Card>
              )}

              {/* Raw portfolio images (uploaded during application) */}
              {designer.portfolioImages?.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-display text-xl font-bold mb-4 text-muted-foreground">
                    Application Portfolio Images
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {designer.portfolioImages.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img
                          src={url}
                          alt={`Portfolio ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                          onClick={() => window.open(url, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ── Reviews ── */}
            <TabsContent value="reviews" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-3xl font-bold">Client Reviews</h2>
                  <p className="text-muted-foreground mt-2">
                    {designer.reviewCount} total reviews • {designer.rating.toFixed(1)} average
                  </p>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-6 h-6 ${i < Math.floor(designer.rating) ? 'fill-primary text-primary' : 'text-muted'}`} />
                  ))}
                </div>
              </div>

              {designer.reviews?.length > 0 ? (
                <div className="grid gap-6">
                  {designer.reviews.map((review, index) => (
                    <Card key={review._id || index} className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={review.clientAvatar} />
                          <AvatarFallback>{review.clientName?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold">{review.clientName || 'Anonymous'}</h4>
                              <p className="text-sm text-muted-foreground">
                                {review.date ? formatDate(review.date) : 'Date not available'}
                              </p>
                            </div>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="leading-relaxed">{review.comment || 'No comment provided'}</p>
                          {review.projectImage && (
                            <div className="mt-4 rounded-lg overflow-hidden border">
                              <img src={review.projectImage} alt="Project" className="w-full h-48 object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-2xl font-bold mb-2">No Reviews Yet</h3>
                  <p className="text-muted-foreground">Complete projects to start receiving client feedback</p>
                </Card>
              )}
            </TabsContent>

            {/* ── Settings ── */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="p-6">
                <h2 className="font-display text-2xl font-bold mb-6">Profile Settings</h2>
                <div className="space-y-6">
                  {[
                    { label: 'Calendly Link',         value: designer.calendlyLink,   placeholder: 'https://calendly.com/your-link', type: 'text' },
                    { label: 'Starting Price (KSh)',  value: designer.startingPrice,  placeholder: '50000',                          type: 'number' },
                    { label: 'Response Time',         value: designer.responseTime,   placeholder: 'a few hours',                    type: 'text' },
                  ].map(({ label, value, placeholder, type }) => (
                    <div key={label}>
                      <label className="font-semibold mb-2 block">{label}</label>
                      <div className="flex gap-2">
                        <input
                          type={type}
                          className="flex-1 px-4 py-2 border rounded-lg bg-muted/50"
                          placeholder={placeholder}
                          defaultValue={value || ''}
                          readOnly
                        />
                      </div>
                    </div>
                  ))}
                  <Button className="w-full bg-gradient-to-r from-primary to-accent" onClick={() => navigate('/designer/apply')}>
                    <Edit className="w-5 h-5 mr-2" />Edit Full Profile
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}