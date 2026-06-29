import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns'

interface CalendarProps {
  selectedDate: Date
  onChangeDate: (date: Date) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  currentMonth: Date
  highlightedDates: string[]
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function Calendar({
  selectedDate,
  onChangeDate,
  onPrevMonth,
  onNextMonth,
  currentMonth,
  highlightedDates,
}: CalendarProps) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart)
    const calEnd = endOfWeek(monthEnd)
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentMonth])

  const highlightedSet = useMemo(
    () => new Set(highlightedDates),
    [highlightedDates]
  )

  function isHighlighted(date: Date): boolean {
    const formatted = format(date, 'yyyy-MM-dd')
    return highlightedSet.has(formatted)
  }

  return (
    <div className="select-none">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onPrevMonth}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h3 className="text-base font-semibold text-slate-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={onNextMonth}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="pb-2 text-center text-xs font-medium text-slate-400"
          >
            {day}
          </div>
        ))}

        {days.map((day, idx) => {
          const isSelected = isSameDay(day, selectedDate)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isTodayDate = isToday(day)
          const hasEntry = isHighlighted(day)

          return (
            <button
              key={idx}
              onClick={() => onChangeDate(day)}
              className={cn(
                'relative flex h-10 items-center justify-center rounded-lg text-sm transition-colors',
                !isCurrentMonth && 'text-slate-300',
                isCurrentMonth && !isSelected && 'text-slate-700',
                isSelected && 'bg-blue-600 text-white',
                !isSelected &&
                  isCurrentMonth &&
                  'hover:bg-blue-50 hover:text-blue-700'
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full',
                  isTodayDate && !isSelected && 'border border-blue-400'
                )}
              >
                {format(day, 'd')}
              </span>
              {hasEntry && (
                <span
                  className={cn(
                    'absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full',
                    isSelected ? 'bg-white' : 'bg-blue-500'
                  )}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
