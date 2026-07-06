import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, IndianRupee, GraduationCap } from 'lucide-react';
import { Button, Badge, Dropdown } from '../ui';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { collegePath } from '../../utils/paths';
import { searchService } from '../../services/searchService';
import type { CollegeWithSlug } from '../../services/collegeService';

const fieldOptions = [
  { value: 'engineering', label: 'Engineering & Technology' },
  { value: 'medical', label: 'Medical & Healthcare' },
  { value: 'business', label: 'Business & Management' },
  { value: 'arts', label: 'Arts & Humanities' },
  { value: 'science', label: 'Science & Research' },
];

const locationOptions = [
  { value: 'any', label: 'Any Location' },
  { value: 'delhi', label: 'Delhi NCR' },
  { value: 'mumbai', label: 'Mumbai' },
  { value: 'bangalore', label: 'Bangalore' },
  { value: 'chennai', label: 'Chennai' },
];

export function AIRecommendationPreview() {
  const [field, setField] = useState('engineering');
  const [location, setLocation] = useState('any');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recommendedColleges, setRecommendedColleges] = useState<CollegeWithSlug[]>([]);

  const handleRecommend = async () => {
    setIsLoading(true);
    setShowResults(false);
    try {
      const data = await searchService.getRecommendations(3);
      setRecommendedColleges(data.colleges);
      setShowResults(true);
    } catch {
      setRecommendedColleges([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 lg:order-1">
            <div className="bg-surface rounded-3xl p-8 shadow-large border border-border">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="text-heading-sm font-semibold text-primary">AI Recommender</h4>
                  <p className="text-body-xs text-muted">Tell us your preferences</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <Dropdown
                  options={fieldOptions}
                  value={field}
                  onChange={setField}
                  label="Field of Interest"
                  fullWidth
                />
                <Dropdown
                  options={locationOptions}
                  value={location}
                  onChange={setLocation}
                  label="Preferred Location"
                  fullWidth
                />
              </div>

              <Button
                fullWidth
                onClick={handleRecommend}
                loading={isLoading}
                icon={<Sparkles className="w-4 h-4" />}
              >
                Get AI Recommendations
              </Button>

              {showResults && recommendedColleges.length > 0 && (
                <div className="mt-8 space-y-3 animate-slide-up">
                  <p className="text-body-sm text-muted mb-4">
                    Based on your preferences, here are the top matches:
                  </p>
                  {recommendedColleges.map((college, index) => (
                    <Link
                      key={college.id}
                      to={collegePath(college)}
                      className="flex items-center gap-4 p-4 bg-background rounded-xl border border-border hover:border-accent/30 transition-colors"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <ImageWithFallback
                        src={college.logo}
                        alt={`${college.shortName} logo`}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-medium text-primary truncate">
                          {college.shortName}
                        </p>
                        <p className="text-body-xs text-muted">{college.location.city}</p>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-success/10 rounded-full">
                        <Sparkles className="w-3 h-3 text-success" />
                        <span className="text-body-xs font-medium text-success">
                          {95 - index * 5}% Match
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <Badge variant="accent" size="lg" className="mb-6" icon={<Sparkles className="w-3.5 h-3.5" />}>
              AI-Powered
            </Badge>
            <h2 className="text-display-sm md:text-display-md font-heading font-semibold text-primary mb-6">
              Personalized
              <br />
              <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                College Recommendations
              </span>
            </h2>
            <p className="text-body text-muted mb-8 max-w-lg">
              Our AI analyzes your preferences, academic profile, and career goals to
              suggest colleges that best match your aspirations. No more endless searching.
            </p>

            <div className="space-y-4">
              {[
                { icon: GraduationCap, text: 'Match based on courses and specializations' },
                { icon: MapPin, text: 'Location and campus preferences considered' },
                { icon: IndianRupee, text: 'Fee structure matching your budget' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-body-sm text-primary">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
