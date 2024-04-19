// Check if graph data exists in local storage
const storedData = localStorage.getItem('graphData');
let graphData = storedData ? JSON.parse(storedData) : { labels: [], datasets: [{ label: 'Data', data: [] }] };


var ctx = document.getElementById('graph1').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'line',
    data: graphData,
    options: {
        plugins: {
            title: {
                display: true,
                text: 'Total Energy Consumed',
            },
        },
        scales: {
            y: {
                display: true,
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Energy (in Wh)'
                }
            }
        },
        elements: {
            point: {
                radius: 0 // Set the point radius to 0 to remove point styles
            },
            line: {
                borderWidth: 1 // Set the border width of the line
            }
        },
        cubicInterpolationMode: 'default',
        animation: {
            duration: 1000, // Animation duration in milliseconds
            easing: 'linear' // Easing function for the animation
        }
    }
});


// Check if graph data exists in local storage for Graph 2
const storedDataGraph2 = localStorage.getItem('graphData2');
let graphData2 = storedDataGraph2 ? JSON.parse(storedDataGraph2) : { labels: [], datasets: [{ label: 'Data', data: [] }] };

var ctx2 = document.getElementById('graph2').getContext('2d');
var myChart2 = new Chart(ctx2, {
    type: 'line',
    data: graphData2,
    options: {
        plugins: {
            title: {
                display: true,
                text: 'Instantaneous Power',
            },
        },
        scales: {
            y: {
                display: true,
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Power (in W)'
                }
            }
        },
        elements: {
            point: {
                radius: 0 // Set the point radius to 0 to remove point styles
            },
            line: {
                borderWidth: 1 // Set the border width of the line
            }
        },
        cubicInterpolationMode: 'default',
        animation: {
            duration: 1000, // Animation duration in milliseconds
            easing: 'linear' // Easing function for the animation
        }
    }
});

// Update the graph with received data for Graph 2
function updateGraph2(data) {
    myChart2.data.labels.push('');
    myChart2.data.datasets[0].data.push(data);
    localStorage.setItem('graphData2', JSON.stringify(myChart2.data));
    myChart2.update();
    document.getElementById('instantaneousPower').innerHTML = data+ ' W';

}






// Update the graph with received data
function updateGraph(data) {
    myChart.data.labels.push('');
    myChart.data.datasets[0].data.push(data);
    localStorage.setItem('graphData', JSON.stringify(myChart.data));
    myChart.update();

}

var socket = io();

socket.on('totalData', function(totalData) {
    updateAreaUnderGraph(totalData);
    updateGraph(totalData);
});


socket.on('data', function(data) {
    updateGraph2(data);
});

// Add event listener for 'dataCleared' event
socket.on('dataCleared', function() {
    // Clear the graph
    clearGraph();
    clearGraph2();
});

// Function to clear the graph
function clearGraph() {
    // Clear the graph data
    myChart.data.labels = [];
    myChart.data.datasets[0].data = [];
    
    // Update the graph
    myChart.update();
}

function clearGraph2() {
    myChart2.data.labels = [];
    myChart2.data.datasets[0].data = [];
    myChart2.update();
}




// Add event listener to clear graph data button
document.getElementById('clearGraphData').addEventListener('click', function() {
    socket.emit('clearData'); // Emit clearData event to the server
    
});


// Function to update the area under the graph in the HTML
function updateAreaUnderGraph(data) {
    // Determine the appropriate unit of measurement based on the magnitude of data
    let unit = 'Wh'; // Default unit is Watt-hour

    if (Math.abs(data) >= 1000000) {
        data /= 1000000; // Convert to MWh if data >= 1,000,000
        unit = 'MWh';
    } else if (Math.abs(data) >= 1000) {
        data /= 1000; // Convert to kWh if data >= 1,000
        unit = 'kWh';
    } else if (Math.abs(data) < 1) {
        data *= 1000; // Convert to milliWh if data < 1
        unit = 'mWh';
    } else if (Math.abs(data) < 0.00001) {
        data *= 1000000; // Convert to microWh if data < 0.001
        unit = 'µWh';
    }
    else{
        unit = 'Wh';

    }
    // Add more conditions as needed for larger units

    document.getElementById('areaUnderGraph').innerHTML = data.toFixed(2) + ' ' + unit; // Display total data with unit in the div
}

// Function to handle no connections
function noConnections() {
    var data = 'No Connections';
    updateGraph(data);
}


