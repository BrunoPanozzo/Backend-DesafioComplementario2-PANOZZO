const productModel = require('../models/product.model')

class ProductManager {

    //variables internas
    static #lastID_Product = 0

    constructor() { }

    inicializar = async () => {
        // No hacer nada
        // Podríamos chequear que la conexión existe y está funcionando
        if (productModel.db.readyState !== 1) {
            throw new Error('Error al conectarse a la BD de mongodb!')
        }
        else {
            const products = await this.getProducts({})            
            ProductManager.#lastID_Product = this.#getHigherID(products.docs)
        }
    }

    //métodos internos
    #getHigherID = (products) => {
        let higherID = 0
        products.forEach(item => {
            if (item.id > higherID)
                higherID = item.id
        });
        return higherID
    }

    //retornar un ID único para cada producto nuevo
    #getNuevoID = () => {
        ProductManager.#lastID_Product += 1
        return ProductManager.#lastID_Product;
    }

    //validar un string permitiendo solo números y letras
    #soloLetrasYNumeros = (cadena) => {
        return (/^[a-zA-Z0-9]+$/.test(cadena))
    }

    //validar permitiendo solo números positivos
    #soloNumerosPositivos = (cadena) => {
        return ((/^[0-9]+$/.test(cadena)) && (+cadena > 0))
    }

    //validar permitiendo solo números positivos, más el cero
    #soloNumerosPositivos_Y_Cero = (cadena) => {
        return ((/^[0-9]+$/.test(cadena)) && (+cadena >= 0))
    }

    //métodos públicos

    //validar que un numero sea estrictamente positivo, incluido el 0
    esPositivo = (cadena) => {
        return this.#soloNumerosPositivos_Y_Cero(cadena)
    }

    //     //validar los campos de un "objeto" producto
    validateProduct = (title, description, price, thumbnail, code, stock, status, category) => {
        //validar que el campo "title" no esté vacío        
        if (title.trim().length <= 0) {
            console.error("El campo \"title\" es inválido")
            return false
        }
        //validar que el campo "description" no esté vacío
        if (description.trim().length <= 0) {
            console.error("El campo \"description\" es inválido")
            return false
        }
        //validar que el campo "price" contenga sólo números
        if ((!this.#soloNumerosPositivos(price)) || (typeof price != "number")) {
            console.error("El campo \"price\" no es un número positivo")
            return false
        }
        //el campo "thumbnail" puede estar vacío, por eso queda comentado la validacion anterior, solo
        //verificar que es un arreglo de strings
        // if (thumbnail.trim().length <= 0) {
        //     console.error("El campo \"thumbnail\" es inválido")
        //     return false
        // 
        if (!Array.isArray(thumbnail)) {
            return false
        }
        else {
            let pos = -1
            do {
                pos++
            } while ((pos < thumbnail.length) && (typeof thumbnail[pos] == "string"));
            if (pos != thumbnail.length)
                return false
        }
        //validar que el campo "status" sea booleano
        if (typeof status != "boolean") {
            console.error("El campo \"status\" no es booleano")
            return false
        }
        //validar que el campo "category"  no esté vacío
        if (category.trim().length <= 0) {
            console.error("El campo \"category\" es inválido")
            return false
        }
        //validar que el campo "code" contenga sólo números y letras
        const codeAValidar = code.trim()
        if ((codeAValidar.length <= 0) || (!this.#soloLetrasYNumeros(codeAValidar))) {
            console.error("El campo \"code\" es inválido")
            return false
        }
        //validar que el campo "stock" contenga sólo números
        if ((!this.#soloNumerosPositivos_Y_Cero(stock)) || (typeof stock != "number")) {
            console.error("El campo \"stock\" no es un número")
            return false
        }
        return true
    }

    getProducts = async (filters) => {
        try {
            let filteredProducts = await productModel.find()

            //busqueda general, sin filtros, devuelvo todos los productos en una sola página
            if (JSON.stringify(filters) === '{}') {
                filteredProducts = await productModel.paginate({}, { limit: filteredProducts.length})
                // return filteredProducts.docs.map(d => d.toObject({ virtuals: true }))                
                return filteredProducts
            }

            //busqueda general, sin filtros, solo esta avanzando o retrocediendo por las paginas
            let { page, ...restOfFilters } = filters
            if (page && JSON.stringify(restOfFilters) === '{}') {
                filteredProducts = await productModel.paginate({}, { page: page, lean: true })
                // return filteredProducts.docs.map(d => d.toObject({ virtuals: true }))
                return filteredProducts
            } 

            if (!page) page = 1
            let { limit, category, availability, sort } = { limit: 10, page: page, availability: 1, sort: 'asc', ...filters }
           
            // console.log(limit)
            // console.log(page)
            // console.log(category)
            // console.log(availability)
            // console.log(sort)

            if (availability == 1) {
                if (category)
                    filteredProducts = await productModel.paginate({ category: category, stock: { $gt: 0 }}, { limit: limit, page: page, sort: { price: sort }, lean: true })
                else
                filteredProducts = await productModel.paginate({ stock: { $gt: 0 }}, { limit: limit, page: page, sort: { price: sort }, lean: true })
            }
            else {
                if (category)
                    filteredProducts = await productModel.paginate({ category: category, stock: 0 }, { limit: limit, page: page, sort: { price: sort }, lean: true })
                else
                filteredProducts = await productModel.paginate({ stock: 0 }, { limit: limit, page: page, sort: { price: sort }, lean: true })
            }

            return filteredProducts
            // return filteredProducts.map(d => d.toObject({ virtuals: true }))
        }
        catch (err) {
            console.log({ error: err })
            return []
        }
    }

    getProductById = async (prodId) => {
        const producto = await productModel.findOne({ _id: prodId })
        if (producto)
            return producto
        else {
            console.error(`El producto con id "${prodId}" no existe.`)
            return
        }
    }

    //buscar en el arreglo de productos un producto con un CODE determinado. Caso contrario devolver msje de error
    getProductByCode = async (prodCode) => {
        const producto = await productModel.findOne({ code: prodCode })
        if (producto)
            return producto
        else {
            console.error(`El producto con código "${prodCode}" no existe.`)
            return
        }
    }

    addProduct = async (title, description, price, thumbnail, code, stock, status, category) => {
        // console.log(this.#getNuevoID())
        let product = await productModel.create({
            id: this.#getNuevoID(),
            title,
            description,
            price,
            thumbnail,
            code,
            stock,
            status,
            category
        })
    }

    updateProduct = async (prodId, producto) => {
        await productModel.updateOne({ _id: prodId }, producto)
    }

    deleteProduct = async (idProd) => {
        await productModel.deleteOne({ _id: idProd })
    }
}

module.exports = ProductManager

