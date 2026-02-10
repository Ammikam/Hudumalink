// src/pages/designerpages/DesignerProfilePage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Star, 
  Clock, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Loader2,
  DollarSign,
  ImageIcon,
  Edit,
  Plus,
  Settings,
  Eye,
  BarChart3,
  MessageSquare,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BeforeAfterSlider } from '@/components/ui/before-after-slider';
import { Layout } from '@/components/Layout/Layout';
import { useToast } from '@/components/ui/use-toast';

interface PortfolioItem {
  _id: string;
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  style: string;
  budget: number;
  timeline: string;
  location: string;
}

interface Review {
  _id: string;
  clientName: string;
  clientAvatar: string;
  rating: number;
  comment: string;
  date: string;
  projectImage?: string;
}

interface Designer {
  _id: string;
  clerkId: string;
  name: string;
  avatar: string;
  coverImage?: string;
  tagline: string;
  location: string;
  verified: boolean;
  superVerified: boolean;
  rating: number;
  reviewCount: number;
  responseTime: string;
  startingPrice: number;
  about: string;
  styles: string[];
  projectsCompleted: number;
  portfolio: PortfolioItem[];
  reviews: Review[];
  calendlyLink?: string;
  socialLinks?: {
    instagram?: string;
    pinterest?: string;
    website?: string;
  };
}

export default function DesignerProfilePage() {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [designer, setDesigner] = useState<Designer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isLoaded) return;

    // Redirect if not logged in
    if (!user) {
      navigate('/sign-in');
      return;
    }

    const fetchDesignerProfile = async () => {
      try {
        setLoading(true);
        console.log('Fetching designer profile for clerkId:', user.id);

        // First, get the user's MongoDB _id from their clerkId
        const userRes = await fetch(`http://localhost:5000/api/users/${user.id}`);
        
        if (!userRes.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await userRes.json();
        console.log('User data:', userData);

        if (!userData.success || !userData.user?.designerProfile) {
          toast({
            title: "Not a Designer",
            description: "You don't have a designer profile yet.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        // Now fetch the full designer profile
        const designerRes = await fetch(`http://localhost:5000/api/designers/${userData.user.id}`);
        
        if (!designerRes.ok) {
          throw new Error('Failed to fetch designer profile');
        }

        const designerData = await designerRes.json();
        console.log('Designer data:', designerData);

        if (designerData.success) {
          setDesigner(designerData.designer);
        } else {
          throw new Error(designerData.error || 'Designer profile not found');
        }
      } catch (err: unknown) {
        console.error('Fetch error:', err);

        let message = "Failed to load your profile";
        if (err instanceof Error) {
          message = err.message;
        }

        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDesignerProfile();
  }, [user, isLoaded, navigate, toast]);

  if (!isLoaded || loading) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </Layout>
    );
  }

  if (!designer) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <h1 className="font-display text-4xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-8">
            We couldn't load your designer profile. Please try again.
          </p>
          <Button onClick={() => window.location.reload()} size="lg">
            Retry
          </Button>
        </div>
      </Layout>
    );
  }

  const filledStars = Math.floor(designer.rating);
  const hasHalfStar = designer.rating % 1 >= 0.5;

  return (
    <Layout>
      {/* Hero Section with Edit Controls */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img
          src={designer.coverImage || "https://images.unsplash.com/photo-1618221195710-dd2dabb60b29?w=1600"}
          alt="Cover"
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

        {/* Edit Cover Button */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm hover:bg-white/20"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Cover
        </Button>

        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 lg:px-8 pb-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8">
              {/* Avatar */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <Avatar className="w-32 h-32 lg:w-40 lg:h-40 ring-8 ring-cream/80 shadow-2xl">
                  <AvatarImage src={designer.avatar} alt={designer.name} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent text-white">
                    {designer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>

                {designer.verified && (
                  <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                )}
              </motion.div>

              {/* Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex-1 text-white"
              >
                <div className="flex items-center flex-wrap gap-4 mb-4">
                  <h1 className="font-display text-4xl lg:text-6xl font-bold drop-shadow-lg">
                    {designer.name}
                  </h1>

                  {designer.superVerified && (
                    <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-4 py-2 shadow-glow">
                      <Sparkles className="w-5 h-5 mr-2" fill="black" />
                      Super Verified
                    </Badge>
                  )}
                </div>

                <p className="text-xl lg:text-2xl mb-6 opacity-90">
                  {designer.tagline || "Creative Interior Designer & Space Planner"}
                </p>

                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-base mb-8">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {designer.location || "Nairobi, Kenya"}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < filledStars
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-white/40'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold">
                      {designer.rating.toFixed(1)} ({designer.reviewCount} reviews)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{designer.responseTime || "a few hours"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-primary to-accent"
                  >
                    <Edit className="w-5 h-5 mr-2" />
                    Edit Profile
                  </Button>

                  <Button 
                    size="lg" 
                    variant="secondary"
                    className="bg-white/10 backdrop-blur-sm border-white/30 hover:bg-white/20 text-white"
                    onClick={() => window.open(`/designers/${designer._id}`, '_blank')}
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    Preview Public Profile
                  </Button>

                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-white/50 text-white hover:bg-white/10"
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    Settings
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <section className="py-12 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 h-14">
              <TabsTrigger value="overview" className="text-base">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="text-base">
                <Briefcase className="w-4 h-4 mr-2" />
                Portfolio
              </TabsTrigger>
              <TabsTrigger value="reviews" className="text-base">
                <MessageSquare className="w-4 h-4 mr-2" />
                Reviews
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-base">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Stats Cards */}
                <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-muted-foreground">Projects Completed</h3>
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-4xl font-bold text-primary">{designer.projectsCompleted}</div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-muted-foreground">Average Rating</h3>
                    <Star className="w-5 h-5 text-accent fill-accent" />
                  </div>
                  <div className="text-4xl font-bold text-accent">{designer.rating.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground mt-1">from {designer.reviewCount} reviews</p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-muted-foreground">Response Time</h3>
                    <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold text-blue-500">{designer.responseTime}</div>
                </Card>
              </div>

              {/* About Section */}
              <Card className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold">About</h2>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
                <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap mb-6">
                  {designer.about || "Add a description about your work and expertise..."}
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Styles & Specialties</h3>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {designer.styles?.map(style => (
                      <Badge key={style} variant="secondary" className="text-base px-4 py-2">
                        {style}
                      </Badge>
                    ))}
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Portfolio Tab */}
            <TabsContent value="portfolio" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-3xl font-bold">Portfolio</h2>
                <Button className="bg-gradient-to-r from-primary to-accent">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Project
                </Button>
              </div>

              {designer.portfolio?.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {designer.portfolio.map((item) => (
                    <Card key={item._id} className="group overflow-hidden">
                      <div className="relative">
                        <BeforeAfterSlider
                          beforeImage={item.beforeImage}
                          afterImage={item.afterImage}
                          className="aspect-[4/3] w-full"
                        />
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="secondary">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{item.style}</Badge>
                          <span>•</span>
                          <span>{item.timeline}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-2xl font-bold mb-2">No Portfolio Items Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Showcase your best work to attract more clients
                  </p>
                  <Button className="bg-gradient-to-r from-primary to-accent">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Your First Project
                  </Button>
                </Card>
              )}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-3xl font-bold">Client Reviews</h2>
                  <p className="text-muted-foreground mt-2">
                    {designer.reviewCount} total reviews • {designer.rating.toFixed(1)} average rating
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${
                          i < Math.floor(designer.rating)
                            ? 'fill-primary text-primary'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {designer.reviews?.length > 0 ? (
                <div className="grid gap-6">
                  {designer.reviews.map(review => (
                    <Card key={review._id} className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={review.clientAvatar} />
                          <AvatarFallback>{review.clientName[0]}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold">{review.clientName}</h4>
                              <p className="text-sm text-muted-foreground">{review.date}</p>
                            </div>

                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <p className="leading-relaxed">"{review.comment}"</p>

                          {review.projectImage && (
                            <div className="mt-4 rounded-lg overflow-hidden border">
                              <img 
                                src={review.projectImage} 
                                alt="Project" 
                                className="w-full h-48 object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-2xl font-bold mb-2">No Reviews Yet</h3>
                  <p className="text-muted-foreground">
                    Complete projects to start receiving client reviews
                  </p>
                </Card>
              )}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="p-6">
                <h2 className="font-display text-2xl font-bold mb-6">Profile Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="font-semibold mb-2 block">Calendly Link</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 px-4 py-2 border rounded-lg"
                        placeholder="https://calendly.com/your-link"
                        defaultValue={designer.calendlyLink}
                      />
                      <Button variant="outline">Save</Button>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold mb-2 block">Starting Price (KSh)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        className="flex-1 px-4 py-2 border rounded-lg"
                        placeholder="50000"
                        defaultValue={designer.startingPrice}
                      />
                      <Button variant="outline">Save</Button>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold mb-2 block">Response Time</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 px-4 py-2 border rounded-lg"
                        placeholder="a few hours"
                        defaultValue={designer.responseTime}
                      />
                      <Button variant="outline">Save</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}