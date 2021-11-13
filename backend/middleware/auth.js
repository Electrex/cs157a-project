const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
    //Get token from header
    const token = req.header('x-auth-token');

    // if there is no token present, return error in json response
    if(!token) {
        return res.status(401).json({msg: 'No token, authorization denied'});
    }

    try {
        // Decode the token with the secret
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        // if the token is verified, add a new user object to the request, and assign it the decoded user from the token
        req.user = decoded.user;
        // since this is middleware, continue on to the next operation
        next();
    } catch (error) {
        res.status(401).json({msg: 'Token is not valid'});
    }
}