//in list:
var clickedSpell = "";
var spellClicked = false;
// var selectedType = "none";

//in chart:
var clicked = "0";           //Accio
var bookClicked = "0";      //Book 1
var legendClicked = "0";    //Charm


function init(){
    document.body.addEventListener("load", arc());
    var spells = document.querySelectorAll('.toggleSpells');

    spells.forEach.call(spells, function(e){
        e.addEventListener("click", toggle_info, false);
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
        var numerOfSpells = [4,9,13,26,29,29,40];

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
        "The worst types of spells there are, they <br> must never be used!"];

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
            .attr("class", function(d){
                return("link_" + (d.source.split("_")[0]).toLowerCase() + "_" + d.type.toLowerCase() 
                + " linkConnections");
            })
            .attr('d', function(d){

                start = x(idToNode[d.source].name)    //x position of start node
                end = x(idToNode[d.target].name)      //x position of end node

                //Source: https://css-tricks.com/svg-path-syntax-illustrated-guide/

                return ['M', start, height-30,          //M = move start of arc to x = start, y = height-30 (where the starting node is)
                    'A',                                //A = elliptical arc
                    (start - end)/2, ',',               //rX = x radius of the ellipse 
                    (start - end)/2, 0, 0, ',',         //rY = y radius of the ellipse, rotation = 0, arc = 0
                    arc_on_top(start, end), end, ',',   //sweep = 0 or 1, eX = end 
                    height-30]                          //eY = height-30 
                    .join(' ');
            })
            .style("fill", "none")
            .attr("stroke", "grey")
            .style("stroke-width", 1);

            //The arc is supposed to be above everything else, if end is before start the arc would be upside down, so we return 0 
            function arc_on_top(start, end){
                if(start < end){
                    return 1;
                }else{
                    return 0;
                }
            }

        //---------------------- Add Circles ----------------------
        
        var nodes = svg
            .selectAll("mynodes")
            .data(data.nodes.sort(function(a,b) { return +b.size - +a.size }))
            .enter()
            .append("circle")
            .attr("class", function(d){
                return ("circleNodes " + d.id.split("_")[0].toLowerCase()
                + " " + d.type.toLowerCase());
            })
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
                        return "grey";
                    }
                })
                //Opacity of the link
                .style('stroke-opacity', function(link_d){ 
                    if(link_d.source === d.id || link_d.target === d.id){
                        return 1;
                    }
                    else{
                        return 0.3;
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
            else if(clicked == "0" && bookClicked == "0" && legendClicked == d.type){

                //---------------------- Circles ----------------------

                nodes
                .style("opacity", 0.1);

                //All corresponding circles
                for(i = 0; i < allCircles.length; i++){
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
                            return 0.3;
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

                labels
                .style("font-size", 0);
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

                labels
                .style("font-size", 0);
            }

            //ELSE a circle is clicked but we are hovering above a different one
            else{
                //---------------------- Circles ----------------------
                nodes
                .style("cursor", "default");

                labels
                .style("font-size", 0);
            }
        })

        //---------------------- Mouseout ----------------------

        .on('mouseout', function(d){

            //IF no circle, no rect and no book is clicked
            if(clicked == "0" && legendClicked == "0" && bookClicked == "0"){

                //---------------------- Connections ----------------------
                links
                .style('stroke', 'grey')
                .style('stroke-opacity', 1)
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
            || clicked == "0" && bookClicked == "0" && legendClicked == d.type){

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
                    return 'grey';
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

                labels
                .style("font-size", 0);

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

                //---------------------- Labels ----------------------

                labels
                .style("font-size", 0);
            }

            //ELSE IF rect, book and circle is clicked (again)
            else if(!(bookClicked == "0") && !(legendClicked == "0") && clicked == d.id){

                //Mark as no longer clicked
                clicked = "0";

                //hide infobox and reset list
                hide_info();
                bring_back_spells();
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
                bring_back_spells();
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
                bring_back_spells();
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
                bring_back_spells();
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
            update_headline();
        })

        //---------------------- Add Legend ----------------------

        var legend = svg
            .selectAll("mytypes")
            .data(allTypes)
            .enter()
            .append("rect") 
            //"#idrect" + type
            .attr("class","legendRect")
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
            .attr("class", "legendLabel")
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
                for(i = 0; i < allCircles.length; i++){
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
            update_headline();
        })

        //---------------------- Add Book Lables ----------------------
        
        var bookLabels = svg
            .selectAll("mybookLables")
            .data(allBooks)
            .enter()
            .append("text")
            .attr("class", "bookLabel")
            .attr("id", function(d,i){
                return bookId[i];
            })
            .attr("x", /*-70*/ 100)
            .attr("y", /*460*/ 480)
            .text(function(d){
                return d;
            })
            .style("text-anchor", "center")
            .style("font-size", 13)
            
            .attr("transform", function(d,i){ 
                //return "translate(" + i * width/6 + ",0)"; 
                return "translate(" + i * width/10 + ",0)"; 
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
                .style("font-size", "15")
                .style("cursor", "pointer");

                //---------------------- Tooltip ----------------------
                bookTooltip
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY + 25 + "px")
                .style("display", "inline-block")
                .style("background", "white")
                .html(bookNames[i] + " – " + numerOfSpells[i] + " different spells");
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
                .html(bookNames[i] + " – " + numerOfSpells[i] + " spells");
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
                .style("font-weight", "normal")
                .style("font-size", "13");
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
            update_headline();
        })
    })
}



// ------------------ SPELL LIST ------------------


// ------ Deals with clicks on a spell in the List: --------

function toggle_info(){
    var id = this.innerHTML.toLowerCase().split(" ")[0];

    var info_box = document.querySelector('#' + id + "_info");
    
    // if it's already open:
    if(info_box.classList.contains('show')){
        //close Info, set all font-colors and sizes back to normal
        hide_info();
        bring_back_spells();
       
    //if it's closed
    }else{
        //first close other Infobox if open:
        show_info(id);
    }
    update_headline();
}

//show the Infobox:
function show_info(id){
    //console.log("id: " + id);

    //hide other possibly open info box and deselect possibly selected paths and circels in chart:
    hide_info();
    hide_spells(id);

    //determine type of spell
    var type = String(document.querySelector('#' + id + "_spell").classList.item(1));
    //console.log("type: " + type);
    
    highlight_nodes_and_paths(id,type);
    highlight_legend_type(type);
    highlight_books_of_spell(id);

    //set clicked spell to this one and inform everyone, that it's clicked
    // clickedSpell = id;
    // spellClicked = true;

    //get the spell and it's infobox:
    var spell = document.querySelector('#' + id + "_spell");
    var info_box = document.querySelector('#' + id + "_info");

    //then color the Spell in its respective color
    var colour = color(type);
    spell.style.color = colour[0];
    spell.style.fontSize = '20px';
    spell.style.fontWeight = 'bold';

    spell.firstElementChild.classList.toggle("spellShown");
    
    //and Show the Infobox
    info_box.classList.toggle("show");
    info_box.style.backgroundColor = colour[1];

}

//Hide the infobox:
function hide_info(){
    // clickedSpell = "";
    // spellClicked = false;

    //bring the chart back to it's status with the spell not selected
    deselect_spell_in_chart();
    deselect_type_in_legend();
    deselect_booklabels();

    //close the infobox
    var element = document.querySelector('.show');
    if(element){
        element.classList.toggle("show");
    }
    var spell = document.querySelector('.spellShown');
    if(spell){
        spell.classList.toggle("spellShown");
    }
    //then reset the style of all list items to default (does NOT include SHOWING all items!)
    default_style();
}

//bring all Listelements back to their normal style
function default_style(){
    var elements = document.querySelectorAll('.spells');
    elements.forEach.call(elements, function(e){
        e.style.fontSize = '15px';
        e.style.fontWeight = 'normal';
        e.style.color = 'black';
        e.style.pointerEvents = "auto";
        e.style.cursor = "pointer";
    });
}

function hide_spells(id){
    //get all spells ...
    var spells = document.querySelectorAll(".spells");
    spells.forEach.call(spells, function(e){
        if(e.id != id + "_spell"){
            e.style.display = "none";
        }else{
            // //mark the remaining spell as "selected"
            // e.classList.toggle("spellSelected");
        }
    });
}

//bring all spells back to the list
function bring_back_spells(){
    if(bookClicked != "0" && legendClicked != "0"){
        show_all_selected_spells(true, true);
    }else if(bookClicked != "0" && legendClicked == "0"){
        show_all_selected_spells(true, false)
    }else if(bookClicked == "0" && legendClicked != "0"){
        show_all_selected_spells(false,true);
    }else{
        show_all_selected_spells(false,false);
    }
}

function show_all_selected_spells(book, type){
    hide_info();

    var spells = document.querySelectorAll(".spells");
    //if book and type selected:
    if(book && type){
        spells.forEach(function(e){
            if(e.classList.contains("bookSelected") && e.classList.contains("typeSelected")){
                e.style.display = "block";
            }
        });
    //if only book selected:
    }else if(book && !type){
        spells.forEach(function(e){
            if(e.classList.contains("bookSelected") && !e.classList.contains("typeSelected")){
                e.style.display = "block";
            }
        });
    //if only type selected:
    }else if(!book && type){
        spells.forEach(function(e){
            if(!e.classList.contains("bookSelected") && e.classList.contains("typeSelected")){
                e.style.display = "block";
            }
        });
    //if neither book nor type selected:
    }else{
        var spells = document.querySelectorAll(".spells");
        spells.forEach.call(spells, function(e){
            e.style.display = "block";
        });
    }
}

//when a spell in the list is clicked: highlight it's type in the legend
function highlight_legend_type(type){
    //highlight the type of the selected spell in the legend:

    //Rectangle ids: #idrectCharm
    //Rectangle class: .legendRect
    var legendRects = document.querySelectorAll(".legendRect");

    //Label ids: #idlabelCharm
    //Label class: .legendLabel
    var legendLabels = document.querySelectorAll(".legendLabel");

    if(legendClicked == "0"){
        legendRects.forEach(function(e){
            e.style.opacity = 0.3;
            if(e.id.slice(6,e.id.length).toLowerCase() == type){
                e.style.opacity = 1.0;
                e.style.stroke = chart_color(type);
                e.style.strokeWidth = 3.0;
            }
        });
        legendLabels.forEach(function(e){
            e.style.opacity = 0.3;
            if(e.id.slice(7,e.id.length).toLowerCase() == type){
                e.style.opacity = 1.0;
            }
        });

    }else{
        legendRects.forEach(function(e){
            e.style.opacity = 0.3;
        });
        var rect = document.querySelector("#idrect"+legendClicked);
        rect.style.opacity = 1.0;
        rect.style.stroke = chart_color(type);
        rect.style.strokeWidth = 3.0;

        legendLabels.forEach(function(e){
            e.style.opacity = 0.3;
        });

        var label = document.querySelector("#idlabel"+legendClicked);
        label.style.opacity = 1.0
    }

   
    
}

//when a spell in the list gets deselected: reset the legend to normal
function deselect_type_in_legend(){
    //set legend back to normal
    var legendRects = document.querySelectorAll(".legendRect");
    var legendLabels = document.querySelectorAll(".legendLabel");

    if(legendClicked == "0"){
        legendRects.forEach(function(e){
            e.style.opacity = 1.0;
            e.style.stroke = "white";
            e.style.strokeWidth = 0.0;
        });

        legendLabels.forEach(function(e){
            e.style.opacity = 1.0;
        });
    }else{
        legendRects.forEach(function(e){
            e.style.opacity = 0.3;
        });
        var rect = document.querySelector("#idrect"+legendClicked);
        rect.style.opacity = 1.0;
        rect.style.stroke = chart_color(legendClicked);
        rect.style.strokeWidth = 3.0;
        
        legendLabels.forEach(function(e){
            e.style.opacity = 0.3;
        });

        var label = document.querySelector("#idlabel"+legendClicked);
        label.style.opacity = 1.0;
    }
}

//when a spell in the list is clicked: highlight the books it appears in
function highlight_books_of_spell(spell){
    //Booklabel class: .bookLabel
    //Booklabel ids: #HP_0x

    var bookTags = get_books(spell);
    var bookLabels = document.querySelectorAll(".bookLabel");

    if(bookClicked == "0"){
        bookLabels.forEach(function(e){
            e.style.opacity = 0.3;
            if(bookTags.includes(e.id.replace("HP_0", "Book "))){
                e.style.opacity = 1.0;
                e.style.fontWeight = "bold";
            }
        });
    }else{
        bookLabels.forEach(function(e){
            e.style.opacity = 0.3;
        });
        var label = document.querySelector("#" + bookClicked.replace("Book ", "HP_0"));
        label.style.opacity = 1.0;
        label.style.fontWeight = "bold";

    }
}

//when a spell in the list gets deselected: reset the books to normal
function deselect_booklabels(){

    var bookLabels = document.querySelectorAll(".bookLabel");
    if(bookClicked == "0"){
        bookLabels.forEach(function(e){
            e.style.opacity = 1.0;
            e.style.fontWeight = "normal";
        });
    }else{
        var label = document.querySelector("#" + bookClicked.replace("Book ", "HP_0"));
        label.style.opacity = 1.0;
        label.style.fontWeight = "bold";
    }
    

}

function update_headline(){
    var headline = document.querySelector(".listHeadline");
    var type = "";
    var book = "";
    if(clicked != "0"){
        headline.innerHTML = "";
    }
    else if(legendClicked == "0" && bookClicked == "0"){
        headline.innerHTML = "All Spells";
    }
    else if(legendClicked != "0" && bookClicked != "0"){
        
        headline.innerHTML = set_book(bookClicked) + " - " + set_type(legendClicked);
    }else if(legendClicked != "0" && bookClicked == "0"){
        headline.innerHTML = set_type(legendClicked);
    }else if(legendClicked == "0" && bookClicked != "0"){
        headline.innerHTML = set_book(bookClicked);
    }
}

function set_type(selected){
    switch(selected){
        case("Charm"):
            return "Charms";
        case("Spell"):
            return "Spells";
        case("Curse"):
            return "Curses";
        case("UnforgivableCurse"):
            return "Unforgivable Curses";
    }
}

function set_book(selected){
    switch(selected){
        case("Book 1"):
            return "Philosophers Stone";
        case("Book 2"):
            return "Chamber of Secrets";
        case("Book 3"):
            return "Prizoner of Azkaban";
        case("Book 4"):
            return "Goblet of Fire";
        case("Book 5"):
            return "Order of the Phoenix";
        case("Book 6"):
            return "Half-Blood Prince";
        case("Book 7"):
            return "Deathly Hallows";
    }
}

//----- Deals with Clicks on a Type in the Legend: -------

//only show the spells of the type that was selected in the legend
//bring back spells of all books (but only of the selected type!)
function show_selected_type(type){
    hide_info();

    //then get all spells...
    var spells = document.querySelectorAll(".spells");
    var type = type.toLowerCase();
    // ...and hide all that have the wrong type
    spells.forEach.call(spells, function(e){
        if(!e.classList.contains(type)){
            e.style.display = "none";
        }
        else{
            //mark those spells as "selected bc. there is a type selected"
            e.classList.toggle("typeSelected");
        }
    });   
}

//bring back spells of all types (but only of the selected book!)
function show_all_types(){
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

//only show spells in list that appear in the selected book:
function show_book_spells(book){
    //close (possibly open) infobox
    hide_info();

    //get all spells ...
    var spells = document.querySelectorAll(".spells");
    spells.forEach.call(spells, function(e){
        var booklist = String(e.querySelector(".bookTags").innerHTML).split(',');
        //... and hide those that do not appear in the selected book
        if(!booklist.includes(book)){
            e.style.display = "none";
        }else{
            //mark the remaining spells as "selected bc. there is a book selected"
            e.classList.toggle("bookSelected");
        }
    });
}

//show spells from all books again (but only of selected type, if selected)
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

// ------------- Highlight Stuff in Chart on click in List ----------------

//highlight a spell, that was selected in the list, in the chart:
function highlight_nodes_and_paths(id, type){

    //get the circles that need to be highlighted
    var spellCircles = highlight_specific_spell(id, type);
    
    highlight_nodes(spellCircles);

    //if a book is selected the connections don't need to be highlighted!
    if(bookClicked == "0"){
        highlight_links(id,type);
    }
}

 //get the circles that need to be highlighted
function highlight_specific_spell(id){

    //determine type of spell
    //id looks like this: #accio_spell
    var type = get_type(id);

    //get the circles that need to be highlighted
    var years = ['HP_01', 'HP_02', 'HP_03', 'HP_04', 'HP_05', 'HP_06', 'HP_07'];

    //if a book is selected: highlight only the spell-circle from that book
    //clicked Books now are named like this: "Book 1" but we need it like "HP_01"
    if(bookClicked != "0"){
        years = [bookClicked.replace("Book ","HP_0")];
    }

    var spellCircles = [];
    for(y of years){
        //circle ids look like this: #idAccio_HP_01-Charm
        var circle = document.querySelector("#id" + capitalize_first_letter(id) + "_" + y + "-" + capitalize_first_letter(type));
        if(circle != null){
            spellCircles.push(circle);
        }   
    }
    return spellCircles;
}

//highlight the circles, that need to be highlighted:
function highlight_nodes(spellCircles){
    clicked = spellCircles[0].id.split("-")[0].replace("id","")
    // console.log(clicked);
    var allCircles = document.querySelectorAll(".circleNodes");
    //Reduce opacity of all circles
    allCircles.forEach(function(e){
        e.style.opacity = .1;
        e.style.pointerEvents = "none";
    });
    
    spellCircles.forEach(function(e){
        e.style.opacity = 1;
        e.style.pointerEvents = "auto";
        e.style.cursor = "pointer";
    });
}

//highlight the links, that need to be highlighted:
function highlight_links(id,type){

    document.querySelectorAll(".linkConnections").forEach(function(link_d){
        if(link_d.classList[0].split("_")[1] == id){
            link_d.style.stroke = chart_color(type);
            link_d.style.strokeOpacity = 1;
            link_d.style.strokeWidth = 4;
        }else{
            link_d.style.stroke = 'grey';
            link_d.style.strokeOpacity = 0.2;
            link_d.style.strokeWidth = 1;
        }
    });
}


// ----------- De-Highlight Stuff in Chart after deselecting a spell in the list -------------

//if a spell in the list is deselected: demark it in the chart 
//but return to the status of the selected type and book, if any
function deselect_spell_in_chart(){
    clicked = "0";

    demark_circles();
    demark_paths();
}

//determin the spells that need to highlighted after deselecting a spell in the list
function spells_to_highlight(){
    //get the circles that need to be highlighted
    var spellCircles = [];
    var allCircles = document.querySelectorAll(".circleNodes");

    //if a book is selected: highlight only the spell-circle from that book
    if(bookClicked != "0"){
        allCircles.forEach(function(e){
            if(e.id.split("_")[2].split("-")[0] == "0" + bookClicked.split(" ")[1]){
                spellCircles.push(e);
            }
        });
    }else{
        spellCircles = allCircles;
    }
    return spellCircles;
}

//demark all circles that do not need to be highlighted after deselecting a spell in the list
function demark_circles(){
    var allCircles = document.querySelectorAll(".circleNodes");
    var spellCircles = spells_to_highlight();
    
    allCircles.forEach(function(e){
        if((legendClicked != "0" && bookClicked == "0") || (bookClicked != "0" && legendClicked == "0")){
            if((legendClicked != "0" && e.classList.contains(legendClicked.toLowerCase())) || (bookClicked != "0" && spellCircles.includes(e))){
                e.style.opacity = 1;
                e.style.pointerEvents = "auto";
            }
        }else if(legendClicked != "0" && bookClicked != "0"){
            if(e.classList.contains(legendClicked.toLowerCase()) && spellCircles.includes(e)){
                e.style.opacity = 1;
                e.style.pointerEvents = "auto";
            }
        }
        else{
            e.style.opacity = 1;
            e.style.pointerEvents = "auto";
        }
    });
}

//demark all paths that do not need to be highlighted after deselecting a spell in the list
// -------- I think there might still be an ERROR in here!! -----------
function demark_paths(){
    document.querySelectorAll(".linkConnections").forEach(function(link_d){
        var spell = link_d.classList[0].split("_")[1];
        var type = link_d.classList[0].split("_")[2];
        var booklist = document.querySelector('#' + spell + '_info').querySelector('.bookTags').innerHTML.split(",");

        //if no book is selected, there are paths to see
        if(bookClicked == "0"){
            // if a type was selected in the legend:
            if(legendClicked != "0"){
                //if the type of the spell matches the selected Type: those get back to "normal"
                if(type == legendClicked.toLowerCase()){
                    link_d.style.stroke = 'grey';
                    link_d.style.strokeOpacity = 1;
                    link_d.style.strokeWidth = 1;
                //the others are not selected bc. the types do not match
                }else{
                    //nothing
                }
            //else if no type was selected: all paths go back to normal
            }else{
                link_d.style.stroke = 'grey';
                link_d.style.strokeOpacity = 1;
                link_d.style.strokeWidth = 1;
            }
        //else if a book was selected: there are no paths to see
        }else{
            //nothing
        }
    });
}

// ----------- Helpers -----------

//colors for the list
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

//colors for the chart
function chart_color(type){
    switch(type){
        case "charm":
            //green
            return "#A5C78B";
        case "spell":
            //blue
            return "#4E8BD1";
        case "curse":
            //orange
            return "#FFB733";
        case "unforgivablecurse":
            //red
            return "#BE253F";

    }
}

function capitalize_first_letter(word){
    //unfortunately we wrote UnforgivableCurse in a very impractical way -.-
    if(word.length == 17){
        return(word.charAt(0).toUpperCase() + word.slice(1,12) + word.charAt(12).toUpperCase() + word.slice(13));
    }
    return (word.charAt(0).toUpperCase() + word.slice(1));
}

//get a list of all books a spell appears in as a string
function get_books(spell){
    var spellElement = document.querySelector("#"+spell+"_spell");
    return String(spellElement.querySelector(".bookTags").innerHTML).split(',');
}

//get the type of a spell as string
function get_type(spell){
    return String(document.querySelector('#' + spell + "_spell").classList.item(1));
}