import React, { useState } from 'react'
import Home from './pages/Home'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import Applications from './pages/Applications'

export const UserLoggedInContext = React.createContext<{
  userLoggedIn: boolean, setUserLoggedIn: React.Dispatch<React.SetStateAction<boolean>>,
  userId: string, setUserId: React.Dispatch<React.SetStateAction<string>>,
}>({
  userLoggedIn: false, setUserLoggedIn: () => {},
  userId: '', setUserId: () => {},
})

function App() {
  const [userLoggedIn, setUserLoggedIn] = useState(false)
  const [userId, setUserId] = useState('')

  return (
    <div className="App">
      <UserLoggedInContext.Provider value={{
        userLoggedIn, setUserLoggedIn, 
        userId, setUserId,
      }}>
        {!userLoggedIn ?
          <Home />
        :
          <Applications />
        }
      </UserLoggedInContext.Provider>
    </div>
  )
}

export default App
