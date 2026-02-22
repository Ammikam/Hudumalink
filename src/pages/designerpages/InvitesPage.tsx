// src/pages/designerpages/InvitesPage.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Loader2, MapPin, DollarSign, Calendar, Clock, 
  Check, X, Briefcase, AlertCircle, Users 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
    client: {
      name: string;
      email?: string;
      avatar?: string;
    };
    createdAt: string;
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

  const handleAccept = async (inviteId: string, projectId: string) => {
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
        // Remove from local list
        setInvites(prev => prev.filter(i => i._id !== inviteId));
        // Redirect to proposal form with project pre-filled
        // You can navigate to a proposal form route here if you have one, or to the project detail
        window.location.href = `/designer/open-projects`; // Adjust route as needed
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
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">Project Invites</h1>
          <p className="text-muted-foreground text-lg">
            {invites.length > 0
              ? `${invites.length} client${invites.length !== 1 ? 's' : ''} invited you directly`
              : 'Clients who invited you directly will appear here'}
          </p>
        </div>

        {invites.length === 0 ? (
          <Card className="p-16 text-center">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-bold mb-2">No invites yet</h3>
            <p className="text-muted-foreground mb-6">
              When clients discover your profile and want to hire you directly, their project invites will appear here.
            </p>
            <Button asChild variant="outline">
              <Link to="/designer/open-projects">Browse Open Projects</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {invites.map(invite => (
              <Card key={invite._id} className="overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  {/* Project photo */}
                  <div className="lg:w-80 h-64 lg:h-auto relative bg-muted">
                    {invite.project.photos?.[0] ? (
                      <img
                        src={invite.project.photos[0]}
                        alt={invite.project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Briefcase className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-amber-100 text-amber-800 border border-amber-200">
                        Direct Invite
                      </Badge>
                    </div>
                  </div>

                  {/* Project details */}
                  <div className="flex-1 p-6 lg:p-8">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold mb-2">{invite.project.title}</h3>
                      <p className="text-muted-foreground line-clamp-2">
                        {invite.project.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{invite.project.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span>KSh {invite.project.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{invite.project.timeline}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {new Date(invite.createdAt).toLocaleDateString('en-KE', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {invite.project.styles?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {invite.project.styles.map(s => (
                          <Badge key={s} variant="secondary" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Client info */}
                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl mb-6">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={invite.project.client.avatar} />
                        <AvatarFallback>
                          {invite.project.client.name?.charAt(0).toUpperCase() ?? 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs text-muted-foreground">Invited by</p>
                        <p className="font-semibold">{invite.project.client.name}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleAccept(invite._id, invite.project._id)}
                        disabled={!!responding}
                        className="flex-1"
                      >
                        {responding === invite._id ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Check className="w-4 h-4 mr-2" />
                        )}
                        Accept & Send Proposal
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDecline(invite._id)}
                        disabled={!!responding}
                      >
                        {responding === invite._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}