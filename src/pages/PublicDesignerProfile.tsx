// src/pages/PublicDesignerProfile.tsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import {
  MapPin, Star, Clock, DollarSign, Sparkles, CheckCircle2, Loader2,
  AlertCircle, Calendar, MessageSquare, Briefcase, ArrowLeft, ExternalLink,
  Instagram, Globe, Link as LinkIcon, ChevronLeft, ChevronRight, X, ZoomIn
} from 'lucide-react';
import { Layout } from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CompletedProject {
  _id: string; title: string; description: string; location: string;
  budget: number; timeline: string; styles: string[]; photos: string[];
  completedAt: string; clientName: string;
}
interface Review {
  _id?: string; clientName: string; clientAvatar?: string;
  rating: number; comment: string; date?: string; projectImage?: string;
}
interface Designer {
  _id: string; name: string; email: string; avatar: string; coverImage?: string;
  tagline?: string; location: string; verified: boolean; superVerified: boolean;
  rating: number; reviewCount: number; responseTime: string; startingPrice: number;
  about: string; styles: string[]; projectsCompleted: number;
  portfolioImages: string[]; completedProjects: CompletedProject[]; reviews: Review[];
  calendlyLink?: string;
  socialLinks?: { instagram?: string; pinterest?: string; website?: string };
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ images, initialIndex, title, onClose }: {
  images: string[]; initialIndex: number; title: string; onClose: () => void;
}) {
  const [current, setCurrent] = useState(initialIndex);
  const prev = useCallback(() => setCurrent(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent(i => (i + 1) % images.length), [images.length]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key==='Escape') onClose(); if (e.key==='ArrowLeft') prev(); if (e.key==='ArrowRight') next(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, prev, next]);
  useEffect(() => { document.body.style.overflow='hidden'; return () => { document.body.style.overflow=''; }; }, []);
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm" onClick={onClose}>
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" onClick={e=>e.stopPropagation()}>
        <div><p className="text-white font-semibold text-lg truncate max-w-xs lg:max-w-lg">{title}</p>
          <p className="text-white/50 text-sm">{current+1} / {images.length}</p></div>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"><X className="w-5 h-5 text-white"/></button>
      </div>
      <div className="flex-1 flex items-center justify-center relative px-16 min-h-0" onClick={e=>e.stopPropagation()}>
        <motion.img key={current} src={images[current]} alt={`${title} — photo ${current+1}`}
          initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.96}} transition={{duration:0.2}}
          className="max-w-full max-h-full object-contain rounded-xl shadow-2xl select-none" draggable={false}/>
        {images.length>1 && (<>
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition backdrop-blur-sm"><ChevronLeft className="w-6 h-6 text-white"/></button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition backdrop-blur-sm"><ChevronRight className="w-6 h-6 text-white"/></button>
        </>)}
      </div>
      {images.length>1 && (
        <div className="flex gap-2 px-6 py-4 overflow-x-auto flex-shrink-0 justify-center" onClick={e=>e.stopPropagation()}>
          {images.map((url,i) => (
            <button key={i} onClick={()=>setCurrent(i)} className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${i===current?'ring-2 ring-white scale-110':'opacity-50 hover:opacity-80'}`}>
              <img src={url} alt="" className="w-full h-full object-cover" draggable={false}/>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PublicDesignerProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const navigate = useNavigate();

  const [designer, setDesigner] = useState<Designer | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [lightbox, setLightbox] = useState<{images:string[];index:number;title:string}|null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true); setError(null);
        const res = await fetch(`http://localhost:5000/api/designers/${id}`);
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load');
        setDesigner(data.designer);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to load designer';
        setError(msg);
      } finally { setLoading(false); }
    };
    if (id) load();
  }, [id]);

  const formatCurrency = (n: number) => `KSh ${n.toLocaleString()}`;
  const formatDate = (ds: string) => new Date(ds).toLocaleDateString('en-KE',{year:'numeric',month:'long',day:'numeric'});

  // Guards
  if (loading) return (
    <Layout><div className="container mx-auto py-32 text-center">
      <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4"/>
      <p className="text-muted-foreground">Loading designer profile...</p>
    </div></Layout>
  );

  if (error || !designer) return (
    <Layout><div className="container mx-auto py-32 text-center">
      <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4"/>
      <h1 className="text-3xl font-bold mb-4">Designer Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">{error || "This designer doesn't exist or isn't approved."}</p>
      <Button asChild><Link to="/designers"><ArrowLeft className="w-5 h-5 mr-2"/>Back to Designers</Link></Button>
    </div></Layout>
  );

  return (
    <Layout>
      {lightbox && <Lightbox images={lightbox.images} initialIndex={lightbox.index} title={lightbox.title} onClose={()=>setLightbox(null)}/>}

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img src={designer.coverImage||'https://images.unsplash.com/photo-1618221195710-dd2dabb60b29?w=1600'}
          alt="Cover" className="w-full h-full object-cover brightness-75"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"/>

        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 lg:px-8 pb-12">
            <Button variant="ghost" asChild className="mb-6 text-white hover:bg-white/10">
              <Link to="/designers"><ArrowLeft className="w-5 h-5 mr-2"/>Back to Designers</Link>
            </Button>

            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8">
              <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="relative">
                <Avatar className="w-32 h-32 lg:w-40 lg:h-40 ring-8 ring-white/50 shadow-2xl">
                  <AvatarImage src={designer.avatar} alt={designer.name}/>
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent text-white">
                    {designer.name.split(' ').map(n=>n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {designer.verified && (
                  <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                    <CheckCircle2 className="w-8 h-8 text-primary"/>
                  </div>
                )}
              </motion.div>

              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3,duration:0.6}} className="flex-1 text-white">
                <div className="flex items-center flex-wrap gap-4 mb-3">
                  <h1 className="font-display text-4xl lg:text-6xl font-bold drop-shadow-lg">{designer.name}</h1>
                  {designer.superVerified && (
                    <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-4 py-2">
                      <Sparkles className="w-5 h-5 mr-2" fill="black"/>Super Verified
                    </Badge>
                  )}
                </div>
                {designer.tagline && <p className="text-xl lg:text-2xl opacity-90 mb-6">{designer.tagline}</p>}

                <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-base mb-8">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 flex-shrink-0"/>{designer.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_,i)=>(
                        <Star key={i} className={`w-5 h-5 ${i<Math.floor(designer.rating)?'fill-amber-400 text-amber-400':'text-white/40'}`}/>
                      ))}
                    </div>
                    <span className="font-bold">{designer.rating.toFixed(1)} ({designer.reviewCount} reviews)</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {user ? (
                    <Button size="lg" asChild>
                      <Link to="/post-project" state={{designerId: designer._id}}>
                        <MessageSquare className="w-5 h-5 mr-2"/>Hire {designer.name.split(' ')[0]}
                      </Link>
                    </Button>
                  ) : (
                    <Button size="lg" asChild>
                      <Link to="/sign-up">Sign Up to Hire</Link>
                    </Button>
                  )}
                  {designer.calendlyLink && (
                    <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10" asChild>
                      <a href={designer.calendlyLink} target="_blank" rel="noopener noreferrer">
                        <Calendar className="w-5 h-5 mr-2"/>Book Consultation
                      </a>
                    </Button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <section className="py-12 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 h-14">
              <TabsTrigger value="overview" className="text-base"><Briefcase className="w-4 h-4 mr-2"/>Overview</TabsTrigger>
              <TabsTrigger value="portfolio" className="text-base"><Briefcase className="w-4 h-4 mr-2"/>Portfolio</TabsTrigger>
              <TabsTrigger value="reviews" className="text-base"><MessageSquare className="w-4 h-4 mr-2"/>Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-muted-foreground text-sm">Projects Completed</h3>
                    <Briefcase className="w-5 h-5 text-primary"/>
                  </div>
                  <div className="text-4xl font-bold text-primary">{designer.projectsCompleted}</div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-muted-foreground text-sm">Average Rating</h3>
                    <Star className="w-5 h-5 text-accent fill-accent"/>
                  </div>
                  <div className="text-4xl font-bold text-accent">{designer.rating.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground mt-1">from {designer.reviewCount} reviews</p>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-muted-foreground text-sm">Response Time</h3>
                    <Clock className="w-5 h-5 text-blue-500"/>
                  </div>
                  <div className="text-2xl font-bold text-blue-500">{designer.responseTime}</div>
                </Card>
              </div>

              {designer.startingPrice > 0 && (
                <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-muted-foreground text-sm">Starting Price</h3>
                    <DollarSign className="w-5 h-5 text-green-500"/>
                  </div>
                  <div className="text-3xl font-bold text-blue-500">{formatCurrency(designer.startingPrice)}</div>
                </Card>
              )}

              {designer.about && (
                <Card className="p-8">
                  <h2 className="font-display text-2xl font-bold mb-4">About</h2>
                  <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">{designer.about}</p>
                </Card>
              )}

              {designer.styles?.length > 0 && (
                <Card className="p-8">
                  <h2 className="font-display text-2xl font-bold mb-4">Design Styles</h2>
                  <div className="flex flex-wrap gap-2">
                    {designer.styles.map(s => <Badge key={s} variant="secondary" className="text-sm px-3 py-1">{s}</Badge>)}
                  </div>
                </Card>
              )}

              {designer.socialLinks && Object.values(designer.socialLinks).some(Boolean) && (
                <Card className="p-8">
                  <h2 className="font-display text-2xl font-bold mb-4">Connect</h2>
                  <div className="flex flex-wrap gap-3">
                    {designer.socialLinks.instagram && (
                      <a href={designer.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 border rounded-xl hover:bg-muted transition text-sm font-medium">
                        <Instagram className="w-4 h-4 text-pink-500"/>Instagram<ExternalLink className="w-3 h-3 text-muted-foreground"/>
                      </a>
                    )}
                    {designer.socialLinks.pinterest && (
                      <a href={designer.socialLinks.pinterest} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 border rounded-xl hover:bg-muted transition text-sm font-medium">
                        <LinkIcon className="w-4 h-4 text-red-500"/>Pinterest<ExternalLink className="w-3 h-3 text-muted-foreground"/>
                      </a>
                    )}
                    {designer.socialLinks.website && (
                      <a href={designer.socialLinks.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 border rounded-xl hover:bg-muted transition text-sm font-medium">
                        <Globe className="w-4 h-4 text-blue-500"/>Website<ExternalLink className="w-3 h-3 text-muted-foreground"/>
                      </a>
                    )}
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="portfolio" className="space-y-6">
              <h2 className="font-display text-3xl font-bold">Portfolio</h2>
              {designer.completedProjects?.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {designer.completedProjects.map(project => {
                    const imgs = project.photos ?? [];
                    return (
                      <Card key={project._id} className="overflow-hidden group">
                        <div className="relative h-56 overflow-hidden bg-muted cursor-pointer"
                          onClick={()=>imgs.length&&setLightbox({images:imgs,index:0,title:project.title})}>
                          {imgs[0] ? (
                            <>
                              <img src={imgs[0]} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1.5 text-white">
                                  <ZoomIn className="w-8 h-8"/><span className="text-sm font-semibold">{imgs.length>1?`View ${imgs.length} photos`:'View photo'}</span>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                              <Briefcase className="w-12 h-12"/><span className="text-sm">No photos</span>
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-lg mb-1 line-clamp-1">{project.title}</h3>
                          {project.description&&<p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 flex-shrink-0"/><span className="truncate">{project.location||'N/A'}</span></div>
                            <div className="flex items-center gap-2"><DollarSign className="w-3.5 h-3.5 flex-shrink-0"/><span>{formatCurrency(project.budget)}</span></div>
                            <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 flex-shrink-0"/><span>{project.timeline}</span></div>
                            <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 flex-shrink-0"/><span>{formatDate(project.completedAt)}</span></div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4"/>
                  <p className="text-muted-foreground">No completed projects yet</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-3xl font-bold">Client Reviews</h2>
                  <p className="text-muted-foreground mt-2">{designer.reviewCount} total reviews • {designer.rating.toFixed(1)} average</p>
                </div>
                <div className="flex">{[...Array(5)].map((_,i)=><Star key={i} className={`w-6 h-6 ${i<Math.floor(designer.rating)?'fill-primary text-primary':'text-muted'}`}/>)}</div>
              </div>
              {designer.reviews?.length>0 ? (
                <div className="grid gap-6">
                  {designer.reviews.map((review,index)=>(
                    <Card key={review._id||index} className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12"><AvatarImage src={review.clientAvatar}/><AvatarFallback>{review.clientName?.[0]||'?'}</AvatarFallback></Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <div><h4 className="font-bold">{review.clientName||'Anonymous'}</h4>
                              <p className="text-sm text-muted-foreground">{review.date?formatDate(review.date):'Date not available'}</p></div>
                            <div className="flex">{[...Array(5)].map((_,i)=><Star key={i} className={`w-4 h-4 ${i<review.rating?'fill-yellow-400 text-yellow-400':'text-muted'}`}/>)}</div>
                          </div>
                          <p className="leading-relaxed">{review.comment||'No comment'}</p>
                          {review.projectImage && (
                            <button onClick={()=>setLightbox({images:[review.projectImage!],index:0,title:`${review.clientName}'s project`})}
                              className="mt-4 rounded-lg overflow-hidden border block w-full group">
                              <div className="relative"><img src={review.projectImage} alt="Project" className="w-full h-48 object-cover group-hover:brightness-90 transition"/>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><ZoomIn className="w-8 h-8 text-white drop-shadow-lg"/></div>
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
                  <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4"/>
                  <p className="text-muted-foreground">No reviews yet</p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}