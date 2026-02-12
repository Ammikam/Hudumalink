// src/pages/ClientDashboard.tsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SignedIn } from '@clerk/clerk-react';
import {
  Loader2, Plus, FolderOpen, Clock, CheckCircle2,
  Users, DollarSign, MapPin, Calendar, X, Check, AlertCircle,
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
  status: 'open' | 'in_progress' | 'completed';
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

export default function ClientDashboard() {
  const { userId, getToken, isLoaded } = useAuth();
  const { user } = useUser();
  const { toast } = useToast();

  const [projects, setProjects]               = useState<Project[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState('');
  const [activeTab, setActiveTab]             = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [acceptingProposal, setAcceptingProposal] = useState<string | null>(null);
  const [rejectingProposal, setRejectingProposal] = useState<string | null>(null);

  // ─── Load projects + proposals ──────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError('');

    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication failed');

      const rawProjects = await api.getUserProjects(token);

      // Fetch proposals for each project in parallel
      const withProposals = await Promise.all(
        rawProjects.map(async (proj: any) => {
          try {
            const res = await fetch(
              `http://localhost:5000/api/proposals/project/${proj._id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            return { ...proj, proposals: data.success ? data.proposals : [] };
          } catch {
            return { ...proj, proposals: [] };
          }
        })
      );

      setProjects(withProposals);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [userId, getToken]);

  useEffect(() => {
    if (isLoaded && userId) fetchProjects();
  }, [isLoaded, userId, fetchProjects]);

  // ─── Stats ──────────────────────────────────────────────────────────────────
  const stats: DashboardStats = useMemo(() => ({
    totalProjects:    projects.length,
    activeProjects:   projects.filter(p => p.status === 'open' || p.status === 'in_progress').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalBudget:      projects.reduce((s, p) => s + p.budget, 0),
    pendingProposals: projects.reduce(
      (s, p) => s + (p.proposals?.filter(pr => pr.status === 'pending').length ?? 0), 0
    ),
  }), [projects]);

  const filteredProjects = useMemo(() => projects.filter(p => {
    if (activeTab === 'active')    return p.status === 'open' || p.status === 'in_progress';
    if (activeTab === 'completed') return p.status === 'completed';
    return true;
  }), [projects, activeTab]);

  // ─── Accept proposal ────────────────────────────────────────────────────────
  const handleAcceptProposal = async (proposalId: string) => {
    setAcceptingProposal(proposalId);
    try {
      const token = await getToken();
      const res = await fetch(
        `http://localhost:5000/api/proposals/${proposalId}/accept`,
        { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      if (res.ok) {
        toast({ title: '🎉 Designer Hired!', description: 'Other proposals have been rejected automatically.' });
        setSelectedProject(null);
        // ✅ Refresh data without full page reload
        await fetchProjects();
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to hire designer', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to hire designer', variant: 'destructive' });
    } finally {
      setAcceptingProposal(null);
    }
  };

  // ─── Reject proposal ────────────────────────────────────────────────────────
  const handleRejectProposal = async (proposalId: string) => {
    setRejectingProposal(proposalId);
    try {
      const token = await getToken();
      const res = await fetch(
        `http://localhost:5000/api/proposals/${proposalId}/reject`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ reason: '' }),
        }
      );
      const data = await res.json();

      if (res.ok) {
        toast({ title: 'Proposal Rejected', description: 'The designer has been notified.' });
        // Update modal state locally — no full reload needed
        setSelectedProject(prev => {
          if (!prev) return null;
          return {
            ...prev,
            proposals: prev.proposals.map(p =>
              p._id === proposalId ? { ...p, status: 'rejected' as const } : p
            ),
          };
        });
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

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    const map = {
      open:        { label: 'Open',        className: 'bg-green-100 text-green-800' },
      in_progress: { label: 'In Progress', className: 'bg-blue-100  text-blue-800'  },
      completed:   { label: 'Completed',   className: 'bg-gray-100  text-gray-800'  },
    };
    const v = map[status as keyof typeof map] ?? map.open;
    return <Badge className={v.className}>{v.label}</Badge>;
  };

  const formatDate = (ds: string) =>
    new Date(ds).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });

  // ─── Guards ─────────────────────────────────────────────────────────────────
  if (!isLoaded) {
    return <Layout><div className="container mx-auto py-32 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div></Layout>;
  }

  if (!userId) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Please Sign In</h1>
          <Button size="lg" asChild><Link to="/sign-in">Sign In</Link></Button>
        </div>
      </Layout>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-transparent">
        <div className="container mx-auto px-4 lg:px-8 py-12">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="font-display text-4xl lg:text-5xl font-bold mb-2">
                  Welcome back, {user?.firstName || 'Client'}!
                </h1>
                <p className="text-lg text-muted-foreground">
                  Manage your projects and hire the perfect designer
                </p>
              </div>
              <Button size="lg" className="btn-primary shadow-soft" asChild>
                <Link to="/post-project"><Plus className="w-5 h-5 mr-2" />Post New Project</Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          {!loading && projects.length > 0 && (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
              {[
                { label: 'Total Projects',   value: stats.totalProjects,             icon: FolderOpen   },
                { label: 'Active',           value: stats.activeProjects,            icon: Clock        },
                { label: 'Completed',        value: stats.completedProjects,         icon: CheckCircle2 },
                { label: 'Proposals',        value: stats.pendingProposals,          icon: Users        },
                { label: 'Total Budget',     value: formatCurrency(stats.totalBudget), icon: DollarSign },
              ].map((stat, i) => (
                <Card key={i} className="card-premium p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </motion.div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-muted-foreground">Loading your projects...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                {error}
                <Button size="sm" variant="outline" onClick={fetchProjects}>Retry</Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Empty */}
          {!loading && projects.length === 0 && (
            <Card className="p-16 text-center">
              <FolderOpen className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
              <h2 className="text-3xl font-bold mb-4">No projects yet</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Start your design journey by posting your first project
              </p>
              <Button size="lg" asChild>
                <Link to="/post-project"><Plus className="w-5 h-5 mr-2" />Post Your First Project</Link>
              </Button>
            </Card>
          )}

          {/* Projects List */}
          {!loading && projects.length > 0 && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8">
                <TabsTrigger value="all">All ({projects.length})</TabsTrigger>
                <TabsTrigger value="active">Active ({stats.activeProjects})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({stats.completedProjects})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-6">
                {filteredProjects.map(project => {
                  const pendingCount = project.proposals?.filter(p => p.status === 'pending').length ?? 0;

                  return (
                    <Card key={project._id} className="overflow-hidden">
                      <div className="flex flex-col lg:flex-row">

                        {/* Project photo */}
                        <div className="lg:w-80 h-64 lg:h-auto relative">
                          {project.photos?.[0] ? (
                            <img src={project.photos[0]} alt={project.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <FolderOpen className="w-16 h-16 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Project details */}
                        <div className="flex-1 p-6 lg:p-8">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-bold">{project.title}</h3>
                                {getStatusBadge(project.status)}
                              </div>
                              <p className="text-muted-foreground line-clamp-2">{project.description}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="flex items-center gap-2 text-sm"><MapPin   className="w-4 h-4" />{project.location}</div>
                            <div className="flex items-center gap-2 text-sm"><DollarSign className="w-4 h-4" />{formatCurrency(project.budget)}</div>
                            <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4" />{project.timeline}</div>
                            <div className="flex items-center gap-2 text-sm"><Clock    className="w-4 h-4" />{formatDate(project.createdAt)}</div>
                          </div>

                          {project.styles?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                              {project.styles.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                            </div>
                          )}

                          {/* ✅ Hired designer — now shows because designer is populated */}
                          {project.designer && project.status !== 'open' && (
                            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200 flex items-center gap-4">
                              <Avatar className="w-14 h-14 ring-2 ring-green-200">
                                <AvatarImage src={project.designer.avatar} />
                                <AvatarFallback className="bg-green-100 text-green-800 text-lg font-bold">
                                  {project.designer.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">
                                  {project.status === 'completed' ? 'Designer' : 'Hired Designer'}
                                </p>
                                <p className="text-lg font-bold text-green-900">{project.designer.name}</p>
                                <p className="text-sm text-green-700">
                                  {project.status === 'completed' ? 'Project completed ✓' : 'Project in progress'}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="text-sm text-muted-foreground">
                              {project.status === 'open' && (
                                <span className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  {pendingCount} pending proposal{pendingCount !== 1 ? 's' : ''}
                                </span>
                              )}
                              {project.status === 'in_progress' && (
                                <span className="flex items-center gap-2 text-blue-600 font-medium">
                                  <Clock className="w-4 h-4" />In Progress
                                </span>
                              )}
                              {project.status === 'completed' && (
                                <span className="flex items-center gap-2 text-gray-600 font-medium">
                                  <CheckCircle2 className="w-4 h-4" />Completed
                                </span>
                              )}
                            </div>

                            <div className="flex gap-3">
                              <SignedIn>
                                <Button variant="outline" asChild>
                                  <Link to={`/projects/${project._id}`}>View Details</Link>
                                </Button>
                              </SignedIn>

                              {project.status === 'open' && pendingCount > 0 && (
                                <Button onClick={() => setSelectedProject(project)}>
                                  View Proposals ({pendingCount})
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* ─── Proposals Modal ──────────────────────────────────────────────────── */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">

            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center rounded-t-2xl z-10">
              <div>
                <h2 className="text-2xl font-bold">Proposals</h2>
                <p className="text-muted-foreground text-sm mt-1">"{selectedProject.title}"</p>
              </div>
              <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              {!selectedProject.proposals?.length ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-xl">No proposals yet</p>
                  <p className="text-muted-foreground mt-2">Designers will send proposals soon!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedProject.proposals.map(proposal => (
                    <Card key={proposal._id} className={`p-6 transition-opacity ${
                      proposal.status === 'rejected' ? 'opacity-50' : ''
                    }`}>
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                        <div className="flex-1">

                          {/* Designer info */}
                          <div className="flex items-center gap-4 mb-4">
                            <Avatar className="w-14 h-14">
                              <AvatarImage src={proposal.designer?.avatar} />
                              <AvatarFallback className="text-xl font-bold">
                                {proposal.designer?.name?.charAt(0).toUpperCase() ?? '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="text-xl font-bold">{proposal.designer?.name ?? 'Unknown Designer'}</h4>
                              <Badge className={
                                proposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                proposal.status === 'rejected' ? 'bg-red-100   text-red-800'   :
                                'bg-yellow-100 text-yellow-800'
                              }>
                                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4 whitespace-pre-wrap">{proposal.message}</p>

                          <div className="grid grid-cols-2 gap-4 text-sm bg-muted/50 rounded-lg p-4">
                            <div>
                              <p className="text-muted-foreground">Proposed Price</p>
                              <p className="font-bold text-lg">KSh {proposal.price.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Timeline</p>
                              <p className="font-bold text-lg">{proposal.timeline}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons — only for pending proposals */}
                        {proposal.status === 'pending' && (
                          <div className="flex flex-col gap-3 min-w-[140px]">
                            <Button
                              size="lg"
                              onClick={() => handleAcceptProposal(proposal._id)}
                              disabled={!!acceptingProposal}
                              className="w-full"
                            >
                              {acceptingProposal === proposal._id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <><Check className="w-5 h-5 mr-2" />Hire</>
                              )}
                            </Button>
                            <Button
                              size="lg"
                              variant="destructive"
                              onClick={() => handleRejectProposal(proposal._id)}
                              disabled={!!rejectingProposal}
                              className="w-full"
                            >
                              {rejectingProposal === proposal._id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : 'Reject'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}