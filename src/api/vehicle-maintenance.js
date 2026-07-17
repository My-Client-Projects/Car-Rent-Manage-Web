import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------
// Field set mirrors the backend's MaintenanceRecordCreate schema
// (POST /api/v1/fleet/vehicles/{vehicle_id}/maintenance).

const CREATE_FIELDS = [
  'maint_type',
  'description',
  'odometer',
  'cost',
  'vendor',
  'started_at',
  'completed_at',
  'next_due_odometer',
  'next_due_date',
];

function buildPayload(data, fields) {
  const payload = {};

  fields.forEach((field) => {
    const value = data[field];

    if (value === undefined) return;

    payload[field] = value === '' ? null : value;
  });

  return payload;
}

// ----------------------------------------------------------------------

export async function createMaintenanceRecord(vehicleId, recordData) {
  const URL = endpoints.fleet.maintenance(vehicleId);

  const payload = buildPayload(recordData, CREATE_FIELDS);

  const res = await axios.post(URL, payload);

  mutate(URL);

  return res.data;
}

// ----------------------------------------------------------------------

export async function deleteMaintenanceRecord(vehicleId, maintenanceId) {
  const URL = endpoints.fleet.maintenance(vehicleId);

  await axios.delete(`${URL}/${maintenanceId}`);

  mutate(URL);
}

// ----------------------------------------------------------------------

export function useGetVehicleMaintenance(vehicleId) {
  const URL = vehicleId ? endpoints.fleet.maintenance(vehicleId) : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      records: data || [],
      recordsLoading: isLoading,
      recordsError: error,
      recordsValidating: isValidating,
      recordsEmpty: !isLoading && !data?.length,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
