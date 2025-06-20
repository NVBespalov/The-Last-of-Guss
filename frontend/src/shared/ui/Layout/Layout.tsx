import React from 'react'
import { Outlet } from 'react-router-dom'
import { Container } from '@mui/material'
import { Header } from '../../../widgets/header'

export function Layout() {
    return (
        <>
            <Header />
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Outlet />
            </Container>
        </>
    )
}