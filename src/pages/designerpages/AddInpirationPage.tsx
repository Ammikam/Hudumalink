// src/pages/designerpages/AddInspirationPage.tsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Layout } from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Loader2, Upload, X, Check, AlertCircle, Sparkles,
  Eye, MapPin, DollarSign, Info,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const DESIGN_STYLES = [
  'Modern', 'African Fusion', 'Minimalist', 'Luxury',
  'Bohemian', 'Coastal', 'Budget-Friendly', 'Industrial',
  'Scandinavian', 'Art Deco', 'Contemporary', 'Traditional',
];

function AspectRatioGuide() {
  return (
    <div className="rounded-2xl border border-blue-200/80 bg-blue-50/60 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Info className="w-4 h-4 text-blue-600" />
        </div>
        <p className="font-semibold text-sm text-blue-900">Image Guidelines</p>
      </div>

      <ul className="space-y-1.5 text-sm text-blue-800 pl-1">
        <li><span className="font-semibold">Ratio:</span> Portrait 4:5 — e.g. 800×1000px or 1600×2000px</li>
        <li><span className="font-semibold">Min size:</span> 800×1000px (larger = better detail)</li>
        <li><span className="font-semibold">Format:</span> JPG or PNG, max 5MB</li>
        <li><span className="font-semibold">Quality:</span> Well-lit, high-res photos only</li>
      </ul>

      {/* Visual ratio guide */}
      <div className="flex items-end gap-4 pt-1">
        {[
          { w: 'w-14', h: 'h-[4.4rem]', color: 'bg-emerald-200 border-emerald-500 text-emerald-700', label: '4:5', verdict: '✓ Best' },
          { w: 'w-20', h: 'h-14',       color: 'bg-amber-200 border-amber-500 text-amber-700',     label: '16:9', verdict: '⚠ Crops' },
          { w: 'w-14', h: 'h-14',       color: 'bg-red-200 border-red-400 text-red-700',            label: '1:1',  verdict: '✗ Avoid' },
        ].map(({ w, h, color, label, verdict }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div className={`${w} ${h} ${color} rounded border-2 flex items-center justify-center text-xs font-bold`}>
              {label}
            </div>
            <p className="text-xs font-medium" style={{ color: 'inherit' }}>{verdict}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ImageUploadZoneProps {
  label: string;
  badge: string;
  badgeClass: string;
  imageUrl: string;
  uploading: boolean;
  error?: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

function ImageUploadZone({ label, badge, badgeClass, imageUrl, uploading, error, onUpload, onRemove }: ImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">{label}</Label>
      <div
        className={cn(
          'relative aspect-[4/5] rounded-2xl border-2 border-dashed overflow-hidden transition-all',
          imageUrl   ? 'border-primary/40 bg-primary/3' :
          error      ? 'border-destructive bg-destructive/3' :
                       'border-border hover:border-primary/50 hover:bg-primary/3 bg-muted/30 cursor-pointer'
        )}
        onClick={() => !imageUrl && !uploading && inputRef.current?.click()}
      >
        {imageUrl ? (
          <>
            <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
            {/* Badge */}
            <span className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold text-white ${badgeClass}`}>
              {badge}
            </span>
            {/* Remove */}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onRemove(); }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-destructive text-white flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
          </>
        ) : uploading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-primary">
            <Loader2 className="w-10 h-10 animate-spin" />
            <span className="text-sm font-medium">Uploading…</span>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground pointer-events-none px-4 text-center">
            <Upload className="w-9 h-9" />
            <span className="text-sm font-medium">Upload {label}</span>
            <span className="text-xs">JPG, PNG · max 5MB</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])}
        />
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

export default function AddInspirationPage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { toast } = useToast();

  const [submitting, setSubmitting]       = useState(false);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter]   = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    beforeImage: '',
    afterImage: '',
    selectedStyles: [] as string[],
    location: '',
    projectCost: '',
    status: 'published' as 'draft' | 'published',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleStyle = (style: string) => {
    setFormData(prev => ({
      ...prev,
      selectedStyles: prev.selectedStyles.includes(style)
        ? prev.selectedStyles.filter(s => s !== style)
        : [...prev.selectedStyles, style].slice(0, 5),
    }));
  };

  const uploadImage = async (file: File, type: 'before' | 'after') => {
    const setUploading = type === 'before' ? setUploadingBefore : setUploadingAfter;
    setUploading(true);
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append('cover', file);
      const res = await fetch('http://localhost:5000/api/users/upload-cover', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, [type === 'before' ? 'beforeImage' : 'afterImage']: data.url }));
        toast({ title: '✅ Uploaded', description: `${type === 'before' ? 'Before' : 'After'} image ready` });
      } else throw new Error(data.error || 'Upload failed');
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally { setUploading(false); }
  };

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!formData.title.trim())                       e.title       = 'Title is required';
    if (formData.title.length > 100)                  e.title       = 'Title must be under 100 characters';
    if (!formData.description.trim())                 e.description = 'Description is required';
    if (formData.description.length < 50)             e.description = 'Minimum 50 characters';
    if (formData.description.length > 500)            e.description = 'Maximum 500 characters';
    if (!formData.beforeImage)                        e.beforeImage = 'Before image is required';
    if (!formData.afterImage)                         e.afterImage  = 'After image is required';
    if (formData.selectedStyles.length === 0)         e.styles      = 'Select at least one style';
    if (formData.selectedStyles.length > 5)           e.styles      = 'Maximum 5 styles';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: 'Form Incomplete', description: 'Please fix the errors and try again', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:5000/api/inspirations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          beforeImage: formData.beforeImage,
          afterImage: formData.afterImage,
          styles: formData.selectedStyles,
          location: formData.location.trim() || undefined,
          projectCost: formData.projectCost ? parseInt(formData.projectCost) : undefined,
          status: formData.status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: '✨ Published!', description: 'Your work is now in the inspiration gallery' });
        navigate('/inspiration');
      } else throw new Error(data.error || 'Failed to post');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-primary/4 via-background to-background">

        {/* ── Page header ── */}
        <div className="border-b bg-background/80 backdrop-blur-md sticky top-16 lg:top-20 z-30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-xl sm:text-2xl font-bold">Share Your Work</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">Inspire clients and showcase your design expertise</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">Designer</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 max-w-3xl">

          {/* ── Benefit pills ── */}
          {/* Mobile: first 2 in a row, third centered below. Desktop: 3-col */}
          <div className="mb-6 sm:hidden space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Eye,      color: 'text-primary',    bg: 'bg-primary/8 border-primary/15',     title: 'Get Discovered',   sub: 'Clients browse daily' },
                { icon: Sparkles, color: 'text-secondary',  bg: 'bg-secondary/8 border-secondary/15', title: 'Build Credibility', sub: 'Showcase your best work' },
              ].map(({ icon: Icon, color, bg, title, sub }) => (
                <div key={title} className={`flex items-center gap-2.5 p-3.5 rounded-2xl border ${bg}`}>
                  <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm leading-tight">{title}</p>
                    <p className="text-xs text-muted-foreground leading-tight mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Third pill centered */}
            <div className="flex justify-center">
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl border bg-emerald-50 border-emerald-200 w-full max-w-[260px]">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm leading-tight">Generate Leads</p>
                  <p className="text-xs text-muted-foreground leading-tight mt-0.5">Direct hire from posts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: 3-col */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-3 mb-6">
            {[
              { icon: Eye,       color: 'text-primary',    bg: 'bg-primary/8 border-primary/15',     title: 'Get Discovered',   sub: 'Clients browse daily' },
              { icon: Sparkles,  color: 'text-secondary',  bg: 'bg-secondary/8 border-secondary/15', title: 'Build Credibility', sub: 'Showcase your best work' },
              { icon: DollarSign,color: 'text-emerald-600',bg: 'bg-emerald-50 border-emerald-200',   title: 'Generate Leads',   sub: 'Direct hire from posts' },
            ].map(({ icon: Icon, color, bg, title, sub }) => (
              <div key={title} className={`flex items-center gap-3 p-4 rounded-2xl border ${bg}`}>
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Main form ── */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">

              {/* Title */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/[0.02] rounded-2xl border border-primary/15 p-5 sm:p-6 space-y-4">
                <h2 className="font-semibold text-base">Project Info</h2>

                <div className="space-y-2">
                  <Label className="font-semibold text-sm">Project Title *</Label>
                  <Input
                    placeholder="e.g., Modern Living Room Transformation"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className={cn('h-11', errors.title && 'border-destructive')}
                    maxLength={100}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {errors.title
                      ? <span className="text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.title}</span>
                      : <span>A catchy, descriptive title</span>
                    }
                    <span className={formData.title.length > 90 ? 'text-amber-500' : ''}>{formData.title.length}/100</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-sm">Description *</Label>
                  <Textarea
                    rows={5}
                    placeholder="Describe the transformation, design approach, materials used, and what makes this project special…"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className={cn('resize-none leading-relaxed', errors.description && 'border-destructive')}
                    maxLength={500}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {errors.description
                      ? <span className="text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</span>
                      : <span>Minimum 50 characters</span>
                    }
                    <span className={formData.description.length > 450 ? 'text-amber-500' : ''}>{formData.description.length}/500</span>
                  </div>
                </div>
              </div>

              {/* Before / After Images */}
              <div className="bg-gradient-to-br from-secondary/5 to-secondary/[0.02] rounded-2xl border border-secondary/15 p-5 sm:p-6 space-y-4">
                <div>
                  <h2 className="font-semibold text-base">Before & After Images *</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Upload high-quality images showing the transformation</p>
                </div>

                <AspectRatioGuide />

                <div className="grid grid-cols-2 gap-3 sm:gap-5">
                  <ImageUploadZone
                    label="Before"
                    badge="Before"
                    badgeClass="bg-black/70"
                    imageUrl={formData.beforeImage}
                    uploading={uploadingBefore}
                    error={errors.beforeImage}
                    onUpload={f => uploadImage(f, 'before')}
                    onRemove={() => setFormData(p => ({ ...p, beforeImage: '' }))}
                  />
                  <ImageUploadZone
                    label="After"
                    badge="After"
                    badgeClass="bg-primary"
                    imageUrl={formData.afterImage}
                    uploading={uploadingAfter}
                    error={errors.afterImage}
                    onUpload={f => uploadImage(f, 'after')}
                    onRemove={() => setFormData(p => ({ ...p, afterImage: '' }))}
                  />
                </div>
              </div>

              {/* Design Styles */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/[0.02] rounded-2xl border border-primary/15 p-5 sm:p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-base">Design Styles *</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Help clients find your work — select up to 5</p>
                  </div>
                  {formData.selectedStyles.length > 0 && (
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full flex-shrink-0">
                      {formData.selectedStyles.length}/5
                    </span>
                  )}
                </div>

                {errors.styles && (
                  <p className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-3.5 h-3.5" />{errors.styles}
                  </p>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DESIGN_STYLES.map(style => {
                    const selected = formData.selectedStyles.includes(style);
                    const maxed = !selected && formData.selectedStyles.length >= 5;
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => !maxed && toggleStyle(style)}
                        disabled={maxed}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all text-sm',
                          selected  ? 'border-primary bg-primary/8 text-primary font-semibold' :
                          maxed     ? 'border-border bg-muted/30 text-muted-foreground opacity-50 cursor-not-allowed' :
                                      'border-border hover:border-primary/40 bg-card font-medium'
                        )}
                      >
                        <div className={cn(
                          'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                          selected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                        )}>
                          {selected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                        </div>
                        {style}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional fields */}
              <div className="bg-gradient-to-br from-secondary/5 to-secondary/[0.02] rounded-2xl border border-secondary/15 p-5 sm:p-6 space-y-4">
                <div>
                  <h2 className="font-semibold text-base">Optional Details</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Extra context helps clients connect with your work</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-semibold text-sm flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Location
                    </Label>
                    <Input
                      placeholder="e.g., Westlands, Nairobi"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-sm flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" /> Project Cost (KSh)
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 500000"
                      value={formData.projectCost}
                      onChange={e => setFormData({ ...formData, projectCost: e.target.value })}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">Helps clients gauge their budget</p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pb-8">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={() => navigate('/inspiration')}
                  disabled={submitting}
                  className="flex-1 sm:flex-none sm:min-w-[120px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="default"
                  disabled={submitting || uploadingBefore || uploadingAfter}
                  className="flex-1 gap-2 shadow-sm"
                >
                  {submitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Publishing…</>
                    : <><Sparkles className="w-4 h-4" />Publish Inspiration</>
                  }
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}