const path=require('path');
const http=require("http");
const express=require('express');
const socketio=require("socket.io");
const Filter=require('bad-words');
const {generateMessage,generateLocMessage}=require('./utils/messages')

const app=express();
const server=http.createServer(app);
const io=socketio(server);

const port =process.env.PORT || 3000;
const publicDirectoryPath=path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath));

io.on("connection",(socket)=>{
    console.log("New Web Socket connected");

    socket.on("join",({username,room})=>{
        socket.join(room);
        socket.emit("message",generateMessage('Weclome to the chat app !!'));
        socket.broadcast.to(room).emit("message",generateMessage(`${username} has joined`))
    })

    socket.on("sendMessage",(msg,callback)=>{
        const filter=new Filter();
        if(filter.isProfane(msg)){
            return callback("Profanity is not allowed");
        }
        io.emit("message",generateMessage(msg));
        callback();
    })

    socket.on("disconnect",()=>{
        io.emit("message",generateMessage('The user left !!'));
    })

    socket.on("sendLocation",(coords,callback)=>{
        io.emit("location",generateLocMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    })
})

server.listen(port,()=>{
    console.log(`Server is up on port ${port}`);
})