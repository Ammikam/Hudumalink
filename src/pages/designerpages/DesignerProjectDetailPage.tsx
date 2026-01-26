// src/pages/designerpages/DesignerProjectDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Layout } from '@/components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectChat } from '@/components/chat/ProjectChat';
import { 
  Loader2,
  ArrowLeft,
  User,
  DollarSign,
  Clock,
  Image as ImageIcon,
  MessageSquare,
  CheckCircle2,
  Mail,
  Phone
} from 'lucide-react';

interface Client {
  clerkId: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  budget: number;
  timeline: string;
  photos: string[];
  status: 'open' | 'in_progress' | 'completed';
  client: Client;
}

export default function DesignerProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getToken, isLoaded } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (!isLoaded) return;

    const fetchProject = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error('No token');

        const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        
        if (data.success) {
          setProject(data.project);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, getToken, isLoaded]);

  const getStatusBadge = () => {
    if (!project) return null;
    
    const statusConfig = {
      open: { label: 'Open', className: 'bg-green-100 text-green-800', icon: Clock },
      in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-800', icon: Clock },
      completed: { label: 'Completed', className: 'bg-gray-100 text-gray-800', icon: CheckCircle2 },
    };
    const config = statusConfig[project.status];
    const Icon = config.icon;
    
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading project...</p>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-8">This project doesn't exist or you don't have access to it.</p>
          <Button asChild>
            <Link to="/designer/active-projects">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Active Projects
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-transparent">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/designer/active-projects">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Active Projects
              </Link>
            </Button>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">{project.title}</h1>
                  {getStatusBadge()}
                </div>
                <p className="text-muted-foreground text-lg">{project.description}</p>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="text-xl font-bold">KSh {project.budget.toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Timeline</p>
                      <p className="text-xl font-bold">{project.timeline}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="details">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Project Details
                  </TabsTrigger>
                  <TabsTrigger value="chat">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat with Client
                  </TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6">
                  {/* Client Card */}
                  <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <div className="flex items-center gap-6">
                      <Avatar className="w-20 h-20 ring-4 ring-blue-200">
                        <AvatarImage src={project.client.avatar} />
                        <AvatarFallback className="text-2xl bg-blue-100 text-blue-800">
                          {project.client.name?.[0]?.toUpperCase() || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-700 uppercase tracking-wider">Your Client</p>
                        <h3 className="text-2xl font-bold text-blue-900 mt-1">
                          {project.client.name}
                        </h3>
                        <div className="flex gap-4 mt-2 text-sm text-blue-800">
                          {project.client.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {project.client.email}
                            </div>
                          )}
                          {project.client.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {project.client.phone}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button onClick={() => setActiveTab('chat')} variant="outline" className="border-blue-300">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message Client
                      </Button>
                    </div>
                  </Card>

                  {/* Client Brief */}
                  <Card className="p-8">
                    <h2 className="text-2xl font-bold mb-4">Client Brief</h2>
                    <p className="text-lg text-gray-700 whitespace-pre-wrap">{project.description}</p>

                    <div className="grid grid-cols-2 gap-6 mt-8">
                      <div>
                        <p className="text-sm text-muted-foreground">Project Budget</p>
                        <p className="text-2xl font-bold">KSh {project.budget.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Expected Timeline</p>
                        <p className="text-xl font-semibold">{project.timeline}</p>
                      </div>
                    </div>
                  </Card>

                  {/* Reference Photos */}
                  {project.photos && project.photos.length > 0 ? (
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Reference Photos</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {project.photos.map((photo, i) => (
                          <div key={i} className="relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-105">
                            <img
                              src={photo}
                              alt={`Reference photo ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Card className="p-12 text-center">
                      <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No reference photos provided</p>
                    </Card>
                  )}
                </TabsContent>

                {/* Chat Tab */}
                <TabsContent value="chat">
                  <ProjectChat projectId={id!} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Project Info */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-8">
                <h3 className="font-bold text-lg mb-4">Project Summary</h3>
                
                <div className="space-y-4">
                  <div className="pb-4 border-b">
                    <p className="text-sm text-muted-foreground mb-1">Client</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={project.client.avatar} />
                        <AvatarFallback>
                          {project.client.name?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{project.client.name}</p>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-xs"
                          onClick={() => setActiveTab('chat')}
                        >
                          Send message
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="pb-4 border-b">
                    <p className="text-sm text-muted-foreground mb-1">Budget</p>
                    <p className="text-lg font-bold">KSh {project.budget.toLocaleString()}</p>
                  </div>

                  <div className="pb-4 border-b">
                    <p className="text-sm text-muted-foreground mb-1">Timeline</p>
                    <p className="font-semibold">{project.timeline}</p>
                  </div>

                  <div className="pb-4 border-b">
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    {getStatusBadge()}
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Reference Photos</p>
                    <p className="font-semibold">
                      {project.photos?.length || 0} {project.photos?.length === 1 ? 'photo' : 'photos'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}