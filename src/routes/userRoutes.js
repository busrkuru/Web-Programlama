const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const fileUpload = require('../utils/fileUpload');

const router = express.Router();
console.log('[userRoutes.js] Router instance created and routes are being defined.');

// Herkesin erişebileceği rotalar
router.post('/signup', (req, res, next) => { console.log(`[userRoutes.js] Route hit: ${req.method} ${req.originalUrl}`); authController.signup(req, res, next); });
router.post('/login', (req, res, next) => { console.log(`[userRoutes.js] Route hit: ${req.method} ${req.originalUrl}`); authController.login(req, res, next); });
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Buradan sonraki tüm rotalara erişim için koruma
router.use(authController.protect);

// Giriş yapan kullanıcıların erişebileceği rotalar
router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', fileUpload.uploadUserPhoto, fileUpload.resizeUserPhoto, userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

// Kullanıcı yönetimi rotaları
router
  .route('/')
  .get(
    authController.restrictToResource('users', 'read'),
    userController.getAllUsers
  )
  .post(
    authController.restrictToResource('users', 'create'),
    userController.createUser
  );

router
  .route('/:id')
  .get(
    authController.restrictToResource('users', 'read'),
    userController.getUser
  )
  .patch(
    authController.restrictToResource('users', 'update'),
    userController.updateUser
  )
  .delete(
    authController.restrictToResource('users', 'delete'),
    userController.deleteUser
  );

module.exports = router;
