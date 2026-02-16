
const product = require('../models/product')
const Product = require('../models/product')
const { validationResult } = require('express-validator')
const mongoose = require('mongoose')
const filehelper = require('../util/filehelper')

exports.getProducts = (req, res) => {
    Product.find({ userId: req.user._id }).then(
        product => {
            res.render('admin/products', {
                prods: product,
                path: '/admin/product',
                pageTitle: 'محصولات ادمین',
                isAuthenticateed: req.session.isLoggedIn
            })
        }
    ).catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    }
    )

}
exports.getAddProduct = (req, res) => {
    res.render('admin/add-product', {
        path: '/admin/add-product',
        pageTitle: "افزودن محصول",
        editing: false,
        isAuthenticateed: req.session.isLoggedIn,
        hasErorr: false,
        validationError: []
    })

}
exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    if (!image) {
        return res.render('admin/add-product', {
            path: '/admin/add-product',
            pageTitle: "افزودن محصول",
            editing: false,
            isAuthenticateed: req.session.isLoggedIn,
            product: {
                title: title, price: price, imageUrl: image, description: description
            },
            errorMessage: 'لطفا عکس وارد کنید فرمت های قابل قبول:png,jpg,jepg',
            hasErorr: true,
            validationError: []

        })
    }


    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.render('admin/add-product', {
            path: '/admin/add-product',
            pageTitle: "افزودن محصول",
            editing: false,
            isAuthenticateed: req.session.isLoggedIn,
            product: {
                title: title, price: price, imageUrl: image, description: description
            },
            errorMessage: errors.array()[0].msg,
            hasErorr: true,
            validationError: errors.array()

        })
    }

    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: image.path,
        userId: req.user

    });
    product.save()
        .then(result => {
            console.log('Created Product');
            res.redirect('/');
        }).catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)

        }




        );
}
exports.getEditProduct = (req, res) => {
    const editMode = req.query.edit
    if (!editMode) {
        res.redirect('/')
    }
    const prodId = req.params.productId
    product.findById(prodId).then(product => {
        if (!product) {
            res.redirect('/')
        }
        res.render('admin/add-product', {
            path: '/admin/editProducts',
            pageTitle: "ویرایش محصول",
            editing: editMode,
            product: product,
            isAuthenticateed: req.session.isLoggedIn,
            hasErorr: false,
            validationError: []


        })
    }
    ).catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)

    }
    )
}
exports.postEditProduct = (req, res) => {

    const prodId = req.body.productId
    const updatedTitle = req.body.title
    const updatedPrice = req.body.price
    const image = req.file;
    const updatedDescription = req.body.description
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.render('admin/add-product', {
            path: '/admin/add-product',
            pageTitle: "افزودن محصول",
            editing: true,
            isAuthenticateed: req.session.isLoggedIn,
            product: {
                title: updatedTitle, price: updatedPrice, imageUrl: image, description: updatedDescription, _id: prodId
            },
            errorMessage: errors.array()[0].msg,
            hasErorr: true,
            validationError: errors.array()

        })
    }

    product.findById(prodId).then(product => {
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/')
        }
        product.title = updatedTitle
        product.price = updatedPrice
        if (image) {
            filehelper.deleteFile(product.imageUrl)
            product.imageUrl = image.path


        }
        product.description = updatedDescription
        return product.save().then(result => {
            console.log("updated succesfully")
            res.redirect('/')
        })
    }).catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    }

    )
}
exports.postDeleteProduct = (req, res) => {
    const prodId = req.body.productId
    product.findById(prodId).then(product => {
        if (!product) {
            return next(new Error('چنین محصولی ای وجود ندارد'))
        }
        filehelper.deleteFile(product.imageUrl)
        return product.deleteOne({ _id: prodId, userId: req.user._id })})
    .then(result => {
        console.log("removed succesfully")
        res.redirect('/admin/products')
    }).catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    }

    )
}
