import React, { useReducer, useContext } from 'react';
import axios from 'axios';
import AuthContext from './authContext';
import authReducer from './authReducer';
import setAuthToken from '../../utils/setAuthToken';

import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_ERRORS
} from '../Types';


// Create a custom hook to use auth context
export const useAuth = () => {
  const { state, dispatch } = useContext(AuthContext);
  return [state, dispatch];
}

// Action creators
const config = {
  headers: {
    'Context-Type': 'application/json'
  }
}

// Load user
export const loadUser = async dispatch => {

  try {
    const res = await axios.get('/api/auth');

    dispatch({ 
      type: USER_LOADED,
      payload: res.data
    });

  } catch (err) {
    dispatch({
      type: AUTH_ERROR
    })
  }
}


// Register user
export const register = async (dispatch, formData) => {
  
  try {
    const res = await axios.post('/api/users', formData, config);

    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data
    });

    setAuthToken(res.data.token);
    loadUser(dispatch);

  } catch (err) {
    dispatch({
      type: REGISTER_FAIL,
      payload: err.response.data.msg
    })
    setAuthToken(null);
  }
}

// Login user
export const login = async (dispatch, formData) => {

  try {
    const res = await axios.post('/api/auth', formData, config);
    
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data
    });

    setAuthToken(res.data.token);
    loadUser(dispatch);

  } catch (err) {
    dispatch({
      type: LOGIN_FAIL,
      payload: err.response.data.msg
    });
    setAuthToken(null);
  }
}

// Logout 
export const logout = dispatch => {
  dispatch({ type: LOGOUT });
  setAuthToken(null);
}

// Clear Errors
export const clearErrors = dispatch => dispatch({ type: CLEAR_ERRORS });
  
const AuthState = props => {
  const initialState = {
    token: localStorage.getItem('token'),
    user: null,
    isAuthenticated: null,
    loading: true,
    error: null
  };

  setAuthToken(initialState.token);

  const [state, dispatch] = useReducer(authReducer, initialState);

  return (
    <AuthContext.Provider
      value={{
        state: state,
        dispatch
      }}
    >
      { props.children }
    </AuthContext.Provider>
  )
}

export default AuthState;