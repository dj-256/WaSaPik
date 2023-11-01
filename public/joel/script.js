import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import songsByStreamingService from "./songsByStreamingService.js";

let containerWidth = 1000;
let containerHeight = 500;
let marginTop = 50;
let marginBottom = 50;
let marginLeft = 50;
let marginRight = 50;
let logoPadding = 10;

// function roundToNearest(num) {
//     const power = Math.round(Math.log10(num));
//     const magnitude = Math.pow(10, power);
//     const mantissa = num / magnitude;
//     const roundedMantissa = Math.round(mantissa);
//     return roundedMantissa * magnitude;
// }

const filter = new Set(songsByStreamingService.map((d) => d.name));

const data = songsByStreamingService.filter((d) => filter.has(d.name));
const xScale = d3
  .scaleBand()
  .domain(data.map((d) => d.name))
  .range([marginLeft, containerWidth - marginRight])
  .padding(0.2);

const yScale = d3
  .scaleLinear()
  .domain([0, 100000])
  .range([containerHeight - marginBottom, marginTop]);

const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);

const container = d3
  .select("#container")
  .attr("width", containerWidth)
  .attr("height", containerHeight);

container
  .append("g")
  .attr("transform", `translate(0, ${containerHeight - marginBottom})`)
  .call(xAxis);

container
  .append("g")
  .attr("transform", `translate(${marginLeft}, 0)`)
  .call(yAxis);

container
  .selectAll(".bar")
  .data(data.map((d) => d.value))
  .enter()
  .append("path")
  .attr("fill", "url(#gradient)")
  .attr("class", "bar")
  .attr("d", (d, i) => {
    // thx copilot
    let x = xScale(data[i].name);
    let y = yScale(d) - marginBottom;
    let width = xScale.bandwidth();
    let height = containerHeight - yScale(d);
    let radius = 10;
    return `M ${x} ${y}
                    h ${width - radius}
                    a ${radius} ${radius} 0 0 1 ${radius} ${radius}
                    v ${height - radius}
                    h ${-width}
                    v ${-height + radius}
                    a ${radius} ${radius} 0 0 1 ${radius} ${-radius}`;
  });

container
  .append("g")
  .attr("class", "logos")
  .selectAll("image")
  .data(data)
  .enter()
  .append("image")
  .attr("xlink:href", (d) => "../data/images/logo_" + d.name + ".png")
  .attr("width", 0.5 * xScale.bandwidth())
  .attr("height", 0.5 * xScale.bandwidth())
  .attr("x", (d, i) => xScale(data[i].name) + 0.25 * xScale.bandwidth())
  .attr(
    "y",
    (d) =>
      yScale(d.value) - marginBottom - logoPadding - 0.5 * xScale.bandwidth(),
  );

const filterButtons = d3
  .select("#main")
  .append("div")
  .attr("class", "d-flex filterButtons")
  .selectAll(".filterButton")
  .data(songsByStreamingService)
  .enter()
  .append("span")
  .attr("class", "mx-2 py-2 px-3 badge rounded-pill bg-primary filterButton")
  .text((d) => d.name)
  .on("click", function (e, d) {
    if (filter.has(d.name)) {
      filter.delete(d.name);
    } else {
      filter.add(d.name);
    }
    container.selectAll(".bar").remove();
    container.selectAll("image").remove();
    filterButtons.selectAll(".filterButton").remove();
  })
  .exit()
  .remove();
