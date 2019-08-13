//in list:
var clickedSpell = "";
var spellClicked = false;

//in chart:
var clicked = "0";      //circle clicked
var bookClicked = "0";
var legendClicked = "0";


function init(){
    document.body.addEventListener("load", arc());
    var spells = document.querySelectorAll('.toggleSpells');

    spells.forEach.call(spells, function(e){
        e.addEventListener("click", toggle_info, false);
        e.addEventListener("click", highlight_path, false);
    });

}

function arc(){
    
    //---------------------- Variables ----------------------

    var hover = "0";
    var book = "0";
    var id = "0";
    var circleTooltip = d3.select("body").append("div").attr("class", "toolTip");
    var bookTooltip = d3.select("body").append("div").attr("class", "toolTip");
    var legendTooltip = d3.select("body").append("div").attr("class", "toolTip");

    //---------------------- Size ----------------------

    //Get svg size
    var element = document.querySelector('.Chart');
    var rect = element.getBoundingClientRect(); 

    //Set dimensions of graph depending on svg size
    var margin = {top: 0, right: 30, bottom: 0, left: 90};
    var height = rect.width/2 - margin.top - margin.bottom;
    var width = rect.width - margin.left - margin.right;

    //Select svg element of page and add dimensions 
    var svg = d3.select("#Visu")
                .attr("height", height + margin.top + margin.bottom)
                .attr("width", width + margin.left + margin.right)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //---------------------- Arc Data ----------------------

    d3.json("Data/arcdata.json", function(data){

        //List of all books
        var allBooks = ["Book 1", "Book 2", "Book 3", "Book 4", "Book 5", "Book 6", "Book 7"];
        var bookId = ["HP_01", "HP_02", "HP_03", "HP_04", "HP_05", "HP_06", "HP_07"];
        var bookNames = ["The Philosopher's Stone", "The Chamber of Secrets", "The Prisoner of Azkaban", 
        "The Goblet of Fire", "The Order of the Phoenix", "The Half-Blood Prince", "The Deathly Hallows"];

        //List of all circles
        var allCircles = data.nodes.map(function(d){return d.name});

        //List of all types
        var allTypes = data.nodes.map(function(d){return d.type});
        //Somehow changes the size ^^
        allTypes = [...new Set(allTypes)]
        var typeNames = ["Charm", "Spell", "Curse", "Unforgivable Curse"];
        var typeDefiniton = ["A spell that adds or changes the properties <br> of an object",
        "A controlled manifestation of magic <br> that affects the world in a variety of ways", 
        "A spell that affects an object in a severely <br> negative way", 
        "One of the three most powerful and sinister <br> spells there are"];

        //Range of colors for the different types 
        var color = d3.scaleOrdinal()
                      .domain(allTypes)
                      //Charm(Green),Spell(Blue),Curse(Orange),Unforgivable(Red)
                      .range(["#A5C78B", "#4E8BD1", "#FFB733", "#BE253F"]);

        //Linear scale for circle size
        var size = d3.scaleLinear()
                     .domain([1,10])
                     .range([4,13]);

        //Linear scale for circle position on x-axis
        var x = d3.scalePoint()
                  .domain(allCircles)
                  .range([-80, width]);

        //--    
        // In my input data, links are provided between nodes -id-, NOT between node names.
        // So I have to do a link between this id and the name
        var idToNode = {};

        data.nodes.forEach(function(n){
            idToNode[n.id] = n;
        });

        //---------------------- Add Connections ----------------------
        
        var links = svg
            .selectAll("mylinks")
            .data(data.links)
            .enter()
            .append('path')
            .attr('d', function(d){
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
            .style("stroke-width", 1);

        //---------------------- Add Circles ----------------------
        
        var nodes = svg
            .selectAll("mynodes")
            .data(data.nodes.sort(function(a,b) { return +b.size - +a.size }))
            .enter()
            .append("circle")
            .attr("id", function(d){
                return ("id" + d.id + "-" + d.type);
            })
            .attr("cx", function(d){ 
                return(x(d.name))
            })
            .attr("cy", height-30)
            .attr("r", function(d){ 
                return(size(d.size))
            })
            .style("fill", function(d){ 
                return color(d.type)
            })
            .attr("stroke", "white");

        //---------------------- Add Labels To Circles ----------------------
       
        var labels = svg
            .selectAll("mylabels")
            .data(data.nodes)
            .enter()
            .append("text")
            .attr("class", "labels")
            .attr("x",0)
            .attr("y",0)
            .text(function(d){ 
                return d.spell;
            })
            .style("text-anchor", "end")
            .attr("transform", function(d){ 
                return( "translate(" + (x(d.name)) + "," + (height-300) + ")" )
            })
            .style("font-size", 0);

        //---------------------- Add Interactions To Circles ----------------------

        nodes

        //---------------------- Mouseover ----------------------

        .on('mouseover', function(d){

            //Id of the circle we are hovering above
            hover = d.id;
            //Book of the circle we are hovering above
            book = hover.slice(hover.length-1,hover.length);
            //Id without number
            id = hover.slice(0,hover.length-1);

            //IF no circle, no rect and no book is clicked 
            if(clicked == "0" && legendClicked == "0" && bookClicked == "0"){

                //---------------------- Circles ----------------------

                //All circles
                nodes
                .style("cursor", "pointer");

                //---------------------- Connections ----------------------

                links
                //Color of the link
                .style('stroke', function (link_d){ 
                    if(link_d.source === d.id || link_d.target === d.id){
                        return color(d.type); 
                    }
                    else{
                        return "grey"; //"#b8b8b8";
                    }
                })
                //Opacity of the link
                .style('stroke-opacity', function(link_d){ 
                    if(link_d.source === d.id || link_d.target === d.id){
                        return 1;
                    }
                    else{
                        return 0.2;
                    }
                })
                //Width of the link
                .style('stroke-width', function(link_d){ 
                    if(link_d.source === d.id || link_d.target === d.id){
                        return 4;
                    }
                    else{
                        return 1;
                    }
                })

                //---------------------- Labels ----------------------

                labels
                //Size of the labels
                .style("font-size", function(label_d){ 
                    if(label_d.name === d.name){
                        return 20;
                    }
                    else{
                        return 0;
                    }
                })
                .style("fill", function(label_d){
                    if(label_d.name === d.name){
                        return color(d.type);
                    }
                })

                //---------------------- Tooltip ----------------------

                circleTooltip
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 100 + "px")
                .style("display", "inline-block")
                .style("background", "white")
                .html(
                    d.spell + ":" + "<br>" 
                    + "Used " + d.size + " times in book " + book 
                );
            }

            //ELSE IF no circle, no book but rect is clicked and mouse is over corresponding circle
            else if(clicked == "0" && bookClicked == "0" && legendClicked == d.type){

                //---------------------- Circles ----------------------

                nodes
                .style("opacity", 0.1);

                //All corresponding circles
                for(i = 1; i < allCircles.length; i++){
                    d3.select("#id" + allCircles[i] + "-" + d.type)
                    .style("opacity", 1)
                    .style("cursor", "pointer");
                }

                //---------------------- Connections ----------------------

                links
                //Color of the link
                .style('stroke', function (link_d){ 
                    if(link_d.type === legendClicked){
                        if(link_d.source === d.id || link_d.target === d.id){
                            return color(d.type); 
                        }
                        else{
                            return "grey"; 
                        }
                    }
                })
                //Opacity of the link
                .style('stroke-opacity', function(link_d){ 
                    if(link_d.type === legendClicked){
                        if(link_d.source === d.id || link_d.target === d.id){
                            return 1;
                        }
                        else{
                            return 0.2;
                        }
                    }
                    else{
                        return 0.1;
                    }
                })
                //Width of the link
                .style('stroke-width', function(link_d){ 
                    if(link_d.type === legendClicked){
                        if(link_d.source === d.id || link_d.target === d.id){
                            return 4;
                        }
                        else{
                            return 1;
                        }
                    }
                })

                //---------------------- Labels ----------------------

                labels
                //Size of the labels
                .style("font-size", function(label_d){ 
                    if(label_d.name === d.name){
                        return 20;
                    }
                    else{
                        return 0;
                    }
                })
                .style("fill", function(label_d){
                    if(label_d.name === d.name){
                        return color(d.type);
                    }
                })

                //---------------------- Tooltip ----------------------

                circleTooltip
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 100 + "px")
                .style("display", "inline-block")
                .style("background", "white")
                .html(
                    d.spell + ":" + "<br>" 
                    + "Used " + d.size + " times in book " + book 
                );
            }

            //ELSE IF no circle, no rect but book is clicked and we are hovering above circle out of book
            //OR IF no circle but rect and book is clicked and we are hovering above circle of type and out of book
            else if(clicked == "0" && legendClicked == "0" && bookClicked.slice(bookClicked.length-1, bookClicked.length) == d.id.slice(d.id.length-1,d.id.length)
            || clicked == "0" && legendClicked == d.type && bookClicked.slice(bookClicked.length-1, bookClicked.length) == d.id.slice(d.id.length-1,d.id.length)){

                nodes
                .style("cursor", "pointer");

                //---------------------- Labels ----------------------

                labels
                //Size of the labels
                .style("font-size", function(label_d){ 
                    if(label_d.name === d.name){
                        return 20;
                    }
                    else{
                        return 0;
                    }
                })
                .style("fill", function(label_d){
                    if(label_d.name === d.name){
                        return color(d.type);
                    }
                })

                //---------------------- Tooltip ----------------------

                circleTooltip
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 100 + "px")
                .style("display", "inline-block")
                .style("background", "white")
                .html(
                    d.spell + ":" + "<br>" 
                    + "Used " + d.size + " times in book " + book 
                );
            }

            //ELSE IF a circle is clicked and we are hovering above it
            else if(hover == clicked){

                //---------------------- Circles ----------------------
                nodes
                .style("cursor", "pointer");

                //---------------------- Tooltip ----------------------
                circleTooltip
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 100 + "px")
                .style("display", "inline-block")
                .style("background", "white")
                .html(
                    d.spell + ":" + "<br>" 
                    + "Used " + d.size + " times in book " + book 
                );
            }

            //ELSE IF a circle is clicked and we are hovering above a connected circle
            else if(!(clicked == "0") && id == clicked.slice(0,clicked.length-1)){

                //---------------------- Circles ----------------------
                d3.select("#id" + hover + "-" + d.type)
                .style("cursor", "pointer");

                //---------------------- Tooltip ----------------------
                circleTooltip
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 100 + "px")
                .style("display", "inline-block")
                .style("background", "white")
                .html(
                    d.spell + ":" + "<br>" 
                    + "Used " + d.size + " times in book " + book 
                );
            }

            //ELSE a circle is clicked but we are hovering above a different one
            else{
                //---------------------- Circles ----------------------
                nodes
                .style("cursor", "default");
            }
        })

        //---------------------- Mouseout ----------------------

        .on('mouseout', function(d){

            //IF no circle, no rect and no book is clicked
            if(clicked == "0" && legendClicked == "0" && bookClicked == "0"){

                //---------------------- Circles ----------------------
                nodes
                .style('opacity', 1);

                //d3.select(this)
                //.style("stroke", "white");

                //---------------------- Connections ----------------------
                links
                .style('stroke', 'grey')
                .style('stroke-opacity', .8)
                .style('stroke-width', '1');

                //---------------------- Lables ----------------------
                labels
                .style("font-size", 0);
            }

            //ELSE IF no circle, no book but rect on legend is clicked and mouse is moving of of corresponding circle  
            else if(clicked == "0" && bookClicked == "0" && legendClicked == d.type){

                //---------------------- Connections ----------------------
                
                links
                //Color of the link
                .style('stroke', function (link_d){ 
                    if(link_d.type === legendClicked){
                        return "grey"; 
                    }
                })
                //Opacity of the link
                .style('stroke-opacity', function(link_d){ 
                    if(link_d.type === legendClicked){
                        return 1;
                    }
                    else{
                        return 0.1;
                    }
                })
                //Width of the link
                .style('stroke-width', function(link_d){ 
                    if(link_d.type === legendClicked){
                        return 1;
                    }
                })

                //Labels
                labels
                .style("font-size", 0);
            }

            //ELSE IF no circle, no rect but book is clicked
            //OR IF no circle but rect and book is clicked
            else if(clicked == "0" && legendClicked == "0" && !(bookClicked == "0")
            || clicked == "0" && !(legendClicked == "0") && !(bookClicked == "0")){

                //---------------------- Lables ----------------------
                labels
                .style("font-size", 0);
            }

            //---------------------- Tooltip ----------------------
            circleTooltip
            .style("display","none");

        })

        //---------------------- Click ----------------------

        .on('click', function(d){
        
            //IF no circle, no rect and no book is clicked 
            //OR IF no circle and no book is clicked but this circle is the same type as the clicked rect
            if(clicked == "0" && legendClicked == "0" && bookClicked == "0"
            || clicked == "0" && bookClicked == "0" && legendClicked == d.type){

                //Mark as clicked
                clicked = d.id;

                //show infobox in list:
                show_info(d.id.split("_")[0].toLowerCase())
                
                //---------------------- Circles ----------------------

                //Reduce opacity of all circles
                nodes
                .style('opacity', .1);

                //Only current circle and all connected circles stay the same color 
                for(i = 1; i < 8; i++){
                    d3.select("#id" + id + i + "-" + d.type)
                    .style('opacity', 1);
                }

                //---------------------- Connections ----------------------

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

                //---------------------- Labels ----------------------

                labels
                //Size of the labels
                .style("font-size", function(label_d){ 
                    if(label_d.name === d.name){
                    return 20;
                    }
                    else{
                    return 0;
                    }
                })
                //Color of the labels
                .style("fill", function(label_d){
                    if(label_d.name === d.name){
                        return color(d.type);
                    }
                })

                //---------------------- Legend ----------------------

                //Reduce opacity of all rect
                legend
                .style('opacity', .3);

                //Only rect of current type stays colored 
                d3.select("#idrect" + d.type)
                .style('opacity', 1)
                .style("stroke",function(d){
                    return color(d);
                })
                .style("stroke-width",3);

                //Lower opacity of all labels
                legendLabels
                .style("opacity", 0.3);
                
                //Return opacity of current label back to 1
                d3.select("#idlabel" + d.type)
                .style("opacity", 1);

                //---------------------- Books ----------------------

                //Lower opacity of all books
                bookLabels
                .style("opacity", 0.3);

                //Only books where the spells are from stay at opacity 1
                for(i = 1; i < 8; i++){
                    if(!(d3.select("#id" + id + i + "-" + d.type).empty())){
                        d3.select("#" + d.id.slice(d.id.length-5,d.id.length-1) + i)
                        .style("opacity", 1)
                        .style("font-weight", "bold");
                    }
                }
            }

            //ELSE IF no circle, no rect but a book is clicked and circle out of book is clicked
            //OR IF no circle but rect and book is clicked and circle of type and out of book is clicked
            else if(clicked == "0" && legendClicked == "0" && bookClicked.slice(bookClicked.length-1, bookClicked.length) == d.id.slice(d.id.length-1,d.id.length)
            || clicked == "0" && legendClicked == d.type && bookClicked.slice(bookClicked.length-1, bookClicked.length) == d.id.slice(d.id.length-1,d.id.length)){

                //Mark as clicked
                clicked = d.id;

                //show infobox in list:
                show_info(d.id.split("_")[0].toLowerCase())
                //---------------------- Circles ----------------------

                //Reduce opacity of all circles
                nodes
                .style('opacity', 0.1);

                d3.select(this)
                .style('opacity', 1);

                //---------------------- Legend ----------------------

                //Reduce opacity of all rect
                legend
                .style('opacity', .3);

                //Only rect of current type stays colored 
                d3.select("#idrect" + d.type)
                .style('opacity', 1)
                .style("stroke",function(d){
                    return color(d);
                })
                .style("stroke-width",3);

                //Lower opacity of all labels
                legendLabels
                .style("opacity", 0.3);
                
                //Return opacity of current label back to 1
                d3.select("#idlabel" + d.type)
                .style("opacity", 1);
            }

            //ELSE IF rect, book and circle is clicked (again)
            else if(!(bookClicked == "0") && !(legendClicked == "0") && clicked == d.id){

                //Mark as no longer clicked
                clicked = "0";

                //hide infobox and reset list
                hide_info();
                //---------------------- Circles ----------------------

                //Only circles out of clicked book and of type of clicked rect stay at opacity 1
                for(i = 0; i < allCircles.length; i++){

                    c = allCircles[i].slice(0,allCircles[i].length-1);
                    b = bookClicked.slice(bookClicked.length-1, bookClicked.length);

                    d3.select("#id" + c + b + "-" + d.type)
                    .style("opacity", 1);
                }

            }
            //ELSE IF no rect but book and circle is clicked (again)
            else if(!(bookClicked == "0") && legendClicked == "0" && clicked == d.id){
                
                //Mark as no longer clicked
                clicked = "0";
                
                //hide infobox and reset list
                hide_info();

                //---------------------- Circles ----------------------

                for(i = 0; i < allCircles.length; i++){

                    c = allCircles[i].slice(0,allCircles[i].length-5);

                    for(j = 0; j < allTypes.length; j++){

                        d3.select("#id" + c + d.id.slice(d.id.length-5,d.id.length) + "-" + allTypes[j])
                        .style("opacity", 1);
                    }
                }

                //---------------------- Legend ----------------------

                //Return opacity of all rect back to 1
                legend
                .style('opacity', 1)
                .style("stroke","white")
                .style("stroke-width",0);

                //Return opacity of all labels back to 1
                legendLabels
                .style("opacity", 1);
            }

            //ELSE IF no rect, no book but circle or connected circle is clicked (again) 
            else if(clicked.slice(0,clicked.length-1) == d.id.slice(0,clicked.length-1) && legendClicked == "0" && bookClicked == "0"){

                //Mark as no longer clicked
                clicked = "0";

                //hide infobox and reset list
                hide_info();
                //---------------------- Circles ----------------------
                nodes
                .style('opacity', 1);

                //---------------------- Connections ----------------------
                links
                .style('stroke', 'grey')
                .style('stroke-opacity', .8)
                .style('stroke-width', '1');

                //---------------------- Labels ----------------------
                labels
                .style("font-size", 0); 

                //---------------------- Legend ----------------------

                //Return opacity of all rect back to 1
                legend
                .style('opacity', 1)
                .style("stroke","white")
                .style("stroke-width",0);

                //Return opacity of all labels back to 1
                legendLabels
                .style("opacity", 1);

                //---------------------- Books ----------------------
                bookLabels
                .style("opacity", 1)
                .style("font-weight", "normal");
            }

            //ELSE IF circle or connected circle is clicked (again) and rect is clicked
            else if(clicked.slice(0,clicked.length-1) == d.id.slice(0,clicked.length-1) && legendClicked == d.type && bookClicked == "0"){

                //Mark as no longer clicked
                clicked = "0";
                //hide infobox and reset list
                hide_info();
                //---------------------- Circles ----------------------
                for(i = 1; i < allCircles.length; i++){
                    d3.select("#id" + allCircles[i] + "-" + d.type)
                    .style('opacity', 1);
                }

                //---------------------- Labels ----------------------
                labels
                .style("font-size", 0); 

                //---------------------- Books ----------------------
                bookLabels
                .style("opacity", 1)
                .style("font-weight", "normal");
            }
        })

        //---------------------- Add Legend ----------------------

        var legend = svg
            .selectAll("mytypes")
            .data(allTypes)
            .enter()
            .append("rect") 
            //"#idrect" + type
            .attr("id", function(d){
                return ("idrect" + d);
            })
            .attr("x", width - 150)  
            .attr("y", -20)
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", function(d){ 
                return color(d)
            })
            .attr("transform", function(d, i) { return "translate(0," + i * 25 + ")"; });
        
        //---------------------- Add Labels To Legend ----------------------

        var legendLabels = svg
            .selectAll("mylegendLables")
            .data(typeNames)
            .enter()
            .append("text")
            .attr("id", function(d,i){
                return ("idlabel" + allTypes[i]);
            })
            .attr("x", width-120)
            .attr("y", -5)
            .text(function(d){
                return d;
            })
            .style("text-anchor", "front")
            .style("font-size", 13)
            .attr("transform", function(d, i) { return "translate(0," + i * 25 + ")"; });   

        //---------------------- Add Interactions To Legend ----------------------

        legend

        //---------------------- Mouseover ----------------------

        .on("mouseover", function(d,i){

            //IF no rect, no circle and no book is clicked
            //OR IF no circle, no rect but book is clicked
            if(legendClicked == "0" && clicked == "0" && bookClicked == "0"
            || legendClicked == "0" && clicked == "0" && !(bookClicked == "0")){

                //The rect we are hovering above 
                d3.select(this)
                .style("stroke",function(d){
                    return color(d);
                })
                .style("stroke-width",3)
                .style("cursor", "pointer");

                //---------------------- Tooltip ----------------------
                legendTooltip
                .style("left", d3.event.pageX - 300 + "px")
                .style("top", d3.event.pageY - 20 + "px")
                .style("display", "inline-block")
                .style("background", "white")
                .html(typeDefiniton[i]);
            }  
            //ELSE IF no circle, no book but rect is clicked and we are hovering above it 
            //OR IF no circle but book and rect is clicked and we are hovering again over rect
            else if(legendClicked == d && clicked == "0" && bookClicked == "0"
            || legendClicked == d && clicked == "0" && !(bookClicked == "0")){

                d3.select(this)
                .style("cursor", "pointer");

                //---------------------- Tooltip ----------------------
                legendTooltip
                .style("left", d3.event.pageX - 300 + "px")
                .style("top", d3.event.pageY - 20 + "px")
                .style("display", "inline-block")
                .style("background", "white")
                .html(typeDefiniton[i]);
            }  
            //ELSE a rect is clicked but we are hovering above a different one
            else{

                d3.select(this)
                .style("cursor", "default");
            }              
        })

        //---------------------- Mouseout ----------------------

        .on("mouseout", function(d){

            //IF no rect, no circle and no book is clicked
            //OR IF no circle, no rect but book is clicked
            if(legendClicked == "0" && clicked == "0" && bookClicked == "0"
            || legendClicked == "0" && clicked == "0" && !(bookClicked == "0")){

                legend
                .style("stroke","white")
                .style("stroke-width",0);
            }

            //---------------------- Tooltip ----------------------

            legendTooltip
            .style("display","none");
        })

        //---------------------- Click ----------------------

        .on("click", function(d){

            //IF no rect, no circle and no book is clicked
            if(legendClicked == "0" && clicked == "0" && bookClicked == "0"){

                //Clicked = true
                legendClicked = d;

                //only show spells of the selected type in the list
                show_selected_type(d);
                //---------------------- Rectangles ----------------------

                //Lower opacity of all rects
                legend
                .style('opacity', 0.3);

                //Return opacity of clicked rect back to 1 and frame with color
                d3.select(this)
                .style('opacity', 1)
                .style("stroke",function(d){
                    return color(d);
                })
                .style("stroke-width",3);
                
                //---------------------- Labels ----------------------

                //Lower opacity of all labels
                legendLabels
                .style("opacity", 0.3);
                
                //Return opacity of current label back to 1
                d3.select("#idlabel" + d)
                .style("opacity", 1);

                //---------------------- Erase Circles ----------------------

                //Reduce opacity of all circles to 0.1
                nodes
                .style('opacity', 0.1);

                //Only current circle and all connected circles stay the same color 
                for(i = 1; i < allCircles.length; i++){
                    d3.select("#id" + allCircles[i] + "-" + d)
                    .style('opacity', 1);
                }

                //---------------------- Erase Links ----------------------

                //Opacity of the links
                links
                .style('stroke-opacity', function(link_d){
                    //IF link is of same type as clicked rect, leave opacity at 1
                    if(link_d.type === d){
                        return 1;
                    }
                    //ELSE lower opacity to 0.1
                    else{
                        return 0.1;
                    }
                });

            }

            //ELSE IF no circle, no book but rect is clicked and we are clicking on the same one again 
            else if(legendClicked == d && clicked == "0" && bookClicked == "0"){
                
                //Clicked = false
                legendClicked = "0";

                //show spells of all types in list
                show_all_types();
                //---------------------- Rectangles ----------------------

                //Every rect
                legend
                .style('opacity', 1);

                //The rect that was clicked again
                d3.select(this)
                .style("stroke","white")
                .style("stroke-width",0);

                //---------------------- Labels ----------------------
                
                //Return opacity of all labels back to 1
                legendLabels
                .style("opacity", 1);

                //---------------------- Put Circles Back ----------------------

                //Return opacity of all circles back to 1
                nodes
                .style('opacity', 1)

                //---------------------- Put Links Back ----------------------

                //Return opacity of all links back to 1
                links
                .style('stroke-opacity', 1)
            }

            //ELSE IF no rect, no circle but book is clicked
            else if(legendClicked == "0" && clicked == "0" && !(bookClicked == "0")){

                //Clicked = true
                legendClicked = d;
                
                //only show spells of selected type in list
                show_selected_type(d);
                //---------------------- Rectangles ----------------------

                //Every rect
                legend
                .style('opacity', .3);

                //The rect that was clicked
                d3.select(this)
                .style('opacity', 1)
                .style("stroke",function(d){
                    return color(d);
                })
                .style("stroke-width",3);
                
                //---------------------- Labels ----------------------

                //Lower opacity of all labels
                legendLabels
                .style("opacity", 0.3);
                
                //Return opacity of current label back to 1
                d3.select("#idlabel" + d)
                .style("opacity", 1);

                //---------------------- Erase Circles ----------------------

                //Reduce opacity of all circles
                nodes
                .style('opacity', 0.1);

                //Only circles out of clicked book and of type of clicked rect stay at opacity 1
                for(i = 0; i < allCircles.length; i++){

                    c = allCircles[i].slice(0,allCircles[i].length-1);
                    b = bookClicked.slice(bookClicked.length-1, bookClicked.length);

                    d3.select("#id" + c + b + "-" + d)
                    .style("opacity", 1);
                }
            }

            //ELSE IF no circle but rect and book are clicked and rect is clicked again 
            else if(legendClicked == d && clicked == "0" && !(bookClicked == "0")){

                //Clicked = false
                legendClicked = "0";

                //bring back spells of all types to the list
                show_all_types();
                //---------------------- Rectangles ----------------------

                //Every rect
                legend
                .style('opacity', 1);

                //The rect that was clicked again
                d3.select(this)
                .style("stroke","white")
                .style("stroke-width",0);

                //---------------------- Labels ----------------------
                
                //Return opacity of all labels back to 1
                legendLabels
                .style("opacity", 1);

                //---------------------- Put Circles Back ----------------------

                //Return opacity of all circles out of clicked book back to 1
                for(i = 0; i < allCircles.length; i++){

                    c = allCircles[i].slice(0,allCircles[i].length-1);
                    b = bookClicked.slice(bookClicked.length-1, bookClicked.length);

                    for(j = 0; j < allTypes.length; j++){
                        d3.select("#id" + c + b + "-" + allTypes[j])
                        .style("opacity", 1);
                    }
                }
            }
        })

        //---------------------- Add Book Lables ----------------------
        
        var bookLabels = svg
            .selectAll("mybookLables")
            .data(allBooks)
            .enter()
            .append("text")
            .attr("id", function(d,i){
                return bookId[i];
            })
            .attr("x", -50)
            .attr("y", 460)
            .text(function(d){
                return d;
            })
            .style("text-anchor", "front")
            .style("font-size", 13)
            .attr("transform", function(d,i) { 
                // for(i = 0; i < allCircles; i++){
                //     for(j = 0; j < allTypes; j++){
                //         console.log("#id" + allCircles[i].slice(0, allCircles[i].length-1) + d.slice(d.length-1, d.length) + allTypes[j])
                //         if(!(d3.select("#id" + allCircles[i].slice(0, allCircles[i].length-1) + d.slice(d.length-1, d.length) + allTypes[j]).empty())){
                //             return "translate(" + x(allCircles[i].slice(0, allCircles[i].length-1) + d.slice(d.length-1, d.length) + allTypes[j]) + ",0)"; 
                //         }
                //     }
                // }
                return "translate(" + i * width/6 + ",0)"; 
            });  

        //---------------------- Add Interactions To Books ----------------------

        bookLabels

        //---------------------- Mouseover ----------------------

        .on("mouseover", function(d,i){

            //IF no circle, no rect and no book is clicked
            //OR IF no circle, no book but rect is clicked
            if(clicked == "0" && legendClicked == "0" && bookClicked == "0"
            || clicked == "0" && !(legendClicked == "0") && bookClicked == "0"){

                d3.select(this)
                .style("font-weight", "bold")
                .style("cursor", "pointer");

                //---------------------- Tooltip ----------------------
                bookTooltip
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY + 25 + "px")
                .style("display", "inline-block")
                .style("background", "white")
                .html(bookNames[i]);
            }
            //ELSE IF no circle, no rect but book is clicked an mouse is moving over clicked book
            //OR IF no circle but rect and book is clicked an mouse is moving over clicked book
            else if(clicked == "0" && legendClicked == "0" && bookClicked == d
            || clicked == "0" && !(legendClicked == "0") && bookClicked == d){

                d3.select(this)
                .style("cursor", "pointer");

                //---------------------- Tooltip ----------------------
                bookTooltip
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY + 25 + "px")
                .style("display", "inline-block")
                .style("background", "white")
                .html(bookNames[i]);
            }
            else{
                bookLabels
                .style("cursor", "default");
            }
        })

        //---------------------- Mouseout ----------------------

        .on("mouseout", function(d){

            //IF no rect, no circle and no book is clicked 
            //OR IF no circle and no book but rect is clicked
            if(legendClicked == "0" && clicked == "0" && bookClicked == "0"
            || !(legendClicked) == "0" && clicked == "0" && bookClicked == "0"){

                bookLabels
                .style("font-weight", "normal");
            }
            
            //---------------------- Tooltip ----------------------

            bookTooltip
            .style("display","none");
        })

        //---------------------- Click ----------------------

        .on("click", function(d){

            //IF no circle, no rect and no book is clicked
            if(bookClicked == "0" && clicked == "0" && legendClicked == "0"){

                //Mark as clicked
                bookClicked = d;

                //show only spells in list that appear in selected book
                show_book_spells(d);
                //---------------------- Books ----------------------

                //Reduce opacity of all books
                bookLabels
                .style('opacity', .3);

                //Only current book stays at opacity 1
                d3.select(this)
                .style('opacity', 1);

                //---------------------- Circles ----------------------

                //Reduce opacity of all circles
                nodes
                .style("opacity", 0.1);

                //Only circles out of clicked book stay at opacity 1
                for(i = 0; i < allCircles.length; i++){

                    c = allCircles[i].slice(0,allCircles[i].length-5);

                    for(j = 0; j < allTypes.length; j++){

                        d3.select("#id" + c + this.id + "-" + allTypes[j])
                        .style("opacity", 1);
                    }
                }

                //---------------------- Links ----------------------

                //Reduce opacity of all links
                links
                .style("stroke-opacity", 0.1);

            }

            //ELSE IF no circle, no rect and but book is clicked and we are clicking on it again
            else if(clicked == "0" && legendClicked == "0" && bookClicked == d){

                //Mark as no longer clicked
                bookClicked = "0";

                //bring back spells of all books to list
                show_all_books();
                //---------------------- Books ----------------------
                bookLabels
                .style('opacity', 1)
                .style("font-weight", "normal");

                //---------------------- Circles ----------------------
                nodes
                .style("opacity", 1);

                //---------------------- Links ----------------------
                links
                .style("stroke-opacity", 1);
            }

            //ELSE IF no circle, no book but rect is clicked
            else if(bookClicked == "0" && clicked == "0" && !(legendClicked == "0")){

                //Mark as clicked
                bookClicked = d;
                
                //show only spells in list that appear in selected book
                show_book_spells(d);
                //---------------------- Books ----------------------

                //Reduce opacity of all books
                bookLabels
                .style('opacity', .3);

                //Only current book stays at opacity 1
                d3.select(this)
                .style('opacity', 1);

                //---------------------- Circles ----------------------

                //Reduce opacity of all circles
                nodes
                .style("opacity", 0.1);

                //Only circles of type and out of clicked book stay at opacity 1
                for(i = 0; i < allCircles.length; i++){

                    c = allCircles[i].slice(0,allCircles[i].length-1);
                    b = bookClicked.slice(bookClicked.length-1, bookClicked.length);
                    
                    d3.select("#id" + c + b + "-" + legendClicked)
                    .style("opacity", 1);
                }

                //---------------------- Links ----------------------

                //Reduce opacity of all links
                links
                .style("stroke-opacity", 0.1);

            }

            //ELSE IF no circle but rect and book is clicked (again)
            else if(clicked == "0" && !(legendClicked == "0") && bookClicked == d){

                //Mark as no longer clicked
                bookClicked = "0";

                //bring back spells of all books to list
                show_all_books();
                //---------------------- Books ----------------------
                bookLabels
                .style('opacity', 1)
                .style("font-weight", "normal");

                //---------------------- Circles ----------------------
                
                //Circles from type get returned to opacity 1
                for(i = 0; i < allCircles.length; i++){

                    d3.select("#id" + allCircles[i] + "-" + legendClicked)
                    .style("opacity", 1);
                }

                //Opacity of the links
                links
                .style('stroke-opacity', function(link_d){
                    //IF link is of same type as clicked rect, leave opacity at 1
                    if(link_d.type === legendClicked){
                        return 1;
                    }
                    //ELSE lower opacity to 0.1
                    else{
                        return 0.1;
                    }
                });
            }
        })
    })
}


// ------ Deals with clicks on a spell in the List: --------

function toggle_info(){
    var id = this.innerHTML.toLowerCase().split(" ")[0];

    var info_box = document.querySelector('#' + id + "_info");
    
    // if it's already open:
    if(info_box.classList.contains('show')){
        //close Info, set all font-colors and sizes back to normal
        hide_info();
       
    //if it's closed
    }else{
        //first close other Infobox if open:
        //then make the other spells grey 
        //and this one in its color and bigger
        show_info(id);
    }
}

//show the Infobox:
function show_info(id){
    //hide other possibly open info box:
    hide_info();

    //set clicked spell to this one and inform everyone, that it's clicked
    clickedSpell = id;
    spellClicked = true;

    //get the spell and it's infobox:
    var spell = document.querySelector('#' + id + "_spell");
    var info_box = document.querySelector('#' + id + "_info");

    //then color the Spell in its respective color
    var type = String(document.querySelector('#' + id + "_spell").classList.item(1));
    console.log("type: " + type);
    var colour = color(type);
    spell.style.color = colour[0];
    spell.style.fontSize = '20px';

    //and Show the Infobox
    info_box.classList.toggle("show");
    info_box.style.backgroundColor = colour[1];

}

//Hide the infobox:
function hide_info(){
    clickedSpell = "";
    spellClicked = false;

    //close the infobox
    var element = document.querySelector('.show');
    if(element){
        element.classList.toggle("show");
    }
    //then reset the style of all items to default (does NOT include SHOWING all items!)
    default_style();
}

//bring all Listelements back to their normal style
function default_style(){
    var elements = document.querySelectorAll('.spells');
    elements.forEach.call(elements, function(e){
        e.style.fontSize = '15px';
        e.style.color = 'black';
        e.style.pointerEvents = "auto";
        e.style.cursor = "pointer";
    });
}


// ------------------ SPELL LIST ------------------

//----- Deals with Clicks on a Type in the Legend: -------

//only show the spells of the type that was selected in the legend
function show_selected_type(type){
    //bring back spells of all books (but only of the selected type!)
    
    hide_info();

    //then get all spells...
    var spells = document.querySelectorAll(".spells");
    var type = type.toLowerCase();
    // ...and hide all that have the wrong type
    spells.forEach.call(spells, function(e){
        if(!e.classList.contains(type)){
            console.log(e);
            e.style.display = "none";
        }
        else{
            //mark those spells as "selected bc. there is a type selected"
            e.classList.toggle("typeSelected");
        }
    });   
}

function show_all_types(){
    //bring back spells of all types (but only of the selected book!)

    hide_info();
    
    var spells = document.querySelectorAll(".spells");
    spells.forEach.call(spells, function(e){
        //show all spells that are not excluded by a book-selection
        if((bookClicked != "0" && e.classList.contains("bookSelected")) || (bookClicked == "0")){
            e.style.display = "block";
        }
        //de-mark all spells as "there is no type selected (anymore)"
        if(e.classList.contains("typeSelected")){
            e.classList.toggle("typeSelected");
        }
    });
}


//----- Deals with Clicks on a Book Label: -------

function show_book_spells(book){
    //close (possibly open) infobox
    hide_info();

    //maybe change this in the data, this is ugly ...
    var selectedBook;
    switch(book){
        case "Book 1":
            selectedBook = "HP1";
            break;
        case "Book 2":
            selectedBook = "HP2";
            break;
        case "Book 3":
            selectedBook = "HP3";
            break;
        case "Book 4":
            selectedBook = "HP4";
            break;
        case "Book 5":
            selectedBook = "HP5";
            break;
        case "Book 6":
            selectedBook = "HP6";
            break;
        case "Book 7":
            selectedBook = "HP7";
            break;
    }

    //get all spells ...
    var spells = document.querySelectorAll(".spells");
    spells.forEach.call(spells, function(e){
        var booklist = String(e.querySelector(".bookTags").innerHTML).split(' ');
        //... and hide those that do not appear in the selected book
        if(!booklist.includes(selectedBook)){
            e.style.display = "none";
        }else{
            //mark the remaining spells as "selected bc. there is a book selected"
            e.classList.toggle("bookSelected");
        }
    });
}

function show_all_books(){
    //close (possibly open) infobox
    hide_info();

    var spells = document.querySelectorAll(".spells");
    spells.forEach.call(spells, function(e){
        //show all spells that are not excluded by a type-selection
        if((legendClicked != "0" && e.classList.contains("typeSelected")) || (legendClicked == "0")){
            e.style.display = "block";
        }
        //de-mark all previously shown spells as "there is no book selected (anymore)"
        if(e.classList.contains("bookSelected")){
            e.classList.toggle("bookSelected");
        }
    });
}

function color(type){
    //choose respective color for each spell type

    switch(type){
        case "charm":
            //green
            return ["rgb(100, 183, 17)", "rgba(100, 183, 17, 0.4)"];
        case "spell":
            //blue
            return ["rgb(0, 136, 255)", "rgba(0, 136, 255, 0.4)"];
        case "curse":
            //orange
            return ["#FFAE19", "rgba(255, 132, 0, 0.4)"];
        case "unforgivablecurse":
            //red
            return ["rgb(184, 12, 12)", "rgba(184, 12, 12, 0.4)"];
    }
}

function highlight_path(){
    var id = this.id;
    // console.log("highlight_path: " + this.id);
}