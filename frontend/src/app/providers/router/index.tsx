import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { store } from '../store'
import { theme } from '../theme'
import { router } from './config'
import {WebSocketProvider} from "@app/providers/websocket";

export function Providers() {
    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <WebSocketProvider>
                    <RouterProvider router={router} />
                </WebSocketProvider>
            </ThemeProvider>
        </Provider>
    )
}
