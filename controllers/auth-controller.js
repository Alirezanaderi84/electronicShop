const bcrypt = require('bcryptjs')
const sendEmail = require('../util/emailSender')
const crypto = require('crypto')
const User = require('../models/user')
const { validationResult } = require('express-validator')
exports.getLogin = (req, res) => {

    // const isLoggedIn = parseCookies(req)
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'ورود',
        isAuthenticateed: false,
        errorMessage: req.flash('error'),
        successMessage: req.flash('success'),
validationError:[]

    })
}
exports.postLogin = (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.render('auth/login', {
            path: '/login',
            pageTitle: 'ورود',
            isAuthenticateed: false,
            errorMessage: errors.array()[0].msg,
            successMessage: req.flash('success'),
            validationError:errors.array()
        })
    }
    User.findOne({ email: email }).then(user => {
        if (!user) {
            req.flash('error', 'ایمیل اشتباه است')
            return res.redirect('/login')
        }
        bcrypt.compare(password, user.password).then(ismatched => {
            if (ismatched) {
                req.session.isLoggedIn = true
                req.session.user = user
                return req.session.save(err => {
                    console.log(err)
                    res.redirect('/')
                })
            }
            req.flash('error', '  رمز عبور اشتباه است')
            res.redirect('/login')

        })
    }).catch(err=>{ 
              const error=new Error(err)
              error.httpStatusCode=500
              return next(error)
            })

}
exports.postLogout = (req, res) => {
    req.session.destroy((err) => {
        // console.log(err)
        res.redirect('/')
    })
}
exports.getSignUp = (req, res) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'ثبت نام',
        isAuthenticateed: false,
        errorMessage: req.flash('error'),
        oldValue: { email: '', password: '', confirmpass: '' },
        validationError: []


    })
}
exports.postSignUp = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmpass;
    const erorrs = validationResult(req)
    if (!erorrs.isEmpty()) {
        console.log(erorrs.array())
        // req.flash('error','ایمیل معتبر نمی باشد')
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'ثبت نام',
            isAuthenticateed: false,
            errorMessage: erorrs.array()[0].msg,
            oldValue: { email: email, password: password, confirmpass: confirmPassword },
            validationError: erorrs.array()

        })
    }
    User.findOne({
        email: email
    }).then(userDoc => {
        if (userDoc) {
            req.flash('error', 'با این ایمیل قبلا ثبت نام شده است')
            res.redirect('/signup');
        }
        return bcrypt.hash(password, 12).then(hashedPassword => {

            const user = new User({
                email: email,
                password: hashedPassword,
                cart: {
                    item: []
                }
            });
            return user.save();

        })
    })
        .then(() => {
            req.flash('success', 'ثبت نام با موفقیت انجام شد. لطفا وارد شوید')
            sendEmail({ subject: 'ثبت نام موفق', text: 'کاربر گرامی:ثبت نام شما با موفقیت همراه بود .خوش آمدید', email: email })
            res.redirect('/login')

        }).catch(err=>{ 
              const error=new Error(err)
              error.httpStatusCode=500
              return next(error)
            })
      
}
exports.getResetPass = (req, res) => {
    res.render('auth/resetpass', {
        path: '/resetpass',
        pageTitle: 'بازیابی رمز عبور',
        errorMessage: req.flash('error')
    })
}
// exports.postResetPass = (req, res) => {
//     crypto.randomBytes(32, (err, buf) => {
//         if (err) {
//             console.log(err)
//             return res.redirect('/resetpass')
//         }
//         const Token = buf.toString('hex')
//         User.findOne({ email: req.body.email }).then(user => {
//             if (!user) {
//                 req.flash('errror', 'چنین ایمیلی در سایت ثبت نام نشده')
//                return res.redirect('/resetpass')
//             }
//             user.resetToken = Token
//             user.expierdDateResetToken = Date.now() + 3600000
//             return user.save()
//         })
//             .then(
//              () => {
//                   sendEmail({
//                         subject: 'بازیابی رمز عبور  ', html: `<p>درخواست بازیابی رمز عبوز</p>
//                     <p>برای بازیابی رمز عبور <a href="http://localhost:3001/resetpass/${Token}" >این لینک را</a> کلیک کنید </p>
//                     `, email: req.body.email
//                     })
//                   return res.redirect('/')

//                 }
//             )
//     })
// }
exports.postResetPass = (req, res) => {
    crypto.randomBytes(32, (err, buf) => {
        if (err) {
            console.log(err)
            return res.redirect('/resetpass')
        }

        const token = buf.toString('hex')

        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'چنین ایمیلی در سایت ثبت نام نشده')
                    return null
                }

                user.resetToken = token
                user.expierdDateResetToken = Date.now() + 3600000
                return user.save()
            })
            .then(user => {
                if (!user) {
                    return res.redirect('/resetpass')
                }

                sendEmail({
                    subject: 'بازیابی رمز عبور',
                    html: `
                      <p>درخواست بازیابی رمز عبور</p>
                      <p>
                        برای بازیابی رمز عبور
                        <a href="http://localhost:3001/resetpass/${token}">
                          این لینک را
                        </a>
                        کلیک کنید
                      </p>`
                    ,
                    email: req.body.email
                })

                return res.redirect('/')
            })
            .catch(err => {
                res.redirect('/resetpass')
            })
    })
}
exports.getResetPassword = (req, res) => {

    const token = req.params.token;
    User.findOne({
        resetToken: token,
    }).then(user => {

        let message = req.flash('error');
        if (message.length > 0) {
            message = message[0];
        } else {
            message = null;
        }
        res.render('auth/new-pass', {
            path: '/new-password',
            pageTitle: 'رمز عبور جدید',
            errorMessage: message,
            userId: user._id.toString(),
            passwordToken: token
        })

    }).catch(err=>{ 
              const error=new Error(err)
              error.httpStatusCode=500
              return next(error)
            })





}
exports.postNewPassword = (req, res) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({
        resetToken: passwordToken,
        expierdDateResetToken: {
            $gt: Date.now()
        },
        _id: userId

    }).then(user => {
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
    }).then(hashedPassword => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.expiredDateresetToken = undefined;
        return resetUser.save();
    }).then(result => {
        console.log(result);
        res.redirect('/login');
    }).catch(err=>{ 
              const error=new Error(err)
              error.httpStatusCode=500
              return next(error)
            })




}



