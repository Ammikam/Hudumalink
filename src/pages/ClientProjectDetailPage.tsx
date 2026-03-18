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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectChat } from '@/components/chat/ProjectChat';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, ArrowLeft, Star, CheckCircle2, Clock,
  DollarSign, MessageSquare, Image as ImageIcon,
  AlertCircle, Trophy, Sparkles, X, Shield,
  MapPin, Calendar, CreditCard, Receipt, CheckCheck,
  AlertTriangle, Ban,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface Designer { _id: string; name: string; avatar?: string; }
interface Project {
  _id: string; title: string; description: string;
  budget: number; timeline: string; location?: string; styles?: string[];
  photos: string[];
  currentPhotos?: string[];
  inspirationPhotos?: string[];
  status: 'open' | 'payment_pending' | 'in_progress' | 'completed';
  designer?: Designer | null;
  client: { clerkId: string; name: string; email?: string; phone?: string; avatar?: string; };
  createdAt?: string;
}
interface Review { _id: string; rating: number; review: string; createdAt: string; }
interface Payment {
  _id: string;
  status: string;
  amount: number;
  platformFee: number;
  designerAmount: number;
  paymentMethod: string;
  mpesaReceiptNumber?: string;
  createdAt: string;
  heldAt?: string;
  releasedAt?: string;
  refundedAt?: string;
}

const STATUS_CONFIG = {
  open:            { label: 'Open',             dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: Clock        },
  payment_pending: { label: 'Awaiting Payment',  dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 border-amber-200',       Icon: Clock        },
  in_progress:     { label: 'In Progress',       dot: 'bg-blue-400',    badge: 'bg-blue-50 text-blue-700 border-blue-200',           Icon: Clock        },
  completed:       { label: 'Completed',          dot: 'bg-muted-foreground/40', badge: 'bg-muted text-muted-foreground border-border', Icon: CheckCircle2 },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending:  { label: 'Pending',   color: 'bg-blue-500/10 text-blue-700 border-blue-200',   icon: Clock        },
  held:     { label: 'In Escrow', color: 'bg-amber-500/10 text-amber-700 border-amber-200', icon: Shield       },
  released: { label: 'Paid Out',  color: 'bg-green-500/10 text-green-700 border-green-200', icon: CheckCheck   },
  refunded: { label: 'Refunded',  color: 'bg-purple-500/10 text-purple-700 border-purple-200', icon: Receipt   },
  failed:   { label: 'Failed',    color: 'bg-red-500/10 text-red-700 border-red-200',       icon: Ban          },
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

  const [project, setProject]                   = useState<Project | null>(null);
  const [payment, setPayment]                   = useState<Payment | null>(null);
  const [existingReview, setExistingReview]     = useState<Review | null>(null);
  const [loading, setLoading]                   = useState(true);
  const [showReview, setShowReview]             = useState(false);
  const [rating, setRating]                     = useState(0);
  const [hoverRating, setHoverRating]           = useState(0);
  const [reviewText, setReviewText]             = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [completingProject, setCompletingProject] = useState(false);
  const [activeTab, setActiveTab]               = useState('details');
  const [lightboxPhoto, setLightboxPhoto]       = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !userId) return;
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error('No token');

        const [projectRes, paymentRes] = await Promise.all([
          fetch(`http://localhost:5000/api/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://localhost:5000/api/payments/project/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
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
            if (reviewData.success && reviewData.review) setExistingReview(reviewData.review);
            else setShowReview(true);
          }
        }
        if (paymentData.success && paymentData.payment) setPayment(paymentData.payment);
      } catch {
        toast({ title: 'Error', description: 'Failed to load project details', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, userId, isLoaded, getToken]);

  const handleMarkComplete = async () => {
    if (!window.confirm('Mark this project as complete?\n\nThis will release payment to the designer and cannot be undone.')) return;
    setCompletingProject(true);
    try {
      const token = await getToken();
      const completeRes = await fetch(`http://localhost:5000/api/projects/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const completeData = await completeRes.json();
      if (!completeRes.ok) {
        toast({ title: 'Error', description: completeData.error || 'Failed to complete project', variant: 'destructive' });
        return;
      }
      if (payment?._id && payment.status === 'held') {
        const releaseRes = await fetch(`http://localhost:5000/api/payments/release/${payment._id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        if (releaseRes.ok) {
          toast({ title: '✅ Project Complete!', description: `KSh ${payment.designerAmount.toLocaleString()} sent to ${project?.designer?.name}. Please leave a review.` });
          setPayment(prev => prev ? { ...prev, status: 'released' } : null);
        } else {
          toast({ title: '⚠️ Project Complete — Payment Pending', description: 'Project marked complete but payment release failed. Please contact support.', variant: 'destructive' });
        }
      } else {
        toast({ title: '✅ Project Complete!', description: 'Project marked as complete. Please leave a review.' });
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
    if (rating === 0) { toast({ title: 'Rating Required', description: 'Please select a star rating.', variant: 'destructive' }); return; }
    setSubmittingReview(true);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ projectId: id, designerId: project?.designer?._id, rating, review: reviewText.trim() }),
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

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString('en-KE', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

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
  const currentPhotos     = project.currentPhotos?.length     ? project.currentPhotos     : [];
  const inspirationPhotos = project.inspirationPhotos?.length ? project.inspirationPhotos : [];
  const legacyPhotos      = project.photos?.length            ? project.photos            : [];
  const hasNewPhotos      = currentPhotos.length > 0 || inspirationPhotos.length > 0;

  // Tab count for payment tab label
  const hasPayment = !!payment;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/20 to-transparent">

        {/* ── Sticky header ── */}
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

          {/* ── Status banners ── */}
          <div className="space-y-3 mb-6">

            {/* Completed + reviewed */}
            {project.status === 'completed' && existingReview && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-emerald-900">Project Completed</p>
                    <p className="text-xs text-emerald-700">You've reviewed this designer — thank you!</p>
                  </div>
                  <div className="flex gap-0.5 flex-shrink-0">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= existingReview.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Payment pending */}
            {project.status === 'payment_pending' && isClient && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-900">Payment required to start</p>
                      <p className="text-xs text-amber-700">{project.designer?.name} is ready — secure your payment to unlock the project.</p>
                    </div>
                  </div>
                  <Button size="sm" className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => navigate(`/payment/${project._id}`)}>
                    Pay Now
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Escrow active */}
            {project.status === 'in_progress' && payment?.status === 'held' && isClient && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-200">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-sm text-blue-800 flex-1">
                    <strong>KSh {payment.designerAmount.toLocaleString()}</strong> held securely in escrow —
                    released to {project.designer?.name} when you mark the project complete.
                  </p>
                  <Button size="sm" variant="outline"
                    className="flex-shrink-0 border-blue-300 text-blue-700 hover:bg-blue-100"
                    onClick={() => setActiveTab('review')}>
                    Mark Complete
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Mobile-only info cards ── */}
<div className="lg:hidden space-y-3 mb-5">

  {/* Project details */}
  <div className="rounded-2xl border border-border/60 bg-background p-4">
    <div className="grid grid-cols-2 gap-3">
      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-primary flex-shrink-0" />
        <div>
          <p className="text-xs text-muted-foreground">Budget</p>
          <p className="text-sm font-bold text-primary">KSh {project.budget.toLocaleString()}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <div>
          <p className="text-xs text-muted-foreground">Timeline</p>
          <p className="text-sm font-semibold">{project.timeline}</p>
        </div>
      </div>
      {project.location && (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="text-sm font-semibold truncate">{project.location}</p>
          </div>
        </div>
      )}
      {project.createdAt && (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Posted</p>
            <p className="text-sm font-semibold">{formatDate(project.createdAt)}</p>
          </div>
        </div>
      )}
    </div>
  </div>

  {/* Payment mini card */}
  {payment && (
    <div className={cn(
      'p-4 rounded-2xl border',
      payment.status === 'held'     ? 'bg-amber-50 border-amber-200' :
      payment.status === 'released' ? 'bg-green-50 border-green-200' :
      payment.status === 'pending'  ? 'bg-blue-50 border-blue-200' :
                                      'bg-muted border-border'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className={cn('w-4 h-4',
            payment.status === 'held'     ? 'text-amber-600' :
            payment.status === 'released' ? 'text-green-600' :
            payment.status === 'pending'  ? 'text-blue-600' : 'text-muted-foreground'
          )} />
          <div>
            <p className={cn('text-sm font-semibold',
              payment.status === 'held'     ? 'text-amber-900' :
              payment.status === 'released' ? 'text-green-900' :
              payment.status === 'pending'  ? 'text-blue-900' : 'text-foreground'
            )}>
              {payment.status === 'held'     ? 'In Escrow' :
               payment.status === 'released' ? 'Payment Released' :
               payment.status === 'pending'  ? 'Payment Pending' : 'Payment'}
            </p>
            <p className={cn('text-xs',
              payment.status === 'held'     ? 'text-amber-600' :
              payment.status === 'released' ? 'text-green-600' :
              payment.status === 'pending'  ? 'text-blue-600' : 'text-muted-foreground'
            )}>
              {payment.status === 'held'     ? `KSh ${payment.designerAmount.toLocaleString()} goes to designer` :
               payment.status === 'released' ? `KSh ${payment.designerAmount.toLocaleString()} sent to designer` :
               payment.status === 'pending'  ? 'Awaiting M-Pesa confirmation' : ''}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn('text-xl font-bold',
            payment.status === 'held'     ? 'text-amber-700' :
            payment.status === 'released' ? 'text-green-700' :
            payment.status === 'pending'  ? 'text-blue-700' : 'text-foreground'
          )}>
            KSh {payment.amount.toLocaleString()}
          </p>
          {payment.status !== 'released' && (
            <button
              onClick={() => setActiveTab('payment')}
              className="text-xs font-medium mt-0.5 hover:underline opacity-70 hover:opacity-100 transition-opacity">
              View details →
            </button>
          )}
        </div>
      </div>
    </div>
  )}

  
</div>

          {/* ── Main grid ── */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* ── Left: tabs ── */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full mb-5 grid grid-cols-4 sm:flex sm:w-auto">
                  <TabsTrigger value="details" className="text-xs sm:text-sm gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" /><span>Details</span>
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="text-xs sm:text-sm gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /><span>Chat</span>
                  </TabsTrigger>
                  {hasPayment && (
                    <TabsTrigger value="payment" className="text-xs sm:text-sm gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" /><span>Payment</span>
                    </TabsTrigger>
                  )}
                  {(project.status === 'in_progress' || project.status === 'completed') && (
                    <TabsTrigger value="review" className="text-xs sm:text-sm gap-1.5">
                      <Star className="w-3.5 h-3.5" />
                      <span>{existingReview ? 'Review' : 'Complete'}</span>
                    </TabsTrigger>
                  )}
                </TabsList>

                {/* ── Details tab ── */}
                <TabsContent value="details" className="space-y-5">

                  {/* Designer card */}
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
                          {project.status === 'completed'       ? 'Project completed ✓' :
                           project.status === 'payment_pending' ? 'Waiting for payment to start' :
                                                                  'Working on your project'}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline"
                          className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 text-xs h-8 gap-1"
                          onClick={() => setActiveTab('chat')}>
                          <MessageSquare className="w-3.5 h-3.5" /> Chat
                        </Button>
                        {project.status === 'in_progress' && isClient && (
                          <Button size="sm" variant="outline"
                            className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 text-xs h-8 gap-1"
                            onClick={() => setActiveTab('review')}>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="p-4 rounded-2xl bg-muted/40 border border-border/60">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-2">Description</p>
                    <p className="text-sm lg:text-base leading-relaxed">{project.description}</p>
                  </div>

                  {/* Project meta — styles */}
                  {project.styles && project.styles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.styles.map(s => (
                        <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Photos */}
                  {(hasNewPhotos || legacyPhotos.length > 0) ? (
                    <div className="space-y-5">
                      {currentPhotos.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-3">
                            Current Space ({currentPhotos.length})
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {currentPhotos.map((photo, i) => (
                              <button key={`c-${i}`} onClick={() => setLightboxPhoto(photo)}
                                className="relative aspect-square rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary">
                                <img src={photo} alt={`Current ${i+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {inspirationPhotos.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-3">
                            Inspiration ({inspirationPhotos.length})
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {inspirationPhotos.map((photo, i) => (
                              <button key={`i-${i}`} onClick={() => setLightboxPhoto(photo)}
                                className="relative aspect-square rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary">
                                <img src={photo} alt={`Inspiration ${i+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {!hasNewPhotos && legacyPhotos.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-3">
                            Photos ({legacyPhotos.length})
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {legacyPhotos.map((photo, i) => (
                              <button key={`l-${i}`} onClick={() => setLightboxPhoto(photo)}
                                className="relative aspect-square rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary">
                                <img src={photo} alt={`Photo ${i+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
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

                {/* ── Payment tab ── */}
                {hasPayment && (
                  <TabsContent value="payment" className="space-y-4">

                    {/* Payment summary card */}
                    <div className="rounded-2xl border border-border/60 bg-background overflow-hidden">
                      <div className="p-5 border-b border-border/60 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold">Payment Summary</h3>
                          <p className="text-xs text-muted-foreground">
                            {payment && formatDate(payment.createdAt)}
                          </p>
                        </div>
                        {payment && (
                          <Badge variant="outline" className={cn('text-xs flex-shrink-0',
                            PAYMENT_STATUS_CONFIG[payment.status]?.color || 'bg-muted text-muted-foreground'
                          )}>
                            {PAYMENT_STATUS_CONFIG[payment.status]?.label || payment.status}
                          </Badge>
                        )}
                      </div>

                      {payment && (
                        <div className="p-5 space-y-4">
                          {/* Amount breakdown */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Total Paid</span>
                              <span className="font-semibold">KSh {payment.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Platform Fee (10%)</span>
                              <span className="font-semibold text-muted-foreground">- KSh {payment.platformFee.toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-border" />
                            <div className="flex justify-between">
                              <span className="font-semibold">Designer Receives</span>
                              <span className="font-bold text-primary">KSh {payment.designerAmount.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Payment timeline */}
                          <div className="space-y-3 pt-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline</p>

                            {/* Paid */}
                            <div className="flex items-start gap-3">
                              <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">Payment Received</p>
                                <p className="text-xs text-muted-foreground">{formatDateTime(payment.createdAt)}</p>
                                {payment.mpesaReceiptNumber && (
                                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                    Receipt: {payment.mpesaReceiptNumber}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Held in escrow */}
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                                payment.heldAt ? 'bg-amber-100' : 'bg-muted'
                              )}>
                                <Shield className={cn('w-4 h-4', payment.heldAt ? 'text-amber-600' : 'text-muted-foreground/40')} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn('text-sm font-medium', !payment.heldAt && 'text-muted-foreground')}>
                                  Held in Escrow
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {payment.heldAt ? formatDateTime(payment.heldAt) : 'Pending confirmation'}
                                </p>
                              </div>
                            </div>

                            {/* Released / refunded */}
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                                payment.releasedAt ? 'bg-green-100' :
                                payment.refundedAt ? 'bg-purple-100' : 'bg-muted'
                              )}>
                                {payment.releasedAt
                                  ? <CheckCheck className="w-4 h-4 text-green-600" />
                                  : payment.refundedAt
                                  ? <Receipt className="w-4 h-4 text-purple-600" />
                                  : <DollarSign className="w-4 h-4 text-muted-foreground/40" />
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  'text-sm font-medium',
                                  !payment.releasedAt && !payment.refundedAt && 'text-muted-foreground'
                                )}>
                                  {payment.releasedAt ? 'Released to Designer' :
                                   payment.refundedAt ? 'Refunded to Client' :
                                   'Pending Release'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {payment.releasedAt ? formatDateTime(payment.releasedAt) :
                                   payment.refundedAt ? formatDateTime(payment.refundedAt) :
                                   'Awaiting project completion'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Escrow info */}
                          {payment.status === 'held' && isClient && (
                            <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <p className="text-sm text-blue-800">
                                  Funds are secure. Approve the work to release payment.
                                </p>
                              </div>
                              <Button size="sm"
                                className="flex-shrink-0 gap-1.5"
                                onClick={() => setActiveTab('review')}>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                              </Button>
                            </div>
                          )}

                          {/* Released confirmation */}
                          {payment.status === 'released' && (
                            <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                              <CheckCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                              <p className="text-sm text-green-800">
                                <strong>KSh {payment.designerAmount.toLocaleString()}</strong> successfully sent to {project.designer?.name}'s M-Pesa.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )}

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
                              {formatDate(existingReview.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div>
                          <div className="flex gap-1 mb-1">
                            {[1,2,3,4,5].map(s => (
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
                        <h3 className="font-display font-bold text-lg mb-2">Approve & Complete</h3>
                        <p className="text-sm text-muted-foreground mb-2 max-w-sm mx-auto">
                          Happy with the work? Mark it complete to release payment to {project.designer?.name}.
                        </p>
                        {payment?.status === 'held' && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/15 mb-6">
                            <DollarSign className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-primary">
                              KSh {payment.designerAmount.toLocaleString()} will be released
                            </span>
                          </div>
                        )}
                        <Button size="lg" onClick={handleMarkComplete} disabled={completingProject} className="gap-2">
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
                          <p className="text-sm text-muted-foreground mt-1">How was your experience with {project.designer?.name}?</p>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Rating *</Label>
                          <div className="flex gap-1.5">
                            {[1,2,3,4,5].map(star => (
                              <button key={star} type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="focus:outline-none transition-transform hover:scale-110 active:scale-95">
                                <Star className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                                  star <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                                }`} />
                              </button>
                            ))}
                          </div>
                          {(rating > 0 || hoverRating > 0) && (
                            <p className="text-sm text-muted-foreground mt-1.5 font-medium">{RATING_LABELS[hoverRating || rating]}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                            Your Feedback (optional)
                          </Label>
                          <Textarea rows={5} value={reviewText}
                            onChange={e => setReviewText(e.target.value)}
                            placeholder="Share your experience — quality of work, communication, professionalism…"
                            className="rounded-xl resize-none text-sm" maxLength={1000}
                          />
                          <p className="text-xs text-muted-foreground mt-1 text-right">{reviewText.length}/1000</p>
                        </div>
                        <Button size="lg" onClick={handleSubmitReview} disabled={submittingReview || rating === 0} className="w-full gap-2">
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

                {/* Project stats */}
                <div className="rounded-2xl border border-border/60 bg-background p-5 space-y-4">
                  <h3 className="font-semibold text-base">Project Details</h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <StatusPill status={project.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" /> Budget
                      </span>
                      <span className="text-sm font-bold text-primary">KSh {project.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Timeline
                      </span>
                      <span className="text-sm font-semibold">{project.timeline}</span>
                    </div>
                    {project.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> Location
                        </span>
                        <span className="text-sm font-semibold">{project.location}</span>
                      </div>
                    )}
                    {project.createdAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Posted
                        </span>
                        <span className="text-sm font-semibold">{formatDate(project.createdAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment mini card — only when payment exists */}
                {payment && (
                  <div className={cn(
                    'p-4 rounded-2xl border',
                    payment.status === 'held'     ? 'bg-amber-50 border-amber-200' :
                    payment.status === 'released' ? 'bg-green-50 border-green-200' :
                    payment.status === 'pending'  ? 'bg-blue-50 border-blue-200' :
                                                    'bg-muted border-border'
                  )}>
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className={cn('w-4 h-4',
                        payment.status === 'held'     ? 'text-amber-600' :
                        payment.status === 'released' ? 'text-green-600' :
                        payment.status === 'pending'  ? 'text-blue-600' : 'text-muted-foreground'
                      )} />
                      <p className={cn('text-sm font-semibold',
                        payment.status === 'held'     ? 'text-amber-900' :
                        payment.status === 'released' ? 'text-green-900' :
                        payment.status === 'pending'  ? 'text-blue-900' : 'text-foreground'
                      )}>
                        {payment.status === 'held'     ? 'In Escrow' :
                         payment.status === 'released' ? 'Payment Released' :
                         payment.status === 'pending'  ? 'Payment Pending' : 'Payment'}
                      </p>
                    </div>
                    <p className={cn('text-2xl font-bold mb-1',
                      payment.status === 'held'     ? 'text-amber-700' :
                      payment.status === 'released' ? 'text-green-700' :
                      payment.status === 'pending'  ? 'text-blue-700' : 'text-foreground'
                    )}>
                      KSh {payment.amount.toLocaleString()}
                    </p>
                    <p className={cn('text-xs',
                      payment.status === 'held'     ? 'text-amber-600' :
                      payment.status === 'released' ? 'text-green-600' :
                      payment.status === 'pending'  ? 'text-blue-600' : 'text-muted-foreground'
                    )}>
                      {payment.status === 'held'     ? `KSh ${payment.designerAmount.toLocaleString()} goes to designer` :
                       payment.status === 'released' ? `KSh ${payment.designerAmount.toLocaleString()} sent to designer` :
                       payment.status === 'pending'  ? 'Awaiting M-Pesa confirmation' : ''}
                    </p>
                    {payment.status !== 'released' && (
                      <button
                        onClick={() => setActiveTab('payment')}
                        className="text-xs font-medium mt-2 hover:underline opacity-70 hover:opacity-100 transition-opacity">
                        View details →
                      </button>
                    )}
                  </div>
                )}

                {/* Designer */}
                {project.designer && (
                  <div className="rounded-2xl border border-border/60 bg-background p-5">
                    <p className="text-sm text-muted-foreground mb-3 font-medium">Your Designer</p>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-11 h-11 ring-2 ring-border flex-shrink-0">
                        <AvatarImage src={project.designer.avatar} />
                        <AvatarFallback className="text-sm font-bold">
                          {project.designer.name?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-base truncate">{project.designer.name}</p>
                        <button className="text-xs text-secondary hover:underline" onClick={() => setActiveTab('chat')}>
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

      {/* ── Photo lightbox ── */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              src={lightboxPhoto} alt="Full size"
              className="max-w-full max-h-full rounded-xl object-contain"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}