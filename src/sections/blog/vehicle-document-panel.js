import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

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
import TableContainer from '@mui/material/TableContainer';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDate } from 'src/utils/format-time';

import { DOCUMENT_TYPE_OPTIONS, getDocumentExpiryStatus } from 'src/_mock/_vehicle';
import { createVehicleDocument, deleteVehicleDocument } from 'src/api/vehicle-document';

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
  { id: 'doc_type', label: 'Type' },
  { id: 'issued_date', label: 'Issued' },
  { id: 'expiry_date', label: 'Expiry' },
  { id: 'status', label: 'Status' },
  { id: 'file', label: 'File' },
  { id: '', label: '' },
];

// ----------------------------------------------------------------------

function DocumentNewForm({ vehicleId, open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();

  const NewDocumentSchema = Yup.object().shape({
    doc_type: Yup.string().required('Document type is required'),
    file_url: Yup.string().required('File URL is required').url('Must be a valid URL'),
    issued_date: Yup.mixed().nullable(),
    expiry_date: Yup.mixed().nullable(),
  });

  const methods = useForm({
    resolver: yupResolver(NewDocumentSchema),
    defaultValues: {
      doc_type: 'registration',
      file_url: '',
      issued_date: null,
      expiry_date: null,
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
      const payload = {
        vehicle_id: vehicleId,
        doc_type: data.doc_type,
        file_url: data.file_url,
        issued_date: data.issued_date
          ? new Date(data.issued_date).toISOString().split("T")[0]
          : null,
        expiry_date: data.expiry_date
          ? new Date(data.expiry_date).toISOString().split("T")[0]
          : null,
      };
      
      await createVehicleDocument(payload);
      enqueueSnackbar('Document added!');
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
        <DialogTitle>Add Document</DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '10px !important' }}>
          <RHFSelect native name="doc_type" label="Document Type" InputLabelProps={{ shrink: true }}>
            {DOCUMENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </RHFSelect>

          <RHFTextField name="file_url" label="File URL" placeholder="https://..." />

          <Controller
            name="issued_date"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <DatePicker
                label="Issued date"
                value={field.value}
                onChange={(newValue) => field.onChange(newValue)}
                slotProps={{ textField: { fullWidth: true, error: !!error, helperText: error?.message } }}
              />
            )}
          />

          <Controller
            name="expiry_date"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <DatePicker
                label="Expiry date"
                value={field.value}
                onChange={(newValue) => field.onChange(newValue)}
                slotProps={{ textField: { fullWidth: true, error: !!error, helperText: error?.message } }}
              />
            )}
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

DocumentNewForm.propTypes = {
  vehicleId: PropTypes.string,
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

// ----------------------------------------------------------------------

export default function VehicleDocumentPanel({ vehicleId, documents, loading }) {
  const { enqueueSnackbar } = useSnackbar();

  const addForm = useBoolean();

  const handleDelete = async (documentId) => {
    try {
      await deleteVehicleDocument(vehicleId, documentId);
      enqueueSnackbar('Document deleted!');
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error?.message || 'Something went wrong', { variant: 'error' });
    }
  };

  return (
    <Card>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 3 }}>
        <Stack spacing={0.5}>
          <Typography variant="h6">Documents</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Registration, insurance, revenue license and other compliance documents.
          </Typography>
        </Stack>

        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={addForm.onTrue}
        >
          Add Document
        </Button>
      </Stack>

      {!loading && !documents?.length ? (
        <EmptyContent filled title="No documents yet" sx={{ py: 8 }} />
      ) : (
        <TableContainer sx={{ overflow: 'unset', px: 3, pb: 3 }}>
          <Scrollbar>
            <Table sx={{ minWidth: 640 }}>
              <TableHeadCustom headLabel={TABLE_HEAD} />

              <TableBody>
                {documents?.map((doc) => {
                  const typeLabel =
                    DOCUMENT_TYPE_OPTIONS.find((option) => option.value === doc.doc_type)?.label ||
                    doc.doc_type;
                  const expiryStatus = getDocumentExpiryStatus(doc.expiry_date);

                  return (
                    <DocumentRow
                      key={doc.document_id}
                      typeLabel={typeLabel}
                      doc={doc}
                      expiryStatus={expiryStatus}
                      onDelete={() => handleDelete(doc.document_id)}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      )}

      <DocumentNewForm vehicleId={vehicleId} open={addForm.value} onClose={addForm.onFalse} />
    </Card>
  );
}

VehicleDocumentPanel.propTypes = {
  vehicleId: PropTypes.string,
  documents: PropTypes.array,
  loading: PropTypes.bool,
};

// ----------------------------------------------------------------------

function DocumentRow({ typeLabel, doc, expiryStatus, onDelete }) {
  const confirm = useBoolean();

  return (
    <TableRow>
      <TableCell sx={{ textTransform: 'capitalize' }}>{typeLabel}</TableCell>
      <TableCell>{doc.issued_date ? fDate(doc.issued_date) : '—'}</TableCell>
      <TableCell>{doc.expiry_date ? fDate(doc.expiry_date) : '—'}</TableCell>
      <TableCell>
        <Label variant="soft" color={expiryStatus.color}>
          {expiryStatus.label}
        </Label>
      </TableCell>
      <TableCell>
        {doc.file_url ? (
          <Tooltip title="Open file">
            <IconButton component="a" href={doc.file_url} target="_blank" rel="noopener">
              <Iconify icon="solar:file-download-bold" />
            </IconButton>
          </Tooltip>
        ) : (
          '—'
        )}
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
        title="Delete Document"
        content="Are you sure you want to delete this document?"
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

DocumentRow.propTypes = {
  typeLabel: PropTypes.string,
  doc: PropTypes.object,
  expiryStatus: PropTypes.object,
  onDelete: PropTypes.func,
};
