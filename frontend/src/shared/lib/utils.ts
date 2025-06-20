export const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })
}

export const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const calculateTimeLeft = (endDate: string | Date) => {
    const now = new Date().getTime()
    const end = new Date(endDate).getTime()
    const difference = end - now

    return Math.max(0, Math.floor(difference / 1000))
}