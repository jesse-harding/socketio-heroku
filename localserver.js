var express = require('express'); //add the express package/libary
var app = express(); //trigger express function
let port = 3000;
var server = app.listen(port);
app.use(express.static('public')); //post contents of "public" dir to server
var socket = require('socket.io'); //add the socket.io package/library
var io = socket(server); //create socket object that is part of the server on port 3000
io.sockets.on('connection', newConnection); //check for new connection

var serialport = require('serialport'); //
let portList = [];
let portIndex;
let regex = "Arduino";
let myPort;

let color = [];

let tempData = {    //make password & parent object to send
//    x: 0,
//    y: 0,
//    id: "",
//    num: 0,
//    num2: 0,
    avgX: 0,
    avgY : 0,
//    color: color
}

function newConnection(socket){ //triggered when there is a new connection / message sent 
    socket.on('L2', incomingMsg); //look into why this is inside of the function
    function incomingMsg(incomingData){ //why declared inside newConnection function?   
//        console.log(incomingData);
        tempData = incomingData;
    }
}

serialConnect();

function serialConnect() {
    let i = 0;
    serialport.list().then(
        ports => {
            ports.forEach(port => {
                portList[i] = `${port.path}`;
                if (`${port.manufacturer}`.match(regex)){
                    console.log(i);
                    myPort = new serialport(portList[i], 9600);// open the port
                    console.log(portList);
                    myPort.on('open', serialSend); // called when the serial port opens
                    console.log('port open');
                }
                i++;
            })  
        },
        err => {
            console.error('Error listing ports', err)
        }
    )
}

let prevData = 0;

function serialSend() {    
    var brightness = 0; // the brightness to send for the LED
    function sendData() {
         // convert the value to an ASCII string before sending it:
//        if (Math.abs(prevData-Math.round(180*tempData.avgX)) < 20){
         myPort.write(Math.round(180*tempData.avgX)+'\n');
//         prevData = Math.round(180*tempData.avgX);
            console.log(Math.round(180*tempData.avgX));
//    }
         
        
//         if (tempData.avgX > .5) {
//              brightness = 1;
//         } else {
//              brightness = 0;
//         }
    }
    // set an interval to update over serial every 20ms:
    setInterval(sendData, 50);
}
