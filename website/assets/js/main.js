// Tree map graph

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

/// Load the CSV data
loadCSVData('data/tree_map.csv', function (data) {
    // Filter data for the city Athens
    var cityDataAthens = data.filter(item => item.city === 'athens');

    // Prepare data for the Athens treemap
    var treemapDataAthens = [{
        type: 'treemap',
        labels: cityDataAthens.map(item => item.person_capacity),
        parents: cityDataAthens.map(() => 'athens'),
        values: cityDataAthens.map(item => parseFloat(item.count)),
        textinfo: 'label+value+percent root',
        marker: {
            colors: cityDataAthens.map(item => item.person_capacity === 'Couple' ? '#1f77b4' :
                item.person_capacity === 'Family' ? '#ff7f0e' : '#2ca02c')
        }
    }];

    // Layout for the Athens treemap
    var layoutAthens = {
        autosize: true,
        title: 'Person Capacity in Athens',
    };

    // Generate the Athens treemap
    Plotly.newPlot('treemap-athens', treemapDataAthens, layoutAthens);

    // Filter data for the city Lisbon
    var cityDataLisbon = data.filter(item => item.city === 'lisbon');

    // Prepare data for the Lisbon treemap
    var treemapDataLisbon = [{
        type: 'treemap',
        labels: cityDataLisbon.map(item => item.person_capacity),
        parents: cityDataLisbon.map(() => 'lisbon'),
        values: cityDataLisbon.map(item => parseFloat(item.count)),
        textinfo: 'label+value+percent root',
        marker: {
            colors: cityDataLisbon.map(item => item.person_capacity === 'Couple' ? '#1f77b4' :
                item.person_capacity === 'Family' ? '#ff7f0e' : '#2ca02c')
        }
    }];

    // Layout for the Lisbon treemap
    var layoutLisbon = {
        autosize: true,
        title: 'Person Capacity in Lisbon',
    };

    // Generate the Lisbon treemap
    Plotly.newPlot('treemap-lisbon', treemapDataLisbon, layoutLisbon);
});



// geographic map

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

