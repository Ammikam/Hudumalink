// src/pages/ClientDashboard.tsx
import { useEffect, useState, useMemo } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Loader2,
  Plus,
  FolderOpen,
  Clock,
  CheckCircle2,
  Users,
  DollarSign,
  MapPin,
  Calendar,
  X,
  Check,
} from 'lucide-react';

import { Layout } from '@/components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  totalSpent: number;
  proposalsReceived: number;
}

export default function ClientDashboard() {
  const { userId, getToken, isLoaded } = useAuth();
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [acceptingProposal, setAcceptingProposal] = useState<string | null>(null);
  const [rejectingProposal, setRejectingProposal] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const fetchProjects = async () => {
      setLoading(true);
      setError('');

      try {
        const token = await getToken();
        if (!token) throw new Error('Authentication failed');

        const rawProjects = await api.getUserProjects(token);
        console.log('Raw projects:', rawProjects); // DEBUG

        // Fetch proposals for each project
        const projectsWithProposals = await Promise.all(
          rawProjects.map(async (proj: any) => {
            try {
              const res = await fetch(`http://localhost:5000/api/proposals/project/${proj._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await res.json();
              console.log(`Proposals for ${proj._id}:`, data); // DEBUG
              return {
                ...proj,
                proposals: data.success ? data.proposals : [],
              };
            } catch (err) {
              console.error(`Error fetching proposals for ${proj._id}:`, err); // DEBUG
              return { ...proj, proposals: [] };
            }
          })
        );

        console.log('Projects with proposals:', projectsWithProposals); // DEBUG
        setProjects(projectsWithProposals);
      } catch (err: any) {
        console.error('Error fetching projects:', err); // DEBUG
        setError(err.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userId, isLoaded, getToken]);

  const stats: DashboardStats = useMemo(() => ({
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'open' || p.status === 'in_progress').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalSpent: projects.reduce((sum, p) => sum + p.budget, 0),
    proposalsReceived: projects.reduce((sum, p) => 
      sum + p.proposals.filter(prop => prop.status === 'pending').length, 
      0
    ),
  }), [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (activeTab === 'all') return true;
      if (activeTab === 'active') return p.status === 'open' || p.status === 'in_progress';
      if (activeTab === 'completed') return p.status === 'completed';
      return true;
    });
  }, [projects, activeTab]);

  const getStatusBadge = (status: string) => {
    const variants = {
      open: { label: 'Open', className: 'bg-green-100 text-green-800' },
      in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Completed', className: 'bg-gray-100 text-gray-800' },
    };
    const variant = variants[status as keyof typeof variants] || variants.open;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const handleAcceptProposal = async (proposalId: string) => {
    if (!selectedProject) return;

    console.log('Accepting proposal:', proposalId); // DEBUG

    setAcceptingProposal(proposalId);
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`http://localhost:5000/api/proposals/${proposalId}/accept`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log('Accept proposal response:', data); // DEBUG

      if (res.ok) {
        alert('Designer hired! Other proposals rejected automatically.');
        window.location.reload(); 
      } else {
        alert(data.error || 'Failed to hire designer');
      }
    } catch (error) {
      console.error('Error accepting proposal:', error); // DEBUG
      alert('Failed to hire designer');
    } finally {
      setAcceptingProposal(null);
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    const reason = prompt('Reason for rejection (optional):');
    
    console.log('Rejecting proposal:', proposalId, 'Reason:', reason); // DEBUG

    setRejectingProposal(proposalId);
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`http://localhost:5000/api/proposals/${proposalId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();
      console.log('Reject proposal response:', data); // DEBUG

      if (res.ok) {
        alert('Proposal rejected');
        window.location.reload();
      } else {
        alert(data.error || 'Failed to reject proposal');
      }
    } catch (error) {
      console.error('Error rejecting proposal:', error); // DEBUG
      alert('Failed to reject proposal');
    } finally {
      setRejectingProposal(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isLoaded) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        </div>
      </Layout>
    );
  }

  if (!userId) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-8">
            You need to be signed in to view your dashboard.
          </p>
          <Button size="lg">Sign In</Button>
        </div>
      </Layout>
    );
  }

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
                <Link to="/post-project">
                  <Plus className="w-5 h-5 mr-2" />
                  Post New Project
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          {!loading && projects.length > 0 && (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
              {[
                { label: 'Total Projects', value: stats.totalProjects, icon: FolderOpen },
                { label: 'Active', value: stats.activeProjects, icon: Clock },
                { label: 'Completed', value: stats.completedProjects, icon: CheckCircle2 },
                { label: 'Proposals', value: stats.proposalsReceived, icon: Users },
                { label: 'Total Budget', value: formatCurrency(stats.totalSpent), icon: DollarSign },
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

          {/* Loading / Error / Empty */}
          {loading && (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
              <p className="mt-4">Loading your projects...</p>
            </div>
          )}

          {error && (
            <Card className="p-8 text-center text-destructive">
              <p>{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </Card>
          )}

          {!loading && projects.length === 0 && (
            <Card className="p-16 text-center">
              <FolderOpen className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
              <h2 className="text-3xl font-bold mb-4">No projects yet</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Start your design journey by posting your first project
              </p>
              <Button size="lg" asChild>
                <Link to="/post-project">
                  <Plus className="w-5 h-5 mr-2" />
                  Post Your First Project
                </Link>
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
                {filteredProjects.map((project) => (
                  <Card key={project._id} className="overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                      {/* Project Image */}
                      <div className="lg:w-80 h-64 lg:h-auto relative">
                        {project.photos && project.photos.length > 0 && project.photos[0] ? (
                          <img src={project.photos[0]} alt={project.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <FolderOpen className="w-16 h-16 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Project Details */}
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
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4" />
                            {project.location}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4" />
                            {formatCurrency(project.budget)}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4" />
                            {project.timeline}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4" />
                            {formatDate(project.createdAt)}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {project.styles && project.styles.length > 0 && project.styles.map((style) => (
                            <Badge key={style} variant="secondary">
                              {style}
                            </Badge>
                          ))}
                        </div>

                        {/* HIRED DESIGNER SECTION */}
                        {project.designer && project.designer.name && (
                          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-dashed overflow-hidden">
                                {project.designer.avatar ? (
                                  <img src={project.designer.avatar} alt={project.designer.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                                    {project.designer.name?.charAt(0)?.toUpperCase() || 'D'}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm text-green-700 font-medium">Hired Designer</p>
                                <p className="text-lg font-bold text-green-900">{project.designer.name}</p>
                                <p className="text-sm text-green-800">Project is now in progress</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6 text-sm">
                            {project.status === 'open' ? (
                              <span className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                {project.proposals?.filter(p => p.status === 'pending').length || 0} Pending Proposal{project.proposals?.filter(p => p.status === 'pending').length !== 1 ? 's' : ''}
                              </span>
                            ) : project.status === 'in_progress' ? (
                              <span className="flex items-center gap-2 text-blue-600 font-medium">
                                <CheckCircle2 className="w-4 h-4" />
                                Designer Hired
                              </span>
                            ) : (
                              <span className="flex items-center gap-2 text-gray-600 font-medium">
                                <CheckCircle2 className="w-4 h-4" />
                                Completed
                              </span>
                            )}
                          </div>
                          <div className="flex gap-3">
                            <Button variant="outline" asChild>
                              <Link to={`/projects/${project._id}`}>View Details</Link>
                            </Button>
                            {project.status === 'open' && project.proposals?.some(p => p.status === 'pending') && (
                              <Button onClick={() => {
                                console.log('Opening proposals modal for:', project); // DEBUG
                                setSelectedProject(project);
                              }}>
                                View Proposals ({project.proposals.filter(p => p.status === 'pending').length})
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* View Proposals Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold">
                Proposals for "{selectedProject.title}"
              </h2>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              {!selectedProject.proposals || selectedProject.proposals.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-xl">No proposals yet</p>
                  <p className="text-muted-foreground mt-2">
                    Designers will send proposals soon!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedProject.proposals.map((proposal) => (
                    <Card key={proposal._id} className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-dashed overflow-hidden flex items-center justify-center">
                              {proposal.designer?.avatar ? (
                                <img src={proposal.designer.avatar} alt={proposal.designer.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-2xl font-bold text-gray-500">
                                  {proposal.designer?.name?.charAt(0).toUpperCase() || '?'}
                                </span>
                              )}
                            </div>
                            <div>
                              <h4 className="text-xl font-bold">{proposal.designer?.name || 'Unknown Designer'}</h4>
                              <Badge className={
                                proposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                proposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }>
                                {proposal.status}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-6 whitespace-pre-wrap">{proposal.message}</p>
                          <div className="grid grid-cols-2 gap-6 text-sm">
                            <div>
                              <strong>Proposed Price:</strong> KSh {proposal.price.toLocaleString()}
                            </div>
                            <div>
                              <strong>Timeline:</strong> {proposal.timeline}
                            </div>
                          </div>
                        </div>

                        {/* Only show action buttons for pending proposals */}
                        {proposal.status === 'pending' && (
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                              variant="destructive"
                              size="lg"
                              onClick={() => handleRejectProposal(proposal._id)}
                              disabled={rejectingProposal === proposal._id}
                            >
                              {rejectingProposal === proposal._id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                'Reject'
                              )}
                            </Button>

                            <Button
                              size="lg"
                              onClick={() => handleAcceptProposal(proposal._id)}
                              disabled={acceptingProposal === proposal._id}
                            >
                              {acceptingProposal === proposal._id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-5 h-5 mr-2" />
                                  Hire Designer
                                </>
                              )}
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