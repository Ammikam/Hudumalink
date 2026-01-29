// src/pages/ProjectDetailPage.tsx - IMPROVED VERSION
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Layout } from '@/components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProjectChat } from '@/components/chat/ProjectChat';
import { 
  Loader2, 
  ArrowLeft, 
  Star, 
  CheckCircle2,
  Clock,
  DollarSign,
  MessageSquare,
  Image as ImageIcon,
  AlertCircle,
  Trophy,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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

interface Review {
  _id: string;
  rating: number;
  review: string;
  createdAt: string;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { userId, getToken, isLoaded } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [project, setProject] = useState<Project | null>(null);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [completingProject, setCompletingProject] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Fetch project and existing review
  useEffect(() => {
    if (!isLoaded || !userId) return;

    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error('No token');

        // Fetch project
        const projectRes = await fetch(`http://localhost:5000/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const projectData = await projectRes.json();

        if (projectData.success) {
          setProject(projectData.project);

          // If project is completed, check for existing review
          if (projectData.project.status === 'completed') {
            const reviewRes = await fetch(`http://localhost:5000/api/reviews/project/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const reviewData = await reviewRes.json();

            if (reviewData.success && reviewData.review) {
              setExistingReview(reviewData.review);
            } else {
              // No review yet, show review form
              setShowReview(true);
            }
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
        toast({
          title: "Error",
          description: "Failed to load project details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, userId, isLoaded, getToken]);

  // Handlers
  const handleMarkComplete = async () => {
    if (!window.confirm('Mark this project as complete? This action cannot be undone.')) return;

    setCompletingProject(true);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/projects/${id}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Success!",
          description: "Project marked as complete. Please leave a review for your designer.",
        });
        setProject(prev => prev ? { ...prev, status: 'completed' } : null);
        setShowReview(true);
        setActiveTab('review');
      } else {
        toast({
          title: "Error",
          description: data.error || 'Failed to complete project',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error completing project:', error);
      toast({
        title: "Error",
        description: "Failed to complete project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCompletingProject(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      });
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

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Thank you!",
          description: "Your review has been submitted successfully.",
        });
        
        // Refresh to show the submitted review
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast({
          title: "Error",
          description: data.error || 'Failed to submit review',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const getRatingLabel = (stars: number) => {
    const labels = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Great',
      5: 'Excellent!'
    };
    return labels[stars as keyof typeof labels] || '';
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
          <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
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

          {/* Completed Project Alert */}
          {project.status === 'completed' && existingReview && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <Trophy className="w-5 h-5 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Project Completed!</strong> You've already submitted a review for this project.
              </AlertDescription>
            </Alert>
          )}

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
                  {(project.status === 'in_progress' || project.status === 'completed') && (
                    <TabsTrigger value="review">
                      <Star className="w-4 h-4 mr-2" />
                      {existingReview ? 'Your Review' : 'Complete & Review'}
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
                          <p className="text-green-800 mt-1">
                            {project.status === 'completed' ? 'Project completed' : 'Working on your project'}
                          </p>
                        </div>
                        {project.status === 'in_progress' && (
                          <Button onClick={() => setActiveTab('review')} variant="outline" className="border-green-300">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
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
                          <div key={i} className="relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
                            <img
                              src={photo}
                              alt={`Project photo ${i + 1}`}
                              className="w-full h-full object-cover"
                              onClick={() => window.open(photo, '_blank')}
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
                    {existingReview ? (
                      // Show existing review
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <Trophy className="w-8 h-8 text-yellow-500" />
                          <div>
                            <h3 className="text-2xl font-bold">Your Review</h3>
                            <p className="text-muted-foreground">
                              Submitted on {new Date(existingReview.createdAt).toLocaleDateString('en-KE', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>

                        <div>
                          <Label className="text-base font-semibold mb-3 block">Your Rating</Label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-10 h-10 ${
                                  star <= existingReview.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {getRatingLabel(existingReview.rating)}
                          </p>
                        </div>

                        {existingReview.review && (
                          <div>
                            <Label className="text-base font-semibold mb-2 block">Your Feedback</Label>
                            <Card className="p-4 bg-muted">
                              <p className="whitespace-pre-wrap">{existingReview.review}</p>
                            </Card>
                          </div>
                        )}

                        <Alert>
                          <Sparkles className="w-4 h-4" />
                          <AlertDescription>
                            Thank you for sharing your experience! Your review helps other clients find great designers.
                          </AlertDescription>
                        </Alert>
                      </div>
                    ) : !showReview ? (
                      // Complete project button
                      <>
                        <h3 className="text-2xl font-bold mb-4">Complete Project</h3>
                        <p className="text-muted-foreground mb-6">
                          When the work is finished, mark the project as complete and leave a review for {project.designer?.name}.
                        </p>
                        <Button 
                          size="lg" 
                          onClick={handleMarkComplete}
                          disabled={completingProject}
                        >
                          {completingProject ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Completing...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-5 h-5 mr-2" />
                              Mark as Complete
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      // Review form
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">Leave a Review</h3>
                          <p className="text-muted-foreground">
                            How was your experience working with {project.designer?.name}?
                          </p>
                        </div>

                        <div>
                          <Label className="text-base font-semibold mb-3 block">Rating *</Label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="focus:outline-none transition-transform hover:scale-110"
                              >
                                <Star
                                  className={`w-12 h-12 ${
                                    star <= (hoverRating || rating)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          {(rating > 0 || hoverRating > 0) && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {getRatingLabel(hoverRating || rating)}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="review" className="text-base font-semibold">Your Review (Optional)</Label>
                          <p className="text-sm text-muted-foreground mb-2">
                            Share details about your experience, the quality of work, communication, and professionalism.
                          </p>
                          <Textarea
                            id="review"
                            rows={6}
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Share your experience working with this designer..."
                            className="mt-2"
                            maxLength={1000}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {reviewText.length}/1000 characters
                          </p>
                        </div>

                        <Button
                          size="lg"
                          onClick={handleSubmitReview}
                          disabled={submittingReview || rating === 0}
                          className="w-full"
                        >
                          {submittingReview ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin mr-2" />
                              Submitting Review...
                            </>
                          ) : (
                            <>
                              <Star className="w-5 h-5 mr-2" />
                              Submit Review
                            </>
                          )}
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