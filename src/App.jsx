import { useState } from 'react'
import { useHabits } from './useHabits'
import HabitCard from './components/HabitCard'
import AddHabitForm from './components/AddHabitForm'
import WeeklyGrid from './components/WeeklyGrid'
import './App.css'

function App() {
  const { habits, addHabit, deleteHabit, toggleDay, getDateKey } = useHabits()
  const [view, setView] = useState('cards')

  const today = getDateKey()
  const completedToday = habits.filter(h => h.isCompletedToday).length
  const totalHabits = habits.length

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">FirstStar</h1>
          <p className="tagline">Build better habits, one day at a time</p>
          {totalHabits > 0 && (
            <div className="daily-progress">
              <ProgressRing
                progress={totalHabits > 0 ? completedToday / totalHabits : 0}
                size={64}
                strokeWidth={5}
                color="#5b8def"
              />
              <div className="daily-stats">
                <span className="daily-count">{completedToday}/{totalHabits}</span>
                <span className="daily-label">completed today</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="main">
        <AddHabitForm onAdd={addHabit} />

        {totalHabits > 0 && (
          <div className="view-toggle">
            <button
              className={`toggle-btn ${view === 'cards' ? 'active' : ''}`}
              onClick={() => setView('cards')}
            >
              Cards
            </button>
            <button
              className={`toggle-btn ${view === 'weekly' ? 'active' : ''}`}
              onClick={() => setView('weekly')}
            >
              Weekly
            </button>
          </div>
        )}

        {view === 'cards' ? (
          <div className="habits-grid">
            {habits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                today={today}
                onToggle={() => toggleDay(habit.id, today)}
                onDelete={() => deleteHabit(habit.id)}
              />
            ))}
          </div>
        ) : (
          <WeeklyGrid habits={habits} toggleDay={toggleDay} />
        )}

        {totalHabits === 0 && (
          <div className="empty-state">
            <span className="empty-icon">⭐</span>
            <p>Add your first habit to get started!</p>
          </div>
        )}
      </main>
    </div>
  )
}

function ProgressRing({ progress, size, strokeWidth, color }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - progress * circumference

  return (
    <svg width={size} height={size} className="progress-ring">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--bg-tertiary)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
    </svg>
  )
}

export { ProgressRing }
export default App
