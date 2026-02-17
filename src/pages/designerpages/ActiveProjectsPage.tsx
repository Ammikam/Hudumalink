// src/pages/designerpages/ActiveProjectsPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageSquare, DollarSign, Clock, User, ArrowRight, Briefcase } from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  description: string;
  budget: number;
  timeline: string;
  photos: string[];
  status: string;
  client: {
    name: string;
    avatar?: string;
  };
}

export default function ActiveProjectsPage() {
  const { getToken } = useAuth();
  const [projects, setProjects]         = useState<Project[]>([]);
  const [loading, setLoading]           = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const fetchData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const [projectsRes, unreadRes] = await Promise.all([
        fetch('http://localhost:5000/api/projects/my-active', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://localhost:5000/api/messages/unread-counts', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [projectsData, unreadData] = await Promise.all([
        projectsRes.json(),
        unreadRes.json(),
      ]);

      if (projectsData.success) setProjects(projectsData.projects || []);
      if (unreadData.success)   setUnreadCounts(unreadData.unreadCounts || {});
    } catch (error) {
      console.error('Error fetching active projects:', error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading your active projects...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">Active Projects</h1>
          <p className="text-muted-foreground text-lg">
            {projects.length > 0
              ? `You have ${projects.length} project${projects.length !== 1 ? 's' : ''} in progress`
              : 'Projects you are hired for will appear here'}
          </p>
        </div>

        {projects.length === 0 ? (
          <Card className="p-16 text-center">
            <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-2xl font-bold mb-2">No active projects yet</p>
            <p className="text-muted-foreground mb-6">
              When a client hires you, your projects will appear here.
            </p>
            <Button asChild variant="outline">
              <Link to="/designer/open-projects">Browse Open Projects</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const unread = unreadCounts[project._id] ?? 0;

              return (
                <Card key={project._id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row">

                    {/* Thumbnail */}
                    <div className="sm:w-40 h-40 sm:h-auto flex-shrink-0 bg-muted relative overflow-hidden">
                      {project.photos?.[0] ? (
                        <img
                          src={project.photos[0]}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Briefcase className="w-10 h-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h3 className="text-xl font-bold leading-tight">{project.title}</h3>
                          <Badge className="bg-blue-100 text-blue-800 flex-shrink-0">In Progress</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2">{project.description}</p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Meta */}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {/* Client */}
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={project.client?.avatar} />
                              <AvatarFallback className="text-xs">
                                {project.client?.name?.[0]?.toUpperCase() ?? 'C'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">{project.client?.name}</span>
                          </div>
                          {/* Budget */}
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>KSh {project.budget.toLocaleString()}</span>
                          </div>
                          {/* Timeline */}
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{project.timeline}</span>
                          </div>
                        </div>

                        {/* CTA */}
                        <Button asChild size="sm" className="relative">
                          <Link to={`/designer/projects/${project._id}`}>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Open Chat
                            {unread > 0 && (
                              <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 bg-destructive text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {unread > 99 ? '99+' : unread}
                              </span>
                            )}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}