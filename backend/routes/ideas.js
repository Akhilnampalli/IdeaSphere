const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Idea = require('../models/Idea');
// Create an idea
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, tags, category } = req.body;
    const idea = new Idea({ title, content, tags: (tags || []).map(t => t.trim()).filter(Boolean), category, author: req.user.id });
    await idea.save();
    await idea.populate('author','name email');
    res.json(idea);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
// Get ideas with filters: ?q=&tag=&category=&author=
router.get('/', async (req, res) => {
  try {
    const { q, tag, category, author, page = 1, limit = 20, sort = 'new' } = req.query;
    const filter = {};
    if(q) filter.$or = [{ title: new RegExp(q, 'i') }, { content: new RegExp(q, 'i') }];
    if(tag) filter.tags = tag;
    if(category) filter.category = category;
    if(author) filter.author = author;
    let query = Idea.find(filter).populate('author','name email');
    if(sort === 'popular') query = query.sort({ 'likes.length': -1, likes: -1 });
    else query = query.sort({ createdAt: -1 });
    const ideas = await query.skip((page-1)*limit).limit(Number(limit));
    res.json(ideas);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
// Get single idea
router.get('/:id', async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id).populate('author','name email');
    res.json(idea);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
// Like/unlike an idea
router.post('/:id/like', auth, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if(!idea) return res.status(404).json({ message: 'Idea not found' });
    const userId = req.user.id;
    const liked = idea.likes.find(id => id.toString() === userId);
    if(liked){
      idea.likes = idea.likes.filter(id => id.toString() !== userId);
    } else {
      idea.likes.push(userId);
    }
    await idea.save();
    await idea.populate('author','name email');
    res.json({ likes: idea.likes.length, liked: !liked, idea });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
module.exports = router;
