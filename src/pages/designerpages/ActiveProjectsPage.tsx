// src/pages/designerpages/ActiveProjectsPage.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

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
  };
}

export default function ActiveProjectsPage() {
  const { getToken } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveProjects = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const res = await fetch('http://localhost:5000/api/projects/my-active', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success) {
          setProjects(data.projects || []);
        }
      } catch (error) {
        console.error('Error fetching active projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveProjects();
  }, [getToken]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="mt-4">Loading your active projects...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-8">Active Projects</h1>

        {projects.length === 0 ? (
          <Card className="p-16 text-center">
            <p className="text-2xl mb-4">No active projects yet</p>
            <p className="text-muted-foreground">
              When a client hires you, your projects will appear here with full chat access.
            </p>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {project.photos.length > 0 && (
                  <img
                    src={project.photos[0]}
                    alt={project.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  <div className="space-y-2 mb-6 text-sm">
                    <p>
                      <strong>Client:</strong> {project.client.name}
                    </p>
                    <p>
                      <strong>Budget:</strong> KSh {project.budget.toLocaleString()}
                    </p>
                    <p>
                      <strong>Timeline:</strong> {project.timeline}
                    </p>
                  </div>

                  <Badge className="mb-4 bg-blue-100 text-blue-800">In Progress</Badge>

                  {/* CORRECT LINK — THIS WAS THE BUG */}
                  <Button asChild className="w-full">
                    <Link to={`/designer/projects/${project._id}`}>
                      Open Chat & Details
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}