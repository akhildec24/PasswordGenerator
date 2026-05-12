import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

function secureRandomInt(max) {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return array[0] % max
}

function shuffle(str) {
  const arr = str.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.join('')
}

function generatePassword(opts) {
  const { length, upper, lower, numbers, symbols, customWords, avoidAmbiguous } = opts

  let charset = ''
  const pools = []
  if (upper) pools.push(UPPER)
  if (lower) pools.push(LOWER)
  if (numbers) pools.push(NUMBERS)
  if (symbols) pools.push(SYMBOLS)

  if (pools.length === 0 && !customWords) return ''

  let ambiguous = 'Il1O0o'
  if (avoidAmbiguous) {
    pools.forEach((p, i) => {
      pools[i] = [...p].filter(c => !ambiguous.includes(c)).join('')
    })
  }

  pools.forEach(p => { charset += p })

  const words = customWords.trim()
  let password = ''

  if (words) {
    const separator = symbols ? SYMBOLS[secureRandomInt(SYMBOLS.length)] : '-'
    const wordPart = words.split(/\s+/).join(separator)
    password = wordPart
  }

  const remaining = Math.max(0, length - password.length)

  if (pools.length > 0) {
    for (let i = 0; i < remaining; i++) {
      password += charset[secureRandomInt(charset.length)]
    }
  }

  if (password.length > length) {
    password = password.slice(0, length)
  }

  return shuffle(password)
}

function calcStrength(pwd, opts) {
  if (!pwd) return { score: 0, label: 'None', color: 'var(--text-muted)' }
  let score = 0
  if (pwd.length >= 8) score += 1
  if (pwd.length >= 12) score += 1
  if (pwd.length >= 16) score += 1
  if (pwd.length >= 24) score += 1
  if (/[a-z]/.test(pwd)) score += 1
  if (/[A-Z]/.test(pwd)) score += 1
  if (/[0-9]/.test(pwd)) score += 1
  if (/[^a-zA-Z0-9]/.test(pwd)) score += 1
  if (opts.customWords) score += 1

  const pct = Math.min(100, (score / 9) * 100)

  if (score <= 2) return { score, label: 'Weak', color: '#c0392b', pct }
  if (score <= 4) return { score, label: 'Fair', color: '#e67e22', pct }
  if (score <= 6) return { score, label: 'Good', color: '#6b7c4e', pct }
  return { score, label: 'Strong', color: '#4a6b8a', pct }
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('pg-theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const [length, setLength] = useState(16)
  const [upper, setUpper] = useState(true)
  const [lower, setLower] = useState(true)
  const [numbers, setNumbers] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(false)
  const [customWords, setCustomWords] = useState('')
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('pg-theme', theme)
  }, [theme])

  const opts = { length, upper, lower, numbers, symbols, customWords, avoidAmbiguous }

  const handleGenerate = useCallback(() => {
    const pwd = generatePassword(opts)
    setPassword(pwd)
    setCopied(false)
  }, [length, upper, lower, numbers, symbols, customWords, avoidAmbiguous])

  useEffect(() => {
    handleGenerate()
  }, [handleGenerate])

  const handleCopy = useCallback(() => {
    if (!password) return
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 2000)
    })
  }, [password])

  const strength = calcStrength(password, opts)

  const toggles = [
    { label: 'Uppercase (A-Z)', checked: upper, setter: setUpper },
    { label: 'Lowercase (a-z)', checked: lower, setter: setLower },
    { label: 'Numbers (0-9)', checked: numbers, setter: setNumbers },
    { label: 'Symbols (!@#$)', checked: symbols, setter: setSymbols },
  ]

  return (
    <main className="app" role="main">
      <header className="app-header">
        <h1 className="app-title">Password Generator</h1>
        <button
          className="theme-toggle"
          onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>
      </header>

      <div className="app-body">
        <div className="password-display">
          <div
            className={`password-text ${!password ? 'placeholder' : ''}`}
            aria-label="Generated password"
            aria-live="polite"
          >
            {password || 'Click generate to create a password'}
          </div>
          <button
            className={`copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            disabled={!password}
            aria-label="Copy password to clipboard"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="strength-label">
          <span>Strength</span>
          <span>{strength.label}</span>
        </div>
        <div className="strength-bar" role="progressbar" aria-valuenow={strength.pct} aria-valuemin="0" aria-valuemax="100">
          <div
            className="strength-fill"
            style={{ width: `${strength.pct}%`, backgroundColor: strength.color }}
          />
        </div>

        <div className="option-group">
          <div className="option-label">
            <span htmlFor="length-slider">Length</span>
            <span className="length-value">{length}</span>
          </div>
          <input
            id="length-slider"
            type="range"
            min="4"
            max="64"
            value={length}
            onChange={e => setLength(Number(e.target.value))}
            className="slider"
            aria-label="Password length"
          />
        </div>

        <div className="option-group">
          <div className="section-label">Character Types</div>
          <div className="toggle-grid" role="group" aria-label="Character type options">
            {toggles.map(t => (
              <div className="toggle-item" key={t.label}>
                <input
                  type="checkbox"
                  id={t.label}
                  checked={t.checked}
                  onChange={e => t.setter(e.target.checked)}
                />
                <label htmlFor={t.label}>{t.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="option-group">
          <div className="section-label">Custom Words</div>
          <input
            type="text"
            className="text-input"
            value={customWords}
            onChange={e => setCustomWords(e.target.value)}
            placeholder="e.g. myDog2024"
            aria-label="Custom words to include in password"
          />
          <div className="input-hint">
            These words will be mixed with random characters to create a memorable yet secure password.
          </div>
        </div>

        <div className="option-group">
          <div className="toggle-grid" role="group" aria-label="Additional options">
            <div className="toggle-item">
              <input
                type="checkbox"
                id="avoid-ambiguous"
                checked={avoidAmbiguous}
                onChange={e => setAvoidAmbiguous(e.target.checked)}
              />
              <label htmlFor="avoid-ambiguous">Avoid ambiguous (Il1O0o)</label>
            </div>
          </div>
        </div>

        <button className="generate-btn" onClick={handleGenerate}>
          Generate Password
        </button>
      </div>

      <footer className="app-footer">
        Generated locally in your browser. Nothing is sent or stored.
      </footer>
    </main>
  )
}

export default App
