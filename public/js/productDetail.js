document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("btn-confirmar")
    btn.addEventListener("click", function () {
        // Handle the button click event here

        Swal.fire({
            icon: "success",
            title: "Compra confirmada",
            text: `Su producto se agregó al carrito.`,
        })
    });
})
