import React from 'react';
import HomeRemedies from './HomeRemedies';

// OrganicTreatment delegates to the enhanced HomeRemedies component
const OrganicTreatment = ({ result, treatment, t }) => {
  const mergedResult = result || (treatment ? { organic_treatment: treatment } : null);
  return <HomeRemedies result={mergedResult} t={t} />;
};

export default OrganicTreatment;
