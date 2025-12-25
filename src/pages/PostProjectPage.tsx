import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, ArrowRight, ArrowLeft, Check } from 'lucide-react';
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

const steps = ['Project Details', 'Upload Photos', 'Budget & Style', 'Contact'];

const styles = ['Modern', 'African Fusion', 'Minimalist', 'Luxury', 'Bohemian', 'Coastal', 'Budget-Friendly'];

export default function PostProjectPage() {
  const location = useLocation();
  const prefilled = location.state as {
    roomType?: string;
    budgetMin?: number;
    budgetMax?: number;
    style?: string;
  } | null;

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(prefilled?.roomType ? `${prefilled.roomType} Design Project` : '');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState<number[]>(prefilled ? [Math.round((prefilled.budgetMin! + prefilled.budgetMax!) / 2)] : [500000]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(prefilled?.style ? [prefilled.style] : []);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
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
                  className={`flex items-center gap-3 ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
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
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Modern Living Room Makeover in Westlands"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your vision, what you like/dislike about your current space, inspiration ideas..."
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="resize-none"
                  />
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
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          setUploadedFiles(prev => [...prev, ...files]);

          files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
              setPreviewUrls(prev => [...prev, ev.target?.result as string]);
            };
            reader.readAsDataURL(file);
          });
        }}
      />

      <div className="border-4 border-dashed border-border/50 rounded-3xl p-16 hover:border-primary/50 transition-colors text-center">
        <Upload className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
        <p className="text-xl font-medium mb-2">Click anywhere or drag & drop</p>
        <p className="text-muted-foreground mb-6">PNG, JPG up to 10MB</p>
        <Button size="lg" variant="outline" type="button">
          Choose Photos
        </Button>
      </div>
    </div>

    {/* Preview Grid */}
    {previewUrls.length > 0 && (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
        {previewUrls.map((url, i) => (
          <div key={i} className="relative group rounded-xl overflow-hidden">
            <img src={url} alt={`Preview ${i + 1}`} className="w-full h-64 object-cover" />
            <button
              type="button"
              onClick={() => {
                setPreviewUrls(prev => prev.filter((_, index) => index !== i));
                setUploadedFiles(prev => prev.filter((_, index) => index !== i));
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

            {/* Step 2: Budget & Style – FIXED SLIDER */}
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
                  <Label className="text-lg font-medium">Preferred Styles</Label>
                  <p className="text-sm text-muted-foreground">Select all that apply</p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {styles.map((style) => (
                      <div
                        key={style}
                        onClick={() => toggleStyle(style)}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all",
                          selectedStyles.includes(style)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 bg-card"
                        )}
                      >
                        <Checkbox
                          checked={selectedStyles.includes(style)}
                          onCheckedChange={() => toggleStyle(style)}
                        />
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
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Kamau" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+254 712 345 678" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-12 pt-8 border-t border-border">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>

              {step < steps.length - 1 ? (
                <Button size="lg" onClick={() => setStep(step + 1)}>
                  Next Step
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
               <Button size="lg" variant="terracotta" asChild>
  <Link to="/success">
    <Check className="w-5 h-5 mr-2" />
    Submit Project
  </Link>
</Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}