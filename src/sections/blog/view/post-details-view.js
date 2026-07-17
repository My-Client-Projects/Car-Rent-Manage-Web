'use client';

import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useGetVehicle } from 'src/api/vehicle';
import { VEHICLE_STATUS_OPTIONS, getDocumentExpiryStatus, getMaintenanceDueStatus } from 'src/_mock/_vehicle';
import { useGetVehicleDocuments } from 'src/api/vehicle-document';
import { useGetVehicleMaintenance } from 'src/api/vehicle-maintenance';
import { useGetVehicleFuelLogs } from 'src/api/vehicle-fuel-log';
import { useMetadataContext } from 'src/metadata/hooks';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import VehicleDocumentPanel from '../vehicle-document-panel';
import VehicleMaintenancePanel from '../vehicle-maintenance-panel';
import VehicleFuelLogPanel from '../vehicle-fuel-log-panel';

// ----------------------------------------------------------------------

function DetailField({ label, value }) {
  return (
    <Grid xs={12} sm={6} md={4}>
      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
        {value || value === 0 ? value : '—'}
      </Typography>
    </Grid>
  );
}

DetailField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

// ----------------------------------------------------------------------

export default function PostDetailsView({ id }) {
  const settings = useSettingsContext();

  const [currentTab, setCurrentTab] = useState('overview');

  const { vehicle, vehicleLoading, vehicleError } = useGetVehicle(id);

  const { vehicle_category: categories, branch: branches } = useMetadataContext();

  const { documents, documentsLoading } = useGetVehicleDocuments(id);
  const { records: maintenanceRecords, recordsLoading: maintenanceLoading } = useGetVehicleMaintenance(id);
  const { fuelLogs, fuelLogsLoading } = useGetVehicleFuelLogs(id);

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const statusOption = VEHICLE_STATUS_OPTIONS.find((option) => option.value === vehicle?.status);
  const categoryLabel = categories?.find((item) => item.id === vehicle?.category_id)?.label;
  const branchLabel = branches?.find((item) => item.id === vehicle?.branch_id)?.label;

  const expiringDocuments = documents?.filter((doc) => {
    const status = getDocumentExpiryStatus(doc?.expiry_date);
    return status.color === 'error' || status.color === 'warning';
  });

  const dueMaintenance = maintenanceRecords.filter((record) => {
    const status = getMaintenanceDueStatus(record, vehicle?.current_odometer);
    return status.color === 'error' || status.color === 'warning';
  });

  const TABS = [
    { value: 'overview', label: 'Overview' },
    { value: 'documents', label: `Documents (${documents?.length})`, alert: !!expiringDocuments.length },
    {
      value: 'maintenance',
      label: `Maintenance (${maintenanceRecords.length})`,
      alert: !!dueMaintenance.length,
    },
    { value: 'fuel', label: `Fuel Logs (${fuelLogs.length})` },
  ];

  const renderSkeleton = (
    <Stack spacing={3}>
      <Skeleton variant="rounded" width={160} height={36} />
      <Skeleton variant="rounded" height={320} />
    </Stack>
  );

  const renderError = (
    <EmptyContent
      filled
      title={vehicleError?.message || 'Vehicle not found'}
      action={
        <Button
          component={RouterLink}
          href={paths.dashboard.post.root}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
          sx={{ mt: 3 }}
        >
          Back to List
        </Button>
      }
      sx={{ py: 20 }}
    />
  );

  const renderVehicle = vehicle && (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Button
          component={RouterLink}
          href={paths.dashboard.post.root}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
        >
          Back
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        <Label
          variant="soft"
          color={statusOption?.color || 'default'}
          sx={{ textTransform: 'capitalize' }}
        >
          {statusOption?.label || vehicle.status}
        </Label>

        <Button
          component={RouterLink}
          href={paths.dashboard.post.edit(vehicle.vehicle_id)}
          variant="contained"
          startIcon={<Iconify icon="solar:pen-bold" />}
        >
          Edit
        </Button>
      </Stack>

      {(!!expiringDocuments.length || !!dueMaintenance.length) && (
        <Alert
          severity="warning"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setCurrentTab(expiringDocuments.length ? 'documents' : 'maintenance')}
            >
              Review
            </Button>
          }
        >
          {!!expiringDocuments.length && (
            <Box component="span" sx={{ display: 'block' }}>
              {expiringDocuments.length} document{expiringDocuments.length > 1 ? 's' : ''} expired or
              expiring soon.
            </Box>
          )}
          {!!dueMaintenance.length && (
            <Box component="span" sx={{ display: 'block' }}>
              {dueMaintenance.length} maintenance item{dueMaintenance.length > 1 ? 's' : ''} due or overdue.
            </Box>
          )}
        </Alert>
      )}

      <Card>
        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{
            px: 3,
            boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
          }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              icon={
                tab.alert ? (
                  <Iconify icon="solar:danger-triangle-bold" width={16} sx={{ color: 'warning.main' }} />
                ) : undefined
              }
              iconPosition="end"
            />
          ))}
        </Tabs>

        {currentTab === 'overview' && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4">
              {vehicle.make} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {vehicle.registration_no}
            </Typography>

            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

            <Grid container spacing={3}>
              <DetailField label="Category" value={categoryLabel} />
              <DetailField label="Branch" value={branchLabel} />
              <DetailField label="Vehicle Class" value={vehicle.vehicle_class} />
              <DetailField label="Color" value={vehicle.color} />
              <DetailField label="Fuel Type" value={vehicle.fuel_type} />
              <DetailField label="Transmission" value={vehicle.transmission} />
              <DetailField label="Current Odometer" value={`${vehicle.current_odometer ?? 0} km`} />
              <DetailField
                label="Daily KM Limit"
                value={vehicle.daily_km_limit ? `${vehicle.daily_km_limit} km/day` : undefined}
              />
              <DetailField label="Passenger Capacity" value={vehicle.passenger_capacity} />
              <DetailField
                label="Payload Capacity"
                value={vehicle.payload_capacity_kg ? `${vehicle.payload_capacity_kg} kg` : undefined}
              />
              <DetailField
                label="Cargo Volume"
                value={vehicle.cargo_volume_m3 ? `${vehicle.cargo_volume_m3} m³` : undefined}
              />
              <DetailField label="GPS Device" value={vehicle.gps_device_id} />
              <DetailField label="With Driver Only" value={vehicle.with_driver_only ? 'Yes' : 'No'} />
            </Grid>
          </Box>
        )}
      </Card>

      {currentTab === 'documents' && (
        <VehicleDocumentPanel vehicleId={id} documents={documents} loading={documentsLoading} />
      )}

      {currentTab === 'maintenance' && (
        <VehicleMaintenancePanel
          vehicleId={id}
          records={maintenanceRecords}
          loading={maintenanceLoading}
          currentOdometer={vehicle.current_odometer}
        />
      )}

      {currentTab === 'fuel' && (
        <VehicleFuelLogPanel vehicleId={id} fuelLogs={fuelLogs} loading={fuelLogsLoading} />
      )}
    </Stack>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Vehicle Details"
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
            name: vehicle ? `${vehicle.make} ${vehicle.model}` : '',
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {vehicleLoading && renderSkeleton}

      {vehicleError && renderError}

      {vehicle && renderVehicle}
    </Container>
  );
}

PostDetailsView.propTypes = {
  id: PropTypes.string,
};
