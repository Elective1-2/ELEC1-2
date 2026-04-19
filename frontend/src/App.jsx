import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

//? routes import
import Login from './pages/login'
import Tracking from './pages/Tracking'
import Signup from './auth/Signup'

//? assets import
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'

//? CSS
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
         <Route path="/auth">
          <Route path="signup" element={<Signup />} />
          {/* <Route path="error" element={<ErrorPage />} /> */}
        
        </Route>

        <Route path="./pages/login" element={<Login />} />
        {/* <Route path="/" element={<HSome />} /> */}
      </Routes> 
    </BrowserRouter>
  );
}

export default App