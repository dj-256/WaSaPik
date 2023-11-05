window.onload = async function () {
  const countriesStats = await d3.json("../data/json/countryStats.json");
  const countryNames = await d3.json("../data/json/iso2toname.json");
  var tree2 = {
    name: "World",
    children: [],
  };

  d3.json("../data/json/song.json").then((songsData) => {
    var albumsIds = [...new Set(songsData.map((d) => d.id_album))];
    d3.json("../data/json/album.json").then((albumsData) => {
      //transform data to only keep those with a country
      var albumsWithCountryData = {};
      for (var i = 0; i < albumsIds.length; i++) {
        if (albumsData[albumsIds[i]].country != "") {
          albumsWithCountryData[albumsIds[i]] = albumsData[albumsIds[i]];
        }
      }

      //list of unique countries using d3
      var countries = [
        ...new Set(Object.values(albumsWithCountryData).map((d) => d.country)),
      ];

      d3.json(
        "https://raw.githubusercontent.com/rapomon/geojson-places/master/data/continents/continents.json",
      )
        .then(async (continents) => {
          //create a tree with children continent -> country -> artist -> album -> song
          for (var i = 0; i < continents.length; i++) {
            var continent = continents[i];
            var continentObj = {
              name: continent.continent_name,
              type: "continents",
              children: [],
            };
            for (var j = 0; j < countries.length; j++) {
              var country = countries[j];
              if (continent.countries.includes(country)) {
                var countryObj = {
                  name: countryNames[country],
                  type: "countries",
                  children: [],
                };
              } else {
                continue;
              }

              //retrieve the ids of the albums of the country
              var treeAlbumsIds = Object.keys(albumsWithCountryData).filter(
                (d) => albumsWithCountryData[d].country == country,
              );

              for (var k = 0; k < treeAlbumsIds.length; k++) {
                var albumId = treeAlbumsIds[k];
                var albumObj = {
                  name: albumsWithCountryData[albumId].title,
                  type: "albums",
                  children: [],
                };
                //retrieve the ids of the songs of the album
                var treeSongsIds = Object.keys(songsData).filter(
                  (d) => songsData[d].id_album == albumId,
                );
                for (var l = 0; l < treeSongsIds.length; l++) {
                  var songId = treeSongsIds[l];
                  var songObj = {
                    name: songsData[songId].title,
                    type: "songs",
                  };
                  albumObj.children.push(songObj);
                }
                countryObj.children.push(albumObj);
              }
              continentObj.children.push(countryObj);
            }
            tree2.children.push(continentObj);
          }
        })
        .then(() => {
          document.getElementById("loader").remove();
          // set the dimensions and margins of the graph
          const margin = { top: 10, right: 20, bottom: 30, left: 50 };
          const width = 1500 - margin.left - margin.right;
          const height = 3000 - margin.top - margin.bottom;

          // append the svg object to the body of the page
          const svg = d3
            .select("#my_dataviz")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr(
              "transform",
              "translate(" + margin.left + "," + margin.top + ")",
            );

          var i = 0,
            duration = 750;

          //This D3.js tree was screated thanks to this tutorial: https://gist.github.com/d3noob/1a96af738c89b88723eb63456beb6510
          var root = d3.hierarchy(tree2, function (d) {
            return d.children;
          });
          root.dx = 20;
          root.dy = width / (root.height + 1);

          var treemap = d3.tree().size([height, width]);

          // Collapse after the second level
          root.children.forEach(collapse);

          update(root, 0);

          // Collapse the node and all it's children
          function collapse(d) {
            if (d.children) {
              d._children = d.children;
              d._children.forEach(collapse);
              d.children = null;
            }
          }

          function update(source, level) {
            // Assigns the x and y position for the nodes
            const treeData = treemap(root);

            // Compute the new tree layout.
            const nodes = treeData.descendants(),
              links = treeData.descendants().slice(1);

            // Normalize for fixed-depth.
            nodes.forEach(function (d) {
              d.y = d.depth * 180;
            });

            // ****************** Nodes section ***************************

            // Update the nodes...
            const node = svg
              .selectAll("g.node")
              .style("height", function (d) {
                return (
                  (d.children
                    ? d.children.length
                    : d._children
                    ? d._children.length
                    : 0) *
                    0.7 +
                  "px"
                );
              })
              .data(nodes, function (d) {
                return d.id || (d.id = ++i);
              });

            // Enter any new modes at the parent's previous position.
            const nodeEnter = node
              .enter()
              .append("g")
              .attr("class", "node")
              .attr("transform", function (d) {
                return "translate(" + source.y + "," + source.x + ")";
              })
              .on("click", click)
              //add tooltip when hovering over a node and write the number of children
              .on("mouseover", function (d) {
                //if there is no ongoing animation then create a tooltip
                if (d3.active(this) == null) {
                  var tooltip = d3
                    .select("#my_dataviz")
                    .append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

                  tooltip.transition().duration(200).style("opacity", 0.9);
                }

                function getBpm(d) {
                  var bpm = 0;
                  var iso2 = Object.keys(countryNames).find(
                    (key) => countryNames[key] === d.data.name,
                  );
                  if (
                    iso2 != undefined &&
                    countriesStats.countries[iso2] != undefined
                  ) {
                    bpm = Math.round(
                      countriesStats.countries[iso2].average_bpm,
                    );
                    return "<b>Average BPM:</b> " + bpm + "<br/>";
                  }
                  return "";
                }

                if (tooltip != undefined) {
                  tooltip
                    .html(
                      "<b>Name:</b> " +
                        d.data.name +
                        "<br/>" +
                        getBpm(d) +
                        "<b>Number of " +
                        (d.children
                          ? d.children[0].data.type
                          : d._children
                          ? d._children[0].data.type
                          : "objects") +
                        ":</b> " +
                        (d.children
                          ? d.children.length
                          : d._children
                          ? d._children.length
                          : 0),
                    )
                    .style("left", d3.event.pageX + "px")
                    .style("top", d3.event.pageY + "px");
                }
              })

              .on("mouseout", function (d) {
                d3.select(".tooltip").remove();
              });

            // Add Circle for the nodes
            nodeEnter
              .append("circle")
              .attr("class", "node")
              .attr("r", 1e-6)
              .style("fill", function (d) {
                return d._children ? "#BCB6FF" : "#fff";
              });

            // Add labels for the nodes
            nodeEnter
              .append("text")
              .attr("dy", ".35em")
              .attr("x", function (d) {
                return d.children || d._children ? -13 : 13;
              })
              .attr("text-anchor", function (d) {
                return d.children || d._children ? "end" : "start";
              })
              .text(function (d) {
                return d.data.name;
              });

            // UPDATE
            const nodeUpdate = nodeEnter.merge(node);

            // Transition to the proper position for the node
            nodeUpdate
              .transition()
              .duration(duration)
              .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
              });

            // Update the node attributes and style
            nodeUpdate
              .select("circle.node")
              .attr("r", 10)
              .style("fill", function (d) {
                return d._children ? "#BCB6FF" : "#fff";
              })
              .style("scale", function (d) {
                var factor = d.children
                  ? d.children.length
                  : d._children
                  ? d._children.length
                  : 0;
                if (factor * 0.25 + 0.5 > 2.5) {
                  return 2.5;
                } else {
                  return factor * 0.25 + 0.5;
                }
              })
              .attr("cursor", "pointer");

            // Remove any exiting nodes
            const nodeExit = node
              .exit()
              .transition()
              .duration(duration)
              .attr("transform", function (d) {
                return "translate(" + source.y + "," + source.x + ")";
              })
              .remove();

            // On exit reduce the node circles size to 0
            nodeExit.select("circle").attr("r", 1e-6);

            // On exit reduce the opacity of text labels
            nodeExit.select("text").style("fill-opacity", 1e-6);

            // ****************** links section ***************************

            // Update the links...
            const link = svg.selectAll("path.link").data(links, function (d) {
              return d.id;
            });

            // Enter any new links at the parent's previous position.
            const linkEnter = link
              .enter()
              .insert("path", "g")
              .attr("class", "link")
              .attr("d", function (d) {
                const o = { x: source.x, y: source.y };
                return diagonal(o, o);
              });

            // UPDATE
            const linkUpdate = linkEnter.merge(link);

            // Transition back to the parent element position
            linkUpdate
              .transition()
              .duration(duration)
              .attr("d", function (d) {
                return diagonal(d, d.parent);
              });

            // Remove any exiting links
            link
              .exit()
              .transition()
              .duration(duration)
              .attr("d", function (d) {
                const o = { x: source.x, y: source.y };
                return diagonal(o, o);
              })
              .remove();

            // Store the old positions for transition.
            nodes.forEach(function (d) {
              d.x0 = d.x;
              d.y0 = d.y;
            });

            // Creates a curved (diagonal) path from parent to the child nodes
            function diagonal(s, d) {
              path = `M ${s.y} ${s.x}
          C ${(s.y + d.y) / 2} ${s.x},
            ${(s.y + d.y) / 2} ${d.x},
            ${d.y} ${d.x}`;

              return path;
            }

            // Toggle children on click.
            function click(d) {
              var newLevel = level;
              if (d.children) {
                d._children = d.children;
                d.children = null;
                newLevel = level == 0 ? 0 : level - 1;
              } else {
                d.children = d._children;
                d._children = null;
              }
              update(d, newLevel);
            }
          }

          d3.select("#legend")
            .append("div")
            .selectAll("span")
            .data(["Continent / ", "Country / ", "Album / ", "Song"])
            .enter()
            .append("span")
            .text(function (d) {
              return d;
            });
        });
    });
  });
};
