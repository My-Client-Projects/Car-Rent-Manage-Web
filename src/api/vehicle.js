import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------
// Field sets mirror the backend's VehicleCreate / VehicleUpdate schemas
// (POST /api/v1/fleet/vehicles, PATCH /api/v1/fleet/vehicles/{vehicle_id}).
// Sending fields outside these sets is rejected by the API, so payloads
// are trimmed down before the request goes out.

const CREATE_FIELDS = [
  'category_id',
  'branch_id',
  'registration_no',
  'make',
  'model',
  'year',
  'color',
  'fuel_type',
  'transmission',
  'daily_km_limit',
  'cargo_volume_m3',
  'payload_capacity_kg',
  'passenger_capacity',
  'gps_device_id',
  'vehicle_class',
  'with_driver_only',
];

const UPDATE_FIELDS = [
  'branch_id',
  'color',
  'current_odometer',
  'daily_km_limit',
  'gps_device_id',
  'passenger_capacity',
  'payload_capacity_kg',
  'cargo_volume_m3',
  'photos',
  'status',
  'with_driver_only',
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

export async function createVehicle(vehicleData) {
  const URL = endpoints.fleet.list;

  const payload = buildPayload(vehicleData, CREATE_FIELDS);

  const res = await axios.post(endpoints.fleet.add, payload);

  mutate(URL);

  return res.data;
}

// ----------------------------------------------------------------------

export async function updateVehicle(vehicleId, vehicleData) {
  const URL = endpoints.fleet.list;
  const DETAILS_URL = `${endpoints.fleet.details}/${vehicleId}`;

  const payload = buildPayload(vehicleData, UPDATE_FIELDS);

  const res = await axios.patch(DETAILS_URL, payload);

  mutate(URL);
  mutate(DETAILS_URL);

  return res.data;
}

// ----------------------------------------------------------------------

export function useGetVehicles() {
  const URL = endpoints.fleet.list;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      vehicles: data || [],
      vehiclesLoading: isLoading,
      vehiclesError: error,
      vehiclesValidating: isValidating,
      vehiclesEmpty: !isLoading && !data?.length,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetVehicle(vehicleId) {
  const URL = vehicleId ? `${endpoints.fleet.details}/${vehicleId}` : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      vehicle: data,
      vehicleLoading: isLoading,
      vehicleError: error,
      vehicleValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
