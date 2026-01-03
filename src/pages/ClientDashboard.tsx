import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Layout } from '../components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/data/MockData';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Project {
  _id: string;
  title: string;
  description: string;
  budget: number;
  invitedDesigner?: string;
  status: string;
  createdAt: string;
}

export default function ClientDashboard() {
  const { userId, isLoaded } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          <p className="text-muted-foreground">You need to be signed in to view your dashboard.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <h1 className="font-display text-3xl lg:text-4xl font-bold mb-8">My Dashboard</h1>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <Card className="p-6 text-center text-destructive">
            <p>{error}</p>
          </Card>
        )}

        {!loading && projects.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-xl text-muted-foreground mb-6">No projects yet</p>
            <Button asChild>
              <Link to="/post-project">Post Your First Project</Link>
            </Button>
          </Card>
        )}

        {projects.length > 0 && (
          <div className="space-y-8">
            <h2 className="font-display text-2xl font-bold">Your Projects</h2>
            <div className="grid gap-8">
              {projects.map((project) => (
                <Card key={project._id} className="card-premium p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-display text-2xl font-bold">{project.title}</h3>
                      <p className="text-muted-foreground mt-2">{project.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {project.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-display text-2xl font-bold text-primary">
                        {formatCurrency(project.budget)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-semibold">
                        {new Date(project.createdAt).toLocaleDateString('en-KE')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{project.status}</p>
                    </div>
                    {project.invitedDesigner && (
                      <div>
                        <p className="text-sm text-muted-foreground">Invited Designer</p>
                        <p className="font-medium">ID: {project.invitedDesigner}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex gap-4">
                    <Button className="flex-1">View Details</Button>
                    <Button variant="outline">Message Designer</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}