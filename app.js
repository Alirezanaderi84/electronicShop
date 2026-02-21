const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const multer = require('multer')
const MongoDBstore = require('connect-mongo').default
const flash = require('connect-flash')
require('dotenv').config()
let host=process.env.HOST
let port=process.env.PORT
let databaseName=process.env.MONGONAME
const MongoDBuri = `mongodb://${host}/${databaseName}`
const User = require('./models/user')
const app = express()
app.set("view engine", "ejs")
app.set("views", "views")

const adminRouter = require('./routers/admin')
const shopRouter = require('./routers/shop')
const authRouter = require('./routers/auth')
const errorController = require('./controllers/error500')

const fileStorage = multer.diskStorage(
  {
    destination: (req, file, cb) => {
      cb(null, 'images')
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname)
    }
  }
)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg') {
    cb(null, true)
  } else {
    cb(null, false)
  }

}
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))
app.use(session({
  secret: 'my secret session is this ',
  resave: false,
  saveUninitialized: false,
  store: MongoDBstore.create({
    mongoUrl: MongoDBuri,

  })
}))

app.use(express.static(path.join(__dirname, "public")))
app.use('/images',express.static(path.join(__dirname, "images")))
app.use((req, res, next) => {
  if (!req.session.user) {
    return next()
  }
  User.findById(req.session.user._id).then(user => {
    if (!user) {
      return next()
    }
    req.user = user,
      next()
  }).catch(err => {
    throw new Error(err)
  })

})
app.use(flash())
app.use('/admin', adminRouter)
app.use(shopRouter)
app.use(authRouter)
app.get('/500', errorController.error500)
app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode)
  res.status(500).render('500', {
    pageTitle: 'Error',
    path: '/500',
    isAuthenticateed: req.session.isLoggedIn
  })
})




mongoose.connect(MongoDBuri).then(result => {


  app.listen(port, () => {
    console.log(`runinig on port ${port}`)
  })
}
).catch(err => console.log(err))






