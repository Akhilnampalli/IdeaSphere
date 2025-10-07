import React, { useEffect, useState } from 'react';
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const CATEGORIES = ['Tech','Business','Education','Health','Creative'];
function IdeaCard({idea, onLike}){
  return (<div className="idea card p-4">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg font-semibold">{idea.title}</h3>
        <div className="text-sm text-white/60">by {idea.author?.name || 'Anonymous'}</div>
      </div>
      <div className="text-sm">{new Date(idea.createdAt).toLocaleString()}</div>
    </div>
    <p className="mt-3 whitespace-pre-wrap">{idea.content}</p>
    <div className="mt-3 flex items-center gap-2 flex-wrap">
      {(idea.tags||[]).map(t=> <span key={t} className="text-xs bg-white/5 px-2 py-1 rounded">#{t}</span>)}
      {idea.category && <span className="text-xs bg-gradient-to-r from-brand2 to-brand3 px-2 py-1 rounded">{idea.category}</span>}
    </div>
    <div className="mt-3 flex justify-between items-center">
      <div className="text-sm">❤ {idea.likes ? idea.likes.length : 0}</div>
      <div>
        <button onClick={()=>onLike(idea._id)} className="px-3 py-1 rounded bg-white/5">Like</button>
      </div>
    </div>
  </div>);
}
export default function Feed({ token, user, onLogout }){
  const [ideas, setIdeas] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  useEffect(()=>{ fetchIdeas(); }, []);
  async function fetchIdeas(){
    const params = new URLSearchParams();
    if(q) params.append('q', q);
    if(category) params.append('category', category);
    const res = await fetch(`${API}/ideas?${params.toString()}`);
    if(res.ok) setIdeas(await res.json());
  }
  async function submitIdea(e){
    e.preventDefault();
    const payload = { title, content, tags: tagsInput.split(',').map(s=>s.trim()).filter(Boolean), category };
    const res = await fetch(`${API}/ideas`, { method:'POST', headers:{ 'content-type':'application/json', Authorization:'Bearer ' + token }, body: JSON.stringify(payload) });
    if(res.ok){ setTitle(''); setContent(''); setTagsInput(''); fetchIdeas(); } else { const d = await res.json(); alert(d.message||'Error'); }
  }
  async function likeIdea(id){
    const res = await fetch(`${API}/ideas/${id}/like`, { method:'POST', headers:{ Authorization:'Bearer '+token } });
    if(res.ok) fetchIdeas(); else { const d = await res.json(); alert(d.message||'Error'); }
  }
  return (<div className="container">
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-3">
        <div className="text-2xl font-bold">IdeaSphere</div>
        <div className="text-sm text-white/60">👋 {user?.name}</div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onLogout} className="px-3 py-2 rounded bg-white/5">Logout</button>
      </div>
    </div>
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-1 space-y-4">
        <div className="card p-4">
          <h3 className="font-semibold mb-2">Share an idea</h3>
          <form onSubmit={submitIdea} className="space-y-2">
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full p-2 rounded bg-white/5" />
            <textarea value={content} onChange={e=>setContent(e.target.value)} rows={4} placeholder="What's your idea?" className="w-full p-2 rounded bg-white/5" />
            <input value={tagsInput} onChange={e=>setTagsInput(e.target.value)} placeholder="Tags (comma separated)" className="w-full p-2 rounded bg-white/5" />
            <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full p-2 rounded bg-white/5">
              <option value=''>Select category (optional)</option>
              {CATEGORIES.map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex gap-2">
              <button className="bg-gradient-to-r from-brand1 to-brand2 text-slate-900 px-4 py-2 rounded" type="submit">Post idea</button>
              <button type="button" onClick={()=>{ setTitle(''); setContent(''); setTagsInput(''); setCategory(''); }} className="border px-3 py-2 rounded">Clear</button>
            </div>
          </form>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-2">Filters</h3>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search" className="w-full p-2 rounded bg-white/5 mb-2" />
          <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full p-2 rounded bg-white/5 mb-2">
            <option value=''>All categories</option>
            {CATEGORIES.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={fetchIdeas} className="px-3 py-2 rounded bg-white/5">Apply</button>
            <button onClick={()=>{ setQ(''); setCategory(''); fetchIdeas(); }} className="border px-3 py-2 rounded">Clear</button>
          </div>
        </div>
      </div>
      <div className="col-span-3">
        <div className="card p-4 mb-4">
          <h2 className="text-xl font-bold">Latest ideas</h2>
        </div>
        <div className="space-y-4">
          {ideas.length===0 && <div className="card p-4">No ideas yet — be the first to share.</div>}
          {ideas.map(i=> <IdeaCard key={i._id} idea={i} onLike={likeIdea} />)}
        </div>
      </div>
    </div>
  </div>);
}
