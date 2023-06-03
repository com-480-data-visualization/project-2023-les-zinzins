
// Violin plot /////////////////////////////////////////////////////////////////////////////////////////

function drawPlot(timePeriod) {
    d3.csv("../all_data.csv").then(function (data) {
        let processedData = data
            .filter(d => +d.realSum <= 4000 && d.time === timePeriod)
            .map(function (d) {
                return {
                    realSum: +d.realSum,  // '+' is used to convert string to number
                    time: d.time,
                    city: d.city.charAt(0).toUpperCase() + d.city.slice(1)
                };
            });
        // console.log('processedData violin plot:', processedData);

        function unpack(rows, key) {
            return rows.map(function (row) { return row[key]; });
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
                color: 'blue',
            },
            meanline: {
                visible: true
            },
            transforms: [{
                type: 'groupby',
                groups: unpack(processedData, 'city'),
                styles: [
                    { target: 'Paris', value: { line: { color: '#A3E1DD' } } },
                    { target: 'Amsterdam', value: { line: { color: '#BF4342' } } },
                    { target: 'Berlin', value: { line: { color: '#A3E1DD' } } },
                    { target: 'Barcelona', value: { line: { color: '#BF4342' } } },
                    { target: 'Budapest', value: { line: { color: '#BF4342' } } },
                    { target: 'Lisbon', value: { line: { color: '#A3E1DD' } } },
                    { target: 'Rome', value: { line: { color: '#BF4342' } } },
                    { target: 'Vienna', value: { line: { color: '#A3E1DD' } } },
                    { target: 'Athens', value: { line: { color: '#A3E1DD' } } },
                    { target: 'London', value: { line: { color: '#BF4342' } } }
                ]
            }]
        }]

        var layout = {
            title: `Distribution of prices on ${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}`,
            yaxis: {
                zeroline: false,
                range: [0, 800],
                title: {
                    text: 'Price in Euros',
                }
            },
            autosize: false,
            width: 1050,
            height: 450,
            showlegend: false
        }



        Plotly.newPlot('violinChartDiv', data, layout);

    }).catch(function (error) {
        console.log(error);
    });
}

// Call the function at the beginning to draw the initial plot
drawPlot('weekdays');

// Add an event listener to the checkbox
document.getElementById('timeToggle').addEventListener('change', function () {
    if (this.checked) {
        drawPlot('weekends');
    } else {
        drawPlot('weekdays');
    }
});

// Radar chart /////////////////////////////////////////////////////////////////////////////////////////

var marksCanvas = document.getElementById("radarChartDiv");

d3.csv("../all_data.csv").then(data => {
    // Preprocessing: calculate the mean distance to the center and to the metro for each city
    const cityGroups = d3.group(data, d => d.city);

    const labels = Array.from(cityGroups.keys()).map(city => city.charAt(0).toUpperCase() + city.slice(1));
    const distData = Array.from(cityGroups.values()).map(values => d3.mean(values, v => v.dist));
    const metroDistData = Array.from(cityGroups.values()).map(values => d3.mean(values, v => v.metro_dist));

    var marksData = {
        labels: labels,
        datasets: [
            {
                label: "Distance to the metro [km]",
                backgroundColor: "rgba(191, 67, 66, 0.7)",
                data: metroDistData
            }, {
                label: "Distance to the center [km]",
                backgroundColor: "rgba(163, 225, 221, 0.7)",
                data: distData
            }]
    };

    Chart.defaults.font.size = 16;
    var radarChart = new Chart(marksCanvas, {
        type: 'radar',
        data: marksData,
        options: {
            elements: {
                point: {
                    pointRadius: 5,
                }
            },
            scales: {
                r: {
                    pointLabels: {
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });
}).catch(error => {
    console.log(error);
});


// Tree map graph /////////////////////////////////////////////////////////////////////////////////////////

// Function to load CSV data
function loadCSVData(url, callback) {
    // Using Papa.parse library to parse the CSV data from the provided URL
    Papa.parse(url, {
        download: true,
        header: true, // Assuming the CSV file has a header row
        complete: function (results) {
            // Invoke the callback function with the parsed data
            callback(results.data);
        }
    });
}

// Function to generate treemaps based on the cities provided
function generateTreemaps(cities) {
    // Load the CSV data from 'data/tree_map.csv' using the loadCSVData function
    loadCSVData('data/tree_map.csv', function (data) {
        // Iterate over each city in the 'cities' array
        cities.forEach(function (city, index) {
            // Filter the CSV data to obtain the data specific to the current city
            var cityData = data.filter(item => item.city === city.toLowerCase());

            // Define the treemap data object
            var treemapData = [{
                type: 'treemap',
                // Set the labels for each treemap category using the 'person_capacity' property from the cityData
                labels: cityData.map(item => `${item.person_capacity} Airbnbs`),
                // Set the parent categories for each treemap category as the current city name with the string ' Airbnbs'
                parents: cityData.map(() => `${city} Airbnbs`),
                // Set the values/sizes of each treemap category using the 'count' property from the cityData
                values: cityData.map(item => parseFloat(item.count)),
                // Configure the text to be displayed on each treemap category
                textinfo: 'label+value+percent root',
                // Configure the tooltip template for each treemap category
                hovertemplate: '%{label}<br>%{value} Airbnbs<br>%{percentRoot:.2%} of the Airbnbs<extra></extra>',
                // Configure the marker colors for each treemap category based on the 'person_capacity' property
                marker: {
                    colors: cityData.map(item => item.person_capacity === 'Couple' ? '#BF4342' :
                        item.person_capacity === 'Family' ? '#A3E1DD' : '#27444C')
                }
            }];

            // Define the layout options for the treemap
            var layout = {
                margin: {
                    l: 0,
                    r: 0,
                    b: 0,
                    t: 0,
                    pad: 10
                },
                autosize: true
            };

            // Create and render the treemap using Plotly.newPlot
            Plotly.newPlot(`treemap-${index + 1}`, treemapData, layout);
        });
    });
}

// Function to clear the existing treemaps
function clearTreemaps() {
    // Iterate over the array of treemap IDs and perform the following operations for each ID
    ['treemap-1', 'treemap-2', 'treemap-3', 'treemap-4', 'treemap-5'].forEach(function (id) {
        // Purge the treemap using Plotly.purge to remove the existing plot
        Plotly.purge(id);
        // Reset the CSS class of the treemap container to remove any additional styling
        document.getElementById(id).className = '';
    });
}

// Add event listener to the radio buttons with name 'category'
document.getElementsByName('category').forEach(function (radio) {
    radio.addEventListener('change', function () {
        // Clear the existing treemaps using the clearTreemaps function
        clearTreemaps();
        // Generate new treemaps based on the selected category value
        if (this.value === 'Group') {
            generateTreemaps(['Athens', 'Lisbon']);
        } else if (this.value === 'Family') {
            generateTreemaps(['Vienna', 'Rome', 'Budapest']);
        } else if (this.value === 'Couple') {
            generateTreemaps(['Paris', 'London', 'Berlin', 'Barcelona', 'Amsterdam']);
        }
    });
});


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

        const cities_rain_promise = d3.csv("data/cities_rain_2022.csv").then((rain_data) => {
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

        const cities_temps_promise = d3.csv("data/cities_mean_temps_2022.csv").then((temps_data) => {
            // preprocess rain data here

            // type conversion and parsing
            temps_data = temps_data.map(function (line) {

                return {
                    city: line.city,
                    days: JSON.parse(line.days.replaceAll("'", '"')),
                    mean_temps: JSON.parse(line.mean_temps)
                }
            });

            return temps_data;
        });


        Promise.all([map_promise, cities_rain_promise, cities_temps_promise]).then((results) => {
            let topology = results[0];
            let map_data = topology.features;

            let cities_rain_data = results[1];
            let cities_temps_data = results[2];


            const get_sunny_days = function (d) {
                // radius proportional to the number of sunny days
                // where the rain hours = 0
                return cities_rain_data
                    .find(item => item.city === d.name)
                    .rain_hours
                    .filter(d => d == 0.0)
                    .length;


            }

            const map_center = d3.geoCentroid(topology);

            const projection = d3.geoMercator()
                .center(map_center)
                .translate([this.svg_width * 0.7, this.svg_height * 0.2])
                .scale(800);

            const radius_scale = d3.scaleSqrt()
                .domain(d3.extent(city_coords.map(d => get_sunny_days(d)))) // get min and max of sunny days
                .range([8, 25]);

            // Draw legend for circles
            this.svg.append("g")
                .attr("class", "legendSize")
                .attr("transform", "translate(10, 390)");

            let legendSize = d3.legendSize()
                .scale(radius_scale)
                .shape('circle')
                .cells(3)
                .shapePadding(20)
                .labelOffset(15)
                .title("Number of sunny days")
                .labelFormat(d3.format("d"))
                .orient('vertical');

            this.svg.select(".legendSize")
                .call(legendSize);


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
                .append("div").attr("id", "mapTooltip");

            const tooltip_width = 400;
            const tooltip_height = 300;
            const margin = ({ top: 10, right: 20, bottom: 80, left: 50 });

            let tooltip_svg = tooltip
                .append("svg").attr("id", "mapTooltipSVG")
                .attr("viewBox", `0 0 ${tooltip_width} ${tooltip_height}`)
                .attr("width", tooltip_width)
                .attr("height", tooltip_height);

            // Add X axis --> it is a date format
            var x = d3.scaleTime()
                .domain([new Date(2022, 0, 1), new Date(2022, 11, 31)])
                .range([margin.left, tooltip_width - margin.right])
                .nice();


            let xAxis = d3.axisBottom(x)
                .ticks(8);

            tooltip_svg.append("g")
                .attr("transform", `translate(0,${tooltip_height - margin.bottom})`)
                .call(xAxis)
                .selectAll("text")  // rotate the labels
                .style("text-anchor", "end")
                .style("font-size", "1.3em")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");

            // Add Y axis
            var y = d3.scaleLinear()
                .domain([-5, 35])
                .range([tooltip_height - margin.bottom, margin.top]);

            let yAxis = d3.axisLeft(y);

            tooltip_svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(yAxis)
                .selectAll("text")
                .style("font-size", "1.3em");

            tooltip_svg.append("text")
                .attr("class", "y label")
                .attr("text-anchor", "end")
                .attr("x", 0)
                .attr("y", 0)
                .attr("dx", "-80px")
                .attr("dy", ".75em")
                .attr("transform", "rotate(-90)")
                .text("Temperature [°C]");


            // Draw the city points
            this.svg.selectAll("circle.city")
                .data(city_coords)
                .enter()
                .append("circle")
                .attr("class", "city")
                .attr("cx", d => projection(d.position)[0])
                .attr("cy", d => projection(d.position)[1])
                .attr("r", d => radius_scale(get_sunny_days(d)))
                .on("mouseover", drawTooltip(cities_temps_data, x, y))
                .on("mousemove", moveTooltip)
                .on("mouseleave", hideTooltip);
        });
    }
}

const moveTooltip = function (event, d) {
    let tooltip = d3.select("#mapTooltip");

    // for the southern cities, move the tooltip above the cursor
    if (["lisbon", "athens", "barcelona", "rome"].includes(d.name)) {
        tooltip.style("top", (event.pageY - 10 - 300) + "px").style("left", (event.pageX + 10) + "px");
    } else {
        tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
    }
};

const hideTooltip = function () {
    let tooltip = d3.select("#mapTooltip");
    tooltip.style("visibility", "hidden");
    d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8);
};

function drawTooltip(cities_temps_data, x, y) {
    // define closure to access the cities_temps_data and the x and y scales
    return function (event, d) {
        let tooltip = d3.select("#mapTooltip");
        tooltip.style("visibility", "visible");

        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1);

        // get the data
        let city_data = cities_temps_data.filter(item => item.city === d.name)[0];
        let data = city_data.days.map((day, i) => {  // map the days to the mean temps
            return {
                date: day,
                value: city_data.mean_temps[i]
            }
        });

        // format the data
        data = data.map(d => {
            return {
                date: d3.timeParse("%Y-%m-%d")(d.date),
                value: +d.value
            }
        });

        let tooltip_svg = d3.select("#mapTooltipSVG");

        // draw scatterplot of temperatures
        tooltip_svg.selectAll("circle")
            .data(data)
            .join("circle")
            .attr("cx", d => x(d.date))
            .attr("cy", d => y(d.value))
            .attr("r", 2)
            .style("fill", "#3250a8");
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
    generateTreemaps(['Vienna', 'Rome', 'Budapest']);
    map_plot_object = new MapPlot('map-plot');
});

// door opening
window.onload = function () {
    document.querySelector(".continue-button").addEventListener("click", function () {
        let audio = document.getElementById("door");
        audio.play();
    });
}
 


