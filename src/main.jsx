import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/variables.css'
import './styles/base.css'
import './styles/navigation.css'
import './styles/buttons.css'
import './styles/home.css'
import './styles/profile.css'
import './styles/auth.css'
import './styles/advice.css'
import './styles/search.css'
import './styles/footer.css' // Import the footer styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
