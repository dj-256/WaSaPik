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


//determine the genre of the song depending of the album it belongs to
function findSongGenreByAlbum(){

}

window.onload = async function() {
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
    d3.json("../data/song.json").then(data => {
        const parseTime = d3.timeParse("%Y-%m-%d");
  
        //preration for X axis
        var dates = [];
        for (let obj of data) {
          if (obj.publicationDate === "") continue;
          d = parseTime(obj.publicationDate)
          if (d.getFullYear() >= 1985)
            dates.push(d);
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
  
  
        let dataFilter = data.filter(d => d.publicationDate >= 1985 && d.length >= 90);
        // Add dots
        svg.append('g')
          .selectAll("dot")
          .data(data)
          .enter()
          .append("circle")
          .attr("cx", function (d) { return dateScale(parseTime(d.publicationDate)); })
          .attr("cy", function (d) { return y_length(d.length); })
          .attr("r", function (d) { return lyrics_scale(d.lyrics); })
          .style("fill", d => bpm_scale(d.bpm))
          .style("opacity", "0.7")
          .attr("stroke", "black")
  
          //forme
          
          /*let genre_scale = d3.scaleOrdinal()
            .domain()
            .range()*/
    

})}


