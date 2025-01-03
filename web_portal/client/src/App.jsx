import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './appComponents/LandingPage'
import { ThemeProvider } from './components/ThemeProvider'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
