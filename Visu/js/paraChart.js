function init(){
    document.body.addEventListener("load", parallel_coordinates());
}


function parallel_coordinates(){

    // get svg size:
    var el   = document.querySelector('#paraCoords');
    var rect = el.getBoundingClientRect(); // get the bounding rectangle

    //platzieren des charts
    var margin = {top: 30, right: 10, bottom: 10, left: 10},
    width = rect.width - margin.left - margin.right,
    height = rect.width/2 - margin.top - margin.bottom;
    // height = rect.height - margin.top - margin.bottom;


    //ordinale (diskret) Skalierung der Punkte 0 bis Breite mit Schrittweite 1 erstellen
    var x = d3.scale.ordinal().rangePoints([0, width], 1),
        y = {},
        dragging = {};

    //Linie, Achse, Vorder- und Hintergrund erstellen    
    var line = d3.svg.line(),
        //die Labels sollen links stehen:
        axis = d3.svg.axis().orient("left"),
        background,
        foreground;

    //Größe des svg festlegen    
    var svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Daten laden    
    d3.csv("Data/spell_numbers.csv", function(error, spells) {

    // Extract the list of dimensions and create a scale for each.
    // domain: boundaries of the data
    // keys gibt alle keys der ausgewählten Daten zurück
    x.domain(dimensions = d3.keys(spells[0]).filter(function(d) {
        // die Werte aus Domain werden linear skaliert auf die Werte aus Range
        return (d != "Spell") && (y[d] = d3.scale.linear()
            // extent gives min and max value as [min, max]
            // '+' returns the numeric value, so if p were a string, +p is the numeric value of p
            .domain(d3.extent(spells, function(p) { return +p[d]; }))
            //range: boundaries in which the data can be transformed
            .range([height, 0]));
    }));

    // Add grey background lines for context.
    background = svg.append("g")
        .attr("class", "background")
        .selectAll("path")
        .data(spells)
        //enter und append hängen so viele path-elemente an wie nötig
        .enter().append("path")
        .attr("d", path);

    // Add blue foreground lines for focus.
    foreground = svg.append("g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(spells)
        .enter().append("path")
        .attr("d", path);

    // Add a group element for each dimension.
    var g = svg.selectAll(".dimension")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        .call(d3.behavior.drag()
            .origin(function(d) { return {x: x(d)}; })
            .on("dragstart", function(d) {
            dragging[d] = x(d);
            background.attr("visibility", "hidden");
            })
            .on("drag", function(d) {
            dragging[d] = Math.min(width, Math.max(0, d3.event.x));
            foreground.attr("d", path);
            dimensions.sort(function(a, b) { return position(a) - position(b); });
            x.domain(dimensions);
            g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
            })
            .on("dragend", function(d) {
            delete dragging[d];
            transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
            transition(foreground).attr("d", path);
            background
                .attr("d", path)
                .transition()
                .delay(500)
                .duration(0)
                .attr("visibility", null);
            }));

    // Add an axis and title.
    g.append("g")
        .attr("class", "axis")
        .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; });

    // Add and store a brush for each axis.
    g.append("g")
        .attr("class", "brush")
        .each(function(d) {
            d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);
    });

    function position(d) {
    var v = dragging[d];
    return v == null ? x(d) : v;
    }

    function transition(g) {
    return g.transition().duration(500);
    }

    // Returns the path for a given data point.
    function path(d) {
    return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
    }

    function brushstart() {
    d3.event.sourceEvent.stopPropagation();
    }

    // Handles a brush event, toggling the display of foreground lines.
    function brush() {
    var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
        extents = actives.map(function(p) { return y[p].brush.extent(); });
    foreground.style("display", function(d) {
        return actives.every(function(p, i) {
        return extents[i][0] <= d[p] && d[p] <= extents[i][1];
        }) ? null : "none";
    });
    }

}