import express from 'express';
import { check, validationResult } from 'express-validator/check';
import auth from '../../middleware/auth';
import User from '../../models/User';
import Profile from '../../models/Profile';
import Post from '../../models/Posts';

const router = express.Router();

// @route Post api/posts
// @des Create a post
// @ccess Private

router.post('/', [
    auth, 
    [
        check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
      return res.status(400).json({ errors: errors.array()});

  }

  try {

    const user = await User.findById(req.user.id).select('-password');
  const newPost = new Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
  });
     const post = await newPost.save();
     res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error'); 
  }
  
});

// @route Get api/posts
// @des Get all posts
// @ccess Private

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1});
    
     res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error'); 
  }
  
});

// @route Get api/posts/:post_id
// @des Get one post
// @ccess Private

router.get('/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if(!post){
        return res.status(404).json({ msg: 'post not found'});
    }
     res.json(post);
  } catch (err) {
    if(err.kind === 'ObjectId'){
        return res.status(404).json({ msg: 'post not found'});
    }
    console.error(err.message);
    res.status(500).send('Server Error'); 
  }
  
});

// @route delte api/posts/:post_id
// @des delte one post
// @ccess Private

router.delete('/:post_id', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.post_id);
      //@ check on user
      if(post.user.toString() !== req.user.id){
         return res.status(401).json({ msg: 'user not authorized'});
      }
      if(!post){
          return res.status(404).json({ msg: 'post not found'});
      }
      await post.remove();
       res.json({msg: 'post removed'});
    } catch (err) {
      if(err.kind === 'ObjectId'){
          return res.status(404).json({ msg: 'post not found'});
      }
      console.error(err.message);
      res.status(500).send('Server Error'); 
    }
  });

  // @route like a post api/posts/:post_id
// @des like a post one post
// @ccess Private

router.put('/like/:post_id', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.post_id);
      //@ check on user who likes the current post
      if(post.likes.filter(like => like.user.toString()=== req.user.id).length > 0){
          return res.status(400).json({ msg: 'Post already liked'});
      }
      post.likes.unshift( { user: req.user.id});
      await post.save();
      res.json(post.likes);
      
    } catch (err) {
      if(err.kind === 'ObjectId'){
          return res.status(404).json({ msg: 'post not found'});
      }
      console.error(err.message);
      res.status(500).send('Server Error'); 
    }
  });

  // @route unlike a post api/posts/:post_id
// @des like a post one post
// @ccess Private

router.put('/unlike/:post_id', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.post_id);
      //@ check on user who likes the current post
      if(post.likes.filter(like => like.user.toString()=== req.user.id).length === 0){
          return res.status(400).json({ msg: 'Post has not yet been liked'});
      }
      // Get remove index
     const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

     post.likes.splice(removeIndex, 1);
      await post.save();
      res.json(post.likes);
      
    } catch (err) {
      if(err.kind === 'ObjectId'){
          return res.status(404).json({ msg: 'post not found'});
      }
      console.error(err.message);
      res.status(500).send('Server Error'); 
    }
  });


export default router;