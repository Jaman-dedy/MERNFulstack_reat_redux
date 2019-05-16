import mongoose from 'mongoose';
import config from 'config';

const db = config.get('mongoURI');

const connectDB = async() => {
    try {
       await mongoose.connect(db, {
           useNewUrlParser: true,
           useCreateIndex: true,
           useFindAndModify: false
       })

       console.log('mongodb Connected.....')
    } catch(err){
        console.error(err.message);
        //@ exit process with failure
        process.exit(1);

    }
}

export default connectDB;