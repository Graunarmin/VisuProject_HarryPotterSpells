
function init(){
    document.body.addEventListener("load", arc());
    var spells = document.querySelectorAll('.toggleSpells');

    spells.forEach.call(spells, function(e){
        e.addEventListener("click", toggle_info, false);
        e.addEventListener("click", highlight_path, false);
    });

}

function arc(){
    //var clicked = false;
    var id = "0";

    // get svg size:
    /*var element   = document.querySelector('.Chart');
    var rect = element.getBoundingClientRect(); // get the bounding rectangle

    //platzieren des charts
    var height = rect.width/2//- margin.left - margin.right,
        width = rect.width,
        margin = 20;
        //diameter = height;*/

    // set the dimensions and margins of the graph
    var margin = {top: 0, right: 30, bottom: 50, left: 60},
    width = 1000 - margin.left - margin.right,
    height = 535 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#Visu")
    //.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Read dummy data
    d3.json("Data/arcdata.json", function( data) {

    // List of node names
    var allNodes = data.nodes.map(function(d){return d.name})

    // List of groups
    var allGroups = data.nodes.map(function(d){return d.type})
    allGroups = [...new Set(allGroups)]

    // A color scale for groups:
    var color = d3.scaleOrdinal()
        .domain(allGroups)
        .range(d3.schemeSet3);

    // A linear scale for node size
    var size = d3.scaleLinear()
        .domain([1,10])
        .range([2,10]);

    // A linear scale to position the nodes on the X axis
    var x = d3.scalePoint()
        .range([0, width])
        .domain(allNodes)

    // In my input data, links are provided between nodes -id-, NOT between node names.
    // So I have to do a link between this id and the name
    var idToNode = {};
    data.nodes.forEach(function (n) {
        idToNode[n.id] = n;
    });

    // Add the links
    var links = svg
        .selectAll('mylinks')
        .data(data.links)
        .enter()
        .append('path')
        .attr('d', function (d) {
        start = x(idToNode[d.source].name)    // X position of start node on the X axis
        end = x(idToNode[d.target].name)      // X position of end node
        return ['M', start, height-30,    // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
            'A',                            // This means we're gonna build an elliptical arc
            (start - end)/2, ',',    // Next 2 lines are the coordinates of the inflexion point. Height of this point is proportional with start - end distance
            (start - end)/2, 0, 0, ',',
            start < end ? 1 : 0, end, ',', height-30] // We always want the arc on top. So if end is before start, putting 0 here turn the arc upside down.
            .join(' ');
        })
        .style("fill", "none")
        .attr("stroke", "grey")
        .style("stroke-width", 1)

    // Add the circle for the nodes
    var nodes = svg
        .selectAll("mynodes")
        .data(data.nodes.sort(function(a,b) { return +b.size - +a.size }))
        .enter()
        .append("circle")
        .attr("cx", function(d){ return(x(d.name))})
        .attr("cy", height-30)
        .attr("r", function(d){ return(size(d.size))})
        .style("fill", function(d){ return color(d.type)})
        .attr("stroke", "white")


    // And give them a label
    var labels = svg
        .selectAll("mylabels")
        .data(data.nodes)
        .enter()
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .text(function(d){ return(d.spell)} )
        .style("text-anchor", "end")
        .attr("transform", function(d){ return( "translate(" + (x(d.name)) + "," + (height-15) + ")rotate(-45)")})
        .style("font-size", 6)

    nodes
        //---------------------------------- Mouseover ----------------------------------
        .on('mouseover', function (d) {

        //If no other spell is currently selected
        if(id == "0"){

            //----------------- Nodes -----------------
            //Reduce opacity of all circles
            nodes
            .style('opacity', .2)
            //Only current circle stays the same color 
            d3.select(this)
            .style('opacity', 1)

            //----------------- Connections -----------------
            links
            //Color of the link
            .style('stroke', function (link_d){ 
                if(link_d.source === d.id || link_d.target === d.id){
                return color(d.type); 
                }
                else{
                return '#b8b8b8';
                }
            })
            //Opacity of the link
            .style('stroke-opacity', function (link_d) { 
                if(link_d.source === d.id || link_d.target === d.id){
                return 1;
                }
                else{
                return 0.2;
                }
            })
            //Width of the link
            .style('stroke-width', function (link_d) { 
                if(link_d.source === d.id || link_d.target === d.id){
                return 4;
                }
                else{
                return 1;
                }
            })

            //----------------- Labels -----------------
            labels
            //Size of the labels
            .style("font-size", function(label_d){ 
                if(label_d.name === d.name){
                return 16;
                }
                else{
                return 2;
                }
            })
        }
        })
        //---------------------------------- Mouseout ----------------------------------
        .on('mouseout', function (d) {

        //If the spell wasn't selected
        if(id == "0"){
            nodes.style('opacity', 1)
            links
            .style('stroke', 'grey')
            .style('stroke-opacity', .8)
            .style('stroke-width', '1')
            labels
            .style("font-size", 6 ) 
        }

        })
        //---------------------------------- Click ----------------------------------
        .on('click', function (d) {
        
        //If the spell wasn't selected yet
        if(id == "0"){

            //Get id of current circle
            id = d.id;

            //----------------- Nodes -----------------
            //Reduce opacity of all circles
            nodes
            .style('opacity', .2)
            //Only current circle stays the same color 
            d3.select(this)
            .style('opacity', 1)

            //----------------- Connections -----------------
            links
            //Color of the link
            .style('stroke', function (link_d){ 
                if(link_d.source === d.id || link_d.target === d.id){
                return color(d.type); 
                }
                else{
                return '#b8b8b8';
                }
            })
            //Opacity of the link
            .style('stroke-opacity', function (link_d) { 
                if(link_d.source === d.id || link_d.target === d.id){
                return 1;
                }
                else{
                return 0.2;
                }
            })
            //Width of the link
            .style('stroke-width', function (link_d) { 
                if(link_d.source === d.id || link_d.target === d.id){
                return 4;
                }
                else{
                return 1;
                }
            })

            //----------------- Labels -----------------
            labels
            //Size of the labels
            .style("font-size", function(label_d){ 
                if(label_d.name === d.name){
                return 16;
                }
                else{
                return 2;
                }
            })
        }

        //Else if the spell was selected and clicked again 
        else if(id == d.id){

            id = "0";

            nodes.style('opacity', 1)
            links
            .style('stroke', 'grey')
            .style('stroke-opacity', .8)
            .style('stroke-width', '1')
            labels
            .style("font-size", 6 ) 

        }

        })
    })
}

//zoomable Treemap
function treemap(){
    // get svg size:
    var element   = document.querySelector('.Chart');
    var rect = element.getBoundingClientRect(); // get the bounding rectangle

    //platzieren des charts
    var height = rect.width/2//- margin.left - margin.right,
        width = rect.width,
        margin = 20,
        diameter = height;

    var svg = d3.select("svg")
        .attr("width", width + margin + margin)
        .attr("height", height + margin + margin),
    g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

    //Farbpalette festlegen
    var color = d3.scaleLinear()
        .domain([-1, 5])
        .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
        .interpolate(d3.interpolateHcl);

    //Layout festlegen: https://d3-wiki.readthedocs.io/zh_CN/master/Pack-Layout/
    var pack = d3.pack()
        .size([diameter - margin, diameter - margin])
        .padding(2);

    //Daten einlesen und daraus Visu bauen    
    d3.json("Data/treemap_data_2.json", function(error, root) {
        if (error) throw error;

        root = d3.hierarchy(root)
            .sum(function(d) { return d.size; })
            .sort(function(a, b) { return b.value - a.value; });

        var focus = root,
            nodes = pack(root).descendants(),
            view;

        var circle = g.selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
            .style("fill", function(d) { return d.children ? color(d.depth) : null; })
            .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

        //labels    
        var text = g.selectAll("text")
            .data(nodes)
            .enter().append("text")
            .attr("class", "label")
            .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
            .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
            .text(function(d) { return d.data.name; });

        var node = g.selectAll("circle,text");

        svg
            .style("background", color(-1))
            .on("click", function() { zoom(root); });

        zoomTo([root.x, root.y, root.r * 2 + margin]);

        function zoom(d) {
            var focus0 = focus; focus = d;

            var transition = d3.transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .tween("zoom", function(d) {
                var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                return function(t) { zoomTo(i(t)); };
                });

            transition.selectAll("text")
            .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
                .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
                .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
                .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
        }

        function zoomTo(v) {
            var k = diameter / v[2]; view = v;
            node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
            circle.attr("r", function(d) { return d.r * k; });
        }
    });
}

// static Treemap
function bubbleChart(){
    // get svg size:
    var element   = document.querySelector('.Chart');
    var rect = element.getBoundingClientRect(); // get the bounding rectangle

    //platzieren des charts
    var margin = {top: 30, right: 10, bottom: 10, left: 10};
    var width = rect.width ,//- margin.left - margin.right,
    height = rect.width/2;// - margin.top - margin.bottom;

    //Größe des svg festlegen    
    var svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // Get the data from our CSV file
    d3.csv('../Playground/Pdata.csv', function(error, CsvData) {
        if (error) throw error;

        vData = d3.stratify()(CsvData);
        drawViz(vData);
    });

    function drawViz(vData) {
        // Declare d3 layout
        var vLayout = d3.pack().size([width, height]);

        // Layout + Data
        var vRoot = d3.hierarchy(vData).sum(function (d) { return d.data.size; });
        var vNodes = vRoot.descendants();
        vLayout(vRoot);
        var vSlices = svg.selectAll('circle').data(vNodes).enter().append('circle');

        // Draw on screen
        vSlices.attr('cx', function (d) { return d.x; })
            .attr('cy', function (d) { return d.y; })
            .attr('r', function (d) { return d.r; });
    }
}

    

function toggle_info(){
    var id = this.innerHTML.toLowerCase().split(" ")[0];
    //console.log("toggle: " + this.id);

    var elements = document.querySelectorAll('#'+id);
    // console.log(elements);
    var spell = elements[0];
    var info_box = elements[1];
    
    // if it's already open:
    if(info_box.classList.contains('show')){
         //close Info, set all font-colors and sizes back to normal
         hide();
         reset_list();
        
    //if it's closed
    }else{
       //first close other Infobox if open:
       hide();
       //then make the other spells grey 
       //and this one in its color and bigger
       show(spell, info_box);
    }
}

function show(spell, info){
    //grey out everything
    var elements = document.querySelectorAll(".spells")
    elements.forEach.call(elements, function(e){
        e.style.color = 'grey';
    });

    //then color the Spell in its respective color
    var colour = color(info);
    spell.style.color = colour[0];
    spell.style.fontSize = '22px';
    //and Show the Infobox
    info.classList.toggle("show");
    info.style.backgroundColor = colour[1];
}

function hide(){
    //there is ALWAYS only one open Infobox! If not - change the code!
    var element = document.querySelector('.show');
    if(element){
        element.classList.toggle("show");
    }
    reset_list();
}
 
function reset_list(){
    var elements = document.querySelectorAll('.spells');
    elements.forEach.call(elements, function(e){
        e.style.fontSize = '20px';
        e.style.color = 'black';
    });
}

function color(element){
    //choose respective color for each spell type
    var type = String(element.querySelector('.type .tag').innerHTML);
    
    switch(type){
        case "Charm":
            //green
            return ["rgb(100, 183, 17)", "rgba(100, 183, 17, 0.4)"];
        case "Spell":
            //blue
            return ["rgb(0, 136, 255)", "rgba(0, 136, 255, 0.4)"];
        case "Curse":
            //orange
            return ["rgb(255, 132, 0)", "rgba(255, 132, 0, 0.4)"];
        case "Unforgivable Curse":
            //red
            return ["rgb(184, 12, 12)", "rgba(184, 12, 12, 0.4)"];
    }
}

function highlight_path(){
    var id = this.id;
    // console.log("highlight_path: " + this.id);
}