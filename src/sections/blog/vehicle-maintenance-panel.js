import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
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
import { fCurrency } from 'src/utils/format-number';

import { MAINTENANCE_TYPE_OPTIONS, getMaintenanceDueStatus } from 'src/_mock/_vehicle';
import { createMaintenanceRecord, deleteMaintenanceRecord } from 'src/api/vehicle-maintenance';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import EmptyContent from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { TableHeadCustom } from 'src/components/table';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'maint_type', label: 'Type' },
  { id: 'description', label: 'Description' },
  { id: 'started_at', label: 'Date' },
  { id: 'odometer', label: 'Odometer' },
  { id: 'cost', label: 'Cost' },
  { id: 'vendor', label: 'Vendor' },
  { id: 'next_due', label: 'Next Due' },
  { id: '', label: '' },
];

// ----------------------------------------------------------------------

function MaintenanceNewForm({ vehicleId, open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();

  const NewRecordSchema = Yup.object().shape({
    maint_type: Yup.string().required('Type is required'),
    description: Yup.string().nullable(),
    odometer: Yup.mixed().nullable(),
    cost: Yup.mixed().nullable(),
    vendor: Yup.string().nullable(),
    started_at: Yup.mixed().nullable(),
    completed_at: Yup.mixed().nullable(),
    next_due_odometer: Yup.mixed().nullable(),
    next_due_date: Yup.mixed().nullable(),
  });

  const methods = useForm({
    resolver: yupResolver(NewRecordSchema),
    defaultValues: {
      maint_type: 'service',
      description: '',
      odometer: '',
      cost: '',
      vendor: '',
      started_at: new Date(),
      completed_at: null,
      next_due_odometer: '',
      next_due_date: null,
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
      await createMaintenanceRecord(vehicleId, {
        ...data,
        odometer: data.odometer === '' ? null : Number(data.odometer),
        cost: data.cost === '' ? null : Number(data.cost),
        next_due_odometer: data.next_due_odometer === '' ? null : Number(data.next_due_odometer),
      });
      enqueueSnackbar('Maintenance record added!');
      reset();
      onClose();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error?.message || 'Something went wrong', { variant: 'error' });
    }
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Add Maintenance Record</DialogTitle>

        <DialogContent sx={{ pt: '10px !important' }}>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
          >
            <RHFSelect native name="maint_type" label="Type" InputLabelProps={{ shrink: true }}>
              {MAINTENANCE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </RHFSelect>

            <RHFTextField name="vendor" label="Vendor" />

            <RHFTextField name="description" label="Description" sx={{ gridColumn: { sm: '1 / -1' } }} />

            <RHFTextField
              name="odometer"
              label="Odometer at service"
              type="number"
              InputProps={{ endAdornment: <InputAdornment position="end">km</InputAdornment> }}
            />

            <RHFTextField
              name="cost"
              label="Cost"
              type="number"
              InputProps={{ startAdornment: <InputAdornment position="start">LKR</InputAdornment> }}
            />

            <Controller
              name="started_at"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="Started"
                  value={field.value}
                  onChange={(newValue) => field.onChange(newValue)}
                  slotProps={{ textField: { fullWidth: true, error: !!error, helperText: error?.message } }}
                />
              )}
            />

            <Controller
              name="completed_at"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="Completed"
                  value={field.value}
                  onChange={(newValue) => field.onChange(newValue)}
                  slotProps={{ textField: { fullWidth: true, error: !!error, helperText: error?.message } }}
                />
              )}
            />

            <RHFTextField
              name="next_due_odometer"
              label="Next due odometer"
              type="number"
              InputProps={{ endAdornment: <InputAdornment position="end">km</InputAdornment> }}
            />

            <Controller
              name="next_due_date"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="Next due date"
                  value={field.value}
                  onChange={(newValue) => field.onChange(newValue)}
                  slotProps={{ textField: { fullWidth: true, error: !!error, helperText: error?.message } }}
                />
              )}
            />
          </Box>
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

MaintenanceNewForm.propTypes = {
  vehicleId: PropTypes.string,
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

// ----------------------------------------------------------------------

export default function VehicleMaintenancePanel({ vehicleId, records, loading, currentOdometer }) {
  const { enqueueSnackbar } = useSnackbar();

  const addForm = useBoolean();

  const handleDelete = async (maintenanceId) => {
    try {
      await deleteMaintenanceRecord(vehicleId, maintenanceId);
      enqueueSnackbar('Maintenance record deleted!');
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error?.message || 'Something went wrong', { variant: 'error' });
    }
  };

  return (
    <Card>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 3 }}>
        <Stack spacing={0.5}>
          <Typography variant="h6">Maintenance</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Service history, repairs and upcoming maintenance schedule.
          </Typography>
        </Stack>

        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={addForm.onTrue}
        >
          Add Record
        </Button>
      </Stack>

      {!loading && !records?.length ? (
        <EmptyContent filled title="No maintenance records yet" sx={{ py: 8 }} />
      ) : (
        <TableContainer sx={{ overflow: 'unset', px: 3, pb: 3 }}>
          <Scrollbar>
            <Table sx={{ minWidth: 720 }}>
              <TableHeadCustom headLabel={TABLE_HEAD} />

              <TableBody>
                {records.map((record) => {
                  const typeLabel =
                    MAINTENANCE_TYPE_OPTIONS.find((option) => option.value === record.maint_type)
                      ?.label || record.maint_type;
                  const dueStatus = getMaintenanceDueStatus(record, currentOdometer);

                  return (
                    <MaintenanceRow
                      key={record.maintenance_id}
                      typeLabel={typeLabel}
                      record={record}
                      dueStatus={dueStatus}
                      onDelete={() => handleDelete(record.maintenance_id)}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      )}

      <MaintenanceNewForm vehicleId={vehicleId} open={addForm.value} onClose={addForm.onFalse} />
    </Card>
  );
}

VehicleMaintenancePanel.propTypes = {
  vehicleId: PropTypes.string,
  records: PropTypes.array,
  loading: PropTypes.bool,
  currentOdometer: PropTypes.number,
};

// ----------------------------------------------------------------------

function MaintenanceRow({ typeLabel, record, dueStatus, onDelete }) {
  const confirm = useBoolean();

  return (
    <TableRow>
      <TableCell sx={{ textTransform: 'capitalize' }}>{typeLabel}</TableCell>
      <TableCell>{record.description || '—'}</TableCell>
      <TableCell>{record.started_at ? fDate(record.started_at) : '—'}</TableCell>
      <TableCell>{record.odometer ? `${record.odometer} km` : '—'}</TableCell>
      <TableCell>{record.cost ? fCurrency(record.cost) : '—'}</TableCell>
      <TableCell>{record.vendor || '—'}</TableCell>
      <TableCell>
        <Stack spacing={0.5}>
          <Label variant="soft" color={dueStatus.color}>
            {dueStatus.label}
          </Label>
          {(record.next_due_odometer || record.next_due_date) && (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {record.next_due_odometer ? `${record.next_due_odometer} km` : ''}
              {record.next_due_odometer && record.next_due_date ? ' · ' : ''}
              {record.next_due_date ? fDate(record.next_due_date) : ''}
            </Typography>
          )}
        </Stack>
      </TableCell>
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
        title="Delete Maintenance Record"
        content="Are you sure you want to delete this record?"
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

MaintenanceRow.propTypes = {
  typeLabel: PropTypes.string,
  record: PropTypes.object,
  dueStatus: PropTypes.object,
  onDelete: PropTypes.func,
};
