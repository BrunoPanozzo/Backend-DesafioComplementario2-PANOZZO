const { Router } = require('express')
const userModel = require('../dao/models/user.model')
const { isValidPassword } = require('../utils/hashing')
const { generateToken, verifyToken } = require('../utils/jwt')
const passport = require('passport')
const passportMiddleware = require('../middlewares/passport.middleware')
const router = Router()

router.post('/login', async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: 'Credenciales inválidas!' })
    }

    //verifico si es el usuario "ADMIN"
    let user
    if (email === "adminCoder@coder.com" && password === "adminCod3r123") {
        user = {
            rol: "admin",
            firstName: "Coder",
            lastName: "House",
            email: email,
            password: password,
            age: 47,
            cart: null,
            _id: "dflksgd8sfg7sd890fg"
        }
    }
    else {
        user = await userModel.findOne({ email })
        if (!user) {
            return res.status(400).json({ error: 'El Usuario no existe!' })
        }

        if (!isValidPassword(password, user.password)) {
            return res.status(401).json({ error: 'Password inválida' })
        }
    }
    const credentials = { id: user._id.toString(), email: user.email , rol: user.rol}
    const accessToken = generateToken(credentials)

    //le indico al cliente que guarde la cookie
    res.cookie('userToken', accessToken, { maxAge: 60*60*1000, httpOnly: true})
    //envío el token
    res.status(200).json({ status: 'success' })
})

router.get('/private', verifyToken, (req, res) => {
    const { email } = req.authUser
    res.send(`Bienvenido ${email}, este es contenido privado y protegido`)
})

router.get('/users/current', passportMiddleware('jwt') /*passport.authenticate('jwt', {session: false})*/, (req, res) => {
    return res.json(req.user)
})

module.exports = router