import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import axios, { fetcher, endpoints } from 'src/utils/axios';


// ----------------------------------------------------------------------

export async function addNewUser(userData) {
  const URL = endpoints.user.list; 
  const ADD_URL = endpoints.user.add; 

  // POST new car to server
  const res = await axios.post(ADD_URL, userData);

  mutate(
    URL,
    (currentData) => {
      if (!currentData) return { cars: [userData] }; 
      return {
        ...currentData,
        cars: [...currentData.cars, userData],
      };
    },
    false
  );

  return res.data;
}

// ----------------------------------------------------------------------
export async function updateUser(id, userData) {
  const URL = endpoints.user.list; // main list cache
  const UPDATE_URL = `${endpoints.user.update}/${id}`; // ex: /api/cars/:id

  const res = await axios.put(UPDATE_URL, userData);

  // Optimistic update: replace updated car in cache
  mutate(
    URL,
    (currentData) => {
      if (!currentData) return null;

      const updatedUsers = currentData.cars.map((car) =>
        car.id === id ? res.data : car
      );

      return {
        ...currentData,
        users: updatedUsers,
      };
    },
    false
  );

  return res.data;
}

// ----------------------------------------------------------------------

export function useGetUsers() {
  const URL = endpoints.user.list;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      users: data?.users || [],
      usersLoading: isLoading,
      usersError: error,
      usersValidating: isValidating,
      usersEmpty: !isLoading && !data?.users.length,
    }),
    [data?.users, error, isLoading, isValidating]
  );

  return memoizedValue;
}

