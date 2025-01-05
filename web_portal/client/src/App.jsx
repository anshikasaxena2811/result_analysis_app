import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './components/ThemeProvider'
import { Toaster } from 'sonner'
import Landing from './appComponents/LandingPage'
import FileUpload from './appComponents/FileUpload'
import AnalysisResults from './appComponents/AnalysisResults'
import Login from './appComponents/auth/Login'
import Register from './appComponents/auth/Register'
import Profile from './appComponents/Profile'
import PrivateRoute from './components/PrivateRoute'
import { Layout } from './components/Layout'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<PrivateRoute />}>
              <Route path="/upload" element={<FileUpload />} />
              <Route path="/results" element={<AnalysisResults />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </Layout>
      </Router>
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  )
}

export default App
