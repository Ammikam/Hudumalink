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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Loader2, Upload, X, Image as ImageIcon, ArrowRight, Check,
  AlertCircle, Sparkles, Eye, MapPin, DollarSign
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const DESIGN_STYLES = [
  'Modern', 'African Fusion', 'Minimalist', 'Luxury',
  'Bohemian', 'Coastal', 'Budget-Friendly', 'Industrial',
  'Scandinavian', 'Art Deco', 'Contemporary', 'Traditional'
];

export default function AddInspirationPage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { toast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

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
        : [...prev.selectedStyles, style].slice(0, 5), // Max 5 styles
    }));
  };

  const uploadImage = async (file: File, type: 'before' | 'after') => {
    const setUploading = type === 'before' ? setUploadingBefore : setUploadingAfter;
    setUploading(true);

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('cover', file); // Reuse cover upload endpoint

      const res = await fetch('http://localhost:5000/api/users/upload-cover', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setFormData(prev => ({
          ...prev,
          [type === 'before' ? 'beforeImage' : 'afterImage']: data.url,
        }));
        toast({
          title: '✅ Image uploaded',
          description: `${type === 'before' ? 'Before' : 'After'} image uploaded successfully`,
        });
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length > 100) newErrors.title = 'Title must be under 100 characters';
    
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.length < 50) newErrors.description = 'Description must be at least 50 characters';
    if (formData.description.length > 500) newErrors.description = 'Description must be under 500 characters';

    if (!formData.beforeImage) newErrors.beforeImage = 'Before image is required';
    if (!formData.afterImage) newErrors.afterImage = 'After image is required';

    if (formData.selectedStyles.length === 0) {
      newErrors.styles = 'Select at least one style';
    }
    if (formData.selectedStyles.length > 5) {
      newErrors.styles = 'Maximum 5 styles allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Form Incomplete',
        description: 'Please fix the errors and try again',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const token = await getToken();

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        beforeImage: formData.beforeImage,
        afterImage: formData.afterImage,
        styles: formData.selectedStyles,
        location: formData.location.trim() || undefined,
        projectCost: formData.projectCost ? parseInt(formData.projectCost) : undefined,
        status: formData.status,
      };

      const res = await fetch('http://localhost:5000/api/inspirations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: '✨ Inspiration Posted!',
          description: 'Your work has been published to the inspiration gallery',
        });
        navigate('/inspiration');
      } else {
        throw new Error(data.error || 'Failed to post');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to post inspiration',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
        {/* Header */}
        <section className="container mx-auto px-4 lg:px-8 pt-24 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h1 className="font-display text-4xl font-bold">Share Your Work</h1>
                <p className="text-muted-foreground mt-1">
                  Inspire clients and showcase your design expertise
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                <Eye className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-bold mb-1">Get Discovered</h3>
                <p className="text-sm text-muted-foreground">
                  Clients browse inspirations daily
                </p>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5">
                <Sparkles className="w-8 h-8 text-accent mb-2" />
                <h3 className="font-bold mb-1">Build Credibility</h3>
                <p className="text-sm text-muted-foreground">
                  Showcase your best work
                </p>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5">
                <DollarSign className="w-8 h-8 text-green-600 mb-2" />
                <h3 className="font-bold mb-1">Generate Leads</h3>
                <p className="text-sm text-muted-foreground">
                  Direct hire from inspiration posts
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="container mx-auto px-4 lg:px-8 pb-24">
          <Card className="max-w-4xl mx-auto p-8 lg:p-12 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title */}
              <div className="space-y-3">
                <Label htmlFor="title" className="text-base font-semibold">
                  Project Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Modern Living Room Transformation"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className={cn('h-12 text-lg', errors.title && 'border-destructive')}
                  maxLength={100}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{errors.title || 'A catchy, descriptive title'}</span>
                  <span className={formData.title.length > 90 ? 'text-amber-500' : ''}>
                    {formData.title.length}/100
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label htmlFor="description" className="text-base font-semibold">
                  Project Description *
                </Label>
                <Textarea
                  id="description"
                  rows={5}
                  placeholder="Describe the transformation, design approach, materials used, and what makes this project special..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className={cn('resize-none leading-relaxed', errors.description && 'border-destructive')}
                  maxLength={500}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{errors.description || 'Minimum 50 characters'}</span>
                  <span className={formData.description.length > 450 ? 'text-amber-500' : ''}>
                    {formData.description.length}/500
                  </span>
                </div>
              </div>

              {/* Before/After Images */}
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">Before & After Images *</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload high-quality images showing the transformation
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Before Image */}
                  <div>
                    <Label className="text-sm mb-2 block">Before Image</Label>
                    <div
                      className={cn(
                        'relative aspect-[4/5] rounded-xl border-2 border-dashed overflow-hidden transition-all',
                        formData.beforeImage
                          ? 'border-primary bg-primary/5'
                          : errors.beforeImage
                          ? 'border-destructive bg-destructive/5'
                          : 'border-muted-foreground/30 hover:border-primary bg-muted/30'
                      )}
                    >
                      {formData.beforeImage ? (
                        <>
                          <img
                            src={formData.beforeImage}
                            alt="Before"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, beforeImage: '' })}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/90 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <Badge className="absolute bottom-2 left-2 bg-black/60 text-white">
                            Before
                          </Badge>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => beforeInputRef.current?.click()}
                          disabled={uploadingBefore}
                          className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary transition"
                        >
                          {uploadingBefore ? (
                            <>
                              <Loader2 className="w-12 h-12 animate-spin" />
                              <span className="text-sm">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-12 h-12" />
                              <span className="text-sm font-medium">Upload Before Image</span>
                              <span className="text-xs">JPG, PNG (max 5MB)</span>
                            </>
                          )}
                        </button>
                      )}
                      <input
                        ref={beforeInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], 'before')}
                      />
                    </div>
                    {errors.beforeImage && (
                      <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.beforeImage}
                      </p>
                    )}
                  </div>

                  {/* After Image */}
                  <div>
                    <Label className="text-sm mb-2 block">After Image</Label>
                    <div
                      className={cn(
                        'relative aspect-[4/5] rounded-xl border-2 border-dashed overflow-hidden transition-all',
                        formData.afterImage
                          ? 'border-primary bg-primary/5'
                          : errors.afterImage
                          ? 'border-destructive bg-destructive/5'
                          : 'border-muted-foreground/30 hover:border-primary bg-muted/30'
                      )}
                    >
                      {formData.afterImage ? (
                        <>
                          <img
                            src={formData.afterImage}
                            alt="After"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, afterImage: '' })}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/90 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <Badge className="absolute bottom-2 left-2 bg-primary">
                            After
                          </Badge>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => afterInputRef.current?.click()}
                          disabled={uploadingAfter}
                          className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary transition"
                        >
                          {uploadingAfter ? (
                            <>
                              <Loader2 className="w-12 h-12 animate-spin" />
                              <span className="text-sm">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-12 h-12" />
                              <span className="text-sm font-medium">Upload After Image</span>
                              <span className="text-xs">JPG, PNG (max 5MB)</span>
                            </>
                          )}
                        </button>
                      )}
                      <input
                        ref={afterInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], 'after')}
                      />
                    </div>
                    {errors.afterImage && (
                      <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.afterImage}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Design Styles */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Design Styles * (Max 5)</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Help clients find your work by selecting relevant styles
                  </p>
                </div>
                {errors.styles && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.styles}
                  </p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {DESIGN_STYLES.map(style => {
                    const isSelected = formData.selectedStyles.includes(style);
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => toggleStyle(style)}
                        className={cn(
                          'flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left',
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-border hover:border-primary/40 hover:bg-accent/5'
                        )}
                      >
                        <div
                          className={cn(
                            'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                            isSelected ? 'bg-primary border-primary' : 'border-input'
                          )}
                        >
                          {isSelected && (
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          )}
                        </div>
                        <span className="text-sm font-medium">{style}</span>
                      </button>
                    );
                  })}
                </div>
                {formData.selectedStyles.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formData.selectedStyles.length}/5 styles selected
                  </p>
                )}
              </div>

              {/* Optional Fields */}
              <div className="border-t pt-8">
                <h3 className="font-semibold text-lg mb-4">Optional Details</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      placeholder="e.g., Westlands, Nairobi"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      className="h-11"
                    />
                  </div>

                  {/* Project Cost */}
                  <div className="space-y-2">
                    <Label htmlFor="cost" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Project Cost (KSh)
                    </Label>
                    <Input
                      id="cost"
                      type="number"
                      placeholder="e.g., 500000"
                      value={formData.projectCost}
                      onChange={e => setFormData({ ...formData, projectCost: e.target.value })}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional - helps clients gauge budget
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/inspiration')}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1 shadow-lg hover:shadow-xl transition-all"
                  disabled={submitting || uploadingBefore || uploadingAfter}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Publish Inspiration
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </section>
      </div>
    </Layout>
  );
}