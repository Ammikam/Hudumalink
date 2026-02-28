// src/pages/PostProjectPage.tsx - ENHANCED WITH BEFORE/AFTER FLOW
import { useState, useEffect } from 'react';
import { useNavigate, useLocation} from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, ArrowRight, ArrowLeft, Check, Loader2, MapPin, Calendar, Lightbulb, Camera } from 'lucide-react';
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
import { X } from 'lucide-react';
import { api } from '@/services/api';

// ✅ UPDATED: 5 steps instead of 4
const steps = ['Project Details', 'Current Space', 'Your Vision', 'Budget & Style', 'Contact'];
const styles = ['Modern', 'African Fusion', 'Minimalist', 'Luxury', 'Bohemian', 'Coastal', 'Budget-Friendly'];
const timelines = ['1-2 weeks', '2-4 weeks', '1-2 months', '2-3 months', '3+ months', 'Flexible'];

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

  // Form state
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Step 0: Project Details
  const [title, setTitle] = useState(prefilled?.roomType ? `${prefilled.roomType} Design Project` : '');
  const [description, setDescription] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [timeline, setTimeline] = useState('');
  
  // ✅ NEW: Step 1: Before Photos (Current Space)
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  
  // ✅ NEW: Step 2: After/Inspiration Photos (Your Vision)
  const [inspirationPhotos, setInspirationPhotos] = useState<string[]>([]);
  const [inspirationNotes, setInspirationNotes] = useState('');
  const [uploadingInspiration, setUploadingInspiration] = useState(false);
  
  // Step 3: Budget & Style (was Step 2)
  const [budget, setBudget] = useState<number[]>(
    prefilled ? [Math.round((prefilled.budgetMin! + prefilled.budgetMax!) / 2)] : [500000]
  );
  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    prefilled?.style ? [prefilled.style] : []
  );
  
  // Step 4: Contact (was Step 3)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Auto-fill user data from Clerk
  useEffect(() => {
    if (userLoaded && clerkUser) {
      setName(clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim());
      setEmail(clerkUser.primaryEmailAddress?.emailAddress || '');
      setPhone(clerkUser.primaryPhoneNumber?.phoneNumber || '');
    }
  }, [userLoaded, clerkUser]);

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  // Validation
  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 0) {
      if (!title.trim()) newErrors.title = 'Project title is required';
      if (!description.trim()) newErrors.description = 'Description is required';
      if (!projectLocation.trim()) newErrors.location = 'Location is required';
      if (!timeline) newErrors.timeline = 'Timeline is required';
    }

    if (currentStep === 3) { // Budget & Style step
      if (selectedStyles.length === 0) newErrors.styles = 'Select at least one style';
    }

    if (currentStep === 4) { // Contact step
      if (!name.trim()) newErrors.name = 'Name is required';
      if (!email.trim()) newErrors.email = 'Email is required';
      if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
      if (!phone.trim()) newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ NEW: Handle before photos upload
  const handleBeforePhotos = async (files: File[]) => {
    setUploadingBefore(true);
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      
      const response = await api.uploadProjectImages(formData);
      setBeforePhotos(prev => [...prev, ...response.urls]);
    } catch (error) {
      console.error('Before photos upload failed:', error);
      alert('Failed to upload before photos');
    } finally {
      setUploadingBefore(false);
    }
  };

  // ✅ NEW: Handle inspiration photos upload
  const handleInspirationPhotos = async (files: File[]) => {
    setUploadingInspiration(true);
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      
      const response = await api.uploadProjectImages(formData);
      setInspirationPhotos(prev => [...prev, ...response.urls]);
    } catch (error) {
      console.error('Inspiration photos upload failed:', error);
      alert('Failed to upload inspiration photos');
    } finally {
      setUploadingInspiration(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setSubmitting(true);

    try {
      const token = await getToken();
      
      if (!token) {
        alert('Authentication required. Please sign in again.');
        navigate('/sign-in');
        return;
      }

      const projectData = {
        title,
        description,
        location: projectLocation,
        budget: budget[0],
        timeline,
        styles: selectedStyles,
        // ✅ NEW: Combine both photo arrays
        photos: [...beforePhotos, ...inspirationPhotos],
        beforePhotos,           // ✅ NEW: Explicit before photos
        inspirationPhotos,      // ✅ NEW: Explicit inspiration photos
        inspirationNotes,       // ✅ NEW: Vision notes
        client: {
          clerkId: userId,
          name,
          email,
          phone,
        },
      };

      const response = await api.createProject(projectData, token);

      if (response.success) {
        const projectId = response.project._id;

        if (suggestedDesignerId) {
          try {
            await fetch('http://localhost:5000/api/invites', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                projectId,
                designerId: suggestedDesignerId,
              }),
            });
          } catch (inviteErr) {
            console.warn('Failed to send invite:', inviteErr);
          }
        }

        navigate('/success', { 
          state: { 
            message: suggestedDesignerId 
              ? 'Project posted & designer invited!' 
              : 'Project posted successfully!',
            projectTitle: title 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to submit project:', error);
      alert('Failed to submit project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((step + 1) / steps.length) * 100;

  if (!isLoaded || !userLoaded) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!userId) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-8">
            You need to be signed in to post a project.
          </p>
          <Button size="lg" onClick={() => navigate('/sign-in')}>
            Sign In
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideFooter>
      <div className="min-h-screen py-12 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          {/* Progress Bar */}
          <Card className="p-6 mb-8 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              {steps.map((s, i) => (
                <div
                  key={s}
                  className={cn(
                    'flex items-center gap-3 transition-all',
                    i <= step ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                      i < step ? 'bg-primary text-primary-foreground' : 
                      i === step ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                      'bg-muted'
                    )}
                  >
                    {i < step ? <Check className="w-5 h-5" /> : i + 1}
                  </div>
                  <span className="hidden sm:block font-medium text-sm">{s}</span>
                </div>
              ))}
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary via-accent to-secondary rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-3 text-center">
              Step {step + 1} of {steps.length}
            </p>
          </Card>

          {suggestedDesignerId && (
            <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                📩 <strong>Direct Invite:</strong> This designer will be notified when you submit.
              </p>
            </Card>
          )}

          {/* Form Steps */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="bg-card rounded-2xl shadow-xl p-8 lg:p-12"
          >
            {/* Step 0: Project Details (unchanged) */}
            {step === 0 && (
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                    Tell us about your project
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Give designers a clear idea of what you're looking for
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-semibold">Project Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Modern Living Room Makeover in Westlands"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={cn('h-12 text-lg', errors.title && 'border-destructive')}
                  />
                  {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-semibold">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your vision, what you like/dislike about your current space, specific requirements..."
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={cn('resize-none', errors.description && 'border-destructive')}
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-base font-semibold">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Location *
                    </Label>
                    <Input
                      id="location"
                      placeholder="e.g., Westlands, Nairobi"
                      value={projectLocation}
                      onChange={(e) => setProjectLocation(e.target.value)}
                      className={cn('h-12', errors.location && 'border-destructive')}
                    />
                    {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeline" className="text-base font-semibold">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Timeline *
                    </Label>
                    <select
                      id="timeline"
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className={cn(
                        'w-full h-12 px-4 rounded-lg border bg-background text-base',
                        errors.timeline && 'border-destructive'
                      )}
                    >
                      <option value="">Select timeline</option>
                      {timelines.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {errors.timeline && <p className="text-sm text-destructive">{errors.timeline}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ✅ NEW: Step 1 - Current Space (Before Photos) */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                    Show us your current space
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Upload photos of your space as it is now. This helps designers understand what needs to be transformed.
                  </p>
                </div>

                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    id="before-upload"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    disabled={uploadingBefore}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      handleBeforePhotos(files);
                    }}
                  />

                  <div className="border-4 border-dashed border-border/50 rounded-3xl p-16 hover:border-primary/50 hover:bg-primary/5 transition-all text-center">
                    {uploadingBefore ? (
                      <>
                        <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary mb-6" />
                        <p className="text-xl font-medium">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
                        <p className="text-xl font-medium mb-2">
                          Click or drag photos here
                        </p>
                        <p className="text-muted-foreground mb-6">
                          PNG, JPG up to 10MB each • Multiple angles recommended
                        </p>
                        <Button size="lg" variant="outline" type="button">
                          Choose Before Photos
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {beforePhotos.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">
                      {beforePhotos.length} photo{beforePhotos.length > 1 ? 's' : ''} uploaded
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {beforePhotos.map((url, i) => (
                        <div key={i} className="relative group aspect-square rounded-xl overflow-hidden">
                          <img
                            src={url}
                            alt={`Before ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setBeforePhotos(prev => prev.filter((_, index) => index !== i))}
                            className="absolute top-2 right-2 bg-destructive text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Card className="p-5 bg-muted/50 border-2 border-primary/10">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Tip:</strong> Include multiple angles (wide shots, close-ups of problem areas, lighting conditions) to help designers provide accurate proposals.
                  </p>
                </Card>
              </div>
            )}

            {/* ✅ NEW: Step 2 - Your Vision (Inspiration/After Photos) */}
            {step === 2 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="w-8 h-8 text-accent" />
                  </div>
                  <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                    Share your vision
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Upload inspiration photos or reference images showing what you want to achieve (optional but very helpful!)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inspiration-notes" className="text-base font-semibold">
                    What inspires you? (Optional)
                  </Label>
                  <Textarea
                    id="inspiration-notes"
                    placeholder="Describe your dream space... What mood, colors, or specific elements inspire you? Any Pinterest boards or Instagram accounts you love?"
                    rows={4}
                    value={inspirationNotes}
                    onChange={(e) => setInspirationNotes(e.target.value)}
                    className="resize-none"
                  />
                </div>

                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    id="inspiration-upload"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    disabled={uploadingInspiration}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      handleInspirationPhotos(files);
                    }}
                  />

                  <div className="border-4 border-dashed border-accent/30 rounded-3xl p-16 hover:border-accent hover:bg-accent/5 transition-all text-center">
                    {uploadingInspiration ? (
                      <>
                        <Loader2 className="w-16 h-16 mx-auto animate-spin text-accent mb-6" />
                        <p className="text-xl font-medium">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Lightbulb className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
                        <p className="text-xl font-medium mb-2">
                          Add inspiration photos
                        </p>
                        <p className="text-muted-foreground mb-6">
                          Screenshots from Pinterest, magazines, Instagram, etc.
                        </p>
                        <Button size="lg" variant="outline" type="button">
                          Choose Inspiration Photos
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {inspirationPhotos.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">
                      {inspirationPhotos.length} inspiration{inspirationPhotos.length > 1 ? 's' : ''} added
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {inspirationPhotos.map((url, i) => (
                        <div key={i} className="relative group aspect-square rounded-xl overflow-hidden">
                          <img
                            src={url}
                            alt={`Inspiration ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setInspirationPhotos(prev => prev.filter((_, index) => index !== i))}
                            className="absolute top-2 right-2 bg-destructive text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Card className="p-5 bg-muted/50 border-2 border-accent/10">
                  <p className="text-sm text-muted-foreground">
                    ✨ <strong>Pro Tip:</strong> This step is optional, but sharing inspiration photos helps designers understand your aesthetic and deliver proposals that match your vision perfectly!
                  </p>
                </Card>
              </div>
            )}

            {/* Step 3: Budget & Style (same as before, just moved) */}
            {step === 3 && (
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                    Budget & Style Preferences
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    This helps match you with the right designers
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <Label className="text-lg font-semibold">Your Budget</Label>
                    <span className="font-display text-3xl font-bold text-primary">
                      {formatCurrency(budget[0])}
                    </span>
                  </div>

                  <Slider
                    value={budget}
                    onValueChange={setBudget}
                    min={50000}
                    max={5000000}
                    step={50000}
                    className="py-4"
                  />

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>KSh 50,000</span>
                    <span>KSh 5,000,000+</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Preferred Styles *</Label>
                  <p className="text-sm text-muted-foreground">
                    Select all that apply
                  </p>
                  {errors.styles && <p className="text-sm text-destructive">{errors.styles}</p>}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {styles.map(style => (
                      <div
                        key={style}
                        onClick={() => toggleStyle(style)}
                        className={cn(
                          'flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md',
                          selectedStyles.includes(style)
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-border hover:border-primary/50 bg-card'
                        )}
                      >
                        <Checkbox checked={selectedStyles.includes(style)} />
                        <span className="font-medium">{style}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Contact (same as before, just moved) */}
            {step === 4 && (
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                    Almost there! Your contact info
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Designers will use this to send personalized proposals
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Full Name</Label>
                    <Input value={name} disabled className="bg-muted h-12" />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Email</Label>
                    <Input value={email} disabled className="bg-muted h-12" />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base font-semibold">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+254 712 345 678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={cn('h-12', errors.phone && 'border-destructive')}
                    />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  </div>
                </div>

                {/* Project Summary */}
                <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
                  <h3 className="font-semibold text-lg mb-4">📋 Project Summary</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Title</p>
                      <p className="font-medium">{title}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Location</p>
                      <p className="font-medium">{projectLocation}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Budget</p>
                      <p className="font-medium text-primary">{formatCurrency(budget[0])}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Timeline</p>
                      <p className="font-medium">{timeline}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Styles</p>
                      <p className="font-medium">{selectedStyles.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Photos</p>
                      <p className="font-medium">
                        {beforePhotos.length} before • {inspirationPhotos.length} inspiration
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-12 pt-8 border-t border-border">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0 || submitting}
                className="min-w-[120px]"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>

              {step < steps.length - 1 ? (
                <Button
                  size="lg"
                  onClick={() => {
                    if (validateStep(step)) {
                      setStep(step + 1);
                    }
                  }}
                  className="min-w-[120px]"
                >
                  Next
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="min-w-[200px]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Submit Project
                    </>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}