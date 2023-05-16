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

// Load the CSV data
loadCSVData('data/tree_map.csv', function (data) {
    // Filter data for the city Athens
    var cityData = data.filter(item => item.city === 'athens');

    // Prepare data for the treemap
    var treemapData = [{
        type: 'treemap',
        labels: cityData.map(item => item.person_capacity),
        parents: cityData.map(() => 'athens'),
        values: cityData.map(item => parseFloat(item.count)),
        textinfo: 'label+value+percent root',
        marker: {
            colors: cityData.map(item => item.person_capacity === 'Couple' ? '#1f77b4' :
                item.person_capacity === 'Family' ? '#ff7f0e' : '#2ca02c')
        }
    }];

    // Layout for the treemap
    var layout = {
        autosize: true,
        title: 'Person Capacity in Athens',
    };

    // Generate the treemap
    Plotly.newPlot('treemap', treemapData, layout);
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
            console.log(topojson_raw);
            return topojson.feature(topojson_raw, topojson_raw.objects.continent_Europe_subunits);
        });


        Promise.all([map_promise]).then((results) => {
            let topology = results[0]
            let map_data = topology.features;

            console.log('Data loaded');

            const map_center = d3.geoCentroid(topology);

            const projection = d3.geoMercator()
                .center(map_center)
                .translate([this.svg_width * 0.7, this.svg_height * 0.2])
                .scale(800);

            // const color_scale = d3.scaleLog()
            //     .domain(d3.extent(cantonId_to_population.map(x => parseInt(x.density))))
            //     .range(["white", "lime"])
            //     .interpolate(d3.interpolateHcl);

            const path_generator = d3.geoPath(projection);

            // Draw the lands
            this.svg.selectAll("path")
                .data(map_data)
                .enter()
                .append("path")
                .attr("class", "country-path")
                .attr("d", path_generator)
                .attr("fill", "#a6e2df");

            // Draw the city labels
            this.svg.selectAll("text")
                .data(city_coords)
                .enter()
                .append("text")
                .attr("class", "country-label")
                .text(d => capitalize(d.name))
                .attr("transform", d => `translate(${projection(d.position)[0]}, ${projection(d.position)[1] - 20})`);

            // Draw the city points
            this.svg.selectAll("circle")
                .data(city_coords)
                .enter()
                .append("circle")
                .attr("class", "city")
                .attr("cx", d => projection(d.position)[0])
                .attr("cy", d => projection(d.position)[1])
                .attr("r", d => d.name.length * 2);

        });
    }
}

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

