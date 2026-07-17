'use client';

import PropTypes from 'prop-types';
import { useMemo, useEffect, useReducer, useCallback } from 'react';

import axios, { endpoints } from 'src/utils/axios';

import { MetadataContext } from './metadata-context';


const initialState = {
  vehicle_category:[],
  rate_plan:[],
  rate_extra: [],
  branch: [],
  app_setting: [],
  role: [],
  loading: true,
};

const reducer = (state, action) => {
  if (action.type === 'INITIAL') {
    return {
      vehicle_category: action.payload.vehicle_category,
      rate_plan: action.payload.rate_plan?.rate_plan,
      rate_extra: action.payload.rate_extra?.rate_extra,
      branch: action.payload.branch?.branch,
      app_setting: action.payload.app_setting?.app_setting,
      role: action.payload.role?.role,
      loading: false,
    };
  }
  if(action.type === 'GET_METADATA'){
    return{
      ...state,

      vehicle_category: action.payload.vehicle_category || [],
      rate_plan: action.payload.rate_plan || [],
      rate_extra: action.payload.rate_extra || [],
      branch: action.payload.branch || [],
      app_setting: action.payload.app_setting || [],
      role: action.payload.role || [],
      loading: false,
    }
  }
  if(action.type === 'GET_METADATA_BY_NAME'){

    return {
      ...state,
      [action.payload.name]: action.payload[action.payload.name],
      loading: action.payload.loading,
    };
  }
  return state;
};

// ----------------------------------------------------------------------


export function MetadataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const get_metadata = useCallback(async () => {

    try {
        
      
        const response = await axios.get(endpoints.metadata.get_metadata);

        const result = response.data;
        

        dispatch({
          type: 'GET_METADATA',
          payload: result,
        });
        

      } catch (error) {
        console.error(error);
        dispatch({
          type: 'INITIAL',
          payload: {
              vehicle_category:[],
              rate_plan:[],
              rate_extra: [],
              branch: [],
              app_setting: [],
              role: [],
              loading: false,
          },
        });
      }
  }, []);

  const get_metadata_by_name = useCallback(async (name) => {

    try {
        
      
        const response = await axios.get(`${endpoints.metadata.get_metadata}/${name}`);

        const result = response.data;
        

        dispatch({
          type: 'GET_METADATA_BY_NAME',
          payload: {
            [name]: result,
            name: name,
          },
        });
        

      } catch (error) {
        console.error(error);
      }
  }, []);




  const memoizedValue = useMemo(
    () => ({
      loading: state.loading,
      vehicle_category: state.vehicle_category,
      rate_plan: state.rate_plan,
      rate_extra: state.rate_extra,
      branch: state.branch,
      app_setting: state.app_setting,
      role: state.role,

      get_metadata,
      get_metadata_by_name

    }),
    [get_metadata, get_metadata_by_name, state.loading,state.vehicle_category,state.rate_plan,state.rate_extra,state.branch,state.app_setting,state.role,]
  );

  return <MetadataContext.Provider value={memoizedValue}>{children}</MetadataContext.Provider>;
}

MetadataProvider.propTypes = {
  children: PropTypes.node,
};
