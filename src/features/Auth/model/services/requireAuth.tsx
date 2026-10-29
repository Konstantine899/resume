import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import { authModalOpen } from '../slices/authSlice';
import { selectAuthUser, selectIsAdmin, selectBootstrapFinished } from '../selectors/selectors';

export interface RequireAuthProps {
  children?: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);
  const finished = useSelector(selectBootstrapFinished);

  // Wait for the bootstrapSession() in App.tsx to finish before deciding
  // (otherwise a hard reload would instantly redirect an authenticated
  // user whose token lives only in the refresh cookie).
  if (!finished && !user) {
    return null;
  }

  if (!user) {
    try {
      dispatch(authModalOpen(true));
    } catch {
      // no store available in bare renders
    }
    return <Navigate to="/" replace />;
  }

  return <>{children ?? <Outlet />}</>;
};

export const RequireAdmin: React.FC<RequireAuthProps> = ({ children }) => {
  const isAdmin = useSelector(selectIsAdmin);
  const finished = useSelector(selectBootstrapFinished);
  const user = useSelector(selectAuthUser);

  if (!finished && !user) {
    return null;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <RequireAuth>{children}</RequireAuth>;
};
