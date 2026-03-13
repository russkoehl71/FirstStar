import { useState } from 'react'
import './WeeklyGrid.css'

function localDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getWeekDays() {
  const days = []
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday
  const sunday = new Date(today)
  sunday.setDate(today.getDate() - dayOfWeek)

  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday)
    d.setDate(sunday.getDate() + i)
    const key = localDateKey(d)
    const todayKey = localDateKey(today)
    days.push({
      key,
      label: d.toLocaleDateString('en', { weekday: 'short' }),
      date: d.getDate(),
      isToday: key === todayKey,
      isFuture: key > todayKey,
    })
  }
  return days
}

function formatMinutes(m) {
  if (m >= 60) {
    const h = Math.floor(m / 60)
    const r = m % 60
    return r > 0 ? `${h}h${r}m` : `${h}h`
  }
  return `${m}m`
}

export default function WeeklyGrid({ habits, toggleDay, setTime }) {
  const days = getWeekDays()
  const elapsedDays = days.filter(d => !d.isFuture).length
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')

  function handleTimeClick(habitId, dayKey, currentMinutes) {
    setEditingCell(`${habitId}-${dayKey}`)
    setEditValue(currentMinutes > 0 ? String(currentMinutes) : '')
  }

  function handleTimeSubmit(habitId, dayKey) {
    const val = parseInt(editValue) || 0
    setTime(habitId, dayKey, Math.max(0, Math.min(999, val)))
    setEditingCell(null)
  }

  return (
    <div className="weekly-grid">
      <div className="grid-header">
        <div className="grid-habit-label">Habit</div>
        {days.map(day => (
          <div key={day.key} className={`grid-day-header ${day.isToday ? 'today' : ''}`}>
            <span className="day-name">{day.label}</span>
            <span className="day-date">{day.date}</span>
          </div>
        ))}
        <div className="grid-day-header pct-header">
          <span className="day-name">Total</span>
        </div>
      </div>

      {habits.map(habit => {
        const isTimed = habit.type === 'timed'
        const completedCount = days
          .filter(d => !d.isFuture)
          .filter(d => habit.completedDates.includes(d.key))
          .length
        const pct = elapsedDays > 0 ? Math.round((completedCount / elapsedDays) * 100) : 0
        const weekTotal = isTimed
          ? days.reduce((sum, d) => sum + ((habit.timeEntries || {})[d.key] || 0), 0)
          : null

        return (
          <div key={habit.id} className="grid-row" style={{ '--habit-color': habit.color }}>
            <div className="grid-habit-name">
              <span className="grid-emoji">{habit.emoji}</span>
              <span className="grid-name">{habit.name}</span>
            </div>
            {days.map(day => {
              const isCompleted = habit.completedDates.includes(day.key)
              const cellKey = `${habit.id}-${day.key}`
              const minutes = isTimed ? ((habit.timeEntries || {})[day.key] || 0) : 0

              if (isTimed) {
                const isEditing = editingCell === cellKey
                return (
                  <div
                    key={day.key}
                    className={`grid-cell timed ${minutes > 0 ? 'completed' : ''} ${day.isToday ? 'today' : ''} ${day.isFuture ? 'future' : ''}`}
                  >
                    {isEditing ? (
                      <input
                        type="number"
                        className="grid-time-input"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={() => handleTimeSubmit(habit.id, day.key)}
                        onKeyDown={e => { if (e.key === 'Enter') handleTimeSubmit(habit.id, day.key) }}
                        autoFocus
                        min="0"
                        max="999"
                      />
                    ) : (
                      <button
                        className="grid-time-btn"
                        onClick={() => !day.isFuture && handleTimeClick(habit.id, day.key, minutes)}
                        disabled={day.isFuture}
                      >
                        {minutes > 0 ? minutes : ''}
                      </button>
                    )}
                  </div>
                )
              }

              return (
                <button
                  key={day.key}
                  className={`grid-cell ${isCompleted ? 'completed' : ''} ${day.isToday ? 'today' : ''} ${day.isFuture ? 'future' : ''}`}
                  onClick={() => !day.isFuture && toggleDay(habit.id, day.key)}
                  disabled={day.isFuture}
                  aria-label={`${habit.name} - ${day.label} ${day.date}`}
                >
                  {isCompleted && (
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                      <path d="M5 10l3.5 3.5L15 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              )
            })}
            <div className={`grid-pct ${isTimed ? 'timed-total' : ''} ${pct === 100 ? 'perfect' : ''}`} style={{ '--habit-color': habit.color }}>
              {isTimed ? (weekTotal > 0 ? formatMinutes(weekTotal) : '0m') : `${pct}%`}
            </div>
          </div>
        )
      })}
    </div>
  )
}
