// src/pages/ProjectDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Layout } from '@/components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProjectChat } from '@/components/chat/ProjectChat';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, ArrowLeft, Star, CheckCircle2, Clock,
  DollarSign, MessageSquare, Image as ImageIcon,
  AlertCircle, Trophy, Sparkles, X, Shield,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Designer { _id: string; name: string; avatar?: string; }
interface Project {
  _id: string; title: string; description: string;
  budget: number; timeline: string; photos: string[];
  status: 'open' | 'payment_pending' | 'in_progress' | 'completed';
  designer?: Designer | null;
  client: { clerkId: string; name: string; email?: string; phone?: string; avatar?: string; };
}
interface Review { _id: string; rating: number; review: string; createdAt: string; }
interface Payment { _id: string; status: string; designerAmount: number; amount: number; }

const STATUS_CONFIG = {
  open:            { label: 'Open',             dot: 'bg-emerald-400',        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',   Icon: Clock        },
  payment_pending: { label: 'Awaiting Payment',  dot: 'bg-amber-400',          badge: 'bg-amber-50 text-amber-700 border-amber-200',         Icon: Clock        },
  in_progress:     { label: 'In Progress',       dot: 'bg-blue-400',            badge: 'bg-blue-50 text-blue-700 border-blue-200',             Icon: Clock        },
  completed:       { label: 'Completed',          dot: 'bg-muted-foreground/40', badge: 'bg-muted text-muted-foreground border-border',         Icon: CheckCircle2 },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.open;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

const RATING_LABELS: Record<number, string> = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent!' };

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { userId, getToken, isLoaded } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [project, setProject]                     = useState<Project | null>(null);
  const [payment, setPayment]                     = useState<Payment | null>(null);
  const [existingReview, setExistingReview]       = useState<Review | null>(null);
  const [loading, setLoading]                     = useState(true);
  const [showReview, setShowReview]               = useState(false);
  const [rating, setRating]                       = useState(0);
  const [hoverRating, setHoverRating]             = useState(0);
  const [reviewText, setReviewText]               = useState('');
  const [submittingReview, setSubmittingReview]   = useState(false);
  const [completingProject, setCompletingProject] = useState(false);
  const [activeTab, setActiveTab]                 = useState('details');
  const [lightboxPhoto, setLightboxPhoto]         = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !userId) return;
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error('No token');

        // Fetch project and payment in parallel
        const [projectRes, paymentRes] = await Promise.all([
          fetch(`http://localhost:5000/api/projects/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:5000/api/payments/project/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const projectData = await projectRes.json();
        const paymentData = await paymentRes.json();

        if (projectData.success) {
          setProject(projectData.project);

          if (projectData.project.status === 'completed') {
            const reviewRes = await fetch(`http://localhost:5000/api/reviews/project/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const reviewData = await reviewRes.json();
            if (reviewData.success && reviewData.review) {
              setExistingReview(reviewData.review);
            } else {
              setShowReview(true);
            }
          }
        }

        if (paymentData.success && paymentData.payment) {
          setPayment(paymentData.payment);
        }

      } catch {
        toast({ title: 'Error', description: 'Failed to load project details', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, userId, isLoaded, getToken]);

  // ✅ STEP 6: Mark complete AND release payment in one action
  const handleMarkComplete = async () => {
    if (!window.confirm(
      'Mark this project as complete?\n\nThis will release payment to the designer and cannot be undone.'
    )) return;

    setCompletingProject(true);
    try {
      const token = await getToken();

      // Step A: Mark project as complete
      const completeRes = await fetch(`http://localhost:5000/api/projects/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const completeData = await completeRes.json();

      if (!completeRes.ok) {
        toast({ title: 'Error', description: completeData.error || 'Failed to complete project', variant: 'destructive' });
        return;
      }

      // Step B: Release payment to designer if one exists in escrow
      if (payment?._id && payment.status === 'held') {
        const releaseRes = await fetch(`http://localhost:5000/api/payments/release/${payment._id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        const releaseData = await releaseRes.json();

        if (releaseRes.ok) {
          toast({
            title: '✅ Project Complete!',
            description: `KSh ${payment.designerAmount.toLocaleString()} has been sent to ${project?.designer?.name}. Please leave a review.`,
          });
        } else {
          // Project is marked complete but payment release failed — flag it
          toast({
            title: '⚠️ Project Complete — Payment Pending',
            description: 'Project marked complete but payment release failed. Please contact support.',
            variant: 'destructive',
          });
        }
      } else {
        // No escrow payment found — just complete the project
        toast({
          title: '✅ Project Complete!',
          description: 'Project marked as complete. Please leave a review.',
        });
      }

      setProject(prev => prev ? { ...prev, status: 'completed' } : null);
      setShowReview(true);
      setActiveTab('review');

    } catch {
      toast({ title: 'Error', description: 'Failed to complete project.', variant: 'destructive' });
    } finally {
      setCompletingProject(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast({ title: 'Rating Required', description: 'Please select a star rating.', variant: 'destructive' });
      return;
    }
    setSubmittingReview(true);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          projectId: id,
          designerId: project?.designer?._id,
          rating,
          review: reviewText.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Thank you!', description: 'Your review has been submitted.' });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to submit review', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to submit review.', variant: 'destructive' });
    } finally {
      setSubmittingReview(false);
    }
  };

  // ── Guards ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading project…</p>
        </div>
      </div>
    </Layout>
  );

  if (!project) return (
    <Layout>
      <div className="container mx-auto py-32 text-center px-4">
        <AlertCircle className="w-14 h-14 mx-auto text-muted-foreground mb-4" />
        <h1 className="font-display text-2xl font-bold mb-3">Project Not Found</h1>
        <p className="text-muted-foreground mb-6 text-sm">This project doesn't exist or you don't have access.</p>
        <Button asChild><Link to="/dashboard/client"><ArrowLeft className="w-4 h-4 mr-2" />Back to Dashboard</Link></Button>
      </div>
    </Layout>
  );

  const isClient = project.client.clerkId === userId;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/20 to-transparent">

        {/* ── Sticky page header ── */}
        <div className="sticky top-16 lg:top-20 z-30 bg-background/80 backdrop-blur-md border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="gap-1.5 -ml-2 flex-shrink-0">
              <Link to="/dashboard/client">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Projects</span>
              </Link>
            </Button>
            <div className="h-4 w-px bg-border flex-shrink-0" />
            <h1 className="font-display font-semibold text-sm sm:text-base truncate flex-1 min-w-0">
              {project.title}
            </h1>
            <StatusPill status={project.status} />
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-6xl">

          {/* ── Completed alert ── */}
          {project.status === 'completed' && existingReview && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-sm text-emerald-800 font-medium">
                  Project complete — you've already reviewed this designer.
                </p>
              </div>
            </motion.div>
          )}

          {/* ✅ Payment pending banner — shown when project needs payment */}
          {project.status === 'payment_pending' && isClient && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
              <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Payment required to start</p>
                    <p className="text-xs text-amber-700">
                      {project.designer?.name} is ready — secure your payment to unlock the project.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => navigate(`/payment/${project._id}`)}
                >
                  Pay Now
                </Button>
              </div>
            </motion.div>
          )}

          {/* ✅ Escrow info banner — shown when payment is held */}
          {project.status === 'in_progress' && payment?.status === 'held' && isClient && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-200">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm text-blue-800">
                  <strong>KSh {payment.designerAmount.toLocaleString()}</strong> is held in escrow.
                  It will be released to {project.designer?.name} when you mark the project complete.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Budget + timeline pills (mobile) ── */}
          <div className="flex gap-3 mb-5 sm:hidden">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/8 border border-primary/15 text-sm">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="font-semibold">KSh {project.budget.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{project.timeline}</span>
            </div>
          </div>

          {/* ── Main grid ── */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* ── Left / main ── */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full sm:w-auto mb-5 grid grid-cols-3 sm:flex">
                  <TabsTrigger value="details" className="text-xs sm:text-sm gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="text-xs sm:text-sm gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </TabsTrigger>
                  {(project.status === 'in_progress' || project.status === 'completed') && (
                    <TabsTrigger value="review" className="text-xs sm:text-sm gap-1.5">
                      <Star className="w-3.5 h-3.5" />
                      <span>{existingReview ? 'Review' : 'Complete'}</span>
                    </TabsTrigger>
                  )}
                </TabsList>

                {/* ── Details tab ── */}
                <TabsContent value="details" className="space-y-5">
                  {project.designer && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                      <Avatar className="w-12 h-12 ring-2 ring-emerald-200 flex-shrink-0">
                        <AvatarImage src={project.designer.avatar} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold text-base">
                          {project.designer.name?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Hired Designer</p>
                        <p className="font-bold text-emerald-900 truncate">{project.designer.name}</p>
                        <p className="text-xs text-emerald-700">
                          {project.status === 'completed'
                            ? 'Project completed ✓'
                            : project.status === 'payment_pending'
                            ? 'Waiting for payment to start'
                            : 'Working on your project'}
                        </p>
                      </div>
                      {project.status === 'in_progress' && isClient && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 flex-shrink-0 text-xs h-8"
                          onClick={() => setActiveTab('review')}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-muted/40 border border-border/60">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-2">Description</p>
                    <p className="text-sm lg:text-base leading-relaxed">{project.description}</p>
                  </div>

                  {project.photos.length > 0 ? (
                    <div>
                      <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-3">
                        Photos ({project.photos.length})
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {project.photos.map((photo, i) => (
                          <button
                            key={i}
                            onClick={() => setLightboxPhoto(photo)}
                            className="relative aspect-square rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <img
                              src={photo}
                              alt={`Project photo ${i + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-14 rounded-2xl bg-muted/40 border border-dashed border-border">
                      <ImageIcon className="w-10 h-10 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">No photos uploaded yet</p>
                    </div>
                  )}
                </TabsContent>

                {/* ── Chat tab ── */}
                <TabsContent value="chat">
                  <div className="rounded-2xl overflow-hidden border border-border/60">
                    <ProjectChat projectId={project._id} />
                  </div>
                </TabsContent>

                {/* ── Review / Complete tab ── */}
                <TabsContent value="review">
                  <div className="rounded-2xl border border-border/60 bg-background p-5 sm:p-6">
                    {existingReview ? (
                      <div className="space-y-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-amber-500" />
                          </div>
                          <div>
                            <h3 className="font-display font-bold">Your Review</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(existingReview.createdAt).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div>
                          <div className="flex gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`w-7 h-7 ${s <= existingReview.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">{RATING_LABELS[existingReview.rating]}</p>
                        </div>
                        {existingReview.review && (
                          <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
                            <p className="text-sm lg:text-base leading-relaxed whitespace-pre-wrap">{existingReview.review}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/15">
                          <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                          <p className="text-sm text-primary font-medium">Your review helps other clients find great designers.</p>
                        </div>
                      </div>
                    ) : !showReview ? (
                      <div className="text-center py-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="font-display font-bold text-lg mb-2">Complete Project</h3>
                        <p className="text-sm text-muted-foreground mb-2 max-w-sm mx-auto">
                          When the work is finished, mark it complete to release payment to {project.designer?.name}.
                        </p>
                        {payment?.status === 'held' && (
                          <p className="text-sm font-semibold text-primary mb-6">
                            KSh {payment.designerAmount.toLocaleString()} will be sent to the designer.
                          </p>
                        )}
                        <Button
                          size="lg"
                          onClick={handleMarkComplete}
                          disabled={completingProject}
                          className="gap-2"
                        >
                          {completingProject
                            ? <><Loader2 className="w-4 h-4 animate-spin" />Processing…</>
                            : <><CheckCircle2 className="w-4 h-4" />Mark as Complete & Release Payment</>
                          }
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div>
                          <h3 className="font-display font-bold text-lg">Leave a Review</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            How was your experience with {project.designer?.name}?
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
                            Rating *
                          </Label>
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                              >
                                <Star className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                                  star <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                                }`} />
                              </button>
                            ))}
                          </div>
                          {(rating > 0 || hoverRating > 0) && (
                            <p className="text-sm text-muted-foreground mt-1.5 font-medium">
                              {RATING_LABELS[hoverRating || rating]}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                            Your Feedback (optional)
                          </Label>
                          <Textarea
                            rows={5}
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Share your experience — quality of work, communication, professionalism…"
                            className="rounded-xl resize-none text-sm"
                            maxLength={1000}
                          />
                          <p className="text-xs text-muted-foreground mt-1 text-right">{reviewText.length}/1000</p>
                        </div>
                        <Button
                          size="lg"
                          onClick={handleSubmitReview}
                          disabled={submittingReview || rating === 0}
                          className="w-full gap-2"
                        >
                          {submittingReview
                            ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</>
                            : <><Star className="w-4 h-4" />Submit Review</>
                          }
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* ── Sidebar ── */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-28 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-primary/8 border border-primary/15">
                    <p className="text-sm text-muted-foreground mb-1">Budget</p>
                    <p className="font-bold text-lg">KSh {project.budget.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/60 border border-border/60">
                    <p className="text-sm text-muted-foreground mb-1">Timeline</p>
                    <p className="font-bold text-lg">{project.timeline}</p>
                  </div>
                </div>

                {/* ✅ Escrow card in sidebar */}
                {payment?.status === 'held' && (
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <p className="text-sm font-semibold text-blue-900">In Escrow</p>
                    </div>
                    <p className="text-xl font-bold text-blue-700 mb-1">
                      KSh {payment.designerAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-600">
                      Released to designer on project completion
                    </p>
                  </div>
                )}

                <div className="rounded-2xl border border-border/60 bg-background p-5 space-y-4">
                  <h3 className="font-semibold text-base">Project Info</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <StatusPill status={project.status} />
                    </div>
                    <div className="border-t pt-3">
                      <p className="text-sm text-muted-foreground mb-1">Description</p>
                      <p className="leading-relaxed text-sm text-foreground/80">{project.description}</p>
                    </div>
                  </div>

                  {project.designer && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground mb-3">Designer</p>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-11 h-11 ring-2 ring-border flex-shrink-0">
                          <AvatarImage src={project.designer.avatar} />
                          <AvatarFallback className="text-sm font-bold">
                            {project.designer.name?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold text-base truncate">{project.designer.name}</p>
                          <button
                            className="text-sm text-secondary hover:underline"
                            onClick={() => setActiveTab('chat')}
                          >
                            Send message →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Photo lightbox ── */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxPhoto(null)}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              onClick={() => setLightboxPhoto(null)}
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={lightboxPhoto}
              alt="Full size photo"
              className="max-w-full max-h-full rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}