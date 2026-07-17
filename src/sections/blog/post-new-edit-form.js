import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import {
  VEHICLE_MAKES,
  FUEL_TYPE_OPTIONS,
  CARGO_VEHICLE_CLASSES,
  TRANSMISSION_OPTIONS,
  VEHICLE_CLASS_OPTIONS,
  VEHICLE_STATUS_OPTIONS,
} from 'src/_mock/_vehicle';
import { createVehicle, updateVehicle } from 'src/api/vehicle';
import { useMetadataContext } from 'src/metadata/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSwitch,
  RHFSelect,
  RHFTextField,
  RHFAutocomplete,
} from 'src/components/hook-form';

// ----------------------------------------------------------------------
// Fields the backend accepts on PATCH (edit). Everything else on the vehicle
// record is set once at creation and can't be changed afterwards, so those
// inputs are locked once `currentVehicle` is passed in.
const EDITABLE_ON_UPDATE = new Set([
  'branch_id',
  'color',
  'current_odometer',
  'daily_km_limit',
  'gps_device_id',
  'passenger_capacity',
  'payload_capacity_kg',
  'cargo_volume_m3',
  'status',
  'photoUrls',
  'with_driver_only',
]);

const toNumberOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

export default function PostNewEditForm({ currentVehicle }) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const { vehicle_category: categories, branch: branches, loading: metadataLoading, get_metadata } =
    useMetadataContext();

  useEffect(() => {
    if (!metadataLoading && !categories?.length && !branches?.length) {
      get_metadata();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isEdit = !!currentVehicle;

  const disabledOnEdit = (field) => isEdit && !EDITABLE_ON_UPDATE.has(field);

  const NewVehicleSchema = Yup.object().shape({
    category_id: Yup.string().required('Category is required'),
    branch_id: Yup.string().required('Branch is required'),
    registration_no: Yup.string().required('Registration number is required'),
    make: Yup.string().required('Make is required'),
    model: Yup.string().required('Model is required'),
    year: Yup.mixed().nullable(),
    color: Yup.string().nullable(),
    fuel_type: Yup.string().nullable(),
    transmission: Yup.string().nullable(),
    vehicle_class: Yup.string().required('Vehicle class is required'),
    daily_km_limit: Yup.mixed().nullable(),
    gps_device_id: Yup.string().nullable(),
    passenger_capacity: Yup.mixed().nullable(),
    payload_capacity_kg: Yup.mixed().nullable(),
    cargo_volume_m3: Yup.mixed().nullable(),
    with_driver_only: Yup.boolean(),
    status: Yup.string().required('Status is required'),
    current_odometer: Yup.mixed().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      category_id: currentVehicle?.category_id || '',
      branch_id: currentVehicle?.branch_id || '',
      registration_no: currentVehicle?.registration_no || '',
      make: currentVehicle?.make || '',
      model: currentVehicle?.model || '',
      year: currentVehicle?.year ?? '',
      vehicle_class: currentVehicle?.vehicle_class || 'car',
      color: currentVehicle?.color || '',
      fuel_type: currentVehicle?.fuel_type || '',
      transmission: currentVehicle?.transmission || '',
      current_odometer: currentVehicle?.current_odometer ?? 0,
      daily_km_limit: currentVehicle?.daily_km_limit ?? '',
      gps_device_id: currentVehicle?.gps_device_id || '',
      with_driver_only: currentVehicle?.with_driver_only || false,
      passenger_capacity: currentVehicle?.passenger_capacity ?? '',
      payload_capacity_kg: currentVehicle?.payload_capacity_kg ?? '',
      cargo_volume_m3: currentVehicle?.cargo_volume_m3 ?? '',
      status: currentVehicle?.status || 'available',
      photoUrls: currentVehicle?.photos?.urls || [],
    }),
    [currentVehicle]
  );

  const methods = useForm({
    resolver: yupResolver(NewVehicleSchema),
    defaultValues,
  });

  const {
    watch,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (currentVehicle) {
      reset(defaultValues);
    }
  }, [currentVehicle, defaultValues, reset]);

  const isCargoClass = CARGO_VEHICLE_CLASSES.includes(values.vehicle_class);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEdit) {
        await updateVehicle(currentVehicle.vehicle_id, {
          branch_id: data.branch_id,
          color: data.color,
          current_odometer: toNumberOrNull(data.current_odometer),
          daily_km_limit: toNumberOrNull(data.daily_km_limit),
          gps_device_id: data.gps_device_id,
          passenger_capacity: toNumberOrNull(data.passenger_capacity),
          payload_capacity_kg: toNumberOrNull(data.payload_capacity_kg),
          cargo_volume_m3: toNumberOrNull(data.cargo_volume_m3),
          status: data.status,
          with_driver_only: data.with_driver_only,
          // The API never returns `photos` on GET, so there's no reliable way to
          // detect "user cleared them" vs. "we never had them loaded". Only send
          // the field when there's something to set, so an empty list here never
          // wipes photos that may already exist server-side.
          ...(data.photoUrls?.length ? { photos: { urls: data.photoUrls } } : {}),
        });
        enqueueSnackbar('Update success!');
      } else {
        await createVehicle({
          category_id: data.category_id,
          branch_id: data.branch_id,
          registration_no: data.registration_no,
          make: data.make,
          model: data.model,
          year: toNumberOrNull(data.year),
          color: data.color,
          fuel_type: data.fuel_type,
          transmission: data.transmission,
          vehicle_class: data.vehicle_class,
          daily_km_limit: toNumberOrNull(data.daily_km_limit),
          gps_device_id: data.gps_device_id,
          passenger_capacity: toNumberOrNull(data.passenger_capacity),
          payload_capacity_kg: toNumberOrNull(data.payload_capacity_kg),
          cargo_volume_m3: toNumberOrNull(data.cargo_volume_m3),
          with_driver_only: data.with_driver_only,
        });
        enqueueSnackbar('Create success!');
      }
      router.push(paths.dashboard.post.root);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error?.message || 'Something went wrong', { variant: 'error' });
    }
  });

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Vehicle Details
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Identity, category and branch. These are locked once the vehicle is created.
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Vehicle Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                md: 'repeat(2, 1fr)',
              }}
            >
              <RHFAutocomplete
                name="make"
                label="Make"
                freeSolo
                disabled={disabledOnEdit('make')}
                options={VEHICLE_MAKES}
                getOptionLabel={(option) => option}
              />

              <RHFTextField name="model" label="Model" disabled={disabledOnEdit('model')} />

              <RHFTextField
                name="registration_no"
                label="Registration Number"
                disabled={disabledOnEdit('registration_no')}
              />

              <RHFTextField
                name="year"
                label="Year"
                type="number"
                disabled={disabledOnEdit('year')}
              />

              <RHFSelect
                native
                name="vehicle_class"
                label="Vehicle Class"
                disabled={disabledOnEdit('vehicle_class')}
                InputLabelProps={{ shrink: true }}
              >
                {VEHICLE_CLASS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </RHFSelect>

              <RHFSelect
                native
                name="category_id"
                label="Category"
                disabled={disabledOnEdit('category_id')}
                InputLabelProps={{ shrink: true }}
              >
                <option value="" />
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </RHFSelect>

              <RHFSelect
                native
                name="branch_id"
                label="Branch"
                InputLabelProps={{ shrink: true }}
              >
                <option value="" />
                {branches?.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.label}
                  </option>
                ))}
              </RHFSelect>
            </Box>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderProperties = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Specifications
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Physical attributes and capacity.
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Specifications" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                md: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="color" label="Color" disabled={disabledOnEdit('color')} />

              <RHFSelect
                native
                name="fuel_type"
                label="Fuel Type"
                disabled={disabledOnEdit('fuel_type')}
                InputLabelProps={{ shrink: true }}
              >
                <option value="" />
                {FUEL_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </RHFSelect>

              <RHFSelect
                native
                name="transmission"
                label="Transmission"
                disabled={disabledOnEdit('transmission')}
                InputLabelProps={{ shrink: true }}
              >
                <option value="" />
                {TRANSMISSION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </RHFSelect>

              <RHFTextField
                name="gps_device_id"
                label="GPS Device ID"
                disabled={disabledOnEdit('gps_device_id')}
              />

              {isEdit && (
                <RHFTextField
                  name="current_odometer"
                  label="Current Odometer"
                  type="number"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">km</InputAdornment>,
                  }}
                />
              )}

              <RHFTextField
                name="daily_km_limit"
                label="Daily KM Limit"
                type="number"
                disabled={disabledOnEdit('daily_km_limit')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">km/day</InputAdornment>,
                }}
              />

              {!isCargoClass && (
                <RHFTextField
                  name="passenger_capacity"
                  label="Passenger Capacity"
                  type="number"
                  disabled={disabledOnEdit('passenger_capacity')}
                />
              )}

              {isCargoClass && (
                <>
                  <RHFTextField
                    name="payload_capacity_kg"
                    label="Payload Capacity"
                    type="number"
                    disabled={disabledOnEdit('payload_capacity_kg')}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                    }}
                  />

                  <RHFTextField
                    name="cargo_volume_m3"
                    label="Cargo Volume"
                    type="number"
                    disabled={disabledOnEdit('cargo_volume_m3')}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">m³</InputAdornment>,
                    }}
                  />
                </>
              )}
            </Box>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <RHFSwitch name="with_driver_only" label="With driver only" />
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderPhotos = isEdit && (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Photos
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Image URLs for this vehicle.
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Photos" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFAutocomplete
              name="photoUrls"
              label="Photo URLs"
              placeholder="+ Paste an image URL and press enter"
              multiple
              freeSolo
              options={[]}
            />
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid
        xs={12}
        md={8}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        {isEdit ? (
          <RHFSelect
            native
            name="status"
            label="Status"
            InputLabelProps={{ shrink: true }}
            sx={{ width: '50%' }}
          >
            {VEHICLE_STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </RHFSelect>
        ) : (
          <Box />
        )}

        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
          {!isEdit ? 'Add Vehicle' : 'Save Changes'}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}

        {renderProperties}

        {renderPhotos}

        {renderActions}
      </Grid>
    </FormProvider>
  );
}

PostNewEditForm.propTypes = {
  currentVehicle: PropTypes.object,
};
