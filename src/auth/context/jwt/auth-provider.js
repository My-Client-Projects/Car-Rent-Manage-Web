'use client';

import PropTypes from 'prop-types';
import { useMemo, useEffect, useReducer, useCallback } from 'react';

import axios, { endpoints } from 'src/utils/axios';

import { AuthContext } from './auth-context';
import { setSession, isValidToken } from './utils';

// ----------------------------------------------------------------------
/**
 * NOTE:
 * We only build demo at basic level.
 * Customer will need to do some extra handling yourself if you want to extend the logic and other features...
 */
// ----------------------------------------------------------------------

const initialState = {
  user: null,
  access_token: null,
  refresh_token: null,
  token_type: null,
  expires_in: null,
  loading: true,
};

const reducer = (state, action) => {
  if (action.type === 'INITIAL') {
    return {
      user: action.payload.user,
      access_token: action.payload.access_token?.access_token,
      refresh_token: action.payload.refresh_token?.refresh_token,
      token_type: action.payload.token_type?.token_type,
      expires_in: action.payload.expires_in?.expires_in,
      loading: false,
    };
  }
  if (action.type === 'LOGIN') {
    return {
      ...state,
      user: action.payload.user,
      access_token: action.payload.access_token,
      refresh_token: action.payload.refresh_token,
      token_type: action.payload.token_type,
      expires_in: action.payload.expires_in,
    };
  }
  if (action.type === 'REGISTER') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGOUT') {
    return {
      ...state,
      user: null,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

const STORAGE_KEY = 'accessToken';
const REFRESH_STORAGE_KEY = 'refreshToken'

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(STORAGE_KEY);
      const refreshToken = sessionStorage.getItem(REFRESH_STORAGE_KEY);


      if (accessToken || refreshToken) {
        
        
        if(!accessToken && refreshToken){
          const data = {
            "refresh_token":refreshToken,
          };
          const response = await axios.post(endpoints.auth.refresh,data);

          const { access_token, refresh_token , expires_in, user } = response.data;

          setSession(access_token, refresh_token);

          dispatch({
            type: 'INITIAL',
            payload: {
                user:user,
                accessToken: access_token,
                refresh_token: refresh_token,
                expires_in: expires_in,
              },
          });
        }
        else if(accessToken){

          setSession(accessToken,refreshToken)

          const response = await axios.get(endpoints.auth.me);
          

          const user = response.data;

          dispatch({
            type: 'INITIAL',
            payload: {
                user:user,              
            },
          });
        }
        
      } else {
        dispatch({
          type: 'INITIAL',
          payload: {
            user: null,
            accessToken:null,
            refreshToken:null,
            token_type:null,
            expires_in:null
          },
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: 'INITIAL',
        payload: {
          user: null,
          accessToken:null,
          refreshToken:null,
          token_type:null,
          expires_in:null
        },
      });
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  const login = useCallback(async (email, password) => {
    
    const data = {
      email,
      password,
    };

    const response = await axios.post(endpoints.auth.login, data);

    const { access_token, refresh_token, token_type, expires_in, user } = response.data;

    setSession(access_token,refresh_token);

    dispatch({
      type: 'LOGIN',
      payload: {
          refresh_token,
          access_token,
          token_type,
          expires_in,
          user
      },
    });
  }, []);

  // REGISTER
  const register = useCallback(async (email, password, firstName, lastName) => {
    const data = {
      email,
      password,
      firstName,
      lastName,
    };

    const response = await axios.post(endpoints.auth.register, data);

    const { accessToken, user } = response.data;

    sessionStorage.setItem(STORAGE_KEY, accessToken);

    dispatch({
      type: 'REGISTER',
      payload: {
        user: {
          ...user,
          accessToken,
        },
      },
    });
  }, []);

  // LOGOUT
  const logout = useCallback(async () => {
    setSession(null,null);
    dispatch({
      type: 'LOGOUT',
    });
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user? 'authenticated' : 'unauthenticated';

  const checkToken = state.accessToken ? checkToken : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      //
      login,
      register,
      logout,
    }),
    [login, logout, register, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
