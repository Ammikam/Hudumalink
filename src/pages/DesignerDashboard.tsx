import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/data/MockData';
import { designers } from '@/data/MockData';
import { Loader2 } from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  description: string;
  budget: number;
  invitedDesigner?: string;
  client: { clerkId: string };
  createdAt: string;
}

export default function DesignerDashboard() {
  const { userId, isLoaded } = useAuth();
  const [invites, setInvites] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // TEMP: Map current user to a designer ID (for demo)
  // In real app: user has role + designer profile
  const currentDesigner = designers.find(d => d.id === '1'); // Wanjiku for demo

  useEffect(() => {
    if (!isLoaded) return;

    const fetchInvites = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/projects');
        const data = await res.json();

        if (data.success) {
          const myInvites = data.projects.filter((p: Project) => 
            p.invitedDesigner === currentDesigner?.id
          );
          setInvites(myInvites);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvites();
  }, [isLoaded]);

  if (!isLoaded) return <div className="py-32 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl lg:text-4xl font-bold">
          Welcome back, {currentDesigner?.name.split(' ')[0] || 'Designer'} 👋
        </h1>
        <p className="text-muted-foreground mt-2">
          Here are the projects clients have invited you to
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      )}

      {!loading && invites.length === 0 && (
        <Card className="p-16 text-center">
          <p className="text-xl text-muted-foreground mb-4">No invites yet</p>
          <p className="text-muted-foreground">
            Clients will invite you when they love your profile. Keep it updated!
          </p>
        </Card>
      )}

      {invites.length > 0 && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-2xl font-bold">
              Project Invites ({invites.length})
            </h2>
            <Badge variant="secondary" className="text-lg px-4">
              New
            </Badge>
          </div>

          {invites.map((invite) => (
            <Card key={invite._id} className="p-8 card-premium">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-display text-2xl font-bold mb-2">{invite.title}</h3>
                  <p className="text-muted-foreground max-w-3xl">{invite.description}</p>
                </div>
                <Badge variant="outline" className="text-lg">
                  New Invite
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <p className="text-sm text-muted-foreground">Client Budget</p>
                  <p className="font-display text-3xl font-bold text-primary">
                    {formatCurrency(invite.budget)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Received</p>
                  <p className="font-semibold text-lg">
                    {new Date(invite.createdAt).toLocaleDateString('en-KE')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className="mt-2">Pending Response</Badge>
                </div>
              </div>

              <div className="flex gap-4">
                <Button size="lg" className="flex-1">
                  Accept & Send Proposal
                </Button>
                <Button size="lg" variant="outline" className="flex-1">
                  Message Client
                </Button>
                <Button size="lg" variant="ghost">
                  Decline
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}