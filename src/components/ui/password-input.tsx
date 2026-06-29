import { useState, forwardRef } from 'react'
import { Input } from './input'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps {
  id?: string
  label?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  error?: string
  required?: boolean
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ id, label, value, onChange, placeholder, error, required }, ref) {
    const [show, setShow] = useState(false)

    return (
      <div>
        {label && (
          <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={show ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={`block w-full rounded-lg border bg-white px-3 py-2 pr-10 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'
            }`}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
            tabIndex={-1}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    )
  }
)
