import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, ArrowRight, Send, MessageCircle, HelpCircle, BookOpen, Users } from 'lucide-react';
import { Button, Input, Badge, Accordion, useToast } from '../components/ui';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { images } from '../utils/images';
import { enquiryService } from '../services/enquiryService';
import { CONTACT_INFO, CONTACT_LINKS } from '../constants/contactInfo';

const aboutFeatures = [
  {
    icon: BookOpen,
    title: 'Comprehensive Data',
    description: 'Access detailed information on 15,000+ colleges across India with verified data from official sources.',
  },
  {
    icon: Users,
    title: 'For Every Student',
    description: 'From engineering aspirants to MBA graduates, we help students across all educational streams.',
  },
  {
    icon: HelpCircle,
    title: 'Expert Guidance',
    description: 'Get personalized recommendations powered by AI and curated by education experts.',
  },
];

const teamMembers = [
  { name: 'Arjun Mehta', role: 'Founder & CEO', image: images.avatar.student2 },
  { name: 'Priya Sharma', role: 'Head of Product', image: images.avatar.student1 },
  { name: 'Rahul Verma', role: 'CTO', image: images.avatar.professional1 },
];

const faqItems = [
  {
    id: '1',
    title: 'How does EduVista help me choose the right college?',
    content: 'EduVista uses AI-powered recommendations based on your preferences, academic profile, and career goals. Our intelligent matching system analyzes thousands of colleges to find the best fit for you.',
  },
  {
    id: '2',
    title: 'Is EduVista free to use?',
    content: 'Yes, EduVista is completely free for students. You can search, compare, and explore colleges without any charges.',
  },
  {
    id: '3',
    title: 'How accurate is the college information?',
    content: 'Our data is sourced from official college websites, government databases (NIRF, AICTE), and verified directly with institutions.',
  },
  {
    id: '4',
    title: 'Can I apply to colleges through EduVista?',
    content: 'Currently, EduVista helps you discover and compare colleges. For applications, we provide direct links to official college admission portals.',
  },
  {
    id: '5',
    title: 'How does the AI match score work?',
    content: 'Our AI analyzes your profile (academic scores, preferred location, budget, career interests) and matches them against college offerings.',
  },
  {
    id: '6',
    title: 'Do you provide scholarship information?',
    content: 'Yes, we provide comprehensive information on scholarships available at each college, along with eligibility criteria and application deadlines.',
  },
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-accent/5 via-background to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="accent" size="lg" className="mb-6">About Us</Badge>
            <h1 className="text-display-md lg:text-display-lg font-heading font-semibold text-primary mb-6">
              Empowering Students to
              <br />
              <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                Shape Their Future
              </span>
            </h1>
            <p className="text-body text-muted leading-relaxed">
              EduVista was founded with a simple mission: to make quality education accessible
              to everyone by providing transparent, comprehensive, and intelligent college discovery tools.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {aboutFeatures.map((feature, index) => (
              <div
                key={index}
                className="text-center p-8 bg-background rounded-2xl border border-border"
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mx-auto mb-6">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-heading-lg font-semibold text-primary mb-3">{feature.title}</h3>
                <p className="text-body text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" size="lg" className="mb-4">Our Team</Badge>
            <h2 className="text-display-sm font-heading font-semibold text-primary mb-4">
              The People Behind EduVista
            </h2>
            <p className="text-body text-muted">
              A dedicated team of educators, technologists, and dreamers working to revolutionize
              the college discovery experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <ImageWithFallback
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                />
                <h3 className="text-heading-md font-semibold text-primary">{member.name}</h3>
                <p className="text-body-sm text-muted">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-display-sm font-heading font-semibold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <Link to="/colleges">
            <Button size="lg" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
              Explore Colleges
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export function ContactPage() {
  const { addToast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await enquiryService.submitEnquiry({
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        interestedCourse: subject,
        message,
      });
      addToast({
        type: 'success',
        title: 'Message sent',
        description: 'Our team will get back to you within 24-48 hours.',
      });
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch {
      addToast({
        type: 'error',
        title: 'Failed to send',
        description: 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-accent/5 via-background to-secondary/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="accent" size="lg" className="mb-6">Contact Us</Badge>
            <h1 className="text-display-md lg:text-display-lg font-heading font-semibold text-primary mb-6">
              We'd Love to
              <br />
              <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">Hear From You</span>
            </h1>
            <p className="text-body text-muted">
              Have questions, feedback, or just want to say hello? Our team is here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-surface rounded-3xl p-8 lg:p-10 shadow-large border border-border">
              <h2 className="text-heading-lg font-semibold text-primary mb-6">Send us a message</h2>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-5">
                  <Input label="First Name" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth required />
                  <Input label="Last Name" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth required />
                </div>
                <Input label="Email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />
                <Input label="Phone" type="tel" placeholder={CONTACT_INFO.phone} value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth required />
                <Input label="Subject" placeholder="How can we help?" value={subject} onChange={(e) => setSubject(e.target.value)} fullWidth required />
                <div>
                  <label className="block text-body-sm font-medium text-primary mb-1.5">Message</label>
                  <textarea
                    className="form-field form-control w-full px-4 py-3 rounded-xl border border-border bg-surface text-primary placeholder:text-muted/60 outline-none focus:outline-none focus-visible:outline-none transition-all resize-none h-32"
                    placeholder="Your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" fullWidth loading={isSubmitting} icon={<Send className="w-4 h-4" />} iconPosition="right">
                  Send Message
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-heading-lg font-semibold text-primary mb-6">Get in touch</h2>
                <p className="text-body text-muted max-w-md">
                  Our team typically responds within 24-48 hours. For urgent matters, feel free to call us directly.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { icon: Mail, label: 'Email', value: CONTACT_INFO.email, href: CONTACT_LINKS.mailto },
                  { icon: Phone, label: 'Phone', value: CONTACT_INFO.phone, href: CONTACT_LINKS.tel },
                  { icon: MapPin, label: 'Address', value: CONTACT_INFO.location },
                  { icon: Clock, label: 'Hours', value: 'Mon - Fri, 9:00 AM - 6:00 PM PST' },
                ].map((item, index) => {
                  const content = (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-body-xs text-muted">{item.label}</p>
                        <p className="text-body-sm font-medium text-primary">{item.value}</p>
                      </div>
                    </>
                  );
                  return 'href' in item && item.href ? (
                    <a
                      key={index}
                      href={item.href}
                      className="flex items-start gap-4 p-4 bg-surface rounded-xl border border-border hover:border-accent/30 transition-colors"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={index} className="flex items-start gap-4 p-4 bg-surface rounded-xl border border-border">
                      {content}
                    </div>
                  );
                })}
              </div>

              {/* Social Links */}
              <div>
                <p className="text-body-sm font-medium text-primary mb-4">Follow Us</p>
                <div className="flex items-center gap-3">
                  {[
                    { label: 'Twitter', href: 'https://twitter.com' },
                    { label: 'LinkedIn', href: 'https://linkedin.com' },
                    { label: 'Instagram', href: 'https://instagram.com' },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-muted hover:text-accent hover:border-accent/30 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-accent/5 via-background to-secondary/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="accent" size="lg" className="mb-6">FAQ</Badge>
            <h1 className="text-display-md lg:text-display-lg font-heading font-semibold text-primary mb-6">
              Frequently Asked
              <br />
              <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">Questions</span>
            </h1>
            <p className="text-body text-muted">
              Everything you need to know about EduVista and how we can help you find your perfect college.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Accordion items={faqItems} variant="card" allowMultiple />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-surface border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-heading-xl font-semibold text-primary mb-4">
            Still have questions?
          </h2>
          <p className="text-body text-muted mb-8">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <Link to="/contact">
            <Button icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
              Contact Support
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
