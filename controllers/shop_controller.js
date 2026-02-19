const product = require('../models/product')
const Product = require('../models/product')
const Order = require('../models/orders')
const parseCookies = require('../util/cookieParser')
const path = require('path')
const fs = require('fs')
const pdfDocument = require('pdfkit')
const ITEMS_PER_PAGE = 8

exports.getIndex = (req, res) => {
    const page = +req.query.page || 1
    let totalItems
    product.countDocuments().then(productNumber => {
        totalItems = productNumber
     return Product.find().skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)

    })
        .then(products => {
            res.render('shop/index', {
                path: "/",
                pageTitle: "فروشگاه ما",
                prods: products,
                isAuthenticateed: req.session.isLoggedIn,
                currentPage:page,
                totalProducts:totalItems,
                hasNextPage:ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage:page>1,
                nextPage:page+1,
                PreviousPage:page-1,
                lastPage:Math.ceil(totalItems/ITEMS_PER_PAGE)

            })
        }).catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)

        })


}
exports.getProductDeatail = (req, res) => {

    const prodId = req.params.productId
    Product.findById(prodId).then(product => {
        res.render('shop/product-deatail', {
            product: product,
            pageTitle: product.title,
            path: '/products',
            isAuthenticateed: req.session.isLoggedIn
        })
    }).catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })

}
exports.getProducts = (req, res) => {

  const page = +req.query.page || 1
    let totalItems
    product.countDocuments().then(productNumber => {
        totalItems = productNumber
     return Product.find().skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)

    })
        .then(products => {
            res.render('shop/products-list', {
                path: "/",
                pageTitle: "فروشگاه ما",
                prods: products,
                isAuthenticateed: req.session.isLoggedIn,
                currentPage:page,
                totalProducts:totalItems,
                hasNextPage:ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage:page>1,
                nextPage:page+1,
                PreviousPage:page-1,
                lastPage:Math.ceil(totalItems/ITEMS_PER_PAGE)

            })
    }).catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
}
exports.postCart = (req, res) => {
    const prodId = req.body.productId
    product.findById(prodId).then(product => {
        req.user.addToCart(product)
        res.redirect('/cart')
    }).catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
}
exports.getCart = async (req, res) => {

    const userProducts = await req.user.populate('cart.items.productId')
    res.render('shop/cart', {
        pageTitle: 'سبد خرید',
        path: '/cart',
        products: userProducts.cart.items,
        isAuthenticateed: req.session.isLoggedIn
    })
}
exports.postCartDeleteProducts = (req, res) => {
    const prodId = req.body.productId
    req.user.removeFromCart(prodId)
        .then(() => {
            res.redirect('/cart')
        }).catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })

}
exports.postOrder = (req, res) => {
    req.user.populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items.map(i => {
                return {
                    quantity: i.quantity,
                    product: { ...i.productId._doc }
                }
            });
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products: products
            })
            return order.save();

        }).then(() => {
            return req.user.clearCart()
        }).then(() => {
            res.redirect('/orders')
        }).catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })


}
exports.getOrder = (req, res) => {

    Order.find({
        'user.userId': req.user._id
    }).then(orders => {
        res.render('shop/orders', {
            pageTitle: ' سفارشات',
            path: '/orders',
            orders: orders,
            isAuthenticateed: req.session.isLoggedIn
        })
    }).catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
}
exports.addQuantityCart = (req, res) => {
    const prodId = req.body.productId
    product.findById(prodId).then(product => {
        req.user.addQuuantityCart(product)
        res.redirect('/cart')

    }).catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
}
exports.getInvoices = (req, res, next) => {
    const orderId = req.params.orderId
    Order.findById(orderId).then(order => {
        if (!order) {
            return next(new Error('چنین سفارشی ای وجود ندارد'))
        }
        if (order.user.userId.toString() !== req.user._id.toString()) {
            return next(new Error('شما به این سفارش دسترسی ندارید'))
        }
        const invoicesName = 'invoices-' + orderId + '.pdf'
        const invoicesPath = path.join('files', 'invoices', invoicesName)
        // fs.readFile(invoicesPath,(err,data)=>{
        //     if(err){
        //         return next(err)
        //     }
        //     res.setHeader('Content-Type','application/pdf')
        //     // res.setHeader('Content-Disposition','inline; filename="'+invoicesName+'"')
        //     res.setHeader('Content-Disposition','attachment; filename="'+invoicesName+'"')
        //     res.send(data)

        // })
        // const file=fs.createReadStream(invoicesPath)
        // res.setHeader('Content-Type','application/pdf')
        //  res.setHeader('Content-Disposition','attachment; filename="'+invoicesName+'"')
        // file.pipe(res) 
        // const pdfDoc = new pdfDocument()
        // res.setHeader('Content-Type', 'application/pdf')
        // res.setHeader('Content-Disposition', 'attachment; filename="' + invoicesName + '"')
        // pdfDoc.pipe(fs.createWriteStream(invoicesPath))
        // pdfDoc.pipe(res)
        // pdfDoc.fontSize(26).registerFont().text('فاکتور خرید', {
        //     underline: true
        // })
        // pdfDoc.text('-----------------------')
        // let totalPrice = 0
        // order.products.forEach(p => {
        //     totalPrice += p.quantity * p.product.price
        //     pdfDoc.fontSize(14).text(p.product.title + ' - ' + p.quantity + ' x ' + p.product.price)
        // }
        // )


        // pdfDoc.end()


        const pdfDoc = new pdfDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="' + invoicesName + '"'
        );

        // اگر میخوای هم فایل ذخیره شه هم دانلود بشه
        pdfDoc.pipe(fs.createWriteStream(invoicesPath));
        pdfDoc.pipe(res);

        // ===== Title =====
        pdfDoc
            .fontSize(24)
            .text('Invoice', {
                align: 'center',
                underline: true
            });

        pdfDoc.moveDown();
        pdfDoc.text('----------------------------------------');
        pdfDoc.moveDown();

        let totalPrice = 0;

        // ===== Products =====
        order.products.forEach(p => {

            const itemTotal = p.quantity * p.product.price;
            totalPrice += itemTotal;

            pdfDoc
                .fontSize(14)
                .text(
                    `${p.product.title} - ${p.quantity} x $${p.product.price} = $${itemTotal}`
                );

            pdfDoc.moveDown(0.5);
        });

        pdfDoc.moveDown();
        pdfDoc.text('----------------------------------------');
        pdfDoc.moveDown();

        // ===== Total =====
        pdfDoc
            .fontSize(18)
            .text(`Total: $${totalPrice}`, {
                align: 'right'
            });

        pdfDoc.end();

    }).catch(err => { return next(err) })


}