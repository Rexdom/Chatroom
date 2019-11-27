let chatBody = document.getElementById('chatbox');
let listArea = document.getElementById('user');
let form = document.querySelector('form');

const socket = io();

let user='';

window.onload = async function() {
    const result = await fetch('/loginUser', {method: 'GET'});
    const json = await result.json();
    user=json.user;
};

socket.on('connect', () => socket.emit('getMessage'));

socket.on('getMessage', (obj) => {
    let newElement=document.createElement("div");
    newElement.innerHTML=obj.message;
    newElement.classList.add("text-center", "text-white");
    chatBody.appendChild(newElement);
    listArea.innerHTML="";
    for (i=0; i< obj.list.length; i++) {
        let newUser = document.createElement("div");
        newUser.innerHTML=obj.list[i];
        listArea.appendChild(newUser);
    };
});

socket.on('getMessageAll', (obj) => {
    let newElement=document.createElement("p");
    if (obj.user===user) {
        newElement.classList.add("text-right", "text-light")
    }
    newElement.innerHTML=obj.message;
    chatBody.appendChild(newElement);
    chatBody.scrollTop=chatBody.scrollHeight;
});

socket.on('getMessageExcept', (obj) => {
    let newElement=document.createElement("div");
    newElement.innerHTML=obj.message;
    newElement.classList.add("text-center", "text-muted");
    chatBody.appendChild(newElement);
    chatBody.scrollTop=chatBody.scrollHeight;
    listArea.innerHTML="";
    for (i=0; i< obj.list.length; i++) {
        let newUser = document.createElement("div");
        newUser.innerHTML=obj.list[i];
        listArea.appendChild(newUser);
    };
});

form.onsubmit= function(e){
    e.preventDefault();
    let message = e.target.querySelector('input').value;
    socket.emit('getMessageAll', message);
    e.target.querySelector('input').value='';
}
