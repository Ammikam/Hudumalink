// src/pages/ProjectDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Layout } from '@/components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectChat } from '@/components/chat/ProjectChat';
import { 
  Loader2, 
  ArrowLeft, 
  Star, 
  CheckCircle2,
  Clock,
  DollarSign,
  MessageSquare,
  Image as ImageIcon
} from 'lucide-react';

interface Designer {
  _id: string;
  name: string;
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
  designer?: Designer | null;
  client: {
    clerkId: string;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
  };
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { userId, getToken, isLoaded } = useAuth();

  // State
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Fetch project
  useEffect(() => {
    if (!isLoaded || !userId) return;

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
        } else {
          console.error('Failed to load project:', data.error);
        }
      } catch (err) {
        console.error('Error loading project:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, userId, isLoaded, getToken]);

  // Handlers
  const handleMarkComplete = async () => {
    if (!confirm('Mark this project as complete? This will end the collaboration.')) return;

    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/projects/${id}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert('Project marked as complete!');
        setShowReview(true);
        setActiveTab('review');
      } else {
        alert('Failed to complete project');
      }
    } catch (error) {
      console.error('Error completing project:', error);
      alert('Failed to complete project');
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      alert('Please give a star rating');
      return;
    }

    setSubmittingReview(true);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: id,
          designerId: project?.designer?._id,
          rating,
          review: reviewText.trim(),
        }),
      });

      if (res.ok) {
        alert('Thank you for your review!');
        window.location.reload();
      } else {
        alert('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = () => {
    const statusConfig = {
      open: { label: 'Open', className: 'bg-green-100 text-green-800', icon: Clock },
      in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-800', icon: Clock },
      completed: { label: 'Completed', className: 'bg-gray-100 text-gray-800', icon: CheckCircle2 },
    };
    const config = statusConfig[project?.status || 'open'];
    const Icon = config.icon;
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Loading state
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

  // Not found state
  if (!project) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-8">This project doesn't exist or you don't have access to it.</p>
          <Button asChild>
            <Link to="/dashboard/client">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
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
              <Link to="/dashboard/client">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Projects
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
                    Details & Photos
                  </TabsTrigger>
                  <TabsTrigger value="chat">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat
                  </TabsTrigger>
                  {(project.status === 'in_progress' || showReview) && (
                    <TabsTrigger value="review">
                      <Star className="w-4 h-4 mr-2" />
                      Complete & Review
                    </TabsTrigger>
                  )}
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6">
                  {/* Hired Designer Card */}
                  {project.designer && (
                    <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                      <div className="flex items-center gap-6">
                        <Avatar className="w-20 h-20 ring-4 ring-green-200">
                          <AvatarImage src={project.designer.avatar} />
                          <AvatarFallback className="text-2xl bg-green-100 text-green-800">
                            {project.designer.name?.[0]?.toUpperCase() || 'D'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-700 uppercase tracking-wider">Hired Designer</p>
                          <h3 className="text-2xl font-bold text-green-900 mt-1">
                            {project.designer.name}
                          </h3>
                          <p className="text-green-800 mt-1">Working on your project</p>
                        </div>
                        {project.status === 'in_progress' && (
                          <Button onClick={() => setActiveTab('review')} variant="outline" className="border-green-300">
                            Complete Project
                          </Button>
                        )}
                      </div>
                    </Card>
                  )}

                  {/* Photos Grid */}
                  {project.photos.length > 0 ? (
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Project Photos</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {project.photos.map((photo, i) => (
                          <div key={i} className="relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-105">
                            <img
                              src={photo}
                              alt={`Project photo ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Card className="p-12 text-center">
                      <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No photos uploaded yet</p>
                    </Card>
                  )}
                </TabsContent>

                {/* Chat Tab */}
                <TabsContent value="chat">
                  <ProjectChat projectId={project._id} />
                </TabsContent>

                {/* Review Tab */}
                <TabsContent value="review">
                  <Card className="p-8">
                    {!showReview ? (
                      <>
                        <h3 className="text-2xl font-bold mb-4">Complete Project</h3>
                        <p className="text-muted-foreground mb-6">
                          When the work is finished, mark the project as complete and leave a review for {project.designer?.name}.
                        </p>
                        <Button size="lg" onClick={handleMarkComplete}>
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Mark as Complete
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">Leave a Review</h3>
                          <p className="text-muted-foreground">
                            How was your experience working with {project.designer?.name}?
                          </p>
                        </div>

                        <div>
                          <Label className="text-base font-semibold mb-3 block">Rating</Label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
                              >
                                <Star
                                  className={`w-12 h-12 ${
                                    star <= rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          {rating > 0 && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="review" className="text-base font-semibold">Your Review (Optional)</Label>
                          <Textarea
                            id="review"
                            rows={6}
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Share your experience working with this designer..."
                            className="mt-2"
                          />
                        </div>

                        <Button
                          size="lg"
                          onClick={handleSubmitReview}
                          disabled={submittingReview || rating === 0}
                          className="w-full"
                        >
                          {submittingReview ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          ) : (
                            <Star className="w-5 h-5 mr-2" />
                          )}
                          Submit Review
                        </Button>
                      </div>
                    )}
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Project Info Card */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-8">
                <h3 className="font-bold text-lg mb-4">Project Information</h3>
                
                <div className="space-y-4">
                  <div className="pb-4 border-b">
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{project.description}</p>
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

                  {project.designer && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">Designer</p>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={project.designer.avatar} />
                          <AvatarFallback>
                            {project.designer.name?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{project.designer.name}</p>
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
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}