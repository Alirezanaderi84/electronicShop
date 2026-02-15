const mongoose = require('mongoose')
const Schema = mongoose.Schema
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        minlength: 8,
    },
    password:{
    type: String,
     required: true,
    },
    resetToken:String,
    expierdDateResetToken:Date,
    cart: {
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }]

    }
})
//اضافه کردن به سبد خرید
userSchema.methods.addToCart = function (product) {
     const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString()
    })
    let newQuantity = 1
    const updatedCartItems = [...this.cart.items]
     
      if (cartProductIndex >= 0) {
         return}
    else{
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity
        })
    }
    const updatedCart = {
        items: updatedCartItems
    }
    this.cart = updatedCart
    return this.save()
}
userSchema.methods.addQuuantityCart = function (product) {
     const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString()
    })
    let newQuantity = 1
    const updatedCartItems = [...this.cart.items]
      if (cartProductIndex >= 0) {
         newQuantity = this.cart.items[cartProductIndex].quantity + 1
        updatedCartItems[cartProductIndex].quantity = newQuantity
    }
    const updatedCart = {
        items: updatedCartItems
    }
    this.cart = updatedCart
    return this.save()
}
userSchema.methods.removeFromCart = function (productId) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === productId.toString()
    })
    let newQuantityy = this.cart.items[cartProductIndex].quantity
    const updatedCartItemss = [...this.cart.items]
    if (newQuantityy > 1) {
        newQuantityy = this.cart.items[cartProductIndex].quantity - 1
        updatedCartItemss[cartProductIndex].quantity = newQuantityy
        const updatedCart = {
            items: updatedCartItemss
        }
        this.cart = updatedCart
    }

    else {
        const updatedCartItems = this.cart.items.filter(items => {
            return items.productId.toString() !== productId.toString()
        })
        const updatedCart = {
            items: updatedCartItems
        }
        this.cart = updatedCart


    }
    return this.save()

}
userSchema.methods.clearCart = function () {
    this.cart = { items: [] }
    return this.save()
}
module.exports = mongoose.model('User', userSchema)



//  const updatedCartItems = this.cart.items.filter(items => {
//         return items.productId.toString() !== productId.toString()
//     })
//     this.cart.items = updatedCartItems
//     return this.save()

  

//
  