import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as venn from "https://esm.run/@upsetjs/venn.js";
import songsByStreamingService from "./songsByStreamingService.js";
import intersections from "./intersections.js";

export const drawBubbles = () => {
  // #BCB6FF #B8E1FF #A9FFF7 #94FBAB #82ABA1
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

  let containerWidth = 1000;
  let containerHeight = 800;
  let marginTop = 50;
  let marginBottom = 50;
  let marginLeft = 50;
  let marginRight = 50;

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
  };
  d3.select("#main")
    .append("div")
    .attr("class", "filter-buttons")
    .style("display", "flex")
    .style("gap", "1em");

  draw();
};
