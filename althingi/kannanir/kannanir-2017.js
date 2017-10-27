function newFilledArray(len, val) {
    var a = [];
    while(len--){
        a.push(val);
    }
    return a;
}

var margin = {top: 20, right: 160, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y-%m-%d").parse;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.ordinal()
    .domain(["Annað", "Fl. fólksins", "Miðfl.", "Viðreisn", "Sjálfstæðisfl.", "Samf.", "Vinstri græn", "Framsóknarfl.", "Björt framtíð", "Píratar", "Lýðræðisvaktin", "Hreyfingin", "Borgarahreyfingin", "Samstaða",  "Hægri grænir", "Dögun", "Framfaraflokkurinn", "Lýðræðishreyfingin", "Regnboginn", "Landsbyggðarflokkurinn", "Flokkur heimilanna", "Alþýðufylkingin", "Húmanistaflokkurinn"])
    .range(["#ccc", "#cc188a", "#23a1bd",  "#ffcf00", "#0057a0", "#bb1f31", "#4c8e45", "#a6c96c", "#902a8e", "#222222", "#49519A", "#ccc", "#ccc", "#ccc", "#ccc", "#ccc", "#ccc", "#ccc", "#ccc", "#ccc", "#ccc", "#ccc", "#ccc", "#ccc", "#ccc", "#ccc", "#ccc", "#ccc"]);

var transitionLength = 1500;

var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(d3.time.weeks, 1)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".0%"));

var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.dagsetning); })
    .y(function(d) { return y(d.prosent); });
var lineDotted = d3.svg.line()
    .x(function(d) { return x(d.dagsetning); })
    .y(function(d) { return y(d.prosent); });

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var nested = null, keys = null, flokkar = null, verticalLine = null, kannanir = null;

var dsv = d3.dsv(";", "text/plain");
d3.csv("mbl.csv", function(error, data) {
//dsv("mbl.csv", function(error, data) {
    data.forEach(function(d) {
        console.log(d)
        d.dagsetning_original = d.dagsetning;
        d.dagsetning = parseDate(d.dagsetning);
        if(d.prosent2 !== undefined) {
            d.prosent = parseFloat(parseInt(d.prosent) + parseInt(d.prosent2)/10)/100;
        } else {
            d.prosent = parseFloat(d.prosent.replace(",",".")) /100
        }
        d.flokkur_sanitized = d.flokkur.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      });

  nested = d3.nest()
    .key(function(d) { return d.flokkur; })
    .map(data, d3.map);
  keys = nested.keys();

  flokkar = d3.nest()
    .key(function(d) { return d.flokkur; })
    .entries(data);

  kannanir = d3.nest()
    .key(function(d) {return d.konnun + " " + d.dagsetning_original})
    .rollup(function(d){
        var bla = {};
        d.forEach(function(c){
            bla[c.flokkur] = +c.prosent;
        });
        return dhondt(bla, 63, 5.0);
    })
    .map(data, d3.map);


  //color.domain(keys);


  x.domain(d3.extent(data, function(d) { return d.dagsetning; }));
  //x.domain([new Date("2013-01-01"), new Date()]);

  y.domain([
    0,
    d3.max(data, function(c) { return c.prosent })
  ]);

  // Background rect to catch zoom clicks.
  var bg = svg.append('rect')
        .attr('class', 'bg')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .style('opacity', 0.0);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Fylgi");

  var flokkur = svg.selectAll(".flokkur")
      .data(flokkar)
    .enter().append("g")
      .attr("class", "flokkur");

  flokkur.append("path")
      .attr("class", function(d) { return "line f_" + d.values[0].flokkur_sanitized;})
      .style("stroke", function(d) { return color(d.key); })
      .attr("d", function(d) {
        empty = []
        d.values.forEach(function(v, i){
            empty.push({prosent: "0", dagsetning: v.dagsetning})
        });
        return line(empty)
      })
      .transition()
      .duration(transitionLength)
      .attr("d", function(d) { return line(d.values); });

  flokkur.append("path")
      .attr("class", function(d) { return "lineDotted f_" + d.values[0].flokkur_sanitized;})
      .attr("d", function(d) { return lineDotted(d.values); })
      .style("stroke", function(d) { return color(d.key); })
      .attr("stroke-dasharray", "5,5");



    // Draw the points
        dataCirclesGroup = svg.append('svg:g');

    var circles = dataCirclesGroup.selectAll('.data-point')
        .data(data);

    circles
        .enter()
            .append('svg:circle')
                .attr('class', function(d) { return "data-point f_" + d.flokkur_sanitized;})
                .attr('cx', function(d) { return x(d.dagsetning); })
                .attr('cy', function(d) { return y(0) })
                .attr('r', function() { return 4 })
                .style('stroke', function(d) { return color(d.flokkur); } )
            .transition()
            .duration(transitionLength)
                .attr('cx', function(d) { return x(d.dagsetning) })
                .attr('cy', function(d) { return y(d.prosent) });

    circles
        .transition()
        .duration(transitionLength)
            .attr('cx', function(d) { return x(d.dagsetning) })
            .attr('cy', function(d) { return y(d.prosent) })
            .attr('r', function() { return 4 })

    circles
        .exit()
            .transition()
            .duration(transitionLength)
                // Leave the cx transition off. Allowing the points to fall where they lie is best.
                //.attr('cx', function(d, i) { return xScale(i) })
                .attr('cy', function() { return y(0) })
                .remove();

    circles.on("mouseenter", function(d, i){
        if(!verticalLine) {
            verticalLine = svg.append('svg:g');
        }
        verticalLine.selectAll("line").remove();
        theline = verticalLine.append("line")
                    .attr("class", "vertical-line")
                    .attr("y1", height)
                    .attr("y2", 0)
                    .attr("x1", x(d.dagsetning))
                    .attr("x2", x(d.dagsetning));
        s = d3.entries(kannanir.get(d.konnun + " " + d.dagsetning_original));
        ss = [];
        s.map(function(dd) {
            for(var i=0; i<dd.value; i++) {
                ss.push({key: dd.key, konnun: d.konnun + " " + d.dagsetning_original});
            }
        });
        drawSeats(ss);
    });
    circles.on("mouseleave", function(d,i){
        allLines(d, i);
    });

    var single = false;

    bg.on("click", allLinesFixed);
    circles.on("click", singleLineFixed);
    circles.on("mouseover", singleLine);
    svg.selectAll("path").on("mouseover", singleLine);
    svg.selectAll("path").on("mouseleave", allLines);
    svg.selectAll("path").on("click", singleLineFixed);

    function singleLineFixed(d, i) {
        single = true;
        singleLine(d, i);
    }

    function singleLine(d, i) {
        if(!single || d3.event.type == "click") {
            svg.selectAll("path")
                .classed("inactive", true);
            circles.classed("inactive", true);
            if(d.flokkur_sanitized !== undefined) {
                svg.selectAll("path.f_" + d.flokkur_sanitized).classed("inactive", false);
                svg.selectAll("circle.f_" + d.flokkur_sanitized).classed("inactive", false);
            } else {
                svg.selectAll("path.f_" + d.values[0].flokkur_sanitized).classed("inactive", false);
                svg.selectAll("circle.f_" + d.values[0].flokkur_sanitized).classed("inactive", false);
            }
        }
    }

    function allLinesFixed(d, i) {
        single = false;
        allLines(d, i);
    }

    function allLines(d, i) {
        if (!single) {
            circles.classed("inactive", false);
            svg.selectAll("path")
            .classed("inactive", false);
        }
    }



    seats = svg.append('svg:g');

    seats.append("text")

    function drawSeats(s) {
        $('.seat').remove()
        $('.horizontal-line').remove()
        $('.remark').remove()

        seats.select("text")
            .data(s)
            .attr("x", 900)
            .attr("y", 0)
            .attr("text-anchor", "end")
            .text(function(d){ return d.konnun; });

        theline = seats.append("line")
            .attr("class", "horizontal-line")
            .attr("y1", 25*9 +2)
            .attr("y2", 25*9 +2)
            .attr("x1", 800-10)
            .attr("x2", 800 + 4*25-10)
            
            
        thetext = seats.append("text")
            .attr("class", "remark")
            .attr("x", 890 )
            .attr("y", 227 )
            .text("32")
            

        var seat = seats.selectAll('circle.seat')
            .data(s);

        seat.enter().append("circle")
            .attr("class", function(d) { return "seat"})
            .attr("cy", function(d, i){ return 40 + 25*Math.floor(i/4)})
            .attr("cx", function(d, i){ return 800 + 25*(i%4)})
            .attr("r", 10)
            .attr("fill", function(d){ return color(d.key)})

        seat.exit().remove();

    $('svg circle.seat').tipsy({
        gravity: 'w',
        html: true,
        title: function() {
          var d = this.__data__;
          var pDate = d.date;
          return d.key;
        }
      });
    }


    $('svg circle.data-point').tipsy({
        gravity: 'e',
        html: true,
        title: function() {
          var d = this.__data__;
          var pDate = d.date;
          return "<h4>" + d.flokkur + "</h4>Fylgi: " + (d.prosent*100).toFixed(2) + "%<br />Könnun: " + d.konnun + "<br />Dagsetning: " + d.dagsetning_original;
        }
      });

});
