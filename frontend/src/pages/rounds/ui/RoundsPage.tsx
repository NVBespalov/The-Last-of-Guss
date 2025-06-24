import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/shared'
import { RoundsList } from '@/widgets'

export function RoundsPage() {
    const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth)

    if (loading) {
        return null
    }
    if (error) {
        return <Navigate to="/login" replace />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <RoundsList />
}