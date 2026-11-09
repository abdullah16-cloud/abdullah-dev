import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { useCompare } from '../context/CompareContext';
import { useBikes } from '../hooks/useBikes';
import { formatPkr } from '../utils/formatPrice';
import ImagePlaceholder from '../components/common/ImagePlaceholder';
import './ComparePage.css';

/**
 * ComparePage: Functional motorcycle comparison tool using real model data.
 * Allows comparing 2 to 4 bikes side-by-side on engine, estimated price, category, and availability.
 */
function ComparePage() {
  usePageTitle('Compare Motorcycles');
  const { compareIds, addToCompare, removeFromCompare, clearCompare, isFull } = useCompare();
  const { bikes } = useBikes();

  // If compareIds is empty on first load, provide a useful default comparison (CD 70 and CG 125)
  const activeIds =
    compareIds.length > 0 ? compareIds : ['honda-cd-70', 'honda-cg-125'];

  const selectedBikes = activeIds
    .map((id) => bikes.find((b) => b.id === id || b.slug === id))
    .filter(Boolean);

  const [selectedToAdd, setSelectedToAdd] = useState('');

  const handleAddBike = (e) => {
    const id = e.target.value;
    if (id) {
      addToCompare(id);
      setSelectedToAdd('');
    }
  };

  const availableToAdd = bikes.filter((b) => !activeIds.includes(b.id) && !activeIds.includes(b.slug));

  return (
    <div className="compare-page">
      <div className="container">
        <header className="compare-header">
          <span className="compare-tag">Model Comparison</span>
          <h1 className="compare-title">Compare Honda Motorcycles</h1>
          <p className="compare-subtitle">
            Evaluate engine capacity, category, estimated showroom pricing, and availability side-by-side to choose the right motorcycle for your route.
          </p>
        </header>

        {/* Controls Bar: Add more bikes & Clear */}
        <div className="compare-controls-bar">
          <div className="compare-selector-wrap">
            <label htmlFor="compare-bike-select" className="compare-val" style={{ fontSize: '0.9rem' }}>
              Add Model to Compare:
            </label>
            <select
              id="compare-bike-select"
              className="compare-select"
              value={selectedToAdd}
              onChange={handleAddBike}
              disabled={isFull}
            >
              <option value="">{isFull ? 'Comparison limit reached (Max 4)' : '-- Choose a Motorcycle --'}</option>
              {availableToAdd.map((bike) => (
                <option key={bike.id} value={bike.id}>
                  {bike.name} ({bike.category})
                </option>
              ))}
            </select>
          </div>

          {compareIds.length > 0 && (
            <button type="button" className="compare-clear-btn" onClick={clearCompare}>
              Clear Comparison
            </button>
          )}
        </div>

        {selectedBikes.length === 0 ? (
          <div className="compare-empty-box">
            <h2 className="compare-empty-title">No Motorcycles Selected</h2>
            <p className="compare-empty-desc">
              Select at least 2 motorcycles from the dropdown above or browse the catalog to add models for side-by-side evaluation.
            </p>
            <Link to="/bikes" className="btn btn-primary">
              Browse All Motorcycles
            </Link>
          </div>
        ) : (
          <div className="compare-table-container">
            <table className="compare-table" aria-label="Motorcycle Specifications Comparison Table">
              <thead>
                <tr>
                  <th scope="col" className="compare-spec-label">
                    Specification
                  </th>
                  {selectedBikes.map((bike) => (
                    <th key={bike.id} scope="col" className="compare-bike-col">
                      <div className="compare-card-head">
                        {selectedBikes.length > 1 && (
                          <button
                            type="button"
                            className="compare-remove-btn"
                            onClick={() => removeFromCompare(bike.id)}
                            aria-label={`Remove ${bike.name} from comparison`}
                          >
                            &times;
                          </button>
                        )}
                        {(() => {
                          const imgUrl =
                            Array.isArray(bike.images) && bike.images.length > 0 && typeof bike.images[0] === 'string'
                              ? bike.images[0]
                              : `/images/bikes/${bike.slug || bike.id}.jpg`;
                          return (
                            <div className="compare-card-img-wrap" style={{ width: '100%', aspectRatio: '16 / 10', overflow: 'hidden', borderRadius: '6px', background: '#0e0e12', marginBottom: '8px' }}>
                              <img
                                src={imgUrl}
                                alt={bike.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.nextElementSibling) {
                                    e.currentTarget.nextElementSibling.style.display = 'flex';
                                  }
                                }}
                              />
                              <div style={{ display: 'none', width: '100%', height: '100%' }}>
                                <ImagePlaceholder
                                  label={bike.name}
                                  subText={bike.category}
                                  aspectRatio="16 / 10"
                                />
                              </div>
                            </div>
                          );
                        })()}
                        <span className="compare-category-badge">{bike.category}</span>
                        <h3 className="compare-bike-name">{bike.name}</h3>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" className="compare-spec-label">
                    Riding Segment
                  </th>
                  {selectedBikes.map((bike) => (
                    <td key={bike.id}>
                      <span className="compare-val" style={{ textTransform: 'capitalize' }}>
                        {bike.categoryTitle || bike.category}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <th scope="row" className="compare-spec-label">
                    Engine Displacement
                  </th>
                  {selectedBikes.map((bike) => (
                    <td key={bike.id}>
                      {bike.engineCc ? (
                        <span className="compare-val">{bike.engineCc} cc</span>
                      ) : (
                        <span className="compare-muted">Engine: not verified</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <th scope="row" className="compare-spec-label">
                    Estimated Price (PKR)
                  </th>
                  {selectedBikes.map((bike) => (
                    <td key={bike.id}>
                      {bike.pricePkr ? (
                        <span className="compare-price-val">{formatPkr(bike.pricePkr)}</span>
                      ) : (
                        <span className="compare-muted">Unverified placeholder</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <th scope="row" className="compare-spec-label">
                    Market Availability
                  </th>
                  {selectedBikes.map((bike) => (
                    <td key={bike.id}>
                      <span className="compare-val" style={{ textTransform: 'capitalize' }}>
                        {(bike.availability || 'unknown').replace('_', ' ')}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <th scope="row" className="compare-spec-label">
                    Data Integrity Status
                  </th>
                  {selectedBikes.map((bike) => (
                    <td key={bike.id}>
                      <span className="compare-muted">
                        {bike.isDemoData ? 'Demo Model (Unverified)' : 'Official Dealer Verified'}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <th scope="row" className="compare-spec-label">
                    Explore Details
                  </th>
                  {selectedBikes.map((bike) => (
                    <td key={bike.id}>
                      <Link to="/bikes" className="btn btn-dark" style={{ width: '100%', fontSize: '0.85rem' }}>
                        View in Catalog
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComparePage;
