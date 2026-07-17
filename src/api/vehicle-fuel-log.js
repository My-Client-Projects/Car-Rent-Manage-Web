import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------
// Field set mirrors the backend's FuelLogCreate schema
// (POST /api/v1/fleet/vehicles/{vehicle_id}/fuel-logs).
// `booking_id` / `logged_by` are set server-side (current booking, current user).

const CREATE_FIELDS = ['litres', 'cost', 'odometer', 'logged_at'];

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

export async function createFuelLog(vehicleId, fuelLogData) {
  const URL = endpoints.fleet.fuelLogs(vehicleId);

  const payload = buildPayload(fuelLogData, CREATE_FIELDS);

  const res = await axios.post(URL, payload);

  mutate(URL);

  return res.data;
}

// ----------------------------------------------------------------------

export async function deleteFuelLog(vehicleId, fuelLogId) {
  const URL = endpoints.fleet.fuelLogs(vehicleId);

  await axios.delete(`${URL}/${fuelLogId}`);

  mutate(URL);
}

// ----------------------------------------------------------------------

export function useGetVehicleFuelLogs(vehicleId) {
  const URL = vehicleId ? endpoints.fleet.fuelLogs(vehicleId) : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      fuelLogs: data || [],
      fuelLogsLoading: isLoading,
      fuelLogsError: error,
      fuelLogsValidating: isValidating,
      fuelLogsEmpty: !isLoading && !data?.length,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
