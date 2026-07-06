import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import {
  MapPin, Star, IndianRupee, Users, Clock, Globe, Bookmark, Scale,
  ChevronRight, Award, TrendingUp, Building, BookOpen, GraduationCap,
  CheckCircle, Phone, Mail, ExternalLink
} from 'lucide-react';
import { Badge, Button, Tabs, useToast, CardSkeleton } from '../components/ui';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { images } from '../utils/images';
import { cn } from '../utils/cn';
import { collegePath } from '../utils/paths';
import { CollegeCard } from '../components/features/CollegeCard';
import { collegeService } from '../services/collegeService';
import type { CollegeWithSlug } from '../services/collegeService';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../contexts/WishlistContext';
import { compareService } from '../services/compareService';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'courses', label: 'Courses' },
  { id: 'placements', label: 'Placements' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'reviews', label: 'Reviews' },
];

export function CollegeDetailsPage() {
  const { id: slug } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();
  const { isSaved, toggle } = useWishlist();
  const [activeTab, setActiveTab] = useState('overview');
  const [college, setCollege] = useState<CollegeWithSlug | null>(null);
  const [relatedColleges, setRelatedColleges] = useState<CollegeWithSlug[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    setNotFound(false);
    collegeService
      .getBySlug(slug)
      .then((data) => {
        setCollege(data);
        return collegeService.getRecommended(3);
      })
      .then((recs) => setRelatedColleges(recs.filter((c) => c.slug !== slug)))
      .catch(() => {
        setCollege(null);
        setNotFound(true);
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <CardSkeleton className="h-96 mb-8" />
        <CardSkeleton className="h-64" />
      </div>
    );
  }

  if (notFound || !college) {
    return <Navigate to="/colleges" replace />;
  }

  const isBookmarked = isSaved(college.id);
  const websiteUrl = college.contact?.website ?? `https://www.${college.shortName.toLowerCase().replace(/\s+/g, '')}.ac.in`;
  const contactPhone = college.contact?.phone ?? 'Contact admissions office';
  const contactEmail = college.contact?.email ?? `admissions@${college.shortName.toLowerCase().replace(/\s+/g, '')}.edu.in`;

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      addToast({ type: 'info', title: 'Sign in required', description: 'Please log in to save colleges.' });
      navigate('/login');
      return;
    }
    try {
      const saved = await toggle(college.id);
      addToast({
        type: 'success',
        title: saved ? 'College saved' : 'Removed from saved',
        description: college.shortName,
      });
    } catch {
      addToast({ type: 'error', title: 'Action failed', description: 'Could not update wishlist.' });
    }
  };

  const handleCompare = async () => {
    if (!isAuthenticated) {
      addToast({ type: 'info', title: 'Sign in required', description: 'Please log in to compare colleges.' });
      navigate('/login');
      return;
    }
    try {
      const current = await compareService.getCompare();
      const ids = current.map((c) => c.id);
      if (!ids.includes(college.id)) {
        if (ids.length >= 3) {
          addToast({ type: 'warning', title: 'Compare limit', description: 'You can compare up to 3 colleges.' });
          return;
        }
        ids.push(college.id);
      }
      await compareService.saveCompare(ids);
      addToast({ type: 'info', title: 'Added to compare', description: college.shortName });
      navigate('/compare');
    } catch {
      addToast({ type: 'error', title: 'Action failed', description: 'Could not update compare list.' });
    }
  };

  const handleApply = () => {
    addToast({
      type: 'info',
      title: 'Application started',
      description: 'Redirecting to the official admission portal.',
    });
    window.open(websiteUrl, '_blank', 'noopener,noreferrer');
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(0)} LPA`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const galleryImages = college.campusGallery.length > 0 ? college.campusGallery : images.college.gallery;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-80 lg:h-96 relative overflow-hidden">
          <ImageWithFallback
            src={college.coverImage}
            alt={`${college.name} campus`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
        </div>

        {/* Overlay Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-32 lg:-mt-40 pb-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-body-sm text-white/80 mb-6">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link to="/colleges" className="hover:text-white transition-colors">Colleges</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">{college.shortName}</span>
            </div>

            {/* Main Info Card */}
            <div className="bg-surface rounded-3xl shadow-large overflow-hidden">
              <div className="p-4 sm:p-6 lg:p-10">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                  {/* Logo */}
                  <ImageWithFallback
                    src={college.logo}
                    alt={`${college.shortName} logo`}
                    className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl object-cover shrink-0 shadow-medium"
                  />

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start gap-3 mb-3">
                      <Badge variant="accent" size="md">
                        #{college.ranking.national} NIRF
                      </Badge>
                      <Badge variant={college.type === 'public' ? 'success' : 'warning'} size="md">
                        {college.type.charAt(0).toUpperCase() + college.type.slice(1)}
                      </Badge>
                      {college.accreditation.slice(0, 2).map((acc) => (
                        <Badge key={acc} variant="outline" size="md">
                          {acc}
                        </Badge>
                      ))}
                    </div>

                    <h1 className="text-display-sm lg:text-display-md font-heading font-semibold text-primary mb-2">
                      {college.name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-body-sm text-muted mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {college.location.city}, {college.location.state}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Est. {college.established}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-warning text-warning" />
                        {college.rating} ({college.reviewCount} reviews)
                      </span>
                    </div>

                    <p className="text-body text-muted max-w-3xl">
                      {college.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full lg:w-auto">
                    <Button className="w-full sm:w-auto" icon={<ExternalLink className="w-4 h-4" />} onClick={() => window.open(websiteUrl, '_blank', 'noopener,noreferrer')}>
                      Visit Website
                    </Button>
                    <Button
                      className="w-full sm:w-auto"
                      variant="outline"
                      icon={<Bookmark className={cn('w-4 h-4', isBookmarked && 'fill-accent')} />}
                      onClick={handleBookmark}
                    >
                      {isBookmarked ? 'Saved' : 'Save'}
                    </Button>
                    <Button className="w-full sm:w-auto" variant="ghost" icon={<Scale className="w-4 h-4" />} onClick={handleCompare}>
                      Compare
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 border-t border-border">
                {[
                  { icon: BookOpen, label: 'Courses', value: college.courseCount },
                  { icon: Users, label: 'Placement', value: `${college.placementRate}%` },
                  { icon: IndianRupee, label: 'Avg Package', value: formatCurrency(college.averagePackage) },
                  { icon: GraduationCap, label: 'Fees', value: `${formatCurrency(college.fees.min)} - ${formatCurrency(college.fees.max)}` },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className={cn(
                      'p-4 sm:p-6 text-center border-border',
                      index % 2 === 0 && 'max-md:border-r',
                      index < 2 && 'max-md:border-b',
                      'md:border-b-0 md:border-r md:last:border-r-0'
                    )}
                  >
                    <stat.icon className="w-5 h-5 text-accent mx-auto mb-2" />
                    <p className="text-heading-md font-semibold text-primary">{stat.value}</p>
                    <p className="text-body-xs text-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-8" />

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-10 animate-fade-in">
                {/* Highlights */}
                <div>
                  <h2 className="text-heading-lg font-semibold text-primary mb-6">Key Highlights</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {college.highlights.map((highlight, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-surface rounded-xl border border-border"
                      >
                        <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                        <span className="text-body-sm text-primary">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* About */}
                <div>
                  <h2 className="text-heading-lg font-semibold text-primary mb-4">About the Institution</h2>
                  <p className="text-body text-muted leading-relaxed">
                    {college.description} Established in {college.established}, {' '}
                    {college.shortName} has consistently ranked among the top institutions in India.
                    The institution is known for its world-class faculty, cutting-edge research facilities,
                    and strong industry connections that ensure excellent placement opportunities.
                  </p>
                  <p className="text-body text-muted leading-relaxed mt-4">
                    With a sprawling campus in {college.location.city}, {college.shortName} provides students
                    with a holistic learning environment that combines academic excellence with extracurricular
                    activities and personal development opportunities.
                  </p>
                </div>

                {/* Admission Process */}
                <div>
                  <h2 className="text-heading-lg font-semibold text-primary mb-6">Admission Process</h2>
                  <div className="space-y-4">
                    {college.admissionProcess.map((step, index) => (
                      <div
                        key={index}
                        className="flex gap-4 p-4 bg-surface rounded-xl border border-border"
                      >
                        <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 font-semibold">
                          {step.step}
                        </div>
                        <div>
                          <h3 className="text-heading-sm font-semibold text-primary">{step.title}</h3>
                          <p className="text-body-sm text-muted">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-body text-muted mb-6">
                  {college.shortName} offers {college.courseCount} programs across multiple disciplines.
                </p>
                {college.courses.length > 0 ? (
                  college.courses.map((course) => (
                    <Link
                      key={course.id}
                      to={`/courses?q=${encodeURIComponent(course.name)}`}
                      className="block bg-surface rounded-2xl p-6 border border-border hover:border-accent/30 transition-colors"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-heading-md font-semibold text-primary">{course.name}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <Badge variant="outline" size="sm">{course.type}</Badge>
                            <span className="text-body-xs text-muted">{course.duration}</span>
                            <span className="text-body-xs text-muted">{course.seats} seats</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-body-sm text-muted">Annual Fees</p>
                          <p className="text-heading-md font-semibold text-accent">
                            ₹{(course.fees / 100000).toFixed(1)}L
                          </p>
                        </div>
                      </div>
                      <p className="text-body-sm text-muted mb-4">{course.description}</p>
                    </Link>
                  ))
                ) : (
                  <Link
                    to={`/courses?q=${encodeURIComponent(college.shortName)}`}
                    className="block bg-surface rounded-2xl p-6 border border-border hover:border-accent/30 transition-colors text-center"
                  >
                    <BookOpen className="w-8 h-8 text-accent mx-auto mb-3" />
                    <p className="text-body-sm text-primary font-medium">Browse courses at {college.shortName}</p>
                    <p className="text-body-xs text-muted mt-1">View all programs in the course catalog</p>
                  </Link>
                )}
              </div>
            )}

            {activeTab === 'placements' && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-surface rounded-2xl p-6 border border-border text-center">
                    <TrendingUp className="w-8 h-8 text-success mx-auto mb-3" />
                    <p className="text-display-sm font-semibold text-primary">{college.placementRate}%</p>
                    <p className="text-body-sm text-muted">Placement Rate</p>
                  </div>
                  <div className="bg-surface rounded-2xl p-6 border border-border text-center">
                    <IndianRupee className="w-8 h-8 text-accent mx-auto mb-3" />
                    <p className="text-display-sm font-semibold text-primary">{formatCurrency(college.averagePackage)}</p>
                    <p className="text-body-sm text-muted">Average Package</p>
                  </div>
                  <div className="bg-surface rounded-2xl p-6 border border-border text-center">
                    <Award className="w-8 h-8 text-warning mx-auto mb-3" />
                    <p className="text-display-sm font-semibold text-primary">₹80 LPA</p>
                    <p className="text-body-sm text-muted">Highest Package</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-heading-lg font-semibold text-primary mb-6">Top Recruiters</h2>
                  <div className="flex flex-wrap gap-4">
                    {college.topRecruiters.map((recruiter) => (
                      <div
                        key={recruiter}
                        className="px-6 py-3 bg-surface rounded-xl border border-border text-body-sm font-medium text-primary hover:border-accent/30 transition-colors"
                      >
                        {recruiter}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'facilities' && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid md:grid-cols-2 gap-6">
                  {college.facilities.map((facility, index) => (
                    <div
                      key={index}
                      className="p-6 bg-surface rounded-2xl border border-border hover:border-accent/30 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4">
                        <Building className="w-6 h-6" />
                      </div>
                      <h3 className="text-heading-md font-semibold text-primary mb-2">{facility.name}</h3>
                      <p className="text-body-sm text-muted">{facility.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
                {galleryImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative rounded-2xl overflow-hidden aspect-video"
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`${college.shortName} campus view ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'faqs' && (
              <div className="space-y-4 animate-fade-in">
                {college.faqs.length > 0 ? (
                  college.faqs.map((faq, index) => (
                    <div key={index} className="p-6 bg-surface rounded-2xl border border-border">
                      <h3 className="text-heading-sm font-semibold text-primary mb-2">{faq.question}</h3>
                      <p className="text-body-sm text-muted">{faq.answer}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-body text-muted">No FAQs published yet. Contact admissions for details.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 p-6 bg-surface rounded-2xl border border-border">
                  <Star className="w-8 h-8 fill-warning text-warning" />
                  <div>
                    <p className="text-heading-lg font-semibold text-primary">{college.rating.toFixed(1)} / 5</p>
                    <p className="text-body-sm text-muted">{college.reviewCount.toLocaleString()} verified reviews</p>
                  </div>
                </div>
                <p className="text-body text-muted">
                  Individual review submissions are collected through verified student accounts. Check back as more students share their experiences.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-surface rounded-2xl p-6 border border-border sticky top-24">
              <h3 className="text-heading-md font-semibold text-primary mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-body-xs text-muted">Phone</p>
                    <p className="text-body-sm font-medium text-primary">{contactPhone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-body-xs text-muted">Email</p>
                    <p className="text-body-sm font-medium text-primary">{contactEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-body-xs text-muted">Website</p>
                    <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="text-body-sm font-medium text-accent hover:underline">
                      www.{college.shortName.toLowerCase().replace(/\s+/g, '')}.ac.in
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <Button fullWidth onClick={handleApply}>
                  Apply Now
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Colleges */}
        <div className="mt-16">
          <h2 className="text-heading-lg font-semibold text-primary mb-8">Similar Colleges</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedColleges.map((college) => (
              <CollegeCard key={college.id} college={college} variant="featured" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
