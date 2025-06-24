import {createRoot} from 'react-dom/client'
import './app/styles/index.css'
import * as React from "react";
import {App} from "./src/app/App";

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
