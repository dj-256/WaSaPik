import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import songsByStreamingService from "./songsByStreamingService.js";
import { drawBubbles } from "./bubbles.js";
import { drawBars } from "./bars.js";

let viz = "bars";
const filter = new Set(songsByStreamingService.map((d) => d.name));
const fullVizNames = {
  bars: "Bar chart",
  bubbles: "Bubbles",
};
let current;

const bubblesColors = [
  "#005f73",
  "#0a9396",
  "#ee9b00",
  "#ca6702",
  "#bb3e03",
  "#ae2012",
  "#9b2226",
  "#001219",
];

const draw = () => {
  d3.select(".viz-select")
    .selectAll(".viz-option")
    .data(["bars", "bubbles"])
    .join(
      (enter) =>
        enter
          .append("span")
          .attr("class", "viz-option")
          .classed("selected", (d) => d === viz)
          .text((d) => fullVizNames[d])
          .on("click", (e, d) => {
            if (d === viz) return;
            viz = d;
            d3.select("#container").selectAll("g, path, image").remove();
            d3.select(".filter-buttons").remove();
            draw();
          }),
      (update) => update.classed("selected", (d) => d === viz),
      (exit) => exit.remove(),
    );

  if (viz === "bars") {
    drawBars();
  } else {
    drawBubbles();
  }
};

draw();
