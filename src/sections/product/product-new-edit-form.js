import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import {
  _tags,
  PRODUCT_SIZE_OPTIONS,
  PRODUCT_GENDER_OPTIONS,
  PRODUCT_COLOR_NAME_OPTIONS,
  PRODUCT_CATEGORY_GROUP_OPTIONS,
} from 'src/_mock';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSelect,
  RHFEditor,
  RHFUpload,
  RHFSwitch,
  RHFTextField,
  RHFMultiSelect,
  RHFAutocomplete,
  RHFMultiCheckbox,
} from 'src/components/hook-form';
import { CAR_COLOR_OPTIONS, CAR_FUEL_OPTIONS, CAR_MODEL_OPTIONS, CAR_SEAT_OPTIONS, CAR_STATUS_OPTIONS } from 'src/_mock/_fleetCar';
import { maxHeight, width } from '@mui/system';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentBooking, cars, customers }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const NewBookingSchema = Yup.object().shape({
    carId: Yup.string().required('Car is required'),
    customerId: Yup.string().required('Customer is required'),
    startDate: Yup.date().required('Start date is required'),
    endDate: Yup.date()
      .required('End date is required')
      .min(Yup.ref('startDate'), 'End date must be after start date'),
    totalAmount: Yup.number().required('Total amount is required').min(0, 'Must be positive'),
    status: Yup.string().required('Status is required'),
  });

  const defaultValues = useMemo(
    () => ({
      carId: currentBooking?.carId || '',
      customerId: currentBooking?.customerId || '',
      startDate: currentBooking?.startDate || null,
      endDate: currentBooking?.endDate || null,
      totalAmount: currentBooking?.totalAmount || 0,
      status: currentBooking?.status || 'pending',
    }),
    [currentBooking]
  );

  const methods = useForm({
    resolver: yupResolver(NewBookingSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentBooking) {
      reset(defaultValues);
    }
  }, [currentBooking, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      enqueueSnackbar(currentBooking ? 'Booking updated successfully!' : 'Booking created successfully!');
      reset();
      router.push(paths.dashboard.booking.root);

      console.info('BOOKING DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* Booking Details */}
        <Grid xs={12} md={8}>
          <Card>
            <CardHeader title="Booking Details" />
            <Stack spacing={3} sx={{ p: 3 }}>
              {/* Select Car */}
              <RHFSelect name="carId" label="Car">
                <option value="" />
                {cars?.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.brand} {car.model} ({car.registrationNumber})
                  </option>
                ))}
              </RHFSelect>

              {/* Select Customer */}
              <RHFSelect name="customerId" label="Customer">
                <option value="" />
                {customers?.map((cust) => (
                  <option key={cust.id} value={cust.id}>
                    {cust.name} ({cust.email})
                  </option>
                ))}
              </RHFSelect>

              {/* Start Date */}
              <Controller
                name="startDate"
                control={methods.control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="Start date"
                    value={field.value}
                    onChange={(newValue) => field.onChange(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                  />
                )}
              />

              <Controller
                name="endDate"
                control={methods.control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="End date"
                    value={field.value}
                    onChange={(newValue) => field.onChange(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                  />
                )}
              />

              {/* Total Amount */}
              <RHFTextField
                name="totalAmount"
                label="Total Amount"
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      $
                    </InputAdornment>
                  ),
                }}
              />

              {/* Status */}
              <RHFSelect name="status" label="Status">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </RHFSelect>
            </Stack>
          </Card>
        </Grid>

        {/* Actions */}
        <Grid xs={12} md={8} display="flex" justifyContent="flex-end">
          <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
            {!currentBooking ? 'Add Booking' : 'Save Booking'}
          </LoadingButton>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ProductNewEditForm.propTypes = {
  currentBooking: PropTypes.object,
  cars: PropTypes.array,
  customers: PropTypes.array,
};