const messageModel = require('../models/message.model')

class MessageManager {

    constructor() { }

    addMessage = async (data) => {
        try {
            const { user, message } = data
            if (user && message) {
                await messageModel.create({
                    user,
                    message
                })
                console.log(`Mensaje de ${user} persistido en la base de datos.`)
            }
        } catch (error) {
            console.error('Error al persistir el mensaje:', error)
        }
    }
}

module.exports = MessageManager