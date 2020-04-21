//start (node server.js) via terminal first for local
//start (node localserver.js) via terminal for physical control
//browser with sketch open needs focus for max speed to serial port

var socket; //add socket object
var socket2; //adding localhost socket on port 3000 [TEST]

let parent = true;

let login = ""; //to avoid redundant data transfer
let login0 = "";

var data; //object for outgoing data;

let color = [];

function setup() {
    
    color[0] = int(random(255));
    color[1] = int(random(255));
    color[2] = int(random(255));

    data = {    //make data object to send
        x: 0,
        y: 0,
        color: color
    }

    createCanvas(window.innerWidth, window.innerHeight);
    noStroke();
    background(255);
    fill(0);
    
    //you will need your own heroku server here:
    socket = io.connect(''); //for heroku
    
    socket2 = io.connect('http://localhost:3000'); // second socket to localhost

    socket.on('permissions', permissions);
    socket.on('L1', serverMsg);
}

function draw() {
    if (login !=login0){
        for (let i = 0; i < 1; i++){
           socket.emit('login', login); 
        }
        login0 = login;
    }
}

function drawAvg(coords){
    background(255);
    fill(255,0,255);
    if (coords.avgX != 0 && coords.avgY != 0){
        ellipse(width * coords.avgX, height * coords.avgY, 20,20);
    }
}

function serverMsg(incomingData){
    drawAvg(incomingData);
//    newDrawing(incomingData);
    socket2.emit('L2', incomingData); //send data to localserver.js from whichever node is connected
}

function permissions(incomingData){
    parent = incomingData.isParent;
    if (parent){
        console.log("login");
    }
    if (!incomingData.pwdBool){
        login = "";
        login0 = "";
        console.log("logout");
    }
}

//function newDrawing(incomingData){ //draw from other sockets' coordinates and color
//    fill(incomingData.color[0],incomingData.color[1],incomingData.color[2]);
//    ellipse(incomingData.x*width, incomingData.y*height, 5,5);
//}

function mouseDragged(){ //draw own ellipses to screen
    if(parent){
        fill(color[0], color[1], color[2]);
        ellipse(mouseX, mouseY,5,5);
        data.x = mouseX/width;
        data.y =  mouseY/height;
        data.color = color;
        socket.emit('mouse', data); //name and apply data to message and send via socket
    }
}

function mouseReleased(){ //draw own ellipses to screen
    if(parent){
        data.x = 0;
        data.y =  0;
        data.color = color;
        socket.emit('mouse', data); //name and apply data to message and send via socket
    }
}
