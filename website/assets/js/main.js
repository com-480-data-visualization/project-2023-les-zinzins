
// Violin plot /////////////////////////////////////////////////////////////////////////////////////////

function drawPlot(timePeriod) {
    d3.csv("../all_data.csv").then(function(data) {
        let processedData = data
            .filter(d => +d.realSum <= 1000 && d.time === timePeriod)
            .map(function(d) {
                return {
                    realSum: +d.realSum,  // '+' is used to convert string to number
                    time: d.time,
                    city: d.city.charAt(0).toUpperCase() + d.city.slice(1)
                };
            });
    console.log('processedData violin plot:', processedData);

    function unpack(rows, key) {
        return rows.map(function(row) { return row[key]; });
    }

    var data = [{
        type: 'violin',
        x: unpack(processedData, 'city'),
        y: unpack(processedData, 'realSum'),
        points: 'none',
        box: {
            visible: true
        },
        line: {
            color: 'green',
        },
        meanline: {
            visible: true
        },
        transforms: [{
            type: 'groupby',
            groups: unpack(processedData, 'city'),
            styles: [
                {target: 'Paris', value: {line: {color: 'orange'}}},
                {target: 'Amsterdam', value: {line: {color: 'orange'}}},
                {target: 'Berlin', value: {line: {color: 'orange'}}},
                {target: 'Barcelona', value: {line: {color: 'orange'}}},
                {target: 'Budapest', value: {line: {color: 'orange'}}},
                {target: 'Lisbon', value: {line: {color: 'orange'}}},
                {target: 'Rome', value: {line: {color: 'orange'}}},
                {target: 'Vienna', value: {line: {color: 'orange'}}},
                {target: 'Athens', value: {line: {color: 'orange'}}},
                {target: 'London', value: {line: {color: 'orange'}}}
            ]
        }]
    }] 

    var layout = {
        title: "Multiple Traces Violin Plot",
        yaxis: {
          zeroline: false,
          range: [0, 1000] 
        },
        autosize: false,
        width: 800,
        height: 400,
        showlegend: false
      }
      

    Plotly.newPlot('myDiv', data, layout);

    }).catch(function(error) {
        console.log(error);
    });
}

// Call the function at the beginning to draw the initial plot
drawPlot('weekdays');


// Radar chart /////////////////////////////////////////////////////////////////////////////////////////

var marksCanvas = document.getElementById("marksChart");

d3.csv("../all_data.csv").then(data => {
    // Preprocessing: calculate the mean distance to the center and to the metro for each city
    const cityGroups = d3.group(data, d => d.city);

    const labels = Array.from(cityGroups.keys()).map(city => city.charAt(0).toUpperCase() + city.slice(1));
    const distData = Array.from(cityGroups.values()).map(values => d3.mean(values, v => v.dist));
    const metroDistData = Array.from(cityGroups.values()).map(values => d3.mean(values, v => v.metro_dist));

    var marksData = {
        labels: labels,
        datasets: [{
            label: "Distance to the center [km]",
            backgroundColor: "rgba(200,0,0,0.2)",
            data: distData
        }, {
            label: "Distance to the metro [km]",
            backgroundColor: "rgba(0,0,200,0.2)",
            data: metroDistData
        }]
    };

    var radarChart = new Chart(marksCanvas, {
        type: 'radar',
        data: marksData
    });
}).catch(error => {
    console.log(error);
});


// Tree map graph /////////////////////////////////////////////////////////////////////////////////////////


// Function to load CSV data
function loadCSVData(url, callback) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: function (results) {
            callback(results.data);
        }
    });
}

// Function to generate treemaps for provided cities
function generateTreemaps(cities) {
    loadCSVData('data/tree_map.csv', function (data) {
        cities.forEach(function (city, index) {
            var cityData = data.filter(item => item.city === city.toLowerCase());

            var treemapData = [{
                type: 'treemap',
                labels: cityData.map(item => item.person_capacity),
                parents: cityData.map(() => city),
                values: cityData.map(item => parseFloat(item.count)),
                textinfo: 'label+value+percent root',
                marker: {
                    colors: cityData.map(item => item.person_capacity === 'Couple' ? '#1f77b4' :
                        item.person_capacity === 'Family' ? '#ff7f0e' : '#2ca02c')
                }
            }];

            var layout = {
                autosize: true
                // Removed title
            };

            Plotly.newPlot(`treemap-${index + 1}`, treemapData, layout);
        });
    });
}

function clearTreemaps() {
    ['treemap-1', 'treemap-2', 'treemap-3', 'treemap-4', 'treemap-5'].forEach(function (id) {
        Plotly.purge(id);
    });
}

document.getElementsByName('category').forEach(function (radio) {
    radio.addEventListener('change', function () {
        clearTreemaps();

        if (this.value === 'Group') {
            generateTreemaps(['Athens', 'Lisbon']);
        } else if (this.value === 'Family') {
            generateTreemaps(['Vienna', 'Rome', 'Budapest']);
        } else if (this.value === 'Couple') {
            generateTreemaps(['Paris', 'London', 'Berlin', 'Barcelona', 'Amsterdam']);
        }
    });
});

generateTreemaps(['Paris', 'London', 'Berlin', 'Barcelona', 'Amsterdam']);


// geographic map /////////////////////////////////////////////////////////////////////////////////////////

// position: longitude, latitude
const city_coords = [
    { "name": "london", 'position': [-0.118092, 51.509865] },
    { "name": "berlin", 'position': [13.404954, 52.520008] },
    { "name": "amsterdam", 'position': [4.899431, 52.379189] },
    { "name": "paris", 'position': [2.349014, 48.864716] },
    { "name": "rome", 'position': [12.496366, 41.902782] },
    { "name": "barcelona", 'position': [2.154007, 41.390205] },
    { "name": "budapest", 'position': [19.040236, 47.497913] },
    { "name": "athens", 'position': [23.727539, 37.983810] },
    { "name": "lisbon", 'position': [-9.142685, 38.736946] },
    { "name": "vienna", 'position': [16.363449, 48.210033] },
]

class MapPlot {
    constructor(svg_element_id) {
        this.svg = d3.select('#' + svg_element_id);

        // may be useful for calculating scales
        const svg_viewbox = this.svg.node().viewBox.animVal;
        this.svg_width = svg_viewbox.width;
        this.svg_height = svg_viewbox.height;


        const map_promise = d3.json("data/europe_topo.json").then((topojson_raw) => {
            return topojson.feature(topojson_raw, topojson_raw.objects.continent_Europe_subunits);
        });

        const cities_rain_promise = d3.csv("data/cities_rain_data_2022.csv").then((rain_data) => {
            // preprocess rain data here

            // type conversion and parsing
            rain_data = rain_data.map(function (line) {

                return {
                    city: line.city,
                    rain_hours: JSON.parse(line.rain_hours)
                }
            });

            return rain_data;
        });


        Promise.all([map_promise, cities_rain_promise]).then((results) => {
            let topology = results[0];
            let map_data = topology.features;

            let cities_rain_data = results[1];

            const get_sunny_days = function (d) {
                // radius proportional to the number of sunny days
                // where the rain hours = 0
                return cities_rain_data
                    .find(item => item.city === d.name)
                    .rain_hours
                    .filter(d => d <= 1.0)
                    .length;
            }

            console.log('Data loaded');

            const map_center = d3.geoCentroid(topology);

            const projection = d3.geoMercator()
                .center(map_center)
                .translate([this.svg_width * 0.7, this.svg_height * 0.2])
                .scale(800);

            const radius_scale = d3.scaleSqrt()
                .domain(d3.extent(city_coords.map(d => get_sunny_days(d)))) // get min and max of sunny days
                .range([10, 20]);

            // to draw the countries
            const path_generator = d3.geoPath(projection);


            // Draw the lands
            this.svg.selectAll("path")
                .data(map_data)
                .enter()
                .append("path")
                .attr("class", "country-path")
                .attr("d", path_generator);

            // Draw the city labels
            this.svg.selectAll("text.country-label")
                .data(city_coords)
                .enter()
                .append("text")
                .attr("class", "country-label")
                .text(d => capitalize(d.name))
                .attr("transform", d => `translate(
                    ${projection(d.position)[0]},
                    ${projection(d.position)[1] - radius_scale(get_sunny_days(d)) - 3}  
                )`);  // Translate the label of the city above the circle

            // Create tooltip group
            let tooltip = d3.select("body")
                .append("div")
                .style("position", "absolute")
                .style("z-index", "10")
                .style("visibility", "hidden")
                .style("background", "#fff")
                .style("padding", "5px")
                .text("a simple tooltip");


            // Draw the city points
            this.svg.selectAll("circle")
                .data(city_coords)
                .enter()
                .append("circle")
                .attr("class", "city")
                .attr("cx", d => projection(d.position)[0])
                .attr("cy", d => projection(d.position)[1])
                .attr("r", d => radius_scale(get_sunny_days(d)))
                .on("mouseover", function (event, d) {
                    tooltip.style("visibility", "visible").text(d.name);

                    d3.select(this)
                        .style("stroke", "black")
                        .style("opacity", 1);
                })
                .on("mousemove", function (event, d) {
                    tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
                })
                .on("mouseleave", function () {
                    tooltip.style("visibility", "hidden");
                    d3.select(this)
                        .style("stroke", "none")
                        .style("opacity", 0.8);
                });
        });
    }
}

// Function to capitalize the first letter of a word
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


// wait for the document to load
function whenDocumentLoaded(action) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", action);
    } else {
        // `DOMContentLoaded` already fired
        action();
    }
}

whenDocumentLoaded(() => {
    map_plot_object = new MapPlot('map-plot');
    // plot object is global, you can inspect it in the dev-console
});

