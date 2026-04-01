// src/pages/BecomeDesignerPage.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Layout } from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Loader2, CheckCircle2, Sparkles, X, Calendar, AlertCircle,
  Briefcase, Users, TrendingUp, Shield, IdCard, UserPlus, Instagram,
  Globe, Link2, ChevronDown, ChevronUp, Upload, ImagePlus, Trash2,
  ArrowRight, ArrowLeft, CheckCircle, Clock, XCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const DESIGN_STYLES = [
  'Modern', 'African Fusion', 'Minimalist', 'Luxury',
  'Bohemian', 'Coastal', 'Budget-Friendly', 'Industrial',
  'Scandinavian', 'Art Deco', 'Contemporary', 'Traditional'
];

const BENEFITS = [
  { icon: Users, title: 'Direct Client Access', desc: 'Connect with clients actively seeking designers' },
  { icon: TrendingUp, title: 'Grow Your Business', desc: 'Showcase your work and build your reputation' },
  { icon: Shield, title: 'Verified Platform', desc: 'Work with confidence on a trusted marketplace' },
  { icon: Briefcase, title: 'Manage Projects', desc: 'Track proposals, projects, and earnings in one place' },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProjectPair {
  id: string;
  before: { file: File | null; url: string; uploading: boolean; preview: string };
  after:  { file: File | null; url: string; uploading: boolean; preview: string };
  label: string;
}

const emptyPair = (id: string, label: string): ProjectPair => ({
  id,
  label,
  before: { file: null, url: '', uploading: false, preview: '' },
  after:  { file: null, url: '', uploading: false, preview: '' },
});

// ─── ImageDropZone ────────────────────────────────────────────────────────────
interface ImageDropZoneProps {
  label: 'before' | 'after';
  slot: ProjectPair['before'];
  onFile: (file: File) => void;
  onClear: () => void;
  accent: string;
}

function ImageDropZone({ label, slot, onFile, onClear, accent }: ImageDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onFile(file);
  }, [onFile]);

  const colorMap = {
    before: 'border-amber-300 bg-amber-50/60 dark:bg-amber-950/20',
    after:  'border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/20',
  };
  const labelMap = {
    before: { text: 'BEFORE', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
    after:  { text: 'AFTER',  badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className={cn(
          'text-xs font-bold px-2 py-0.5 rounded border',
          labelMap[label].badge
        )}>
          {labelMap[label].text}
        </span>
        <span className="text-xs text-muted-foreground">
          {label === 'before' ? 'Original space' : 'Transformed result'}
        </span>
      </div>

      {slot.preview ? (
        <div className="relative group rounded-xl overflow-hidden aspect-[4/3] bg-muted border border-border">
          <img src={slot.preview} alt={label} className="w-full h-full object-cover" />
          {slot.uploading && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
              <span className="text-white text-xs font-medium">Uploading…</span>
            </div>
          )}
          {slot.url && !slot.uploading && (
            <div className="absolute top-2 right-2">
              <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Uploaded
              </span>
            </div>
          )}
          {!slot.uploading && (
            <button
              type="button"
              onClick={onClear}
              className="absolute top-2 left-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all',
            colorMap[label],
            dragging && 'scale-[1.02] border-solid shadow-lg',
            'hover:opacity-90'
          )}
        >
          <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
            <ImagePlus className="w-5 h-5 text-muted-foreground" />
          </div>
          {/* Hide secondary text on very small screens to avoid overflow */}
          <p className="text-xs font-medium text-muted-foreground text-center px-2">
            Click or drag & drop
          </p>
          <p className="hidden sm:block text-[10px] text-muted-foreground/70">JPG, PNG, WEBP — max 10MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BecomeDesignerPage() {
  const navigate = useNavigate();
  const { userId, getToken, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { toast } = useToast();

  const isLoaded = isAuthLoaded && isUserLoaded;

  const [checking, setChecking]       = useState(true);
  const [existingStatus, setExistingStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [submitting, setSubmitting]   = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  // Before/after project pairs — minimum 2, up to 4
  const [projects, setProjects] = useState<ProjectPair[]>([
    emptyPair('p1', 'Project 1'),
    emptyPair('p2', 'Project 2'),
  ]);

  const [formData, setFormData] = useState({
    idNumber: '',
    location: '',
    about: '',
    selectedStyles: [] as string[],
    startingPrice: 250000,
    responseTime: 'Within 24 hours',
    references: [
      { name: '', email: '', relation: '' },
      { name: '', email: '', relation: '' },
      { name: '', email: '', relation: '' },
    ],
    calendlyLink: '',
    socialLinks: { instagram: '', pinterest: '', website: '' },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Check existing status ──────────────────────────────────────────────────
  useEffect(() => {
    const check = async () => {
      if (!userId || !isLoaded) return;
      try {
        const token = await getToken();
        const res = await fetch('https://hudumalink-backend.onrender.com/api/users/designer-status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setExistingStatus(data.status);
      } catch {
        console.error('Status check failed');
      } finally {
        setChecking(false);
      }
    };
    if (isLoaded) check();
  }, [userId, isLoaded, getToken]);

  // ── Image upload helper ────────────────────────────────────────────────────
  const uploadImage = async (file: File, projectId: string, side: 'before' | 'after') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setProjects(prev => prev.map(p =>
        p.id !== projectId ? p : {
          ...p,
          [side]: { ...p[side], preview: e.target?.result as string, uploading: true },
        }
      ));
    };
    reader.readAsDataURL(file);

    try {
      const token = await getToken();
      const formDataUpload = new FormData();
      formDataUpload.append('images', file);

      const res = await fetch('https://hudumalink-backend.onrender.com/api/upload/portfolio-images', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });

      const data = await res.json();

      if (data.success && data.urls?.[0]) {
        setProjects(prev => prev.map(p =>
          p.id !== projectId ? p : {
            ...p,
            [side]: { ...p[side], url: data.urls[0], uploading: false, file },
          }
        ));
      } else {
        throw new Error('Upload failed');
      }
    } catch {
      toast({ title: 'Upload failed', description: 'Could not upload image. Try again.', variant: 'destructive' });
      setProjects(prev => prev.map(p =>
        p.id !== projectId ? p : {
          ...p,
          [side]: { file: null, url: '', uploading: false, preview: '' },
        }
      ));
    }
  };

  const clearImage = (projectId: string, side: 'before' | 'after') => {
    setProjects(prev => prev.map(p =>
      p.id !== projectId ? p : {
        ...p,
        [side]: { file: null, url: '', uploading: false, preview: '' },
      }
    ));
  };

  const addProject = () => {
    if (projects.length >= 4) return;
    const id = `p${Date.now()}`;
    setProjects(prev => [...prev, emptyPair(id, `Project ${prev.length + 1}`)]);
  };

  const removeProject = (id: string) => {
    if (projects.length <= 2) return;
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const toggleStyle = (style: string) => {
    setFormData(prev => ({
      ...prev,
      selectedStyles: prev.selectedStyles.includes(style)
        ? prev.selectedStyles.filter(s => s !== style)
        : [...prev.selectedStyles, style],
    }));
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    const e: Record<string, string> = {};

    if (!formData.idNumber.trim()) e.idNumber = 'National ID number is required';
    else if (formData.idNumber.length < 7) e.idNumber = 'Please enter a valid ID number';
    if (!formData.location.trim()) e.location = 'Location is required';
    if (!formData.about.trim()) e.about = 'About section is required';
    if (formData.about.length < 150) e.about = 'Please write at least 150 characters';
    if (formData.selectedStyles.length === 0) e.styles = 'Select at least one design style';
    if (formData.startingPrice < 50000) e.startingPrice = 'Minimum starting price is KSh 50,000';

    const completePairs = projects.filter(p => p.before.url && p.after.url);
    if (completePairs.length < 2) {
      e.portfolio = 'Upload at least 2 complete project pairs (before & after for each)';
    }

    const stillUploading = projects.some(p => p.before.uploading || p.after.uploading);
    if (stillUploading) e.portfolio = 'Please wait for all images to finish uploading';

    const validRefs = formData.references.filter(r => r.name.trim() && r.email.trim() && r.relation.trim());
    if (validRefs.length < 2) e.references = 'At least 2 complete references are required';
    formData.references.forEach((ref, i) => {
      if (ref.email && !/\S+@\S+\.\S+/.test(ref.email)) e[`ref${i}Email`] = 'Invalid email format';
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: 'Form incomplete', description: 'Fix the errors highlighted below', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();

      const portfolioImages: string[] = [];
      projects.forEach(p => {
        if (p.before.url) portfolioImages.push(p.before.url);
        if (p.after.url)  portfolioImages.push(p.after.url);
      });

      const validRefs = formData.references.filter(r => r.name.trim() && r.email.trim() && r.relation.trim());
      const socialLinks: any = {};
      if (formData.socialLinks.instagram) socialLinks.instagram = formData.socialLinks.instagram;
      if (formData.socialLinks.pinterest) socialLinks.pinterest = formData.socialLinks.pinterest;
      if (formData.socialLinks.website)   socialLinks.website   = formData.socialLinks.website;

      const res = await fetch('https://hudumalink-backend.onrender.com/api/users/apply-designer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          idNumber:      formData.idNumber.trim(),
          location:      formData.location.trim(),
          about:         formData.about.trim(),
          styles:        formData.selectedStyles,
          startingPrice: formData.startingPrice,
          responseTime:  formData.responseTime,
          portfolioImages,
          references:    validRefs,
          calendlyLink:  formData.calendlyLink.trim() || undefined,
          socialLinks:   Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({ title: '✅ Application submitted!', description: "We'll review within 24-48 hours" });
        navigate('/designer/application-pending');
      } else {
        throw new Error(data.error || 'Application failed');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Submission failed. Try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Early-exit states ──────────────────────────────────────────────────────
  if (!isLoaded || checking) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground font-medium">Loading…</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!userId) {
    return (
      <Layout>
        <StatusScreen
          icon={<AlertCircle className="w-10 h-10 text-muted-foreground" />}
          iconBg="bg-muted"
          title="Sign in required"
          description="You need to be signed in to apply as a designer."
          action={<Button size="lg" onClick={() => navigate('/sign-in')}>Sign in to continue</Button>}
        />
      </Layout>
    );
  }

  if (existingStatus === 'pending') {
    return (
      <Layout>
        <StatusScreen
          icon={<Clock className="w-10 h-10 text-amber-600" />}
          iconBg="bg-amber-50 border-2 border-amber-200"
          title="Application under review"
          description="Your application is being reviewed. We'll notify you via email within 24-48 hours."
          action={<Button variant="outline" onClick={() => navigate('/')}>Return home</Button>}
        />
      </Layout>
    );
  }

  if (existingStatus === 'rejected') {
    return (
      <Layout>
        <StatusScreen
          icon={<XCircle className="w-10 h-10 text-red-600" />}
          iconBg="bg-red-50 border-2 border-red-200"
          title="Application not approved"
          description="Your application wasn't approved. Please contact support for details."
          action={<Button variant="outline" onClick={() => navigate('/')}>Return home</Button>}
        />
      </Layout>
    );
  }

  // ── Portfolio progress indicator ───────────────────────────────────────────
  const completePairs   = projects.filter(p => p.before.url && p.after.url).length;
  const uploadingCount  = projects.filter(p => p.before.uploading || p.after.uploading).length;

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">

        {/* ── Hero ── */}
        {/* MOBILE: reduced top padding (pt-16 → pt-20 on sm), smaller text sizes */}
        <section className="container mx-auto px-4 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-10 sm:pb-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6 ring-1 ring-primary/20">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              Join Kenya's Premier Design Marketplace
            </div>
            {/* MOBILE: smaller heading (text-3xl → scales up) */}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Become a Verified Designer
            </h1>
            {/* MOBILE: smaller body text */}
            <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Connect with high-value clients, showcase your portfolio, and grow your interior design business on Kenya's most trusted platform.
            </p>
          </div>
        </section>

        {/* ── Benefits ── */}
        {/* MOBILE: 1 col → 2 col on sm → 4 col on lg */}
        <section className="container mx-auto px-4 lg:px-8 pb-10 sm:pb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-6xl mx-auto">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="p-3 sm:p-6 text-center hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/20 group">
                <div className="w-10 h-10 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-4 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
                </div>
                <h3 className="font-bold mb-1 sm:mb-2 text-xs sm:text-base leading-tight">{title}</h3>
                <p className="hidden sm:block text-xs sm:text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Form ── */}
        <section className="container mx-auto px-4 lg:px-8 pb-16 sm:pb-24">
          {/* MOBILE: reduced padding (p-4 sm:p-8 lg:p-12) */}
          <Card className="max-w-5xl mx-auto p-4 sm:p-8 lg:p-12 shadow-xl border-border/50">
            <div className="mb-6 sm:mb-10">
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Designer Application</h2>
              <p className="text-muted-foreground text-sm sm:text-lg">
                Complete all required fields. We verify each application to maintain platform quality.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">

              {/* ── National ID ── */}
              <FormSection label="National ID Number *" icon={<IdCard className="w-4 h-4" />} hint="Required for identity verification. Kept confidential." error={errors.idNumber}>
                <Input
                  placeholder="Enter your national ID number"
                  value={formData.idNumber}
                  onChange={e => setFormData({ ...formData, idNumber: e.target.value })}
                  className={cn('h-11 sm:h-12', errors.idNumber && 'border-destructive')}
                />
              </FormSection>

              {/* ── Location ── */}
              <FormSection label="Primary Location *" error={errors.location}>
                <Input
                  placeholder="e.g., Westlands, Nairobi"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className={cn('h-11 sm:h-12', errors.location && 'border-destructive')}
                />
              </FormSection>

              {/* ── About ── */}
              <FormSection
                label={`About Your Design Practice * (${formData.about.length}/800 chars, min 150)`}
                hint="This appears on your public profile. Be specific and authentic."
                error={errors.about}
              >
                <Textarea
                  rows={6}
                  maxLength={800}
                  placeholder="Share your design philosophy, years of experience, notable projects, unique approach, and what sets you apart..."
                  value={formData.about}
                  onChange={e => setFormData({ ...formData, about: e.target.value })}
                  className={cn('resize-none leading-relaxed', errors.about && 'border-destructive')}
                />
              </FormSection>

              {/* ── Design Styles ── */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label className="text-sm sm:text-base font-semibold">Design Styles You Specialize In *</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Select all that apply</p>
                </div>
                {errors.styles && <ErrorText>{errors.styles}</ErrorText>}
                {/* MOBILE: 2 cols always, 3 on md, 4 on lg */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  {DESIGN_STYLES.map(style => {
                    const selected = formData.selectedStyles.includes(style);
                    return (
                      <div
                        key={style}
                        onClick={() => toggleStyle(style)}
                        className={cn(
                          'flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl border-2 cursor-pointer transition-all select-none',
                          selected
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-border hover:border-primary/40 hover:bg-accent/5'
                        )}
                      >
                        <div className={cn(
                          'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                          selected ? 'bg-primary border-primary' : 'border-input'
                        )}>
                          {selected && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                              <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs sm:text-sm font-medium">{style}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Portfolio: Before & After ── */}
              <div className="space-y-4 sm:space-y-6">
                {/* MOBILE: stack label and badge vertically on small screens */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <Label className="text-sm sm:text-base font-semibold flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Portfolio Projects * — Before &amp; After
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Upload real before &amp; after photos for at least 2 projects. Both images required per project.
                    </p>
                  </div>
                  {/* Progress badge — full width on mobile, auto on sm+ */}
                  <div className={cn(
                    'self-start sm:shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold',
                    completePairs >= 2
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-100 text-amber-700 border border-amber-200'
                  )}>
                    {completePairs >= 2
                      ? <CheckCircle className="w-3.5 h-3.5" />
                      : <Clock className="w-3.5 h-3.5" />}
                    {completePairs}/2 minimum
                  </div>
                </div>

                {errors.portfolio && <ErrorText>{errors.portfolio}</ErrorText>}

                {uploadingCount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-primary bg-primary/5 border border-primary/20 px-4 py-2.5 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading {uploadingCount} image{uploadingCount > 1 ? 's' : ''}…
                  </div>
                )}

                <div className="space-y-4 sm:space-y-6">
                  {projects.map((project, idx) => (
                    <div key={project.id} className="rounded-2xl border-2 border-border/60 bg-muted/20 overflow-hidden">
                      {/* Project header */}
                      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border/50 bg-background/60">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                            project.before.url && project.after.url
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-muted text-muted-foreground'
                          )}>
                            {project.before.url && project.after.url
                              ? <CheckCircle className="w-4 h-4" />
                              : idx + 1}
                          </div>
                          <span className="font-semibold text-sm">{project.label}</span>
                          {idx < 2 && (
                            <span className="text-[10px] font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                        {projects.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeProject(project.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Before / After grid */}
                      {/* MOBILE: stack before/after vertically, side-by-side from sm+ */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-5">
                        <ImageDropZone
                          label="before"
                          slot={project.before}
                          onFile={(file) => uploadImage(file, project.id, 'before')}
                          onClear={() => clearImage(project.id, 'before')}
                          accent="amber"
                        />
                        {/* MOBILE: show a small arrow between stacked images */}
                        <div className="flex sm:hidden items-center justify-center gap-2 text-xs text-muted-foreground -my-1">
                          <div className="h-px flex-1 bg-border" />
                          <span className="flex items-center gap-1 opacity-50">
                            <ArrowRight className="w-3 h-3" /> transformation
                          </span>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                        <ImageDropZone
                          label="after"
                          slot={project.after}
                          onFile={(file) => uploadImage(file, project.id, 'after')}
                          onClear={() => clearImage(project.id, 'after')}
                          accent="emerald"
                        />
                      </div>

                      {/* Arrow connector visual — desktop only */}
                      <div className="hidden sm:flex items-center justify-center pb-2 gap-3 text-xs text-muted-foreground">
                        <ArrowLeft className="w-3 h-3 opacity-40" />
                        <span className="opacity-50">transformation</span>
                        <ArrowRight className="w-3 h-3 opacity-40" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add project button */}
                {projects.length < 4 && (
                  <button
                    type="button"
                    onClick={addProject}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <ImagePlus className="w-4 h-4" />
                    Add another project (optional, up to 4)
                  </button>
                )}

                <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  💡 <strong>Tip:</strong> Use high-quality, genuine project photos. Before/after pairs showing clear transformations make the strongest impression. Avoid stock images — they'll be flagged.
                </p>
              </div>

              {/* ── References ── */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Professional References * (Minimum 2)
                  </Label>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Previous clients, colleagues, or mentors who can vouch for your work
                  </p>
                </div>
                {errors.references && <ErrorText>{errors.references}</ErrorText>}
                <div className="space-y-3 sm:space-y-4">
                  {formData.references.map((ref, i) => (
                    <Card key={i} className="p-4 sm:p-5 bg-muted/30 border-dashed">
                      <h4 className="font-semibold mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                        Reference {i + 1}
                        {i < 2 && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Required</span>}
                      </h4>
                      {/* MOBILE: 1 col → 3 col on md */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs sm:text-sm">Full Name</Label>
                          <Input
                            placeholder="Mark Otieno"
                            value={ref.name}
                            onChange={e => {
                              const refs = [...formData.references];
                              refs[i].name = e.target.value;
                              setFormData({ ...formData, references: refs });
                            }}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs sm:text-sm">Email Address</Label>
                          <Input
                            type="email"
                            placeholder="mark@example.com"
                            value={ref.email}
                            onChange={e => {
                              const refs = [...formData.references];
                              refs[i].email = e.target.value;
                              setFormData({ ...formData, references: refs });
                            }}
                            className={cn('h-10', errors[`ref${i}Email`] && 'border-destructive')}
                          />
                          {errors[`ref${i}Email`] && (
                            <p className="text-xs text-destructive">{errors[`ref${i}Email`]}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs sm:text-sm">Relationship</Label>
                          <Input
                            placeholder="e.g., Former Client"
                            value={ref.relation}
                            onChange={e => {
                              const refs = [...formData.references];
                              refs[i].relation = e.target.value;
                              setFormData({ ...formData, references: refs });
                            }}
                            className="h-10"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* ── Pricing & Response ── */}
              {/* MOBILE: stack to 1 col, side-by-side from md */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <FormSection label="Starting Price (KSh) *" hint="Minimum budget you'll accept" error={errors.startingPrice}>
                  <Input
                    type="number"
                    min="50000"
                    step="10000"
                    value={formData.startingPrice}
                    onChange={e => setFormData({ ...formData, startingPrice: parseInt(e.target.value) || 0 })}
                    className={cn('h-11 sm:h-12', errors.startingPrice && 'border-destructive')}
                  />
                </FormSection>

                <FormSection label="Typical Response Time *" hint="How quickly you respond to new inquiries">
                  <select
                    value={formData.responseTime}
                    onChange={e => setFormData({ ...formData, responseTime: e.target.value })}
                    className="w-full h-11 sm:h-12 px-4 rounded-lg border bg-background text-foreground text-sm"
                  >
                    <option>Within 1 hour</option>
                    <option>Within 3 hours</option>
                    <option>Within 24 hours</option>
                    <option>1-2 days</option>
                    <option>2-3 days</option>
                  </select>
                </FormSection>
              </div>

              {/* ── Optional (collapsible) ── */}
              <div className="border-t pt-6 sm:pt-8">
                <button
                  type="button"
                  onClick={() => setShowOptional(!showOptional)}
                  className="flex items-center gap-2 text-base sm:text-lg font-semibold mb-3 sm:mb-4 hover:text-primary transition group w-full text-left"
                >
                  {showOptional
                    ? <ChevronUp className="w-5 h-5 group-hover:text-primary shrink-0" />
                    : <ChevronDown className="w-5 h-5 group-hover:text-primary shrink-0" />}
                  Optional Fields
                  <span className="text-xs sm:text-sm font-normal text-muted-foreground">(recommended)</span>
                </button>

                {showOptional && (
                  <div className="space-y-5 sm:space-y-6 pl-0 sm:pl-7 animate-in fade-in slide-in-from-top-2 duration-200">
                    <FormSection label="Calendly Link" icon={<Calendar className="w-4 h-4" />} hint="Allow clients to book consultations directly">
                      <Input
                        type="url"
                        placeholder="https://calendly.com/yourname"
                        value={formData.calendlyLink}
                        onChange={e => setFormData({ ...formData, calendlyLink: e.target.value })}
                        className="h-10 sm:h-11"
                      />
                    </FormSection>

                    <div className="space-y-3">
                      <Label className="text-sm sm:text-base font-semibold">Social Links</Label>
                      {/* MOBILE: 1 col → 3 col on md */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                        {([
                          { key: 'instagram', icon: Instagram, placeholder: 'https://instagram.com/…', label: 'Instagram' },
                          { key: 'pinterest', icon: Link2,     placeholder: 'https://pinterest.com/…', label: 'Pinterest' },
                          { key: 'website',   icon: Globe,     placeholder: 'https://yoursite.com',   label: 'Website' },
                        ] as const).map(({ key, icon: Icon, placeholder, label }) => (
                          <div key={key} className="space-y-2">
                            <Label className="text-xs sm:text-sm flex items-center gap-2">
                              <Icon className="w-3.5 h-3.5" />
                              {label}
                            </Label>
                            <Input
                              placeholder={placeholder}
                              value={formData.socialLinks[key]}
                              onChange={e => setFormData({
                                ...formData,
                                socialLinks: { ...formData.socialLinks, [key]: e.target.value },
                              })}
                              className="h-10"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Terms ── */}
              <Card className="p-4 sm:p-5 bg-muted/40 border-border/50">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  By submitting, you agree to Hudumalink's Terms of Service and confirm all information is accurate. We verify all applications and may contact your references. Reviews typically take 24-48 hours.
                </p>
              </Card>

              {/* ── Submit ── */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 sm:h-14 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                disabled={submitting || uploadingCount > 0}
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Submitting…</>
                ) : uploadingCount > 0 ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Waiting for uploads…</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5 mr-2" />Submit Designer Application</>
                )}
              </Button>
            </form>
          </Card>
        </section>
      </div>
    </Layout>
  );
}

// ─── Small reusable components ────────────────────────────────────────────────

function FormSection({
  label, icon, hint, error, children,
}: {
  label: string; icon?: React.ReactNode; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm sm:text-base font-semibold flex items-center gap-2">
        {icon}{label}
      </Label>
      {children}
      {error && <ErrorText>{error}</ErrorText>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs sm:text-sm text-destructive flex items-center gap-1">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      {children}
    </p>
  );
}

function StatusScreen({
  icon, iconBg, title, description, action,
}: {
  icon: React.ReactNode; iconBg: string; title: string; description: string; action: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-5 sm:space-y-6">
        <div className={cn('w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center', iconBg)}>
          {icon}
        </div>
        <div className="space-y-2 sm:space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">{description}</p>
        </div>
        {action}
      </div>
    </div>
  );
}