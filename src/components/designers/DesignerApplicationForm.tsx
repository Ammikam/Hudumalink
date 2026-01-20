// src/components/DesignerApplicationForm.tsx
import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Upload, CheckCircle, Image, User, Award, Briefcase, AlertCircle, Shield, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/services/api';

interface PortfolioProject {
  projectName: string;
  projectType: string;
  description: string;
  beforeImage?: {
    file: File;
    preview: string;
  };
  afterImage?: {
    file: File;
    preview: string;
  };
}

const DesignerApplicationForm = () => {
  const { getToken } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    idNumber: '',
    experience: '',
    education: '',
    portfolioProjects: [] as PortfolioProject[],
    credentials: [] as File[],
    references: [{ name: '', email: '', relation: '' }],
    socialLinks: {
      instagram: '',
      pinterest: '',
      website: '',
    },
    agreeToTerms: false,
  });

  // Pre-fill name and email from Clerk when user loads
  useEffect(() => {
    if (isUserLoaded && user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ') || '',
        email: user.primaryEmailAddress?.emailAddress || '',
      }));
    }
  }, [isUserLoaded, user]);

  const steps = [
    { num: 1, title: 'Contact & ID', icon: User },
    { num: 2, title: 'Portfolio', icon: Image },
    { num: 3, title: 'Credentials', icon: Award },
    { num: 4, title: 'References & Agreement', icon: Briefcase },
  ];

  const addPortfolioProject = () => {
    setFormData(prev => ({
      ...prev,
      portfolioProjects: [
        ...prev.portfolioProjects,
        {
          projectName: '',
          projectType: '',
          description: '',
          beforeImage: undefined,
          afterImage: undefined,
        },
      ],
    }));
  };

  const updatePortfolioProject = (index: number, field: keyof PortfolioProject, value: string) => {
    const updated = [...formData.portfolioProjects];
    // @ts-ignore
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, portfolioProjects: updated }));
  };

  const setBeforeImage = (index: number, file: File) => {
    const updated = [...formData.portfolioProjects];
    updated[index].beforeImage = {
      file,
      preview: URL.createObjectURL(file),
    };
    setFormData(prev => ({ ...prev, portfolioProjects: updated }));
  };

  const setAfterImage = (index: number, file: File) => {
    const updated = [...formData.portfolioProjects];
    updated[index].afterImage = {
      file,
      preview: URL.createObjectURL(file),
    };
    setFormData(prev => ({ ...prev, portfolioProjects: updated }));
  };

  const removePortfolioProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      portfolioProjects: prev.portfolioProjects.filter((_, i) => i !== index),
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'credentials') => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, credentials: [...prev.credentials, ...files] }));
  };

  const addReference = () => {
    setFormData(prev => ({
      ...prev,
      references: [...prev.references, { name: '', email: '', relation: '' }],
    }));
  };

  const updateReference = (index: number, field: string, value: string) => {
    const updated = [...formData.references];
    // @ts-ignore
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, references: updated }));
  };

  const handleSubmit = async () => {
    const hasValidProject = formData.portfolioProjects.some(
      (p) =>
        p.beforeImage &&
        p.afterImage &&
        p.projectName.trim() &&
        p.projectType.trim() &&
        p.description.trim()
    );

    if (formData.portfolioProjects.length === 0 || !hasValidProject) {
      alert('Please add at least one project with Before and After images, name, type, and description');
      return;
    }

    if (!formData.agreeToTerms) {
      alert('You must agree to the verification terms');
      return;
    }

    if (!formData.phone.trim() || !formData.idNumber.trim()) {
      alert('Please provide your phone number and National ID number');
      return;
    }

    setSubmitting(true);

    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication required');

      const form = new FormData();

      // Personal info (pre-filled + editable)
      form.append('fullName', formData.fullName.trim());
      form.append('email', formData.email.trim());
      form.append('phone', formData.phone.trim());
      form.append('idNumber', formData.idNumber.trim());
      form.append('experience', formData.experience);
      form.append('education', formData.education.trim());

      // Social & references
      form.append('socialLinks', JSON.stringify(formData.socialLinks));
      form.append('references', JSON.stringify(formData.references));

      // Portfolio: all images under 'portfolioImages'
      formData.portfolioProjects.forEach((project, i) => {
        if (project.beforeImage) {
          form.append('portfolioImages', project.beforeImage.file);
        }
        if (project.afterImage) {
          form.append('portfolioImages', project.afterImage.file);
        }
        form.append(`projects[${i}][projectName]`, project.projectName);
        form.append(`projects[${i}][projectType]`, project.projectType);
        form.append(`projects[${i}][description]`, project.description);
      });

      // Credentials
      formData.credentials.forEach((file) => {
        form.append('credentials', file);
      });

      const data = await api.submitDesignerApplication(form, token);

      if (data.success) {
        setSubmitted(true);
      } else {
        alert(data.error || 'Submission failed');
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      alert(err.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto p-12 text-center">
        <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4">Application Submitted Successfully!</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Thank you for applying to become a verified designer on HudumaLink.
        </p>
        <p className="text-muted-foreground">
          Our team will review your portfolio and credentials within 3-5 business days.
          You'll be notified by email when approved.
        </p>
      </Card>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Card className="p-8 shadow-xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Become a Verified Designer</h1>
          <p className="text-lg text-muted-foreground">
            Join Kenya's most trusted interior design marketplace.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center relative">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                      currentStep >= step.num
                        ? 'bg-purple-600 text-white shadow-lg scale-110'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <p
                    className={`mt-3 text-sm font-medium absolute top-full whitespace-nowrap ${
                      currentStep >= step.num ? 'text-purple-600' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-4 transition-colors duration-500 ${
                      currentStep > step.num ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1: Contact & ID (Pre-filled Name/Email) */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-5 flex gap-4">
              <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-800">Your Account Info</p>
                <p className="text-sm text-green-700 mt-1">
                  Name and email are taken from your verified account. Only phone and ID number are needed.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Full Name (from your account)</Label>
                <Input value={formData.fullName} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>Email (verified)</Label>
                <Input value={formData.email} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>Phone Number *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+254 712 345 678"
                />
              </div>
              <div>
                <Label>National ID Number *</Label>
                <Input
                  value={formData.idNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                  placeholder="12345678"
                />
              </div>
              <div>
                <Label>Years of Experience</Label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Select...</option>
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
              <div>
                <Label>Education / Certification</Label>
                <Input
                  value={formData.education}
                  onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                  placeholder="B.Sc Interior Design"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Portfolio - Grouped Before/After */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
              <div className="flex gap-4">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-800 mb-2">Portfolio Requirements (Testing Mode)</p>
                  <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                    <li>Add at least 1 project with Before & After images</li>
                    <li>Describe what you changed and why</li>
                    <li>All work must be original</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-semibold text-lg">Your Projects ({formData.portfolioProjects.length})</h3>

              {formData.portfolioProjects.map((project, index) => (
                <Card key={index} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Project {index + 1}</h4>
                    <Button variant="destructive" size="sm" onClick={() => removePortfolioProject(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Label>Project Name</Label>
                      <Input
                        value={project.projectName}
                        onChange={(e) => updatePortfolioProject(index, 'projectName', e.target.value)}
                        placeholder="Modern Kitchen Renovation"
                      />
                    </div>
                    <div>
                      <Label>Project Type</Label>
                      <select
                        value={project.projectType}
                        onChange={(e) => updatePortfolioProject(index, 'projectType', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        <option value="">Select type</option>
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="hospitality">Hospitality</option>
                        <option value="office">Office</option>
                        <option value="retail">Retail</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-6">
                    <Label>Project Description</Label>
                    <Textarea
                      value={project.description}
                      onChange={(e) => updatePortfolioProject(index, 'description', e.target.value)}
                      rows={4}
                      placeholder="Describe the challenge, your solution, materials used, and client feedback..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Before Image */}
                    <div>
                      <Label>Before Image</Label>
                      <div className="mt-2">
                        {project.beforeImage ? (
                          <div>
                            <img src={project.beforeImage.preview} alt="Before" className="w-full h-64 object-cover rounded-lg mb-3" />
                            <Button variant="outline" size="sm" onClick={() => {
                              const updated = [...formData.portfolioProjects];
                              updated[index].beforeImage = undefined;
                              setFormData(prev => ({ ...prev, portfolioProjects: updated }));
                            }}>
                              Change Image
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed rounded-lg p-8 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files && setBeforeImage(index, e.target.files[0])}
                              className="hidden"
                              id={`before-${index}`}
                            />
                            <label htmlFor={`before-${index}`} className="cursor-pointer">
                              <Upload className="mx-auto h-10 w-10 text-gray-400" />
                              <p className="mt-2 text-sm">Upload Before Photo</p>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* After Image */}
                    <div>
                      <Label>After Image</Label>
                      <div className="mt-2">
                        {project.afterImage ? (
                          <div>
                            <img src={project.afterImage.preview} alt="After" className="w-full h-64 object-cover rounded-lg mb-3" />
                            <Button variant="outline" size="sm" onClick={() => {
                              const updated = [...formData.portfolioProjects];
                              updated[index].afterImage = undefined;
                              setFormData(prev => ({ ...prev, portfolioProjects: updated }));
                            }}>
                              Change Image
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed rounded-lg p-8 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files && setAfterImage(index, e.target.files[0])}
                              className="hidden"
                              id={`after-${index}`}
                            />
                            <label htmlFor={`after-${index}`} className="cursor-pointer">
                              <Upload className="mx-auto h-10 w-10 text-gray-400" />
                              <p className="mt-2 text-sm">Upload After Photo</p>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              <Button type="button" onClick={addPortfolioProject} className="w-full">
                <Plus className="w-5 h-5 mr-2" />
                Add New Project
              </Button>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <Label>Social Media Links (Optional)</Label>
              <Input
                value={formData.socialLinks.instagram}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                }))}
                placeholder="Instagram URL"
              />
              <Input
                value={formData.socialLinks.pinterest}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, pinterest: e.target.value }
                }))}
                placeholder="Pinterest URL"
              />
              <Input
                value={formData.socialLinks.website}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, website: e.target.value }
                }))}
                placeholder="Website URL"
              />
            </div>
          </div>
        )}

        {/* Step 3: Credentials */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <p className="font-semibold text-blue-800 mb-2">Professional Credentials</p>
              <p className="text-sm text-blue-700">
                Upload certificates, licenses, or professional memberships (e.g., IDAK, AAK, NCIDQ)
              </p>
            </div>

            <div>
              <Label>Upload Documents (PDF, JPG, PNG)</Label>
              <div className="mt-3 border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:border-purple-500 transition">
                <input
                  type="file"
                  multiple
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileUpload(e, 'credentials')}
                  className="hidden"
                  id="credentials-upload"
                />
                <label htmlFor="credentials-upload" className="cursor-pointer">
                  <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium">Click to upload credentials</p>
                  <p className="text-sm text-gray-500 mt-1">Max 5MB each</p>
                </label>
              </div>

              {formData.credentials.length > 0 && (
                <div className="mt-6 space-y-3">
                  <p className="font-medium">Uploaded Files ({formData.credentials.length})</p>
                  {formData.credentials.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: References & Agreement */}
        {currentStep === 4 && (
          <div className="space-y-8">
            <div>
              <Label>Professional References (At least 2 recommended)</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Previous clients or employers who can vouch for your work
              </p>

              {formData.references.map((ref, index) => (
                <Card key={index} className="p-6 mb-4">
                  <h4 className="font-medium mb-4">Reference {index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={ref.name}
                        onChange={(e) => updateReference(index, 'name', e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={ref.email}
                        onChange={(e) => updateReference(index, 'email', e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <Label>Relationship</Label>
                      <Input
                        value={ref.relation}
                        onChange={(e) => updateReference(index, 'relation', e.target.value)}
                        placeholder="Former Client"
                      />
                    </div>
                  </div>
                </Card>
              ))}

              <Button type="button" variant="outline" onClick={addReference} className="w-full">
                + Add Another Reference
              </Button>
            </div>

            <div className="bg-red-50 border border-red-300 rounded-lg p-6">
              <h3 className="font-bold text-red-800 mb-4">Verification Agreement</h3>
              <div className="space-y-3 text-sm text-red-700">
                <p>By submitting this application, I solemnly declare that:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All portfolio images are of projects I personally designed and completed</li>
                  <li>I own full rights to all submitted photos and documents</li>
                  <li>All information provided is true and accurate</li>
                  <li>I understand that submitting fraudulent material will result in permanent account suspension</li>
                  <li>I consent to manual verification of my identity and credentials</li>
                </ul>
                <div className="flex items-center gap-3 mt-6">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }))}
                  />
                  <label htmlFor="terms" className="font-medium">
                    I agree to the verification terms and conditions
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-12 pt-8 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1 || submitting}
          >
            Previous
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={submitting}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting || !formData.agreeToTerms}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DesignerApplicationForm;