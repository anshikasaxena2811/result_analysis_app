import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './appComponents/LandingPage'
import FileUpload from './appComponents/FileUpload'
import { ThemeProvider } from './components/ThemeProvider'
import { Toaster } from 'sonner'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/upload" element={<FileUpload />} />
        </Routes>
      </Router>
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  )
}

export default App
