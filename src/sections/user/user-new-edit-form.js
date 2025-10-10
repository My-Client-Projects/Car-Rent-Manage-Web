import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fData } from 'src/utils/format-number';

import { countries } from 'src/assets/data';

import Label from 'src/components/label';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
  RHFSelect,
} from 'src/components/hook-form';
import { addNewUser, updateUser } from 'src/api/user';
import { CAR_STATUS_OPTIONS } from 'src/_mock/_fleetCar';
import { USER_ROLE_OPTIONS, USER_STATUS_OPTIONS } from 'src/_mock';

// ----------------------------------------------------------------------

export default function UserNewEditForm({ currentUser }) {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    phoneNumber: Yup.string().required('Phone number is required'),
    address: Yup.string().required('Address is required'),
    nic: Yup.string().required('NIC is required'),
    licence: Yup.string().required('Licence is required'),
    country: Yup.string().required('Country is required'),
    company: Yup.string().required('Company is required'),
    state: Yup.string().required('State is required'),
    city: Yup.string().required('City is required'),
    // role: Yup.string().required('Role is required'),
    zipCode: Yup.string().required('Zip code is required'),
    // avatarUrl: Yup.mixed().nullable().required('Avatar is required'),
    // not required
    status: Yup.string(),
    isVerified: Yup.boolean(),
  });

  // const defaultValues = useMemo(
  //   () => ({
  //     name: currentUser?.name || '',
  //     city: currentUser?.city || '',
  //     role: currentUser?.role || 'user',
  //     nic: currentUser?.nic || '',
  //     licence: currentUser?.licence || '',
  //     email: currentUser?.email || '',
  //     state: currentUser?.state || '',
  //     status: currentUser?.status || '',
  //     address: currentUser?.address || '',
  //     country: currentUser?.country || '',
  //     zipCode: currentUser?.zipCode || '',
  //     company: currentUser?.company || '',
  //     avatarUrl: currentUser?.avatarUrl || null,
  //     phoneNumber: currentUser?.phoneNumber || '',
  //     isVerified: currentUser?.isVerified || true,
  //   }),
  //   [currentUser]
  // );

  const defaultValues = useMemo(
    () => ({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phoneNumber: currentUser?.phoneNumber || '',
      address: currentUser?.address || '',
      nic: currentUser?.nic || '',
      licence: currentUser?.licence || '',
      country: currentUser?.country || '',
      company: currentUser?.company || '',
      state: currentUser?.state || '',
      city: currentUser?.city || '',
      zipCode: currentUser?.zipCode || '',
      avatarUrl: currentUser?.avatarUrl || null,
      role: currentUser?.role || 'customer',
      status: currentUser?.status || 'active',
      isVerified: currentUser?.isVerified ?? true,
      customerType: currentUser?.customerType || 'individual',
      drivingExperience: currentUser?.drivingExperience || 0,
      preferredVehicleType: currentUser?.preferredVehicleType || '',
      licenseExpiry: currentUser?.licenseExpiry || '',
      emergencyContactName: currentUser?.emergencyContactName || '',
      emergencyContactNumber: currentUser?.emergencyContactNumber || '',
      paymentMethod: currentUser?.paymentMethod || 'cash',
      notes: currentUser?.notes || '',
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
    values:{'role':'user'}
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentUser) {
        const {_id} = currentUser
        await updateUser(_id,data);
        enqueueSnackbar('Update success!');
      } else {
        await addNewUser(data);
        enqueueSnackbar('Create success!');
      }
      // reset();
      enqueueSnackbar(currentUser ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.user.list);
    } catch (error) {
      console.error(error);
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('avatarUrl', newFile.preview, { shouldValidate: true });
      }
    },
    [setValue]
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            {currentUser && (
              <Label
                color={
                  (values.status === 'active' && 'success') ||
                  (values.status === 'banned' && 'error') ||
                  'warning'
                }
                sx={{ position: 'absolute', top: 24, right: 24 }}
              >
                {values.status}
              </Label>
            )}

            <Box sx={{ mb: 5 }}>
              <RHFUploadAvatar
                name="avatarUrl"
                maxSize={3145728}
                onDrop={handleDrop}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 3,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.disabled',
                    }}
                  >
                    Allowed *.jpeg, *.jpg, *.png, *.gif
                    <br /> max size of {fData(3145728)}
                  </Typography>
                }
              />
            </Box>

            {currentUser && (
              <FormControlLabel
                labelPlacement="start"
                control={
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        {...field}
                        checked={field.value !== 'active'}
                        onChange={(event) =>
                          field.onChange(event.target.checked ? 'banned' : 'active')
                        }
                      />
                    )}
                  />
                }
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Banned
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Apply disable account
                    </Typography>
                  </>
                }
                sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
              />
            )}

            <RHFSwitch
              name="isVerified"
              labelPlacement="start"
              label={
                <>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Email Verified
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Disabling this will automatically send the user a verification email
                  </Typography>
                </>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />

            {currentUser && (
              <Stack justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
                <Button variant="soft" color="error">
                  Delete User
                </Button>
              </Stack>
            )}
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="name" label="Full Name" />
              <RHFTextField name="email" label="Email Address" />
              <RHFTextField name="phoneNumber" label="Phone Number" />

              <RHFTextField name="nic" label="NIC Number" />
              <RHFTextField name="licence" label="Licence Number" />

              <RHFAutocomplete
                name="country"
                type="country"
                label="Country"
                placeholder="Choose a country"
                fullWidth
                options={countries.map((option) => option.label)}
                getOptionLabel={(option) => option}
              />

              <RHFTextField name="state" label="State/Region" />
              <RHFTextField name="city" label="City" />
              <RHFTextField name="address" label="Address" />
              <RHFTextField name="zipCode" label="Zip/Code" />
              <RHFTextField name="company" label="Occupation" />

              {/* Customer Details */}
              <RHFSelect native name="role" label="Role" InputLabelProps={{ shrink: true }}>
                {['admin', 'staff', 'customer', 'driver'].map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </RHFSelect>

              <RHFSelect
                native
                name="customerType"
                label="Customer Type"
                InputLabelProps={{ shrink: true }}
              >
                <option value="individual">Individual</option>
                <option value="company">Company</option>
              </RHFSelect>

              <RHFTextField name="drivingExperience" label="Driving Experience (years)" type="number" />

              <RHFTextField name="preferredVehicleType" label="Preferred Vehicle Type" />

              <RHFTextField name="licenseExpiry" label="License Expiry Date" type="date" InputLabelProps={{ shrink: true }} />

              <RHFTextField name="emergencyContactName" label="Emergency Contact Name" />
              <RHFTextField name="emergencyContactNumber" label="Emergency Contact Number" />

              <RHFSelect native name="paymentMethod" label="Payment Method" InputLabelProps={{ shrink: true }}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
              </RHFSelect>

              <RHFTextField name="notes" label="Notes / Additional Info" multiline rows={2} />
              {/* Customer details */}

              <RHFSelect native name="status" label="Status" InputLabelProps={{ shrink: true }} sx={{width:'50%'}}>
                {USER_STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                        {status.label}
                    </option>
                ))}
              </RHFSelect>
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentUser ? 'Create User' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

UserNewEditForm.propTypes = {
  currentUser: PropTypes.object,
};
