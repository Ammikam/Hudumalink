// src/pages/ClientProfilePage.tsx - COMPATIBLE WITH ALL CLERK VERSIONS
import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Layout } from '@/components/Layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, User, Mail, Phone, MapPin, 
  Camera, Save, CheckCircle, AlertCircle 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ClientProfilePage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { toast } = useToast();

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load user data from Clerk
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.primaryPhoneNumber?.phoneNumber || '');
      // Read location from unsafeMetadata (works with all versions)
      setLocation((user.unsafeMetadata?.location as string) || '');
    }
  }, [user]);

  // Update profile using backend API
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // ✅ SOLUTION 1: Update name using Clerk's update() method
      await user?.update({
        firstName,
        lastName,
      });

      // ✅ SOLUTION 2: Store custom data in your backend
      // This works with ALL Clerk versions and gives you more control
      const token = await getToken();
      if (token) {
        await fetch('https://hudumalink-backend.onrender.com/api/users/update-profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            location,
            phone,
          }),
        });
      }

      toast({
        title: '✅ Profile Updated',
        description: 'Your profile has been saved successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Upload profile image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please choose an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please choose an image file.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingImage(true);
    try {
      // ✅ This works with all Clerk versions
      await user?.setProfileImage({ file });

      toast({
        title: '✅ Image Updated',
        description: 'Your profile image has been updated.',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!confirm(
      'Are you sure you want to delete your account? This action cannot be undone.\n\n' +
      'All your projects, messages, and data will be permanently deleted.'
    )) return;

    if (!confirm('This is your final warning. Delete account permanently?')) return;

    try {
      await user?.delete();
      // User will be redirected to sign-in by Clerk
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete account. Please contact support.',
        variant: 'destructive',
      });
    }
  };

  if (!isLoaded) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-transparent">
        <div className="container mx-auto py-12 px-4 max-w-4xl">
          
          {/* Header */}
          <div className="mb-10">
            <h1 className="font-display text-4xl font-bold mb-2">Profile Settings</h1>
            <p className="text-muted-foreground text-lg">
              Manage your account information and preferences
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="account">
                <Mail className="w-4 h-4 mr-2" />
                Account
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Personal Information</h2>

                <div className="space-y-6">
                  {/* Profile Image */}
                  <div className="flex flex-col items-center gap-4 pb-6 border-b">
                    <Avatar className="w-32 h-32 ring-4 ring-border">
                      <AvatarImage src={user?.imageUrl} />
                      <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-accent text-white">
                        {user?.firstName?.[0]?.toUpperCase() || 'C'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="text-center">
                      <input
                        type="file"
                        accept="image/*"
                        id="avatar-upload"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4 mr-2" />
                            Change Photo
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  {/* Email (Read-only from Clerk) */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={user?.primaryEmailAddress?.emailAddress || ''}
                        disabled
                        className="pl-10 bg-muted"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Email is managed by your account provider
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+254 712 345 678"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Used for project notifications
                    </p>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Nairobi, Kenya"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Help designers know where you're based
                    </p>
                  </div>

                  {/* Save Button */}
                  <div className="pt-6 border-t">
                    <Button
                      size="lg"
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="w-full md:w-auto"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account">
              <div className="space-y-6">
                {/* Account Status */}
                <Card className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Account Status</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-900">Account Active</p>
                          <p className="text-sm text-green-700">
                            Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'recently'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 pt-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">User ID</p>
                        <p className="font-mono text-xs break-all">{user?.id}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Account Type</p>
                        <p className="font-semibold">Client</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Security */}
                <Card className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Security</h2>
                  
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>
                        Password and security settings are managed through your account provider.
                      </AlertDescription>
                    </Alert>
                  </div>
                </Card>

                {/* Danger Zone */}
                <Card className="p-8 border-destructive">
                  <h2 className="text-2xl font-bold mb-2 text-destructive">Danger Zone</h2>
                  <p className="text-muted-foreground mb-6">
                    Permanently delete your account and all associated data
                  </p>
                  
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Warning:</strong> This action cannot be undone. All your projects, 
                      messages, and account data will be permanently deleted.
                    </AlertDescription>
                  </Alert>

                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                  >
                    Delete Account
                  </Button>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}