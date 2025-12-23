import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Button } from '../components/ui/button';
import { formatCurrency } from '../data/MockData';

const steps = ['Project Details', 'Upload Photos', 'Budget & Style', 'Contact'];

export default function PostProjectPage() {
  const [step, setStep] = useState(0);
  const [budget, setBudget] = useState(500000);

  return (
    <Layout hideFooter>
      <div className="min-h-[80vh] py-8">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {steps.map((s, i) => (
                <div key={s} className={`text-sm font-medium ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}>
                  {s}
                </div>
              ))}
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary rounded-full" 
                initial={{ width: '0%' }}
                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card-elevated p-6 lg:p-8">
            {step === 0 && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold">Tell us about your project</h2>
                <div>
                  <label className="block text-sm font-medium mb-2">Project Title</label>
                  <input type="text" placeholder="e.g., Modern Living Room Makeover" className="w-full h-12 px-4 rounded-xl bg-muted border-0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea rows={4} placeholder="Describe your vision..." className="w-full px-4 py-3 rounded-xl bg-muted border-0 resize-none" />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold">Upload photos of your space</h2>
                <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium">Drag & drop photos here</p>
                  <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                  <Button variant="outline">Choose Files</Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold">Budget & Style</h2>
                <div>
                  <label className="block text-sm font-medium mb-2">Budget: {formatCurrency(budget)}</label>
                  <input type="range" min={50000} max={5000000} step={50000} value={budget} onChange={(e) => setBudget(+e.target.value)} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Style Preferences</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Modern', 'African Fusion', 'Minimalist', 'Luxury'].map((s) => (
                      <label key={s} className="flex items-center gap-2 p-3 rounded-xl bg-muted cursor-pointer hover:bg-muted/80">
                        <input type="checkbox" className="rounded" />
                        <span>{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold">Contact Information</h2>
                <div className="grid gap-4">
                  <input type="text" placeholder="Your Name" className="w-full h-12 px-4 rounded-xl bg-muted border-0" />
                  <input type="email" placeholder="Email" className="w-full h-12 px-4 rounded-xl bg-muted border-0" />
                  <input type="tel" placeholder="+254 7XX XXX XXX" className="w-full h-12 px-4 rounded-xl bg-muted border-0" />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              {step < steps.length - 1 ? (
                <Button onClick={() => setStep(step + 1)}>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button variant="terracotta">
                  <Check className="w-4 h-4 mr-2" /> Submit Project
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
