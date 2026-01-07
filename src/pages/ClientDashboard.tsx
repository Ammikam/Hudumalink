import { useEffect, useState } from 'react';
import { useAuth,useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Loader2,
  Plus,
  FolderOpen,
  Clock,
  CheckCircle2,
  Users,
  MessageSquare,
  DollarSign,
  Eye,
  Trash2,
  Edit,
  FileText,
} from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/data/MockData';
import { cn } from '@/lib/utils';


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
  const { userId, isLoaded } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useUser();

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const fetchProjects = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/projects');
        const data = await res.json();

        if (data.success) {
          // Filter projects where client.clerkId matches current user
          const myProjects = data.projects.filter((p: any) => p.client?.clerkId === userId);
          setProjects(myProjects);
        } else {
          setError('Failed to load projects');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userId, isLoaded]);

  // Calculate stats
  const stats: DashboardStats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'open' || p.status === 'in_progress').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalSpent: projects.reduce((sum, p) => sum + p.budget, 0),
    proposalsReceived: projects.reduce((sum, p) => sum + (p.proposals?.length || 0), 0),
  };

  // Filter projects by tab
  const filteredProjects = projects.filter(p => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return p.status === 'open' || p.status === 'in_progress';
    if (activeTab === 'completed') return p.status === 'completed';
    return true;
  });

  // Loading state
  if (!isLoaded) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        </div>
      </Layout>
    );
  }

  // Not signed in
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12"
            >
              <Card className="card-premium p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Projects</p>
                    <p className="text-3xl font-bold">{stats.totalProjects}</p>
                  </div>
                </div>
              </Card>

              <Card className="card-premium p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-3xl font-bold">{stats.activeProjects}</p>
                  </div>
                </div>
              </Card>

              <Card className="card-premium p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-3xl font-bold">{stats.completedProjects}</p>
                  </div>
                </div>
              </Card>

              <Card className="card-premium p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Proposals</p>
                    <p className="text-3xl font-bold">{stats.proposalsReceived}</p>
                  </div>
                </div>
              </Card>

              <Card className="card-premium p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Budget</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</p>
                  </div>
                </div>
              </Card>
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
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="card-elevated p-16 text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
                  <FolderOpen className="w-12 h-12 text-primary" />
                </div>
                <h2 className="font-display text-3xl font-bold mb-4">
                  Start Your Design Journey
                </h2>
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
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">1. Describe Your Project</h3>
                      <p className="text-sm text-muted-foreground">
                        Tell us about your space and vision
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">2. Receive Proposals</h3>
                      <p className="text-sm text-muted-foreground">
                        Get quotes from qualified designers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">3. Choose & Start</h3>
                      <p className="text-sm text-muted-foreground">
                        Hire your designer and begin
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Projects List */}
          {!loading && projects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <TabsList>
                    <TabsTrigger value="all">
                      All Projects ({projects.length})
                    </TabsTrigger>
                    <TabsTrigger value="active">
                      Active ({stats.activeProjects})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                      Completed ({stats.completedProjects})
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value={activeTab} className="space-y-6">
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="card-premium overflow-hidden hover:shadow-strong transition-all">
                        <div className="flex flex-col lg:flex-row">
                          {/* Project Image */}
                          <div className="lg:w-64 h-48 lg:h-auto bg-muted relative">
                            {project.photos && project.photos.length > 0 ? (
                              <img
                                src={project.photos[0]}
                                alt={project.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FolderOpen className="w-16 h-16 text-muted-foreground" />
                              </div>
                            )}
                            <Badge
                              className={cn(
                                'absolute top-4 left-4',
                                project.status === 'open' && 'bg-secondary',
                                project.status === 'in_progress' && 'bg-primary',
                                project.status === 'completed' && 'bg-accent'
                              )}
                            >
                              {project.status === 'open' && 'Open for Proposals'}
                              {project.status === 'in_progress' && 'In Progress'}
                              {project.status === 'completed' && 'Completed'}
                            </Badge>
                          </div>

                          {/* Project Details */}
                          <div className="flex-1 p-6 lg:p-8">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h3 className="font-display text-2xl font-bold mb-2">
                                  {project.title}
                                </h3>
                                <p className="text-muted-foreground line-clamp-2 mb-4">
                                  {project.description}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {project.styles.map(style => (
                                    <Badge key={style} variant="outline">
                                      {style}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Budget</p>
                                <p className="font-bold text-lg text-primary">
                                  {formatCurrency(project.budget)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Timeline</p>
                                <p className="font-semibold">{project.timeline}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Location</p>
                                <p className="font-semibold">{project.location}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Posted</p>
                                <p className="font-semibold">
                                  {new Date(project.createdAt).toLocaleDateString('en-KE', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </p>
                              </div>
                            </div>

                            {/* Proposals Section */}
                            {project.proposals && project.proposals.length > 0 && (
                              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                  <Users className="w-5 h-5 text-primary" />
                                  <p className="font-semibold">
                                    {project.proposals.length} Proposal
                                    {project.proposals.length !== 1 ? 's' : ''} Received
                                  </p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Designers are interested in your project
                                </p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3">
                              <Button className="flex-1 sm:flex-initial">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                              {project.proposals && project.proposals.length > 0 && (
                                <Button variant="secondary" className="flex-1 sm:flex-initial">
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  View Proposals
                                </Button>
                              )}
                              <Button variant="outline" size="icon">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="icon">
                                <Trash2 className="w-4 h-4" />
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