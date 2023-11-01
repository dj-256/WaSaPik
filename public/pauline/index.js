//Dimensions and margins of the graph
const margin = { top: 10, right: 20, bottom: 30, left: 50 },
  width = 1000 - margin.left - margin.right,
  height = 720 - margin.top - margin.bottom;

//Function to check if we were able to load the whole json file without errors
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

const genreType = ["Multiples genres", "Metal", "Pop", "Rock"];
const genreID = ["noGenre", "metal", "pop", "rock"];
let currentGenre = 0;

//Display the selected genre
function filterData() {
  let select = document.getElementsByName("genre")[0];
  let choice = select.selectedIndex;
  let value = select.options[choice].value;
  for (let i = 0; i < genreType.length; i++) {
    let element = document.getElementById(genreID[i])
    if (value === genreType[i]) {
      element.style.display = "initial";
      currentGenre = i;
    }
    else {
      element.style.display = "none";
    }
  }
  updateChart();
}

//Append svg to the body of the page
function createsvg() {
  var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");
  return svg;
}


window.onload = async function () {
  var div = d3.select("body").append("div")
    .attr("class", "tooltip-text")
    .style("opacity", 0);

  let svg = createsvg();
  //Read the data & print data
  d3.json("../data/json/songWithGenre.json").then(data => {
    const parseTime = d3.timeParse("%Y-%m-%d");

    let dataFilter = []
    //Find the latest publication date for X axis
    var dates = [];

    for (let obj of data) {
      if (obj.publicationDate === "") continue;
      d = parseTime(obj.publicationDate)
      if (d.getFullYear() >= 1990) {
        dates.push(d);
        dataFilter.push(obj);
      }
    }

    //Format for time
    const parseYear = d3.timeParse("%Y");
    var domain = d3.extent(dates);
    let dateScale = d3.scaleTime()
      .domain(domain)
      .range([1, width]);
    const xAxis = d3.axisBottom(dateScale).tickFormat(d3.timeFormat("%Y"));
    xAxis.ticks(d3.timeYear.every(1));
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    // Add Y axis which correspond to the duration of the song
    var y_length = d3.scaleLinear()
      .domain([90, 300])
      .range([height, 0]);

    svg.append("g")
      .call(d3.axisLeft(y_length));

    // Add a scale for bubble size depending of lyrics length
    let lyrics_scale = d3.scaleThreshold()
      .domain([100, 150, 200, 250, 300])
      .range([2.5, 5.0, 7.5, 10.0, 12.5]);

    //Color scale for the BPM of the song
    //couleur TODO
    let bpm_scale = d3.scaleLinear([0, 100], ["red", "blue"]).unknown("#ccc");

    dataFilter = dataFilter.filter(d => ((d.length >= 95) && (d.length < 300) && (d.lyrics > 90) && (d.lyrics < 900)));

    const popSongs = dataFilter.filter(d => d.genre.includes("Pop"));
    const rockSongs = dataFilter.filter(d => d.genre.includes("Rock"));
    const metalSongs = dataFilter.filter(d => d.genre.includes("Metal"));
    const elseSongs = dataFilter.filter(d => (d.genre.includes("Soul") || d.genre.includes("Emo") || d.genre.includes("Gothic") 
    || d.genre.includes("Jazz") || d.genre.includes("Electro") || d.genre.includes("Blues") || d.genre.includes("Lo-Fi") || d.genre.includes("Disco") || d.genre.includes("Celtic")));

    //Songs without genre
    svg.append('g')
      //id on the container to be able to toggle display
      .attr("id", "noGenre")
      .selectAll("dot")
      .data(elseSongs)
      .enter()
      .append("circle")
      .attr("cx", function (d) { return dateScale(parseTime(d.publicationDate)); })
      .attr("cy", function (d) { return y_length(d.length); })
      .attr("r", function (d) { return lyrics_scale(d.lyrics); })
      .style("fill", d => bpm_scale(d.bpm))
      .attr("lyrics", function (d) { return d.lyrics })
      .style("opacity", "0.7")
      .attr("stroke", "black")
      .on('mouseover', function (d, i) {
        d3.select(this).transition()
          .duration('50')
          .attr('opacity', '.85');
        div.transition()
          .duration(50)
          .style("opacity", 1)
        let divContent = "Titre : " + d.title + " - Auteur : " + d.name;
        div.html(divContent)
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 15) + "px");
      }).on('mouseout', function (d, i) {
        d3.select(this).transition()
          .duration('50')
          .attr('opacity', '1');
        div.transition()
          .duration('50')
          .style("opacity", 0);
      });

    //Pop songs
    svg.append('g')
      .attr("id", "pop")
      .selectAll("rect")
      .data(popSongs)
      .enter()
      .append("rect")
      .attr("x", function (d) { return dateScale(parseTime(d.publicationDate)); })
      .attr("y", function (d) { return y_length(d.length); })
      .attr("width", function (d) { return lyrics_scale(d.lyrics); })
      .attr("height", function (d) { return lyrics_scale(d.lyrics); })
      .style("fill", d => bpm_scale(d.bpm))
      .attr("lyrics", function (d) { return d.lyrics })
      .style("opacity", "0.7")
      .attr("stroke", "black")
      .on('mouseover', function (d, i) {
        d3.select(this).transition()
          .duration('50')
          .attr('opacity', '.85');
        div.transition()
          .duration(50)
          .style("opacity", 1);
        let divContent = "Titre : " + d.title + " - Auteur : " + d.name;
        div.html(divContent)
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 15) + "px");
      }).on('mouseout', function (d, i) {
        d3.select(this).transition()
          .duration('50')
          .attr('opacity', '1');
        div.transition()
          .duration('50')
          .style("opacity", 0);
      });

    //Rock songs
    svg.append('g')
      .attr("id", "rock")
      .selectAll("path")
      .data(rockSongs)
      .enter()
      .append("path")
      .attr("d", d3.symbol().type(d3.symbolStar))
      .attr("transform", function (d) {
        return "translate(" + dateScale(parseTime(d.publicationDate)) + "," + y_length(d.length) + ")";
      })
      .attr("r", function (d) {
        return lyrics_scale(d.lyrics);
      })
      .style("fill", function (d) {
        return bpm_scale(d.bpm);
      })
      .attr("lyrics", function (d) { return d.lyrics })
      .attr("class", "rock")
      .style("opacity", "0.7")
      .attr("stroke", "black")
      .on('mouseover', function (d, i) {
        d3.select(this).transition()
          .duration('50')
          .attr('opacity', '.85');
        div.transition()
          .duration(50)
          .style("opacity", 1);
        let divContent = "Titre : " + d.title + " - Auteur : " + d.name;
        div.html(divContent)
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 15) + "px");
      }).on('mouseout', function (d, i) {
        d3.select(this).transition()
          .duration('50')
          .attr('opacity', '1');
        div.transition()
          .duration('50')
          .style("opacity", 0);
      });

    //Metal songs
    svg.append('g')
      .attr("id", "metal")
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
      .attr("class", "metal")
      .attr("lyrics", function (d) { return d.lyrics })
      .style("opacity", "0.7")
      .attr("stroke", "black")
      .on('mouseover', function (d, i) {
        d3.select(this).transition()
          .duration('50')
          .attr('opacity', '.85');
        div.transition()
          .duration(50)
          .style("opacity", 1);
        let divContent = "Titre : " + d.title + " - Auteur : " + d.name;
        div.html(divContent)
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 15) + "px");
      }).on('mouseout', function (d, i) {
        d3.select(this).transition()
          .duration('50')
          .attr('opacity', '1');
        div.transition()
          .duration('50')
          .style("opacity", 0);
      });
  })

  updateChart();
}

function getMinMaxValue() {
  let minValue = parseInt(document.getElementById("minInput").value);
  let maxValue = parseInt(document.getElementById("maxInput").value);

  if (minValue < maxValue) {
    return [minValue, maxValue];
  }
  else {
    return [maxValue, minValue];
  }
}


function updateChart() {
  let value = getMinMaxValue();
  let minValue = value[0];
  let maxValue = value[1];

  let type;
  switch (currentGenre) {
    case 0:
      type = "circle";
      break;
    case 1:
      type = "path";
      break;
    case 2:
      type = "rect"
      break;
    case 3:
      type = "path";
      break;
    default:
      break;
  }

  let nodes = d3.selectAll(type);
  let displayedNodes;
  let hiddenNodes;

  if (type == "path") {
    displayedNodes = nodes.filter(function () {
      return ((parseInt(d3.select(this).attr("lyrics")) >= minValue) && (d3.select(this).attr("class") === genreID[currentGenre] || d3.select(this).attr("class") === "domain") && (parseInt(d3.select(this).attr("lyrics")) <= maxValue));
    });

    hiddenNodes = nodes.filter(function () {
      return !((parseInt(d3.select(this).attr("lyrics")) >= minValue) && (d3.select(this).attr("class") === genreID[currentGenre]) && (parseInt(d3.select(this).attr("lyrics")) <= maxValue)) && !(d3.select(this).attr("class") === "domain");
    })
  }

  else {
    displayedNodes = nodes.filter(function () {
      return ((parseInt(d3.select(this).attr("lyrics")) >= minValue) && (parseInt(d3.select(this).attr("lyrics")) <= maxValue));
    });

    hiddenNodes = nodes.filter(function () {
      return !((parseInt(d3.select(this).attr("lyrics")) >= minValue) && (parseInt(d3.select(this).attr("lyrics")) <= maxValue));
    })
  }

  hiddenNodes.style("display", "none");
  displayedNodes.style("display", "initial");
}

