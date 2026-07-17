import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import axios, { fetcher, endpoints } from 'src/utils/axios';


// ----------------------------------------------------------------------

export async function addNewCar(carData) {
  const URL = endpoints.car.list; // endpoint for fetching all cars
  const ADD_URL = endpoints.car.add; // endpoint for creating new car

  // POST new car to server
  const res = await axios.post(ADD_URL, carData);

  // Update SWR cache locally without refetch
  mutate(
    URL,
    (currentData) => {
      if (!currentData) return { cars: [carData] }; // if no data, init
      return {
        ...currentData,
        cars: [...currentData.cars, carData],
      };
    },
    false
  );

  return res.data;
}

// ----------------------------------------------------------------------
export async function updateCar(id, carData) {
  const URL = endpoints.car.list; // main list cache
  const UPDATE_URL = `${endpoints.car.update}/${id}`; // ex: /api/cars/:id

  const res = await axios.put(UPDATE_URL, carData);

  // Optimistic update: replace updated car in cache
  mutate(
    URL,
    (currentData) => {
      if (!currentData) return null;

      const updatedCars = currentData.cars.map((car) =>
        car.id === id ? res.data : car
      );

      return {
        ...currentData,
        cars: updatedCars,
      };
    },
    false
  );

  return res.data;
}

// ----------------------------------------------------------------------

export function useGetPosts() {
  const URL = endpoints.car.list;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  console.log("======data======",data);
  

  const memoizedValue = useMemo(
    () => ({
      posts: data || [],
      postsLoading: isLoading,
      postsError: error,
      postsValidating: isValidating,
      postsEmpty: !isLoading && !data?.length,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetPost(title) {
  const URL = title ? [endpoints.post.details, { params: { title } }] : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      post: data?.post,
      postLoading: isLoading,
      postError: error,
      postValidating: isValidating,
    }),
    [data?.post, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetLatestPosts(title) {
  const URL = title ? [endpoints.post.latest, { params: { title } }] : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      latestPosts: data?.latestPosts || [],
      latestPostsLoading: isLoading,
      latestPostsError: error,
      latestPostsValidating: isValidating,
      latestPostsEmpty: !isLoading && !data?.latestPosts.length,
    }),
    [data?.latestPosts, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useSearchPosts(query) {
  const URL = query ? [endpoints.post.search, { params: { query } }] : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.results || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !data?.results.length,
    }),
    [data?.results, error, isLoading, isValidating]
  );

  return memoizedValue;
}


