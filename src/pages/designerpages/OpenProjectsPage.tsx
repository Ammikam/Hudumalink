// src/pages/designerpages/OpenProjectsPage.tsx - WITH MODAL
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Loader2, Briefcase, Sparkles } from 'lucide-react';
import { api } from '@/services/api';
import { Layout } from '@/components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ProjectCard } from '@/projects/ProjectCard';
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
  beforePhotos?: string[];
  inspirationPhotos?: string[];
  inspirationNotes?: string;
  status: string;
  createdAt: string;
  client: { name: string; avatar?: string };
}

export default function OpenProjectsPage() {
  const { getToken } = useAuth();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [sentProposalIds, setSentProposalIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
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
        console.error('Failed to fetch data:', error);
        toast({ 
          title: 'Error', 
          description: 'Failed to load projects', 
          variant: 'destructive' 
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getToken, toast]);

  const handleSendProposal = async (proposal: { 
    message: string; 
    price: number; 
    timeline: string 
  }) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch('http://localhost:5000/api/proposals', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
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

    toast({ 
      title: ' Proposal Sent!', 
      description: 'The client will be notified.' 
    });

    if (selectedProject) {
      setSentProposalIds(prev => new Set([...prev, selectedProject._id]));
    }
    setSelectedProject(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading open projects...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div>
              <h1 className="font-display text-4xl font-bold">Open Projects</h1>
              <p className="text-muted-foreground text-lg">
                {projects.length > 0
                  ? `${projects.length} project${projects.length !== 1 ? 's' : ''} looking for a designer`
                  : 'Browse projects and send your proposal'}
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {projects.length === 0 ? (
          <Card className="p-20 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
              <Briefcase className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No open projects yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Check back soon — clients are posting new projects every day!
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </Card>
        ) : (
          /* Projects Grid */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const alreadySent = sentProposalIds.has(project._id);
              return (
                <ProjectCard
                  key={project._id}
                  project={project}
                  variant="open"
                  alreadySent={alreadySent}
                  onAction={() => !alreadySent && setSelectedProject(project)}
                  actionLabel="Send Proposal"
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Proposal Modal */}
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