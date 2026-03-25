import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { MessageNotifProvider } from './context/MessageNotifContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <UserProvider>
        <MessageNotifProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </MessageNotifProvider>
      </UserProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
