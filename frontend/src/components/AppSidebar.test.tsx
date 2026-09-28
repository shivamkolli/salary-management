import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppSidebar } from './AppSidebar'

describe('AppSidebar', () => {
  it('shows summary and employee navigation', () => {
    render(
      <MemoryRouter initialEntries={['/summary']}>
        <AppSidebar />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Summary' })).toHaveAttribute('href', '/summary')
    expect(screen.getByRole('link', { name: 'Summary' })).toHaveClass('sidebar-link--active')
    expect(screen.getByRole('link', { name: 'Employees' })).toHaveAttribute('href', '/employees')
  })
})
