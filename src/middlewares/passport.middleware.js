const passport = require('passport')

//defino una funcion que devuelve un middleware, éste middleware usa passport
//se hace para poder pasarle un parámetro, en este caso, la estrategia a utilizar
const passportMiddleware = strategy => {
    return (req, res, next) => {
        const passportAuthenticate = passport.authenticate(strategy, (err, user, info) => {  //=>la funcion con params (err, user, info) es el que se va a ejecutar como "done"
            if (err)
                return next(err) //pateo el error para el middleware que me llama
            if (!user)
                return res.status(401).send({
                    error: info && info.message ? info.message : info.toString()
                })
            //tengo el user
            req.user = user
            next()
        })
        passportAuthenticate(req, res, next)
    }
}

module.exports = passportMiddleware;
