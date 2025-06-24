import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages'
import { RoundsPage } from '@/pages'
import { RoundPage } from '@/pages'
import { Layout } from '@/shared'
import {CreateRoundPage} from "@/pages";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Navigate to="/login" replace />,
            },
            {
                path: 'login',
                element: <LoginPage />,
            },
            {
                path: 'rounds',
                element: <RoundsPage />,
            },
            {
                path: 'round/:id',
                element: <RoundPage />,
            },
            {
                path: 'rounds/create',
                element: <CreateRoundPage />,
            },
        ],
    },
])