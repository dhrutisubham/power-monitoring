// Check if graph data exists in local storage
const storedData = localStorage.getItem('graphData');
let graphData = storedData ? JSON.parse(storedData) : { labels: [], datasets: [{ label: 'Data', data: [] }] };

var ctx = document.getElementById('graph').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'line',
    data: graphData,
    options: {
        plugins: {
            title: {
                display: true,
                text: 'Current Graph',
            },
        },
        scales: {
            y: {
                display: true,
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Current'
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

// Calculate area under the graph
function calculateAreaUnderGraph(chart) {
    const data = chart.data.datasets[0].data;
    let area = 0;

    for (let i = 0; i < data.length - 1; i++) {
        const height1 = data[i];
        const height2 = data[i + 1];
        const width = 1; // Assuming each data point represents a unit width
        area += (height1 + height2) / 2 * width; // Calculate trapezoidal area between two consecutive points
    }

    return area;
}


// Function to update the area under the graph in the HTML
function updateAreaUnderGraph(chart) {
    const area = calculateAreaUnderGraph(chart);
    document.getElementById('areaUnderGraph').innerHTML = 'Area under the graph: ' + area.toFixed(2); // Display area with 2 decimal places
}

// Update the graph with received data
// Update the graph with received data
function updateGraph(data) {
    myChart.data.labels.push('');
    myChart.data.datasets[0].data.push(data);
    localStorage.setItem('graphData', JSON.stringify(myChart.data));
    myChart.update();
    updateAreaUnderGraph(myChart); // Update area under the graph when graph is updated

    // Dynamically update area under the graph with new data
    const area = calculateAreaUnderGraph(myChart);
    document.getElementById('areaUnderGraph').innerHTML = 'Area under the graph: ' + area.toFixed(2);
}

var socket = io();

socket.on('data', function(data) {
    updateGraph(data);
    // console.log(data);

    document.getElementById('sample').innerHTML = data;
});

// Function to handle no connections
function noConnections() {
    var data = 'No Connections';
    updateGraph(data);
}

updateAreaUnderGraph(myChart);