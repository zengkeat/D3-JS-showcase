//Global variable here
var left_data = []
var right_data = []

//initialize some margin
const margin = {top: 60, right: 20, bottom: 100, left: 100}

//get the dimension of svg from the html
var dimension = d3.select('svg');
const width = +dimension.style('width').replace('px',''); 
const height = +dimension.style('height').replace('px','');

//initialize the size
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin["top"] - margin.bottom;

//initialize the x and y scale outside the function so it wont re run the scale everytime,
//select the svg and give it some margin
const svgLeft = d3.select('#left_chart').append('g').attr("transform", `translate(${margin.left}, ${margin.top})`)
const svgRight = d3.select('#right_chart').append('g').attr("transform", `translate(${margin.left}, ${margin.top})`)


//initialize x-scale for the line chart
const x = d3.scaleTime().range([0,innerWidth]);
const xAxis = d3.axisBottom().scale(x);
svgLeft.append("g").attr("transform", `translate(0,${innerHeight})`).style("font", "20px times").attr("class", "myXaxisLeft")
svgRight.append("g").attr("transform", `translate(0,${innerHeight})`).style("font", "20px times").attr("class", "myXaxisRight")

//initialize y-scale for the line chart
const y = d3.scaleLinear().range([innerHeight,0]);
const yAxis = d3.axisLeft().scale(y);
svgLeft.append("g").style("font", "15px times").attr("class", "myYaxisLeft")
svgRight.append("g").style("font", "15px times").attr("class", "myYaxisRight")


// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', function () {
    // Hint: create or set your svg element inside this function
     
    // This will load your two CSV files and store them into two arrays.
    Promise.all([d3.csv('data/CO2_emmision_percapital.csv'),d3.csv('data/CO2_emmision_Total.csv')])
         .then(function (values) {
            
             console.log('dataset loaded');
             Ori_perCapital = values[0];
             Ori_emmisionTotal = values[1];

            //filter and only get the objects where country is united states or china
             perCapital = Ori_perCapital.filter(function(g){
                return (g.Country == "United States" || g.Country == "China")
            })

            emmisionTotal = Ori_emmisionTotal.filter(function(g){
                return (g.Country == "United States" || g.Country == "China")
            })
            
            //data wrangling
            //map the object into readable object for right(percapital) stack bar chart
            right_data.push(...Object.entries(perCapital[0]).map(([key,value]) => ({
                Year: key,
                "United States" : +value,
                "China" : +perCapital[1][key]
            })))

            //map the object into readable object for left(total)stack bar chart
            left_data.push(...Object.entries(emmisionTotal[0]).map(([key,value]) => ({
                Year: key,
                "United States" : +value,
                "China" : +emmisionTotal[1][key]
            })))

            //filter out the unwanted object
            right_data = right_data.filter(function(g){return g.Year != "Country"})
            left_data = left_data.filter(function(g){return g.Year != "Country"})
            console.log(right_data)

            drawLeftChart()
            drawRightChart()
         });
 });

//show China have more emmision 
 function drawLeftChart(){

    var copy_data = left_data

    const subgroups = ["United States","China"]
    const sumstat = d3.group(copy_data, d => d["Year"]);
    
    //stack the data? --> stack per subgroup
    const stackedData = d3.stack()
    .keys(subgroups)
    (copy_data)

    //create the X axis
    x.domain([new Date(1970,0,0),new Date(2022,0,0)]);
    svgLeft.selectAll(".myXaxisLeft")
    .transition()
    .duration(1500)
    .call(xAxis);

    // create the Y axis
    y.domain([0, d3.max(copy_data, function(d) { return 17000 }) ]);
    svgLeft.selectAll(".myYaxisLeft")
        .transition()
        .duration(1500)
        .call(yAxis);

    // color palette
    const color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(['#F96167', '#FCE77D'])

    //create tooltip
    var tooltipLeft = d3.select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltipLeft")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style( "position",  "absolute")
    .style("width", "250px")
    .style( "height",  "100px")
    .style( "font-size",  "20px")
    
   // Show the bars
   svgLeft.append("g")
    .selectAll("g")
    .data(stackedData)
    .join("g")
    .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d)
    .join("rect")
      .attr("x", d =>  x(new Date(d.data["Year"],0,0)))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width",15)
      .attr("stroke", "grey")
      .attr("transform", "translate(-5,0)")
    .on("mouseover", function(event, d){
        d3.select(this).transition().duration(150).attr("stroke-width", "4px");
        const subgroupName = d3.select(this.parentNode).datum().key;
        const subgroupValue = d.data[subgroupName];
        const subgroupYear = d.data["Year"];
        tooltipLeft
            .html("Country: " + subgroupName + "<br>" + "CO2 Emision: "+ subgroupValue + "<br>" + "Year: " + subgroupYear)
            .style("opacity", 1)
    })
    .on("mousemove", function(event, d) {
        tooltipLeft
        .style("transform","translateY(-55%)")
        .style("left",(event.x)-100+"px")
        .style("top",(event.y)-80+ "px")
    })
    .on("mouseleave", function(event, d) {
        d3.select(this).transition().duration(150).attr("stroke-width", "0px");
        tooltipLeft
          .style("opacity", 0)
    })
    
    //adding legend to the chart 
    svgLeft.append("rect").attr("x",innerWidth-1000).attr("y",10).attr("width", 20).attr("height", 20).style("fill", "#F96167")
    svgLeft.append("rect").attr("x",innerWidth-1000).attr("y",40).attr("width", 20).attr("height", 20).style("fill", "#FCE77D")
    svgLeft.append("text").attr("x", innerWidth-970).attr("y", 20).text("US CO2 emision in Total").style("font-size", "15px").attr("alignment-baseline","middle")
    svgLeft.append("text").attr("x", innerWidth-970).attr("y", 50).text("China CO2 emision in Total").style("font-size", "15px").attr("alignment-baseline","middle")

    //adding x and y -axis label
    svgLeft.append('text')
    .attr('class','axis-label')
    .attr('transform','rotate(-90)')
    .attr('y','-60px')
    .attr('x',-innerHeight/2)
    .attr('text-anchor','middle')
    .text('CO2 Emision per Million Tonnes')
    .style("font", "20px times")

    svgLeft.append('text')
    .attr('class','axis-label')
    .attr('text-anchor','middle')
    .attr('x',innerWidth/2 )
    .attr('y',innerHeight+60)
    .text('Year') 
    .style("font", "20px times")
 }

 //show US have more emision
 function drawRightChart(){

    var copy_data = right_data

    const subgroups = ["China", "United States"]
    const sumstat = d3.group(copy_data, d => d["Year"]);
    
    //stack the data? --> stack per subgroup
    const stackedData = d3.stack()
    .keys(subgroups)
    (copy_data)

    //create the X axis
    x.domain([new Date(1970,0,0),new Date(2022,0,0)]);
    svgRight.selectAll(".myXaxisRight")
    .transition()
    .duration(1500)
    .call(xAxis);

    // create the Y axis
    y.domain([0, d3.max(copy_data, function(d) { return 26 }) ]);
    svgRight.selectAll(".myYaxisRight")
        .transition()
        .duration(1500)
        .call(yAxis);

    // color palette
    const color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(['#FCE77D','#F96167'])


    //create tooltip
    var tooltipRight = d3.select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltipRight")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style( "position",  "absolute")
    .style("width", "250px")
    .style( "height",  "120px")
    .style( "font-size",  "20px")
    
   // Show the bars
   svgRight.append("g")
    .selectAll("g")
    .data(stackedData)
    .join("g")
    .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d)
    .join("rect")
      .attr("x", d =>  x(new Date(d.data["Year"],0,0)))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width",15)
      .attr("stroke", "grey")
      .attr("transform", "translate(-5,0)")
    .on("mouseover", function(event, d){
        d3.select(this).transition().duration(150).attr("stroke-width", "4px");
        const subgroupName = d3.select(this.parentNode).datum().key;
        const subgroupValue = d.data[subgroupName];
        const subgroupYear = d.data["Year"];
        tooltipRight
            .html("Country: " + subgroupName + "<br>" + "CO2 Emision: "+ subgroupValue + "<br>" + "Year: " + subgroupYear)
            .style("opacity", 1)
    })
    .on("mousemove", function(event, d) {
        tooltipRight
        .style("transform","translateY(-55%)")
        .style("left",(event.x)-100+"px")
        .style("top",(event.y)-80+ "px")
    })
    .on("mouseleave", function(event, d) {
        d3.select(this).transition().duration(150).attr("stroke-width", "0px");
        tooltipRight
          .style("opacity", 0)
    })

    //adding legend to the chart 
    svgRight.append("rect").attr("x",innerWidth-1000).attr("y",10).attr("width", 20).attr("height", 20).style("fill", "#F96167")
    svgRight.append("rect").attr("x",innerWidth-1000).attr("y",40).attr("width", 20).attr("height", 20).style("fill", "#FCE77D")
    svgRight.append("text").attr("x", innerWidth-970).attr("y", 20).text("US CO2 emision per-capital").style("font-size", "15px").attr("alignment-baseline","middle")
    svgRight.append("text").attr("x", innerWidth-970).attr("y", 50).text("China CO2 emision per-capital").style("font-size", "15px").attr("alignment-baseline","middle")

    //adding x and y -axis label
    svgRight.append('text')
    .attr('class','axis-label')
    .attr('transform','rotate(-90)')
    .attr('y','-60px')
    .attr('x',-innerHeight/2)
    .attr('text-anchor','middle')
    .text('CO2 Emision Per Tonness')
    .style("font", "20px times")

    svgRight.append('text')
    .attr('class','axis-label')
    .attr('text-anchor','middle')
    .attr('x',innerWidth/2 )
    .attr('y',innerHeight+60)
    .text('Year') 
    .style("font", "20px times")


}