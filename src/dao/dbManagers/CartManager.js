const cartModel = require('../models/cart.model')
const productModel = require('../models/product.model')

class CartManager {

    //variables internas
    static #lastID_Cart = 0

    constructor() { }

    inicializar = async () => {
        // No hacer nada
        // Podríamos chequear que la conexión existe y está funcionando
        if (cartModel.db.readyState !== 1) {
            throw new Error('Error al conectarse a la BD de mongodb!')
        }
        else {
            const carts = await this.getCarts()
            CartManager.#lastID_Cart = this.#getHigherID(carts)
        }
    }

    //métodos internos

    #getHigherID = (carts) => {
        let higherID = 0
        carts.forEach(item => {
            if (item.id > higherID)
                higherID = item.id
        });
        return higherID
    }

    //retornar un ID único para cada carrito nuevo
    #getNuevoID = () => {
        CartManager.#lastID_Cart += 1
        return CartManager.#lastID_Cart;
    }

    //métodos públicos
    getCarts = async () => {
        try {
            const carts = await cartModel.find()
            return carts.map(d => d.toObject({ virtuals: true }))
        }
        catch (err) {
            return []
        }
    }

    getCartById = async (cartId) => {
        const cart = await cartModel.findOne({ _id: cartId }).populate('products._id')
        if (cart) {
            return cart
        }
        else {
            console.error(`El carrito con código "${cartId}" no existe.`)
            return
        }
    }

    addCart = async (products) => {
        let nuevoCarrito = await cartModel.create({
            id: this.#getNuevoID(),
            products
        })
        // console.log(nuevoCarrito)
    }

    //agregar un producto al array de productos de un carrito determinado
    addProductToCart = async (cartId, prodId, quantity) => {
        //obtengo el carrito
        const cart = await this.getCartById(cartId)
        //obtengo los productos del carrito        
        const productsFromCart = cart.products
        const productIndex = productsFromCart.findIndex(item => item._id._id.toString() === prodId)
        if (productIndex != -1) {
            //existe el producto en el carrito, actualizo sólo su cantidad
            productsFromCart[productIndex].quantity += quantity
        }
        else { //no existe, debo crearlo
            let newProduct = {
                _id: prodId,
                quantity: quantity
            }
            productsFromCart.push(newProduct);
        }
        await cartModel.updateOne({ _id: cartId }, cart)
        return true
    }

    updateCartProducts = async (cartId, products) => {
        //obtengo el carrito

        const cart = await this.getCartById(cartId)
        cart.products = products

        await cartModel.updateOne({ _id: cartId }, cart)
    }

    deleteCart = async (cartId) => {
        await cartModel.deleteOne({ _id: cartId })
    }

    deleteAllProductsFromCart = async (cartId) => {
        //obtengo el carrito
        const cart = await this.getCartById(cartId)
        cart.products = []
        await cartModel.updateOne({ _id: cartId }, cart)
    }

    deleteProductFromCart = async (cartId, prodId) => {
        //obtengo el carrito
        const cart = await this.getCartById(cartId)
        //obtengo los productos del carrito        
        const productsFromCart = cart.products
        const productIndex = productsFromCart.findIndex(item => item._id._id.toString() === prodId)
        if (productIndex != -1) {
            //existe el producto en el carrito, puedo eliminarlo
            productsFromCart.splice(productIndex, 1)
            await cartModel.updateOne({ _id: cartId }, cart)
            return true
        }
        else {
            //no existe el producto en el carito, imposible de eliminar
            return false
        }
    }
}

module.exports = CartManager
