import { useState } from 'react'
import './HistoryView.css'

function getMonthData(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = firstDay.getDay() // 0=Sun
  const totalDays = lastDay.getDate()
  return { startPad, totalDays }
}

function formatMonth(year, month) {
  return new Date(year, month).toLocaleDateString('en', { month: 'long', year: 'numeric' })
}

function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function HistoryView({ habits }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedHabitId, setSelectedHabitId] = useState('all')

  const { startPad, totalDays } = getMonthData(year, month)
  const todayKey = today.toISOString().split('T')[0]

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()
    if (isCurrentMonth) return
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  // Build a set of completed dates for the selected view
  const filteredHabits = selectedHabitId === 'all'
    ? habits
    : habits.filter(h => h.id === selectedHabitId)

  // For each day, compute how many habits were completed
  const dayCounts = {}
  for (let d = 1; d <= totalDays; d++) {
    const key = dateKey(year, month, d)
    const completed = filteredHabits.filter(h => h.completedDates.includes(key)).length
    dayCounts[d] = { completed, total: filteredHabits.length }
  }

  // Monthly stats
  const daysInScope = isCurrentMonth ? today.getDate() : totalDays
  let totalChecks = 0
  let perfectDays = 0
  let totalMinutes = 0
  const hasTimedHabits = filteredHabits.some(h => h.type === 'timed')
  for (let d = 1; d <= daysInScope; d++) {
    totalChecks += dayCounts[d].completed
    if (dayCounts[d].total > 0 && dayCounts[d].completed === dayCounts[d].total) {
      perfectDays++
    }
    const key = dateKey(year, month, d)
    for (const h of filteredHabits) {
      if (h.type === 'timed' && h.timeEntries) {
        totalMinutes += (h.timeEntries[key] || 0)
      }
    }
  }
  const possibleChecks = daysInScope * filteredHabits.length
  const monthPct = possibleChecks > 0 ? Math.round((totalChecks / possibleChecks) * 100) : 0

  return (
    <div className="history-view">
      <div className="history-controls">
        <div className="habit-filter">
          <select
            value={selectedHabitId}
            onChange={e => setSelectedHabitId(e.target.value)}
          >
            <option value="all">All Habits</option>
            {habits.map(h => (
              <option key={h.id} value={h.id}>{h.emoji} {h.name}</option>
            ))}
          </select>
        </div>
        <div className="month-nav">
          <button className="nav-btn" onClick={prevMonth}>&lt;</button>
          <span className="month-label">{formatMonth(year, month)}</span>
          <button className="nav-btn" onClick={nextMonth} disabled={isCurrentMonth}>&gt;</button>
        </div>
      </div>

      <div className="month-stats">
        <div className="stat">
          <span className="stat-value">{monthPct}%</span>
          <span className="stat-label">completion</span>
        </div>
        <div className="stat">
          <span className="stat-value">{totalChecks}</span>
          <span className="stat-label">check-ins</span>
        </div>
        <div className="stat">
          <span className="stat-value">{perfectDays}</span>
          <span className="stat-label">perfect days</span>
        </div>
        {hasTimedHabits && (
          <div className="stat">
            <span className="stat-value">{totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h${totalMinutes % 60 > 0 ? `${totalMinutes % 60}m` : ''}` : `${totalMinutes}m`}</span>
            <span className="stat-label">bike time</span>
          </div>
        )}
      </div>

      <div className="calendar">
        <div className="cal-header">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <span key={d} className="cal-day-name">{d}</span>
          ))}
        </div>
        <div className="cal-grid">
          {Array.from({ length: startPad }, (_, i) => (
            <div key={`pad-${i}`} className="cal-cell empty" />
          ))}
          {Array.from({ length: totalDays }, (_, i) => {
            const day = i + 1
            const key = dateKey(year, month, day)
            const { completed, total } = dayCounts[day]
            const isFuture = key > todayKey
            const ratio = total > 0 && !isFuture ? completed / total : 0
            const isToday = key === todayKey

            let level = 'none'
            if (!isFuture && total > 0) {
              if (ratio === 1) level = 'full'
              else if (ratio >= 0.5) level = 'high'
              else if (ratio > 0) level = 'low'
            }

            return (
              <div
                key={day}
                className={`cal-cell ${isToday ? 'today' : ''} ${isFuture ? 'future' : ''}`}
              >
                <span className="cal-date">{day}</span>
                <div className={`cal-dot level-${level}`} />
              </div>
            )
          })}
        </div>
      </div>

      <div className="cal-legend">
        <span className="legend-label">Less</span>
        <div className="legend-dot level-none" />
        <div className="legend-dot level-low" />
        <div className="legend-dot level-high" />
        <div className="legend-dot level-full" />
        <span className="legend-label">More</span>
      </div>
    </div>
  )
}
