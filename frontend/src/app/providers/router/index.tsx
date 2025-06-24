import {Provider} from 'react-redux'
import {RouterProvider} from 'react-router-dom'
import {ThemeProvider} from '@mui/material/styles'
import {CssBaseline} from '@mui/material'
import {store} from '../store'
import {theme} from '../theme'
import {router} from './config'

export function Providers() {
    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <RouterProvider router={router} />
            </ThemeProvider>
        </Provider>
    )
}
