const jwt = require('jsonwebtoken')

const PRIVATE_KEY = 'sdkjfhds88sdf989s8daf897sad'

const generateToken = user => {
    const token = jwt.sign({ user }, PRIVATE_KEY, { expiresIn: '24h' })
    return token
}

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).json({ error: 'No autenticado!' })
    }

    const [, token] = authHeader.split(' ')  //su formato es Bearer sdsdfklgsdklfg, x eso hago split
    jwt.verify(token, PRIVATE_KEY, (err, signedPayload) => {
        if (err) {
            return res.status(403).json({ error: 'Token de acceso inválido!' })
        }

        req.authUser = signedPayload.user
        next()
    })
}

module.exports = { generateToken, verifyToken, secretCode: PRIVATE_KEY}