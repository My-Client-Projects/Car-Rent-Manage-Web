import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useEffect, useCallback,useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { CAR_FUEL_OPTIONS, CAR_SEAT_OPTIONS, CAR_COLOR_OPTIONS, CAR_MODEL_OPTIONS, CAR_STATUS_OPTIONS, CAR_COLOR_NAME_OPTIONS } from 'src/_mock/_fleetCar';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSelect,
  RHFEditor,
  RHFUpload,
  RHFSwitch,
  RHFTextField,
  RHFMultiSelect,
  RHFAutocomplete,
  RHFMultiCheckbox
} from 'src/components/hook-form';
import { addNewCar, updateCar } from 'src/api/blog';

// ----------------------------------------------------------------------

export default function PostNewEditForm({ currentCar }) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const [includeTaxes, setIncludeTaxes] = useState(false);

  const NewProductSchema = Yup.object().shape({
    // name: Yup.string().required('Name is required'),
    // images: Yup.array().min(1, 'Images is required'),
    // tags: Yup.array().min(2, 'Must have at least 2 tags'),
    // category: Yup.string().required('Category is required'),
    // price: Yup.number().moreThan(0, 'Price should not be $0.00'),
    // description: Yup.string().required('Description is required'),
    // not required
    // taxes: Yup.number(),
    // newLabel: Yup.object().shape({
    //   enabled: Yup.boolean(),
    //   content: Yup.string(),
    // }),
    // saleLabel: Yup.object().shape({
    //   enabled: Yup.boolean(),
    //   content: Yup.string(),
    // }),
  });

  const defaultValues = useMemo(
    () => ({
      brand: currentCar?.brand || '',
      description: currentCar?.description || '',
      subDescription: currentCar?.subDescription || '',
      images: currentCar?.images || [],
      //
      code: currentCar?.code || '',
      sku: currentCar?.sku || '',
      price: currentCar?.price || 0,
      quantity: currentCar?.quantity || 0,
      priceSale: currentCar?.priceSale || 0,
      tags: currentCar?.tags || [],
      taxes: currentCar?.taxes || 0,
      fuelType: currentCar?.fuelType || '',
      carModel: currentCar?.carModel || '',
      colors: currentCar?.colors || [],
      seats: currentCar?.seats || [],
      status: currentCar?.status,
      // newLabel: currentCar?.newLabel || { enabled: false, content: '' },
      // saleLabel: currentCar?.saleLabel || { enabled: false, content: '' },
    }),
    [currentCar]
  );

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (currentCar) {
      reset(defaultValues);
    }
  }, [currentCar, defaultValues, reset]);

  useEffect(() => {
    if (includeTaxes) {
      setValue('taxes', 0);
    } else {
      setValue('taxes', currentCar?.taxes || 0);
    }
  }, [currentCar?.taxes, includeTaxes, setValue]);

  const onSubmit = handleSubmit(async (data) => {

    try {
      if (currentCar) {
        const {_id} = currentCar
        await updateCar(_id,data);
        enqueueSnackbar('Update success!');
      } else {
        await addNewCar(data);
        enqueueSnackbar('Create success!');
      }
      // reset();
      enqueueSnackbar(currentCar ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.post.root);
    } catch (error) {
      console.error(error);
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const files = values.images || [];

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setValue('images', [...files, ...newFiles], { shouldValidate: true });
    },
    [setValue, values.images]
  );

  const handleRemoveFile = useCallback(
    (inputFile) => {
      const filtered = values.images && values.images?.filter((file) => file !== inputFile);
      setValue('images', filtered);
    },
    [setValue, values.images]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('images', []);
  }, [setValue]);

  const handleChangeIncludeTaxes = useCallback((event) => {
    setIncludeTaxes(event.target.checked);
  }, []);

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Details
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Brand, model description, image...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField name="brand" label="Brand" />

            {/* <RHFTextField name="model" label="Model" /> */}

              <RHFSelect native name="carModel" label="Model" InputLabelProps={{ shrink: true }}>
                {CAR_MODEL_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                ))}
                
              </RHFSelect>

            <RHFTextField name="subDescription" label="Sub Description" multiline rows={4} />

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Content</Typography>
              <RHFEditor simple name="description" />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Images</Typography>
              <RHFUpload
                multiple
                thumbnail
                name="images"
                maxSize={3145728}
                onDrop={handleDrop}
                onRemove={handleRemoveFile}
                onRemoveAll={handleRemoveAllFiles}
                onUpload={() => console.info('ON UPLOAD')}
              />
            </Stack>
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
            Properties
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Additional functions and attributes...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Properties" />}

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

              <RHFTextField name="year" label="Year" />

              <RHFTextField name="registrationNumber" label="Registration Number" />

              <RHFTextField name="transmission" label="Transmission" />

              <RHFMultiSelect
                checkbox
                name="colors"
                label="Colors"
                options={CAR_COLOR_NAME_OPTIONS}
              />

              <RHFMultiSelect checkbox name="seats" label="Seats" options={CAR_SEAT_OPTIONS} />

               <Stack spacing={1}>
                <Typography variant="subtitle2">Fuel Type</Typography>
                <RHFMultiCheckbox row name="fuelType" spacing={2} options={CAR_FUEL_OPTIONS} />
              </Stack>
            </Box>

            {/* <RHFAutocomplete
              name="tags"
              label="Tags"
              placeholder="+ Tags"
              multiple
              freeSolo
              options={_tags.map((option) => option)}
              getOptionLabel={(option) => option}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {option}
                </li>
              )}
              renderTags={(selected, getTagProps) =>
                selected.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={option}
                    size="small"
                    color="info"
                    variant="soft"
                  />
                ))
              }
            /> */}

            <Divider sx={{ borderStyle: 'dashed' }} />

            
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderPricing = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Rental Pricing
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Define the pricing structure for this vehicle
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Rental Pricing" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            {/* Per Day Cost */}
            <RHFTextField
              name="costPerDay"
              label="Cost Per Day"
              placeholder="0.00"
              type="number"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      $
                    </Box>
                  </InputAdornment>
                ),
              }}
            />

            {/* Free Mileage Per Day */}
            <RHFTextField
              name="mileagePerDay"
              label="Free Mileage Per Day"
              placeholder="e.g. 100"
              type="number"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      km
                    </Box>
                  </InputAdornment>
                ),
              }}
            />

            {/* Extra Mileage Charge */}
            <RHFTextField
              name="extraMileageCharge"
              label="Extra Mileage Charge"
              placeholder="0.00"
              type="number"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      $/km
                    </Box>
                  </InputAdornment>
                ),
              }}
            />

            {/* Deposit Amount */}
            <RHFTextField
              name="depositAmount"
              label="Deposit Amount"
              placeholder="0.00"
              type="number"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      $
                    </Box>
                  </InputAdornment>
                ),
              }}
            />

            {/* Insurance Cost */}
            <RHFTextField
              name="insuranceCost"
              label="Insurance Cost (Optional)"
              placeholder="0.00"
              type="number"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      $
                    </Box>
                  </InputAdornment>
                ),
              }}
            />

            {/* Tax Toggle */}
            {/* <FormControlLabel
              control={<Switch checked={includeTaxes} onChange={handleChangeIncludeTaxes} />}
              label="Price includes taxes"
            />

            {!includeTaxes && (
              <RHFTextField
                name="taxes"
                label="Tax (%)"
                placeholder="0.00"
                type="number"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box component="span" sx={{ color: 'text.disabled' }}>
                        %
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />
            )} */}
          </Stack>
        </Card>
      </Grid>
    </>
  );


  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8} sx={{ display: 'flex', alignItems: 'center', justifyContent:'space-between' }}>
        {/* <FormControlLabel
          control={<Switch defaultChecked />}
          label="Publish"
          sx={{ flexGrow: 1, pl: 3 }}
        /> */}

        <RHFSelect native name="status" label="Status" InputLabelProps={{ shrink: true }} sx={{width:'50%'}}>
          {CAR_STATUS_OPTIONS.map((status) => (
             <option key={status.value} value={status.value}>
                  {status.label}
              </option>
          ))}
        </RHFSelect>

        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
          {!currentCar ? 'Add Carr' : 'Save Car'}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}

        {renderProperties}

        {renderPricing}

        {renderActions}
      </Grid>
    </FormProvider>
  );
}

PostNewEditForm.propTypes = {
  currentCar: PropTypes.object,
};
