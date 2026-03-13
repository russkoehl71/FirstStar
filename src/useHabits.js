import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'firststar-habits'

function loadHabits() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveHabits(habits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits))
}

function getDateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getStreak(completedDates) {
  if (!completedDates || completedDates.length === 0) return 0
  const sorted = [...completedDates].sort().reverse()
  const today = getDateKey()
  const yesterday = getDateKey(new Date(Date.now() - 86400000))

  if (sorted[0] !== today && sorted[0] !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diff = (prev - curr) / 86400000
    if (diff === 1) {
      streak++
    } else {
      break
    }
  }
  return streak
}

function getLongestStreak(completedDates) {
  if (!completedDates || completedDates.length === 0) return 0
  const sorted = [...completedDates].sort()
  let longest = 1
  let current = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diff = (curr - prev) / 86400000
    if (diff === 1) {
      current++
      longest = Math.max(longest, current)
    } else {
      current = 1
    }
  }
  return longest
}

const COLORS = [
  '#5b8def', '#4ade80', '#f87171', '#a78bfa',
  '#fb923c', '#f472b6', '#22d3ee', '#facc15',
]

export function useHabits() {
  const [habits, setHabits] = useState(loadHabits)

  useEffect(() => {
    saveHabits(habits)
  }, [habits])

  const addHabit = useCallback((name, emoji, type = 'check') => {
    setHabits(prev => [...prev, {
      id: Date.now().toString(),
      name,
      emoji,
      type,
      color: COLORS[prev.length % COLORS.length],
      completedDates: [],
      timeEntries: {},
      createdAt: getDateKey(),
    }])
  }, [])

  const deleteHabit = useCallback((id) => {
    setHabits(prev => prev.filter(h => h.id !== id))
  }, [])

  const toggleDay = useCallback((id, dateKey) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h
      const dates = h.completedDates.includes(dateKey)
        ? h.completedDates.filter(d => d !== dateKey)
        : [...h.completedDates, dateKey]
      return { ...h, completedDates: dates }
    }))
  }, [])

  const setTime = useCallback((id, dateKey, minutes) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h
      const timeEntries = { ...(h.timeEntries || {}), [dateKey]: minutes }
      const completedDates = minutes > 0
        ? (h.completedDates.includes(dateKey) ? h.completedDates : [...h.completedDates, dateKey])
        : h.completedDates.filter(d => d !== dateKey)
      if (minutes <= 0) delete timeEntries[dateKey]
      return { ...h, timeEntries, completedDates }
    }))
  }, [])

  const habitsWithStats = habits.map(h => ({
    ...h,
    type: h.type || 'check',
    timeEntries: h.timeEntries || {},
    currentStreak: getStreak(h.completedDates),
    longestStreak: getLongestStreak(h.completedDates),
    isCompletedToday: h.completedDates.includes(getDateKey()),
  }))

  return { habits: habitsWithStats, addHabit, deleteHabit, toggleDay, setTime, getDateKey }
}
