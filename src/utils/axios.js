import axios from 'axios';

import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  metadata:{
    get_metadata: '/api/v1/metadata/get-metadata',
  },
  auth: {
    refresh: '/api/v1/auth/refresh',
    me: '/api/v1/auth/me',
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },

  car: {
    add: '/api/v1/fleet/vehicles',
    list: '/api/v1/fleet/vehicles',
    details: '/api/v1/fleet/vehicles',
    update: '/api/v1/fleet/vehicles',
    search: '/api/car/search',
  },
  fleet: {
    add: '/api/v1/fleet/vehicles',
    list: '/api/v1/fleet/vehicles',
    details: '/api/v1/fleet/vehicles',
    update: '/api/v1/fleet/vehicles',
    search: '/api/car/search',
    add_document: '/api/v1/fleet/vehicles/add-document',
    documents: (vehicleId) => `/api/v1/fleet/vehicles/${vehicleId}/documents`,
    maintenance: (vehicleId) => `/api/v1/fleet/vehicles/${vehicleId}/maintenance`,
    fuelLogs: (vehicleId) => `/api/v1/fleet/vehicles/${vehicleId}/fuel-logs`,
  },
  user: {
    add: '/api/user?endpoint=add',
    list: '/api/user?endpoint=list',
    details: '/api/user?endpoint=details',
    update: '/api/user?endpoint=update',
    search: '/api/user?endpoint=search',
  },
};
