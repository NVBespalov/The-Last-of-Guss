import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../../shared/lib'
import { RoundsList } from '../../../widgets/rounds-list'

export function RoundsPage() {
    const { isAuthenticated, loading } = useAppSelector((state) => state.auth)

    if (loading) {
        return null // или компонент загрузки
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <RoundsList />
}