const socket=io()

const $=document.querySelector("#message-form");
const $formInput=$.querySelector("input");
const $formButton=$.querySelector("button");
const sendLocation=document.querySelector("#send-location");
const $messages=document.querySelector("#messages");

const $msgTemplate=document.querySelector("#message-template").innerHTML;
const $locationTemplate=document.querySelector("#location-template").innerHTML;
const $sidebarTemplate=document.querySelector("#sidebar-template").innerHTML;

const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true});

const autoscroll=()=>{
    const $newMessage=$messages.lastElementChild;
    const newMessagesStyle=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessagesStyle.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin;
    const visibleHeight=$messages.offsetHeight;
    const containerHeight=$messages.scrollHeight;
    const scrollOffset=$messages.scrollTop+visibleHeight;
    if(containerHeight -newMessageHeight<=scrollOffset){
        $messages.scrollTop=$messages.scrollHeight;
    }
}

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
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend",html);
    autoscroll();
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
        username:link.username,
        link:link.url,
        createdAt:moment(link.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend",html);
    autoscroll();
})

socket.emit("join",{username,room},(error)=>{
    if(error){
        alert(error)
        location.href="/"
    }
});

socket.on("roomData",({room,users})=>{
    console.log(room,users);
    const html=Mustache.render($sidebarTemplate,{
        room,
        users,
    })
    document.querySelector("#sidebar").innerHTML=html;
})