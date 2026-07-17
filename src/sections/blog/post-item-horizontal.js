import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import { fDate } from 'src/utils/format-time';

import { VEHICLE_STATUS_OPTIONS } from 'src/_mock/_vehicle';
import { useMetadataContext } from 'src/metadata/hooks';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import TextMaxLine from 'src/components/text-max-line';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

const VEHICLE_CLASS_ICONS = {
  car: 'mdi:car',
  suv: 'mdi:car-estate',
  van: 'mdi:van-utility',
  bus: 'mdi:bus',
  truck: 'mdi:truck',
  lorry: 'mdi:truck-cargo-container',
  bike: 'mdi:motorbike',
  tuktuk: 'mdi:rickshaw',
};

export default function PostItemHorizontal({ car }) {
  const popover = usePopover();

  const router = useRouter();

  const smUp = useResponsive('up', 'sm');

  const { vehicle_category: categories, branch: branches } = useMetadataContext();

  const {
    vehicle_id,
    registration_no,
    make,
    model,
    year,
    status,
    vehicle_class,
    fuel_type,
    transmission,
    current_odometer,
    with_driver_only,
    category_id,
    branch_id,
    created_at,
  } = car;

  const statusOption = VEHICLE_STATUS_OPTIONS.find((option) => option.value === status);
  const categoryLabel = categories?.find((item) => item.id === category_id)?.label;
  const branchLabel = branches?.find((item) => item.id === branch_id)?.label;

  return (
    <>
      <Stack component={Card} direction="row">
        <Stack
          sx={{
            p: (theme) => theme.spacing(3, 3, 2, 3),
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Label variant="soft" color={statusOption?.color || 'default'}>
              {statusOption?.label || status}
            </Label>

            <Box component="span" sx={{ typography: 'caption', color: 'text.disabled' }}>
              {fDate(created_at)}
            </Box>
          </Stack>

          <Stack spacing={1} flexGrow={1}>
            <Link
              color="inherit"
              onClick={() => router.push(paths.dashboard.car.details(vehicle_id))}
              sx={{ cursor: 'pointer' }}
            >
              <TextMaxLine variant="subtitle2" line={2}>
                {make} {model} {year ? `(${year})` : ''}
              </TextMaxLine>
            </Link>

            <TextMaxLine variant="body2" sx={{ color: 'text.secondary' }}>
              {registration_no}
              {categoryLabel ? ` · ${categoryLabel}` : ''}
              {branchLabel ? ` · ${branchLabel}` : ''}
            </TextMaxLine>
          </Stack>

          <Stack direction="row" alignItems="center">
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-horizontal-fill" />
            </IconButton>

            <Stack
              spacing={1.5}
              flexGrow={1}
              direction="row"
              flexWrap="wrap"
              justifyContent="flex-end"
              sx={{
                typography: 'caption',
                color: 'text.disabled',
              }}
            >
              {!!fuel_type && (
                <Stack direction="row" alignItems="center">
                  <Iconify icon="mdi:gas-station" width={16} sx={{ mr: 0.5 }} />
                  {fuel_type}
                </Stack>
              )}

              {!!transmission && (
                <Stack direction="row" alignItems="center">
                  <Iconify icon="mdi:car-shift-pattern" width={16} sx={{ mr: 0.5 }} />
                  {transmission}
                </Stack>
              )}

              <Stack direction="row" alignItems="center">
                <Iconify icon="mdi:counter" width={16} sx={{ mr: 0.5 }} />
                {current_odometer ?? 0} km
              </Stack>

              {with_driver_only && (
                <Stack direction="row" alignItems="center">
                  <Iconify icon="mdi:account-tie" width={16} sx={{ mr: 0.5 }} />
                  With driver
                </Stack>
              )}
            </Stack>
          </Stack>
        </Stack>

        {smUp && (
          <Box
            sx={{
              width: 180,
              height: 240,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.neutral',
              borderRadius: 1.5,
              m: 1,
            }}
          >
            <Iconify
              icon={VEHICLE_CLASS_ICONS[vehicle_class] || 'mdi:car'}
              width={72}
              sx={{ color: 'text.disabled' }}
            />
          </Box>
        )}
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="bottom-center"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            router.push(paths.dashboard.car.details(vehicle_id));
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            router.push(paths.dashboard.car.edit(vehicle_id));
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
      </CustomPopover>
    </>
  );
}

PostItemHorizontal.propTypes = {
  car: PropTypes.shape({
    vehicle_id: PropTypes.string,
    registration_no: PropTypes.string,
    make: PropTypes.string,
    model: PropTypes.string,
    year: PropTypes.number,
    status: PropTypes.string,
    vehicle_class: PropTypes.string,
    fuel_type: PropTypes.string,
    transmission: PropTypes.string,
    current_odometer: PropTypes.number,
    with_driver_only: PropTypes.bool,
    category_id: PropTypes.string,
    branch_id: PropTypes.string,
    created_at: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  }),
};
