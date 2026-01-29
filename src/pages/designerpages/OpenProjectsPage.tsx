// src/components/designerpages/OpenProjectsPage.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { MapPin, Calendar, DollarSign, Check } from 'lucide-react';

import { api } from '@/services/api';
import { Layout } from '@/components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProposalModal from '@/components/designers/SendProposalModal';

interface Project {
  _id: string;
  title: string;
  description: string;
  location: string;
  budget: number;
  timeline: string;
  styles: string[];
  photos: string[];
  status: string;
  createdAt: string;
  client: {
    name: string;
  };
}

export default function OpenProjectsPage() {
  const { getToken } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [sentProposalIds, setSentProposalIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        // Fetch ALL projects (not just user projects)
        const openProjects = await api.getOpenProjects(token);
setProjects(openProjects);

        // Fetch my sent proposals to disable buttons
        const res = await fetch('http://localhost:5000/api/proposals/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success && Array.isArray(data.proposals)) {
          const ids = new Set<string>(
            data.proposals.map((p: any) => 
              typeof p.project === 'string' ? p.project : p.project?._id || p.project
            ).filter(Boolean)
          );
          setSentProposalIds(ids);
        }
      } catch (error) {
        console.error('Failed to fetch open projects or proposals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getToken]);

  const formatCurrency = (amount: number) => `KSh ${amount.toLocaleString()}`;

  const handleSendProposal = async (proposal: { message: string; price: number; timeline: string }) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');

    try {
      const res = await fetch('http://localhost:5000/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: selectedProject?._id,
          message: proposal.message,
          price: proposal.price,
          timeline: proposal.timeline,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send proposal');
      }

      alert('Proposal sent successfully! 🎉');
      // Update sent list immediately
      if (selectedProject) {
        setSentProposalIds(prev => {
          const newSet = new Set(prev);
          newSet.add(selectedProject._id);
          return newSet;
        });
      }
      setSelectedProject(null);
    } catch (error: any) {
      console.error('Proposal error:', error);
      alert(error.message || 'Failed to send proposal');
    }
  };

  const hasSentProposal = (projectId: string) => sentProposalIds.has(projectId);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <div className="text-2xl">Loading open projects...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Open Projects</h1>
          <p className="text-xl text-muted-foreground">
            Browse projects posted by clients and send your proposal
          </p>
        </div>

        {projects.length === 0 ? (
          <Card className="p-16 text-center">
            <div className="text-2xl mb-4">No open projects yet</div>
            <p className="text-muted-foreground">
              Check back soon — clients are posting new projects every day!
            </p>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const alreadySent = hasSentProposal(project._id);

              return (
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

                    <div className="space-y-3 mb-6">
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
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.styles.map((style) => (
                        <Badge key={style} variant="secondary">
                          {style}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        Posted by <span className="font-medium">{project.client.name}</span>
                      </p>
                      <Button
                        size="sm"
                        variant={alreadySent ? "secondary" : "default"}
                        disabled={alreadySent}
                        onClick={() => !alreadySent && setSelectedProject(project)}
                      >
                        {alreadySent ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Proposal Sent
                          </>
                        ) : (
                          'Send Proposal'
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Send Proposal Modal */}
      {selectedProject && (
        <ProposalModal
          project={{
            _id: selectedProject._id,
            title: selectedProject.title,
            budget: selectedProject.budget,
            timeline: selectedProject.timeline,
          }}
          onClose={() => setSelectedProject(null)}
          onSubmit={handleSendProposal}
        />
      )}
    </Layout>
  );
}