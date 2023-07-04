//Global variable here
var spotify_data

//initialize some margin
const margin = {top: 60, right: 100, bottom: 100, left: 100}

//get the dimension of svg from the html, same for both chart
var dimension = d3.select('svg');
const width = +dimension.style('width').replace('px',''); 
const height = +dimension.style('height').replace('px','');

//initialize the size
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin["top"] - margin.bottom;


// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', function () {
    // Hint: create or set your svg element inside this function
     
    // This will load your two CSV files and store them into two arrays.
    Promise.all([d3.csv('data/songs_normalize.csv')])
         .then(function (values) {
            
            console.log('loaded spotify data');
            spotify_data = values[0];

            console.log(spotify_data)
            drawBubbleChart()
            drawLineChart()
         });
 });


 function drawBubbleChart(){

    //select the svg and give it some margin
    const svg = d3.select('#bubble_svg').append('g')

    //count the occurence of each genre
    var genre_map = {}
    spotify_data.forEach(function(d){
        if(genre_map[d["genre"]] === undefined) genre_map[d["genre"]] = 1
        else  genre_map[d["genre"]]++
    })

    //map the object to chartable object
    const ready_data = Object.entries(genre_map).map(([key,value]) => ({
        genre:key,
        count : +value
    }))
    // console.log(ready_data)

    //set the color scale using schemeSet3 is an array with 9 color
    const color = d3.scaleOrdinal(d3.schemeSet1)

    //generate n number of color, but since we need 60 color so many color will look very close.
    // does it matter?
    color_set = [];
    var N = 60;
    var base = 3;
    var saturation = 0.8;
    var lightnessMin = 0.3;
    var lightnessMax = 0.7;
    var lightnessDecay = 20;
    var tmp = "";
    var hue, lightness;
    for (var i=0; i < N; i++) {
        tmp = i.toString(base).split("").reverse().join("");
        // console.log(tmp);
        hue = 360 * parseInt(tmp, base) / Math.pow(base, tmp.length);
        lightness = lightnessMin + (lightnessMax - lightnessMin) * (1 - Math.exp(-i/lightnessDecay));
        color_set.push({h: hue, s: saturation, l: lightness, code: tmp});

    }


    //scale size for each genre
    const size = d3.scaleLinear().domain([0, 450]).range([20,120])//circle will be size between 7 to 55px

    //create a hidden div for tooltip
    var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute")

    //initialize the circle
    var my_circles = svg.append("g")
    .selectAll("circle")
    .data(ready_data)
    .join("circle")
    .attr("class", "my_circles")
    .attr("r", d => size(d.count))
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .style("fill", function(d,i){ return color(d["genre"])}) //assign different color for each genre
    // .style("fill", function(d,i){ //use this when want every genre have different color
    //     var test = color_set[i]
    //     var color = d3.hsl(test.h, test.s, test.l)
    //     // console.log(d3.hsl(test.h, test.s, test.l))
    //     return color
    //  })
    .style("fill-opacity", 0.8)
    .attr("stroke", "black")
    .style("stroke-width", 1)
    .on("mouseover", function(event, d){ 
        tooltip.transition()
        .duration(200)
        .style("opacity", 1)})
    .on("mousemove", function(event,d){
        tooltip
        .html('<u>' + d["genre"] + '</u>' + "<br>" + d.count)
        .style("left", (event.x +20) + "px") // x and y coordinates of the mouse
        .style("top", (event.y -60) + "px");
    })
    .on("mouseleave", function(d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", 0);
    })
    .call(d3.drag() // call specific function when circle is dragged
        .on("start", function(event, d){
            if (!event.active) simulation.alphaTarget(.03).restart();
            d.fx = d.x;
            d.fy = d.y;
        })
        .on("drag", function(event, d){
            d.fx = event.x;
            d.fy = event.y;
        })
        .on("end", function(event, d){
            if (!event.active) simulation.alphaTarget(.03);
            d.fx = null;
            d.fy = null;
        }));

    // Features of the forces applied to the nodes:
    const simulation = d3.forceSimulation()
    .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
    .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
    .force("collide", d3.forceCollide().strength(.2).radius(function(d){ return (size(d.count)+3) }).iterations(1)) // Force that avoids circle overlapping

    // Apply these forces to the nodes and update their positions.
    // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
    simulation
    .nodes(ready_data)
    .on("tick", function(d){
        my_circles
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
    });

 }


 function drawLineChart(){
    //select the svg and give it some margin
    const svgg = d3.select('#line_svg').append('g').attr("transform", `translate(${margin.left}, ${margin.top})`)

    //add x-axis
    const x = d3.scaleTime().domain([new Date(1998,0,0), new Date(2020,0,0)]).range([0, innerWidth]);
    svgg.append("g").attr("transform", "translate(0,"+ innerHeight +")").call(d3.axisBottom(x));

    //add y-axis
    const y = d3.scaleLinear().domain([0, 1]).range([innerHeight,0])
    svgg.append("g").call(d3.axisLeft(y))


    // year_map: { 
    //      year: {
    //         count:occurence of the year,
    //         energy: sum of energy of the year, 
    //         liveness: sum of lieveness of the year
    //         }
    //  }
    var year_map = {}
    spotify_data.forEach(function(d){
        if(year_map[d["year"]] === undefined){
            year_map[d["year"]] = {count:1, energy: +d["energy"], liveness: +d["liveness"]}
        }else{
            //for using average for each year
            var count = year_map[d["year"]]["count"] + 1
            var energy = year_map[d["year"]]["energy"] + (+d["energy"])
            var liveness = year_map[d["year"]]["liveness"] + (+d["liveness"])

            //for using the max value for each year
            // var count = year_map[d["year"]]["count"] + 1
            // var energy = Math.max(year_map[d["year"]]["energy"], (+d["energy"]))
            // var liveness = Math.max(year_map[d["year"]]["liveness"], (+d["liveness"]))

            year_map[d["year"]] = {
                count: count,
                energy: energy, 
                liveness: liveness
            }
        }
    })

    //map the object to chartable objects
    const ready_data = Object.entries(year_map).map(([key,value]) => ({
        year:key,

        //if use average as a data point
        energy : value["energy"]/value["count"] ,
        liveness: value["liveness"]/value["count"] ,

        //if use max as data point
        // energy : value["energy"] ,
        // liveness: value["liveness"] ,
    }))

    //add the first line "energy"
    svgg.append("path")
    .datum(ready_data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
        .x(function(d){return x(new Date(d["year"],0,0))})
        .y(function(d){return y(+d["energy"]) })
    )

     //add second line "liveness"
     svgg.append("path")
     .datum(ready_data)
     .attr("fill", "none")
     .attr("stroke", "red")
     .attr("stroke-width", 1.5)
     .attr("d", d3.line()
         .x(function(d){return x(new Date(d["year"],0,0))})
         .y(function(d){return y(+d["liveness"]) })
     )




 }