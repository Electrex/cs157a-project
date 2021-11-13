const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../../database/models/User');
const {check, validationResult} = require('express-validator')
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');

// @route   GET api/auth
// @desc    TEST route
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});


// @route   POST api/auth
// @desc    Authenticate user and get token
// @access  Public
router.post(
    '/', 
    [
        check('email', 'Please include a valid email')
            .isEmail(),
        check('password', 'Password is required')
            .exists()
    ], 
    async (req, res) => {
        // validate email and password fields
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        
        // deconstruct request body and store email and password fields into corresponding variables
        const {email, password} = req.body;

        try {
            // Search for a user in the database with the passed in email from the request
            let user = await User.findOne({ email });

            // If there is no entry for a user in the database with this email, then return an error 
            if (!user) {
                return res
                    .status(400)
                    .json({errors: [{msg: 'No such user exists'}]});
            }

            // decrypt the password stored in the database and compare it to the password passed into the sign on
            const isMatch = await bcrypt.compare(password, user.password);

            // If the passwords don't match, then the person trying to login will not be authorized to access
            if (!isMatch) {
                return res
                    .status(401)
                    .json({errors: [{msg: 'Unauthorized'}]});
            }

            // Create a payload object contianing a single object with an id attribute corresponding to the _id for the user in the mongodb database
            const payload = {
                user: {
                    id: user.id
                }
            }

            // Sign the payload object and send it back as the response for this post request
            jwt.sign(
                payload, 
                config.get('jwtSecret'),
                {expiresIn: 360000},
                (err, token) => {
                    if(err) throw err;
                    res.json({token});
                }
            );
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server error');
        }

    }
);

module.exports = router;