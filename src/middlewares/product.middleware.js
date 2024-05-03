module.exports = {
    validateNewProduct: async (req, res, next) => {
        const productManager = req.app.get('productManager')
        const product = req.body

        product.thumbnail = [product.thumbnail]
        product.status = JSON.parse(product.status)

        product.price = +product.price
        product.stock = +product.stock

        if (productManager.validateProduct(product.title,
            product.description,
            product.price,
            product.thumbnail,
            product.code,
            product.stock,
            product.status,
            product.category)) {
            //debo verificar también que el campo "code" no se repita
            const prod = await productManager.getProductByCode(product.code)
            if (prod) {
                let msjeError = `No se permite agregar el producto con código '${product.code}' porque ya existe.`
                console.error(msjeError)
                // HTTP 400 => code repetido
                res.status(400).json({ error: msjeError })
                return
            }
            //exito, continuo al endpoint
            return next()
        }
        // HTTP 400 => producto con valores inválidos
        res.status(400).json({ error: "El producto que se quiere agregar posee algún campo inválido." })
    },
    validateUpdateProduct: async (req, res, next) => {
        const productManager = req.app.get('productManager')

        const prodId = req.params.pid
        const product = req.body

        //primero debo verificar que el producto exista en mi array de todos los productos
        const prod = await productManager.getProductById(prodId)
        if (!prod) {
            // HTTP 404 => no existe el producto
            res.status(404).json({ error: `El producto con ID '${prodId}' no se puede modificar porque no existe.` })
            return
        }

        if (productManager.validateProduct(product.title,
            product.description,
            product.price,
            product.thumbnail,
            product.code,
            product.stock,
            product.status,
            product.category)) {
            //verifico que el campo "code", que puede venir modificado, no sea igual al campo code de otros productos ya existentes
            let allProducts = await productManager.getProducts(req.query)
            let producto = allProducts.docs.find(element => ((element.code === product.code) && (element._id != prodId)))
            if (producto) {
                let msjeError = `No se permite modificar el producto con código '${product.code}' porque ya existe.`
                console.error(msjeError)
                // HTTP 400 => code repetido
                res.status(400).json({ error: msjeError })
                return
            }

            //exito, continuo al endpoint
            return next()
        }
        // HTTP 400 => producto con valores inválidos
        res.status(400).json({ error: "El producto que se quiere modificar posee algún campo inválido." })
    },
    validateProduct: async (req, res, next) => {
        const productManager = req.app.get('productManager')
        let prodId = req.params.pid;

        // if (isNaN(prodId)) {
        //     // HTTP 400 => hay un error en el request o alguno de sus parámetros
        //     res.status(400).json({ error: "Formato inválido del productID." })
        //     return
        // }

        //primero debo verificar que el producto exista en mi array de todos los productos
        const prod = await productManager.getProductById(prodId)
        if (!prod) {
            // HTTP 404 => no existe el producto
            res.status(404).json({ error: `El producto con ID '${prodId}' no existe.` })
            return
        }

        //exito, continuo al endpoint
        return next()
    }
}