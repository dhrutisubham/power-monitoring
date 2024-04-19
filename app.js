const http = require('http');
const fs = require('fs');
const index = fs.readFileSync('./index.html');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const io = require('socket.io');
// var socket = io(); // Establish a connection to the server




let availablePorts = [];
let isConnected = false;
let current;
retrieveTotalDataFromFile();
// Function to detect available COM ports excluding COM3 and COM4
function detectPorts() {
    SerialPort.list().then(ports => {
        availablePorts = ports
            .filter(port => port.path !== 'COM3' && port.path !== 'COM4')
            .map(port => port.path);
        // console.log('Available ports:', availablePorts);
        if (availablePorts.length === 0) {
            isConnected = false;
            noConnections();
        }
        if (availablePorts.length > 0 && (!isConnected || current !== availablePorts[0])) {
            isConnected = true;
            connectToAvailablePort();
        }
    }).catch(err => {
        console.error('Error listing ports:', err);
    });
}

// Function to connect to the first available port
function connectToAvailablePort() {
    current = availablePorts[0];
    const port = new SerialPort({
        path:availablePorts[0],
        baudRate: 9600,
        dataBits: 8,
        parity: 'none',
        stopBits: 1,
        flowControl: false
    });

    const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

    parser.on('data', function(data) {
        // Save data to file
        saveToFile(data);
        // Emit data to clients
        socketServer.emit('data', data);
    });

    console.log('Connected to port:', availablePorts[0]);
}



// Function to handle no connections
function noConnections() {
    var data = 'No Connections';
    data=0;
    socketServer.emit('data', data);
    socketServer.emit('totalData', totalData);
}

// Create HTTP server
const server = http.createServer((req, res) => {
    if (req.url === '/client.js') {
        res.writeHead(200, {'Content-Type': 'text/javascript'});
        fs.createReadStream(__dirname + '/client.js').pipe(res);
    } else if(req.url ==='/styles.css') {
        res.writeHead(200, {'Content-Type': 'text/css'});
        fs.createReadStream(__dirname + '/styles.css').pipe(res);
    } else if(req.url ==='/simple-line-icons_power.svg') {
        res.writeHead(200, {'Content-Type': 'image/svg+xml'});
        fs.createReadStream(__dirname + '/simple-line-icons_power.svg').pipe(res);
    } else if(req.url ==='/simple-line-icons_energy.svg') {
        res.writeHead(200, {'Content-Type': 'image/svg+xml'});
        fs.createReadStream(__dirname + '/simple-line-icons_energy.svg').pipe(res);
    }    
    else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        fs.createReadStream(__dirname + '/index.html').pipe(res);
    }
});

// Create Socket.io server
const socketServer = io(server);

// Listen for client connections
socketServer.on('connection', socket => {
    console.log('Node is listening to port');
    // Modify the event listener for 'clearData' event
socket.on('clearData', function() {
    // Reset the totalData variable to zero
    totalData = 0;
    
    // Write the new totalData to the file
    fs.writeFile('total_data.txt', totalData.toFixed(2), function (err) {
        if (err) {
            console.error('Error saving total data to file:', err);
        } else {
            console.log('Total data saved to file:', totalData);
            
            // Emit an event to the client indicating that data has been cleared
            socket.emit('dataCleared');
        }
    });
});
});

// Start listening on port 3000
server.listen(3000);

// Call detectPorts function initially
detectPorts();

// Set interval to update available ports every 5 seconds
if (availablePorts.length === 0) {
    setInterval(detectPorts, 1000);
}


let totalData = 0;
let currentData=0;
let previousData=0; // Variable to store the running total of data

// Function to save data to a local file and update the areaUnderGraph div
function saveToFile(data) {
    fs.appendFile('graph_data.txt', data + '\n', function (err) {
        if (err) {
            console.error('Error saving to file:', err);
        } else {
            // console.log('Data saved to file:', data);
        }
    });
    // Update the running total
    currentData=parseFloat(data);
    totalData += 0.5*(Math.abs(previousData+currentData))/60; // Assuming data is numeric, convert it to float if necessary
    previousData=currentData;

    // Add more conditions as needed for larger units

    // Periodically write the total to the file
        fs.writeFile('total_data.txt',totalData.toString(), function (err) {
            if (err) {
                console.error('Error saving total data to file:', err);
            } else {
                socketServer.emit('totalData', totalData);
            }
        });
    // }
}


function retrieveTotalDataFromFile() {
    fs.readFile('total_data.txt', 'utf8', function (err, data) {
        if (err) {
            console.error('Error reading total data from file:', err);
        } else {
            // Parse the data as a float
            totalData = parseFloat(data);
            console.log('Total data retrieved from file:', totalData);
            // Now you can use totalData for further calculations or display
        }
    });
}






