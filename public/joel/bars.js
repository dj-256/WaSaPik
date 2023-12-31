import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import songsByStreamingService from "./songsByStreamingService.js";

export const drawBars = () => {
  let containerWidth = 1000;
  let containerHeight = 500;
  let marginTop = 50;
  let marginBottom = 50;
  let marginLeft = 50;
  let marginRight = 50;
  let logoPadding = 10;

  const filter = new Set(songsByStreamingService.map((d) => d.name));
  const container = d3
    .select("#container")
    .attr("width", containerWidth)
    .attr("height", containerHeight);

  let data = [];

  // add a tooltip
  const tooltip = d3.select("body").append("div").attr("class", "bar tooltip");

  const draw = () => {
    data = songsByStreamingService.filter((d) => filter.has(d.name));

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([marginLeft, containerWidth - marginRight])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, 100000])
      .range([containerHeight - marginBottom, marginTop]);

    const drawBar = (d, i) => {
      // thx copilot
      let x = xScale(data[i].name);
      let y = yScale(d) - marginBottom;
      let width = xScale.bandwidth();
      let height = containerHeight - yScale(d);
      let radius = 10;
      return `M ${x} ${y}
            h ${width - radius}
            a ${radius} ${radius} 0 0 1 ${radius} ${radius}
            v ${height - radius - 0.5}
            h ${-width}
            v ${-height + radius + 0.5}
            a ${radius} ${radius} 0 0 1 ${radius} ${-radius}`;
    };

    const drawBarSmall = (d, i) => {
      // thx copilot
      let x = xScale(data[i].name);
      let width = xScale.bandwidth();
      let radius = 10;
      return `M ${x} ${containerHeight - marginBottom - 10}
            h ${width - radius}
            a ${radius} ${radius} 0 0 1 ${radius} ${radius}
            v ${10 - radius - 0.5}
            h ${-width}
            v ${-10 + radius + 0.5}
            a ${radius} ${radius} 0 0 1 ${radius} ${-radius}`;
    };

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    const t = d3.transition().duration(750);

    container
      .select(".x-axis")
      .transition(d3.transition().duration(750))
      .call(xAxis);

    container.select(".y-axis").call(yAxis);

    container
      .selectAll(".bar")
      .data(
        data.map((d) => d.value),
        (d) => d.name,
      )
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("fill", "url(#gradient)")
            .attr("class", "bar")
            .attr("d", (d, i) => drawBarSmall(d, i))
            .call((enter) =>
              enter.transition(t).attr("d", (d, i) => drawBar(d, i)),
            ),
        (update) =>
          update.call((update) =>
            update.transition(t).attr("d", (d, i) => drawBar(d, i)),
          ),
        (exit) =>
          exit.call((exit) =>
            exit
              .transition(d3.transition().duration(250))
              .attr("fill", "#FFFFFF")
              .remove(),
          ),
      );

    container
      .selectAll("image")
      .data(data, (d) => d.name)
      .join(
        (enter) =>
          enter
            .append("image")
            .attr("xlink:href", (d) => "../data/images/logo_" + d.name + ".png")
            .attr("width", 0.5 * xScale.bandwidth())
            .attr("height", 0.5 * xScale.bandwidth())
            .attr("class", (d) => "logo " + d.name.toLowerCase())
            .attr("x", (d) => xScale(d.name) + 0.25 * xScale.bandwidth())
            .attr(
              "y",
              containerHeight -
                10 -
                marginBottom -
                logoPadding -
                0.5 * xScale.bandwidth(),
            )
            .call((enter) =>
              enter
                .transition(t)
                .attr(
                  "y",
                  (d) =>
                    yScale(d.value) -
                    marginBottom -
                    logoPadding -
                    0.5 * xScale.bandwidth(),
                ),
            ),
        (update) =>
          update.call((update) =>
            update
              .transition(t)
              .attr("width", 0.5 * xScale.bandwidth())
              .attr("height", 0.5 * xScale.bandwidth())
              .attr("x", (d) => xScale(d.name) + 0.25 * xScale.bandwidth())
              .attr(
                "y",
                (d) =>
                  yScale(d.value) -
                  marginBottom -
                  logoPadding -
                  0.5 * xScale.bandwidth(),
              ),
          ),
        (exit) =>
          exit.call((exit) =>
            exit
              .transition(d3.transition().duration(200))
              .style("opacity", 0)
              .remove(),
          ),
      );

    d3.select(".filter-buttons")
      .selectAll(".filter-button")
      .data(songsByStreamingService, (d) => d.name)
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
      .selectAll(".bar")
      .on("mouseenter", function (event, d) {
        // Display a tooltip with the current size
        tooltip.transition().duration(400).style("opacity", 0.9);
        tooltip.text(d + " songs");

        // highlight the current path
        const selection = d3.select(this).transition("tooltip").duration(400);
        selection
          .select("path")
          .style("stroke-width", 3)
          .style("fill-opacity", 0.1)
          .style("stroke-opacity", 1);
      })

      .on("mousemove", function () {
        tooltip
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
      })

      .on("mouseleave", function () {
        tooltip.transition().duration(400).style("opacity", 0);
        const selection = d3.select(this).transition("tooltip").duration(400);
        selection
          .select("path")
          .style("stroke-width", 0)
          .style("fill-opacity", 0.0)
          .style("stroke-opacity", 0);
      });
  };

  container
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${containerHeight - marginBottom})`);

  container
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${marginLeft}, 0)`);

  d3.select("#main")
    .append("div")
    .attr("class", "filter-buttons")
    .style("display", "flex")
    .style("gap", "1em");

  draw();
};
