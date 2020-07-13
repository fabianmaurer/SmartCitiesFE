let events=[];

const shops=[
    {
        type:"groceries",
        x:20,
        y:17,
        width:10,
        height:20,
        capacity:10,
        count:0,
        distance:2
    },
    {
        type:"groceries",
        x:30,
        y:60,
        width:20,
        height:10,
        capacity:8,
        count:0,
        distance:2
    },
    {
        type:"groceries",
        x:58,
        y:42,
        width:20,
        height:10,
        capacity:12,
        count:0,
        distance:5
    }
    // ,
    // {
    //     type:"furniture",
    //     x:10,
    //     y:30,
    //     width:10,
    //     height:10
    // }
    // ,
    // {
    //     type:"furniture",
    //     x:30,
    //     y:10,
    //     width:10,
    //     height:10
    // },
    // {
    //     type:"medicine",
    //     x:50,
    //     y:10,
    //     width:10,
    //     height:10
    // },
    // {
    //     type:"restaurant",
    //     x:60,
    //     y:10,
    //     width:10,
    //     height:10
    // }
]

init();
function init(){
    // loadEvents(function(data){
    //     events=data;
    // });
    addChoiceListeners();
}
function loadEvents(callback){
    $.get("https://smart-cities-backend.herokuapp.com/api/sensorevents/",callback);
}

function addChoiceListeners(){
    let choices=$('#landing-choices').children()
    console.log(choices)
    for(let c of choices){
        console.log(c)
        $(c).click(function(){

            transition();
        })
    }
}

function initBuildings(){
    let c=0;
    for(let b of shops){
        let $b=$(document.createElement('div'));
        $b.attr('class','building bid'+c+' '+b.type);
        $b.css('top',b.y+'vw');
        $b.css('left',b.x+'vw');
        $b.css('width',b.width+'vw');
        $b.css('height',b.height+'vw');
        c++;
        let $c=$(document.createElement('div'));
        $c.attr('class','counter-container');
        let $count=$(document.createElement('div'));
        $count.attr('class','counter');
        $count.html(b.count)
        let $cap=$(document.createElement('div'));
        $cap.attr('class','capacity');
        $cap.html('/'+b.capacity);
        $c.append($count);
        $c.append($cap);
        $b.append($c);
        let $bar=$(document.createElement('div'));
        $bar.attr('class','fillupbar');
        $b.append($bar)
        let $rec=$(document.createElement('div'));
        $rec.attr('class','recommended-text');
        $rec.html('recommended');
        $b.append($rec)
        $('#map').append($b);
    }
}

function transition(){
    $('#landing').fadeOut(200,function(){
        $('#app').fadeIn(400);
    });
    setTimeout(function(){

    })
    
    initBuildings();
    updateLoop();
}

function updateLoop(){
    checkForUpdate();
    setTimeout(updateLoop,1000);
}

function checkForUpdate(){
    console.log('polling...');
    loadEvents(function(data){
        _events=data;
        if(_events.length==events.length){
            console.log(' no new data');
            return;
        }
        for(let i=events.length;i<=_events.length;i++){
            let e=_events[i]
            console.log('adding event #'+i);
            console.log(e)
            if(typeof e =="undefined")
                continue;
            if(e.sensorId==0){
                increaseCount(e.buildingId);
            }else if(e.sensorId==1){
                decreaseCount(e.buildingId);
            }
        }
        events=_events;
    })
}

function increaseCount(buildingId){
    console.log('increase');
    let shop=shops[buildingId];
    shop.count++;
    let $c=$('.bid'+buildingId).find('.counter');
    $c.html(shop.count);
    let $f=$('.bid'+buildingId).find('.fillupbar');
    $f.css('height',100*shop.count/shop.capacity+'%');
    if(shop.count>=shop.capacity){
        $c.addClass('overcap');
    }
    showBestShop();
}

function decreaseCount(buildingId){
    let shop=shops[buildingId];
    if(shop.count>0) shop.count--;
    let $c=$('.bid'+buildingId).find('.counter');
    $c.html(shop.count);
    let $f=$('.bid'+buildingId).find('.fillupbar');
    $f.css('height',100*shop.count/shop.capacity+'%');
    if(shop.count<shop.capacity){
        $c.removeClass('overcap');
    }
    showBestShop();
}

function showBestShop(){
    let newId=calcBestShop();
    $('.recommended').removeClass('recommended');
    $('.bid'+newId).addClass('recommended');

}

function calcBestShop(){
    let lowScore=10000;
    let lowScoreId=0;
    let c=0;
    for(let b of shops){
        
        console.log(b.distance)
        console.log(b.capacity)
        console.log(b.count)
        let score=0.1*b.distance+b.distance*b.count/b.capacity;
        if(c==0){
            lowScore=score;
            lowScoreId=c;
        }else{
            console.log(score)
            console.log(lowScore)
            if(score<lowScore){
                lowScore=score;
                lowScoreId=c;
            }
        }
        c++;
    }
    console.log(lowScoreId)
    return lowScoreId;
}