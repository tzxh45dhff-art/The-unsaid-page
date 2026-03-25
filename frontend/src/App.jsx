import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Poems from './pages/Poems'
import Stories from './pages/Stories'
import Read from './pages/Read'
import Submit from './pages/Submit'
import Login from './pages/Login'
import Register from './pages/Register'
import Books from './pages/Books'
import Collections from './pages/Collections'
import Admin from './pages/Admin'
import MyWorks from './pages/MyWorks'
import AIWriter from './pages/AIWriter'
import PenPals from './pages/PenPals'
import useTimeOfDay from './hooks/useTimeOfDay'

function App() {
  const location = useLocation()
  const timeOfDay = useTimeOfDay()

  // Apply time-reactive lighting class to body
  useEffect(() => {
    const classes = ['time-morning', 'time-afternoon', 'time-golden', 'time-evening', 'time-night']
    classes.forEach(c => document.body.classList.remove(c))
    document.body.classList.add(`time-${timeOfDay}`)
  }, [timeOfDay])

  return (
    <>
      <Navbar />
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/poems" element={<Poems />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/books" element={<Books />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/read/:id" element={<Read />} />
            <Route path="/submit" element={<Submit />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/my-works" element={<MyWorks />} />
              <Route path="/ai-writer" element={<AIWriter />} />
              <Route path="/penpals" element={<PenPals />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </>
  )
}

export default App
