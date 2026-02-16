const express = require('express')
const router = express.Router()
const isAuth = require('../middleware/is-auth')
const { check, body } = require('express-validator')
const adminController = require('../controllers/admin-controller')

router.get('/addProduct', isAuth, adminController.getAddProduct)
router.post('/addProduct', [
        body('title', 'تعداد کاراکتر های عنوان باید حداقل 3 باشذ').isString().isLength({ min: 3 }).trim(),
        body('price').isFloat(),
        body('description', 'تعداد کاراکتر های توضیحات حداقل 5 و حداکثر 250 باشد').isLength({ min: 5, max: 250 }).trim()
], isAuth, adminController.postAddProduct)
router.get('/products', isAuth, adminController.getProducts)
router.get('/editProducts/:productId', isAuth, adminController.getEditProduct)
router.post('/editProducts', [
        body('title', 'تعداد کاراکتر های عنوان باید حداقل 3 باشذ').isString().isLength({ min: 3 }).trim(),
        body('price').isFloat(),
        body('description', 'تعداد کاراکتر های توضیحات حداقل 5 و حداکثر 250 باشد').isLength({ min: 5, max: 250 }).trim()
], isAuth, adminController.postEditProduct)
router.post('/deleteProducts', isAuth, adminController.postDeleteProduct)
module.exports = router