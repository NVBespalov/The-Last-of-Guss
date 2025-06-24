import {Outlet} from 'react-router-dom'
import {Container} from '@mui/material'
import {Header} from '@/widgets'
import {useEffect} from "react";
import { useAppDispatch } from '@/shared';
import {checkAuth} from "@/features";

export function Layout() {
    const appDispatch = useAppDispatch();
    useEffect(() => {
        appDispatch(checkAuth())
    }, [appDispatch]);


    return (
        <>
            <Header />
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Outlet />
            </Container>
        </>
    )
}