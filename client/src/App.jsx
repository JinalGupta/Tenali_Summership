import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HelloPage from './pages/HelloPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HelloPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}