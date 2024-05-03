document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.getElementsByClassName("btn-eliminarItem")
    // Convertir la coleccion a un array para que sea mas facil manipularla
    const allDeleteButtons = Array.from(buttons);
    allDeleteButtons.forEach(btn => {
        btn.addEventListener("click", function () {
            //alert(`${btn.id} clicked`);  
            // socket.emit('deleteProduct', `${btn.id}`)
            fetch(`http://localhost:8080/api/products/${btn.id}`, {
                method: 'DELETE'
            })
                .then(() => {
                    fetch(`http://localhost:8080/realtimeproducts`, {
                        method: 'GET'
                    })
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        });
    });
})

// const socket = io()

// socket.on('newProduct', (product) => {
//     //agregar el nuevo producto al html

//     const container = document.getElementById('productsList')
//     container.innerHTML += `
//     <div class="card text-bg-light mb-3 item">
//             <div class="card-header">${product.category}</div>
//             <div class="card-body">
//                 <h5 class="card-title">${product.title}</h5>
//                 <img src="/images/productos/${product.thumbnail}" alt=${product.title} width="270" />
//                 <p class="card-text item-precio">$ ${product.price}</p>
//                 <p class="card-text item-stock">Stock Disponible: ${product.stock}</p>
//                 <p class="card-text item-descripcion">${product.description}</p>
//             </div>
//             <div class"col align-self-center">
//                 <button type="button" class="btn btn-danger text-decoration
//                     text-center btn-eliminarItem" id=${product.id}>Eliminar producto
//                 </button>
//             </div>
//         </div>
//      `
// })

// socket.on('deleteProduct', (idProd) => {
//     //eliminar el producto al html
//     const container = document.getElementById(idProd)
//     if (container)
//         container.remove()
// })