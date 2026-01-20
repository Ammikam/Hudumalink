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
  RefreshCw,
  Clock,
} from 'lucide-react';

import { Layout } from '@/components/Layout/Layout';
import DesignerApplicationForm from '@/components/designers/DesignerApplicationForm';
import { formatCurrency } from '@/data/MockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  invitedDesigner?: string;
}

export default function DesignerDashboard() {
  const { userId, isLoaded: isAuthLoaded, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const { 
    isApprovedDesigner, 
    isPendingDesigner, 
    designerProfile, 
    loading: rolesLoading,
    refreshRoles 
  } = useRoles();

  const [invites, setInvites] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isLoaded = isAuthLoaded && !rolesLoading;

  // Debug logs
  useEffect(() => {
    console.log('Dashboard State:', {
      isApprovedDesigner,
      isPendingDesigner,
      designerProfile,
      loading: rolesLoading,
    });
  }, [isApprovedDesigner, isPendingDesigner, designerProfile, rolesLoading]);

  useEffect(() => {
    if (!isLoaded) return;

    // Not a designer at all → show form
    if (!isApprovedDesigner && !isPendingDesigner) {
      setLoading(false);
      return;
    }

    // Designer but pending → show waiting screen
    if (isPendingDesigner) {
      setLoading(false);
      return;
    }

    // Approved designer → fetch invites
    if (isApprovedDesigner) {
      const fetchInvites = async () => {
        try {
          const token = await getToken();
          if (!token) return;

          const projects = await api.getDesignerInvites(token);
          const myInvites = projects.filter((p: Project) => p.invitedDesigner === userId);
          setInvites(myInvites);
        } catch (error) {
          console.error('Failed to fetch invites:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchInvites();
    }
  }, [isLoaded, isApprovedDesigner, isPendingDesigner, userId, getToken]);

  // Manual refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshRoles();
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setRefreshing(false);
    }
  };

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

  // Not designer → application form
  if (!isApprovedDesigner && !isPendingDesigner) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <DesignerApplicationForm />
        </div>
      </Layout>
    );
  }

  // Pending approval
  if (isPendingDesigner) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <div className="bg-white rounded-xl shadow-sm p-16 max-w-2xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Application Under Review</h2>
            <p className="text-lg text-gray-600 mb-6">
              Your designer application is being reviewed by our team.
            </p>
            <p className="text-gray-500 mb-8">
              You'll get an email within 3-5 business days when approved.
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Status
                  </>
                )}
              </Button>
            </div>

            {/* Application Details */}
            {designerProfile && (
              <div className="mt-12 pt-8 border-t border-gray-200 text-left">
                <h3 className="font-bold text-lg mb-4">Your Application</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Pending Review
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Portfolio Items:</span>
                    <span className="font-medium">{designerProfile.portfolioImages?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">References:</span>
                    <span className="font-medium">{designerProfile.references?.length || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // Approved → full dashboard
  const stats = {
    activeInvites: invites.length,
    rating: designerProfile?.rating || 0,
    portfolioItems: designerProfile?.portfolioImages?.length || 0,
    totalEarnings: 0,
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-transparent">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="font-display text-4xl lg:text-5xl font-bold mb-2">
                  Welcome back, {clerkUser?.firstName || 'Designer'}! 👋
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
                  <p className="text-3xl font-bold">
                    {stats.rating > 0 ? stats.rating.toFixed(1) : 'New'}
                  </p>
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

          {/* Invites */}
          <Tabs defaultValue="invites">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="invites">Project Invites ({invites.length})</TabsTrigger>
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