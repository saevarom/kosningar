var width = 960,
    height = 600;

var color = d3.scale.linear()
  .domain([0, 0.5, 1])
  .range(["darkblue","#eee","deeppink"]); 

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
    svfById.set(d.svf_id, {ratio: parseInt(d.konur) / (parseInt(d.karlar)+ parseInt(d.konur)), konur: d.konur, karlar: d.karlar});
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
            return color(obj.ratio);
          }
        });



    $('svg .kjordaemi').tipsy({
      gravity: 'w',
      html: true,
      title: function() {
        var d = this.__data__;
        var obj = svfById.get(d.id);
        if (obj !== undefined) {
          return d.properties.name + "<br/>Konur: " + obj.konur + "<br/>Karlar: " + obj.karlar;
        }
        else {
          return d.properties.name;
        }
      }
    });

    var legendData = [
      {value: 0, label: "100% karlar"},
      {value: 0.1, label: ""},
      {value: 0.2, label: ""},
      {value: 0.3, label: ""},
      {value: 0.4, label: ""},
      {value: 0.5, label: "Jafnt hlutfall"},
      {value: 0.6, label: ""},
      {value: 0.7, label: ""},
      {value: 0.8, label: ""},
      {value: 0.9, label: ""},
      {value: 1, label: "100% konur"}
    ];

    var legend = svg.selectAll(".legend")
          .data(legendData)
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