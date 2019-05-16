import express from 'express';
import { check, validationResult } from 'express-validator/check';
import auth from '../../middleware/auth';
import User from '../../models/User';
import Profile from '../../models/Profile';
import Post from '../../models/Posts';

const router = express.Router();

// @route Post api/posts/comment/:id
// @des Create a comment
// @ccess Private

router.post(
  '/comment/:id',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };
      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route delete a comment api/posts/comment/post_id/comment_id
// @desc delete a comment
// @ccess Private

router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    const comment = post.comments.find(
      comment => (comment.id = req.params.comment_id)
    );

    if (!comment) {
      res.status(404).json({ msg: 'comment not found' });
    }
    //@ check on user who comment the post
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'user not authorized' });
    }
    // Get remove index
    const removeIndex = post.comments
      .map(comment => comment.user.toString())
      .indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json(post.comments);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'post not found' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
