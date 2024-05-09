const { Router } = require('express')
const ProductManager = require('../dao/fsManagers/ProductManager')
// const productModel = require('../dao/models/product.model')
const { userIsLoggedIn, userIsNotLoggedIn, userIsAdmin }= require('../middlewares/auth.middleware')

const router = Router()

//endpoints de Products y Carts

router.get('/products', userIsLoggedIn, async (req, res) => {
    try {
        const productManager = req.app.get('productManager')
        
        const filteredProducts = await productManager.getProducts(req.query)
        
        let user = req.session.user 

        const data = {
            title: 'All Products',
            scripts: ['allProducts.js'],
            styles: ['home.css', 'allProducts.css'],
            useWS: false,
            user,
            filteredProducts
        }

        res.render('allProducts', data)        
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

router.get('/products/detail/:pid', userIsLoggedIn, async (req, res) => {
    try {
        const productManager = req.app.get('productManager')
        const cartManager = req.app.get('cartManager')

        const prodId = req.params.pid
        const product = await productManager.getProductById(prodId)
        
        const carts = await cartManager.getCarts()   

        let cid = carts[0]._id
        let data = {
            title: 'Product detail',
            scripts: ['productDetail.js'],
            styles: ['home.css', 'productDetail.css'],
            useWS: false,
            useSweetAlert: true,
            product,
            cid
        }
        
        res.render('productDetail', data)        
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

router.get('/products/addcart/:pid', userIsLoggedIn, async (req, res) => {
    try {
        const productManager = req.app.get('productManager')
        const cartManager = req.app.get('cartManager')

        const prodId = req.params.pid
        const product = await productManager.getProductById(prodId)
        
        //agrego una unidad del producto al primer carrito que siempre existe
        const carts = await cartManager.getCarts()   
        // console.log(prodId)
        await cartManager.addProductToCart(carts[0]._id.toString(), prodId, 1);   

        // res.redirect(`/products/detail/${prodId}`)
        // HTTP 200 OK => producto modificado exitosamente
        // res.status(200).json({message: 'Producto agregado con éxito'})
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

router.get('/carts/:cid', userIsLoggedIn, async (req, res) => {
    try {
        const cartManager = req.app.get('cartManager')
        const cartId = req.params.cid
        const cart = await cartManager.getCartById(cartId)               

        // console.log(JSON.stringify(cart.products, null, '\t'))

        let data = {
            title: 'Cart detail',
            // scripts: ['cartDetail.js'],
            styles: ['home.css', 'cartDetail.css'],
            useWS: false,
            cart
        }
        
        res.render('cartDetail', data)        
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

router.get('/realtimeproducts', userIsLoggedIn, userIsAdmin, async (req, res) => {
    const productManager = req.app.get('productManager')

    let allProducts = await productManager.getProducts(req.query)

    const data = {        
        title: 'Real Time Products', 
        scripts: ['allProducts.js'],
        styles: ['home.css', 'allProducts.css'],
        useWS: false,
        allProducts
    }

    res.render('realtimeproducts', data)
})

router.get('/products/create', userIsLoggedIn, userIsAdmin, async (req, res) => {
    
    const data = {
        title: 'Create Product',
        // scripts: ['createProduct.js'],
        styles: ['home.css'],
        useWS: false
    }

    res.render('createProduct', data)
})

//endpoints de Messages

router.get('/chat', (_, res) => {
    const data = {
        title: 'Aplicación de chat',
        useWS: true,
        useSweetAlert: true,        
        scripts: ['message.js'],
        styles: ['home.css']
    }

    res.render('message', data)
})

//endpoints de Login/Register

router.get('/', (req, res) => {
    const isLoggedIn = ![null, undefined].includes(req.session.user)

    res.render('index', {
        title: 'Inicio',
        isLoggedIn,
        isNotLoggedIn: !isLoggedIn,
    })
})


router.get('/login', userIsNotLoggedIn,  (_, res) => {
    // sólo se puede acceder si NO está logueado
    res.render('login', {
        title: 'Login'
    })
})

router.get('/reset_password', userIsNotLoggedIn,  (_, res) => {
    // sólo se puede acceder si NO está logueado
    res.render('reset_password', {
        title: 'Reset Password'
    })
})

router.get('/register', userIsNotLoggedIn, (_, res) => {
    //sólo se puede acceder si NO está logueado
    res.render('register', {
        title: 'Register'
    })
})

router.get('/profile', userIsLoggedIn,  (req, res) => {
    //sólo se puede acceder SI está logueado
    let user = req.session.user 
    res.render('profile', {
        title: 'Mi perfil',
        user: {
            firstName: user.firstName,
            lastName: user.lastName,
            age: user.age,
            email: user.email
        }
    })
})

module.exports = router;