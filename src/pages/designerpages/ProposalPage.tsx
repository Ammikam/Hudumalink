// src/pages/designerpages/ProposalsPage.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';          // ← fixed: was lucide-react
import { Layout } from '@/components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, Briefcase, Clock, DollarSign } from 'lucide-react';

interface Proposal {
  _id: string;
  project: {
    _id: string;
    title: string;
  };
  message: string;
  price: number;
  timeline: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  className: 'bg-yellow-100 text-yellow-800' },
  accepted: { label: 'Accepted', className: 'bg-green-100  text-green-800'  },
  rejected: { label: 'Rejected', className: 'bg-red-100    text-red-800'    },
};

export default function ProposalsPage() {
  const { getToken } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchMyProposals = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const res  = await fetch('http://localhost:5000/api/proposals/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success) setProposals(data.proposals || []);
        else console.error('Failed to fetch proposals:', data.error);
      } catch (error) {
        console.error('Error fetching proposals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProposals();
  }, [getToken]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Loading your proposals...</p>
        </div>
      </Layout>
    );
  }

  // Split into buckets for better organisation
  const accepted = proposals.filter(p => p.status === 'accepted');
  const pending  = proposals.filter(p => p.status === 'pending');
  const rejected = proposals.filter(p => p.status === 'rejected');
  const ordered  = [...accepted, ...pending, ...rejected];

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 max-w-3xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">My Proposals</h1>
          <p className="text-muted-foreground text-lg">
            {proposals.length > 0
              ? `${accepted.length} accepted · ${pending.length} pending · ${rejected.length} declined`
              : 'Track the proposals youve sent to clients'}
          </p>
        </div>

        {proposals.length === 0 ? (
          <Card className="p-16 text-center">
            <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-2xl font-bold mb-2">No proposals sent yet</p>
            <p className="text-muted-foreground mb-6">
              Start browsing open projects and send your first proposal!
            </p>
            <Button asChild>
              <Link to="/designer/open-projects">Browse Open Projects</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {ordered.map((proposal) => {
              const cfg = STATUS_CONFIG[proposal.status];
              return (
                <Card
                  key={proposal._id}
                  className={`p-6 transition-opacity ${proposal.status === 'rejected' ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-xl font-bold leading-tight">
                        {proposal.project?.title ?? 'Project'}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Sent {new Date(proposal.createdAt).toLocaleDateString('en-KE', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </p>
                    </div>
                    <Badge className={cfg.className}>{cfg.label}</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {proposal.message}
                  </p>

                  <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold text-foreground">
                        KSh {proposal.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{proposal.timeline}</span>
                    </div>
                  </div>

                  {/* Accepted — go to the active project */}
                  {proposal.status === 'accepted' && (
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                      <p className="text-green-800 font-semibold text-sm">
                        🎉 Congratulations! This proposal was accepted.
                      </p>
                      <Button size="sm" asChild>
                        <Link to={`/designer/projects/${proposal.project._id}`}>
                          Go to Project <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Link>
                      </Button>
                    </div>
                  )}

                  {proposal.status === 'rejected' && (
                    <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                      This proposal was not selected for the project.
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}