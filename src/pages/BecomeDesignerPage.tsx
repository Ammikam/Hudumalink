import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react'; 
import { useRoles } from '@/contexts/Rolecontext';
import { Layout } from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle2 } from 'lucide-react';

const styles = ['Modern', 'African Fusion', 'Minimalist', 'Luxury', 'Bohemian', 'Coastal', 'Budget-Friendly'];

export default function BecomeDesignerPage() {
  const navigate = useNavigate();
  
  // Clerk hooks
  const { userId, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser(); // Now we have full user object
  
  const { isDesigner, refreshRoles } = useRoles();

  const isLoaded = isAuthLoaded && isUserLoaded;

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    about: '',
    selectedStyles: [] as string[],
    startingPrice: 250000,
    responseTime: '24 hours',
    portfolioUrls: ['', '', ''],
    calendlyLink: '',
    coverImageUrl: '',
  });

  // Loading state
  if (!isLoaded) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  // Not signed in
  if (!userId) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <h1 className="font-display text-4xl font-bold mb-6">
            Please Sign In
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            You need to be signed in to apply as a designer.
          </p>
          <Button size="lg" onClick={() => navigate('/signin')}>
            Sign In to Continue
          </Button>
        </div>
      </Layout>
    );
  }

  // Already a designer
  if (isDesigner) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <CheckCircle2 className="w-20 h-20 mx-auto mb-6 text-accent" />
          <h1 className="font-display text-4xl font-bold mb-4">
            You're Already a Designer!
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Welcome back, {user?.firstName || 'Designer'}! Head to your dashboard to manage your profile.
          </p>
          <Button size="lg" onClick={() => navigate('/dashboard')}>
            Go to Designer Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('http://localhost:5000/api/users/apply-designer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: userId,
          name: user?.fullName || '',
          email: user?.primaryEmailAddress?.emailAddress || '',
          ...formData,
        }),
      });

      const data = await res.json();

      if (data.success) {
        await refreshRoles();
        navigate('/designer/application-pending');
      } else {
        alert(data.error || 'Application failed. Please try again.');
      }
    } catch (error) {
      console.error('Application error:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4">
            Become a Designer on Hudumalink
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join Kenya's premier interior design marketplace and connect with clients looking for your expertise
          </p>
        </div>

        <Card className="card-elevated p-8 lg:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Westlands, Nairobi"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            {/* About */}
            <div className="space-y-2">
              <Label htmlFor="about">About You *</Label>
              <Textarea
                id="about"
                rows={6}
                placeholder="Tell clients about your design philosophy, experience, and what makes you unique..."
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                required
              />
            </div>

            {/* Styles */}
            <div className="space-y-4">
              <Label>Your Design Styles *</Label>
              <p className="text-sm text-muted-foreground">
                Select all that apply
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {styles.map(style => (
                  <div
                    key={style}
                    onClick={() => {
                      const selected = formData.selectedStyles.includes(style)
                        ? formData.selectedStyles.filter(s => s !== style)
                        : [...formData.selectedStyles, style];
                      setFormData({ ...formData, selectedStyles: selected });
                    }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.selectedStyles.includes(style)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="font-medium">{style}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Starting Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Starting Price (KSh) *</Label>
              <Input
                id="price"
                type="number"
                min="50000"
                step="10000"
                value={formData.startingPrice}
                onChange={(e) => setFormData({ ...formData, startingPrice: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            {/* Portfolio URLs */}
            <div className="space-y-4">
              <Label>Portfolio Image URLs (3 recommended)</Label>
              <p className="text-sm text-muted-foreground">
                Add links to your best work (we'll add direct upload soon)
              </p>
              {[0, 1, 2].map(i => (
                <Input
                  key={i}
                  placeholder={`Portfolio image ${i + 1} URL`}
                  value={formData.portfolioUrls[i]}
                  onChange={(e) => {
                    const urls = [...formData.portfolioUrls];
                    urls[i] = e.target.value;
                    setFormData({ ...formData, portfolioUrls: urls });
                  }}
                />
              ))}
            </div>

            {/* Calendly Link */}
            <div className="space-y-2">
              <Label htmlFor="calendly">Calendly Link (Optional)</Label>
              <Input
                id="calendly"
                type="url"
                placeholder="https://calendly.com/yourname"
                value={formData.calendlyLink}
                onChange={(e) => setFormData({ ...formData, calendlyLink: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              size="xl"
              className="w-full"
              disabled={submitting || formData.selectedStyles.length === 0}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                'Submit Designer Application'
              )}
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
}