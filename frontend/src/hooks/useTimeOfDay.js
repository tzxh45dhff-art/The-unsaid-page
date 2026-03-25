import { useState, useEffect } from 'react'

function getTimeOfDay() {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 9) return 'morning'
    if (hour >= 9 && hour < 16) return 'afternoon'
    if (hour >= 16 && hour < 18) return 'golden'
    if (hour >= 18 && hour < 21) return 'evening'
    return 'night'
}

export default function useTimeOfDay() {
    const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay)

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeOfDay(getTimeOfDay())
        }, 15 * 60 * 1000) // check every 15 min

        return () => clearInterval(interval)
    }, [])

    return timeOfDay
}
