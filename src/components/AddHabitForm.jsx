import { useState } from 'react'
import './AddHabitForm.css'

const EMOJI_OPTIONS = [
  '💪', '📚', '🏃', '💧', '🧘', '✍️', '💤',
  '🥗', '🧹', '💊', '🎯', '🚶', '🧠', '⭐', '✝️', '🚴',
]

export default function AddHabitForm({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('💪')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd(trimmed, emoji, emoji === '🚴' ? 'timed' : 'check')
    setName('')
    setEmoji('💪')
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button className="add-habit-btn" onClick={() => setIsOpen(true)}>
        <span className="plus">+</span> Add Habit
      </button>
    )
  }

  return (
    <form className="add-habit-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="emoji-picker">
          {EMOJI_OPTIONS.map(e => (
            <button
              key={e}
              type="button"
              className={`emoji-option ${emoji === e ? 'selected' : ''}`}
              onClick={() => setEmoji(e)}
            >
              {e}
            </button>
          ))}
        </div>
        <div className="input-row">
          <span className="selected-emoji">{emoji}</span>
          <input
            type="text"
            placeholder="Habit name..."
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            maxLength={40}
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="cancel-btn" onClick={() => setIsOpen(false)}>
          Cancel
        </button>
        <button type="submit" className="submit-btn" disabled={!name.trim()}>
          Add Habit
        </button>
      </div>
    </form>
  )
}
