import {
  Hero,
  TrustedUniversities,
  FeaturedColleges,
  CareerPaths,
  ComparePreview,
  AIRecommendationPreview,
  StudentStories,
  BlogInsights,
  Statistics,
  FAQSection,
  CallToAction,
} from '../components/features';

export function LandingPage() {
  return (
    <div className="relative">
      <Hero />
      <TrustedUniversities />
      <FeaturedColleges />
      <AIRecommendationPreview />
      <CareerPaths />
      <ComparePreview />
      <StudentStories />
      <BlogInsights />
      <Statistics />
      <FAQSection />
      <CallToAction />
    </div>
  );
}
