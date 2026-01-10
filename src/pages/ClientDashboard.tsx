import { useEffect, useState, useMemo } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Loader2, Plus, FolderOpen, Clock, CheckCircle2, Users, DollarSign, 
  MapPin, Calendar, Eye, MessageSquare, ArrowRight
} from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/data/MockData';
import { api } from '@/services/api';

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
  proposals?: any[];
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

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const fetchProjects = async () => {
      setLoading(true);
      setError('');

      try {
        const token = await getToken();
        
        if (!token) {
          setError('Authentication failed. Please sign in again.');
          return;
        }

        const projects = await api.getUserProjects(token);
        setProjects(projects);

      } catch (err: any) {
        console.error('Error fetching projects:', err);
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
    proposalsReceived: projects.reduce((sum, p) => sum + (p.proposals?.length || 0), 0),
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
      open: { label: 'Open', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
      in_progress: { label: 'In Progress', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      completed: { label: 'Completed', className: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
    };
    return variants[status as keyof typeof variants] || variants.open;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
                  Welcome back, {user?.firstName || user?.username || 'Client'}!
                </h1>
                <p className="text-lg text-muted-foreground">
                  Manage your interior design projects and connect with designers
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

          {/* Stats Grid */}
          {!loading && projects.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
              {[
                { label: 'Total Projects', value: stats.totalProjects, icon: FolderOpen, color: 'primary' },
                { label: 'Active', value: stats.activeProjects, icon: Clock, color: 'secondary' },
                { label: 'Completed', value: stats.completedProjects, icon: CheckCircle2, color: 'accent' },
                { label: 'Proposals', value: stats.proposalsReceived, icon: Users, color: 'gold' },
                { label: 'Total Budget', value: formatCurrency(stats.totalSpent), icon: DollarSign, color: 'primary' },
              ].map((stat, i) => (
                <Card key={i} className="card-premium p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-${stat.color}/10 flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}`} />
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
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          )}

          {/* Error */}
          {error && (
            <Card className="p-6 text-center text-destructive">
              <p>{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </Card>
          )}

          {/* Empty State */}
          {!loading && projects.length === 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}>
              <Card className="card-elevated p-16 text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
                  <FolderOpen className="w-12 h-12 text-primary" />
                </div>
                <h2 className="font-display text-3xl font-bold mb-4">Start Your Design Journey</h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Post your first project and connect with Kenya's top interior designers.
                  Get personalized proposals and bring your vision to life!
                </p>
                <Button size="xl" className="btn-primary shadow-soft" asChild>
                  <Link to="/post-project">
                    <Plus className="w-6 h-6 mr-2" />
                    Post Your First Project
                  </Link>
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Projects List */}
          {!loading && projects.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <TabsList>
                    <TabsTrigger value="all">All Projects ({projects.length})</TabsTrigger>
                    <TabsTrigger value="active">Active ({stats.activeProjects})</TabsTrigger>
                    <TabsTrigger value="completed">Completed ({stats.completedProjects})</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value={activeTab} className="space-y-6">
                  {filteredProjects.map((project, index) => (
                    <motion.div key={project._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}>
                      <Card className="card-premium overflow-hidden hover:shadow-strong transition-all">
                        <div className="flex flex-col lg:flex-row">
                          {/* Project Image */}
                          <div className="lg:w-80 h-64 lg:h-auto bg-muted relative overflow-hidden">
                            {project.photos && project.photos.length > 0 ? (
                              <img
                                src={project.photos[0]}
                                alt={project.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                                <FolderOpen className="w-16 h-16 text-muted-foreground" />
                              </div>
                            )}
                            {project.photos && project.photos.length > 1 && (
                              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                                +{project.photos.length - 1} photos
                              </div>
                            )}
                          </div>

                          {/* Project Details */}
                          <div className="flex-1 p-6 lg:p-8">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-display text-2xl font-bold">
                                    {project.title}
                                  </h3>
                                  <Badge className={getStatusBadge(project.status).className}>
                                    {getStatusBadge(project.status).label}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground line-clamp-2 mb-4">
                                  {project.description}
                                </p>
                              </div>
                            </div>

                            {/* Project Meta */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{project.location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="w-4 h-4 text-muted-foreground" />
                                <span className="font-semibold text-primary">
                                  {formatCurrency(project.budget)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>{project.timeline}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>Posted {formatDate(project.createdAt)}</span>
                              </div>
                            </div>

                            {/* Styles */}
                            <div className="flex flex-wrap gap-2 mb-6">
                              {project.styles.map((style, i) => (
                                <Badge key={i} variant="outline" className="bg-muted/50">
                                  {style}
                                </Badge>
                              ))}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4" />
                                  <span>{project.proposals?.length || 0} Proposals</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Eye className="w-4 h-4" />
                                  <span>View Details</span>
                                </div>
                              </div>
                              <Button variant="outline" asChild>
                                <Link to={`/projects/${project._id}`}>
                                  View Project
                                  <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}