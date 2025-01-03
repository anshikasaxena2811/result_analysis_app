import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './appComponents/LandingPage'
import FileUpload from './appComponents/FileUpload'
import { ThemeProvider } from './components/ThemeProvider'
import { Toaster } from 'sonner'
import AnalysisResults from './appComponents/AnalysisResults'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/upload" element={<FileUpload />} />
          <Route path="/results" element={<AnalysisResults />} />
        </Routes>
      </Router>
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  )
}

export default App
