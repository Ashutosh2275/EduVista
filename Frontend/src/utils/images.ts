/** Local image paths — served from public/images (no external CDN dependency) */

const img = (path: string) => `/images/${path}`;

export const images = {
  college: {
    iitDelhi: {
      cover: img('colleges/iit-delhi-cover.jpg'),
      logo: img('colleges/iit-delhi-logo.jpg'),
    },
    iitBombay: {
      cover: img('colleges/iit-bombay-cover.jpg'),
      logo: img('colleges/iit-bombay-logo.jpg'),
    },
    iisc: {
      cover: img('colleges/iisc-cover.jpg'),
      logo: img('colleges/iisc-logo.jpg'),
    },
    du: {
      cover: img('colleges/du-cover.jpg'),
      logo: img('colleges/du-logo.jpg'),
    },
    bits: {
      cover: img('colleges/bits-cover.jpg'),
      logo: img('colleges/bits-logo.jpg'),
    },
    nit: {
      cover: img('colleges/nit-cover.jpg'),
      logo: img('colleges/nit-logo.jpg'),
    },
    gallery: [
      img('colleges/gallery-1.jpg'),
      img('colleges/gallery-2.jpg'),
      img('colleges/gallery-3.jpg'),
      img('colleges/gallery-4.jpg'),
      img('colleges/gallery-5.jpg'),
      img('colleges/gallery-6.jpg'),
    ],
  },
  stream: {
    engineering: img('courses/engineering.jpg'),
    medical: img('courses/medical.jpg'),
    management: img('courses/management.jpg'),
    commerce: img('courses/commerce.jpg'),
    law: img('courses/law.jpg'),
    design: img('courses/design.jpg'),
    science: img('courses/science.jpg'),
    arts: img('courses/arts.jpg'),
    dental: img('courses/dental.jpg'),
  },
  article: {
    study: img('articles/study.jpg'),
    aiEducation: img('articles/ai-education.jpg'),
    skills: img('articles/skills.jpg'),
    campus: img('articles/campus.jpg'),
    scholarship: img('articles/scholarship.jpg'),
    placement: img('articles/placement.jpg'),
    books: img('articles/books.jpg'),
    tech: img('articles/tech.jpg'),
  },
  career: {
    ai: img('careers/ai.jpg'),
    software: img('careers/software.jpg'),
    data: img('careers/data.jpg'),
    finance: img('careers/finance.jpg'),
    product: img('careers/product.jpg'),
    biotech: img('careers/biotech.jpg'),
  },
  avatar: {
    student1: img('avatars/student-1.jpg'),
    student2: img('avatars/student-2.jpg'),
    student3: img('avatars/student-3.jpg'),
    professional1: img('avatars/professional-1.jpg'),
    parent: img('avatars/parent.jpg'),
    counselor: img('avatars/counselor.jpg'),
  },
  fallback: img('fallback.jpg'),
};

export function streamCoverImage(stream: string): string {
  return images.stream[stream as keyof typeof images.stream] ?? images.fallback;
}
