import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/global.css'
import { Header } from './assets/Header.jsx'
import { TaskBoard } from './assets/TaskBoard.jsx'
import { Footer } from "./assets/Footer";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Header />
    <TaskBoard />
    <Footer />
  </StrictMode>,
)
