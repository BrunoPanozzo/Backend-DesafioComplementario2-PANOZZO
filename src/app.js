//definir los paquetes que se van a utilizar
const express = require('express')
const expressHandlebars = require("express-handlebars")

const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')

const { Server } = require('socket.io')

//definir paquetes de passport
const passport = require('passport')
const initializeStrategy = require('./config/passport.config')

//definir paquetes y config de mongo
const { dbName, mongoUrl } = require('./dbConfig')
const sessionMiddleware = require('./session/mongoStorage')

//definir los routers
const productRouter = require('./routes/products.router')
const cartRouter = require('./routes/carts.router')
const viewsRouter = require('./routes/views.router')

//definir sessiony y jwt routers
const sessionsRouter = require('./routes/session.router')
const jwtRouter = require('./routes/jwt.router')

//definir los Managers y Modelos
const fsProductManager = require('./dao/fsManagers/ProductManager')
const fsCartManager = require('./dao/fsManagers/CartManager')
const dbProductManager = require('./dao/dbManagers/ProductManager')
const dbCartManager = require('./dao/dbManagers/CartManager')
const dbMessageManager = require('./dao/dbManagers/MessageManager')

//instanciar mi app
const app = express()

//configurar express para manejar formularios y JSON
app.use(express.static(`${__dirname}/../public`))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// configurar handlebars como nuestro template engine por defecto
// app.engine('handlebars', handlebars.engine())
// app.set('views', `${__dirname}/views`)
// app.set('view engine', 'handlebars')
const handlebars = expressHandlebars.create({
    defaultLayout: "main",
    handlebars: require("handlebars"),
    runtimeOptions: {
        allowProtoPropertiesByDefault: true
    }
})
app.engine("handlebars", handlebars.engine)
app.set("views", `${__dirname}/views`)
app.set("view engine", "handlebars")

//Configurar las views para tener alcance a los archivos CSS, JS e IMAGES desde los routers
app.use('/products/detail', express.static(`${__dirname}/../public`));
app.use('/products/create', express.static(`${__dirname}/../public`));
app.use('/carts', express.static(`${__dirname}/../public`));

//configuro mi session en MongoDB
app.use(cookieParser())
app.use(sessionMiddleware)

// inicializamos Passport
initializeStrategy()
app.use(passport.initialize())
app.use(passport.session())

//configurar los routers
app.use('/api/products', productRouter)
app.use('/api/carts', cartRouter)
app.use('/api/sessions', sessionsRouter)
app.use('/', viewsRouter)
app.use('/api', jwtRouter)

// app.get('/', (req, res) => {
//     if (req.session.counter) {
//         req.session.counter++
//         return res.send(`Esta es su visita nro. ${req.session.counter}`)
//     }

//     req.session.counter = 1
//     res.send('Bienvenido! Esta es su primer visita!')
// })

const main = async () => {

    let httpServer
    //configurar mongoose
    await mongoose.connect(mongoUrl, { dbName })
        .then(() => {
            //crear un servidor HTTP
            httpServer = app.listen(8080, () => {
                console.log('Servidor listo escuchando en el puerto 8080')
            });

        })

    //configurar cuál de los dos Managers está activo, son excluyentes
    //Manager con FileSystem
    // const fileNameProducts = `${__dirname}/../products.json`
    // const productManager = new fsProductManager(fileNameProducts)
    // await productManager.inicializar()
    // app.set('productManager', productManager)
    // const fileNameCarts = `${__dirname}/../carts.json`
    // const cartManager = new fsCartManager(fileNameCarts)
    // await cartManager.inicializar()
    // app.set('cartManager', cartManager)    

    //Manager con DataBaseSystem
    const productManager = new dbProductManager()
    await productManager.inicializar()
    app.set('productManager', productManager)
    const cartManager = new dbCartManager()
    await cartManager.inicializar()
    app.set('cartManager', cartManager)

    //Manager del chat
    const messageManager = new dbMessageManager()
    // app.set('messageManager', messageManager)

    //crear un servidor WS
    const io = new Server(httpServer)
    // app.set('io', io)

    let messagesHistory = []

    //conexion de un nuevo cliente a mi servidor WS
    io.on('connection', (clientSocket) => {
        // console.log(`Cliente conectado con ID: ${clientSocket.id}`)

        // clientSocket.on('saludo', (data) => {
        //     console.log(data)
        // })

        // clientSocket.on('deleteProduct', async (idProd) => {
        //     const id = parseInt(idProd)
        //     await productManager.deleteProduct(id)

        //     console.log(`El producto con código '${id}' se eliminó exitosamente.`)
        //     //avisar a todos los clientes
        //     io.emit('deleteProduct', idProd)

        // })

        //sección de MESSAGES
        // enviar todos los mensajes hasta este momento
        for (const data of messagesHistory) {
            clientSocket.emit('message', data)
        }

        clientSocket.on('message', async data => {
            messagesHistory.push(data)
            messageManager.addMessage(data)
            io.emit('message', data)
        })

        clientSocket.on('userAuthenticated', data => {
            // notificar a los otros usuarios que se conecto
            clientSocket.broadcast.emit('newUserConnected', data)
        })
    })
}

main()