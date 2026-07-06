import { Accordion } from '../ui/Accordion';

const faqItems = [
  {
    id: '1',
    title: 'How does EduVista help me choose the right college?',
    content: 'EduVista uses AI-powered recommendations based on your preferences, academic profile, and career goals. Our intelligent matching system analyzes thousands of colleges to find the best fit for you, considering factors like courses offered, location, fees, placements, and more.',
  },
  {
    id: '2',
    title: 'Is EduVista free to use?',
    content: 'Yes, EduVista is completely free for students. You can search, compare, and explore colleges without any charges. We believe every student should have access to quality information for making informed educational decisions.',
  },
  {
    id: '3',
    title: 'How accurate is the college information?',
    content: 'Our data is sourced from official college websites, government databases (NIRF, AICTE), and verified directly with institutions. We update our database regularly and encourage colleges to verify their information for accuracy.',
  },
  {
    id: '4',
    title: 'Can I apply to colleges through EduVista?',
    content: 'Currently, EduVista helps you discover and compare colleges. For applications, we provide direct links to official college admission portals. We\'re working on integrating application support in future updates.',
  },
  {
    id: '5',
    title: 'How does the AI match score work?',
    content: 'Our AI analyzes your profile (academic scores, preferred location, budget, career interests) and matches them against college offerings. The match score indicates how well a college aligns with your requirements, helping you prioritize your choices.',
  },
];

export function FAQSection() {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-body-sm font-medium text-accent mb-2">Got Questions?</p>
          <h2 className="text-display-sm md:text-display-md font-heading font-semibold text-primary mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-body text-muted">
            Everything you need to know about EduVista and how we can help you.
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion items={faqItems} variant="card" allowMultiple />
      </div>
    </section>
  );
}
