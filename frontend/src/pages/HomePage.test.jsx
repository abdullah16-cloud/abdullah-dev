import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';
import { bikes } from '../data/bikes';
import { categories } from '../data/categories';

describe('HomePage Component Suite', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
  });

  // 1. HeroSection test
  it('renders the main h1 heading in HeroSection', () => {
    const heading = screen.getByRole('heading', {
      level: 1,
      name: /find your next honda motorcycle/i,
    });
    expect(heading).toBeInTheDocument();
  });

  // 2. FeaturedModelsSection test
  it('renders all 4 candidate models with model details and prices', () => {
    const featuredBikes = bikes.filter((b) => b.featured);
    expect(featuredBikes.length).toBe(4);

    // Check that all 4 featured model names are displayed
    featuredBikes.forEach((bike) => {
      expect(screen.getByRole('heading', { level: 3, name: bike.name })).toBeInTheDocument();
    });

    // Check that prices or pricing rows are rendered for featured models
    const priceLabels = screen.getAllByText(/Estimated Price:/i);
    expect(priceLabels.length).toBe(featuredBikes.length);
  });

  // 3. CategoriesSection test
  it('renders all category segments with correct links', () => {
    categories.forEach((cat) => {
      const catHeading = screen.getByRole('heading', {
        level: 3,
        name: cat.title,
      });
      expect(catHeading).toBeInTheDocument();

      const catLink = screen.getByRole('link', {
        name: new RegExp(`browse ${cat.title} motorcycles`, 'i'),
      });
      expect(catLink).toHaveAttribute('href', `/bikes?category=${cat.slug}`);
    });
  });

  // 4. Delivery & COD Section test
  it('renders Cash on Delivery process and mandatory purchase note', () => {
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /how cash on delivery works/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/motorcycle purchases may require dealership confirmation/i)
    ).toBeInTheDocument();
  });

  // 5. FAQ Section test
  it('renders FAQ questions in accessible disclosure widgets', () => {
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /frequently asked questions/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/is this the official honda or atlas honda website\?/i)
    ).toBeInTheDocument();
  });

  // 6. CTA Section test
  it('renders CTA section with link to explore all motorcycles', () => {
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /ready to explore motorcycles\?/i,
      })
    ).toBeInTheDocument();

    const ctaLink = screen.getByRole('link', {
      name: /explore all motorcycles/i,
    });
    expect(ctaLink).toHaveAttribute('href', '/bikes');
  });
});
