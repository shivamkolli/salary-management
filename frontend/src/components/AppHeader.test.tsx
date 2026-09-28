import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppHeader } from './AppHeader'

describe('AppHeader', () => {
  it('shows the product name and employee navigation', () => {
    render(
      <MemoryRouter initialEntries={['/employees']}>
        <AppHeader />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'ACME Compensation home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Employees' })).toHaveAttribute('href', '/employees')
  })
})
