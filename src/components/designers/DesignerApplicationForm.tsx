// src/components/DesignerApplicationForm.tsx
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Upload, CheckCircle, Image, User, Award, Briefcase, AlertCircle, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const DesignerApplicationForm = () => {
  const { getToken } = useAuth();
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
    portfolioFiles: [] as any[],
    credentials: [] as File[],
    references: [{ name: '', email: '', relation: '' }],
    socialLinks: {
      instagram: '',
      pinterest: '',
      website: '',
    },
    agreeToTerms: false,
  });

  const steps = [
    { num: 1, title: 'Personal Info', icon: User },
    { num: 2, title: 'Portfolio', icon: Image },
    { num: 3, title: 'Credentials', icon: Award },
    { num: 4, title: 'References & Agreement', icon: Briefcase },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'portfolio' | 'credentials') => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    if (type === 'portfolio') {
      const newFiles = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        projectName: '',
        projectType: '',
        description: '',
        beforeAfter: 'after' as 'before' | 'after',
      }));
      setFormData(prev => ({ ...prev, portfolioFiles: [...prev.portfolioFiles, ...newFiles] }));
    } else {
      setFormData(prev => ({ ...prev, credentials: [...prev.credentials, ...files] }));
    }
  };

  const updatePortfolioItem = (index: number, field: string, value: string) => {
    const updated = [...formData.portfolioFiles];
    // @ts-ignore
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, portfolioFiles: updated }));
  };

  const removePortfolioItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      portfolioFiles: prev.portfolioFiles.filter((_, i) => i !== index),
    }));
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
    // Basic validation
    if (formData.portfolioFiles.length < 5) {
      alert('Please upload at least 5 portfolio images');
      return;
    }
    if (!formData.agreeToTerms) {
      alert('You must agree to the verification terms');
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication required');

      const form = new FormData();

      // Append simple fields
      form.append('fullName', formData.fullName);
      form.append('email', formData.email);
      form.append('phone', formData.phone);
      form.append('idNumber', formData.idNumber);
      form.append('experience', formData.experience);
      form.append('education', formData.education);
      form.append('socialLinks', JSON.stringify(formData.socialLinks));
      form.append('references', JSON.stringify(formData.references));

      // Portfolio
      formData.portfolioFiles.forEach((item, i) => {
        form.append('portfolioImages', item.file);
        form.append(`portfolioMeta[${i}][projectName]`, item.projectName);
        form.append(`portfolioMeta[${i}][projectType]`, item.projectType);
        form.append(`portfolioMeta[${i}][description]`, item.description);
        form.append(`portfolioMeta[${i}][beforeAfter]`, item.beforeAfter);
      });

      // Credentials
      formData.credentials.forEach(file => {
        form.append('credentials', file);
      });

      const res = await fetch('/api/designer/apply', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        alert(data.error || 'Submission failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again later.');
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
          Our team will carefully review your portfolio, credentials, and references.
          You will receive an email notification within 3-5 business days.
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
            Join Kenya's most trusted interior design marketplace. Only professionals with proven work are accepted.
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

        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex gap-4">
              <Shield className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-800">Identity Verification Required</p>
                <p className="text-sm text-red-700 mt-1">
                  We verify every designer to protect clients from fraud. Your ID information is encrypted and never shared.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="John Kamau"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="designer@gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+254 712 345 678"
                />
              </div>
              <div>
                <Label htmlFor="idNumber">National ID Number <span className="text-red-500">*</span></Label>
                <Input
                  id="idNumber"
                  value={formData.idNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                  placeholder="12345678"
                />
              </div>
              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <select
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select...</option>
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
              <div>
                <Label htmlFor="education">Education / Certification</Label>
                <Input
                  id="education"
                  value={formData.education}
                  onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                  placeholder="B.Sc Interior Design, University of Nairobi"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Portfolio */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
              <div className="flex gap-4">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-800 mb-2">Portfolio Requirements</p>
                  <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                    <li>Minimum 5 high-quality images of completed projects</li>
                    <li>Include before & after photos where possible</li>
                    <li>All work must be your own — stolen images will result in permanent ban</li>
                    <li>Add project name, type, and description for each image</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <Label>Upload Portfolio Images (Max 10MB each)</Label>
              <div className="mt-3 border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:border-purple-500 transition">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'portfolio')}
                  className="hidden"
                  id="portfolio-upload"
                />
                <label htmlFor="portfolio-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium">Click to upload images</p>
                  <p className="text-sm text-gray-500 mt-1">JPG, PNG • Up to 10MB</p>
                </label>
              </div>
            </div>

            {formData.portfolioFiles.length > 0 && (
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">Your Portfolio ({formData.portfolioFiles.length} images)</h3>
                {formData.portfolioFiles.map((item, index) => (
                  <Card key={index} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <img
                          src={item.preview}
                          alt="Portfolio preview"
                          className="w-full h-64 object-cover rounded-lg shadow"
                        />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label>Project Name</Label>
                          <Input
                            value={item.projectName}
                            onChange={(e) => updatePortfolioItem(index, 'projectName', e.target.value)}
                            placeholder="Modern Living Room in Westlands"
                          />
                        </div>
                        <div>
                          <Label>Project Type</Label>
                          <select
                            value={item.projectType}
                            onChange={(e) => updatePortfolioItem(index, 'projectType', e.target.value)}
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
                        <div>
                          <Label>Before or After Photo?</Label>
                          <div className="flex gap-4 mt-2">
                            <Button
                              type="button"
                              variant={item.beforeAfter === 'before' ? 'default' : 'outline'}
                              onClick={() => updatePortfolioItem(index, 'beforeAfter', 'before')}
                            >
                              Before
                            </Button>
                            <Button
                              type="button"
                              variant={item.beforeAfter === 'after' ? 'default' : 'outline'}
                              onClick={() => updatePortfolioItem(index, 'beforeAfter', 'after')}
                            >
                              After
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={item.description}
                            onChange={(e) => updatePortfolioItem(index, 'description', e.target.value)}
                            rows={4}
                            placeholder="Describe the project challenge and your design solution..."
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removePortfolioItem(index)}
                        >
                          Remove Image
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <Label>Social Media & Website Links (Optional)</Label>
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
                placeholder="Personal website URL"
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