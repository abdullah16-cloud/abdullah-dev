import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { catalogService } from '../../services/catalogService';
import { categories as staticCategories } from '../../data/categories';
import './CategoriesSection.css';

/**
 * Categories Section: Lets visitors filter or jump to specific riding categories.
 * Synchronized with the backend categories API.
 */
function CategoriesSection() {
  const [categoriesList, setCategoriesList] = useState(staticCategories);

  useEffect(() => {
    let isMounted = true;
    catalogService
      .getCategories()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCategoriesList(data);
        }
      })
      .catch(() => {
        // Keep initial static fallback on error
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="categories-section" aria-labelledby="categories-heading">
      <div className="container">
        <div className="categories-header">
          <span className="categories-tag">Explore Segments</span>
          <h2 id="categories-heading" className="categories-heading">
            Motorcycles Built for Every Route
          </h2>
          <p className="categories-subtext">
            Whether navigating congested city streets or open GT road stretches, find the right
            balance of efficiency and strength.
          </p>
        </div>

        <div className="categories-grid">
          {categoriesList.map((cat) => (
            <Link
              key={cat.slug}
              to={`/bikes?category=${cat.slug}`}
              className="category-card"
              aria-label={`Browse ${cat.title} motorcycles`}
            >
              <span className="category-badge">{cat.badgeText}</span>
              <h3 className="category-card-title">{cat.title}</h3>
              <p className="category-card-desc">{cat.description}</p>
              <span className="category-card-action">
                Browse Category <span aria-hidden="true">&rarr;</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoriesSection;
