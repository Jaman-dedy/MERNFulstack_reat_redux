import express from 'express';
import connectDb from './config/db';
import userRoute from './routes/api/user';
import authRoute from './routes/api/auth';
import postsRoute from './routes/api/posts';
import profileRoute from './routes/api/profile';
import commentRoute from './routes/api/comment';

const app = express();

// @connect to the db
connectDb();

//@ Init Middlware

app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

//@ define routes

app.use('/api/users', userRoute)
app.use('/api/auth', authRoute)
app.use('/api/posts', postsRoute)
app.use('/api/profile', profileRoute)
app.use('/api/posts', commentRoute)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server started ${PORT}`));
