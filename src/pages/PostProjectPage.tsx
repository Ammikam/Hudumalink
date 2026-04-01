// src/pages/PostProjectPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, ArrowRight, ArrowLeft, Check, Loader2, MapPin, Calendar, Lightbulb, Camera, X } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';

import { Layout } from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/data/MockData';
import { api } from '@/services/api';

const steps = ['Project Details', 'Current Space', 'Your Vision', 'Budget & Style', 'Contact'];
const STYLES = ['Modern', 'African Fusion', 'Minimalist', 'Luxury', 'Bohemian', 'Coastal', 'Budget-Friendly'];
const TIMELINES = ['1-2 weeks', '2-4 weeks', '1-2 months', '2-3 months', '3+ months', 'Flexible'];

function getInitialBudget(prefilled: { budgetMin?: number; budgetMax?: number } | null): number {
  if (prefilled?.budgetMin != null && prefilled?.budgetMax != null) {
    return Math.round((prefilled.budgetMin + prefilled.budgetMax) / 2);
  }
  return 500000;
}

export default function PostProjectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, getToken, isLoaded } = useAuth();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();

  const prefilled = location.state as {
    roomType?: string; budgetMin?: number; budgetMax?: number;
    style?: string; designerId?: string;
  } | null;
  const suggestedDesignerId = prefilled?.designerId;

  const [step, setStep]             = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});

  const [title, setTitle]                     = useState(prefilled?.roomType ? `${prefilled.roomType} Design Project` : '');
  const [description, setDescription]         = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [timeline, setTimeline]               = useState('');

  const [currentPhotos, setCurrentPhotos]               = useState<string[]>([]);
  const [uploadingCurrent, setUploadingCurrent]         = useState(false);
  const [inspirationPhotos, setInspirationPhotos]       = useState<string[]>([]);
  const [inspirationNotes, setInspirationNotes]         = useState('');
  const [uploadingInspiration, setUploadingInspiration] = useState(false);

  // stable initial value, never re-computed
  const [budgetValue, setBudgetValue] = useState<number>(() => getInitialBudget(prefilled));
  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    prefilled?.style ? [prefilled.style] : []
  );

  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (userLoaded && clerkUser) {
      setName(clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim());
      setEmail(clerkUser.primaryEmailAddress?.emailAddress || '');
      setPhone(clerkUser.primaryPhoneNumber?.phoneNumber || '');
    }
  }, [userLoaded, clerkUser]);

  //  stable toggle — no new function reference on every render
  const toggleStyle = useCallback((style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  }, []);

  // ── Photo uploads — direct fetch (avoids api service changes breaking uploads) ──
  const handleCurrentPhotos = async (files: File[]) => {
    if (!files.length) return;
    setUploadingCurrent(true);
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    try {
      const token = await getToken();
      const res = await fetch('https://hudumalink-backend.onrender.com/api/upload/project-images', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setCurrentPhotos(prev => [...prev, ...data.urls]);
    } catch {
      alert('Failed to upload photos. Please try again.');
    } finally {
      setUploadingCurrent(false);
    }
  };

  const handleInspirationPhotos = async (files: File[]) => {
    if (!files.length) return;
    setUploadingInspiration(true);
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    try {
      const token = await getToken();
      const res = await fetch('https://hudumalink-backend.onrender.com/api/upload/project-images', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setInspirationPhotos(prev => [...prev, ...data.urls]);
    } catch {
      alert('Failed to upload photos. Please try again.');
    } finally {
      setUploadingInspiration(false);
    }
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 0) {
      if (!title.trim())           newErrors.title       = 'Project title is required';
      if (!description.trim())     newErrors.description = 'Description is required';
      if (!projectLocation.trim()) newErrors.location    = 'Location is required';
      if (!timeline)               newErrors.timeline    = 'Timeline is required';
    }
    if (currentStep === 1 && currentPhotos.length === 0)
      newErrors.currentPhotos = 'At least one photo of your current space is required';
    if (currentStep === 2 && inspirationPhotos.length === 0)
      newErrors.inspirationPhotos = 'At least one inspiration photo is required';
    if (currentStep === 3) {
      if (selectedStyles.length === 0) newErrors.styles = 'Select at least one style';
      if (budgetValue < 10000) newErrors.budget = 'Budget must be at least KSh 10,000';
    }
    if (currentStep === 4) {
      if (!name.trim())  newErrors.name  = 'Name is required';
      if (!email.trim()) newErrors.email = 'Email is required';
      if (!phone.trim()) newErrors.phone = 'Phone number is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => { if (validateStep(step)) setStep(p => Math.min(p + 1, steps.length - 1)); };
  const prevStep = () => { setStep(p => Math.max(p - 1, 0)); setErrors({}); };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;
    try {
      setSubmitting(true);
      const token = await getToken();
      const response = await api.createProject({
        title, description,
        location: projectLocation,
        budget: budgetValue,
        timeline,
        styles: selectedStyles,
        currentPhotos,
        photos: [...currentPhotos, ...inspirationPhotos], // legacy combined
        inspirationPhotos, inspirationNotes,
        client: { clerkId: userId, name, email, phone },
        suggestedDesignerId,
      }, token!);

      if (response.success) {
        navigate('/success', {
          state: {
            successMessage: 'Your project has been posted successfully! Designers will start sending proposals soon.',
            redirectTo: '/client/dashboard',
          },
        });
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to post project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Guards ──────────────────────────────────────────────────────────────────
  if (!isLoaded || !userLoaded) return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    </Layout>
  );
  if (!userId) { navigate('/sign-in'); return null; }

  const progress = ((step + 1) / steps.length) * 100;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

          {/* Header */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Post Your Project</h1>
            <p className="text-muted-foreground">Tell us about your space and what you envision</p>
          </div>

          {/* ── Stepper ── */}
          <div className="space-y-2">
            {/* Desktop: circles + connector */}
            <div className="hidden sm:flex justify-between items-center">
              {steps.map((_, i) => (
                <div key={i} className="flex items-center flex-1">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors flex-shrink-0',
                    i === step ? 'bg-primary text-primary-foreground' :
                    i < step   ? 'bg-primary/20 text-primary' :
                                 'bg-muted text-muted-foreground'
                  )}>
                    {i < step ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={cn('h-0.5 flex-1 mx-2 transition-colors', i < step ? 'bg-primary' : 'bg-muted')} />
                  )}
                </div>
              ))}
            </div>
            <div className="hidden sm:flex justify-between text-xs text-muted-foreground">
              {steps.map((label, i) => (
                <span key={i} className="flex-1 text-center">{label}</span>
              ))}
            </div>

            {/* Mobile: progress bar + label */}
            <div className="sm:hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{steps[step]}</span>
                <span className="text-sm text-muted-foreground">{step + 1} / {steps.length}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                />
              </div>
              <div className="flex items-center justify-center gap-2 mt-3">
                {steps.map((_, i) => (
                  <div key={i} className={cn(
                    'rounded-full transition-all duration-300',
                    i === step ? 'w-6 h-2 bg-primary' :
                    i < step   ? 'w-2 h-2 bg-primary/50' :
                                 'w-2 h-2 bg-muted-foreground/20'
                  )} />
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="p-6 sm:p-8">

              {/* ── Step 0: Project Details ── */}
              {step === 0 && (
                <motion.div key="step-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                      <Lightbulb className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold">Project Details</h2>
                      <p className="text-sm text-muted-foreground">Basic information about your project</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title" value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g., Modern Living Room Redesign"
                      className={errors.title ? 'border-destructive' : ''}
                    />
                    {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description" value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Describe your project, what you want to achieve, any specific requirements..."
                      rows={5}
                      className={errors.description ? 'border-destructive' : ''}
                    />
                    {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location" className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Location *
                      </Label>
                      <Input
                        id="location" value={projectLocation}
                        onChange={e => setProjectLocation(e.target.value)}
                        placeholder="e.g., Nairobi, Westlands"
                        className={errors.location ? 'border-destructive' : ''}
                      />
                      {errors.location && <p className="text-sm text-destructive mt-1">{errors.location}</p>}
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-1.5">
                        <Calendar className="w-4 h-4" /> Timeline *
                      </Label>
                      {/* Button grid — no native select, works great on mobile */}
                      <div className="grid grid-cols-2 gap-2">
                        {TIMELINES.map(t => (
                          <button
                            key={t} type="button"
                            onClick={() => setTimeline(t)}
                            className={cn(
                              'flex items-center justify-center px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all text-center leading-tight',
                              timeline === t
                                ? 'border-primary bg-primary/8 text-primary'
                                : errors.timeline
                                ? 'border-destructive/40 hover:border-destructive/70 bg-card text-foreground'
                                : 'border-border hover:border-primary/40 bg-card text-foreground'
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      {errors.timeline && <p className="text-sm text-destructive mt-1">{errors.timeline}</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Step 1: Current Space ── */}
              {step === 1 && (
                <motion.div key="step-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-blue-500/10 rounded-lg flex-shrink-0">
                      <Camera className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold">Current Space Photos</h2>
                      <p className="text-sm text-muted-foreground">Upload photos of how your space looks right now</p>
                    </div>
                  </div>

                  <div className={cn(
                    'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                    errors.currentPhotos ? 'border-destructive' : 'border-border hover:border-primary'
                  )}>
                    <input
                      type="file" accept="image/*" multiple
                      onChange={e => handleCurrentPhotos(Array.from(e.target.files || []))}
                      className="hidden" id="current-upload"
                      disabled={uploadingCurrent}
                    />
                    <label htmlFor="current-upload" className="cursor-pointer block">
                      {uploadingCurrent
                        ? <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                        : <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      }
                      <p className="text-base font-medium mb-1">
                        {uploadingCurrent ? 'Uploading...' : 'Upload Current Space Photos'}
                      </p>
                      <p className="text-sm text-muted-foreground">Tap to select photos (multiple allowed)</p>
                    </label>
                  </div>
                  {errors.currentPhotos && <p className="text-sm text-destructive">{errors.currentPhotos}</p>}

                  {currentPhotos.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-3">
                        {currentPhotos.length} photo{currentPhotos.length !== 1 ? 's' : ''} uploaded
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {currentPhotos.map((url, i) => (
                          <div key={i} className="relative group aspect-video">
                            <img src={url} alt={`Current space ${i + 1}`} className="w-full h-full object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => setCurrentPhotos(p => p.filter((_, idx) => idx !== i))}
                              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 sm:transition-opacity active:opacity-100"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Step 2: Inspiration ── */}
              {step === 2 && (
                <motion.div key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-purple-500/10 rounded-lg flex-shrink-0">
                      <Lightbulb className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold">Your Vision</h2>
                      <p className="text-sm text-muted-foreground">Show us how you want your space to look</p>
                    </div>
                  </div>

                  <div className={cn(
                    'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                    errors.inspirationPhotos ? 'border-destructive' : 'border-border hover:border-primary'
                  )}>
                    <input
                      type="file" accept="image/*" multiple
                      onChange={e => handleInspirationPhotos(Array.from(e.target.files || []))}
                      className="hidden" id="inspiration-upload"
                      disabled={uploadingInspiration}
                    />
                    <label htmlFor="inspiration-upload" className="cursor-pointer block">
                      {uploadingInspiration
                        ? <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                        : <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      }
                      <p className="text-base font-medium mb-1">
                        {uploadingInspiration ? 'Uploading...' : 'Upload Inspiration Photos'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Photos of designs you like, Pinterest boards, magazine clippings
                      </p>
                    </label>
                  </div>
                  {errors.inspirationPhotos && <p className="text-sm text-destructive">{errors.inspirationPhotos}</p>}

                  {inspirationPhotos.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-3">
                        {inspirationPhotos.length} inspiration photo{inspirationPhotos.length !== 1 ? 's' : ''} uploaded
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {inspirationPhotos.map((url, i) => (
                          <div key={i} className="relative group aspect-video">
                            <img src={url} alt={`Inspiration ${i + 1}`} className="w-full h-full object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => setInspirationPhotos(p => p.filter((_, idx) => idx !== i))}
                              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 sm:transition-opacity active:opacity-100"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="notes">Tell us what you like about these designs (optional)</Label>
                    <Textarea
                      id="notes" value={inspirationNotes}
                      onChange={e => setInspirationNotes(e.target.value)}
                      placeholder="e.g., 'I love the minimalist aesthetic and neutral color palette...'"
                      rows={4}
                    />
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Budget & Style ── */}
              {step === 3 && (
                <motion.div key="step-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <h2 className="text-xl sm:text-2xl font-semibold">Budget & Style Preferences</h2>

                  <div className="p-5 rounded-2xl bg-primary/5 border border-primary/15 space-y-4">
  <Label className="font-semibold">Your Budget</Label>

                      {/* Input + formatted display row */}
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground select-none">
                            KSh
                          </span>
                          <Input
                            type="number"
                            min={10000}
                            max={5000000}
                            step={1000}
                            value={budgetValue}
                            onChange={e => {
                              const raw = parseInt(e.target.value.replace(/\D/g, ''), 10);
                              if (!isNaN(raw)) setBudgetValue(Math.min(5000000, Math.max(0, raw)));
                            }}
                            onBlur={() => {
                              // clamp to valid range on blur
                              setBudgetValue(prev => Math.min(5000000, Math.max(10000, prev)));
                            }}
                            className="pl-12 h-12 text-base font-semibold"
                          />
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xl font-bold text-primary leading-tight">
                            {formatCurrency(budgetValue)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">formatted</p>
                        </div>
                      </div>

                      <Slider
                        value={[budgetValue]}
                        onValueChange={vals => setBudgetValue(vals[0])}
                        min={10000} max={5000000} step={1000}
                        className="py-2"
                      />

                      {/* Range labels + quick-pick buttons */}
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>KSh 10,000</span>
                        <span>KSh 5,000,000</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[100000, 250000, 500000, 1000000, 2000000].map(preset => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setBudgetValue(preset)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                              budgetValue === preset
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background hover:border-primary/50 text-muted-foreground hover:text-foreground'
                            )}
                          >
                            {formatCurrency(preset)}
                          </button>
                        ))}
                      </div>

                      {errors.budget && <p className="text-sm text-destructive">{errors.budget}</p>}
                    </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="font-semibold">Design Styles *</Label>
                      <span className="text-xs text-muted-foreground">Select all that apply</span>
                    </div>
                    {errors.styles && <p className="text-sm text-destructive mb-2">{errors.styles}</p>}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {STYLES.map(style => {
                        const selected = selectedStyles.includes(style);
                        return (
                          <button
                            key={style} type="button"
                            onClick={() => toggleStyle(style)}
                            className={cn(
                              'flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all text-sm font-medium',
                              selected
                                ? 'border-primary bg-primary/8 text-primary'
                                : 'border-border hover:border-primary/40 bg-card text-foreground'
                            )}
                          >
                            <div className={cn(
                              'w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors',
                              selected ? 'bg-primary border-primary' : 'border-muted-foreground/30 bg-background'
                            )}>
                              {selected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                            </div>
                            {style}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Step 4: Contact ── */}
              {step === 4 && (
                <motion.div key="step-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <h2 className="text-xl sm:text-2xl font-semibold">Contact Information</h2>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" value={name} onChange={e => setName(e.target.value)} className={errors.name ? 'border-destructive' : ''} />
                      {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className={errors.email ? 'border-destructive' : ''} />
                      {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254 712 345 678" className={errors.phone ? 'border-destructive' : ''} />
                      {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-xl space-y-1 text-sm text-muted-foreground">
                    <h3 className="font-semibold text-foreground mb-2">📋 Review Your Project</h3>
                    <p>• {title || 'Untitled Project'}</p>
                    <p>• {projectLocation || 'No location'}</p>
                    <p>• Budget: {formatCurrency(budgetValue)}</p>
                    <p>• {currentPhotos.length} current space photo{currentPhotos.length !== 1 ? 's' : ''}</p>
                    <p>• {inspirationPhotos.length} inspiration photo{inspirationPhotos.length !== 1 ? 's' : ''}</p>
                    <p>• Styles: {selectedStyles.join(', ') || 'None selected'}</p>
                  </div>
                </motion.div>
              )}
            </Card>

            {/* ── Navigation ── */}
            <div className="flex gap-4">
              {step > 0 && (
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              )}
              {step < steps.length - 1 ? (
                <Button type="button" onClick={nextStep} className="flex-1">
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Posting...</>
                    : <><Check className="w-4 h-4 mr-2" />Post Project</>
                  }
                </Button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
}