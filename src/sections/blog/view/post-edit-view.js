'use client';

import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useGetVehicle } from 'src/api/vehicle';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import PostNewEditForm from '../post-new-edit-form';

// ----------------------------------------------------------------------

export default function PostEditView({ id }) {
  const settings = useSettingsContext();

  const { vehicle: currentVehicle } = useGetVehicle(id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Vehicle"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Car',
            href: paths.dashboard.post.root,
          },
          {
            name: currentVehicle
              ? `${currentVehicle.make} ${currentVehicle.model} (${currentVehicle.registration_no})`
              : '',
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <PostNewEditForm currentVehicle={currentVehicle} />
    </Container>
  );
}

PostEditView.propTypes = {
  id: PropTypes.string,
};
