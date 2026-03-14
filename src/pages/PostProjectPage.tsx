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

// ✅ FIX: Compute initial budget value once, outside the component
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
    roomType?: string;
    budgetMin?: number;
    budgetMax?: number;
    style?: string;
    designerId?: string;
  } | null;

  const suggestedDesignerId = prefilled?.designerId;

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 0
  const [title, setTitle] = useState(prefilled?.roomType ? `${prefilled.roomType} Design Project` : '');
  const [description, setDescription] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [timeline, setTimeline] = useState('');

  // Step 1
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([]);
  const [uploadingCurrent, setUploadingCurrent] = useState(false);

  // Step 2
  const [inspirationPhotos, setInspirationPhotos] = useState<string[]>([]);
  const [inspirationNotes, setInspirationNotes] = useState('');
  const [uploadingInspiration, setUploadingInspiration] = useState(false);

  // Step 3 — ✅ FIX: stable initial value, never re-computed
  const [budgetValue, setBudgetValue] = useState<number>(() => getInitialBudget(prefilled));
  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    prefilled?.style ? [prefilled.style] : []
  );

  // Step 4
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (userLoaded && clerkUser) {
      setName(clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim());
      setEmail(clerkUser.primaryEmailAddress?.emailAddress || '');
      setPhone(clerkUser.primaryPhoneNumber?.phoneNumber || '');
    }
  }, [userLoaded, clerkUser]);

  // ✅ FIX: stable toggle — no new function reference on every render
  const toggleStyle = useCallback((style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  }, []);

  const handleCurrentPhotos = async (files: File[]) => {
    if (!files.length) return;
    setUploadingCurrent(true);
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:5000/api/upload/project-images', {
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
      const res = await fetch('http://localhost:5000/api/upload/project-images', {
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

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 0) {
      if (!title.trim())           newErrors.title       = 'Project title is required';
      if (!description.trim())     newErrors.description = 'Description is required';
      if (!projectLocation.trim()) newErrors.location    = 'Location is required';
      if (!timeline)               newErrors.timeline    = 'Timeline is required';
    }
    if (currentStep === 1 && currentPhotos.length === 0) {
      newErrors.currentPhotos = 'At least one photo of your current space is required';
    }
    if (currentStep === 2 && inspirationPhotos.length === 0) {
      newErrors.inspirationPhotos = 'At least one inspiration photo is required';
    }
    if (currentStep === 3) {
      if (selectedStyles.length === 0) newErrors.styles = 'Select at least one style';
      if (budgetValue < 50000)         newErrors.budget = 'Budget must be at least KSh 50,000';
    }
    if (currentStep === 4) {
      if (!name.trim())  newErrors.name  = 'Name is required';
      if (!email.trim()) newErrors.email = 'Email is required';
      if (!phone.trim()) newErrors.phone = 'Phone number is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 0));
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateStep(step)) return;
  try {
    setSubmitting(true);
    const token = await getToken();
    const response = await api.createProject({
      title,
      description,
      location: projectLocation,
      budget: budgetValue,
      timeline,
      styles: selectedStyles,
      currentPhotos,
      inspirationPhotos,
      inspirationNotes,
      client: { clerkId: userId, name, email, phone },
      suggestedDesignerId,
    }, token!);

    if (response.success) {
      // ✅ FIX: redirect to success page instead of dashboard directly
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

  if (!isLoaded || !userLoaded) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!userId) {
    navigate('/sign-in');
    return null;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold mb-2">Post Your Project</h1>
            <p className="text-muted-foreground">Tell us about your space and what you envision</p>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              {steps.map((_, i) => (
                <div key={i} className="flex items-center flex-1">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    i === step ? 'bg-primary text-primary-foreground' :
                    i < step  ? 'bg-primary/20 text-primary' :
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
            {/* Step labels — hidden on very small screens to avoid overflow */}
            <div className="hidden sm:flex justify-between text-xs text-muted-foreground">
              {steps.map((label, i) => (
                <span key={i} className="flex-1 text-center">{label}</span>
              ))}
            </div>
            {/* Current step label for mobile */}
            <p className="sm:hidden text-xs text-center text-muted-foreground font-medium">
              Step {step + 1} of {steps.length}: {steps[step]}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="p-6 sm:p-8">

              {/* ── Step 0: Project Details ── */}
              {step === 0 && (
                <motion.div key="step-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Lightbulb className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold">Project Details</h2>
                      <p className="text-sm text-muted-foreground">Basic information about your project</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Project Title *</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g., Modern Living Room Redesign"
                        className={errors.title ? 'border-destructive' : ''}
                      />
                      {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Describe your project, what you want to achieve, any specific requirements..."
                        rows={6}
                        className={errors.description ? 'border-destructive' : ''}
                      />
                      {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
                    </div>

                    {/* ✅ FIX: stack on mobile, side by side on md+ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location" className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> Location *
                        </Label>
                        <Input
                          id="location"
                          value={projectLocation}
                          onChange={e => setProjectLocation(e.target.value)}
                          placeholder="e.g., Nairobi, Westlands"
                          className={errors.location ? 'border-destructive' : ''}
                        />
                        {errors.location && <p className="text-sm text-destructive mt-1">{errors.location}</p>}
                      </div>

                      <div>
                        <Label htmlFor="timeline" className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> Timeline *
                        </Label>
                        {/* ✅ FIX: proper mobile-friendly select with full width and touch target */}
                        <select
                          id="timeline"
                          value={timeline}
                          onChange={e => setTimeline(e.target.value)}
                          className={cn(
                            'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm',
                            'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                            'appearance-none cursor-pointer',
                            errors.timeline ? 'border-destructive' : 'border-input'
                          )}
                        >
                          <option value="">Select timeline</option>
                          {TIMELINES.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        {errors.timeline && <p className="text-sm text-destructive mt-1">{errors.timeline}</p>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Step 1: Current Space ── */}
              {step === 1 && (
                <motion.div key="step-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
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
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={e => handleCurrentPhotos(Array.from(e.target.files || []))}
                      className="hidden"
                      id="current-upload"
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
                      <p className="text-sm text-muted-foreground">
                        Tap to select photos (multiple allowed)
                      </p>
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
                              onClick={() => setCurrentPhotos(prev => prev.filter((_, idx) => idx !== i))}
                              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-500/10 rounded-lg">
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
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={e => handleInspirationPhotos(Array.from(e.target.files || []))}
                      className="hidden"
                      id="inspiration-upload"
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
                              onClick={() => setInspirationPhotos(prev => prev.filter((_, idx) => idx !== i))}
                              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                      id="notes"
                      value={inspirationNotes}
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
                  <h2 className="text-xl sm:text-2xl font-semibold mb-6">Budget & Style Preferences</h2>

                  {/* ✅ FIX: budgetValue is a number, passed as [budgetValue] array to Slider */}
                  <div>
                    <Label>Budget: <span className="text-primary font-bold">{formatCurrency(budgetValue)}</span></Label>
                    <Slider
                      value={[budgetValue]}
                      onValueChange={(vals) => setBudgetValue(vals[0])}
                      min={50000}
                      max={5000000}
                      step={50000}
                      className="my-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>KSh 50,000</span>
                      <span>KSh 5,000,000</span>
                    </div>
                    {errors.budget && <p className="text-sm text-destructive mt-1">{errors.budget}</p>}
                  </div>

                  {/* ✅ FIX: style toggle uses useCallback, no inline function causing re-renders */}
                  <div>
                    <Label>Design Styles (select at least one) *</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                      {STYLES.map(style => {
                        const selected = selectedStyles.includes(style);
                        return (
                          <button
                            key={style}
                            type="button"
                            onClick={() => toggleStyle(style)}
                            className={cn(
                              'p-4 border rounded-lg text-left transition-all text-sm font-medium flex items-center gap-2',
                              selected
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border hover:border-primary/50 text-foreground'
                            )}
                          >
                            <div className={cn(
                              'w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors',
                              selected ? 'bg-primary border-primary' : 'border-muted-foreground'
                            )}>
                              {selected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            {style}
                          </button>
                        );
                      })}
                    </div>
                    {errors.styles && <p className="text-sm text-destructive mt-1">{errors.styles}</p>}
                  </div>
                </motion.div>
              )}

              {/* ── Step 4: Contact ── */}
              {step === 4 && (
                <motion.div key="step-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-6">Contact Information</h2>

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

                  <div className="bg-muted/50 p-4 rounded-lg space-y-1 text-sm text-muted-foreground">
                    <h3 className="font-semibold text-foreground mb-2">Review Your Project</h3>
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

            {/* Navigation */}
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