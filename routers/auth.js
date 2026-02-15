const express = require('express')
const router = express.Router()
const { check,body } = require('express-validator')
const authController = require('../controllers/auth-controller')
router.get('/login', authController.getLogin)
router.post('/login',[check('email').isEmail().withMessage("لطفا ایمیل معتبر وارد کنید").normalizeEmail(),
    check('password','لطفا رمز عبور معتبر وارد کنید').isLength({min:5}).isAlphanumeric().trim()
] ,authController.postLogin)
router.post('/logout', authController.postLogout)
router.get('/signup', authController.getSignUp)
router.post('/signup',
    [check('email').isEmail()
        .withMessage('ایمیل نامعتبر است!').custom((value, { req }) => {
            if (value === 'test2@gmail.com'
            ) {
                throw new Error('شما حق ورور به سایت را ندارید')
            }
            return true
        }).trim()
        ,body('password','رمز عبور باید ترکیبی از اعداد و حروف و حداقل 6 کاراکتر باشد').isLength({min:5}).isAlphanumeric().trim()
        ,body('confirmpass').custom((value,{req})=>{
            if(value!==req.body.password){
                throw new Error('رمز عبور با تکرار رمز عبور همخوانی ندارد')
            }
            return true 

        }).trim()
    ]
    ,
 authController.postSignUp)
router.get('/resetpass', authController.getResetPass)
router.post('/resetpass', authController.postResetPass)
router.get('/resetpass/:token', authController.getResetPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router