// src/pages/PaymentPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import {
  Smartphone, Shield, CheckCircle, AlertCircle,
  Loader2, Lock, ArrowRight, DollarSign, AlertTriangle,
} from 'lucide-react';
import { Layout } from '@/components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

interface Project {
  _id: string;
  title: string;
  budget: number;
  status: string;
  designer: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

interface ExistingPayment {
  _id: string;
  status: string;
  amount: number;
}

export default function PaymentPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { toast } = useToast();

  const [project, setProject]                   = useState<Project | null>(null);
  const [existingPayment, setExistingPayment]   = useState<ExistingPayment | null>(null);
  const [loading, setLoading]                   = useState(true);
  const [processing, setProcessing]             = useState(false);
  const [paymentStatus, setPaymentStatus]       = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');

  // Form
  const [phoneNumber, setPhoneNumber]       = useState('');
  const [amount, setAmount]                 = useState('');
  const [agreedToTerms, setAgreedToTerms]   = useState(false);

  // Calculations
  const totalAmount    = Number(amount) || 0;
  const platformFee    = Math.round(totalAmount * 0.10);
  const designerAmount = totalAmount - platformFee;

  useEffect(() => {
    fetchPageData();
  }, [projectId]);

  const fetchPageData = async () => {
    try {
      const token = await getToken();

      const [projectRes, paymentRes] = await Promise.all([
        fetch(`http://localhost:5000/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:5000/api/payments/project/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const projectData = await projectRes.json();
      const paymentData = await paymentRes.json();

      if (projectData.success) {
        setProject(projectData.project);
        setAmount(projectData.project.budget.toString());
      }

      if (paymentData.success && paymentData.payment?.status === 'held') {
        setExistingPayment(paymentData.payment);
      }

    } catch (error) {
      console.error('Error loading payment page:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!agreedToTerms) {
      toast({
        title: 'Terms Required',
        description: 'Please agree to the terms and conditions',
        variant: 'destructive',
      });
      return;
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: 'Invalid Phone',
        description: 'Please enter a valid M-Pesa phone number',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    setPaymentStatus('pending');

    try {
      const token = await getToken();
      const res = await fetch('http://localhost:5000/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          amount: totalAmount,
          phoneNumber,
          paymentMethod: 'mpesa',
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: '📱 Check Your Phone',
          description: data.mpesa.message || 'Enter your M-Pesa PIN to complete payment',
        });
        pollPaymentStatus(data.payment._id);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setPaymentStatus('failed');
      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to initiate payment',
        variant: 'destructive',
      });
      setProcessing(false);
    }
  };

  const pollPaymentStatus = async (paymentId: string) => {
    //  FIX: poll every 3 seconds for up to 3 minutes (60 attempts)
    // Safaricom sandbox callbacks can take 60-90 seconds
    const maxAttempts = 60;
    const intervalMs  = 3000;
    let attempts      = 0;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const token = await getToken();
        const res = await fetch(`http://localhost:5000/api/payments/status/${paymentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success) {
          const status = data.payment.status;

          if (status === 'held') {
            clearInterval(interval);
            setPaymentStatus('success');
            setProcessing(false);
            toast({
              title: ' Payment Successful!',
              description: 'Funds are held securely. Your designer can now start work.',
            });
            setTimeout(() => navigate('/client/dashboard'), 2000);
            return;
          }

          if (status === 'failed') {
            clearInterval(interval);
            setPaymentStatus('failed');
            setProcessing(false);
            toast({
              title: 'Payment Failed',
              description: 'Please try again.',
              variant: 'destructive',
            });
            return;
          }
        }

        // Reassure user at 30 seconds
        if (attempts === 10) {
          toast({
            title: '⏳ Still waiting...',
            description: "Please complete the M-Pesa prompt on your phone if you haven't yet.",
          });
        }

        //  Timeout resets to idle not failed — payment may still arrive via callback
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPaymentStatus('idle');
          setProcessing(false);
          toast({
            title: 'Taking longer than expected',
            description: 'Your payment may still be processing. Check your dashboard in a few minutes.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Status poll error:', error);
      }
    }, intervalMs);
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // ── Project not found ────────────────────────────────────────────────────
  if (!project) {
    return (
      <Layout>
        <div className="container mx-auto py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <Button onClick={() => navigate('/client/dashboard')}>Go to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  // ── Already paid ─────────────────────────────────────────────────────────
  if (project.status === 'in_progress' || project.status === 'completed') {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Already Paid</h1>
            <p className="text-muted-foreground mb-6">
              Payment for <strong>{project.title}</strong> has already been completed.
              Your designer is {project.status === 'in_progress' ? 'currently working on it' : 'done'}.
            </p>
            <Button onClick={() => navigate('/client/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // ── Payment already in escrow ────────────────────────────────────────────
  if (existingPayment) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Already in Escrow</h1>
            <p className="text-muted-foreground mb-2">
              KSh {existingPayment.amount.toLocaleString()} is already held securely for this project.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Funds will be released to your designer once you approve the completed work.
            </p>
            <Button onClick={() => navigate('/client/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // ── Main payment form ────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
        <div className="container mx-auto px-4 max-w-4xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Secure Escrow Payment</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Complete Your Payment</h1>
            <p className="text-muted-foreground">
              Secure escrow payment for: <strong>{project.title}</strong>
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">

            {/* ── Left: Payment Form ── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2"
            >
              <Card className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">M-Pesa Payment</h2>
                    <p className="text-sm text-muted-foreground">Pay securely with M-Pesa</p>
                  </div>
                </div>

                <div className="space-y-6">

                  {/* Amount */}
                  <div>
                    <Label htmlFor="amount">Payment Amount (KSh)</Label>
                    <div className="relative mt-2">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-10 h-12 text-lg"
                        placeholder="Enter amount"
                        disabled={processing}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Agreed project budget: KSh {project.budget.toLocaleString()}
                    </p>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <Label htmlFor="phone">M-Pesa Phone Number</Label>
                    <div className="relative mt-2">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="pl-10 h-12"
                        placeholder="0712 345 678"
                        disabled={processing}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      You'll receive an STK push to this number
                    </p>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1"
                      disabled={processing}
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                      I agree to the{' '}
                      <a href="/terms" className="text-primary underline">Terms & Conditions</a>
                      {' '}and understand that funds will be held in escrow until I approve the completed work.
                    </label>
                  </div>

                  {/* Submit */}
                  <Button
                    onClick={handlePayment}
                    disabled={processing || !agreedToTerms || totalAmount <= 0}
                    className="w-full h-12 text-base"
                    size="lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Pay KSh {totalAmount.toLocaleString()}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  {/* Status alerts */}
                  {paymentStatus === 'pending' && (
                    <Alert>
                      <Smartphone className="w-4 h-4" />
                      <AlertDescription>
                        <p className="font-medium mb-1">Waiting for M-Pesa confirmation...</p>
                        <p className="text-xs text-muted-foreground">
                          Check your phone and enter your PIN. This can take up to 2 minutes on sandbox.
                        </p>
                      </AlertDescription>
                    </Alert>
                  )}

                  {paymentStatus === 'success' && (
                    <Alert className="border-green-500 bg-green-50">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Payment successful! Redirecting to dashboard...
                      </AlertDescription>
                    </Alert>
                  )}

                  {paymentStatus === 'failed' && (
                    <Alert variant="destructive">
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>
                        Payment failed. Please check your M-Pesa balance and try again.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* ✅ Idle after timeout — not a failure, just slow */}
                  {paymentStatus === 'idle' && !processing && amount && (
                    <Alert className="border-amber-300 bg-amber-50">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        <p className="font-medium mb-1">Payment still processing</p>
                        <p className="text-xs">
                          If you completed the M-Pesa prompt, your payment is likely still being confirmed.
                          Check your dashboard in a few minutes or try again below.
                        </p>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* ── Right: Summary & Info ── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Payment Summary */}
              <Card className="p-6">
                <h3 className="font-bold mb-4">Payment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Project Amount</span>
                    <span className="font-semibold">KSh {totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee (10%)</span>
                    <span className="font-semibold text-muted-foreground">- KSh {platformFee.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between">
                    <span className="font-semibold">Designer Receives</span>
                    <span className="font-bold text-primary">KSh {designerAmount.toLocaleString()}</span>
                  </div>
                </div>
              </Card>

              {/* Escrow Info */}
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="font-bold">Escrow Protection</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    'Payment held securely until you approve the work',
                    'Designer only gets paid after your approval',
                    'Full refund available if work is not completed',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Designer Info */}
              <Card className="p-6">
                <h3 className="font-bold mb-3">Your Designer</h3>
                <div className="flex items-center gap-3">
                  {project.designer.avatar ? (
                    <img
                      src={project.designer.avatar}
                      alt={project.designer.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                      <span className="text-xl font-bold text-primary">
                        {project.designer.name[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{project.designer.name}</p>
                    <p className="text-xs text-muted-foreground">Ready to start once paid</p>
                  </div>
                </div>
              </Card>

              {/* Processing indicator */}
              {processing && (
                <Card className="p-4 border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">Waiting for confirmation</p>
                      <p className="text-xs text-muted-foreground">
                        Sandbox can take 1-2 minutes
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}