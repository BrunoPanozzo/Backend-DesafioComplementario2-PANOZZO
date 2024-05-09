const { Router } = require('express')
const userModel = require('../dao/models/user.model')
const { hashPassword, isValidPassword } = require('../utils/hashing')
const passport = require('passport')
const passportMiddleware = require('../middlewares/passport.middleware')

const router = Router()

router.post('/login', passportMiddleware('login'), /*passport.authenticate('login', { failureRedirect: '/api/sessions/faillogin' },*/ (req, res) => {
    // console.log(req.body)
    if (!req.user)
        return res.status(400).send({ status: 'error', error: 'Credenciales inválidas!' })
    req.session.user = {
        _id: req.user._id,
        age: req.user.age,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        rol: req.user.rol
    }

    // no es necesario validar el login aquí, ya lo hace passport!
    return res.redirect('/products')
})

router.get('/faillogin', (req, res) => {
    res.send({ status: 'error', message: 'Login erróneo!' })
})

router.post('/reset_password', passport.authenticate('reset_password', { failureRedirect: '/api/sessions/failreset_password' }), async (req, res) => {
    // console.log(req.user)
    res.redirect('/login')
})

router.get('/failreset_password', (req, res) => {
    res.send({ status: 'error', message: 'No se pudo resetear la password!' })
})

// agregamos el middleware de passport para el register
router.post('/register', passport.authenticate('register', { failureRedirect: '/api/sessions/failregister' }), async (req, res) => {
    // console.log('usuario: ', req.user)
    // no es necesario registrar el usuario aquí, ya lo hacemos en la estrategia!
    res.redirect('/login')
})

router.get('/failregister', (req, res) => {
    res.send({ status: 'error', message: 'Registración errónea.!' })
})

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }), () => { })

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    // req.session.user = { _id: req.user._id }
    req.session.user = {
        _id: req.user._id,
        age: req.user.age,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        rol: req.user.rol
    }

    // no es necesario validar el login aquí, ya lo hace passport!
    return res.redirect('/products')
})

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }), () => { })

router.get('/googlecallback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    // req.session.user = { _id: req.user._id }
    // console.log(req.user)
    req.session.user = {
        _id: req.user._id,
        age: req.user.age,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        rol: req.user.rol
    }

    // no es necesario validar el login aquí, ya lo hace passport!
    return res.redirect('/products')
})

router.get('/logout', (req, res) => {
    req.session.destroy(_ => {
        res.redirect('/')
    })
})

router.get('/current', (req, res) => {
    if (!req.user)
        return res.status(400).send({ status: 'error', error: 'No existe un usuario logeado!' })
    req.session.user = {
        _id: req.user._id,
        age: req.user.age,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        rol: req.user.rol
    }

    // no es necesario validar el login aquí, ya lo hace passport!
    return res.redirect('/profile')
})

module.exports = router