
/*Chloe Shawah
Homework 6*/

/////////////////////////
// SVG drawing area, given setup
/////////////////////////

let margin = {top: 40, right: 40, bottom: 60, left: 60};

let width = 600 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

let svg = d3.select("#chart-area").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Date parser
let formatDate = d3.timeFormat("%Y");
let parseDate = d3.timeParse("%Y");


// Initialize data
loadData();

// FIFA world cup
let data;



/////////////////////////
// GRAPH SETUP
/////////////////////////


let x = d3.scaleTime()
	.range([0, width]);

let y = d3.scaleLinear()
	.range([height,0]);

let xAxis = d3.axisBottom()
	.scale(x);

let yAxis = d3.axisLeft()
	.scale(y);

let xAxisGroup = svg.append("g")
	.attr("class", "x-axis axis")
	.attr("transform", "translate(0," + height +")");

let yAxisGroup = svg.append("g")
	.attr("class", "y-axis axis");

svg.append("text")
	.attr("class", "yLab")
	.attr("stroke", "green")
	.text("GOALS")
	.attr("x", -30)
	.attr("y", -10)
	.attr("font-size", 12)

d3.select("#data-type").on("change", updateVisualization);
d3.select("#year-button").on("click", updateVisualization);

var formatAsThousands = d3.format(",");


//////////////////////
// Load CSV file
//////////////////////


function loadData() {
	d3.csv("data/fifa-world-cup.csv", row => {
		row.YEAR = parseDate(row.YEAR);
		row.TEAMS = +row.TEAMS;
		row.MATCHES = +row.MATCHES;
		row.GOALS = +row.GOALS;
		row.AVERAGE_GOALS = +row.AVERAGE_GOALS;
		row.AVERAGE_ATTENDANCE = +row.AVERAGE_ATTENDANCE;
		return row
	}).then(csv => {

		// Store csv data in global variable
		data = csv;

		// Draw the visualization for the first time
		updateVisualization();
		showEdition(data[19]);
	});
}


///////////////////////////////
// Render visualization
///////////////////////////////


function updateVisualization() {

	console.log(data);

	let selection = d3.select("#data-type").property("value");
	let year_lb = d3.select("#year-lb").property("value");
	let year_ub = d3.select("#year-ub").property("value");


	let filterYearLB = function filter_yearlb(data) {return data.YEAR >= parseDate(year_lb);}
	let filterYearUB = function filter_yearub(data) {return data.YEAR <= parseDate(year_ub);}

	let filtered = data.filter(filterYearLB).filter(filterYearUB);

	x.domain([d3.min(filtered, function (d) {return d.YEAR}),
				d3.max(filtered, function (d) {return d.YEAR})]);
	y.domain([0,
				d3.max(filtered, function (d) {return d[selection]})]);

	// Draw path

	const path = d3.line()
		.x(function(d){ return x(d.YEAR); })
		.y(function(d){ return y(d[selection]); })
		.curve(d3.curveLinear);

	svg.selectAll("path")
		.style("opacity", 1.0)
		.transition()
		.duration(400)
		.ease(d3.easeLinear)
		.style("opacity", 0.0)
		.remove();
	svg.append("path")
		.datum(filtered)
		.attr("class", "line")
		.attr("d", path)
		.attr("fill", "none")
		.attr("stroke", "green")
		.attr("stroke-width", 1.5)
		.style("opacity", 0.0)
		.transition()
		.duration(400)
		.ease(d3.easeLinear)
		.style("opacity", 1.0);

	// Draw circles

	let circles = svg.selectAll("circle")
		.data(filtered, d => d);
	circles.exit()
		.remove();
	circles.enter()
		.append("circle")
		.merge(circles)
		.attr("class", "marks")
		.attr("cx", function(d){ return x(d.YEAR); })
		.attr("cy", function(d){ return y(d[selection]); })
		.attr("r", 5)
		.attr("fill", "green")
		.on("mouseover", function(d){
			d3.select(this)
				.attr("fill", "lightGreen")
				.attr("r", 7)
				.attr("stroke", "black");})
		.on("mouseout", function(d){
			d3.select(this)
				.attr("r", 5)
				.attr("fill", "green")
				.attr("stroke", "null");})
		.on("click", function(event, d){
				showEdition(d);
		});

	// Draw axes

	svg.select(".x-axis")
		.transition()
		.duration(800)
		.ease(d3.easeLinear)
		.call(xAxis);

	svg.select(".y-axis")
		.transition()
		.duration(800)
		.ease(d3.easeLinear)
		.call(yAxis);

	if (selection === "AVERAGE_ATTENDANCE") {
		svg.select(".yLab")
			.text("AVERAGE ATTENDANCE")
	} else if (selection === "AVERAGE_GOALS") {
		svg.select(".yLab")
			.text("AVERAGE GOALS")
	} else {
		svg.select(".yLab")
			.text(selection)
	};

}


// Show details for a specific FIFA World Cup
function showEdition(d){
	console.log(d.YEAR);

	d3.select("#cupTitle")
		.text(d.EDITION);

	d3.select("#tbl_location")
		.text(d.LOCATION + ", " + formatDate(d.YEAR));

	d3.select("#tbl_teams")
		.text(d.TEAMS);

	d3.select("#tbl_matches")
		.text(d.MATCHES);

	d3.select("#tbl_goals")
		.text(d.GOALS);

	d3.select("#tbl_avgGoals")
		.text(d.AVERAGE_GOALS);

	d3.select("#tbl_avgAttendance")
		.text(formatAsThousands(d.AVERAGE_ATTENDANCE));

	d3.select("#tbl_winner")
		.text(d.WINNER);
	
}
