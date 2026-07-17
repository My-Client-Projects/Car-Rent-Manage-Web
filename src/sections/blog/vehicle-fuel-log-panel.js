import * as Yup from 'yup';
import PropTypes from 'prop-types';
import orderBy from 'lodash/orderBy';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDate } from 'src/utils/format-time';
import { fCurrency, fNumber } from 'src/utils/format-number';

import { createFuelLog, deleteFuelLog } from 'src/api/vehicle-fuel-log';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import EmptyContent from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { TableHeadCustom } from 'src/components/table';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'logged_at', label: 'Date' },
  { id: 'odometer', label: 'Odometer' },
  { id: 'litres', label: 'Litres' },
  { id: 'cost', label: 'Cost' },
  { id: 'efficiency', label: 'Efficiency' },
  { id: '', label: '' },
];

// ----------------------------------------------------------------------

function FuelLogNewForm({ vehicleId, open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();

  const NewFuelLogSchema = Yup.object().shape({
    logged_at: Yup.mixed().required('Date is required'),
    odometer: Yup.number().typeError('Odometer must be a number').required('Odometer is required'),
    litres: Yup.number().typeError('Litres must be a number').required('Litres is required'),
    cost: Yup.mixed().nullable(),
  });

  const methods = useForm({
    resolver: yupResolver(NewFuelLogSchema),
    defaultValues: {
      logged_at: new Date(),
      odometer: '',
      litres: '',
      cost: '',
    },
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createFuelLog(vehicleId, {
        ...data,
        odometer: Number(data.odometer),
        litres: Number(data.litres),
        cost: data.cost === '' ? null : Number(data.cost),
      });
      enqueueSnackbar('Fuel log added!');
      reset();
      onClose();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error?.message || 'Something went wrong', { variant: 'error' });
    }
  });

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Add Fuel Log</DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '10px !important' }}>
          <Controller
            name="logged_at"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <DatePicker
                label="Date"
                value={field.value}
                onChange={(newValue) => field.onChange(newValue)}
                slotProps={{ textField: { fullWidth: true, error: !!error, helperText: error?.message } }}
              />
            )}
          />

          <RHFTextField
            name="odometer"
            label="Odometer"
            type="number"
            InputProps={{ endAdornment: <InputAdornment position="end">km</InputAdornment> }}
          />

          <RHFTextField
            name="litres"
            label="Litres"
            type="number"
            InputProps={{ endAdornment: <InputAdornment position="end">L</InputAdornment> }}
          />

          <RHFTextField
            name="cost"
            label="Cost"
            type="number"
            InputProps={{ startAdornment: <InputAdornment position="start">LKR</InputAdornment> }}
          />
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Add
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

FuelLogNewForm.propTypes = {
  vehicleId: PropTypes.string,
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

// ----------------------------------------------------------------------

export default function VehicleFuelLogPanel({ vehicleId, fuelLogs, loading }) {
  const { enqueueSnackbar } = useSnackbar();

  const addForm = useBoolean();

  const handleDelete = async (fuelLogId) => {
    try {
      await deleteFuelLog(vehicleId, fuelLogId);
      enqueueSnackbar('Fuel log deleted!');
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error?.message || 'Something went wrong', { variant: 'error' });
    }
  };

  // Oldest-first so each row's efficiency is computed against the previous fill-up.
  const chronological = orderBy(fuelLogs, ['odometer'], ['asc']);

  const rows = chronological.map((log, index) => {
    const previous = chronological[index - 1];
    const kmSinceLast = previous ? log.odometer - previous.odometer : null;
    const efficiency = kmSinceLast && log.litres ? kmSinceLast / log.litres : null;
    return { ...log, efficiency };
  });

  const totalCost = fuelLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
  const totalLitres = fuelLogs.reduce((sum, log) => sum + (log.litres || 0), 0);
  const avgEfficiency = rows.length
    ? rows.filter((row) => row.efficiency).reduce((sum, row) => sum + row.efficiency, 0) /
        (rows.filter((row) => row.efficiency).length || 1)
    : 0;

  return (
    <Card>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 3 }}>
        <Stack spacing={0.5}>
          <Typography variant="h6">Fuel Logs</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Fuel purchases and fuel efficiency between fill-ups.
          </Typography>
        </Stack>

        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={addForm.onTrue}
        >
          Add Fuel Log
        </Button>
      </Stack>

      {!!fuelLogs?.length && (
        <>
          <Box
            sx={{
              px: 3,
              pb: 3,
              gap: 2,
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(3, 1fr)' },
            }}
          >
            <Stat label="Total Spent" value={fCurrency(totalCost)} />
            <Stat label="Total Litres" value={`${fNumber(totalLitres)} L`} />
            <Stat label="Avg. Efficiency" value={avgEfficiency ? `${fNumber(avgEfficiency)} km/L` : '—'} />
          </Box>
          <Divider sx={{ borderStyle: 'dashed' }} />
        </>
      )}

      {!loading && !fuelLogs?.length ? (
        <EmptyContent filled title="No fuel logs yet" sx={{ py: 8 }} />
      ) : (
        <TableContainer sx={{ overflow: 'unset', px: 3, pb: 3, pt: fuelLogs?.length ? 3 : 0 }}>
          <Scrollbar>
            <Table sx={{ minWidth: 640 }}>
              <TableHeadCustom headLabel={TABLE_HEAD} />

              <TableBody>
                {orderBy(rows, ['logged_at'], ['desc']).map((row) => (
                  <FuelLogRow key={row.fuel_log_id} row={row} onDelete={() => handleDelete(row.fuel_log_id)} />
                ))}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      )}

      <FuelLogNewForm vehicleId={vehicleId} open={addForm.value} onClose={addForm.onFalse} />
    </Card>
  );
}

VehicleFuelLogPanel.propTypes = {
  vehicleId: PropTypes.string,
  fuelLogs: PropTypes.array,
  loading: PropTypes.bool,
};

// ----------------------------------------------------------------------

function Stat({ label, value }) {
  return (
    <Stack spacing={0.5} sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="h6">{value}</Typography>
    </Stack>
  );
}

Stat.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
};

// ----------------------------------------------------------------------

function FuelLogRow({ row, onDelete }) {
  const confirm = useBoolean();

  return (
    <TableRow>
      <TableCell>{row.logged_at ? fDate(row.logged_at) : '—'}</TableCell>
      <TableCell>{row.odometer ? `${row.odometer} km` : '—'}</TableCell>
      <TableCell>{fNumber(row.litres)} L</TableCell>
      <TableCell>{row.cost ? fCurrency(row.cost) : '—'}</TableCell>
      <TableCell>{row.efficiency ? `${fNumber(row.efficiency)} km/L` : '—'}</TableCell>
      <TableCell align="right">
        <Tooltip title="Delete">
          <IconButton color="error" onClick={confirm.onTrue}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Tooltip>
      </TableCell>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete Fuel Log"
        content="Are you sure you want to delete this fuel log?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDelete();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </TableRow>
  );
}

FuelLogRow.propTypes = {
  row: PropTypes.object,
  onDelete: PropTypes.func,
};
