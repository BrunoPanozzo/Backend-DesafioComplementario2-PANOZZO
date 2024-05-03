module.exports = {
    userIsLoggedIn: (req, res, next) => {
        const isLoggedIn = ![null, undefined].includes(req.session.user)
        if (!isLoggedIn) {
            return res.status(401).json({error: 'El usuario debe tener una sesion iniciada!'})
        }

        next()
    },
    userIsNotLoggedIn: (req, res, next) => {
        const isLoggedIn = ![null, undefined].includes(req.session.user)
        if (isLoggedIn) {
            return res.status(401).json({error: 'El usuario NO debe tener una sesion iniciada!'})
        }
        
        next()
    },
    userIsAdmin: (req, res, next) => {
        if (req.session.user.rol != "admin" ) {
            return res.status(403).json({error: 'El usuario debe tener permisos de admin!'})
        }
        
        next()
    }
}