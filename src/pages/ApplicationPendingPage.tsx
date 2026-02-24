// src/pages/ApplicationPendingPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Layout } from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Clock, Mail, CheckCircle, RefreshCw, AlertCircle,
  FileText, UserCheck, Calendar, Home
} from 'lucide-react';

export default function ApplicationPendingPage() {
  const navigate = useNavigate();
  const { getToken, isLoaded } = useAuth();
  
  const [status, setStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('pending');
  const [checking, setChecking] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applicationDetails, setApplicationDetails] = useState<any>(null);

  const checkStatus = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch('http://localhost:5000/api/users/designer-status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setStatus(data.status);
        
        // If approved, redirect to designer dashboard after a moment
        if (data.status === 'approved') {
          setTimeout(() => navigate('/designer/open-projects'), 2000);
        }
      }
    } catch (err) {
      console.error('Failed to check status:', err);
    } finally {
      setChecking(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    checkStatus();
  }, [isLoaded]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkStatus();
  };

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

  // Approved - show success message before redirect
  if (status === 'approved') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-background flex items-center justify-center px-4">
          <Card className="max-w-2xl w-full p-12 text-center shadow-2xl">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-14 h-14 text-green-600 animate-pulse" />
            </div>
            <h1 className="font-display text-4xl font-bold mb-4 text-green-900">
              🎉 Application Approved!
            </h1>
            <p className="text-xl text-gray-700 mb-6">
              Congratulations! Your designer profile has been approved.
            </p>
            <p className="text-gray-600 mb-8">
              Redirecting you to your designer dashboard...
            </p>
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
          </Card>
        </div>
      </Layout>
    );
  }

  // Rejected - show rejection message
  if (status === 'rejected') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-background flex items-center justify-center px-4">
          <Card className="max-w-2xl w-full p-12 text-center shadow-2xl">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-14 h-14 text-red-600" />
            </div>
            <h1 className="font-display text-4xl font-bold mb-4 text-red-900">
              Application Not Approved
            </h1>
            <p className="text-xl text-gray-700 mb-6">
              Unfortunately, your designer application was not approved at this time.
            </p>
            <p className="text-gray-600 mb-8">
              Please contact our support team for more details or to reapply.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate('/')}>
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Button>
              <Button asChild>
                <a href="mailto:support@hudumalink.com">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </a>
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  // No application found
  if (status === 'none') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center px-4">
          <Card className="max-w-2xl w-full p-12 text-center shadow-xl">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <FileText className="w-14 h-14 text-muted-foreground" />
            </div>
            <h1 className="font-display text-4xl font-bold mb-4">
              No Application Found
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              We couldn't find a designer application for your account.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate('/')}>
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Button>
              <Button onClick={() => navigate('/become-designer')}>
                <FileText className="w-4 h-4 mr-2" />
                Apply as Designer
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  // Pending - main screen
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-background to-background">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Application Under Review
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Thank you for applying to become a designer on Hudumalink!
            </p>
          </div>

          {/* Main Card */}
          <Card className="p-8 md:p-12 shadow-xl mb-8">
            <div className="space-y-8">
              {/* Status Badge */}
              <div className="flex justify-center">
                <Badge className="px-6 py-3 text-lg bg-amber-100 text-amber-800 hover:bg-amber-100">
                  <Clock className="w-5 h-5 mr-2" />
                  Pending Review
                </Badge>
              </div>

              {/* Timeline */}
              <div className="space-y-6">
                <h2 className="font-bold text-2xl text-center mb-8">What Happens Next?</h2>
                
                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Application Submitted</h3>
                      <p className="text-muted-foreground">
                        Your application has been received and is in our review queue.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center animate-pulse">
                        <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Admin Review (Current Step)</h3>
                      <p className="text-muted-foreground">
                        Our team is reviewing your portfolio, references, and credentials.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
                        <Mail className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Email Notification</h3>
                      <p className="text-muted-foreground">
                        You'll receive an email within 24-48 hours with the decision.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Profile Activation</h3>
                      <p className="text-muted-foreground">
                        Once approved, your designer profile will go live immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t pt-8">
                <div className="bg-muted/50 rounded-xl p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Timeline
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Typical Review Time:</span>
                      <span className="font-semibold">24-48 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Application Status:</span>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        Under Review
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="gap-2"
                >
                  {refreshing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Refresh Status
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                  <Home className="w-4 h-4 mr-2" />
                  Return to Homepage
                </Button>
              </div>
            </div>
          </Card>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Check Your Email</h3>
                  <p className="text-sm text-muted-foreground">
                    We'll send you an email as soon as your application is reviewed. Make sure to check your spam folder.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">What We're Reviewing</h3>
                  <p className="text-sm text-muted-foreground">
                    Portfolio quality, professional references, ID verification, and profile completeness.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}