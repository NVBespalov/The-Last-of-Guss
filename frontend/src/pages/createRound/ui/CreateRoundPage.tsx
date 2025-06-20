import React from 'react';
import { Container, Breadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {CreateRoundForm} from "@widgets/create-round-form/ui";

export const CreateRoundPage: React.FC = () => {
    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Breadcrumbs sx={{ mb: 2 }}>
                <Link component={RouterLink} to="/" underline="hover">
                    Главная
                </Link>
                <Link component={RouterLink} to="/rounds" underline="hover">
                    Раунды
                </Link>
                <Typography color="text.primary">Создать раунд</Typography>
            </Breadcrumbs>

            <CreateRoundForm />
        </Container>
    );
};