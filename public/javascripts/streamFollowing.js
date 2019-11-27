let online = document.getElementById('online');
let offline = document.getElementById('offline');
let loading = document.getElementsByClassName('loading');
let gameList=[];

function addStream(followingList,area) {
    online.style.display='none';
    offline.style.display='none';
    loading[0].style.display='block';
    loading[1].style.display='block';
    let unknownGameList=[];
    for (let i=0; i<followingList.length; i++){
        let outterBox = document.createElement("div");
        outterBox.classList.add('col-md-4', 'col-sm-6', 'col-xs-12');

        let innerBox = document.createElement("div");
        innerBox.classList.add('card', 'mb-4', 'box-shadow');

        const header = document.createElement("div");
        if(followingList[i].game_id){
            header.classList.add('card-header', 'text-center', 'bg-white', 'font-weight-bold');
            let gameObj = gameList.find(obj=>obj.id===followingList[i].game_id)
            if (gameObj==undefined) {
                unknownGameList.push(followingList[i].game_id)
            }
            header.innerHTML=gameObj?gameObj.name:'Unknown';
        }
        
        let img = document.createElement("img");
        let previewURL = followingList[i].thumbnail_url?followingList[i].thumbnail_url.replace("{width}","430").replace("{height}","240"):followingList[i].offline_image_url;
        img.src = previewURL;

        let description = document.createElement("div");
        description.classList.add('card-body');
        let streamTitle = followingList[i].title||followingList[i].description;
        let streamer = followingList[i].user_name||followingList[i].display_name;
        description.innerHTML=  '<p class="card-title">'+streamTitle+'</p>'
                                +'<p class="card-subtitle mb-2 text-muted">'+streamer+'</p>'
        
        let numberOfViews = followingList[i].viewer_count||'offline';
        let user_id = followingList[i].user_id||followingList[i].id;
        let footer = document.createElement("div");
        footer.classList.add("card-footer", "d-flex", "justify-content-between", "align-items-center")
        footer.innerHTML='<div id='+user_id+' class="btn-group">'
                            +'<button type="button" value="watch" class="btn btn-sm btn-outline-secondary">Watch</button>'
                            +'<button type="button" value="unfollow" class="btn btn-sm btn-outline-warning">Unfollow</button>'
                        +'</div>'
                        +'<small class="text-muted">'+numberOfViews+(numberOfViews!=='offline'?' viewers':'')+'</small>'

        area.appendChild(outterBox);
        outterBox.appendChild(innerBox);
        innerBox.appendChild(header);
        innerBox.appendChild(img);
        innerBox.appendChild(description);
        innerBox.appendChild(footer);
    };
    if (unknownGameList.length>0) {
        fetch('untrack_gameid', {
            method: 'POST',
            body: JSON.stringify({game_list: unknownGameList}),
            headers: {
            'Content-Type': 'application/json'
            }
        });
    };
    setTimeout(function(){ 
        online.style.display='flex';
        offline.style.display='flex';
        loading[0].style.display='none';
        loading[1].style.display='none';
    }, 2000);
};

async function handleClick(event) {
    try{
        if (event.target.nodeName=='BUTTON') {
            if (event.target.value == "watch"){
                const result = await fetch('watch/'+event.target.parentNode.id);
                console.log(result);
                const json = await result.json();
                window.open(json.url, '_blank');
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

window.onload = async function() {
    const result = await fetch('following/list');
    const json = await result.json();
    const onlineList = json.online;
    const offlineList = json.offline;
    gameList=json.game;

    addStream(onlineList,online);
    addStream(offlineList,offline);
};

offline.addEventListener("click", (e)=>handleClick(e));
online.addEventListener("click", (e)=>handleClick(e));