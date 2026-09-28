import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppHeader } from './components/AppHeader'
import { EmployeeDirectory } from './pages/EmployeeDirectory'
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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
