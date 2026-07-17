import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------
// Field set mirrors the backend's VehicleDocumentCreate schema
// (POST /api/v1/fleet/vehicles/{vehicle_id}/documents).

const CREATE_FIELDS = ['vehicle_id', 'doc_type', 'file_url', 'issued_date', 'expiry_date'];

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

export async function createVehicleDocument(payload) {
  const URL = endpoints.fleet.add_document

  // const payload = buildPayload(documentData, CREATE_FIELDS);

  const res = await axios.post(URL, payload);

  mutate(URL);

  return res.data;
}

// ----------------------------------------------------------------------

export async function deleteVehicleDocument(vehicleId, documentId) {
  const URL = endpoints.fleet.documents(vehicleId);

  await axios.delete(`${URL}/${documentId}`);

  mutate(URL);
}

// ----------------------------------------------------------------------

export function useGetVehicleDocuments(vehicleId) {
  const URL = vehicleId ? endpoints.fleet.documents(vehicleId) : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      documents: data || [],
      documentsLoading: isLoading,
      documentsError: error,
      documentsValidating: isValidating,
      documentsEmpty: !isLoading && !data?.length,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
