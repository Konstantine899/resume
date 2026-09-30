// ============================================
// App Router — router component for the composition root
// ============================================
//
// The route table lives in ./routerConfig so this file exports components only
// (react-refresh/only-export-components: constants and components never mix
// in one module).
import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router';
import { routerConfig } from './routerConfig';

// Singleton: the app mounts exactly one router for its lifetime; tests build
// their own memory routers from `routerConfig` instead of touching this one.
const router = createBrowserRouter(routerConfig);

export const AppRouter: React.FC = () => <RouterProvider router={router} />;

AppRouter.displayName = 'AppRouter';
