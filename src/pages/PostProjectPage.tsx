// src/pages/PostProjectPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ArrowRight, ArrowLeft, Check, Loader2, MapPin, Calendar, Lightbulb, Camera, X } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';

import { Layout } from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/data/MockData';
import { api } from '@/services/api';

const steps = [
  { label: 'Details',     short: '1' },
  { label: 'Before',      short: '2' },
  { label: 'Vision',      short: '3' },
  { label: 'Budget',      short: '4' },
  { label: 'Contact',     short: '5' },
];

const STYLES   = ['Modern', 'African Fusion', 'Minimalist', 'Luxury', 'Bohemian', 'Coastal', 'Budget-Friendly'];
const TIMELINES = ['1-2 weeks', '2-4 weeks', '1-2 months', '2-3 months', '3+ months', 'Flexible'];

export default function PostProjectPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { userId, getToken, isLoaded } = useAuth();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();

  const prefilled = location.state as {
    roomType?: string; budgetMin?: number; budgetMax?: number;
    style?: string; designerId?: string;
  } | null;
  const suggestedDesignerId = prefilled?.designerId;

  // ── Form state ──────────────────────────────────────────────────────────────
  const [step, setStep]           = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const [title, setTitle]                   = useState(prefilled?.roomType ? `${prefilled.roomType} Design Project` : '');
  const [description, setDescription]       = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [timeline, setTimeline]             = useState('');

  const [beforePhotos, setBeforePhotos]         = useState<string[]>([]);
  const [uploadingBefore, setUploadingBefore]   = useState(false);
  const [inspirationPhotos, setInspirationPhotos] = useState<string[]>([]);
  const [inspirationNotes, setInspirationNotes] = useState('');
  const [uploadingInspiration, setUploadingInspiration] = useState(false);

  const [budget, setBudget]           = useState<number[]>(
    prefilled ? [Math.round(((prefilled.budgetMin ?? 500000) + (prefilled.budgetMax ?? 500000)) / 2)] : [500000]
  );
  const [selectedStyles, setSelectedStyles] = useState<string[]>(prefilled?.style ? [prefilled.style] : []);

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

  const toggleStyle = (s: string) =>
    setSelectedStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateStep = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!title.trim())           e.title       = 'Project title is required';
      if (!description.trim())     e.description = 'Description is required';
      if (!projectLocation.trim()) e.location    = 'Location is required';
      if (!timeline)               e.timeline    = 'Timeline is required';
    }
    if (s === 3 && selectedStyles.length === 0) e.styles = 'Select at least one style';
    if (s === 4) {
      if (!name.trim())                        e.name  = 'Name is required';
      if (!email.trim())                       e.email = 'Email is required';
      if (!/\S+@\S+\.\S+/.test(email))        e.email = 'Invalid email format';
      if (!phone.trim())                       e.phone = 'Phone number is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Photo uploads ───────────────────────────────────────────────────────────
  const handleBeforePhotos = async (files: File[]) => {
    setUploadingBefore(true);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('images', f));
      const res = await api.uploadProjectImages(fd);
      setBeforePhotos(prev => [...prev, ...res.urls]);
    } catch { alert('Failed to upload before photos'); }
    finally { setUploadingBefore(false); }
  };

  const handleInspirationPhotos = async (files: File[]) => {
    setUploadingInspiration(true);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('images', f));
      const res = await api.uploadProjectImages(fd);
      setInspirationPhotos(prev => [...prev, ...res.urls]);
    } catch { alert('Failed to upload inspiration photos'); }
    finally { setUploadingInspiration(false); }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token) { navigate('/sign-in'); return; }

      const res = await api.createProject({
        title, description, location: projectLocation, budget: budget[0],
        timeline, styles: selectedStyles,
        photos: [...beforePhotos, ...inspirationPhotos],
        beforePhotos, inspirationPhotos, inspirationNotes,
        client: { clerkId: userId, name, email, phone },
      }, token);

      if (res.success) {
        if (suggestedDesignerId) {
          try {
            await fetch('http://localhost:5000/api/invites', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ projectId: res.project._id, designerId: suggestedDesignerId }),
            });
          } catch { /* non-fatal */ }
        }
        navigate('/success', { state: { message: suggestedDesignerId ? 'Project posted & designer invited!' : 'Project posted successfully!', projectTitle: title } });
      }
    } catch { alert('Failed to submit project. Please try again.'); }
    finally { setSubmitting(false); }
  };

  // ── Guards ──────────────────────────────────────────────────────────────────
  if (!isLoaded || !userLoaded) return (
    <Layout><div className="flex justify-center items-center min-h-screen">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div></Layout>
  );
  if (!userId) return (
    <Layout>
      <div className="container mx-auto py-32 text-center px-4">
        <h1 className="font-display text-3xl font-bold mb-4">Please Sign In</h1>
        <Button size="lg" onClick={() => navigate('/sign-in')}>Sign In</Button>
      </div>
    </Layout>
  );

  const progress = ((step + 1) / steps.length) * 100;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Layout hideFooter>
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-6 lg:py-12">

          {/* ── Stepper ── */}
          <div className="mb-6 lg:mb-8">
            {/* Mobile: progress bar + current step label */}
            <div className="sm:hidden mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">
                  {steps[step].label}
                </span>
                <span className="text-sm text-muted-foreground">
                  {step + 1} / {steps.length}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                />
              </div>
              {/* Dot row on mobile */}
              <div className="flex items-center justify-center gap-2 mt-3">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'rounded-full transition-all duration-300',
                      i === step   ? 'w-6 h-2 bg-primary' :
                      i < step     ? 'w-2 h-2 bg-primary/50' :
                                     'w-2 h-2 bg-muted-foreground/20'
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Desktop: full labelled stepper */}
            <div className="hidden sm:block">
              <div className="flex items-center justify-between mb-3">
                {steps.map((s, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                    <div className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2',
                      i < step  ? 'bg-primary border-primary text-primary-foreground' :
                      i === step ? 'bg-primary border-primary text-primary-foreground ring-4 ring-primary/20' :
                                   'bg-background border-border text-muted-foreground'
                    )}>
                      {i < step ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={cn(
                      'text-xs font-medium text-center leading-tight',
                      i <= step ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
              {/* Connector line */}
              <div className="relative h-1.5 bg-muted rounded-full overflow-hidden mx-4">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                />
              </div>
            </div>
          </div>

          {/* ── Invite notice ── */}
          {suggestedDesignerId && (
            <div className="mb-4 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
              <span>📩</span>
              <span><strong>Direct Invite:</strong> This designer will be notified when you submit.</span>
            </div>
          )}

          {/* ── Step card ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="bg-card rounded-2xl border border-border/60 shadow-lg p-5 sm:p-7 lg:p-10"
            >

              {/* ── Step 0: Project Details ── */}
              {step === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">Tell us about your project</h2>
                    <p className="text-muted-foreground">Give designers a clear idea of what you're looking for</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold">Project Title *</Label>
                    <Input
                      placeholder="e.g., Modern Living Room Makeover in Westlands"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className={cn('h-11', errors.title && 'border-destructive')}
                    />
                    {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold">Description *</Label>
                    <Textarea
                      placeholder="Describe your vision, what you like/dislike about your current space..."
                      rows={5}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className={cn('resize-none', errors.description && 'border-destructive')}
                    />
                    {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> Location *
                      </Label>
                      <Input
                        placeholder="e.g., Westlands, Nairobi"
                        value={projectLocation}
                        onChange={e => setProjectLocation(e.target.value)}
                        className={cn('h-11', errors.location && 'border-destructive')}
                      />
                      {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" /> Timeline *
                      </Label>
                      <select
                        value={timeline}
                        onChange={e => setTimeline(e.target.value)}
                        className={cn(
                          'w-full h-11 px-3 rounded-lg border bg-background text-sm',
                          errors.timeline ? 'border-destructive' : 'border-input'
                        )}
                      >
                        <option value="">Select timeline</option>
                        {TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {errors.timeline && <p className="text-sm text-destructive">{errors.timeline}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 1: Before Photos ── */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Camera className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl sm:text-3xl font-bold mb-1">Show us your current space</h2>
                      <p className="text-muted-foreground text-sm sm:text-base">
                        Upload photos of your space as it is now. Helps designers understand the transformation needed.
                      </p>
                    </div>
                  </div>

                  {/* Upload zone */}
                  <div className="relative">
                    <input
                      type="file" multiple accept="image/*" id="before-upload"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                      disabled={uploadingBefore}
                      onChange={e => handleBeforePhotos(Array.from(e.target.files || []))}
                    />
                    <div className="border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/3 transition-all rounded-2xl p-8 sm:p-12 text-center">
                      {uploadingBefore ? (
                        <><Loader2 className="w-10 h-10 mx-auto animate-spin text-primary mb-3" /><p className="font-medium">Uploading…</p></>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                          <p className="font-semibold mb-1">Click or drag to upload</p>
                          <p className="text-sm text-muted-foreground mb-4">PNG, JPG up to 10MB • Multiple angles recommended</p>
                          <Button size="sm" variant="outline" type="button" className="pointer-events-none">Choose Photos</Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Preview grid */}
                  {beforePhotos.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">{beforePhotos.length} photo{beforePhotos.length > 1 ? 's' : ''} uploaded</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {beforePhotos.map((url, i) => (
                          <div key={i} className="relative group aspect-square rounded-xl overflow-hidden">
                            <img src={url} alt={`Before ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setBeforePhotos(p => p.filter((_, j) => j !== i))}
                              className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-primary/5 border border-primary/15 text-sm">
                    <span className="text-base flex-shrink-0">💡</span>
                    <p className="text-muted-foreground"><strong className="text-foreground">Tip:</strong> Include wide shots + close-ups of problem areas to help designers give accurate proposals.</p>
                  </div>
                </div>
              )}

              {/* ── Step 2: Inspiration / Vision ── */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl sm:text-3xl font-bold mb-1">Share your vision</h2>
                      <p className="text-muted-foreground text-sm sm:text-base">
                        Inspiration photos or reference images of what you want to achieve — optional but very helpful!
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold">What inspires you? <span className="font-normal text-muted-foreground">(optional)</span></Label>
                    <Textarea
                      placeholder="Describe your dream space… mood, colors, specific elements. Any Pinterest boards or Instagram accounts you love?"
                      rows={4}
                      value={inspirationNotes}
                      onChange={e => setInspirationNotes(e.target.value)}
                      className="resize-none"
                    />
                  </div>

                  {/* Upload zone */}
                  <div className="relative">
                    <input
                      type="file" multiple accept="image/*" id="inspiration-upload"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                      disabled={uploadingInspiration}
                      onChange={e => handleInspirationPhotos(Array.from(e.target.files || []))}
                    />
                    <div className="border-2 border-dashed border-secondary/30 hover:border-secondary/60 hover:bg-secondary/3 transition-all rounded-2xl p-8 sm:p-12 text-center">
                      {uploadingInspiration ? (
                        <><Loader2 className="w-10 h-10 mx-auto animate-spin text-secondary mb-3" /><p className="font-medium">Uploading…</p></>
                      ) : (
                        <>
                          <Lightbulb className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                          <p className="font-semibold mb-1">Add inspiration photos</p>
                          <p className="text-sm text-muted-foreground mb-4">Screenshots from Pinterest, magazines, Instagram, etc.</p>
                          <Button size="sm" variant="outline" type="button" className="pointer-events-none">Choose Photos</Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Preview grid */}
                  {inspirationPhotos.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">{inspirationPhotos.length} inspiration{inspirationPhotos.length > 1 ? 's' : ''} added</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {inspirationPhotos.map((url, i) => (
                          <div key={i} className="relative group aspect-square rounded-xl overflow-hidden">
                            <img src={url} alt={`Inspiration ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setInspirationPhotos(p => p.filter((_, j) => j !== i))}
                              className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-secondary/5 border border-secondary/15 text-sm">
                    <span className="text-base flex-shrink-0">✨</span>
                    <p className="text-muted-foreground"><strong className="text-foreground">Pro Tip:</strong> This step is optional, but sharing inspiration photos helps designers match your aesthetic perfectly.</p>
                  </div>
                </div>
              )}

              {/* ── Step 3: Budget & Style ── */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">Budget & Style</h2>
                    <p className="text-muted-foreground">Helps match you with the right designers</p>
                  </div>

                  {/* Budget slider */}
                  <div className="p-5 rounded-2xl bg-primary/5 border border-primary/15 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">Your Budget</Label>
                      <span className="font-display text-2xl font-bold text-primary">{formatCurrency(budget[0])}</span>
                    </div>
                    <Slider value={budget} onValueChange={setBudget} min={50000} max={5000000} step={50000} className="py-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>KSh 50,000</span>
                      <span>KSh 5,000,000+</span>
                    </div>
                  </div>

                  {/* Style selection */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">Preferred Styles *</Label>
                      <span className="text-xs text-muted-foreground">Select all that apply</span>
                    </div>
                    {errors.styles && <p className="text-sm text-destructive">{errors.styles}</p>}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {STYLES.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleStyle(s)}
                          className={cn(
                            'flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all text-sm font-medium',
                            selectedStyles.includes(s)
                              ? 'border-primary bg-primary/8 text-primary'
                              : 'border-border hover:border-primary/40 bg-card text-foreground'
                          )}
                        >
                          <div className={cn(
                            'w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors',
                            selectedStyles.includes(s) ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                          )}>
                            {selectedStyles.includes(s) && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 4: Contact ── */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">Almost there!</h2>
                    <p className="text-muted-foreground">Designers will use this to send personalized proposals</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">Full Name</Label>
                      <Input value={name} disabled className="bg-muted h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Email</Label>
                      <Input value={email} disabled className="bg-muted h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Phone Number *</Label>
                      <Input
                        type="tel"
                        placeholder="+254 712 345 678"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className={cn('h-11', errors.phone && 'border-destructive')}
                      />
                      {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Summary card */}
                  <div className="rounded-2xl border border-border/60 bg-muted/30 p-5">
                    <p className="font-semibold mb-4">📋 Project Summary</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                      {[
                        { label: 'Title',    value: title },
                        { label: 'Location', value: projectLocation },
                        { label: 'Budget',   value: formatCurrency(budget[0]) },
                        { label: 'Timeline', value: timeline },
                        { label: 'Styles',   value: selectedStyles.join(', ') || '—' },
                        { label: 'Photos',   value: `${beforePhotos.length} before · ${inspirationPhotos.length} inspiration` },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                          <p className="font-medium leading-snug">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Navigation ── */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/60 gap-3">
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setStep(s => Math.max(0, s - 1))}
                  disabled={step === 0 || submitting}
                  className="gap-1.5 min-w-[90px] sm:min-w-[110px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>

                {step < steps.length - 1 ? (
                  <Button
                    size="default"
                    onClick={() => { if (validateStep(step)) setStep(s => s + 1); }}
                    className="gap-1.5 min-w-[90px] sm:min-w-[110px]"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    size="default"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="gap-1.5 min-w-[140px] sm:min-w-[160px]"
                  >
                    {submitting
                      ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</>
                      : <><Check className="w-4 h-4" />Submit Project</>
                    }
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}