// src/pages/ClientDashboard.tsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SignedIn } from '@clerk/clerk-react';
import {
  Loader2, Plus, FolderOpen, Clock, CheckCircle2,
  Users, DollarSign, MapPin, Calendar, X, Check, AlertCircle, MessageSquare,
  TrendingUp, Briefcase, ArrowRight, Sparkles,
} from 'lucide-react';

import { Layout } from '@/components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/data/MockData';
import { api } from '@/services/api';

interface Designer {
  _id: string;
  name: string;
  avatar?: string;
}

interface Proposal {
  _id: string;
  designer: Designer;
  message: string;
  price: number;
  timeline: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface Project {
  _id: string;
  title: string;
  description: string;
  location: string;
  budget: number;
  timeline: string;
  styles: string[];
  photos: string[];
  status: 'open' | 'payment_pending' | 'in_progress' | 'completed';
  proposals: Proposal[];
  designer?: Designer | null;
  createdAt: string;
}

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  pendingProposals: number;
}

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  open:            { label: 'Open',            dot: 'bg-emerald-400',        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'   },
  payment_pending: { label: 'Awaiting Payment', dot: 'bg-amber-400',          badge: 'bg-amber-50 text-amber-700 border-amber-200'         },
  in_progress:     { label: 'In Progress',      dot: 'bg-blue-400',            badge: 'bg-blue-50 text-blue-700 border-blue-200'             },
  completed:       { label: 'Completed',         dot: 'bg-muted-foreground/40', badge: 'bg-muted text-muted-foreground border-border'         },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.open;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function ClientDashboard() {
  const { userId, getToken, isLoaded } = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [projects, setProjects]                   = useState<Project[]>([]);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState('');
  const [activeTab, setActiveTab]                 = useState('all');
  const [selectedProject, setSelectedProject]     = useState<Project | null>(null);
  const [acceptingProposal, setAcceptingProposal] = useState<string | null>(null);
  const [rejectingProposal, setRejectingProposal] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts]           = useState<Record<string, number>>({});

  // ─── Fetch ───────────────────────────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication failed');
      const rawProjects = await api.getUserProjects(token);
      const [withProposals, unreadRes] = await Promise.all([
        Promise.all(
          rawProjects.map(async (proj: any) => {
            try {
              const res = await fetch(`http://localhost:5000/api/proposals/project/${proj._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await res.json();
              return { ...proj, proposals: data.success ? data.proposals : [] };
            } catch { return { ...proj, proposals: [] }; }
          })
        ),
        fetch('http://localhost:5000/api/messages/unread-counts', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setProjects(withProposals);
      const unreadData = await unreadRes.json();
      if (unreadData.success) setUnreadCounts(unreadData.unreadCounts || {});
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [userId, getToken]);

  useEffect(() => { if (isLoaded && userId) fetchProjects(); }, [isLoaded, userId, fetchProjects]);

  // ─── Stats ───────────────────────────────────────────────────────────────────
  const stats: DashboardStats = useMemo(() => ({
    totalProjects:     projects.length,
    activeProjects:    projects.filter(p => p.status === 'open' || p.status === 'in_progress' || p.status === 'payment_pending').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalBudget:       projects.reduce((s, p) => s + p.budget, 0),
    pendingProposals:  projects.reduce((s, p) => s + (p.proposals?.filter(pr => pr.status === 'pending').length ?? 0), 0),
  }), [projects]);

  const filteredProjects = useMemo(() => projects.filter(p => {
    if (activeTab === 'active')    return p.status === 'open' || p.status === 'in_progress' || p.status === 'payment_pending';
    if (activeTab === 'completed') return p.status === 'completed';
    return true;
  }), [projects, activeTab]);

  // ─── Accept Proposal → redirect to payment ───────────────────────────────────
  const handleAcceptProposal = async (proposalId: string, projectId: string) => {
    setAcceptingProposal(proposalId);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/proposals/${proposalId}/accept`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        toast({
          title: '🎉 Designer Hired!',
          description: 'Redirecting to payment...',
        });
        setSelectedProject(null);
        navigate(`/payment/${projectId}`);
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to hire designer', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to hire designer', variant: 'destructive' });
    } finally {
      setAcceptingProposal(null);
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    setRejectingProposal(proposalId);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/proposals/${proposalId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: '' }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Proposal Rejected', description: 'The designer has been notified.' });
        setSelectedProject(prev => prev ? {
          ...prev,
          proposals: prev.proposals.map(p => p._id === proposalId ? { ...p, status: 'rejected' as const } : p),
        } : null);
        await fetchProjects();
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to reject proposal', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to reject proposal', variant: 'destructive' });
    } finally {
      setRejectingProposal(null);
    }
  };

  const formatDate = (ds: string) =>
    new Date(ds).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });

  // ─── Guards ──────────────────────────────────────────────────────────────────
  if (!isLoaded) return (
    <Layout><div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div></Layout>
  );

  if (!userId) return (
    <Layout>
      <div className="container mx-auto py-32 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Please Sign In</h1>
        <Button size="lg" asChild><Link to="/sign-in">Sign In</Link></Button>
      </div>
    </Layout>
  );

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/20 to-transparent">

        {/* ── Page header ── */}
        <div className="border-b bg-background/80 backdrop-blur-md sticky top-16 lg:top-20 z-30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold truncate">
                  Welcome back,{' '}
                  <span className="text-secondary">{user?.firstName || 'Client'}</span>
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block mt-0.5">
                  Manage your projects and find the perfect designer
                </p>
              </div>
              <Link to="/post-project" className="flex-shrink-0">
                <Button size="sm" className="gap-1.5 shadow-sm">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Post Project</span>
                  <span className="sm:hidden">Post</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">

          {/* ── Stats grid ── */}
          {!loading && projects.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 mb-8"
            >
              {[
                { label: 'Total',     value: stats.totalProjects,               icon: Briefcase,    color: 'text-primary',    bg: 'bg-primary/8'    },
                { label: 'Active',    value: stats.activeProjects,              icon: TrendingUp,   color: 'text-blue-600',   bg: 'bg-blue-50'      },
                { label: 'Completed', value: stats.completedProjects,           icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50'  },
                { label: 'Proposals', value: stats.pendingProposals,            icon: Users,        color: 'text-secondary',  bg: 'bg-secondary/8'  },
                { label: 'Budget',    value: formatCurrency(stats.totalBudget), icon: DollarSign,   color: 'text-primary',    bg: 'bg-primary/8', span: true },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className={`bg-background rounded-2xl border border-border/60 p-4 lg:p-5 flex items-center gap-3 ${stat.span ? 'col-span-2 sm:col-span-1' : ''}`}
                >
                  <div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                    <stat.icon className={`w-4 h-4 lg:w-5 lg:h-5 ${stat.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-muted-foreground text-xs truncate">{stat.label}</p>
                    <p className="font-bold text-base lg:text-xl leading-tight truncate">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ── Loading ── */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
              </div>
              <p className="text-muted-foreground text-sm">Loading your projects…</p>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between gap-4">
                {error}
                <Button size="sm" variant="outline" onClick={fetchProjects}>Retry</Button>
              </AlertDescription>
            </Alert>
          )}

          {/* ── Empty state ── */}
          {!loading && projects.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center px-4"
            >
              <div className="w-20 h-20 rounded-3xl bg-primary/8 flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">Start your design journey</h2>
              <p className="text-muted-foreground max-w-md mb-8 text-sm sm:text-base">
                Post your first project and get proposals from Kenya's best interior designers within 48 hours.
              </p>
              <Link to="/post-project">
                <Button size="lg" className="gap-2 shadow-md">
                  <Plus className="w-5 h-5" />
                  Post Your First Project
                </Button>
              </Link>
            </motion.div>
          )}

          {/* ── Projects ── */}
          {!loading && projects.length > 0 && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 w-full sm:w-auto">
                <TabsTrigger value="all" className="flex-1 sm:flex-none">
                  All <span className="ml-1.5 text-xs opacity-60">({projects.length})</span>
                </TabsTrigger>
                <TabsTrigger value="active" className="flex-1 sm:flex-none">
                  Active <span className="ml-1.5 text-xs opacity-60">({stats.activeProjects})</span>
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex-1 sm:flex-none">
                  Done <span className="ml-1.5 text-xs opacity-60">({stats.completedProjects})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {filteredProjects.map(project => {
                    const pendingCount = project.proposals?.filter(p => p.status === 'pending').length ?? 0;
                    const unread = unreadCounts[project._id] ?? 0;

                    return (
                      <motion.div key={project._id} variants={itemVariants}>
                        <Card className="overflow-hidden border border-border/60 hover:border-border transition-colors hover:shadow-md">
                          <div className="flex flex-col sm:flex-row">

                            {/* ── Photo ── */}
                            <div className="sm:w-44 lg:w-56 h-48 sm:h-auto relative flex-shrink-0">
                              {project.photos?.[0] ? (
                                <img
                                  src={project.photos[0]}
                                  alt={project.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  <FolderOpen className="w-10 h-10 text-muted-foreground/40" />
                                </div>
                              )}
                              <div className="absolute top-3 left-3 sm:hidden">
                                <StatusBadge status={project.status} />
                              </div>
                            </div>

                            {/* ── Content ── */}
                            <div className="flex-1 p-4 sm:p-5 lg:p-6 flex flex-col justify-between gap-4 min-w-0">
                              {/* Title row */}
                              <div>
                                <div className="flex items-start justify-between gap-3 mb-1">
                                  <h3 className="font-display font-semibold text-base sm:text-lg lg:text-xl leading-snug">
                                    {project.title}
                                  </h3>
                                  <div className="hidden sm:block flex-shrink-0">
                                    <StatusBadge status={project.status} />
                                  </div>
                                </div>
                                <p className="text-muted-foreground text-sm line-clamp-2">
                                  {project.description}
                                </p>
                              </div>

                              {/* Meta row */}
                              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{project.location}</span>
                                <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{formatCurrency(project.budget)}</span>
                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{project.timeline}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDate(project.createdAt)}</span>
                              </div>

                              {/* Styles */}
                              {project.styles?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {project.styles.map(s => (
                                    <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-medium">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Hired designer bar */}
                              {project.designer && project.status !== 'open' && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80">
                                  <Avatar className="w-9 h-9 ring-2 ring-emerald-200 flex-shrink-0">
                                    <AvatarImage src={project.designer.avatar} />
                                    <AvatarFallback className="bg-emerald-100 text-emerald-800 text-sm font-bold">
                                      {project.designer.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider leading-none mb-0.5">
                                      {project.status === 'completed' ? 'Designer' : 'Hired'}
                                    </p>
                                    <p className="font-semibold text-emerald-900 text-sm truncate">{project.designer.name}</p>
                                  </div>
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto flex-shrink-0" />
                                </div>
                              )}

                              {/* Payment pending banner */}
                              {project.status === 'payment_pending' && (
                                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                                  <p className="text-sm text-amber-800 font-medium">
                                    💳 Payment required to start the project
                                  </p>
                                  <Button
                                    size="sm"
                                    className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white h-8 px-3 text-xs"
                                    onClick={() => navigate(`/payment/${project._id}`)}
                                  >
                                    Pay Now
                                  </Button>
                                </div>
                              )}

                              {/* Action row */}
                              <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div className="text-xs text-muted-foreground">
                                  {project.status === 'open' && pendingCount > 0 && (
                                    <span className="flex items-center gap-1.5 text-secondary font-medium">
                                      <Users className="w-3.5 h-3.5" />
                                      {pendingCount} proposal{pendingCount !== 1 ? 's' : ''} waiting
                                    </span>
                                  )}
                                  {project.status === 'open' && pendingCount === 0 && (
                                    <span className="flex items-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5" />
                                      Awaiting proposals
                                    </span>
                                  )}
                                  {project.status === 'payment_pending' && (
                                    <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                                      <Clock className="w-3.5 h-3.5" />
                                      Awaiting Payment
                                    </span>
                                  )}
                                  {project.status === 'in_progress' && (
                                    <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                                      <Clock className="w-3.5 h-3.5" />
                                      In Progress
                                    </span>
                                  )}
                                  {project.status === 'completed' && (
                                    <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Completed
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <SignedIn>
                                    <Button variant="outline" size="sm" asChild className="relative h-8 px-3 text-xs gap-1.5">
                                      <Link to={`/projects/${project._id}`}>
                                        {unread > 0 && (
                                          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                            {unread > 99 ? '99+' : unread}
                                          </span>
                                        )}
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        Details
                                      </Link>
                                    </Button>
                                  </SignedIn>

                                  {project.status === 'open' && pendingCount > 0 && (
                                    <Button
                                      size="sm"
                                      className="h-8 px-3 text-xs gap-1.5"
                                      onClick={() => setSelectedProject(project)}
                                    >
                                      <Users className="w-3.5 h-3.5" />
                                      Proposals ({pendingCount})
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* ── Proposals Modal ── */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedProject(null); }}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              // FIX: increased max-h and ensured flex column fills correctly
              className="bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-2xl h-[95vh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal header — fixed, never scrolls */}
              <div className="flex items-center justify-between p-5 border-b flex-shrink-0">
                <div className="min-w-0 flex-1 pr-4">
                  <h2 className="font-display text-lg font-bold">Proposals</h2>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    "{selectedProject.title}"
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal body — this is the only scrollable region */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">
                {!selectedProject.proposals?.length ? (
                  <div className="text-center py-16">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <Users className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <p className="font-semibold text-lg">No proposals yet</p>
                    <p className="text-muted-foreground text-sm mt-1">Designers will send proposals soon!</p>
                  </div>
                ) : (
                  selectedProject.proposals.map(proposal => (
                    <div
                      key={proposal._id}
                      className={`rounded-2xl border p-4 sm:p-5 transition-opacity ${
                        proposal.status === 'rejected' ? 'opacity-40' : 'border-border/60 bg-background'
                      }`}
                    >
                      {/* Designer row */}
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarImage src={proposal.designer?.avatar} />
                          <AvatarFallback className="text-base font-bold">
                            {proposal.designer?.name?.charAt(0).toUpperCase() ?? '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{proposal.designer?.name ?? 'Unknown'}</p>
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border ${
                            proposal.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            proposal.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                          </span>
                        </div>
                        <div className="hidden sm:flex items-center gap-4 text-sm text-right flex-shrink-0">
                          <div>
                            <p className="text-xs text-muted-foreground">Price</p>
                            <p className="font-bold">KSh {proposal.price.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Timeline</p>
                            <p className="font-bold">{proposal.timeline}</p>
                          </div>
                        </div>
                      </div>

                      {/* Price + timeline — mobile */}
                      <div className="sm:hidden grid grid-cols-2 gap-3 mb-3 p-3 rounded-xl bg-muted/40">
                        <div>
                          <p className="text-xs text-muted-foreground">Price</p>
                          <p className="font-bold text-sm">KSh {proposal.price.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Timeline</p>
                          <p className="font-bold text-sm">{proposal.timeline}</p>
                        </div>
                      </div>

                      {/* FIX: removed line-clamp-3 so the full message is always visible */}
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 whitespace-pre-wrap">
                        {proposal.message}
                      </p>

                      {/* Action buttons */}
                      {proposal.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 gap-1.5 h-9"
                            onClick={() => handleAcceptProposal(proposal._id, selectedProject._id)}
                            disabled={!!acceptingProposal}
                          >
                            {acceptingProposal === proposal._id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <><Check className="w-4 h-4" />Hire Designer</>
                            }
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-4 text-destructive border-destructive/30 hover:bg-destructive/5"
                            onClick={() => handleRejectProposal(proposal._id)}
                            disabled={!!rejectingProposal}
                          >
                            {rejectingProposal === proposal._id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : 'Decline'
                            }
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}