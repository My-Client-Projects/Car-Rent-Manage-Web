// src/api/fleet.js
import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------
// IMPORTANT — backend response shapes (FastAPI RentFleet):
//   GET /fleet/vehicles      -> VehicleOut[]        (a PLAIN ARRAY, no wrapper)
//   GET /fleet/vehicles/:id  -> VehicleOut          (single object)
//   POST /fleet/vehicles     -> VehicleOut (201)    (server generates vehicle_id)
//   PATCH /fleet/vehicles/:id-> VehicleOut          (PATCH, not PUT; subset of fields)
// The id field is `vehicle_id`, not `id`.
// ----------------------------------------------------------------------

const VEHICLES_URL = endpoints.fleet.vehicles;

export function useGetCars() {
  const { data, isLoading, error, isValidating } = useSWR(VEHICLES_URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      cars: data || [],
      carsLoading: isLoading,
      carsError: error,
      carsValidating: isValidating,
      carsEmpty: !isLoading && !data?.length,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetCar(vehicleId) {
  const URL = vehicleId ? endpoints.fleet.vehicle(vehicleId) : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      car: data,
      carLoading: isLoading,
      carError: error,
      carValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
// Metadata for form dropdowns: categories + branches come from the API.
// (vehicle_class / fuel / transmission are static enums in car-constants.js)

export function useGetFleetMetadata() {
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useSWR(endpoints.fleet.categories, fetcher, { revalidateOnFocus: false });

  const {
    data: branches,
    isLoading: branchesLoading,
    error: branchesError,
  } = useSWR(endpoints.fleet.branches, fetcher, { revalidateOnFocus: false });

  const memoizedValue = useMemo(
    () => ({
      categories: categories || [], // [{ category_id, name, seats, ... }]
      branches: branches || [], //     [{ branch_id, name, ... }]
      metadataLoading: categoriesLoading || branchesLoading,
      metadataError: categoriesError || branchesError,
    }),
    [categories, branches, categoriesLoading, branchesLoading, categoriesError, branchesError]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
// Mutations. Always mutate the cache with the SERVER response (res.data) —
// it carries the generated vehicle_id / created_at that the client payload
// doesn't have.

export async function addCar(carData) {
  const res = await axios.post(VEHICLES_URL, carData);

  mutate(
    VEHICLES_URL,
    (currentData) => {
      if (!currentData) return [res.data];
      return [res.data, ...currentData];
    },
    false
  );

  return res.data;
}

// ----------------------------------------------------------------------

export async function updateCar(vehicleId, carData) {
  // Backend is PATCH and accepts only: branch_id, color, current_odometer,
  // daily_km_limit, status, with_driver_only, passenger_capacity,
  // payload_capacity_kg, cargo_volume_m3, gps_device_id, photos.
  const res = await axios.patch(endpoints.fleet.vehicle(vehicleId), carData);

  // update the list cache
  mutate(
    VEHICLES_URL,
    (currentData) => {
      if (!currentData) return currentData;
      return currentData.map((car) => (car.vehicle_id === vehicleId ? res.data : car));
    },
    false
  );

  // update the detail cache
  mutate(endpoints.fleet.vehicle(vehicleId), res.data, false);

  return res.data;
}

// ----------------------------------------------------------------------
// There is no DELETE on the API by design — vehicles with booking history
// must survive for finance/audit. "Removing" a vehicle = retiring it.

export async function retireCar(vehicleId) {
  return updateCar(vehicleId, { status: 'retired' });
}

// ----------------------------------------------------------------------

export function useCheckAvailability({ pickupAt, returnAt, categoryId, branchId }) {
  const shouldFetch = pickupAt && returnAt;

  const URL = shouldFetch
    ? [
        endpoints.fleet.availability,
        {
          params: {
            pickup_at: pickupAt, // ISO-8601 WITH offset, e.g. 2026-08-01T10:00:00+05:30
            return_at: returnAt,
            ...(categoryId && { category_id: categoryId }),
            ...(branchId && { branch_id: branchId }),
          },
        },
      ]
    : '';

  const { data, isLoading, error } = useSWR(URL, fetcher, { keepPreviousData: true });

  const memoizedValue = useMemo(
    () => ({
      availableCars: data || [],
      availabilityLoading: isLoading,
      availabilityError: error,
      availabilityEmpty: !isLoading && !data?.length,
    }),
    [data, error, isLoading]
  );

  return memoizedValue;
}




// import { useMemo } from 'react';
// import useSWR, { mutate } from 'swr';

// import axios, { fetcher, endpoints } from 'src/utils/axios';


// // ----------------------------------------------------------------------

// export async function addNewCar(carData) {
//   const URL = endpoints.car.list; // endpoint for fetching all cars
//   const ADD_URL = endpoints.car.add; // endpoint for creating new car

//   // POST new car to server
//   const res = await axios.post(ADD_URL, carData);

//   // Update SWR cache locally without refetch
//   mutate(
//     URL,
//     (currentData) => {
//       if (!currentData) return { cars: [carData] }; // if no data, init
//       return {
//         ...currentData,
//         cars: [...currentData.cars, carData],
//       };
//     },
//     false
//   );

//   return res.data;
// }

// // ----------------------------------------------------------------------
// export async function updateCar(id, carData) {
//   const URL = endpoints.car.list; // main list cache
//   const UPDATE_URL = `${endpoints.car.update}/${id}`; // ex: /api/cars/:id

//   const res = await axios.put(UPDATE_URL, carData);

//   // Optimistic update: replace updated car in cache
//   mutate(
//     URL,
//     (currentData) => {
//       if (!currentData) return null;

//       const updatedCars = currentData.cars.map((car) =>
//         car.id === id ? res.data : car
//       );

//       return {
//         ...currentData,
//         cars: updatedCars,
//       };
//     },
//     false
//   );

//   return res.data;
// }

// // ----------------------------------------------------------------------

// export function useGetPosts() {
//   const URL = endpoints.car.list;

//   const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

//   console.log("======data======",data);
  

//   const memoizedValue = useMemo(
//     () => ({
//       posts: data || [],
//       postsLoading: isLoading,
//       postsError: error,
//       postsValidating: isValidating,
//       postsEmpty: !isLoading && !data?.length,
//     }),
//     [data, error, isLoading, isValidating]
//   );

//   return memoizedValue;
// }

// // ----------------------------------------------------------------------

// export function useGetPost(title) {
//   const URL = title ? [endpoints.post.details, { params: { title } }] : '';

//   const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

//   const memoizedValue = useMemo(
//     () => ({
//       post: data?.post,
//       postLoading: isLoading,
//       postError: error,
//       postValidating: isValidating,
//     }),
//     [data?.post, error, isLoading, isValidating]
//   );

//   return memoizedValue;
// }

// // ----------------------------------------------------------------------

// export function useGetLatestPosts(title) {
//   const URL = title ? [endpoints.post.latest, { params: { title } }] : '';

//   const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

//   const memoizedValue = useMemo(
//     () => ({
//       latestPosts: data?.latestPosts || [],
//       latestPostsLoading: isLoading,
//       latestPostsError: error,
//       latestPostsValidating: isValidating,
//       latestPostsEmpty: !isLoading && !data?.latestPosts.length,
//     }),
//     [data?.latestPosts, error, isLoading, isValidating]
//   );

//   return memoizedValue;
// }

// // ----------------------------------------------------------------------

// export function useSearchPosts(query) {
//   const URL = query ? [endpoints.post.search, { params: { query } }] : '';

//   const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
//     keepPreviousData: true,
//   });

//   const memoizedValue = useMemo(
//     () => ({
//       searchResults: data?.results || [],
//       searchLoading: isLoading,
//       searchError: error,
//       searchValidating: isValidating,
//       searchEmpty: !isLoading && !data?.results.length,
//     }),
//     [data?.results, error, isLoading, isValidating]
//   );

//   return memoizedValue;
// }


