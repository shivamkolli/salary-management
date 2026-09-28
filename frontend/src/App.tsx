import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppHeader } from './components/AppHeader'
import { AppSidebar } from './components/AppSidebar'
import { EmployeeDirectory } from './pages/EmployeeDirectory'
import { EmployeeDetails } from './pages/EmployeeDetails'
import { SummaryPage } from './pages/SummaryPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <AppHeader />
        <div className="app-body">
          <AppSidebar />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Navigate to="/summary" replace />} />
              <Route path="/summary" element={<SummaryPage />} />
              <Route path="/employees" element={<EmployeeDirectory />} />
              <Route path="/employees/:id" element={<EmployeeDetails />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
