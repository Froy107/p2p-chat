# P2P Чат с поддержкой передачи txt файлов

## Описание

Этот проект представляет собой приложение P2P-чата с поддержкой передачи сообщений и txt файлов. Для установления прямого соединения между пользователями используются технологии WebRTC и WebSocket.

## Основные функции:
- Обмен сообщениями в реальном времени: пользователи могут обмениваться сообщениями, отправляя их друг другу через соединение WebRTC.
- Передача файлов: поддерживается отправка файлов любого типа напрямую между пользователями, используя DataChannel WebRTC.
- Индикатор подключения: статус подключения отображается с помощью индикатора, который становится зеленым при успешном подключении.
- Поддержка повторного подключения: при обрыве соединения автоматически инициируется повторное подключение.
  
## Установка

### 1. Клонируйте репозиторий на ваше устройство:
   
  `git clone https://github.com/Froy107/p2p-chat.git`

   `cd p2p-chat`

### 2. Установите зависимости для сервера WebSocket:
   
   `npm install ws`

## Запуск

### 1. Запуск сервера WebSocket:
  
Сначала запустите сервер WebSocket:

  `node server.js`

Сервер будет запущен на `ws://localhost:5001`

### 2. Запуск клиента:
  
Откройте файл index.html в браузере. Это загрузит интерфейс чата и установит соединение с WebSocket-сервером.

## Использование

- Отправка сообщения: введите текст в поле ввода и нажмите Enter или кнопку «Отправить».
- Отправка файла: нажмите на иконку файла, выберите файл и он отправится собеседнику.
- Индикация статуса: статус соединения отображается индикатором в правом верхнем углу интерфейса (зелёный — соединение активно, красный — соединение потеряно).

## Технологии

- WebSocket: для сигнального обмена данными между пользователями.
- WebRTC: для передачи данных и сообщений между клиентами.
- HTML/CSS/JavaScript: интерфейс и логика чата.
