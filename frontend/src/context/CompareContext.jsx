import React, { createContext, useContext, useState } from 'react';

const CompareContext = createContext({
  compareIds: [],
  addToCompare: () => {},
  removeFromCompare: () => {},
  clearCompare: () => {},
  isInCompare: () => false,
  isFull: false,
});

export function CompareProvider({ children }) {
  const [compareIds, setCompareIds] = useState([]);

  const addToCompare = (id) => {
    if (compareIds.length < 4 && !compareIds.includes(id)) {
      setCompareIds((prev) => [...prev, id]);
    }
  };

  const removeFromCompare = (id) => {
    setCompareIds((prev) => prev.filter((item) => item !== id));
  };

  const clearCompare = () => setCompareIds([]);

  const isInCompare = (id) => compareIds.includes(id);

  return (
    <CompareContext.Provider
      value={{
        compareIds,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        isFull: compareIds.length >= 4,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}
