import React, { useState } from 'react';
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export default function Login({ onLogin }){
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  async function submit(e){
    e.preventDefault();
    const url = isRegister ? `${API}/auth/register` : `${API}/auth/login`;
    const body = isRegister ? { name, email, password } : { email, password };
    const res = await fetch(url, { method:'POST', headers:{ 'content-type':'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if(res.ok && data.token){ onLogin(data.token, data.user); } else { alert(data.message || 'Error'); }
  }
  return (<div className="container max-w-md mx-auto mt-24">
    <div className="card p-6">
      <h2 className="text-2xl font-bold mb-4">{isRegister ? 'Create account' : 'Welcome back'}</h2>
      <form onSubmit={submit} className="space-y-3">
        {isRegister && <input className="w-full p-2 rounded bg-white/5" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} /> }
        <input className="w-full p-2 rounded bg-white/5" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full p-2 rounded bg-white/5" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <div className="flex gap-2">
          <button className="bg-gradient-to-r from-brand1 to-brand2 text-slate-900 px-4 py-2 rounded" type="submit">{isRegister ? 'Sign up' : 'Sign in'}</button>
          <button type="button" onClick={()=>setIsRegister(!isRegister)} className="bg-transparent border border-white/10 px-3 py-2 rounded">{isRegister ? 'Have an account?' : 'Create account'}</button>
        </div>
      </form>
    </div>
  </div>);
}
