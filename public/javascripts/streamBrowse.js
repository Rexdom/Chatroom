let content = document.getElementById('content');
let game_bar= document.getElementById('game_list');
let title = document.getElementById('title');
let loading = document.getElementsByClassName('loading');
let searchForm = document.getElementById('search');
let searchInput = document.getElementById('searchInput');
let warning = document.getElementById('warning');

let gameList = [];
var followingList = [];

function addStream(dataList, followingList) {
    content.style.display='none';
    loading[0].style.display='block';
    content.innerHTML='';
    let unknownGameList=[];
    for (let i=0; i<dataList.length; i++){
        let outterBox = document.createElement("div");
        outterBox.classList.add('col-md-4', 'col-sm-6', 'col-xs-12');

        let innerBox = document.createElement("div");
        innerBox.classList.add('card', 'mb-4', 'box-shadow');

        let header = document.createElement("div");
        header.classList.add('card-header', 'text-center', 'bg-white', 'font-weight-bold');
        let gameObj = gameList.find(obj=>obj.id===dataList[i].game_id)
        if (gameObj==undefined) {
            unknownGameList.push(dataList[i].game_id)
        }
        header.innerHTML=gameObj?gameObj.name:'Unknown';
        
        let img = document.createElement("img");
        let previewURL = dataList[i].thumbnail_url.replace("{width}","430").replace("{height}","240");
        img.src = previewURL;

        let description = document.createElement("div");
        description.classList.add('card-body');
        let streamTitle = dataList[i].title;
        let streamer = dataList[i].user_name
        description.innerHTML=  '<p class="card-title">'+streamTitle+'</p>'
                                +'<p class="card-subtitle mb-2 text-muted">'+streamer+'</p>'
        
        let numberOfViews = dataList[i].viewer_count;
        let user_id = dataList[i].user_id;
        let footer = document.createElement("div");
        footer.classList.add("card-footer",'bg-white', "d-flex", "justify-content-between", "align-items-center")
        footer.innerHTML='<div id='+user_id+' class="btn-group">'
                            +'<button type="button" value="watch" class="btn btn-sm btn-outline-secondary">Watch</button>'
                            +(followingList.includes(user_id)
                            ?'<button type="button" value="unfollow" class="btn btn-sm btn-outline-warning">Unfollow</button>'
                            :'<button type="button" value="follow" class="btn btn-sm btn-outline-success">Follow</button>')
                        +'</div>'
                        +'<small class="text-muted">'+numberOfViews+' viewers'+'</small>'

        content.appendChild(outterBox);
        outterBox.appendChild(innerBox);
        innerBox.appendChild(header);
        innerBox.appendChild(img);
        innerBox.appendChild(description);
        innerBox.appendChild(footer);
    };
    unknownGameList = unknownGameList.filter(id=>id!=="");
    if (unknownGameList.length>1) {   
        fetch('untrack_gameid', {
            method: 'POST',
            body: JSON.stringify({game_list: unknownGameList}),
            headers: {
            'Content-Type': 'application/json'
            }
        });
    };
    setTimeout(function(){ 
        content.style.display='flex';
        loading[0].style.display='none';
    }, 2000);
   
};

async function handleClick(event) {
    try{
        if (event.target.nodeName=='BUTTON') {
            if (event.target.value == "watch"){
                var open = window.open();
                const result = await fetch('watch/'+event.target.parentNode.id);
                const json = await result.json();
                open.location=json.url;
            }else if (event.target.value == "follow"){
                const data = { user_id: event.target.parentNode.id };
                try {
                    const response = await fetch('follow', {
                        method: 'POST',
                        body: JSON.stringify(data),
                        headers: {
                        'Content-Type': 'application/json'
                        }
                    });
                    const json = await response.json();
                    
                    if (json.message==="success"){
                        let followButton=event.target;
                        let unfollowButton = document.createElement("button");
                        unfollowButton.classList.add('btn', 'btn-sm', 'btn-outline-warning');
                        unfollowButton.value='unfollow';
                        unfollowButton.type='button';
                        unfollowButton.innerHTML="Unfollow";
                        followButton.parentNode.replaceChild(unfollowButton, followButton);
                    } else alert(json.message);
                } catch (error) {
                alert('Error:'+ error);
                }
            }else if (event.target.value == "unfollow"){
                const data = { user_id: event.target.parentNode.id };
                try {
                    const response = await fetch('unfollow', {
                        method: 'POST',
                        body: JSON.stringify(data),
                        headers: {
                        'Content-Type': 'application/json'
                        }
                    });
                    const json = await response.json();
                    if (json.message==="success"){
                        let unfollowButton=event.target;
                        let followButton = document.createElement("button");
                        followButton.classList.add('btn', 'btn-sm', 'btn-outline-success');
                        followButton.value='follow';
                        followButton.type='button';
                        followButton.innerHTML="Follow";
                        unfollowButton.parentNode.replaceChild(followButton, unfollowButton);
                    }else alert(json.message)
                } catch (error) {
                alert('Error:', error);
                }
            }
        };
    }
    catch(e) {
        alert(e);
    }
};

async function handleGameClick(event) {
    try{
        let game_id=event.target.nodeName=='A'?event.target.id:event.target.parentNode.id
        const result = await fetch('game/'+game_id);
        const json = await result.json();
        const data = json.data;
        title.innerHTML=gameList.find(obj=>obj.id===game_id).name;
        addStream(data,followingList);
    }
    catch(e) {
        alert(e);
    }
};

async function search(e) {
    e.preventDefault();
    if (searchInput.value.length>0 && searchInput.value.match(/^[^_]\w+$/)) {
        warning.innerHTML="";
        content.style.display='none';
        loading[0].style.display='block';
        content.innerHTML='';
        const result = await fetch('search/'+searchInput.value);
        const json = await result.json();
        title.innerHTML= "Search for user - "+searchInput.value;
        let unknownGameList=[];
        if (json.user) {
            let outterBox = document.createElement("div");
            outterBox.classList.add('col-md-4', 'col-sm-6', 'col-xs-12');

            let innerBox = document.createElement("div");
            innerBox.classList.add('card', 'mb-4', 'box-shadow');

            const header = document.createElement("div");
            if(json.user.game_id){
                header.classList.add('card-header', 'text-center', 'bg-white', 'font-weight-bold');
                let gameObj = gameList.find(obj=>obj.id===json.user.game_id)
                if (gameObj==undefined) {
                    unknownGameList.push(json.user.game_id)
                }
                header.innerHTML=gameObj?gameObj.name:'Unknown';
            }
            
            let img = document.createElement("img");
            let previewURL = json.user.thumbnail_url?json.user.thumbnail_url.replace("{width}","430").replace("{height}","240"):json.user.offline_image_url;
            img.src = previewURL;

            let description = document.createElement("div");
            description.classList.add('card-body');
            let streamTitle = json.user.title||json.user.description;
            let streamer = json.user.user_name||json.user.display_name;
            description.innerHTML=  '<p class="card-title">'+streamTitle+'</p>'
                                    +'<p class="card-subtitle mb-2 text-muted">'+streamer+'</p>'
            
            let numberOfViews = json.user.viewer_count||'offline';
            let user_id = json.user.user_id||json.user.id;
            let footer = document.createElement("div");
            footer.classList.add("card-footer", "d-flex", "justify-content-between", "align-items-center")
            footer.innerHTML='<div id='+user_id+' class="btn-group">'
                                +'<button type="button" value="watch" class="btn btn-sm btn-outline-secondary">Watch</button>'
                                +(followingList.includes(user_id)
                                ?'<button type="button" value="unfollow" class="btn btn-sm btn-outline-warning">Unfollow</button>'
                                :'<button type="button" value="follow" class="btn btn-sm btn-outline-success">Follow</button>')
                            +'</div>'
                            +'<small class="text-muted">'+numberOfViews+(numberOfViews!=='offline'?' viewers':'')+'</small>'

            content.appendChild(outterBox);
            outterBox.appendChild(innerBox);
            innerBox.appendChild(header);
            innerBox.appendChild(img);
            innerBox.appendChild(description);
            innerBox.appendChild(footer);
        }else{
            content.innerHTML = "No user found"
        }
        unknownGameList = unknownGameList.filter(id=>id!=="");
        if (unknownGameList.length>1) {
            fetch('untrack_gameid', {
                method: 'POST',
                body: JSON.stringify({game_list: unknownGameList}),
                headers: {
                'Content-Type': 'application/json'
                }
            });
        };
        setTimeout(function(){ 
            content.style.display='flex';
            loading[0].style.display='none';
        }, 1000);
    } else {
        warning.innerHTML="Please input valid user name";
        searchInput.innerHTML="";
    }
}

window.onload = async function() {
    const result= await fetch('browse/top');
    const json = await result.json();
    const data = json.data;
    gameList=json.game;

    const user_result = await fetch('browse/list');
    const user_json = await user_result.json();
    followingList = user_json.streams;

    addStream(data,followingList);
};

content.addEventListener("click", (e)=>handleClick(e));
game_bar.addEventListener("click", (e)=>handleGameClick(e));
searchForm.addEventListener("submit", (e)=>search(e));