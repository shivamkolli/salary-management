import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppHeader } from './components/AppHeader'
import { EmployeeDirectory } from './pages/EmployeeDirectory'
import { EmployeeDetails } from './pages/EmployeeDetails'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <AppHeader />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/employees" replace />} />
            <Route path="/employees" element={<EmployeeDirectory />} />
            <Route path="/employees/:id" element={<EmployeeDetails />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
