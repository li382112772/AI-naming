import { render, screen } from '@testing-library/react'
import App from './App'
import { describe, it, expect } from 'vitest'

describe('App', () => {
  it('renders headline and buttons', () => {
    render(<App />)
    expect(screen.getByText(/AI Naming Advisor/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Start Naming/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Secondary/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Outline/i })).toBeInTheDocument()
  })
})
