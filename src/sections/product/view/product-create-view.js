'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useGetPosts } from 'src/api/blog';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ProductNewEditForm from '../product-new-edit-form';

// ----------------------------------------------------------------------

export default function ProductCreateView() {
  const settings = useSettingsContext();

  const { posts, postsLoading } = useGetPosts();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Add a new booking"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Booking',
            href: paths.dashboard.product.root,
          },
          { name: 'New booking' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ProductNewEditForm cars={posts}/>
    </Container>
  );
}
