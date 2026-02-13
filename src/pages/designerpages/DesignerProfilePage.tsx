// src/pages/designerpages/DesignerProfilePage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Star, Clock, Sparkles, CheckCircle2, Loader2,
  Edit, Settings, Eye, BarChart3, MessageSquare,
  Briefcase, AlertCircle, Instagram, Globe, Link as LinkIcon,
  DollarSign, Calendar, Images, X, ChevronLeft, ChevronRight,
  ZoomIn, CheckCircle, Circle, PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/Layout/Layout';
import { useToast } from '@/components/ui/use-toast';

// ─── Types ─────────────────────────────────────────────────────────────────────

type ProjectStatus = 'open' | 'in_progress' | 'completed';

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
  status?: ProjectStatus;
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

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ProjectStatus, {
  label: string;
  className: string;
  icon: React.ReactNode;
}> = {
  open: {
    label: 'Open',
    className: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    icon: <Circle className="w-3 h-3 fill-emerald-500 text-emerald-500" />,
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-blue-100 text-blue-800 border border-blue-200',
    icon: <PlayCircle className="w-3 h-3 fill-blue-500 text-blue-500" />,
  },
  completed: {
    label: 'Completed',
    className: 'bg-violet-100 text-violet-800 border border-violet-200',
    icon: <CheckCircle className="w-3 h-3 fill-violet-500 text-violet-500" />,
  },
};

// ─── Lightbox component ────────────────────────────────────────────────────────

interface LightboxProps {
  images: string[];
  initialIndex: number;
  title: string;
  onClose: () => void;
}

function Lightbox({ images, initialIndex, title, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex);

  const prev = useCallback(() =>
    setCurrent(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() =>
    setCurrent(i => (i + 1) % images.length), [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  // Prevent scroll behind modal
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          onClick={e => e.stopPropagation()}
        >
          <div>
            <p className="text-white font-semibold text-lg truncate max-w-xs lg:max-w-lg">{title}</p>
            <p className="text-white/50 text-sm">{current + 1} / {images.length}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Main image */}
        <div
          className="flex-1 flex items-center justify-center relative px-16 min-h-0"
          onClick={e => e.stopPropagation()}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              src={images[current]}
              alt={`${title} — photo ${current + 1}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl select-none"
              draggable={false}
            />
          </AnimatePresence>

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition backdrop-blur-sm"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition backdrop-blur-sm"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div
            className="flex gap-2 px-6 py-4 overflow-x-auto flex-shrink-0 justify-center"
            onClick={e => e.stopPropagation()}
          >
            {images.map((url, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                  i === current
                    ? 'ring-2 ring-white scale-110'
                    : 'opacity-50 hover:opacity-80'
                }`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" draggable={false} />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function DesignerProfilePage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [designer, setDesigner]   = useState<Designer | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Lightbox state: { images, index, title } | null
  const [lightbox, setLightbox] = useState<{
    images: string[];
    index: number;
    title: string;
  } | null>(null);

  const openLightbox = (images: string[], index: number, title: string) => {
    setLightbox({ images, index, title });
  };

  // ─── Data fetching ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { navigate('/sign-in'); return; }

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await getToken();
        if (!token) throw new Error('No auth token available');

        const mongoRes = await fetch(
          `http://localhost:5000/api/users/mongo-id/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!mongoRes.ok) throw new Error(`Mongo ID fetch failed (${mongoRes.status})`);
        const mongoData = await mongoRes.json();
        if (!mongoData.success || !mongoData.mongoId) throw new Error('No MongoDB ID returned');

        const profileRes = await fetch(
          `http://localhost:5000/api/designers/${mongoData.mongoId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!profileRes.ok) throw new Error(`Designer fetch failed (${profileRes.status})`);
        const profileData = await profileRes.json();
        if (!profileData.success || !profileData.designer)
          throw new Error(profileData.error || 'Designer profile not found');

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

  // ─── Loading / error guards ───────────────────────────────────────────────

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
            <Button variant="outline" onClick={() => navigate('/designer/apply')}>Set Up Profile</Button>
          </div>
        </div>
      </Layout>
    );
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const filledStars = Math.floor(designer.rating);
  const formatCurrency = (n: number) => `KSh ${n.toLocaleString()}`;
  const formatDate = (ds: string) =>
    new Date(ds).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });

  const getStatusBadge = (status: ProjectStatus = 'completed') => {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.completed;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.className}`}>
        {cfg.icon}
        {cfg.label}
      </span>
    );
  };

  // Combine all images for a project into one lightbox-ready array
  const getAllProjectImages = (project: CompletedProject) => project.photos ?? [];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Layout>

      {/* ── Lightbox (portal-like, sits above everything) ── */}
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          initialIndex={lightbox.index}
          title={lightbox.title}
          onClose={() => setLightbox(null)}
        />
      )}

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
          className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20"
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
              <TabsTrigger value="overview"  className="text-base"><BarChart3     className="w-4 h-4 mr-2" />Overview</TabsTrigger>
              <TabsTrigger value="portfolio" className="text-base"><Briefcase     className="w-4 h-4 mr-2" />Portfolio</TabsTrigger>
              <TabsTrigger value="reviews"   className="text-base"><MessageSquare className="w-4 h-4 mr-2" />Reviews</TabsTrigger>
              <TabsTrigger value="settings"  className="text-base"><Settings      className="w-4 h-4 mr-2" />Settings</TabsTrigger>
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
                    {designer.completedProjects?.length || 0} project{designer.completedProjects?.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {designer.completedProjects?.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {designer.completedProjects.map(project => {
                    const allImages = getAllProjectImages(project);
                    const hasPhotos = allImages.length > 0;

                    return (
                      <Card key={project._id} className="overflow-hidden group">

                        {/* ── Photo hero — clicking opens lightbox ── */}
                        <div
                          className="relative h-56 overflow-hidden bg-muted cursor-pointer"
                          onClick={() => hasPhotos && openLightbox(allImages, 0, project.title)}
                        >
                          {hasPhotos ? (
                            <>
                              <img
                                src={allImages[0]}
                                alt={project.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />

                              {/* Dark overlay on hover */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-2 text-white">
                                  <ZoomIn className="w-8 h-8" />
                                  <span className="text-sm font-semibold">
                                    {allImages.length > 1 ? `View ${allImages.length} photos` : 'View photo'}
                                  </span>
                                </div>
                              </div>

                              {/* Photo count pill */}
                              {allImages.length > 1 && (
                                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 pointer-events-none">
                                  <Images className="w-3.5 h-3.5" />
                                  {allImages.length}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                              <Briefcase className="w-12 h-12" />
                              <span className="text-sm">No photos</span>
                            </div>
                          )}

                          {/* ✅ Status badge — top-left overlay */}
                          <div className="absolute top-2 left-2 pointer-events-none">
                            {getStatusBadge((project.status ?? 'completed') as ProjectStatus)}
                          </div>

                          {/* Style tags — top-right */}
                          {project.styles?.length > 0 && (
                            <div className="absolute top-2 right-2 flex gap-1 pointer-events-none">
                              {project.styles.slice(0, 2).map(s => (
                                <span key={s} className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* ── Info ── */}
                        <div className="p-5">
                          <h3 className="font-bold text-lg mb-1 line-clamp-1">{project.title}</h3>
                          {project.description && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                          )}

                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">{project.location || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>{formatCurrency(project.budget)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>{project.timeline}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>{formatDate(project.completedAt)}</span>
                            </div>
                          </div>

                          {/* Thumbnail strip — shows extra photos, click to open at that index */}
                          {allImages.length > 1 && (
                            <div className="flex gap-1.5 mt-3">
                              {allImages.slice(0, 5).map((photo, i) => (
                                <button
                                  key={i}
                                  onClick={() => openLightbox(allImages, i, project.title)}
                                  className={`relative flex-shrink-0 w-12 h-12 rounded-md overflow-hidden ring-2 transition-all hover:ring-primary ${
                                    i === 0 ? 'ring-primary' : 'ring-transparent'
                                  }`}
                                >
                                  <img src={photo} alt="" className="w-full h-full object-cover" />
                                  {/* "+N more" overlay on last visible thumb */}
                                  {i === 4 && allImages.length > 5 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                                      +{allImages.length - 5}
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-2xl font-bold mb-2">No completed projects yet</h3>
                  <p className="text-muted-foreground mb-1">Projects you complete on the platform will appear here automatically</p>
                  <p className="text-sm text-muted-foreground">Browse open projects and send proposals to get started</p>
                </Card>
              )}

              {/* Application portfolio images - ENHANCED VERSION */}
              {designer.portfolioImages?.length > 0 && (
                <Card className="p-6 mt-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-display text-2xl font-bold">Application Portfolio</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {designer.portfolioImages.length} image{designer.portfolioImages.length !== 1 ? 's' : ''} from your application
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      <Images className="w-4 h-4 mr-1.5" />
                      {designer.portfolioImages.length}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {designer.portfolioImages.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => openLightbox(designer.portfolioImages, i, 'Application Portfolio')}
                        className="relative aspect-square rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all hover:shadow-lg"
                      >
                        <img
                          src={url}
                          alt={`Portfolio ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-100 scale-75">
                            <ZoomIn className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                        {/* Image number indicator */}
                        <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          #{i + 1}
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
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
                            <button
                              onClick={() => openLightbox([review.projectImage!], 0, `${review.clientName}'s project`)}
                              className="mt-4 rounded-lg overflow-hidden border block w-full group"
                            >
                              <div className="relative">
                                <img src={review.projectImage} alt="Project" className="w-full h-48 object-cover group-hover:brightness-90 transition" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                  <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
                                </div>
                              </div>
                            </button>
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
                    { label: 'Calendly Link',        value: designer.calendlyLink,  placeholder: 'https://calendly.com/your-link', type: 'text'   },
                    { label: 'Starting Price (KSh)', value: designer.startingPrice, placeholder: '50000',                          type: 'number' },
                    { label: 'Response Time',        value: designer.responseTime,  placeholder: 'a few hours',                    type: 'text'   },
                  ].map(({ label, value, placeholder, type }) => (
                    <div key={label}>
                      <label className="font-semibold mb-2 block">{label}</label>
                      <input
                        type={type}
                        className="w-full px-4 py-2 border rounded-lg bg-muted/50"
                        placeholder={placeholder}
                        defaultValue={value || ''}
                        readOnly
                      />
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