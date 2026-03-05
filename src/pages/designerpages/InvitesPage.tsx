// src/pages/designerpages/InvitesPage.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ProjectCard } from '@/projects/ProjectCard';

interface Invite {
  _id: string;
  project: {
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
    client: {
      name: string;
      email?: string;
      avatar?: string;
    };
  };
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export default function InvitesPage() {
  const { getToken } = useAuth();
  const { toast } = useToast();

  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const res = await fetch('http://localhost:5000/api/invites/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setInvites(data.invites);
      } catch (err) {
        console.error('Failed to fetch invites:', err);
        toast({ title: 'Error', description: 'Failed to load invites', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchInvites();
  }, [getToken, toast]);

  const handleAccept = async (inviteId: string) => {
    setResponding(inviteId);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/invites/${inviteId}/accept`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        toast({ title: '✅ Invite Accepted', description: 'Redirecting to send your proposal...' });
        setInvites(prev => prev.filter(i => i._id !== inviteId));
        window.location.href = '/designer/open-projects';
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Failed to accept invite:', err);
      toast({ title: 'Error', description: 'Failed to accept invite', variant: 'destructive' });
    } finally {
      setResponding(null);
    }
  };

  const handleDecline = async (inviteId: string) => {
    if (!confirm('Are you sure you want to decline this invite?')) return;

    setResponding(inviteId);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/invites/${inviteId}/decline`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        toast({ title: 'Invite Declined', description: 'The client will be notified.' });
        setInvites(prev => prev.filter(i => i._id !== inviteId));
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Failed to decline invite:', err);
      toast({ title: 'Error', description: 'Failed to decline invite', variant: 'destructive' });
    } finally {
      setResponding(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading invites...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 max-w-5xl">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold">Project Invites</h1>
              <p className="text-muted-foreground text-lg">
                {invites.length > 0
                  ? `${invites.length} client${invites.length !== 1 ? 's' : ''} invited you directly`
                  : 'Clients who invited you directly will appear here'}
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {invites.length === 0 ? (
          <Card className="p-20 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
              <Users className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No invites yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              When clients discover your profile and want to hire you directly,
              their project invites will appear here.
            </p>
            <Button asChild>
              <Link to="/designer/active-projects">Browse Open Projects</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {invites.map((invite, i) => (
              <motion.div
                key={invite._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                className="flex flex-col gap-3"
              >
                {/* ProjectCard handles all photo logic */}
                <ProjectCard
                  project={invite.project}
                  variant="open"
                  directInvite
                  actionLabel={
                    responding === invite._id ? 'Accepting...' : 'Accept & Propose'
                  }
                  onAction={() => handleAccept(invite._id)}
                />

                {/* Decline button sits just below the card */}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!!responding}
                  onClick={() => handleDecline(invite._id)}
                  className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  {responding === invite._id ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Decline invite
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}