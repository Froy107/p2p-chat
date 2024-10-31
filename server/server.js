const WebSocket = require('ws'); // Импорт модуля WebSocket

const server = new WebSocket.Server({ port: 5001 });

server.on('connection', (socket) => {
    console.log('Client connected'); // Логируем подключение клиента

    socket.on('message', (message) => {
        server.clients.forEach((client) => {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });
});

console.log('WebSocket server is running on ws://localhost:5001'); // Логируем запуск сервера