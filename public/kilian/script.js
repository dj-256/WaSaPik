window.onload = async function() {
    bmpByCountryDic = await d3.json("/data/bpmCountry.json");
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
    .domain([bmpByCountryDic.min, bmpByCountryDic.max]);

    d3.json("https://raw.githubusercontent.com/epistler999/GeoLocation/master/world.json").then(data => {
        svg.append("g")
            .selectAll("path")
            .data(data.features)
            .enter().append("path")
            .attr("fill", function(d) {
                if(countryISOMapping[d.id]) {
                    var countryId = countryISOMapping[d.id].iso2;
                    var bpm = bmpByCountryDic.countries[countryId];
                    return colorScale(bpm);
                }
            })
            .attr("d", d3.geoPath().projection(gfg))
            .attr("class", "country")
            .on("click", function(d) {
                if(!countryISOMapping[d.id]) return;
                let countryName = countryISOMapping[d.id].name;
                let averageBpm = bmpByCountryDic.countries[countryISOMapping[d.id].iso2];

                document.getElementById("country-name").innerText = countryName;
                document.getElementById("bpm").innerText = averageBpm
                    ? Math.round(averageBpm) + " bpm" 
                    : "No data found";
            });
    })
}
