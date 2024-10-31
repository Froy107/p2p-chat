// server.js
const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 5001 });

server.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('message', (message) => {
        server.clients.forEach((client) => {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });
});

console.log('WebSocket server is running on ws://localhost:5001');