import {createRoot} from 'react-dom/client'
import {App} from './app/App'
import './app/styles/index.css'
import * as React from "react";

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
