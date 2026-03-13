import { useState } from 'react'
import { ProgressRing } from '../App'
import './HabitCard.css'

function localDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function HabitCard({ habit, onToggle, onSetTime, onDelete }) {
  const [showDelete, setShowDelete] = useState(false)
  const weekProgress = getWeekProgress(habit)
  const isTimed = habit.type === 'timed'
  const todayMinutes = isTimed ? (habit.timeEntries[localDateKey(new Date())] || 0) : 0
  const totalMinutes = isTimed ? Object.values(habit.timeEntries).reduce((s, m) => s + m, 0) : 0

  return (
    <div className="habit-card" style={{ '--habit-color': habit.color }}>
      <div className="habit-main">
        {isTimed ? (
          <div className="time-input-wrap">
            <input
              type="number"
              className="time-input"
              min="0"
              max="999"
              value={todayMinutes || ''}
              placeholder="0"
              onChange={e => {
                const val = parseInt(e.target.value) || 0
                onSetTime(Math.max(0, Math.min(999, val)))
              }}
            />
            <span className="time-unit">min</span>
          </div>
        ) : (
          <button
            className={`check-btn ${habit.isCompletedToday ? 'checked' : ''}`}
            onClick={onToggle}
            aria-label={habit.isCompletedToday ? 'Uncheck habit' : 'Check habit'}
          >
            {habit.isCompletedToday ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 10l3.5 3.5L15 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : null}
          </button>
        )}

        <span className="habit-emoji">{habit.emoji}</span>
        <div className="habit-info">
          <span className={`habit-name ${habit.isCompletedToday ? 'completed' : ''}`}>
            {habit.name}
          </span>
          <div className="streak-info">
            <span className="streak current">
              🔥 {habit.currentStreak}d
            </span>
            <span className="streak best">
              ⭐ {habit.longestStreak}d best
            </span>
            {isTimed && (
              <span className="streak total-time">
                🕐 {totalMinutes}m total
              </span>
            )}
          </div>
        </div>

        <div className="habit-right">
          <ProgressRing
            progress={weekProgress}
            size={40}
            strokeWidth={3}
            color={habit.color}
          />
          <button
            className="menu-btn"
            onClick={() => setShowDelete(!showDelete)}
            aria-label="Habit options"
          >
            ···
          </button>
        </div>
      </div>

      {showDelete && (
        <div className="delete-bar">
          <span>Delete this habit?</span>
          <div className="delete-actions">
            <button className="cancel-delete" onClick={() => setShowDelete(false)}>
              Cancel
            </button>
            <button className="confirm-delete" onClick={onDelete}>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function getWeekProgress(habit) {
  const today = new Date()
  let completed = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = localDateKey(d)
    if (habit.completedDates.includes(key)) completed++
  }
  return completed / 7
}
