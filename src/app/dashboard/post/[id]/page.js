import PropTypes from 'prop-types';

import { PostDetailsView } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Post Details',
};

export default function PostDetailsPage({ params }) {
  const { id } = params;

  return <PostDetailsView id={id} />;
}

// Vehicles are runtime data behind auth, so nothing can be prebuilt here —
// pages render on demand (dynamicParams defaults to true).
export async function generateStaticParams() {
  return [];
}

PostDetailsPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
