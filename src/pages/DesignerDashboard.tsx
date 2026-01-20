// src/pages/DesignerDashboard.tsx
import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useRoles } from '@/contexts/RoleContext';
import { Link } from 'react-router-dom';
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
  MapPin,
  Calendar,
} from 'lucide-react';

import { Layout } from '@/components/Layout/Layout';
import DesignerApplicationForm from '@/components/designers/DesignerApplicationForm';
import { formatCurrency } from '@/data/MockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs } from '@radix-ui/react-tabs';
import { TabsList } from '@radix-ui/react-tabs';
import { TabsTrigger } from '@radix-ui/react-tabs';
import { TabsContent } from '@radix-ui/react-tabs';
import { Badge } from '@/components/ui/badge';

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

export default function DesignerDashboard() {
  const { userId, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isDesigner, designerProfile, loading: rolesLoading } = useRoles();

  const [invites, setInvites] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const isLoaded = isAuthLoaded && isUserLoaded && !rolesLoading;

  // Fetch invites only if approved designer
  useEffect(() => {
    if (!isLoaded) return;

    // If not designer at all → no need to fetch
    if (!isDesigner) {
      setLoading(false);
      return;
    }

    // If designer but not approved → don't fetch invites
    if (designerProfile?.status !== 'approved') {
      setLoading(false);
      return;
    }

    const fetchInvites = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/projects');
        const data = await res.json();

        if (data.success) {
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
  }, [isLoaded, isDesigner, designerProfile?.status, userId]);

  // Loading state
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

  // 1. Not a designer at all → show application form
  if (!isDesigner) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <DesignerApplicationForm />
        </div>
      </Layout>
    );
  }

  // 2. Designer but pending approval → show waiting message
  if (designerProfile?.status === 'pending') {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <div className="bg-white rounded-xl shadow-sm p-16 max-w-2xl mx-auto">
            <Loader2 className="w-20 h-20 animate-spin mx-auto text-indigo-600 mb-8" />
            <h2 className="text-3xl font-bold mb-4">Application Under Review</h2>
            <p className="text-lg text-gray-600 mb-6">
              Your designer application has been submitted and is currently being reviewed by our team.
            </p>
            <p className="text-gray-500">
              You will receive an email notification within 3-5 business days once approved.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // 3. Approved designer → full dashboard
  if (designerProfile?.status === 'approved') {
    const stats = {
      activeInvites: invites.length,
      rating: designerProfile?.rating || 4.8,
      portfolioItems: designerProfile?.portfolioImages?.length || 0,
      totalEarnings: 0,
    };

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
                <TabsTrigger value="invites">
                  Project Invites ({invites.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="invites" className="space-y-6 mt-8">
                {invites.length === 0 ? (
                  <Card className="p-16 text-center">
                    <Briefcase className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
                    <h3 className="font-display text-3xl font-bold mb-4">No Invites Yet</h3>
                    <p className="text-lg text-muted-foreground mb-8">
                      Your profile is live! Clients will start inviting you soon.
                    </p>
                    <Button size="lg" asChild>
                      <Link to={`/designer/${userId}`}>
                        <Eye className="w-5 h-5 mr-2" />
                        View Your Public Profile
                      </Link>
                    </Button>
                  </Card>
                ) : (
                  <div className="grid gap-6">
                    {invites.map((project) => (
                      <Card key={project._id} className="card-premium p-8">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="font-display text-2xl font-bold mb-2">
                              {project.title}
                            </h3>
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

  // Fallback (should not reach)
  return (
    <Layout>
      <div className="container mx-auto py-32 text-center">
        <p className="text-lg">Loading your dashboard...</p>
      </div>
    </Layout>
  );
}