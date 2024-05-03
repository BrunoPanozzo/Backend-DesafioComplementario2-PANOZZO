// JS del lado del cliente (browser)

const socket = io();
let user;
let chatBox = document.getElementById('chatBox');
let messageLogs = document.getElementById('messageLogs');

//expresión regular para validar un email
const emailValido = email => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// bloquear pantalla del usuario y pedirle un email
const { value: email } = Swal.fire({
    title: 'Identificate',
    input: 'email',
    text: 'Ingresa tu e-mail para Identificarte',
    inputPlaceholder: 'Direccion de Email',
    inputValidator: (value) => {
        return (!value || !emailValido(value)) && 'Debes escribir un email para continuar!'
    },
    allowOutsideClick: false // impide que el usuario salga de la alerta al dar "click" fuera de la misma    
}).then(result => {
    user = result.value
    console.log(`Usuario identificado como: ${user}`)
    socket.emit('userAuthenticated', user);  // notificar al server que se conecto
})

chatBox.addEventListener('keyup', event => {
    if (event.key === "Enter") {
        const message = chatBox.value
        if (message.trim().length > 0) {  // el mensaje no es vacio
            socket.emit('message', { user, message });
            chatBox.value = ''
        }
    }
})

// escuchar los mensajes desde el servidor y mostrarlos
socket.on('message', data => {
    const { user, message } = data
    messageLogs.innerHTML += `${user} dice ${message} </br>`;
})

socket.on('newUserConnected', user => {
    if (user) {
        Swal.fire({
            toast: true,
            position: "top-right",
            title: "Nuevo Usuario Conectado",
            text: `${user} se ha unido al chat.`
        })
    }
})