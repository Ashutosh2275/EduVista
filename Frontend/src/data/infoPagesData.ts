export interface InfoPageConfig {
  slug: string;
  badge: string;
  title: string;
  highlight: string;
  description: string;
  sections: { heading: string; body: string }[];
  cta?: { label: string; href: string };
}

export const infoPages: Record<string, InfoPageConfig> = {
  rankings: {
    slug: 'rankings',
    badge: 'Rankings',
    title: 'College Rankings',
    highlight: 'Data-Driven Insights',
    description: 'Explore NIRF, QS, and EduVista composite rankings to compare institutions across academics, placements, and research.',
    sections: [
      { heading: 'How Rankings Work', body: 'Our rankings combine official NIRF data, placement statistics, student reviews, and research output into an easy-to-compare score.' },
      { heading: 'Updated Annually', body: 'Rankings are refreshed each academic year with verified data from institutional reports and government databases.' },
    ],
    cta: { label: 'Browse Top Colleges', href: '/colleges' },
  },
  scholarships: {
    slug: 'scholarships',
    badge: 'Scholarships',
    title: 'Scholarship',
    highlight: 'Opportunities',
    description: 'Discover government, institutional, and private scholarships available to Indian students across streams and levels.',
    sections: [
      { heading: 'Government Schemes', body: 'Central and state scholarships including merit-based, need-based, and category-specific programs.' },
      { heading: 'Institutional Aid', body: 'Fee waivers and scholarships offered directly by colleges based on academic performance and entrance exam ranks.' },
    ],
    cta: { label: 'Read Scholarship Guides', href: '/insights?q=scholarship' },
  },
  careers: {
    slug: 'careers',
    badge: 'Careers at EduVista',
    title: 'Join Our',
    highlight: 'Mission',
    description: 'Help millions of students discover their ideal educational path. We are building the future of college discovery in India.',
    sections: [
      { heading: 'Open Roles', body: 'Engineering, Product, Design, Data Science, and Education Content roles across remote and hybrid locations.' },
      { heading: 'Our Culture', body: 'Student-first thinking, data-driven decisions, and a collaborative team passionate about education access.' },
    ],
    cta: { label: 'Contact Us', href: '/contact' },
  },
  press: {
    slug: 'press',
    badge: 'Press',
    title: 'Press &',
    highlight: 'Media',
    description: 'Latest news, media coverage, and press resources about EduVista.',
    sections: [
      { heading: 'Media Inquiries', body: 'For press and partnership inquiries, reach out to press@eduvista.com.' },
      { heading: 'Brand Assets', body: 'Download our logo and brand guidelines for media use upon request.' },
    ],
    cta: { label: 'Contact Press Team', href: '/contact' },
  },
  help: {
    slug: 'help',
    badge: 'Help Center',
    title: 'How Can We',
    highlight: 'Help You?',
    description: 'Find answers to common questions about using EduVista to search, compare, and save colleges.',
    sections: [
      { heading: 'Getting Started', body: 'Create a free account, set your preferences, and start exploring colleges with AI-powered recommendations.' },
      { heading: 'Account & Settings', body: 'Manage saved colleges, comparison history, and notification preferences from your dashboard.' },
    ],
    cta: { label: 'View FAQ', href: '/faq' },
  },
  guides: {
    slug: 'guides',
    badge: 'Guides',
    title: 'Student',
    highlight: 'Guides',
    description: 'Step-by-step guides for admissions, entrance exams, college selection, and career planning.',
    sections: [
      { heading: 'Admission Guides', body: 'JEE, NEET, CAT, and university-specific admission process walkthroughs.' },
      { heading: 'Career Planning', body: 'Choose the right stream, specialization, and college based on your long-term goals.' },
    ],
    cta: { label: 'Explore Insights', href: '/insights' },
  },
  api: {
    slug: 'api',
    badge: 'API',
    title: 'EduVista',
    highlight: 'Developer API',
    description: 'Integrate college data, rankings, and course information into your applications.',
    sections: [
      { heading: 'REST API', body: 'Access college profiles, course catalogs, and comparison data through our developer API (coming soon).' },
      { heading: 'Partnership Program', body: 'EdTech platforms and counseling services can request early API access through our partners program.' },
    ],
    cta: { label: 'Become a Partner', href: '/partners' },
  },
  partners: {
    slug: 'partners',
    badge: 'Partners',
    title: 'Partner',
    highlight: 'With Us',
    description: 'Collaborate with EduVista to reach students, counselors, and educational institutions.',
    sections: [
      { heading: 'Institution Partners', body: 'Colleges and universities can list verified profiles and connect with prospective students.' },
      { heading: 'EdTech Integrations', body: 'Integrate EduVista data and discovery tools into your counseling or learning platform.' },
    ],
    cta: { label: 'Get in Touch', href: '/contact' },
  },
  privacy: {
    slug: 'privacy',
    badge: 'Legal',
    title: 'Privacy',
    highlight: 'Policy',
    description: 'How EduVista collects, uses, and protects your personal information.',
    sections: [
      { heading: 'Data Collection', body: 'We collect information you provide when creating an account, saving colleges, and using search features.' },
      { heading: 'Your Rights', body: 'You may request access, correction, or deletion of your personal data at any time by contacting us.' },
    ],
  },
  terms: {
    slug: 'terms',
    badge: 'Legal',
    title: 'Terms of',
    highlight: 'Service',
    description: 'Terms and conditions governing your use of the EduVista platform.',
    sections: [
      { heading: 'Acceptable Use', body: 'EduVista is provided for personal educational research. Commercial scraping or misuse of data is prohibited.' },
      { heading: 'Disclaimer', body: 'College data is provided for informational purposes. Verify details with official institutional sources before applying.' },
    ],
  },
  cookies: {
    slug: 'cookies',
    badge: 'Legal',
    title: 'Cookie',
    highlight: 'Policy',
    description: 'Information about how EduVista uses cookies and similar technologies.',
    sections: [
      { heading: 'Essential Cookies', body: 'Required for authentication, session management, and core platform functionality.' },
      { heading: 'Analytics Cookies', body: 'Help us understand how users interact with the platform to improve the experience.' },
    ],
  },
  disclaimer: {
    slug: 'disclaimer',
    badge: 'Legal',
    title: 'Website',
    highlight: 'Disclaimer',
    description: 'Important information about the accuracy and use of data on EduVista.',
    sections: [
      { heading: 'Information Accuracy', body: 'While we strive for accuracy, fees, placements, and admission criteria may change. Always confirm with official sources.' },
      { heading: 'No Guarantee', body: 'EduVista does not guarantee admission, placement, or scholarship outcomes.' },
    ],
  },
};
