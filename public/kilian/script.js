window.onload = async function() {
    countryStats = await d3.json("/data/countryStats.json");
    countryISOMapping = await d3.json("/data/iso3.json");

    var svg = d3.select("#world-map")

    width = svg.attr("width"),  
    height = svg.attr("height");  
    
    var gfg = d3.geoNaturalEarth() 
    .scale(width / 1.5 / Math.PI)  
    .rotate([0, 0])  
    .center([0, 0])  
    .translate([width / 2, height / 3]);


    var colorScale = d3.scaleSequential(d3.interpolateViridis) 
    .domain([countryStats.min_bpm, countryStats.max_bpm]);

    d3.json("https://raw.githubusercontent.com/epistler999/GeoLocation/master/world.json").then(data => {
        svg.append("g")
            .selectAll("path")
            .data(data.features)
            .enter().append("path")
            .attr("fill", function(d) {
                if(!countryISOMapping[d.id])
                    return;

                var countryId = countryISOMapping[d.id].iso2;

                if(!countryStats.countries[countryId])
                    return;

                var bpm = countryStats.countries[countryId].average_bpm;
                return colorScale(bpm);
            })
            .attr("d", d3.geoPath().projection(gfg))
            .attr("class", "country")
            .on("click", function(d) {
                // Text info
                if(!countryISOMapping[d.id]) return;
                let countryName = countryISOMapping[d.id].name;
                let countryStat = countryStats.countries[countryISOMapping[d.id].iso2];
                if (!countryStat)
                    return;
                let averageBpm = countryStat.average_bpm;
                let averageLyrics = countryStat.average_lyrics;

                document.getElementById("country-name").innerText = countryName;
                document.getElementById("bpm").innerText = Math.round(averageBpm) + " bpm" 
                document.getElementById("lyrics").innerText = Math.round(averageLyrics) + " words"
                
                console.log(countryStat.genres)
                document.getElementById("genre-data").innerText = countryStat.genre_data;
                document.getElementById("genres-count").innerText = countryStat.genres_count;

                // Graph
                var chartSvg = d3.select("#country-char")
                chartSvg.selectAll("*").remove();
                
                if(countryStat.genres_count == 0)
                    return;


                const chartWidth = chartSvg.attr("width");
                const chartHeight = chartSvg.attr("height");
                const marginBottom = 100;
                const marginTop = 20;
                const marginLeft = 40;

                let genreData = countryStat.genres;
                genreData.sort((a, b) => b.count - a.count);
                const top40GenreData = genreData.slice(0, 40);

                const x = d3.scaleBand()
                    .domain(top40GenreData.map(d => d.genre))
                    .range([marginLeft, chartWidth - 0])
                    .padding(0.1);
                const xAxis = d3.axisBottom(x).tickSizeOuter(0);

                const maxY = d3.max(top40GenreData, d => d.count);
                const y = d3.scaleLinear()
                    .domain([0, maxY])
                    .range([chartHeight - marginBottom, marginTop]);

                const bar = chartSvg.append("g")
                    .attr("fill", "steelblue")
                    .selectAll("rect")
                    .data(top40GenreData)
                    .join("rect")
                    .style("mix-blend-mode", "multiply") // Darker color when bars overlap during the transition.
                    .attr("x", d => x(d.genre))
                    .attr("y", d => y(d.count))
                    .attr("height", d => y(0) - y(d.count))
                    .attr("width", x.bandwidth());

                const gx = chartSvg.append("g")
                    .attr("transform", `translate(0, ${chartHeight - marginBottom})`)
                    .call(xAxis)
                    .selectAll("text")
                    .style("text-anchor", "end") 
                    .attr("dx", "-1em")
                    .attr("dy", "-.6em")
                    .attr("transform", "rotate(-90)");
                
                const gy = chartSvg.append("g")
                    .attr("transform", `translate(${marginLeft},0)`)
                    .call(d3.axisLeft(y).ticks(10 > maxY ? maxY : 10).tickFormat(d3.format("d")))
                    .call(g => g.select(".domain").remove());
            });
    })
}