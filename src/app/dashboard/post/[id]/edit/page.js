import PropTypes from 'prop-types';

import { PostEditView } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Edit Vehicle',
};

export default function PostEditPage({ params }) {
  const { id } = params;

  return <PostEditView id={id} />;
}

// Vehicles are runtime data behind auth, so nothing can be prebuilt here —
// pages render on demand (dynamicParams defaults to true).
export async function generateStaticParams() {
  return [];
}

PostEditPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
