import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as venn from "https://esm.run/@upsetjs/venn.js";
import songsByStreamingService from "./songsByStreamingService.js";
import intersections from "./intersections.js";

export const drawBubbles = () => {
  const colors = [
    "#005f73",
    "#0a9396",
    "#ee9b00",
    "#ca6702",
    "#bb3e03",
    "#ae2012",
    "#9b2226",
    "#001219",
  ];

  let containerWidth = 600;
  let containerHeight = 600;

  const container = d3
    .select("#container")
    .attr("width", containerWidth)
    .attr("height", containerHeight);

  let baseData = songsByStreamingService
    .map((d) => ({
      sets: [d.name],
      size: d.value,
    }))
    .concat(intersections);

  const filter = new Set(
    songsByStreamingService
      .map((d) => d.name)
      .filter((d) => d !== "Hype Machine"),
  );

  // add a tooltip
  const tooltip = d3.select("body").append("div").attr("class", "venn tooltip");

  tooltip.append("div").attr("class", "sets");
  tooltip.append("div").attr("class", "songs");

  const draw = () => {
    const data = baseData.filter((d) => d.sets.every((s) => filter.has(s)));
    const buildVenn = venn
      .VennDiagram({
        colorScheme: colors,
      })
      .width(containerWidth)
      .height(containerHeight);
    const vennDiagram = container.datum(data).call(buildVenn);

    d3.select(".filter-buttons")
      .selectAll(".filter-button")
      .data(
        songsByStreamingService.filter((d) => d.name !== "Hype Machine"),
        (d) => d.name,
      )
      .join(
        (enter) =>
          enter
            .append("span")
            .attr("class", "filter-button")
            .classed("active", (d) => filter.has(d.name))
            .style("cursor", "pointer")
            .style("border-radius", "50em")
            .style("padding", "0.5em 1em")
            .text((d) => d.name)
            .on("click", function (e, d) {
              if (filter.has(d.name)) {
                filter.delete(d.name);
              } else {
                filter.add(d.name);
              }
              draw();
            }),
        (update) =>
          update.attr(
            "class",
            (d) =>
              "filter-button" + (filter.has(d.name) ? " active" : " inactive"),
          ),
      );

    // add listeners to all the groups to display tooltip on mouseenter
    container
      .selectAll("g")
      .on("mouseenter", function (event, d) {
        // sort all the areas relative to the current item
        venn.sortAreas(container, d);

        // Display a tooltip with the current size
        tooltip.transition().duration(400).style("opacity", 0.9);
        tooltip.select(".sets").text(d.sets.join(", "));
        tooltip.select(".songs").text(d.size + " songs");

        // highlight the current path
        const selection = d3.select(this).transition("tooltip").duration(400);
        selection
          .select("path")
          .style("stroke-width", 3)
          .style("fill-opacity", d.sets.length == 1 ? 0.4 : 0.1)
          .style("stroke-opacity", 1);
      })

      .on("mousemove", function () {
        tooltip
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
      })

      .on("mouseleave", function (event, d) {
        tooltip.transition().duration(400).style("opacity", 0);
        const selection = d3.select(this).transition("tooltip").duration(400);
        selection
          .select("path")
          .style("stroke-width", 0)
          .style("fill-opacity", d.sets.length == 1 ? 0.25 : 0.0)
          .style("stroke-opacity", 0);
      });
  };

  d3.select("#main")
    .append("div")
    .attr("class", "filter-buttons")
    .style("display", "flex")
    .style("gap", "1em");

  draw();
};
