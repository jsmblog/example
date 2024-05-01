import './App.css'
import Register  from './Components/Register'
import config from './firebaseConfig'
import { Route, BrowserRouter as Router, Routes , Navigate } from "react-router-dom";
import { getStorage } from "firebase/storage";
import { initializeApp } from "firebase/app";
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import { useEffect, useState } from 'react';
import Home from './Components/Home';
const examplePageInitialize = initializeApp(config);
const storage = getStorage(examplePageInitialize);
const userAuth = examplePageInitialize ? getAuth(examplePageInitialize) : null
function App() {
  const [user, setUser] = useState(null)
  useEffect(() => {
    const infoUser = onAuthStateChanged(userAuth , (user)=>{
      setUser(user);
    })
  return ()=> infoUser()
   
  }, [userAuth])
  
  return (
    <>
 <Router>
  <Routes>
    <Route path='/' element={user ? <Navigate to="/Home" /> : <Register user={user} storage={storage}  />} />
    <Route path='/Home' element={<Home user={user} userAuth={userAuth}/> } />
  </Routes>
 </Router>
    </>
  )
}

export default App
