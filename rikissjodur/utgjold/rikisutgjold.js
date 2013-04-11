var width = 960,
    height = 680,
    radius = Math.min(width-30, height-30) / 2,
    color = d3.scale.category20c();

var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height * .52 + ")");

var partition = d3.layout.partition()
    .sort(null)
    .size([2 * Math.PI, radius * radius])
    .value(function(d) { return d.size; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx; })
    .innerRadius(function(d) { return Math.sqrt(d.y); })
    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

d3.json("utgjold.json", function(error, root) {

  console.log(root);

var g = svg.datum(root).selectAll("g")
    .data(partition.nodes)
    .enter().append("g");
    //.attr("transform", function(d) { return "translate(0," + d.x * 10 + ")"; });
    
  g.append("text")
    .attr("x", function(d) { return 0;  }) 
    .attr("text-anchor", "middle")
    .attr("y", function(d) { return 0; })
    .text(function(d) { return d.name + ' (' + intBeutify(d.value) + ' kr)'; });

  g.append("path")
    .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
    .attr("d", arc)
    .style("opacity", "0.8")
    .style("stroke", "#fff")
    .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
    .style("fill-rule", "evenodd")
    .each(stash);
});


// Stash the old values for transition.

function stash(d) {
  d.x0 = d.x;
  d.dx0 = d.dx;
}

// Interpolate the arcs in data space.
function arcTween(a) {
  var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
  return function(t) {
    var b = i(t);
    a.x0 = b.x;
    a.dx0 = b.dx;
    return arc(b);
  };
}

function intBeutify(nStr)
{
  nStr += '';
  x = nStr.split('.');
  x1 = x[0];
  x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + '.' + '$2');
  }
  return x1 + x2;
}

d3.select(self.frameElement).style("height", height + "px");
