const { Router } = require('express')
const { validateNewProduct, validateUpdateProduct, validateProduct }= require('../middlewares/product.middleware')

const router = Router()

//endpoints

router.get('/', async (req, res) => {
    try {
        const productManager = req.app.get('productManager')

        const filteredProducts = await productManager.getProducts(req.query)

        const result = {
            payload: filteredProducts.totalDocs,
            totalPages: filteredProducts.totalPages,
            prevPage: filteredProducts.prevPage,
            nextPage: filteredProducts.nextPage,
            page: filteredProducts.page,
            hasPrevPage: filteredProducts.hasPrevPage,
            hasNextPage: filteredProducts.hasNextPage,
            prevLink: filteredProducts.hasPrevPage ? `/products?page=${filteredProducts.prevPage}` : null,
            nextlink: filteredProducts.hasNextPage ? `/products?page=${filteredProducts.nextPage}` : null
        }

        let status = 'success'
        if (filteredProducts.docs.length == 0)
            status = 'error'
        let finalResult = {
            status,
            ...result
        }

        // HTTP 200 OK
        return res.status(200).json(finalResult)
    }
    catch (err) {
        return res.status(500).json({ error: err })
    }
})

router.get('/:pid', validateProduct, async (req, res) => {
    try {
        const productManager = req.app.get('productManager')
        const prodId = req.params.pid

        const product = await productManager.getProductById(prodId)

        if (product)
            // HTTP 200 OK => se encontró el producto
            res.status(200).json(product)
        else
            // HTTP 404 => el ID es válido, pero no se encontró ese producto
            res.status(404).json(`El producto con código '${prodId}' no existe.`)
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

router.post('/create', validateNewProduct, async (req, res) => {
    try {
        const productManager = req.app.get('productManager')

        const newProduct = req.body

        // newProduct.thumbnail = [newProduct.thumbnail]
        newProduct.status = JSON.parse(newProduct.status)

        //agregar el producto al productManager
        await productManager.addProduct(newProduct.title,
            newProduct.description,
            newProduct.price,
            newProduct.thumbnail,
            newProduct.code,
            newProduct.stock,
            newProduct.status,
            newProduct.category)

        // //notificar a los demás browsers mediante WS
        // req.app.get('io').emit('newProduct', newProduct)

        // HTTP 201 OK => producto creado exitosamente
        res.status(201).json(`El producto con código '${newProduct.code}' se agregó exitosamente.`)

        // res.redirect('/allProducts')
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }

    // const product = req.body

    // await productManager.addProduct(product.title,
    //                                 product.description,
    //                                 product.price,
    //                                 product.thumbnail,
    //                                 product.code,
    //                                 product.stock,
    //                                 product.status,
    //                                 product.category)

    // // HTTP 201 OK => producto creado exitosamente
    // res.status(201).json(`El producto con código '${product.code}' se agregó exitosamente.`)
})

router.put('/:pid', validateUpdateProduct, async (req, res) => {
    try {
        const productManager = req.app.get('productManager')
        const prodId = req.params.pid
        const productUpdated = req.body

        //valido el ID que hasta el momento no fue evaluado
        // if (isNaN(prodId)) {
        //     // HTTP 400 => hay un error en el request o alguno de sus parámetros
        //     res.status(400).json({ error: "Formato inválido del productID." })
        //     return
        // }

        const productActual = await productManager.getProductById(prodId)
        if (productActual) {
            await productManager.updateProduct(productUpdated, prodId)

            // HTTP 200 OK => producto modificado exitosamente
            res.status(200).json(productUpdated)
        }
        else
            // HTTP 404 => el ID es válido, pero no se encontró ese producto
            res.status(404).json(`El producto con código '${prodId}' no existe.`)
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

router.delete('/:pid', validateProduct, async (req, res) => {
    try {
        const productManager = req.app.get('productManager')
        const prodId = req.params.pid

        const product = await productManager.getProductById(prodId)
        if (product) {
            await productManager.deleteProduct(prodId)            

            // HTTP 200 OK => producto eliminado exitosamente
            return res.status(200).json(`El producto con código '${prodId}' se eliminó exitosamente.`)
        }
        else {        
            // HTTP 404 => el ID es válido, pero no se encontró ese producto
            return res.status(404).json(`El producto con código '${prodId}' no existe.`)
        }
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

module.exports = router