'use client';

import PropTypes from 'prop-types';

import { SplashScreen } from 'src/components/loading-screen';

import { MetadataContext } from './metadata-context';

// ----------------------------------------------------------------------

export function MetadataConsumer({ children }) {
  return (
    <MetadataContext.Consumer>
      {(metadata) => (metadata.loading ? <SplashScreen /> : children)}
    </MetadataContext.Consumer>
  );
}

MetadataConsumer.propTypes = {
  children: PropTypes.node,
};
