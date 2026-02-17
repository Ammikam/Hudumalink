// src/pages/designerpages/OpenProjectsPage.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { MapPin, Calendar, DollarSign, Check, Loader2, Briefcase, Images } from 'lucide-react';
import { api } from '@/services/api';
import { Layout } from '@/components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
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
  client: { name: string };
}

export default function OpenProjectsPage() {
  const { getToken }  = useAuth();
  const { toast }     = useToast();
  const [projects, setProjects]             = useState<Project[]>([]);
  const [sentProposalIds, setSentProposalIds] = useState<Set<string>>(new Set());
  const [loading, setLoading]               = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const [openProjects, proposalsRes] = await Promise.all([
          api.getOpenProjects(token),
          fetch('http://localhost:5000/api/proposals/my', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setProjects(openProjects);

        const proposalsData = await proposalsRes.json();
        if (proposalsData.success && Array.isArray(proposalsData.proposals)) {
          const ids = new Set<string>(
            proposalsData.proposals
              .map((p: any) => (typeof p.project === 'string' ? p.project : p.project?._id))
              .filter(Boolean)
          );
          setSentProposalIds(ids);
        }
      } catch (error) {
        console.error('Failed to fetch open projects or proposals:', error);
        toast({ title: 'Error', description: 'Failed to load projects', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getToken, toast]);

  const handleSendProposal = async (proposal: { message: string; price: number; timeline: string }) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch('http://localhost:5000/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        projectId: selectedProject?._id,
        message:   proposal.message,
        price:     proposal.price,
        timeline:  proposal.timeline,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to send proposal');
    }

    toast({ title: '🎉 Proposal Sent!', description: 'The client will be notified.' });

    if (selectedProject) {
      setSentProposalIds(prev => new Set([...prev, selectedProject._id]));
    }
    setSelectedProject(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading open projects...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">Open Projects</h1>
          <p className="text-muted-foreground text-lg">
            {projects.length > 0
              ? `${projects.length} project${projects.length !== 1 ? 's' : ''} looking for a designer`
              : 'Browse projects posted by clients and send your proposal'}
          </p>
        </div>

        {projects.length === 0 ? (
          <Card className="p-16 text-center">
            <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-2xl font-bold mb-2">No open projects yet</p>
            <p className="text-muted-foreground">
              Check back soon — clients are posting new projects every day!
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const alreadySent = sentProposalIds.has(project._id);
              return (
                <Card key={project._id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                  {/* Photo or placeholder */}
                  {project.photos?.[0] ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={project.photos[0]}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                      {project.photos.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Images className="w-3 h-3" />{project.photos.length}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 bg-muted flex items-center justify-center">
                      <Briefcase className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-2 line-clamp-1">{project.title}</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3 flex-1 text-sm">
                      {project.description}
                    </p>

                    <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin     className="w-4 h-4 flex-shrink-0" />{project.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 flex-shrink-0" />KSh {project.budget.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar   className="w-4 h-4 flex-shrink-0" />{project.timeline}
                      </div>
                    </div>

                    {project.styles?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.styles.map(s => (
                          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        by <span className="font-medium text-foreground">{project.client?.name}</span>
                      </p>
                      <Button
                        size="sm"
                        variant={alreadySent ? 'secondary' : 'default'}
                        disabled={alreadySent}
                        onClick={() => !alreadySent && setSelectedProject(project)}
                      >
                        {alreadySent ? (
                          <><Check className="w-4 h-4 mr-1.5" />Sent</>
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

      {selectedProject && (
        <ProposalModal
          project={{
            _id:      selectedProject._id,
            title:    selectedProject.title,
            budget:   selectedProject.budget,
            timeline: selectedProject.timeline,
          }}
          onClose={() => setSelectedProject(null)}
          onSubmit={handleSendProposal}
        />
      )}
    </Layout>
  );
}