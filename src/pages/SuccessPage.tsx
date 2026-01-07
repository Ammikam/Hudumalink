import { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Home, Users, Bell, Sparkles } from 'lucide-react';
import { Layout } from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import confetti from 'canvas-confetti';

export default function ProjectSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectTitle } = (location.state as { projectTitle?: string }) || {};

  useEffect(() => {
    // Redirect if no project title (direct navigation)
    if (!projectTitle) {
      navigate('/dashboard');
      return;
    }

    // Trigger confetti animation
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#C87941', '#E6A969', '#F5D5B8'],
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#C87941', '#E6A969', '#F5D5B8'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [projectTitle, navigate]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-secondary/5 to-transparent py-12 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-32 h-32 mx-auto mb-8 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full opacity-20 animate-pulse" />
              <div className="absolute inset-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-16 h-16 text-white" />
              </div>
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="font-display text-4xl lg:text-6xl font-bold mb-4">
                Project Posted Successfully!
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground mb-8">
                {projectTitle}
              </p>
            </motion.div>

            {/* What Happens Next */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="card-elevated p-8 lg:p-12 text-left mb-8">
                <div className="flex items-center gap-3 mb-8">
                  <Sparkles className="w-6 h-6 text-gold" />
                  <h2 className="font-display text-2xl lg:text-3xl font-bold">
                    What Happens Next?
                  </h2>
                </div>

                <div className="space-y-8">
                  {/* Step 1 */}
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-2">
                        Designers Review Your Project
                      </h3>
                      <p className="text-muted-foreground">
                        Top designers in Kenya will review your project details and decide if
                        they're a good fit for your vision.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-lg">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-2">
                        You'll Receive Proposals (24-48 hours)
                      </h3>
                      <p className="text-muted-foreground">
                        Interested designers will send you personalized proposals with their
                        approach, timeline, and quote. You'll be notified via email.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-bold text-lg">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-2">
                        Compare & Choose Your Designer
                      </h3>
                      <p className="text-muted-foreground">
                        Review proposals, check portfolios, and message designers. Choose the
                        one that best matches your style and budget.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold text-white flex items-center justify-center font-bold text-lg">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-2">
                        Start Your Design Journey
                      </h3>
                      <p className="text-muted-foreground">
                        Once you hire a designer, work together to bring your vision to life.
                        Track progress through milestones and stay connected via messaging.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Action Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid md:grid-cols-3 gap-6 mb-8"
            >
              <Card className="card-premium p-6 hover:shadow-strong transition-all">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Home className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">View Dashboard</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Track your project and view incoming proposals
                </p>
                <Button asChild className="w-full">
                  <Link to="/dashboard/client">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </Card>

              <Card className="card-premium p-6 hover:shadow-strong transition-all">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Browse Designers</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Explore profiles and invite specific designers
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/designers">
                    View Designers
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </Card>

              <Card className="card-premium p-6 hover:shadow-strong transition-all">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Get Notified</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We'll email you when designers send proposals
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Notifications On ✓
                </Button>
              </Card>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="card-premium p-6 bg-muted/50 text-left">
                <h3 className="font-semibold text-lg mb-4">💡 Pro Tips</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>
                      Most clients receive 3-7 proposals within 48 hours
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>
                      Check designer portfolios and reviews before making your choice
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>
                      Don't hesitate to message designers with questions
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>
                      You can edit your project details anytime from your dashboard
                    </span>
                  </li>
                </ul>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}