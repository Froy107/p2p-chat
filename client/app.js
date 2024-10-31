let socket;
let peerConnection;
let dataChannel;
let isInitiator = false;
const statusIndicator = document.getElementById("statusIndicator");
const receivedFileURLs = new Set();
const reconnectInterval = 3000; // Интервал для повторных попыток подключения
let reconnecting = false; // Флаг для предотвращения повторных попыток подключения

function connectWebSocket() {
    socket = new WebSocket("ws://localhost:5001");

    socket.onopen = () => {
        console.log("Connected to WebSocket");
        updateConnectionStatus(true); // Обновление статуса соединения
        initializePeerConnection(); // Инициализация P2P соединения
        reconnecting = false; // Сброс флага 
    };

    socket.onmessage = async (event) => {
        let data;
        if (typeof event.data === 'string') {
            data = JSON.parse(event.data); // Обработка текстовых данных
        } else if (event.data instanceof Blob) {
            let text = await event.data.text(); // Обработка бинарных данных
            data = JSON.parse(text);
        }
        handleSignalingData(data); //Обработка сигнальных данных
    };

    socket.onclose = () => {
        console.log("Disconnected from WebSocket");
        updateConnectionStatus(false); // Обновление статуса соединения
        if (!reconnecting) {
            reconnecting = true; // Установка флага реконнекта
            setTimeout(connectWebSocket, reconnectInterval); // Попытка переподключения
        }
    };
}
// Функция для обновления индикатора статуса соединения
function updateConnectionStatus(isConnected) {
    statusIndicator.style.backgroundColor = isConnected ? 'green' : 'red';
}

function initializePeerConnection() {
    peerConnection = new RTCPeerConnection();

    // Определение, кто инициатор
    if (isInitiator) {
        dataChannel = peerConnection.createDataChannel("chat");
        setupDataChannel();
        console.log("DataChannel created by initiator.");
        createAndSendOffer();
    } else {
        peerConnection.ondatachannel = (event) => {
            dataChannel = event.channel;
            setupDataChannel();
            console.log("DataChannel received by receiver.");
        };
    }

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.send(JSON.stringify({ type: "candidate", candidate: event.candidate }));
        }
    };

    peerConnection.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", peerConnection.iceConnectionState);
        // Проверяем состояние соединения
        if (peerConnection.iceConnectionState === 'connected' && dataChannel) {
            console.log("DataChannel state:", dataChannel.readyState);
        }
    };
}

function setupDataChannel() {
    dataChannel.onopen = () => {
        console.log("DataChannel is open and ready to be used.");
        updateConnectionStatus(true);
    };

    dataChannel.onclose = () => {
        console.log("DataChannel is closed.");
        updateConnectionStatus(false);
    };

    dataChannel.onmessage = (event) => {
        console.log("Received message:", event.data);
        if (event.data instanceof ArrayBuffer) {
            const blob = new Blob([event.data]);
            const url = URL.createObjectURL(blob);
            if (!receivedFileURLs.has(url)) {
                receivedFileURLs.add(url);
                displayMessage(`Собеседник отправил файл: <a href="${url}" download="received_file">Скачать файл</a>`);
            }
        } else {
            if (event.data && event.data.trim() !== "") {
                displayMessage("Собеседник: " + event.data);
            }
        }
    };
}

function handleSignalingData(data) {
    if (data.type === "offer") {
        peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer)).then(() => {
            console.log("Remote offer set, creating answer...");
            createAndSendAnswer();
        });
    } else if (data.type === "answer") {
        peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        console.log("Remote answer set.");
    } else if (data.type === "candidate") {
        peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
            .then(() => console.log("ICE candidate added."))
            .catch(error => console.error("Error adding ICE candidate:", error));
    }
}

function sendMessage() {
    let messageInput = document.getElementById("messageInput");
    let message = messageInput.value;
    if (!message) return;

    if (dataChannel && dataChannel.readyState === "open") {
        dataChannel.send(message);
        displayMessage("Вы: " + message);
        messageInput.value = "";
    } else {
        console.log("DataChannel is not open. Message not sent.");
    }
}

function displayMessage(message) {
    let messages = document.getElementById("messages");
    let messageElement = document.createElement("div");
    messageElement.innerHTML = message;
    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight;
}

function createAndSendOffer() {
    peerConnection.createOffer().then((offer) => {
        peerConnection.setLocalDescription(offer).then(() => {
            socket.send(JSON.stringify({ type: "offer", offer: offer }));
        });
    });
}

function createAndSendAnswer() {
    peerConnection.createAnswer().then((answer) => {
        peerConnection.setLocalDescription(answer).then(() => {
            socket.send(JSON.stringify({ type: "answer", answer: answer }));
        });
    });
}

let isSendingFile = false; // Флаг для предотвращения повторной отправки файла

function sendFile(event) {
    const file = event.target.files[0];
    if (file && dataChannel && dataChannel.readyState === 'open' && !isSendingFile) {
        isSendingFile = true; // Устанавливаем флаг отправки файла
        const reader = new FileReader();
        reader.onload = (event) => {
            // Отправляем содержимое файла как ArrayBuffer
            const arrayBuffer = event.target.result;
            dataChannel.send(arrayBuffer); 

            // Отправляем сообщение о том, что файл был отправлен
            displayMessage(`Вы отправили файл: ${file.name}`);
            isSendingFile = false; 
        };
        reader.readAsArrayBuffer(file); 
    } else {
        console.log('DataChannel is not open. File not sent.');
    }
}

// Обработчик выбора файла
document.getElementById("fileInput").addEventListener("change", (event) => {
    sendFile(event);
});

document.getElementById("messageInput").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

// Устанавливаем инициатора случайным образом для тестирования
isInitiator = Math.random() > 0.5; 

// Инициализация подключения к WebSocket
connectWebSocket();