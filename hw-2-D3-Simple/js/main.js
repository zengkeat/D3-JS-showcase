// Hint: This is a good place to declare your global variables
var female_data;
var male_data;

//initialize the size
var width = 1000, height = 600;
const margin = { top:20, bottom: 90, right: 20, left: 160 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin["top"] - margin.bottom;

//initialize the x and y scale outside the function so it wont re run the scale everytime,
//when drawLolliPopChart() call it only transition to updated domain 
const svg = d3.select('#graph');//get the html element

 //Append a 'g' element that's offset by the top and left margins.
const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

//create the scale for the line chart
const x = d3.scaleTime().range([0,innerWidth]);
const xAxis = g.append("g").attr("transform", `translate(0,${innerHeight})`)

const y = d3.scaleLinear().range([innerHeight,0]);
const yAxis = g.append("g")


// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', function () {
   // Hint: create or set your svg element inside this function
    
   // This will load your two CSV files and store them into two arrays.
   Promise.all([d3.csv('data/females_data.csv'),d3.csv('data/males_data.csv')])
        .then(function (values) {
            console.log('loaded females_data.csv and males_data.csv');
            female_data = values[0];
            male_data = values[1];

            // Hint: This is a good spot for doing data wrangling
            // data wrangling for female data
            female_data.forEach(d => {
                d.Year = new Date(d["Year"],0,0);
                d.China = +d["China"];
                d.Argentina = +d["Argentina"];
                d.Canada = +d["Canada"];
                d.Bahamas = +d["Bahamas"];
                d.Greece = +d["Greece"];
               
            });

            //data wrangling for male data
            male_data.forEach(d => {
                d.Year = new Date(d["Year"],0,0);
                d.China = +d["China"];
                d.Argentina = +d["Argentina"];
                d.Canada = +d["Canada"];
                d.Bahamas = +d["Bahamas"];
                d.Greece = +d["Greece"];
               
            });

            drawLolliPopChart();
        });
});


// Use this function to draw the lollipop chart.
function drawLolliPopChart() {

    //reset the graph
    // d3.selectAll("g > *").remove()

    //get the drop down menu element
    var country = document.getElementById("countries").value;

    //calculate the max employement rate of the country between male and female data
    var female_max = d3.max(female_data, d => d[country]);
    var male_max = d3.max(male_data, d => d[country]);
    var max_rate = Math.max(female_max, male_max);

    //update the domain of the x-axis
    x.domain([new Date(1990,0,0),new Date(2023,0,0)]);
    xAxis.transition().duration(1000).call(d3.axisBottom(x)); //transition to updated x-axis

    //update the domain of the y-axis
    y.domain([0,max_rate]);
    yAxis.transition().duration(1000).call(d3.axisLeft(y));//transition to updated y-axis

    //adding the line for female data
    const female_line = g.selectAll('.femaleLine')
    .data(female_data)
    .join("line")
    .attr("class", "femaleLine")
    .transition()   //transition to the new data
    .duration(1000)
    .attr("x1", function(d) { return x(d.Year); })
    .attr("x2", function(d) { return x(d.Year); })
    .attr("y1", y(0))
    .attr("y2", function(d) { return y(d[country]); })
    .attr("transform", "translate(5,0)") // move the line right 5 px
    .attr("stroke", "#eb42c0");


    //adding the line for male data
    const male_line = g.selectAll('.maleLine')
    .data(male_data)
    .join("line")
    .attr("class", "maleLine")
    .transition()   //transition to the new data
    .duration(1000)
    .attr("x1", function(d) { return x(d.Year); })
    .attr("x2", function(d) { return x(d.Year); })
    .attr("y1", y(0))
    .attr("y2", function(d) { return y(d[country]); })
    .attr("transform", "translate(-5,0)") //move the line left 5 px
    .attr("stroke", "#039e2a");


    //adding lolipop circle for female line
    const circle_female = g.selectAll(".femaleCircle")
    .data(female_data)
    .join("circle")
    .attr("class", "femaleCircle")
    .transition()
    .duration(1000)
    .attr("cx", function(d) { return x(d.Year); })
    .attr("cy", function(d) { return y(d[country]); })
    .attr("r", "4")
    .attr("transform", "translate(5,0)") // move the circle right 5 px to match the line
    .style("fill", "#eb42c0");

    //adding lolipop circle for male line
    const circle_male = g.selectAll(".maleCircle")
    .data(male_data)
    .join("circle")
    .attr("class", "maleCircle")
    .transition()
    .duration(1000)
    .attr("cx", function(d) { return x(d.Year); })
    .attr("cy", function(d) { return y(d[country]); })
    .attr("r", "4")
    .attr("transform", "translate(-5,0)") // move the circle left 5 px to match the line
    .style("fill", "#039e2a")
    
    //adding legend to the chart 
    g.append("rect").attr("x",innerWidth-200).attr("y",10).attr("width", 20).attr("height", 20).style("fill", "#eb42c0")
    g.append("rect").attr("x",innerWidth-200).attr("y",40).attr("width", 20).attr("height", 20).style("fill", "#039e2a")
    g.append("text").attr("x", innerWidth-170).attr("y", 20).text("Female Employment Rate").style("font-size", "15px").attr("alignment-baseline","middle")
    g.append("text").attr("x", innerWidth-170).attr("y", 50).text("Male Employment Rate").style("font-size", "15px").attr("alignment-baseline","middle")

    //adding x and y -axis label
    g.append('text')
        .attr('class','axis-label')
        .attr('transform','rotate(-90)')
        .attr('y','-60px')
        .attr('x',-innerHeight/2)
        .attr('text-anchor','middle')
        .text('Employment Rate')
    g.append('text')
        .attr('class','axis-label')
        .attr('text-anchor','middle')
        .attr('x',innerWidth/2 )
        .attr('y',innerHeight+60)
        .text('Year') 

}

