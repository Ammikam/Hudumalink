import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useRoles } from '@/contexts/Rolecontext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Loader2,
  Plus,
  Briefcase,
  DollarSign,
  Star,
  MessageSquare,
  Eye,
  FileText,
  Upload,
  MapPin,          
  Calendar,        
} from 'lucide-react';

import { Layout } from '@/components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/data/MockData';

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
  invitedDesigner?: string;
}

interface PortfolioItem {
  _id: string;
  title: string;
  beforeImage: string;
  afterImage: string;
  style: string;
}

export default function DesignerDashboard() {
  const navigate = useNavigate();

  const { userId, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isDesigner } = useRoles();

  const [invites, setInvites] = useState<Project[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  const isLoaded = isAuthLoaded && isUserLoaded;

  useEffect(() => {
    if (!isLoaded) return;

    if (!isDesigner) {
      navigate('/become-designer');
      return;
    }

    const fetchInvites = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/projects');
        const data = await res.json();

        if (data.success) {
          // Filter invites where this designer is invited
          const myInvites = data.projects.filter(
            (p: Project) => p.invitedDesigner === userId
          );
          setInvites(myInvites);
        }
      } catch (error) {
        console.error('Failed to fetch invites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvites();
  }, [isLoaded, isDesigner, userId, navigate]);

  if (!isLoaded || loading) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (!isDesigner) return null; // Redirect handled

  const stats = {
    activeInvites: invites.length,
    rating: 4.8,
    portfolioItems: portfolio.length,
    totalEarnings: 0,
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-transparent">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="font-display text-4xl lg:text-5xl font-bold mb-2">
                  Welcome back, {user?.firstName || 'Designer'}! 👋
                </h1>
                <p className="text-lg text-muted-foreground">
                  Manage your profile and respond to client invites
                </p>
              </div>
              <div className="flex gap-4">
                <Button size="lg" variant="outline" asChild>
                  <Link to="/designer/portfolio/add">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Portfolio Item
                  </Link>
                </Button>
                <Button size="lg" className="btn-primary shadow-soft" asChild>
                  <Link to={`/designer/${userId}`}>
                    <Eye className="w-5 h-5 mr-2" />
                    View Public Profile
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="card-premium p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Invites</p>
                  <p className="text-3xl font-bold">{stats.activeInvites}</p>
                </div>
              </div>
            </Card>

            <Card className="card-premium p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                  <Star className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-3xl font-bold">{stats.rating.toFixed(1)}</p>
                </div>
              </div>
            </Card>

            <Card className="card-premium p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Portfolio Items</p>
                  <p className="text-3xl font-bold">{stats.portfolioItems}</p>
                </div>
              </div>
            </Card>

            <Card className="card-premium p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-3xl font-bold">{formatCurrency(stats.totalEarnings)}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Invites Tab */}
          <Tabs defaultValue="invites">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="invites">Project Invites ({invites.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="invites" className="space-y-6 mt-8">
              {invites.length === 0 ? (
                <Card className="p-16 text-center">
                  <Briefcase className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
                  <h3 className="font-display text-3xl font-bold mb-4">
                    No Invites Yet
                  </h3>
                  <p className="text-lg text-muted-foreground mb-8">
                    Complete your profile to start receiving project invites
                  </p>
                  <Button size="lg" asChild>
                    <Link to="/designer/portfolio/add">
                      <Plus className="w-5 h-5 mr-2" />
                      Build Your Portfolio
                    </Link>
                  </Button>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {invites.map((project) => (
                    <Card key={project._id} className="card-premium p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="font-display text-2xl font-bold mb-2">{project.title}</h3>
                          <p className="text-muted-foreground mb-4">{project.description}</p>
                          <div className="flex flex-wrap gap-6 text-sm">
                            <span className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {project.location}
                            </span>
                            <span className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              {formatCurrency(project.budget)}
                            </span>
                            <span className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {project.timeline}
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-lg px-4 py-2">
                          New
                        </Badge>
                      </div>
                      <div className="flex gap-4">
                        <Button size="lg" variant="outline">
                          <MessageSquare className="w-5 h-5 mr-2" />
                          Message Client
                        </Button>
                        <Button size="lg">
                          <FileText className="w-5 h-5 mr-2" />
                          Send Proposal
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}