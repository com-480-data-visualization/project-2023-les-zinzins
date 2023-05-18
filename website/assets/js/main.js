
// Violin plot /////////////////////////////////////////////////////////////////////////////////////////


class ViolinPlot {
    constructor(svg_element_id, csv_file_path) {
        // Define SVG dimensions if not already set in CSS
        const width = 500;  // adjust width as necessary
        const height = 500;  // adjust height as necessary

        // Create the SVG for the violin plot
        this.svg = d3.select('#' + svg_element_id)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Load the data and create the plot
        d3.csv(csv_file_path).then(data => {
            console.log(data);

            // // Filter the data for only weekends
            // const weekendData = data.filter(d => d.time === "weekends");
            // console.log(weekendData);

            // Group the data by city
            const groupedData = d3.group(weekendData, d => d.city);
            console.log(groupedData);

            // Calculate the summary statistics for each city (min, max, and quartiles)
            const summaryStatistics = Array.from(groupedData, ([city, values]) => ({
                city,
                min: d3.min(values, d => +d.realSum),
                q1: d3.quantile(values.map(d => +d.realSum).sort(d3.ascending), 0.25),
                median: d3.median(values, d => +d.realSum),
                q3: d3.quantile(values.map(d => +d.realSum).sort(d3.ascending), 0.75),
                max: d3.max(values, d => +d.realSum),
            }));

            // Set the scales
            const xScale = d3.scaleBand()
                .range([0, width])  // adjust range to match width of SVG
                .domain(summaryStatistics.map(d => d.city))
                .padding(0.05);
            const yScale = d3.scaleLinear()
                .range([height, 0])  // adjust range to match height of SVG
                .domain([0, d3.max(summaryStatistics, d => d.max)]);

            // Create the area generator for the violins
            const areaGenerator = d3.area()
                .x0(d => xScale(d.city) - d.q3)
                .x1(d => xScale(d.city) + d.q3)
                .y(d => yScale(d.median))
                .curve(d3.curveCatmullRom);

            // Draw the violins
            this.svg.selectAll('.violin')
                .data(summaryStatistics)
                .enter()
                .append('path')
                .attr('class', 'violin')
                .attr('d', areaGenerator)
                .attr('fill', '#69b3a2');  // change to desired color
        });
    }
}


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
    violin_plot_object = new ViolinPlot('violin-plot', '../all_data.csv'); 
});

