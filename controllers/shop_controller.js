const product = require('../models/product')
const Product = require('../models/product')
const Order = require('../models/orders')
const parseCookies = require('../util/cookieParser')
exports.getIndex = (req, res) => {

    Product.find().then(products => {
        res.render('shop/index', {
            path: "/",
            pageTitle: "فروشگاه ما",
            prods: products,
            isAuthenticateed:req.session.isLoggedIn,
           
        })
    }).catch(err=>{ 
              const error=new Error(err)
              error.httpStatusCode=500
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
            isAuthenticateed:req.session.isLoggedIn
        })
    }).catch(err=>{ 
              const error=new Error(err)
              error.httpStatusCode=500
              return next(error)
            })

}
exports.getProducts = (req, res) => {
   
    product.find().then(products => {
        res.render('shop/products-list', {
            prods: products,
            pageTitle: "محصولات",
            path: '/products',
            isAuthenticateed: req.session.isLoggedIn
        })
    }).catch(err=>{ 
              const error=new Error(err)
              error.httpStatusCode=500
              return next(error)
            })
}
exports.postCart = (req, res) => {
    const prodId = req.body.productId
    product.findById(prodId).then(product => {
        req.user.addToCart(product)
        res.redirect('/cart')
    }).catch(err=>{ 
              const error=new Error(err)
              error.httpStatusCode=500
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
        }).catch(err=>{ 
              const error=new Error(err)
              error.httpStatusCode=500
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
        }).catch(err=>{ 
              const error=new Error(err)
              error.httpStatusCode=500
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
            isAuthenticateed:req.session.isLoggedIn
        })
    }).catch(err=>{ 
              const error=new Error(err)
              error.httpStatusCode=500
              return next(error)
            })
}
exports.addQuantityCart = (req, res) => {
    const prodId = req.body.productId
    product.findById(prodId).then(product => {
        req.user.addQuuantityCart(product)
        res.redirect('/cart')

    }).catch(err=>{ 
              const error=new Error(err)
              error.httpStatusCode=500
              return next(error)
            })
}
