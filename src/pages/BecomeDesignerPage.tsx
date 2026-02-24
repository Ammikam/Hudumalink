// src/pages/BecomeDesignerPage.tsx
import { useState, useEffect } from 'react';
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
  Loader2, CheckCircle2, Sparkles, Upload, X, Calendar, AlertCircle,
  Briefcase, Users, TrendingUp, Shield, IdCard, UserPlus, Instagram,
  Globe, Link2, ChevronDown, ChevronUp
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

export default function BecomeDesignerPage() {
  const navigate = useNavigate();
  const { userId, getToken, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { toast } = useToast();

  const isLoaded = isAuthLoaded && isUserLoaded;

  const [checking, setChecking] = useState(true);
  const [existingStatus, setExistingStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [submitting, setSubmitting] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  const [formData, setFormData] = useState({
    // Required
    idNumber: '',
    location: '',
    about: '',
    selectedStyles: [] as string[],
    startingPrice: 250000,
    responseTime: 'Within 24 hours',
    portfolioUrls: ['', '', '', '', ''], // Up to 5 images
    
    // References (min 2)
    references: [
      { name: '', email: '', relation: '' },
      { name: '', email: '', relation: '' },
      { name: '', email: '', relation: '' },
    ],
    
    // Optional
    calendlyLink: '',
    socialLinks: {
      instagram: '',
      pinterest: '',
      website: '',
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const checkStatus = async () => {
      if (!userId || !isLoaded) return;

      try {
        const token = await getToken();
        const res = await fetch(`http://localhost:5000/api/users/designer-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success) {
          setExistingStatus(data.status);
          if (data.status === 'approved') navigate('/designer/open-projects');
        }
      } catch (err) {
        console.error('Failed to check designer status:', err);
      } finally {
        setChecking(false);
      }
    };

    if (isLoaded) checkStatus();
  }, [userId, isLoaded, getToken, navigate]);

  const toggleStyle = (style: string) => {
    setFormData(prev => ({
      ...prev,
      selectedStyles: prev.selectedStyles.includes(style)
        ? prev.selectedStyles.filter(s => s !== style)
        : [...prev.selectedStyles, style],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // ID Number
    if (!formData.idNumber.trim()) newErrors.idNumber = 'National ID number is required';
    else if (formData.idNumber.length < 7) newErrors.idNumber = 'Please enter a valid ID number';

    // Location & About
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.about.trim()) newErrors.about = 'About section is required';
    if (formData.about.length < 150) newErrors.about = 'Please write at least 150 characters';

    // Styles
    if (formData.selectedStyles.length === 0) newErrors.styles = 'Select at least one design style';

    // Starting Price
    if (formData.startingPrice < 50000) newErrors.startingPrice = 'Minimum starting price is KSh 50,000';

    // Portfolio (at least 3 images)
    const validUrls = formData.portfolioUrls.filter(url => url.trim());
    if (validUrls.length < 3) newErrors.portfolio = 'At least 3 portfolio image URLs are required';

    // References (at least 2 complete)
    const validRefs = formData.references.filter(ref =>
      ref.name.trim() && ref.email.trim() && ref.relation.trim()
    );
    if (validRefs.length < 2) newErrors.references = 'At least 2 complete references are required';

    // Validate reference emails
    formData.references.forEach((ref, i) => {
      if (ref.email && !/\S+@\S+\.\S+/.test(ref.email)) {
        newErrors[`ref${i}Email`] = 'Invalid email format';
      }
    });

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
      
      // Prepare data
      const validRefs = formData.references.filter(ref =>
        ref.name.trim() && ref.email.trim() && ref.relation.trim()
      );
      
      const validPortfolio = formData.portfolioUrls.filter(url => url.trim());
      
      const socialLinks: any = {};
      if (formData.socialLinks.instagram) socialLinks.instagram = formData.socialLinks.instagram;
      if (formData.socialLinks.pinterest) socialLinks.pinterest = formData.socialLinks.pinterest;
      if (formData.socialLinks.website) socialLinks.website = formData.socialLinks.website;

      const res = await fetch('http://localhost:5000/api/users/apply-designer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idNumber: formData.idNumber.trim(),
          location: formData.location.trim(),
          about: formData.about.trim(),
          styles: formData.selectedStyles,
          startingPrice: formData.startingPrice,
          responseTime: formData.responseTime,
          portfolioImages: validPortfolio,
          references: validRefs,
          calendlyLink: formData.calendlyLink.trim() || undefined,
          socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: '✅ Application Submitted!',
          description: 'We\'ll review your application within 24-48 hours',
        });
        navigate('/designer/application-pending');
      } else {
        throw new Error(data.error || 'Application failed');
      }
    } catch (error: any) {
      console.error('Application error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Loading/auth states
  if (!isLoaded || checking) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!userId) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center max-w-2xl px-4">
          <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-4">Please Sign In</h1>
          <p className="text-xl text-muted-foreground mb-8">
            You need to be signed in to apply as a designer.
          </p>
          <Button size="lg" onClick={() => navigate('/sign-in')}>
            Sign In to Continue
          </Button>
        </div>
      </Layout>
    );
  }

  if (existingStatus === 'pending') {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center max-w-2xl px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-4">Application Under Review</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your designer application is being reviewed by our team. We'll notify you via email within 24-48 hours.
          </p>
          <Button variant="outline" onClick={() => navigate('/')}>
            Return to Homepage
          </Button>
        </div>
      </Layout>
    );
  }

  if (existingStatus === 'rejected') {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center max-w-2xl px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
            <X className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-4">Application Not Approved</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Unfortunately, your designer application was not approved at this time. Please contact support for more details.
          </p>
          <Button variant="outline" onClick={() => navigate('/')}>
            Return to Homepage
          </Button>
        </div>
      </Layout>
    );
  }

  // Main form
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
        {/* Hero */}
        <section className="container mx-auto px-4 lg:px-8 pt-24 pb-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Join Kenya's Premier Design Marketplace
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Become a Verified Designer
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Connect with high-value clients, showcase your portfolio, and grow your interior design business on Kenya's most trusted platform.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="container mx-auto px-4 lg:px-8 pb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="p-6 text-center hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/20 group">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold mb-2 text-base">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Form */}
        <section className="container mx-auto px-4 lg:px-8 pb-24">
          <Card className="max-w-5xl mx-auto p-8 lg:p-12 shadow-xl border-border/50">
            <div className="mb-10">
              <h2 className="font-display text-3xl font-bold mb-3">Designer Application</h2>
              <p className="text-muted-foreground text-lg">
                Complete all required fields. We verify each application to maintain platform quality.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* National ID */}
              <div className="space-y-3">
                <Label htmlFor="idNumber" className="text-base flex items-center gap-2">
                  <IdCard className="w-4 h-4" />
                  National ID Number *
                </Label>
                <Input
                  id="idNumber"
                  placeholder="Enter your national ID number"
                  value={formData.idNumber}
                  onChange={e => setFormData({ ...formData, idNumber: e.target.value })}
                  className={cn('h-12', errors.idNumber && 'border-destructive')}
                />
                {errors.idNumber && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.idNumber}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Required for identity verification. This information is kept confidential.
                </p>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <Label htmlFor="location" className="text-base">
                  Primary Location *
                </Label>
                <Input
                  id="location"
                  placeholder="e.g., Westlands, Nairobi"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className={cn('h-12', errors.location && 'border-destructive')}
                />
                {errors.location && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.location}
                  </p>
                )}
              </div>

              {/* About */}
              <div className="space-y-3">
                <Label htmlFor="about" className="text-base">
                  About Your Design Practice *
                  <span className="text-sm text-muted-foreground font-normal ml-2">
                    ({formData.about.length}/800 characters, min 150)
                  </span>
                </Label>
                <Textarea
                  id="about"
                  rows={7}
                  maxLength={800}
                  placeholder="Share your design philosophy, years of experience, notable projects, unique approach, and what sets you apart from other designers. Be specific and authentic."
                  value={formData.about}
                  onChange={e => setFormData({ ...formData, about: e.target.value })}
                  className={cn('resize-none leading-relaxed', errors.about && 'border-destructive')}
                />
                {errors.about && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.about}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  This appears on your public profile. Write in a way that resonates with potential clients.
                </p>
              </div>

              {/* Design Styles */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Design Styles You Specialize In *</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select all that apply (helps clients find you)
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
                      <div
                        key={style}
                        onClick={() => toggleStyle(style)}
                        className={cn(
                          'flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all',
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-border hover:border-primary/40 hover:bg-accent/5'
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                          isSelected ? "bg-primary border-primary" : "border-input"
                        )}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                              <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium">{style}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Portfolio Images */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Portfolio Image URLs * (Minimum 3, Up to 5)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload your best work to Imgur, Google Drive (public link), or Instagram
                  </p>
                </div>
                {errors.portfolio && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.portfolio}
                  </p>
                )}
                <div className="space-y-3">
                  {formData.portfolioUrls.map((url, i) => (
                    <div key={i} className="relative">
                      <Input
                        placeholder={`Portfolio image ${i + 1} URL ${i < 3 ? '(required)' : '(optional)'}`}
                        value={url}
                        onChange={e => {
                          const urls = [...formData.portfolioUrls];
                          urls[i] = e.target.value;
                          setFormData({ ...formData, portfolioUrls: urls });
                        }}
                        className="h-11 pr-10"
                      />
                      {url && (
                        <button
                          type="button"
                          onClick={() => {
                            const urls = [...formData.portfolioUrls];
                            urls[i] = '';
                            setFormData({ ...formData, portfolioUrls: urls });
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  💡 <strong>Tip:</strong> Use high-quality before/after images. Images showing your actual work perform best. Avoid stock photos.
                </p>
              </div>

              {/* Professional References */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Professional References * (Minimum 2)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Previous clients, colleagues, or mentors who can vouch for your work
                  </p>
                </div>
                {errors.references && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.references}
                  </p>
                )}
                <div className="space-y-6">
                  {formData.references.map((ref, i) => (
                    <Card key={i} className="p-5 bg-muted/30 border-dashed">
                      <h4 className="font-semibold mb-4 text-sm text-muted-foreground">Reference {i + 1} {i < 2 && '(required)'}</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`ref${i}Name`} className="text-sm">Full Name</Label>
                          <Input
                            id={`ref${i}Name`}
                            placeholder="John Doe"
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
                          <Label htmlFor={`ref${i}Email`} className="text-sm">Email Address</Label>
                          <Input
                            id={`ref${i}Email`}
                            type="email"
                            placeholder="john@example.com"
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
                          <Label htmlFor={`ref${i}Relation`} className="text-sm">Relationship</Label>
                          <Input
                            id={`ref${i}Relation`}
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

              {/* Pricing & Response */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="price" className="text-base">
                    Starting Price (KSh) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="50000"
                    step="10000"
                    value={formData.startingPrice}
                    onChange={e => setFormData({ ...formData, startingPrice: parseInt(e.target.value) || 0 })}
                    className={cn('h-12', errors.startingPrice && 'border-destructive')}
                  />
                  {errors.startingPrice && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.startingPrice}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Minimum budget you're willing to accept for projects
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="response" className="text-base">
                    Typical Response Time *
                  </Label>
                  <select
                    id="response"
                    value={formData.responseTime}
                    onChange={e => setFormData({ ...formData, responseTime: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg border bg-background text-foreground"
                  >
                    <option value="Within 1 hour">Within 1 hour</option>
                    <option value="Within 3 hours">Within 3 hours</option>
                    <option value="Within 24 hours">Within 24 hours</option>
                    <option value="1-2 days">1-2 days</option>
                    <option value="2-3 days">2-3 days</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    How quickly you typically respond to new inquiries
                  </p>
                </div>
              </div>

              {/* Optional Fields - Collapsible */}
              <div className="border-t pt-8">
                <button
                  type="button"
                  onClick={() => setShowOptional(!showOptional)}
                  className="flex items-center gap-2 text-lg font-semibold mb-4 hover:text-primary transition"
                >
                  {showOptional ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  Optional Fields (Recommended)
                </button>

                {showOptional && (
                  <div className="space-y-6 pl-7">
                    {/* Calendly */}
                    <div className="space-y-3">
                      <Label htmlFor="calendly" className="text-base flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Calendly Link
                      </Label>
                      <Input
                        id="calendly"
                        type="url"
                        placeholder="https://calendly.com/yourname"
                        value={formData.calendlyLink}
                        onChange={e => setFormData({ ...formData, calendlyLink: e.target.value })}
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Allow clients to book consultations directly
                      </p>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4">
                      <Label className="text-base">Social Links</Label>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="instagram" className="text-sm flex items-center gap-2">
                            <Instagram className="w-3.5 h-3.5" />
                            Instagram
                          </Label>
                          <Input
                            id="instagram"
                            placeholder="https://instagram.com/..."
                            value={formData.socialLinks.instagram}
                            onChange={e => setFormData({
                              ...formData,
                              socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                            })}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pinterest" className="text-sm flex items-center gap-2">
                            <Link2 className="w-3.5 h-3.5" />
                            Pinterest
                          </Label>
                          <Input
                            id="pinterest"
                            placeholder="https://pinterest.com/..."
                            value={formData.socialLinks.pinterest}
                            onChange={e => setFormData({
                              ...formData,
                              socialLinks: { ...formData.socialLinks, pinterest: e.target.value }
                            })}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website" className="text-sm flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5" />
                            Website
                          </Label>
                          <Input
                            id="website"
                            placeholder="https://yoursite.com"
                            value={formData.socialLinks.website}
                            onChange={e => setFormData({
                              ...formData,
                              socialLinks: { ...formData.socialLinks, website: e.target.value }
                            })}
                            className="h-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Terms */}
              <Card className="p-5 bg-muted/40 border-border/50">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  By submitting this application, you agree to Hudumalink's Terms of Service and confirm that all information provided is accurate and truthful. We verify all applications and may contact your references. Applications are typically reviewed within 24-48 hours.
                </p>
              </Card>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Submit Designer Application
                  </>
                )}
              </Button>
            </form>
          </Card>
        </section>
      </div>
    </Layout>
  );
}