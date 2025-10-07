import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Feed from './pages/Feed';
export default function App(){
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  useEffect(()=>{
    setToken(localStorage.getItem('token'));
    setUser(JSON.parse(localStorage.getItem('user') || 'null'));
  },[]);
  return token ? <Feed token={token} user={user} onLogout={()=>{ localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.reload(); }} /> : <Login onLogin={(t,u)=>{ localStorage.setItem('token', t); localStorage.setItem('user', JSON.stringify(u)); window.location.reload(); }} />;
}
