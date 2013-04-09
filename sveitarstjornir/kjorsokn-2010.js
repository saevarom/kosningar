var width = 960,
    height = 600;

// var color = d3.scale.linear()
//   .domain([0, 0.5, 1])
//   .range(["darkblue","#eee","deeppink"]); 
var color = d3.scale.threshold()
    .domain([50, 60, 70, 80, 90])
    .range(["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"]);

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

var projection = d3.geo.conicConformal()
    .center([0, 65])
    .rotate([18, 0])
    .parallels([18, 25])
    .scale(6500)
    .translate([width / 2, height / 2]);

d3.tsv("svf-by-gender.tsv", function(error, sveitarfelog){

  var svfById = d3.map();
  sveitarfelog.forEach(function(d, i){
    svfById.set(d.svf_id, {
      ratio: parseInt(d.konur) / (parseInt(d.karlar)+ parseInt(d.konur)), 
      konur: d.konur, 
      karlar: d.karlar,
      konurkjorskra: d.konurkjorskra,
      karlarkjorskra: d.karlarkjorskra,
      total: parseInt(d.konurkjorskra) + parseInt(d.karlarkjorskra),
      kjorsokn: 100* parseInt(d.thatttaka) / (parseInt(d.konurkjorskra) + parseInt(d.karlarkjorskra))
    });
  });

  d3.json("../maps/sveitarfelog.json", function(error, k) {
    var subunits = topojson.object(k, k.objects.sveitarfeloggeo);
    var path = d3.geo.path()
      .projection(projection);
    svg.append("path")
      .datum(subunits)
      .attr("d", path);
    svg.selectAll(".subunit")
      .data(subunits.geometries)
      .enter().append("path")
        .attr("class", function(d) { return "kjordaemi kjordaemi-" + d.id; })
        .attr("d", path)
        .attr("fill", function(d) {
          var obj = svfById.get(+d.id);
          if (obj !== undefined) {
            if (!isNaN(obj.kjorsokn)) {
              return color(obj.kjorsokn);
            } else {
              return "darkred"
            }
          } 
        });


    var formatter = d3.format(",g");
    $('svg .kjordaemi').tipsy({
      gravity: 'w',
      html: true,
      title: function() {
        var d = this.__data__;
        var obj = svfById.get(d.id);
        if (obj !== undefined) {
          if (!isNaN(obj.kjorsokn)) {
            return d.properties.name + "<br/>Kjörsókn: " + obj.kjorsokn.toFixed(2) + "%"
                   + "<br/>Á kjörskrá: " + formatter(obj.total);
          } else {
            return d.properties.name + "<br/>Kjörsókn: Gögn ekki til"
                   + "<br/>Á kjörskrá: " + formatter(obj.total);
          }
        }
        else {
          return d.properties.name;
        }
      }
    });

    var legendData = [
      {value: 50, label: "50% kjörsókn"},
      {value: 60, label: ""},
      {value: 70, label: ""},
      {value: 80, label: ""},
      {value: 90, label: ""},
      {value: 100, label: "100% kjörsókn"}
    ];

    var legend = svg.selectAll(".legend")
          .data(legendData.reverse())
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(-120," + (350 + i * 20) + ")"; });

      legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", function(d){ return color(d.value);});

      legend.append("text")
          .attr("x", width + 10)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "start")
          .text(function(d) { return d.label; });

  });

  
});
