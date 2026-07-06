import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Instagram, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from '../branding';
import { CONTACT_INFO, CONTACT_LINKS } from '../../constants/contactInfo';

const footerLinks = {
  product: [
    { label: 'Colleges', href: '/colleges' },
    { label: 'Courses', href: '/courses' },
    { label: 'Compare', href: '/compare' },
    { label: 'Rankings', href: '/rankings' },
    { label: 'Scholarships', href: '/scholarships' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Blog', href: '/insights' },
    { label: 'Contact', href: '/contact' },
  ],
  resources: [
    { label: 'Help Center', href: '/help' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Guides', href: '/guides' },
    { label: 'API', href: '/api' },
    { label: 'Partners', href: '/partners' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Disclaimer', href: '/disclaimer' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-4">
            <Logo variant="footer" theme="dark" asLink className="mb-6" />
            <p className="text-body text-white/70 mb-6 max-w-sm">
              Discover your perfect educational journey with AI-powered recommendations.
              Compare colleges, explore courses, and make informed decisions.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a href={CONTACT_LINKS.mailto} className="flex items-center gap-3 text-body-sm text-white/70 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                {CONTACT_INFO.email}
              </a>
              <a href={CONTACT_LINKS.tel} className="flex items-center gap-3 text-body-sm text-white/70 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                {CONTACT_INFO.phone}
              </a>
              <div className="flex items-center gap-3 text-body-sm text-white/70">
                <MapPin className="w-4 h-4 shrink-0" />
                {CONTACT_INFO.location}
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h4 className="text-body-sm font-semibold text-white mb-4">Product</h4>
                <ul className="space-y-3">
                  {footerLinks.product.map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="text-body-sm text-white/70 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-body-sm font-semibold text-white mb-4">Company</h4>
                <ul className="space-y-3">
                  {footerLinks.company.map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="text-body-sm text-white/70 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-body-sm font-semibold text-white mb-4">Resources</h4>
                <ul className="space-y-3">
                  {footerLinks.resources.map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="text-body-sm text-white/70 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-body-sm font-semibold text-white mb-4">Legal</h4>
                <ul className="space-y-3">
                  {footerLinks.legal.map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="text-body-sm text-white/70 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-body-xs text-white/50">
              © {new Date().getFullYear()} EduVista. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-all"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
