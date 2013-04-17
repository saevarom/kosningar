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

  g = svg.data([root]).selectAll("path")
    .data(partition.nodes)
  .enter().append("g")

  path = g.append("svg:path")
    .attr("d", arc)
    //.attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
    .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
    .on("click", magnify)
    .style("opacity", "0.8")
    .style("stroke", "#fff")

    .each(stash);


  g.append("text")
    .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
    .attr("x", function(d) { return 0;  }) 
    .attr("text-anchor", "middle")
    .attr("y", function(d) { return 0; })
    .text(function(d) { return d.name + ' (' + intBeutify(d.value) + ' kr)'; });

  
});

// Distort the specified node to 80% of its parent.
function magnify(node) {

  if (node.depth <= 1) {

    if (parent = node.parent) {
      var parent,
          x = parent.x,
          k = .8;
      parent.children.forEach(function(sibling) {
        x += reposition(sibling, x, sibling === node
            ? parent.dx * k / node.value
            : parent.dx * (1 - k) / (parent.value - node.value));
      });
    } else {
      reposition(node, 0, node.dx / node.value);
    }

    path.transition()
        .duration(750)
        .attrTween("d", arcTween);
  }
}


// Recursively reposition the node at position x with scale k.
function reposition(node, x, k) {
  node.x = x;
  if (node.children && (n = node.children.length)) {
    var i = -1, n;
    while (++i < n) x += reposition(node.children[i], x, k);
  }
  return node.dx = node.value * k;
}


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
