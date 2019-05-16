import jwt from 'jsonwebtoken';
import config from 'config';

const middlewareFunction = (req, res, next) => {
// Get the token from the header

const token = req.header('x-auth-token');

//@check if not token
if(!token){
    return res.status(401).json({ msg: 'No token, authorization denied'})
}

//@ verify token
try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    req.user = decoded.user;
    next();
}catch(err){
    res.status(401).json({ msg: 'token is not valid'});
}
}

export default middlewareFunction;