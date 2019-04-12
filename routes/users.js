var express = require('express');
var router = express.Router();
var user_controller = require('../controllers/userController');
var auth = require('../auth/secure');

/* GET users listing. */
router.get('/', auth, user_controller.user_list);

//get request for creating a user
router.get('/signup', user_controller.user_create_get);

//post request for creating a user
router.post('/signup', user_controller.user_create_post);

//get request for user login
router.get('/login', user_controller.user_login_get);

//post request for user login
router.post('/login', user_controller.user_login_post);

//get request for user logout
router.get('/logout', auth, user_controller.user_logout_get);

//post request user logout
router.post('/logout', auth, user_controller.user_logout_post);

//get request for updating a user
router.get('/:id/update', auth, user_controller.user_update_get);

//post request for updating a user
router.post('/:id/update', auth, user_controller.user_update_post);

//get request for deleting a user
router.get('/:id/delete', auth, user_controller.user_delete_get);

//post request for deleting a user
router.post('/:id/delete', auth, user_controller.user_delete_post);

//route to display a particular user's details
router.get('/:id', user_controller.user_details);

module.exports = router;
