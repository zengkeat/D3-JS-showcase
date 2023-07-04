//Global variable here
var countries_regions;
var global_development;
var global_indi;

//initialize some margin
const margin = {top: 60, right: 100, bottom: 100, left: 100}

//get the dimension of svg from the html
var dimension = d3.select('svg');
const width = +dimension.style('width').replace('px',''); 
const height = +dimension.style('height').replace('px','');

//initialize the size
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin["top"] - margin.bottom;

//initialize the x and y scale outside the function so it wont re run the scale everytime,
//seelct the svg and give it some margin
const svg = d3.select('#line_chart').append('g').attr("transform", `translate(${margin.left}, ${margin.top})`)

//initialize x-scale for the line chart
const x = d3.scaleTime().range([0,innerWidth]);
const xAxis = d3.axisBottom().scale(x);
svg.append("g").attr("transform", `translate(0,${innerHeight})`).style("font", "20px times").attr("class", "myXaxis")

//initialize y-scale for the line chart
const y = d3.scaleLinear().range([innerHeight,0]);
const yAxis = d3.axisLeft().scale(y);
svg.append("g").style("font", "15px times").attr("class", "myYaxis")

// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', function () {
    // Hint: create or set your svg element inside this function
     
    // This will load your two CSV files and store them into two arrays.
    Promise.all([d3.csv('data/countries_regions.csv'),d3.csv('data/global_development.csv'), d3.json('data/country.json')])
         .then(function (values) {
            
             console.log('loaded countries_regions.csv and global_development.csv and country.json');
             countries_regions = values[0];
             global_development = values[1];
             country_flag = values[2];

            //  console.log(countries_regions)
            //  console.log(country_flag)
            //  data wrangling for global_development
             global_development.forEach(d => {

                 region = []
                 region = countries_regions.filter(function(g){return g.name == d.Country})
                 d.Region = (region.length == 0)? "none": region[0]["World bank region"]

                 flag = []
                 flag = country_flag.filter(function(g){return g.name == d.Country})
                 d.flag = (flag.length == 0 )? "flags/1x1/noFlag.jpg":flag[0]["flag_1x1"]  // if can't find the flag then display a special images
                 
             });

            drawLineChart()
         });
 });

function drawLineChart(){

    //get the label, either text or flag
    var text_or_flag = d3.selectAll("input[name ='radioBtn']:checked").property("value");

    //get the start and end years
    var startYear = document.getElementById("startYear").value
    var endYear = document.getElementById("endYear").value
    startYear = (startYear == "" || startYear < 1980 || startYear > 2013  ) ? parseInt(1980): parseInt(document.getElementById("startYear").value);
    endYear = (endYear  == "" || endYear > 2013 || endYear < 1980 ) ? parseInt(2013): parseInt(document.getElementById("endYear").value);

    //update the varaible if startyear > endyear
    if (startYear > endYear){
        var copy = startYear
        startYear = endYear
        endYear = copy
    }

    //get the opacity value
    var get_opa = document.getElementById("opacity").value
    get_opa = get_opa/100

    //get a copy of the dataset
    copy_data = global_development;

    //get the gloabal indicator menu element
    global_indi = document.getElementById("global_indicator").value;

    //get the regions checkboxes regions values
    var checked = []
    var boxes = d3.selectAll("input[type = 'checkbox']:checked");
    boxes.each(function() {
        checked.push(this.value)
    });
    // console.log(checked)

    //filter the data to only include the data that match the year and regions
    //if the country doesnt include in the regions, then it will not be draw
    var copy = [];
    for(var i = 0; i < copy_data.length; i++){ 
        if (copy_data[i]["Year"] >= startYear && copy_data[i]["Year"] <= endYear && checked.includes(copy_data[i]["Region"]) ){
            copy.push(copy_data[i]);
        }   
    }
    copy_data = copy;

    //group the data based on country
    const group_country = d3.group(copy_data, d => d.Country)

    //create the X axis
    var years = d3.extent(copy_data, d=> d["Year"])
    x.domain([new Date(startYear,0,0),new Date(endYear,0,0)]);
    svg.selectAll(".myXaxis")
    .transition()
    .duration(1500)
    .call(xAxis);

    // create the Y axis
    y.domain([0, d3.max(copy_data, function(d) { return +d[global_indi] }) ]);
    svg.selectAll(".myYaxis")
        .transition()
        .duration(1500)
        .call(yAxis);

    //initialize the color scale
    const colors = { 
        "South Asia":"#62a87c",
        "Europe & Central Asia": "#ffe066",
        "Middle East & North Africa":"#f25c5c",
        "Sub-Saharan Africa":"#247ba0",
        "Latin America & Caribbean":"#f4bbd3",
        "East Asia & Pacific":"#34b9d3",
        "North America":"#5800FF"
    }

    //draw the line with enter, update and exit function
    var path = svg.selectAll(".lineTest")
    .data(group_country)
    .join(
        function(enter){
            return enter
            .append("path")
            .transition()
            .delay(1500)
            .duration(1000)
            .attr("d", function(d){
                return d3.line()
                .x(function(d) { return x(new Date(d["Year"],0,0)) })
                .y(function(d) { return y( +d[global_indi]) })
                (d[1])
            })
            .attr("fill", "none")
            .attr("stroke",function(d){
                return colors[d[1][0]["Region"]]
            })
            .attr("stroke-width", 5)
            .style("opacity",get_opa)
            // .interpolate("linear")
        },
        function(update){
            return update
            .transition()
            .delay(1000)
            .duration(1000)
            .attr("d", function(d){
                return d3.line()
                .x(function(d) { return x(new Date(d["Year"],0,0)) })
                .y(function(d) { return y( +d[global_indi]) })
                (d[1])
            })
            .attr("fill", "none")
            .attr("stroke",function(d){
                return colors[d[1][0]["Region"]]
            })
            .attr("stroke-width", 5)
            .style("opacity",get_opa)
            // .interpolate("linear")
        },
        function (exit){
            return exit 
            .transition()
            .duration(1000)
            .style("opacity",0)
            .on('end', function(){
                d3.select(this).remove();
            })
        }
    )
    .attr("class", "lineTest")
    .attr("id", function(d,i){ //assign each line with id
        return "line" +i;
     })
     .on("mouseover", function(d,i){
        hover(this, "#circle", "#label", "mouseover", 4)
    })
    .on("mouseout",function(d, i){
        hover(this, "#circle", "#label", "mouseout", 4)
    })

    
    // add circle at the end
    svg.selectAll(".lineCircle")
    .data(group_country)
    .join(
        function(enter){
            return enter
            .append("circle")
            .transition()
            .delay(1500)
            .duration(1000)
            .attr("cx", function(d,i){
                var len = d[1].length   //get the length of current country dataset
                var last = d[1][len-1]  //get the last row of data
                return x(new Date(last["Year"],0,0)) //get the "Year" of the last row of data
            })
            .attr("cy", function(d, i){
                var len = d[1].length
                var last = d[1][len-1]
                return y(+last[global_indi])
            })
            .attr("r", 10)
            .style("fill", function(d){return colors[d[1][0]["Region"]]})
            .style("opacity", get_opa)
            .style("stroke", "black")
            .style("stroke-width", "3")
        },
        function(update){
            return update
            .transition()
            .delay(1000)
            .duration(1000)
            .attr("cx", function(d,i){
                var len = d[1].length
                var last = d[1][len-1]
                return x(new Date(last["Year"],0,0))
            })
            .attr("cy", function(d, i){
                var len = d[1].length
                var last = d[1][len-1]
                return y(+last[global_indi])
            })
            .attr("r", 10)
            .style("fill", function(d){return colors[d[1][0]["Region"]]})
            .style("opacity", get_opa)
            .style("stroke", "black")
            .style("stroke-width", "3")
        },
        function(exit){
            return exit 
            .transition()
            .duration(1000)
            .style("opacity",0)
            .on('end', function(){
                d3.select(this).remove();
            })
        }
    )
    .attr("class", "lineCircle")
    .attr("id", function(d,i){ 
        return "circle" +i; //assign each circle with specific id
     })
     .on("mouseover", function(d,i){
        hover(this, "#line", "#label", "mouseover", 6)
    })
    .on("mouseout",function(d, i){
        hover(this, "#line", "#label", "mouseout", 6)
    })

    

    //add text label 
    if(text_or_flag == "text"){

        d3.selectAll(".flagLabel").remove()//remove the flag in the chart

        svg
        .selectAll(".lineLabel")
        .data(group_country)
        .join(
            function(enter){
                return enter
                .append("text")
                .transition()
                .delay(1500)
                .duration(1000)
                .attr('x', function(d){ 
                    var len = d[1].length
                    var last = d[1][len-1]
                    return x(new Date(last["Year"],0,0))
                })
                .attr('y',function(d, i){
                    var len = d[1].length
                    var last = d[1][len-1]
                    return y(+last[global_indi])
                })
                .text(function(d){ 
                    return d[1][0]["Country"]
                })
                .style("fill", function(d){return colors[d[1][0]["Region"]]})
                .style("opacity", get_opa)
                .style("font", "20px times")
                .attr("transform", "translate(15,0)") 
            },
            function(update){
                return update
                .transition()
                .delay(1000)
                .duration(1000)
                .attr('x', function(d){ 
                    var len = d[1].length
                    var last = d[1][len-1]
                    return x(new Date(last["Year"],0,0))
                })
                .attr('y',function(d, i){
                    var len = d[1].length
                    var last = d[1][len-1]
                    return y(+last[global_indi])
                })
                .text(function(d){ 
                    return d[1][0]["Country"]
                })
                .style("fill", function(d){return colors[d[1][0]["Region"]]})
                .style("opacity", get_opa)
                .style("font", "20px times")
                .attr("transform", "translate(15,0)") 
            },
            function(exit){
                return exit 
                .transition()
                .duration(1000)
                .style("opacity",0)
                .on('end', function(){
                    d3.select(this).remove();
                })
            })
        .attr('class','lineLabel')
        .attr("id", function(d,i){ 
            return "label" +i;
        })
        .on("mouseover", function(d,i){
            hover(this, "#circle", "#line", "mouseover", 5)
        })
        .on("mouseout",function(d, i){
            hover(this, "#circle", "#line", "mouseout", 5)
        })

    }else{
        d3.selectAll(".lineLabel").remove()
        //put flag
        svg
        .selectAll(".flagLabel")
        .data(group_country)
        .join(
            function(enter){
                return enter
                .append("image")
                .transition()
                .delay(1500)
                .duration(1000)
                .attr("xlink:href", function(d){ 
                    // console.log(d[1][0].flag)
                    return d[1][0].flag
                })
                .attr('x', function(d){ 
                    var len = d[1].length
                    var last = d[1][len-1]
                    return x(new Date(last["Year"],0,0))
                })
                .attr('y',function(d, i){
                    var len = d[1].length
                    var last = d[1][len-1]
                    return y(+last[global_indi])
                })
                .style("opacity", get_opa)
                .attr('width', 30)
                .attr('height', 30)
                .attr("transform", "translate(15,-10)") 
            },
            function(update){
                return update
                .transition()
                .delay(1000)
                .duration(1000)
                .attr('x', function(d){ 
                    var len = d[1].length
                    var last = d[1][len-1]
                    return x(new Date(last["Year"],0,0))
                })
                .attr('y',function(d, i){
                    var len = d[1].length
                    var last = d[1][len-1]
                    return y(+last[global_indi])
                })
                .attr("xlink:href", function(d){ 
                    // console.log(d["flag"])
                    return d[1][0].flag
                })
                .style("opacity", get_opa)
                .attr('width', 30)
                .attr('height', 30)
                .attr("transform", "translate(15,-10)") 
            },
            function(exit){
                return exit 
                .transition()
                .duration(1000)
                .style("opacity",0)
                .on('end', function(){
                    d3.select(this).remove();
                })
            })
        .attr('class','flagLabel')
        .attr("id", function(d,i){ 
            return "label" +i;
        })
        .on("mouseover", function(d,i){
            hover(this, "#circle", "#line", "mouseover", 5)
        })
        .on("mouseout",function(d, i){
            hover(this, "#circle", "#line", "mouseout", 5)
        })

    }


    //adding x and y -axis label
    svg.append('text')
    .attr('class','axis-label')
    .attr('transform','rotate(-90)')
    .attr('y','-60px')
    .attr('x',-innerHeight/2)
    .attr('text-anchor','middle')
    .text('Value')
    .style("font", "30px times")

    svg.append('text')
    .attr('class','axis-label')
    .attr('text-anchor','middle')
    .attr('x',innerWidth/2 )
    .attr('y',innerHeight+60)
    .text('Year') 
    .style("font", "30px times")
}

//this function perform check and uncheck all checkbox
function checkAll(bool){
    if(bool)d3.selectAll('input[type="checkbox"]').property('checked', true)
    else d3.selectAll('input[type="checkbox"]').property('checked', false)
    drawLineChart()
}

//this function adjust the opacity
function opacity(value){
    d3.selectAll(".lineTest").style("opacity", value/100);
    d3.selectAll(".lineCircle").style("opacity", value/100);
    d3.selectAll(".lineLabel").style("opacity", value/100);
    d3.selectAll(".flagLabel").style("opacity", value/100);
    d3.select("output#opacity").text(value +"%") //change the opacity value
}

//when the play button is click then do animation from left to right
d3.select("#playBtn").on("click", function(d,i){

    d3.selectAll(".lineTest").each(function(d,i){
        // console.log(i)

        //line animation
        var path = d3.select("#line" +i);
        var totalLength = path.node().getTotalLength();
        d3.selectAll("#line" +i)
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .style("stroke-width",5)

        // circle animation
        d3.selectAll("#circle" +i)
        .transition()
        .duration(1000)
        .attr("cx", function(d,i){
            var len = d[1].length
            var last = d[1][0]
            return x(new Date(last["Year"],0,0))
        })
        .attr("cy", function(d, i){
            var len = d[1].length
            var last = d[1][0]
            return y(+last[global_indi])
        })
        .attr("r", 10)
        .ease(d3.easeLinear)
        .tween("pathTween", function(){return pathTween(path)})

        function pathTween(path){
            var length = path.node().getTotalLength();
            var r = d3.interpolate(0,length);
            return function(t){
                var point = path.node().getPointAtLength(r(t));
                d3.select(this)
                .attr("cx", point.x)
                .attr("cy", point.y)
            }
        }

        //text animation 
        d3.selectAll("#label" +i)
        .transition()
        .duration(1000)
        .attr("x", function(d,i){
            var len = d[1].length
            var last = d[1][0]
            return x(new Date(last["Year"],0,0))
        })
        .attr("y", function(d, i){
            var len = d[1].length
            var last = d[1][0]
            return y(+last[global_indi])
        })
        .text(function(d){ 
            return d[1][0]["Country"]
            // console.log(d[1][0]["Country"])
        })
        .ease(d3.easeLinear)
        .tween("pathTweenLabel", function(){return pathTweenLabel(path)})

        function pathTweenLabel(path){
            var length = path.node().getTotalLength();
            var r = d3.interpolate(0,length);
            return function(t){
                var point = path.node().getPointAtLength(r(t));
                d3.select(this)
                .attr("x", point.x)
                .attr("y", point.y)
            }
        }


    })
})

//function of hover animation
function hover(curr, element1, element2, action, slice){

    var element = d3.select(curr)["_groups"][0]
    var id = element[0].id.substr(slice);

    if (action == "mouseover"){
        d3.select(curr).transition().duration(300).style("opacity", 1);
        d3.selectAll(element1+id).transition().duration(300).style("opacity", 1);
        d3.selectAll(element2+id).transition().duration(300).style("opacity", 1);

        //set all other line,label and circle to minimum opacity 
        d3.selectAll(".lineTest").style("opacity", 0.2); 
        d3.selectAll(".lineLabel").style("opacity", 0.2);
        d3.selectAll(".lineCircle").style("opacity", 0.2);
        d3.selectAll(".flagLabel").style("opacity", 0.2);
    }else{

        var opa = document.getElementById("opacity").value

        d3.selectAll(element1+id).transition().duration(300).style("opacity", opa/100);
        d3.selectAll(element2+id).transition().duration(300).style("opacity", opa/100);
        d3.select(curr).transition().duration(300).style("opacity", opa/100);

        //restore the opcaity to orginal 
        d3.selectAll(".lineTest").style("opacity", opa/100); 
        d3.selectAll(".lineLabel").style("opacity", opa/100);
        d3.selectAll(".lineCircle").style("opacity", opa/100);
        d3.selectAll(".flagLabel").style("opacity", opa/100);

    }

}
