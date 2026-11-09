/**
 * Site configuration and content placeholders.
 * All contact details and social media links are centralized here for easy maintenance.
 */

export const siteConfig = {
  name: 'Honda Bikes Store',
  tagline: 'Unofficial showcase and community store for Honda motorcycles across Pakistan.',
  aboutBlurb:
    'Honda Bikes Store is an independent enthusiast platform showcasing popular motorcycles in Pakistan—from daily commuters to premium touring bikes. We provide detailed specifications, comparisons, and dealer guidance.',
  disclaimer:
    'Unofficial store — not affiliated with, endorsed by, or connected to Honda Motor Co. or Atlas Honda Limited. Honda is a trademark of its respective owner.',
  deliveryInfo:
    'Delivery coverage, booking timelines, and dealership pick-up availability depend on your selected city and authorized dealership confirmation across Pakistan.',
  contact: {
    phone: '[Add phone number]',
    email: '[Add email]',
    address: '[Add store address]',
  },
  // Update real social media profile URLs here when available.
  socialLinks: [
    {
      name: 'Facebook',
      url: '#',
      disabled: true,
      ariaLabel: 'Facebook profile (placeholder)',
    },
    {
      name: 'Instagram',
      url: '#',
      disabled: true,
      ariaLabel: 'Instagram profile (placeholder)',
    },
    {
      name: 'YouTube',
      url: '#',
      disabled: true,
      ariaLabel: 'YouTube channel (placeholder)',
    },
  ],
  navLinks: [
    { label: 'Home', path: '/' },
    { label: 'All Bikes', path: '/bikes' },
    { label: 'Compare', path: '/compare' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ],
};
