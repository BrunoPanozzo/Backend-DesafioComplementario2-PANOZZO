const passport = require('passport')
const localStrategy = require('passport-local')
const githubStrategy = require('passport-github2')
const { Strategy, ExtractJwt } = require('passport-jwt')
const googleStrategy = require('passport-google-oauth20')
const userModel = require('../dao/models/user.model')
const { hashPassword, isValidPassword } = require('../utils/hashing')
const { secretCode } = require('../utils/jwt')
const { clientID, clientSecret, callbackURL } = require('./github.private')
const { clientIDGoogle, clientSecretGoogle, callbackUrlGoogle } = require('./google.private')

const LocalStrategy = localStrategy.Strategy
const GithubStrategy = githubStrategy.Strategy
const JwtStrategy = Strategy
const GoogleStrategy = googleStrategy.Strategy

const initializeStrategy = () => {

    const cookieExtractor = req => req && req.cookies ? req.cookies['userToken'] : null

    //defino un middleware para extraer el current user a partir de un token guardado en una cookie
    passport.use('jwt', new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: secretCode
    }, async (jwtPayload, done) => {
        try {
            return done(null, jwtPayload.user)
        }
        catch (err) {
            done(err)
        }
    }))

    //defino un middleware para el 'register' y su estrategia asociada
    passport.use('register', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'email'
    }, async (req, username, password, done) => {  //esta es el callback donde se especifica cómo se debe registrar un user

        const { firstName, lastName, email, age } = req.body

        try {
            user = await userModel.findOne({ email: username })
            if (user) {
                //ya existe un usuario con ese email
                return done(null, false)
            }

            //puedo continuar con la registración
            const newUser = {
                firstName,
                lastName,
                email,
                age: + age,
                password: hashPassword(password),
                cart:null
            }

            const result = await userModel.create(newUser)

            // registro exitoso
            return done(null, result)
        }
        catch (err) {
            done(err)
        }
    }))

    //defino un middleware para el 'login' y su estrategia asociada
    passport.use('login', new LocalStrategy({
        usernameField: 'email'
    }, async (username, password, done) => {
        try {

            if (!username || !password) {
                // return res.status(400).json({ error: 'Credenciales inválidas!' })
                return done(null, false, 'Credenciales inválidas!')
            }

            //verifico si es el usuario "ADMIN"
            let user
            if (username === "adminCoder@coder.com" && password === "adminCod3r123") {
                user = {
                    rol: "admin",
                    firstName: "Coder",
                    lastName: "House",
                    email: username,
                    password: password,
                    age: 47,
                    _id: "dflksgd8sfg7sd890fg",
                    cart: null
                }
            }
            else {
                //lo busco en la BD
                user = await userModel.findOne({ email: username })
                if (!user) {
                    // return res.status(401).send('No se encontró el usuario!')
                    return done(null, false, 'No se encontró el usuario!')
                }

                // validar el password
                if (!isValidPassword(password, user.password)) {
                    // return res.status(401).json({ error: 'Password inválida!' })
                    return done(null, false, 'Password inválida!')
                }
            }

            // login exitoso
            // req.session.user = { id: user._id.toString(), email: user.email, age: user.age, firstName: user.firstName, lastName: user.lastName, rol: user.rol }
            return done(null, user)
        }
        catch (err) {
            done(err)
        }
    }))

    //defino un middleware para el 'reset_password' y su estrategia asociada
    passport.use('reset_password', new LocalStrategy({
        usernameField: 'email'
    }, async (username, password, done) => {
        try {

            if (!username || !password) {
                // return res.status(400).json({ error: 'Credenciales inválidas!' })
                return done(null, false)
            }

            //verifico si es el usuario "ADMIN", no se le puede cambiar la pass
            let user
            if (username === "adminCoder@coder.com") {
                return done(null, false)
            }

            //lo busco en la BD
            user = await userModel.findOne({ email: username })
            if (!user) {
                // return res.status(400).send('No se encontró el usuario!')
                return done(null, false)
            }

            await userModel.updateOne({ email: username }, { $set: { password: hashPassword(password) } })

            // reset password exitoso
            return done(null, user)
        }
        catch (err) {
            done(err)
        }
    }))

    passport.use('github', new GithubStrategy({
        clientID,
        clientSecret,
        callbackURL
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            const user = await userModel.findOne({ email: profile._json.email })
            if (user) {
                return done(null, user)
            }

            // crear el usuario porque no existe
            const fullName = profile._json.name
            const firstName = fullName.substring(0, fullName.lastIndexOf(' '))
            const lastName = fullName.substring(fullName.lastIndexOf(' ') + 1)
            const newUser = {
                firstName,
                lastName,
                age: 30,
                email: profile._json.email,
                password: '',
                cart: ''
            }
            const result = await userModel.create(newUser)
            done(null, result)
        }
        catch (err) {
            done(err)
        }
    }))
    
    passport.use('google', new GoogleStrategy({
        clientID: clientIDGoogle,
        clientSecret: clientSecretGoogle,
        callbackURL: callbackUrlGoogle
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;
            const user = await userModel.findOne({ email: email })
            if (user) {
                return done(null, user)
            }

            // crear el usuario porque no existe
            const firstName = profile._json.given_name
            const lastName = profile._json.family_name
            const newUser = {
                firstName,
                lastName,
                age: 30,
                email: email,
                password: '',
                cart: null
            }
            const result = await userModel.create(newUser)
            done(null, result)
        }
        catch (err) {
            done(err)
        }
    }))

    // al hacer register o login del usuario, se pasa el modelo de user al callback done
    // passport necesita serializar este modelo, para guardar una referencia al usuario en la sesión
    // simplemente se usa su id
    passport.serializeUser((user, done) => {
        // console.log('serialized!', user)
        if (user.email === "adminCoder@coder.com") {
            // Serialización especial para el usuario 'adminCoder@coder.com'
            done(null, { firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.rol });
        } else {
            done(null, user._id)
        }
    })

    // para restaurar al usuario desde la sesión, passport utiliza el valor serializado y vuelve a generar al user
    // el cual colocará en req.user para que podamos usarlo
    passport.deserializeUser(async (id, done) => {
        // console.log('deserialized!', id)
        if (id.email === 'adminCoder@coder.com') {
            // Deserialización especial para el usuario 'adminCoder@coder.com'
            done(null, id);
        } else {
            const user = await userModel.findById(id);
            done(null, user);
        }
    })

}

module.exports = initializeStrategy
