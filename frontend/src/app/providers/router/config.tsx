import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '../../../pages/login'
import { RoundsPage } from '../../../pages/rounds'
import { RoundPage } from '../../../pages/round'
import { Layout } from '../../../shared/ui/Layout'
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