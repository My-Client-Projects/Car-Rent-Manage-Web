'use client';

import { useContext } from 'react';

import { MetadataContext } from '../context';

// ----------------------------------------------------------------------

export const useMetadataContext = () => {
  const context = useContext(MetadataContext);

  if (!context) throw new Error('useAuthContext context must be use inside AuthProvider');

  return context;
};
