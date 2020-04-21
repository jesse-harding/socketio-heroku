//terminal: npm init
//add dependencies in package.json
    //terminal: npm install express --save
//make folder named "public" in project dir
//terminal: npm install socket.io --save (will add other dependency to package.json)
//add socket library to client html, add socket object to client js
//heroku info: https://devcenter.heroku.com/articles/git#deploying-code
//https://devcenter.heroku.com/articles/getting-started-with-nodejs
//git init in project folder
//git add *.js
//git commit -m 'comment'
//git push nodejs_0 master
//heroku ps:scale web=1
//heroku open
//heroku logs --tail

let express = require('express'); //add the express package/libary
let app = express(); //trigger express function
let port = process.env.PORT;  //heroku implementation w/ catch for localhost

if (port == null || port == "") {
    port = 3000;
}

let server = app.listen(port);
app.use(express.static('public')); //post contents of "public" dir to server
let socket = require('socket.io'); //add the socket.io package/library
let io = socket(server); //create socket object that is part of the server on port 3000
io.sockets.on('connection', newConnection); //check for new connection

//store client information to be parsed and sent to localhost
let avgArray = [];
let color = [];

let maxParticipants = 16; //****change this later****
for (let i = 0; i < maxParticipants; i++){
    avgArray[i] = [];
    avgArray[i][0] = 0;
    avgArray[i][1] = 0;
}

var tempData = {    //make password & parent object to send
    x: 0,
    y: 0,
    id: "",
    num: 0,
    num2: 0,
    avgX: 0,
    avgY : 0,
    color: color
}

var serverMsg = {
//    x: 0,
//    y: 0,
    avgX: 0,
    avgY : 0,
//    color: color
}

//object to hold averaged data to be sent out.
let avgOut = {
    x: 0,
    y: 0
}

let parent=""; //initialize variable to hold parent socket id

let permissions = {    //make permissions object to send
        pwdBool: false,
        isParent: true
    }

let allClients = [];

function newConnection(socket){ //triggered when there is a new connection / message sent
    
    allClients.push(socket.id);
    socket.on('disconnect', function() {
        var i = allClients.indexOf(socket.id);
        allClients.splice(i, 1);
    });

    socket.on('mouse', mouseMsg); //look into why this is inside of the function
    socket.on('login', loginEvent);
    
    function mouseMsg(mouseData){ //why declared inside newConnection function?
        if (!permissions.pwdBool || socket.id == parent){ //if message from parent or !password mode, send data
            
            unitCoordConstrain(mouseData);
            
            tempData.x = mouseData.x;
            tempData.y = mouseData.y;
            tempData.id = socket.id;
            tempData.num = allClients.indexOf(socket.id);
            tempData.num2 = allClients.length;
            tempData.color = mouseData.color;  
            calcAvg(tempData);
            serverMsg.avgX = tempData.avgX;
            serverMsg.avgY = tempData.avgY;
            io.sockets.emit('L1', serverMsg);
        }
    }
    
    function loginEvent(loginInfo){ //compare sent variable to password to define parent node
        if (loginInfo == "password!"){
            parent = socket.id;
            console.log("login successful, id: " + parent);
            permissions.pwdBool = true;
            permissions.isParent = false;
            io.sockets.emit('permissions', permissions);
            permissions.isParent = true;
            io.to(parent).emit('permissions', permissions);//sets parent status by id of successful login
        }
        if (loginInfo == "0"){ // removed '&& socket.id == parent' from conditional
            console.log("logout successful");
            permissions.pwdBool = false;
            permissions.isParent = true;
            io.sockets.emit('permissions', permissions);
            parent = "";
        }
    }
    
    function calcAvg(incomingData){ //why declared inside newConnection function?
        
        //sets unused client data in array to 0,0
        if (avgArray.length > incomingData.num2){
            for (let i = incomingData.num2; i < avgArray.length; i++){
                avgArray[i][0]=0;
                avgArray[i][1]=0;
            }
        }

        if (incomingData.num < avgArray.length){
            avgArray[incomingData.num][0] = incomingData.x;
            avgArray[incomingData.num][1] = incomingData.y;
        }
        
        let tempCount = 0;
        avgOut.x = 0;
        avgOut.y = 0;
        for (let i = 0; i < incomingData.num2; i++){
            avgOut.x += avgArray[i][0];
            avgOut.y += avgArray[i][1];
            if (avgArray[i][0] != 0 && avgArray[i][1] != 0){
                tempCount++;
            }
        }
        
        if (tempCount != 0){
            avgOut.x = avgOut.x / tempCount;
            avgOut.y = avgOut.y / tempCount;
        }
        tempData.avgX = avgOut.x;
        tempData.avgY = avgOut.y;
    }    
}

function unitCoordConstrain(input){
    if (input.x != 0 && input.y != 0){
        if (input.x > 1){
            input.x = 1;
        }
        if (input.x < 0.001){
            input.x = 0.001;
        }
        if (input.y > 1){
            input.y = 1;
        }
        if (input.y < 0.001){
            input.y = 0.001;
        } 
        return input;
    }
}