import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, ArrowRight, ArrowLeft, Check, Loader2, MapPin, Calendar } from 'lucide-react';
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
import { api } from '@/services/Api';

const steps = ['Project Details', 'Upload Photos', 'Budget & Style', 'Contact'];
const styles = ['Modern', 'African Fusion', 'Minimalist', 'Luxury', 'Bohemian', 'Coastal', 'Budget-Friendly'];
const timelines = ['1-2 weeks', '2-4 weeks', '1-2 months', '2-3 months', '3+ months', 'Flexible'];

export default function PostProjectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilled = location.state as {
    roomType?: string;
    budgetMin?: number;
    budgetMax?: number;
    style?: string;
  } | null;

  // Form state
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Step 0: Project Details
  const [title, setTitle] = useState(prefilled?.roomType ? `${prefilled.roomType} Design Project` : '');
  const [description, setDescription] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [timeline, setTimeline] = useState('');
  
  // Step 1: Photos
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  // Step 2: Budget & Style
  const [budget, setBudget] = useState<number[]>(
    prefilled ? [Math.round((prefilled.budgetMin! + prefilled.budgetMax!) / 2)] : [500000]
  );
  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    prefilled?.style ? [prefilled.style] : []
  );
  
  // Step 3: Contact
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

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

    if (currentStep === 2) {
      if (selectedStyles.length === 0) newErrors.styles = 'Select at least one style';
    }

    if (currentStep === 3) {
      if (!name.trim()) newErrors.name = 'Name is required';
      if (!email.trim()) newErrors.email = 'Email is required';
      if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
      if (!phone.trim()) newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle image upload
  const handleFileUpload = async (files: File[]) => {
    setUploadingImages(true);
    
    try {
      // Option 1: Upload to your backend which then uploads to Cloudinary/S3
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      
      const response = await api.uploadImages(formData);
      const imageUrls = response.urls; // Array of uploaded image URLs
      
      // Add to preview
      setPreviewUrls(prev => [...prev, ...imageUrls]);
      
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setSubmitting(true);

    try {
      const projectData = {
        title,
        description,
        location: projectLocation,
        budget: budget[0],
        timeline,
        styles: selectedStyles,
        photos: previewUrls,
        clientName: name,
        clientEmail: email,
        clientPhone: phone,
        status: 'open',
        proposals: [],
        createdAt: new Date().toISOString()
      };

      await api.createProject(projectData);
      
      // Navigate to success page
      navigate('/project-success', { 
        state: { projectTitle: title } 
      });

    } catch (error) {
      console.error('Failed to submit project:', error);
      alert('Failed to submit project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <Layout hideFooter>
      <div className="min-h-screen py-12 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {/* Progress Bar */}
          <Card className="card-premium p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              {steps.map((s, i) => (
                <div
                  key={s}
                  className={`flex items-center gap-3 ${
                    i <= step ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="hidden sm:block font-medium">{s}</span>
                </div>
              ))}
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </Card>

          {/* Form Steps */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="card-elevated p-8 lg:p-12"
          >
            {/* Step 0: Project Details */}
            {step === 0 && (
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                    Tell us about your project
                  </h2>
                  <p className="text-muted-foreground">
                    Give designers a clear idea of what you're looking for
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Modern Living Room Makeover in Westlands"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={cn('h-12', errors.title && 'border-destructive')}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your vision, what you like/dislike about your current space, inspiration ideas..."
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={cn('resize-none', errors.description && 'border-destructive')}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">
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
                    {errors.location && (
                      <p className="text-sm text-destructive">{errors.location}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeline">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Timeline *
                    </Label>
                    <select
                      id="timeline"
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className={cn(
                        'w-full h-12 px-4 rounded-lg border bg-background',
                        errors.timeline && 'border-destructive'
                      )}
                    >
                      <option value="">Select timeline</option>
                      {timelines.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {errors.timeline && (
                      <p className="text-sm text-destructive">{errors.timeline}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Upload Photos */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                    Upload photos of your space
                  </h2>
                  <p className="text-muted-foreground">
                    Help designers understand your current space (optional but highly recommended)
                  </p>
                </div>

                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    id="file-upload"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    disabled={uploadingImages}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      handleFileUpload(files);
                    }}
                  />

                  <div className="border-4 border-dashed border-border/50 rounded-3xl p-16 hover:border-primary/50 transition-colors text-center">
                    {uploadingImages ? (
                      <>
                        <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary mb-6" />
                        <p className="text-xl font-medium">Uploading images...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
                        <p className="text-xl font-medium mb-2">
                          Click anywhere or drag & drop
                        </p>
                        <p className="text-muted-foreground mb-6">
                          PNG, JPG up to 10MB each
                        </p>
                        <Button size="lg" variant="outline" type="button">
                          Choose Photos
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Preview Grid */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                    {previewUrls.map((url, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden">
                        <img
                          src={url}
                          alt={`Preview ${i + 1}`}
                          className="w-full h-64 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewUrls(prev => prev.filter((_, index) => index !== i));
                          }}
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Budget & Style */}
            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                    Budget & Style Preferences
                  </h2>
                  <p className="text-muted-foreground">
                    This helps match you with the right designers
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <Label className="text-lg font-medium">Your Budget</Label>
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
                  <Label className="text-lg font-medium">Preferred Styles *</Label>
                  <p className="text-sm text-muted-foreground">
                    Select all that apply
                  </p>
                  {errors.styles && (
                    <p className="text-sm text-destructive">{errors.styles}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {styles.map(style => (
                      <div
                        key={style}
                        onClick={() => toggleStyle(style)}
                        className={cn(
                          'flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all',
                          selectedStyles.includes(style)
                            ? 'border-primary bg-primary/10'
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

            {/* Step 3: Contact */}
            {step === 3 && (
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                    Almost there! Your contact info
                  </h2>
                  <p className="text-muted-foreground">
                    Designers will use this to send personalized proposals
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Kamau"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={cn('h-12', errors.name && 'border-destructive')}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cn('h-12', errors.email && 'border-destructive')}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+254 712 345 678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={cn('h-12', errors.phone && 'border-destructive')}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Project Summary */}
                <Card className="p-6 bg-muted/50">
                  <h3 className="font-semibold text-lg mb-4">Project Summary</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Title:</strong> {title}</p>
                    <p><strong>Location:</strong> {projectLocation}</p>
                    <p><strong>Budget:</strong> {formatCurrency(budget[0])}</p>
                    <p><strong>Timeline:</strong> {timeline}</p>
                    <p><strong>Styles:</strong> {selectedStyles.join(', ')}</p>
                    <p><strong>Photos:</strong> {previewUrls.length} uploaded</p>
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
                >
                  Next Step
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