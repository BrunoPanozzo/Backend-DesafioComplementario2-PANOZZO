// const socket = io()

// socket.emit('saludo', 'msje del browser al servidor')

// document.getElementById('newProductForm').addEventListener('submit', (event) => {
//     event.preventDefault()
//     const title = document.getElementById('title').value
//     const description = document.getElementById('description').value
//     const price = document.getElementById('price').value
//     const thumbnail = ["/images/productos/" + document.getElementById('thumbnail').value]
//     const code = document.getElementById('code').value
//     const stock = document.getElementById('stock').value
//     const category = document.getElementById('category').value
//     const statusTrue = document.getElementById('statusTrue').value
//     const statusFalse = document.getElementById('statusFalse').value
    
//     let status = statusTrue ? true : false

//     const product = {        
//         title,
//         description,
//         price: Number(price),
//         thumbnail,
//         code,
//         stock: Number(stock),
//         status,
//         category
//     }

//     console.log ('thumbnail',thumbnail)
//     socket.emit('newProduct', product)


// } )
