import { Footer } from '../navigation/footer';

const footerColumns = [
  {
    title: 'Discover',
    links: [
      { label: 'Search', href: '/search' },
      { label: 'Categories', href: '/categories/football' },
      { label: 'Map', href: '/map' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'My bookings', href: '/bookings' },
      { label: 'Favorites', href: '/favorites' },
      { label: 'Profile', href: '/account' },
    ],
  },
  {
    title: 'Business',
    links: [
      { label: 'For partners', href: '/business' },
      { label: 'Help center', href: '/help' },
    ],
  },
];

export function ConsumerFooter() {
  return (
    <Footer
      logo={
        <span className="text-base font-semibold tracking-tight">Rezerva</span>
      }
      description="Book football pitches, salons, restaurants, and more — all in one place."
      columns={footerColumns}
      bottom={
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Rezerva. All rights reserved.
        </p>
      }
    />
  );
}
