function loadJSON(file) {
  return new Promise((resolve, reject) => {
    d3.json(file, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}


/*window.onload = async function(){
// set the dimensions and margins of the graph
var margin = { top: 10, right: 20, bottom: 30, left: 50 },
width = 1000 - margin.left - margin.right,
height = 720 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform",
  "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.json("../data/album.json").then(data => {
  const parseTime = d3.timeParse("%Y-%m-%d");

  //preration for X axis
  var dates = []

console.log(Object.keys(data))
  for (let obj of data) {
    if (obj.publicationDate === "") continue;
    else{
    d = parseTime(obj.publicationDate)
    console.log(obj.publicationDate)
    if (d.getFullYear() >= 1985)
      dates.push(d);}
  }

  const parseYear = d3.timeParse("%Y");

  var domain = d3.extent(dates);

  var dateScale = d3.scaleTime()
    .domain(domain)
    .range([1, width]);

  const xAxis = d3.axisBottom(dateScale).tickFormat(d3.timeFormat("%Y-%m"));
  xAxis.ticks(d3.timeYear.every(1));

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  // Add Y axis
  var y_length = d3.scaleLinear()
    .domain([90, 300])
    .range([height, 0]);

  svg.append("g")
    .call(d3.axisLeft(y_length));

  // Add a scale for bubble size
  lyrics_scale = d3.scaleThreshold()
    .domain([100, 150, 200, 250, 300])
    .range([2.5, 5.0, 7.5, 10.0, 12.5]);

  //couleur TODO better scale
  let bpm_scale = d3.scaleLinear([0, 100], ["red", "blue"]).unknown("#ccc");


  let dataFilter = data.filter(d => d.publicationDate >= 1985 && d.totalLength >= 90);
  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return dateScale(parseTime(d.publicationDate)); })
    .attr("cy", function (d) { return y_length(d.totalLength); })
    .attr("r", function (d) { return lyrics_scale(len(d.songs)); })
    .style("fill", d => bpm_scale(0))
    .style("opacity", "0.7")
    .attr("stroke", "black")
})
}*/


window.onload = async function () {
  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 20, bottom: 30, left: 50 },
    width = 1000 - margin.left - margin.right,
    height = 720 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  //Read the data
  d3.json("../data/songWithGenre.json").then(data => {
    const parseTime = d3.timeParse("%Y-%m-%d");

    songs = []

    let dataFilter = []
    //preration for X axis
    var dates = [];
    for (let obj of data) {
      if (obj.publicationDate === "") continue;
      d = parseTime(obj.publicationDate)
      if (d.getFullYear() >= 1985) {
        dates.push(d);
        dataFilter.push(obj);
      }
    }

    const parseYear = d3.timeParse("%Y");

    var domain = d3.extent(dates);

    var dateScale = d3.scaleTime()
      .domain(domain)
      .range([1, width]);

    const xAxis = d3.axisBottom(dateScale).tickFormat(d3.timeFormat("%Y"));
    xAxis.ticks(d3.timeYear.every(1));

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    // Add Y axis
    var y_length = d3.scaleLinear()
      .domain([90, 300])
      .range([height, 0]);

    svg.append("g")
      .call(d3.axisLeft(y_length));

    // Add a scale for bubble size
    lyrics_scale = d3.scaleThreshold()
      .domain([100, 150, 200, 250, 300])
      .range([2.5, 5.0, 7.5, 10.0, 12.5]);

    //couleur TODO better scale
    let bpm_scale = d3.scaleLinear([0, 100], ["red", "blue"]).unknown("#ccc");

    dataFilter = dataFilter.filter(d => (d.length >= 90));

    const popSongs = dataFilter.filter(d => d.genre.includes("Pop"));
    const rockSongs = dataFilter.filter(d => d.genre.includes("Rock"));
    const metalSongs = dataFilter.filter(d => d.genre.includes("Metal"));
    const elseSongs = dataFilter.filter(d => !(d.genre.includes("Pop") || d.genre.includes("Rock") || d.genre.includes("Metal")))

    // Add dots
    svg.append('g')
      .selectAll("dot")
      .data(elseSongs)
      .enter()
      .append("circle")
      .attr("cx", function (d) { return dateScale(parseTime(d.publicationDate)); })
      .attr("cy", function (d) { return y_length(d.length); })
      .attr("r", function (d) { return lyrics_scale(d.lyrics); })
      .attr("class", "elseSongs")
      .style("fill", d => bpm_scale(d.bpm))
      .style("opacity", "0.7")
      .attr("stroke", "black")

    svg.append('g')
      .selectAll("rect")
      .data(popSongs)
      .enter()
      .append("rect")
      .attr("x", function (d) { return dateScale(parseTime(d.publicationDate)); })
      .attr("y", function (d) { return y_length(d.length); })
      .attr("width", function (d) { return lyrics_scale(d.lyrics); }) // Vous pouvez ajuster cette valeur en fonction de vos données
      .attr("height", function (d) { return lyrics_scale(d.lyrics); }) // Vous pouvez ajuster cette valeur en fonction de vos données
      .attr("class", "popSongs")
      .style("fill", d => bpm_scale(d.bpm))
      .style("opacity", "0.7")
      .attr("stroke", "black");

    svg.append('g')
      .selectAll("path")
      .data(rockSongs)
      .enter()
      .append("path")
      .attr("d", d3.symbol().type(d3.symbolStar))
      .attr("transform", function (d) {
        return "translate(" + dateScale(parseTime(d.publicationDate)) + "," + y_length(d.length) + ")";
      })
      .attr("r", function (d) {
        // Vous pouvez ajuster cette valeur en fonction de vos données
        return lyrics_scale(d.lyrics);
      })
      .style("fill", function (d) {
        // Assurez-vous que bpm_scale est une échelle appropriée pour les couleurs
        return bpm_scale(d.bpm);
      })
      .attr("class", "rockSongs")
      .style("opacity", "0.7")
      .attr("stroke", "black");

    svg.append('g')
      .selectAll("path")
      .data(metalSongs)
      .enter()
      .append("path")
      .attr("d", d3.symbol().type(d3.symbolTriangle))  
      .attr("transform", function (d) {
        return "translate(" + dateScale(parseTime(d.publicationDate)) + "," + y_length(d.length) + ")";
      })
      .attr("r", function (d) {
        return lyrics_scale(d.lyrics);
      })
      .style("fill", function (d) {
        return bpm_scale(d.bpm);
      })
      .attr("class", "metalSongs")
      .style("opacity", "0.7")
      .attr("stroke", "black");
  })
}


