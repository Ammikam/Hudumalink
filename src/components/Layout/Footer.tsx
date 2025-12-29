import { Link } from 'react-router-dom';
import { Sparkles, Instagram, Twitter, Facebook, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const footerLinks = {
  explore: [
    { label: 'Browse Designers', href: '/designers' },
    { label: 'Inspiration Gallery', href: '/inspiration' },
    { label: 'Post a Project', href: '/post-project' },
    { label: 'How It Works', href: '/#how-it-works' },
  ],
  forDesigners: [
    { label: 'Join as Designer', href: '/join-designer' },
    { label: 'Designer Dashboard', href: '/dashboard/designer' },
    { label: 'Success Stories', href: '/success-stories' },
    { label: 'Designer Resources', href: '/resources' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press Kit', href: '/press' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

const socialLinks = [
  { icon: Instagram, href: 'https://instagram.com/hudumalink', label: 'Instagram' },
  { icon: Twitter, href: 'https://twitter.com/hudumalink', label: 'Twitter' },
  { icon: Facebook, href: 'https://facebook.com/hudumalink', label: 'Facebook' },
  { icon: Linkedin, href: 'https://linkedin.com/company/hudumalink', label: 'LinkedIn' },
];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-semibold">
                Huduma<span className="text-secondary">link</span>
              </span>
            </Link>
            <p className="text-primary-foreground/80 mb-6 max-w-sm">
              Kenya's premier interior design marketplace. Connecting you with the best designers to transform your space into something extraordinary.
            </p>
            <div className="space-y-3 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Westlands, Nairobi, Kenya</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+254 712 345 678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>hello@hudumalink.co.ke</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Explore</h4>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-4">For Designers</h4>
            <ul className="space-y-3">
              {footerLinks.forDesigners.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="w-5 h-5" />
                  <span className="sr-only">{social.label}</span>
                </motion.a>
              ))}
            </div>
            <p className="text-sm text-primary-foreground/60">
              © {new Date().getFullYear()} Hudumalink. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
