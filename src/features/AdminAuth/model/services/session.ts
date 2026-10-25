import type { Dispatch, UnknownAction } from '@reduxjs/toolkit';

import { login as loginAction, logout as logoutAction } from '../slices/authSlice';

export const login = (dispatch: Dispatch<UnknownAction>): void => {
  dispatch(loginAction());
};

export const logout = (dispatch: Dispatch<UnknownAction>): void => {
  dispatch(logoutAction());
};
