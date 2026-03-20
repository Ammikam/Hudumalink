// src/pages/designerpages/DesignerProjectDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Layout } from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectChat } from '@/components/chat/ProjectChat';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, ArrowLeft, DollarSign, Clock,
  Image as ImageIcon, MessageSquare, CheckCircle2,
  Mail, Phone, AlertCircle, MapPin, Lightbulb, Camera, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Client {
  clerkId: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  budget: number;
  timeline: string;
  location?: string;
  styles?: string[];
  photos: string[];
  currentPhotos?: string[];
  inspirationPhotos?: string[];
  inspirationNotes?: string;
  status: 'open' | 'payment_pending' | 'in_progress' | 'completed';
  client: Client;
}

const STATUS_CONFIG = {
  open:            { label: 'Open',             dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  payment_pending: { label: 'Awaiting Payment',  dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 border-amber-200'       },
  in_progress:     { label: 'In Progress',       dot: 'bg-blue-400',    badge: 'bg-blue-50 text-blue-700 border-blue-200'           },
  completed:       { label: 'Completed',          dot: 'bg-muted-foreground/40', badge: 'bg-muted text-muted-foreground border-border' },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.open;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function PhotoGrid({ photos, label, onOpen }: { photos: string[]; label: string; onOpen: (src: string) => void }) {
  if (!photos.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{label} ({photos.length})</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {photos.map((photo, i) => (
          <button key={i} onClick={() => onOpen(photo)}
            className="relative aspect-square rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary">
            <img src={photo} alt={`${label} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DesignerProjectDetailPage() {
  const { id }              = useParams<{ id: string }>();
  const { getToken, isLoaded } = useAuth();

  const [project, setProject]       = useState<Project | null>(null);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('details');
  const [lightbox, setLightbox]     = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    const fetchProject = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error('No token');
        const res  = await fetch(`http://localhost:5000/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setProject(data.project);
      } catch (e) {
        console.error('Error fetching project:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, getToken, isLoaded]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Loading project…</p>
      </div>
    </Layout>
  );

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!project) return (
    <Layout>
      <div className="container mx-auto py-32 text-center px-4">
        <AlertCircle className="w-14 h-14 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-3">Project Not Found</h1>
        <p className="text-muted-foreground mb-6 text-sm">This project doesn't exist or you don't have access.</p>
        <Button asChild>
          <Link to="/designer/active-projects">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Active Projects
          </Link>
        </Button>
      </div>
    </Layout>
  );

  // Photo arrays
  const currentPhotos     = project.currentPhotos?.length     ? project.currentPhotos     : [];
  const inspirationPhotos = project.inspirationPhotos?.length ? project.inspirationPhotos : [];
  const legacyPhotos      = project.photos?.length            ? project.photos            : [];
  const hasNewPhotos      = currentPhotos.length > 0 || inspirationPhotos.length > 0;
  const totalPhotos       = hasNewPhotos
    ? currentPhotos.length + inspirationPhotos.length
    : legacyPhotos.length;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/20 to-transparent">

        {/* ── Sticky header ── */}
        <div className="sticky top-16 lg:top-20 z-30 bg-background/80 backdrop-blur-md border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 max-w-6xl">
            <Button variant="ghost" size="sm" asChild className="gap-1.5 -ml-2 flex-shrink-0">
              <Link to="/designer/active-projects">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Projects</span>
              </Link>
            </Button>
            <div className="h-4 w-px bg-border flex-shrink-0" />
            <h1 className="font-semibold text-sm sm:text-base truncate flex-1 min-w-0">{project.title}</h1>
            <StatusPill status={project.status} />
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-6xl">

          {/* ── Mobile: quick stats ── */}
          <div className="flex gap-3 mb-5 lg:hidden">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/8 border border-primary/15 text-sm flex-1">
              <DollarSign className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="font-bold text-primary">KSh {project.budget.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border text-sm flex-1">
              <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium truncate">{project.timeline}</span>
            </div>
          </div>

          {/* ── Main grid ── */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* ── Left: tabs ── */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full sm:w-auto mb-5 grid grid-cols-2 sm:flex">
                  <TabsTrigger value="details" className="text-xs sm:text-sm gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" /><span>Details</span>
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="text-xs sm:text-sm gap-1.5 relative">
                    <MessageSquare className="w-3.5 h-3.5" /><span>Chat</span>
                  </TabsTrigger>
                </TabsList>

                {/* ── Details tab ── */}
                <TabsContent value="details" className="space-y-5">

                  {/* Client card */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/40 border border-border/60">
                    <Avatar className="w-12 h-12 ring-2 ring-border flex-shrink-0">
                      <AvatarImage src={project.client.avatar} />
                      <AvatarFallback className="font-bold text-base">
                        {project.client.name?.[0]?.toUpperCase() || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Your Client</p>
                      <p className="font-bold truncate">{project.client.name}</p>
                      <div className="flex flex-wrap gap-3 mt-1">
                        {project.client.email && (
                          <a href={`mailto:${project.client.email}`}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[160px]">{project.client.email}</span>
                          </a>
                        )}
                        {project.client.phone && (
                          <a href={`tel:${project.client.phone}`}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                            <Phone className="w-3 h-3" />
                            {project.client.phone}
                          </a>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline"
                      className="flex-shrink-0 gap-1.5 text-xs h-8"
                      onClick={() => setActiveTab('chat')}>
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Message</span>
                    </Button>
                  </div>

                  {/* Description */}
                  <div className="p-4 rounded-2xl bg-muted/40 border border-border/60">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Client Brief</p>
                    <p className="text-sm leading-relaxed">{project.description}</p>
                  </div>

                  {/* Inspiration notes */}
                  {project.inspirationNotes && (
                    <div className="p-4 rounded-2xl bg-secondary/8 border border-secondary/15">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-secondary" />
                        <p className="text-sm font-semibold">Client's Vision</p>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">
                        "{project.inspirationNotes}"
                      </p>
                    </div>
                  )}

                  {/* Style tags */}
                  {project.styles && project.styles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.styles.map(s => (
                        <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Photos */}
                  {(hasNewPhotos || legacyPhotos.length > 0) ? (
                    <div className="space-y-5">
                      <PhotoGrid photos={currentPhotos}     label="Current Space"  onOpen={setLightbox} />
                      <PhotoGrid photos={inspirationPhotos} label="Inspiration"    onOpen={setLightbox} />
                      {!hasNewPhotos && (
                        <PhotoGrid photos={legacyPhotos}    label="Reference Photos" onOpen={setLightbox} />
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-14 rounded-2xl bg-muted/40 border border-dashed border-border">
                      <ImageIcon className="w-10 h-10 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">No reference photos provided</p>
                    </div>
                  )}
                </TabsContent>

                {/* ── Chat tab ── */}
                <TabsContent value="chat">
                  <div className="rounded-2xl overflow-hidden border border-border/60">
                    <ProjectChat projectId={project._id} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* ── Sidebar ── */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-28 space-y-4">

                {/* Project details */}
                <div className="rounded-2xl border border-border/60 bg-background p-5 space-y-4">
                  <h3 className="font-semibold text-base">Project Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <StatusPill status={project.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" /> Budget
                      </span>
                      <span className="text-sm font-bold text-primary">KSh {project.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Timeline
                      </span>
                      <span className="text-sm font-semibold">{project.timeline}</span>
                    </div>
                    {project.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> Location
                        </span>
                        <span className="text-sm font-semibold">{project.location}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5" /> Photos
                      </span>
                      <span className="text-sm font-semibold">{totalPhotos}</span>
                    </div>
                  </div>
                </div>

                {/* Client card */}
                <div className="rounded-2xl border border-border/60 bg-background p-5">
                  <p className="text-sm text-muted-foreground mb-3 font-medium">Client</p>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-11 h-11 ring-2 ring-border flex-shrink-0">
                      <AvatarImage src={project.client.avatar} />
                      <AvatarFallback className="font-bold">
                        {project.client.name?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{project.client.name}</p>
                      <button className="text-xs text-secondary hover:underline"
                        onClick={() => setActiveTab('chat')}>
                        Send message →
                      </button>
                    </div>
                  </div>
                  {(project.client.email || project.client.phone) && (
                    <div className="space-y-2 pt-3 border-t border-border/60">
                      {project.client.email && (
                        <a href={`mailto:${project.client.email}`}
                          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{project.client.email}</span>
                        </a>
                      )}
                      {project.client.phone && (
                        <a href={`tel:${project.client.phone}`}
                          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                          {project.client.phone}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick action */}
                <Button className="w-full gap-2" onClick={() => setActiveTab('chat')}>
                  <MessageSquare className="w-4 h-4" />
                  Message Client
                </Button>
              </div>
            </div>
          </div>

          {/* ── Mobile sidebar info ── */}
          <div className="lg:hidden mt-6 space-y-3">
            <div className="rounded-2xl border border-border/60 bg-background p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Budget</p>
                  <p className="font-bold text-primary text-sm">KSh {project.budget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Timeline</p>
                  <p className="font-semibold text-sm">{project.timeline}</p>
                </div>
                {project.location && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-0.5">Location</p>
                    <p className="font-semibold text-sm">{project.location}</p>
                  </div>
                )}
              </div>
            </div>

            <Button className="w-full gap-2" onClick={() => setActiveTab('chat')}>
              <MessageSquare className="w-4 h-4" />
              Message Client
            </Button>
          </div>
        </div>
      </div>

      {/* ── Photo lightbox ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              onClick={() => setLightbox(null)}
            >
              <span className="text-white text-xl">×</span>
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              src={lightbox} alt="Full size"
              className="max-w-full max-h-full rounded-xl object-contain"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}