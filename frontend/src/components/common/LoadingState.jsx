import React from 'react';
import './LoadingState.css';

function LoadingState({ message = 'Loading motorcycles...' }) {
  return (
    <div className="loading-state" role="status" aria-busy="true" aria-live="polite">
      <p className="loading-text">{message}</p>
      <div className="loading-grid">
        {[1, 2, 3].map((item) => (
          <div key={item} className="skeleton-card" aria-hidden="true">
            <div className="skeleton-image" />
            <div className="skeleton-body">
              <div className="skeleton-line short" />
              <div className="skeleton-line medium" />
              <div className="skeleton-line" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoadingState;
