const socket=io()

const $=document.querySelector("#message-form");
const $formInput=$.querySelector("input");
const $formButton=$.querySelector("button");
const sendLocation=document.querySelector("#send-location");
const $messages=document.querySelector("#messages");

const $msgTemplate=document.querySelector("#message-template").innerHTML;
const $locationTemplate=document.querySelector("#location-template").innerHTML;

const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true});

$.addEventListener("submit",(e)=>{
    e.preventDefault();
    $formButton.setAttribute("disabled","disabled");
    const msg=e.target.elements.msg.value;
    socket.emit("sendMessage",msg,(error)=>{
        $formButton.removeAttribute('disabled');
        $formInput.value="";
        $formInput.focus();
        if(error){
            return console.log(error);
        }
        console.log("Message delivered");
    });
})

socket.on("message",(message)=>{
    const html=Mustache.render($msgTemplate,{
        message:message.text,
        createdAt:moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend",html);
})

document.querySelector("#send-location").addEventListener("click",(e)=>{
    e.preventDefault();
    sendLocation.setAttribute("disabled","disabled");
    if(!navigator.geolocation){
        sendLocation.removeAttribute("disabled");
        return alert('Geolocation is not supported by your browser');
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit("sendLocation",{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude,
        },()=>{
            sendLocation.removeAttribute("disabled");
            console.log("Location shared");
        });
    })
})

socket.on('location',(link)=>{
    console.log("the location is:",link);
    const html=Mustache.render($locationTemplate,{
        link:link.url,
        createdAt:moment(link.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend",html);
})

socket.emit("join",{username,room});