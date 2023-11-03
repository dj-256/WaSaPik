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

const genreType = ["Jazz & Blues", "Metal", "Pop", "Rock"];
const genreID = ["jazzBlues", "metal", "pop", "rock"];
let currentGenre = 0;

//Display the selected genre
function filterData() {
  let select = document.getElementsByName("genre")[0];
  let choice = select.selectedIndex;
  let value = select.options[choice].value;
  //Find the chosen genre to
  for (let i = 0; i < genreType.length; i++) {
    let element = document.getElementById(genreID[i])
    if (value === genreType[i]) {
      element.style.display = "initial";
      currentGenre = i;
      if(i == 0)
        document.getElementById("jazzBluesDescription").style.display = "inline-block";
      else
        document.getElementById("jazzBluesDescription").style.display = "none";
    }
    else {
      element.style.display = "none";
    }
  }
  updateValues();
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


  svg.append("text")
    .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
    .style("text-anchor", "middle")
    .text("Année de parution");

  // Ajouter un titre à l'axe des ordonnées (Y)
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Longueur de la chanson (secondes)");

  return svg;
}

//Color scale for the BPM of the song
function bpm_scale(value) {
  if (value >= 50 && value < 100) {
    return "#B8E1FF";
  } else if (value >= 100 && value < 150) {
    return "#A9FFF7";
  } else if (value >= 150 && value < 200) {
    return "#94FBAB";
  } else {
    return "#82ABA1";
  }
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

    dataFilter = data.filter(d => ((d.length >= 95) && (d.length < 300) && (d.lyrics > 90) && (d.bpm >= 50)));
    dataFilter = dataFilter.filter(d => { let elem = parseTime(d.publicationDate); return (elem.getFullYear() >= 1990) && (elem.getFullYear() <= 2020) })

    //Find the latest publication date for X axis
    let dates = [];
    for (let obj of dataFilter) {
      d = parseTime(obj.publicationDate)
      dates.push(d);
    }

    //Format for time
    const parseYear = d3.timeParse("%Y");
    let domain = d3.extent(dates);
    let dateScale = d3.scaleTime()
      .domain(domain)
      .range([1, width]);
    const xAxis = d3.axisBottom(dateScale).tickFormat(d3.timeFormat("%Y"));
    xAxis.ticks(d3.timeYear.every(1));
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    //Add Y axis which correspond to the duration of the song
    let y_length = d3.scaleLinear()
      .domain([90, 300])
      .range([height, 0]);

    svg.append("g")
      .call(d3.axisLeft(y_length));

    //Add a scale for bubble size depending of lyrics length
    let lyrics_scale = d3.scaleThreshold()
      .domain([100, 200, 300, 400, 450])
      .range([5, 8, 10, 14.0, 20]);

    //Define the main categories
    const popSongs = dataFilter.filter(d => d.genre === ("Pop") );
    const rockSongs = dataFilter.filter(d => (d.genre === "Rock"));
    const metalSongs = dataFilter.filter(d => d.genre.includes("Metal"));
    const jazzSongs = dataFilter.filter(d => (d.genre.includes("Jazz")));
    const bluesSongs = dataFilter.filter(d => (d.genre.includes("Blues")));

    //Jazz songs
    svg.append('g')
      .attr("id", "jazzBlues")
      .selectAll("dot")
      .data(jazzSongs)
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

      //Add Blues songs to the same graph as the Jazz
      let gJazz_Blues = d3.select("g#jazzBlues");
      gJazz_Blues.selectAll("rect")
      .data(bluesSongs)
      .enter()
      .append("rect")
      .attr("x", function (d) { return dateScale(parseTime(d.publicationDate)); })
      .attr("y", function (d) { return y_length(d.length); })
      .attr("width", function (d) { return lyrics_scale(d.lyrics) *2; })
      .attr("height", function (d) { return lyrics_scale(d.lyrics) *2; })
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
      .selectAll("dot")
      .data(popSongs)
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
      .selectAll("dot")
      .data(rockSongs)
      .enter()
      .append("circle")
      .attr("cx", function (d) { return dateScale(parseTime(d.publicationDate)); })
      .attr("cy", function (d) { return y_length(d.length); })
      .attr("r", function (d) { return lyrics_scale(d.lyrics); })
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
      .selectAll("dot")
      .data(metalSongs)
      .enter()
      .append("circle")
      .attr("cx", function (d) { return dateScale(parseTime(d.publicationDate)); })
      .attr("cy", function (d) { return y_length(d.length); })
      .attr("r", function (d) { return lyrics_scale(d.lyrics); })
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

  updateValues();
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


function updateValues() {
  let value = getMinMaxValue();
  let minValue = value[0];
  let maxValue = value[1];

  let nodes;
  let displayedNodes;
  let hiddenNodes;

  if (currentGenre == 0) 
    nodes = d3.selectAll("circle, rect")
    
  else {
    nodes = d3.selectAll("circle")
    
  }
  displayedNodes = nodes.filter(function () {
      return ((parseInt(d3.select(this).attr("lyrics")) >= minValue) && (parseInt(d3.select(this).attr("lyrics")) <= maxValue));
    });

    hiddenNodes = nodes.filter(function () {
      return !((parseInt(d3.select(this).attr("lyrics")) >= minValue) && (parseInt(d3.select(this).attr("lyrics")) <= maxValue));
    })
  hiddenNodes.style("display", "none");
  displayedNodes.style("display", "initial");
}
