import './WeeklyGrid.css'

function getWeekDays() {
  const days = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push({
      key: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en', { weekday: 'short' }),
      date: d.getDate(),
      isToday: i === 0,
    })
  }
  return days
}

export default function WeeklyGrid({ habits, toggleDay }) {
  const days = getWeekDays()

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
      </div>

      {habits.map(habit => (
        <div key={habit.id} className="grid-row" style={{ '--habit-color': habit.color }}>
          <div className="grid-habit-name">
            <span className="grid-emoji">{habit.emoji}</span>
            <span className="grid-name">{habit.name}</span>
          </div>
          {days.map(day => {
            const isCompleted = habit.completedDates.includes(day.key)
            return (
              <button
                key={day.key}
                className={`grid-cell ${isCompleted ? 'completed' : ''} ${day.isToday ? 'today' : ''}`}
                onClick={() => toggleDay(habit.id, day.key)}
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
        </div>
      ))}
    </div>
  )
}
