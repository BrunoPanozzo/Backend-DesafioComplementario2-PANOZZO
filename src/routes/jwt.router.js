const { Router } = require('express')
const userModel = require('../dao/models/user.model')
const { isValidPassword } = require('../utils/hashing')
const { generateToken, verifyToken } = require('../utils/jwt')

const router = Router()

router.post('/login', async (req, res) => {
    const { email, password } = req.body

    const user = await userModel.findOne({ email })
    if (!user) {
        return res.status(400).json({ error: 'El Usuario no existe!' })
    }

    if (!isValidPassword(password, user.password)) {
        return res.status(401).json({ error: 'Password inválida' })
    }

    const credentials = { id: user._id.toString(), email: user.email }
    const accessToken = generateToken(credentials)
    res.status(200).json({ accessToken })
})

router.get('/private', verifyToken, (req, res) => {
    const { email } = req.authUser
    res.send(`Bienvenido ${email}, este es contenido privado y protegido`)
})

module.exports = router