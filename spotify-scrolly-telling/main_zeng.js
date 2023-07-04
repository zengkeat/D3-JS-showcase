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

//select the svg and give it some margin
const svg = d3.select('#bubble_svg').append('g')


// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', function () {
    // Hint: create or set your svg element inside this function
     
    // This will load your two CSV files and store them into two arrays.
    Promise.all([d3.csv('data/songs_normalize.csv')])
         .then(function (values) {
            
            console.log('loaded spotify data');
            spotify_data = values[0];

            //filter out the song that release before the year 2000
            spotify_data = spotify_data.filter(function(g){return (parseInt(g.year) >= "2000" && parseInt(g.year) <= "2019")})
            spotify_data = spotify_data.filter(function(g){return ( g.genre != "set()")})
            console.log(spotify_data)

            // backgr()
            makeWaypoints()
         });
 });

 
 function makeWaypoints(){
     var Stacktooltip = d3.select("body").append("div")
         .attr("class", "StackedChartTooltip")
         .style("opacity", 0)
         .style("background-color", "white")
         .style("border", "solid")
         .style("border-width", "2px")
         .style("border-radius", "5px")
         .style("padding", "5px")
         .style("width", "130px")
         .style("position", "absolute")

    new Waypoint({
        element: document.getElementById('BubbleChartStep1'), //Select the trigger element for the correct step
        handler: function(direction) {
            if(direction === 'down'){
                drawBubbleChart(1) //Call the next step of the animation
                // console.log("trigger1")
            } else {
                // console.log("trigger out 1")
                drawBubbleChart(0) //Call the undo step of the previous animation
            }
        },
        offset: '50%' //This indicates how far down the page the trigger should be when activating the step
    });

    new Waypoint({
        element: document.getElementById('BubbleChartStep2'), //Select the trigger element for the correct step
        handler: function(direction) {
            if(direction === 'down'){
                drawBubbleChart(2) //Call the next step of the animation
            } else {
                drawBubbleChart(1) //Call the undo step of the previous animation
            }
        },
        offset: '50%' //This indicates how far down the page the trigger should be when activating the step
    });

    new Waypoint({
        element: document.getElementById('BubbleChartStep3'), //Select the trigger element for the correct step
        handler: function(direction) {
            if(direction === 'down'){
                drawBubbleChart(3) //Call the next step of the animation
                // console.log("trigger3")
            } else {
                // console.log("trigger out 3")
                drawBubbleChart(2) //Call the undo step of the previous animation
            }
        },
        offset: '50%' //This indicates how far down the page the trigger should be when activating the step
    });

    new Waypoint({
        element: document.getElementById('BubbleChartStep4'), //Select the trigger element for the correct step
        handler: function(direction) {
            if(direction === 'down'){
                drawBubbleChart(4) //Call the next step of the animation
                // console.log("trigger4")
            } else {
                // console.log("trigger out 4")
                drawBubbleChart(3) //Call the undo step of the previous animation
            }
        },
        offset: '50%' //This indicates how far down the page the trigger should be when activating the step
    });

    new Waypoint({
        element: document.getElementById('StackedChartStep1'), //Select the trigger element for the correct step
        handler: function(direction) {
            if(direction === 'down'){
                drawStackChart(1) //Call the next step of the animation
                // console.log("trigger4")
            } else {
                // console.log("trigger out 4")
                drawStackChart(0) //Call the undo step of the previous animation
            }
        },
        offset: '50%' //This indicates how far down the page the trigger should be when activating the step
    });

    new Waypoint({
        element: document.getElementById('StackedChartStep2'), //Select the trigger element for the correct step
        handler: function(direction) {
            if(direction === 'down'){
                drawStackChart(2) //Call the next step of the animation
                // console.log("trigger4")
            } else {
                // console.log("trigger out 4")
                drawStackChart(1) //Call the undo step of the previous animation
            }
        },
        offset: '50%' //This indicates how far down the page the trigger should be when activating the step
    });

    new Waypoint({
        element: document.getElementById('StackedChartStep3'), //Select the trigger element for the correct step
        handler: function(direction) {
            if(direction === 'down'){
                drawStackChart(3) //Call the next step of the animation
                // console.log("trigger4")
            } else {
                // console.log("trigger out 4")
                drawStackChart(2) //Call the undo step of the previous animation
            }
        },
        offset: '50%' //This indicates how far down the page the trigger should be when activating the step
    });

    new Waypoint({
        element: document.getElementById('StackedChartStep4'), //Select the trigger element for the correct step
        handler: function(direction) {
            if(direction === 'down'){
                drawStackChart(4) //Call the next step of the animation
                // console.log("trigger4")
            } else {
                // console.log("trigger out 4")
                drawStackChart(3) //Call the undo step of the previous animation
            }
        },
        offset: '50%' //This indicates how far down the page the trigger should be when activating the step
    });

    
}



//for bubble chart
var pack = d3.pack().size([width, height]).padding(120);

 function drawBubbleChart(step){

    //the tooltip would stuck when cross step, so remove them before scroll to next step
    d3.selectAll('.Bubbletooltip').remove();

    //count the occurence of each genre for bubble chart
    genre_map = {}
    spotify_data.forEach(function(d){
        genre_arr = d.genre.split(",")
        for(let i=0; i < genre_arr.length; i++){
            key = genre_arr[i].replace(/\s+/g,'')
            genre_map[key] = (genre_map[key] === undefined) ? 1: genre_map[key] + 1
        }
    })
    // console.log(genre_map)

    //map the object to chartable object
    var ready_data = Object.entries(genre_map).map(([key,value]) => ({
        genre:key,
        count: +value
    }))

    // console.log(ready_data)

    //change the data based on step

    spotify_data = spotify_data.filter(function(g){return (parseInt(g.year) >= "2000" && parseInt(g.year) <= "2019")})

    if (step == 0){
        ready_data = ready_data.filter(function(g){return g.genre == "pop" || g.genre == "hiphop"})
    }else if(step == 1){
        ready_data = ready_data.filter(function(g){return g.genre == "pop" || g.genre == "hiphop"})
    }else if(step == 2){
        ready_data = ready_data.slice(0,6)
    }else if(step == 3){
        ready_data = ready_data.slice(0,9)
    } 
    // console.log(ready_data)

    //set the color scale using schemeSet3 is an array with 9 color
    // const color = d3.scaleOrdinal(d3.schemeSet1)
    const color = d3.scaleOrdinal()
    .domain(["pop", "hiphop", "rock","Dance/Electronic","Folk/Acoustic","R&B", 
    "World/Traditional","blues","classical", "country", 
     "easylistening", "jazz", "latin", "metal"])
     .range(["#005a00","#008000", "#b30000", "#ff8080","#bfcfff","#ff0000",
     "#ffc14d", "#ffa500", "#ffe7be", "#002db3", "#ffdb99", "#b37400",
     "#0000ff", "#ffbfbf"])


    //scale size for each genre
    const size = d3.scaleLinear().domain([0, 80]).range([30,100])

    // transition
    var t = d3.transition()
    .delay(500)
    .duration(500);

    // hierarchy
    var h = d3.hierarchy({children: ready_data})
    .sum(function(d) { return d.count; })


    //create a hidden div for tooltip
    var Bubbletooltip = d3.select("body").append("div")
    .attr("class", "Bubbletooltip")
    .style("opacity", 0)
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("width", "140px")
    .style("position", "absolute")

    svg.selectAll(".myBubble")
    .data( pack(h).leaves(), function(d){ return d.data.genre; })
    .join(
        function (enter){
            return enter
            .append("circle")
            .attr("r", 1e-6)
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; })
            .style("fill", "white")
            .transition()
            // .delay(700)
            .duration(500)
            .style("fill", function(d,i){ return color(d.data.genre)})
            .attr("r", function(d){ return size(d.r) })

        },

        function (update){
            return update
            .transition()
            // .delay(200)
            .duration(200)
            // .transition(t)
            .attr("r", function(d){ return size(d.r) })
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; })
            .style("fill", function(d,i){ return color(d.data.genre)})
        },

        function (exit){
            return exit
            .transition()
            .duration(200)
            .style("opacity", 1e-6)
            .style("r", 1e-6)
            .on('end', function(){
                d3.select(this).remove()
            });
        },
    )
    .attr("class","myBubble")
     .on("mouseover", function(event, d){ 
        d3.select(this).transition().duration(300).attr("stroke", "black").attr("stroke-width", "4px");
        
        Bubbletooltip
        .html('<u>' +(d.data.genre.charAt(0).toUpperCase() +  d.data.genre.slice(1)) + '</u>' + "<br>" + "Count: " + d.data.count)
        .style("opacity", 1)
     })
    .on("mousemove", function(event,d){
        Bubbletooltip
        .style("left", (event.pageX)+20 + "px") //need to use pageX/Y to get the mouse position in the page, event.x will return the position in the div not the page
        .style("top", (event.pageY )+10 + "px")
    })
    .on("mouseout", function(d) {
        d3.select(this).transition().duration(300).attr("stroke", "black").attr("stroke-width", "0px");
        Bubbletooltip
        .style("opacity", 0);
    })


    // add text
    svg.selectAll(".myText")
    .data(pack(h).leaves(), function(d){ return d.data.genre; })
    .join(
        function (enter){
            return enter
            .append("text")
            .style("opacity", 1e-6)
            .style("fill", "white")
            .attr("x", function(d){ return d.x; })
            .attr("y", function(d){ return d.y; })
            .text(function(d){ return d.data.genre.charAt(0).toUpperCase() +  d.data.genre.slice(1) ; })
            .style("font-size", function(d){ return size(d.r)/3 + 'px'})
            .call(wrap,10)
            .transition()
            .duration(500)
            .attr('text-anchor', 'middle')
            .style("opacity", 1)

           
        },

        function (update){

            return update
            .style("opacity", 1e-6)
            .attr("x", function(d){ return d.x; })
            .attr("y", function(d){ return d.y; })
            .text(function(d){ return d.data.genre.charAt(0).toUpperCase() +  d.data.genre.slice(1); })
            .attr("font-size", function(d){  return size(d.r)/3 + "px"; })
            .call(wrap,10)
            .transition().duration(0)
            .style("opacity", 1)
            .attr('text-anchor', 'middle')
        },

        function (exit){
            return exit
            .transition()
            .duration(200)
            .style("opacity", 1e-6)
            .on('end', function(){
                d3.select(this).remove()
            });
        },
    )
    .attr("class","myText")
    .on("mouseover", function(event, d){ 

        d3.select(this).transition().duration(300).style("fill", "black");
        Bubbletooltip
        .html('<u>' + (d.data.genre.charAt(0).toUpperCase() +  d.data.genre.slice(1)) + '</u>' + "<br>" + "Count: " + d.data.count)
        .style("opacity", 1)
        // )
     })
    .on("mousemove", function(event,d){
        // console.log("hover")
        Bubbletooltip
        .style("left", (event.pageX)+20 + "px") //need to use pageX/Y to get the mouse position in the page, event.x will return the position in the div not the page
        .style("top", (event.pageY )+10 + "px")
    })
    .on("mouseout", function(d) {
        d3.select(this).transition().duration(300).style("fill", "white")
        Bubbletooltip
        .style("opacity", 0);
    })
   

 }


 // for stacked bar chart
 const svgg = d3.select('#stacked_svg').append('g').attr("transform", `translate(${margin.left}, ${margin.top})`)

var x = d3.scaleTime().domain([new Date(1999,0,0), new Date(2020,0,0)]).range([0, innerWidth]);
var x_axis = d3.axisBottom(x);

 var y = d3.scaleLinear().rangeRound([innerHeight, 0]);
 var y_axis = d3.axisRight(y).tickSize(innerWidth).tickFormat(function(d, i, ticks){ return i == ticks.length - 1 ? d + "" : d; });
 svgg.append("g").attr("class", "y axis").call(customYAxis)

 function drawStackChart(step){

    //create a hidden div for tooltip
    var Stacktooltip = d3.select("body").append("div")
    .attr("class", "StackedChartTooltip")
    .style("opacity", 0)
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("width", "130px")
    .style("position", "absolute")


    var every_genre = [ "pop", "hiphop", "RAndB","DanceElectronic", "rock","FolkAcoustic", 
    "WorldTraditional","blues","classical", "country", 
     "easylistening", "jazz", "latin", "metal"]
   
   svgg.append("g")
   .attr("class", "x axis")
   .attr("transform", "translate(0,"+ innerHeight +")")
   .call(x_axis);


    //all genre
    var all_genre = {
        "DanceElectronic":0,
        "FolkAcoustic":0,
        "RAndB":0,
        "WorldTraditional":0,
        "blues":0,
        "classical":0,
        "country":0,
        "easylistening":0,
        "hiphop":0,
        "jazz":0,
        "latin":0,
        "metal":0,
        "pop":0,
        "rock":0,
        "sum":0,
        "Year": 0
    }

    //data wrangling
    var year_genre = {}
    spotify_data.forEach(function(d){
        genre_arr = d.genre.split(",")
        
        for(let i=0; i < genre_arr.length; i++){
            if(year_genre[d.year] === undefined){
                year_genre[d.year] = JSON.parse(JSON.stringify(all_genre))
            }
            genre =  genre_arr[i].replaceAll(/\s/g,'')
            if(genre == "Dance/Electronic") genre = "DanceElectronic";
            else if (genre == "R&B") genre = "RAndB";
            else if (genre == "Folk/Acoustic") genre = "FolkAcoustic";
            else if (genre == "World/Traditional") genre = "WorldTraditional"

            year_genre[d.year][genre] += 1
            year_genre[d.year]['sum'] += 1
            year_genre[d.year]['Year'] = d.year
        }
    })
    // console.log(year_genre)

    //map the object to the right format for stacked bar chart
    var ready_data = Object.entries(year_genre).map(([key,value]) => ({
        Year: key,
        "hiphop":value["hiphop"],
        "pop":value["pop"],
        "rock":value["rock"],
        "sum":value["sum"],
        "Year": value["Year"],
        "DanceElectronic": value["DanceElectronic"],
        "FolkAcoustic": value["FolkAcoustic"],
        "RAndB": value["RAndB"],
        "easylistening":value["easylistening"],
        "jazz":value["jazz"],
        "latin":value["latin"],
        "metal":value["metal"],
        "WorldTraditional":value["WorldTraditional"],
        "blues":value["blues"],
        "classical":value["classical"],
        "country":value["country"],
    }))
    // console.log(ready_data)

    //update the dataset based on step of scroll
    var copy_data = structuredClone(ready_data);
    for(let i =0; i < copy_data.length; i++){
        copy_data[i]['pop'] = 0
        copy_data[i]['rock'] = 0
        copy_data[i]['RAndB']= 0
        copy_data[i]['DanceElectronic'] = 0
        copy_data[i]['FolkAcoustic'] = 0
        copy_data[i]['WorldTraditional']= 0
        copy_data[i]['blues'] = 0
        copy_data[i]['classical'] = 0
        copy_data[i]['country'] = 0
        copy_data[i]['easylistening'] = 0
        copy_data[i]['hiphop']= 0
        copy_data[i]['jazz'] = 0
        copy_data[i]['latin'] = 0
        copy_data[i]['metal'] = 0
    }

    //only add the value back to the genre that we want to display 
    if(step == 1){
        copy_data = copy_data.map((obj, i) => ({ ...obj,
            "pop": ready_data[i]['pop'],
            "hiphop": ready_data[i]['hiphop'],

        }));
    }else if (step == 2){
        copy_data = copy_data.map((obj, i) => ({ ...obj,
            "pop": ready_data[i]['pop'],
            "hiphop": ready_data[i]['hiphop'],
            "RAndB": ready_data[i]['RAndB'],
        }));
    }else if (step == 3){
        copy_data = copy_data.map((obj, i) => ({ ...obj,
            "pop": ready_data[i]['pop'],
            "hiphop": ready_data[i]['hiphop'],
            "RAndB": ready_data[i]['RAndB'],
            "DanceElectronic": ready_data[i]['DanceElectronic'],
            "rock": ready_data[i]['rock'],
        }));
    }else if (step == 4){
        copy_data = ready_data
    }

    // const color = d3.scaleOrdinal(d3.schemeSet2)

     const color = d3.scaleOrdinal()
         .domain(["pop", "hiphop", "rock","DanceElectronic","FolkAcoustic","RAndB",
             "WorldTraditional","blues","classical", "country",
             "easylistening", "jazz", "latin", "metal"])
         .range(["#005a00","#008000", "#b30000", "#ff8080","#bfcfff","#ff0000",
             "#ffc14d", "#ffa500", "#ffe7be", "#002db3", "#ffdb99", "#b37400",
             "#0000ff", "#ffbfbf"])

    var stack = d3.stack()
    .keys(every_genre)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

     // update the y scale
     y.domain([0, 230]);

     svgg.select(".y")
     .transition()
    .call(customYAxis);

    every_genre.forEach(function(key, key_index){

        var bar = svgg.selectAll(".bar-" + key)
        .data(stack(copy_data)[key_index], function(d){ return d.data["Year"] + "-" + key; });

        bar
        .transition()
        .duration(500)
        .attr("x", function(d){ return x(new Date(d.data["Year"]),0,0); })
        .attr("y", function(d){ return y(d[1]); })
        .attr("height", function(d){ return y(d[0]) - y(d[1]); });

        bar
        .enter().append("rect")
        .attr("class", function(d){ return "bar bar-" + key; })
        .attr("x", function(d){ return x(new Date(d.data["Year"]),0,0); })
        .attr("y", function(d){ return y(d[1]); })
        .attr("height", function(d){ return y(d[0]) - y(d[1]); })
        .attr("width", 20)
        .attr("fill", function(d){ return color(key); })
        .attr("transform", "translate(-15,0)" )
        .on("mouseover", function(event, d){ 
 
            d3.select(this).transition().duration(300).attr("stroke", "black").attr("stroke-width", "3px");
            Stacktooltip
            .html('<u>' + key.charAt(0).toUpperCase() +  key.slice(1)  + '</u>' + "<br>"  + "Year: "+d.data["Year"] +"<br>" +  "Count: " + (d[1]-d[0]))
            .style("opacity", 1)

         })
        .on("mousemove", function(event,d){
            Stacktooltip
            .style("left", (event.pageX)+20 + "px") //need to use pageX/Y to get the mouse position in the page, event.x will return the position in the div not the page
            .style("top", (event.pageY )+10 + "px")
        })
        .on("mouseout", function(d) {
            d3.select(this).transition().duration(300).attr("stroke", "black").attr("stroke-width", "0px");
            Stacktooltip
            .style("opacity", 0);
        })

    });  
 }


 function customYAxis(g) {
    g.call(y_axis);
    g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
    g.selectAll(".tick text").attr("x", 4).attr("dy", -4);
  }

  function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split("/").reverse(),
            word,
            line = [],
            lineNumber = -0.8,
            lineHeight = 0.9, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            // dy = text.attr("dy") ? text.attr("dy") : 0;
            tspan = text.text(null)
                        .append("tspan")
                        .attr("class", "tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
            }
        }
    });
}