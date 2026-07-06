/**
 * Single source of truth for EduVista platform contact information.
 * Update values here to reflect across Footer, Contact, About, and all UI.
 */
export const CONTACT_INFO = {
  email: 'hello@eduvista.com',
  phone: '+91 98765 43210',
  phoneTel: '+919876543210',
  location: 'Bhubaneswar, Odisha, India',
} as const;

export const CONTACT_LINKS = {
  mailto: `mailto:${CONTACT_INFO.email}`,
  tel: `tel:${CONTACT_INFO.phoneTel}`,
} as const;
