const c = require('config');
const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const {check, validationResult} = require('express-validator')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../../../database/models/User') ;
const auth = require('../../middleware/auth');

// @route   GET api/users/myID
// @desc    Returns the objectID of the currently logged in user
// @access  Private
router.get('/myID', auth, async(req, res) => {
    try {
        // Return the json object for the user's ID in the response with the format {user: { id: user.id }}
        return res.json(req.user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post('/', [
        check('name', 'Name is required')
            .not()
            .isEmpty(),
        check('email', 'Please include a valid email')
            .isEmail(),
        check('password', 'Please enter a password with 6 or more characters')
            .isLength({min: 6})
    ], 
    async (req, res) => {
        // validate name, email, and password 
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        
        // deconstruct body of post into the corresponding name, email and password fields
        const {name, email, password} = req.body;

        try {
            // Search the database for a user with the email passed into the request body, store the resulting query into the user variable
            let user = await User.findOne({ email });

            // If user is not null, then there is already a user in the database with the same email. Since emails must be unique then we cannot make a new user with the same email.
            if (user) {
                return res.status(400).json({errors: [{msg: 'User already exists'}]});
            }

            // Get the avatar of the user's email using gravatar library
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            })

            // Make a new User entry with the name, email, avatar, and password from the request body (don't save yet, since we still need to hash the password)
            user = new User({
                name,
                email,
                avatar,
                password
            });

            // initialize salt we'll be using to hash the password with
            const salt = await bcrypt.genSalt(10);

            // hash the password using the generated salt, and set the password of the user entry to this hashed password
            user.password = await bcrypt.hash(password, salt);

            await user.save(); // save the user entry in the database

            // make a new payload json variable which we will be sending back in the response, consisting of a user key with 1 attriute: the user id (_id from mongodb)
            const payload = {
                user: {
                    id: user.id
                }
            }

            //Sign the payload (containing the user's id in the mongodb database for later access), return the token in the response
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

// @route   DELETE api/users/
// @desc    Delete profile and corresponding user
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        //Remove profile
        await Profile.findOneAndRemove({user: req.user.id});

        //Remove user
        await User.findOneAndRemove({_id: req.user.id});
        res.json({msg: 'User deleted'});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;