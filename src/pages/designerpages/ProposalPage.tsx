// src/components/designerpages/ProposalsPage.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Layout } from '@/components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'lucide-react';

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

export default function ProposalsPage() {
  const { getToken } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyProposals = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const res = await fetch('http://localhost:5000/api/proposals/my', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setProposals(data.proposals || []);
        } else {
          console.error('Failed to fetch proposals:', data.error);
        }
      } catch (error) {
        console.error('Error fetching proposals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProposals();
  }, [getToken]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={styles[status] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => `KSh ${amount.toLocaleString()}`;

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-lg">Loading your proposals...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">My Proposals</h1>
          <p className="text-xl text-muted-foreground">
            Track the proposals you've sent to clients
          </p>
        </div>

        {proposals.length === 0 ? (
          <Card className="p-16 text-center">
            <div className="text-2xl mb-4">No proposals sent yet</div>
            <p className="text-muted-foreground">
              Start browsing open projects and send your first proposal!
            </p>
            <Button asChild className="mt-6">
              <Link to="/designer/open-projects">Browse Open Projects</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {proposals.map((proposal) => (
              <Card key={proposal._id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      {proposal.project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Sent on {new Date(proposal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(proposal.status)}
                </div>

                <div className="space-y-3 text-sm">
                  <p className="text-gray-700 line-clamp-3">
                    {proposal.message}
                  </p>
                  <div className="flex gap-8 text-muted-foreground">
                    <span>
                      <strong>Price:</strong> {formatCurrency(proposal.price)}
                    </span>
                    <span>
                      <strong>Timeline:</strong> {proposal.timeline}
                    </span>
                  </div>
                </div>

                {proposal.status === 'accepted' && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg text-green-800">
                    🎉 Congratulations! This proposal was accepted.
                  </div>
                )}

                {proposal.status === 'rejected' && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg text-red-800">
                    This proposal was not selected.
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}