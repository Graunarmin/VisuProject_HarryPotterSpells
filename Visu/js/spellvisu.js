
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

    var clicked = "0";
    var hover = "0";
    var book = "0";
    var id = "0";
    var circleTooltip = d3.select("body").append("div").attr("class", "toolTip");
    var legendClicked = "0";
    var bookTooltip = d3.select("body").append("div").attr("class", "toolTip");
    var bookClicked = "0";

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

    //---------------------- Read Data ----------------------

    d3.json("Data/arcdata.json", function(data){

        //List of all books
        var allBooks = ["HP1", "HP2", "HP3", "HP4", "HP5", "HP6", "HP7"];
        var bookId = ["HP_01", "HP_02", "HP_03", "HP_04", "HP_05", "HP_06", "HP_07"];
        var bookNames = ["The Philosopher's Stone", "The Chamber of Secrets", "The Prisoner of Azkaban", 
        "The Goblet of Fire", "The Order of the Phoenix", "The Half-Blood Prince", "The Deathly Hallows"];

        //List of all circles
        var allCircles = data.nodes.map(function(d){return d.name});

        //List of all types
        var allTypes = data.nodes.map(function(d){return (d.type).split(' ').join('')});
        //Somehow changes the size ^^
        allTypes = [...new Set(allTypes)]

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
            .attr("class", function(d){
                return ("class" + (d.type).split(' ').join(''));
            })
            .attr("id", function(d){
                return ("id" + d.id + "-" + (d.type).split(' ').join(''));
            })
            .attr("cx", function(d){ 
                return(x(d.name))
            })
            .attr("cy", height-30)
            .attr("r", function(d){ 
                return(size(d.size))
            })
            .style("fill", function(d){ 
                return color((d.type).split(' ').join(''))
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
            //OR IF no circle but rect is clicked and mouse is over corresponding circle
            if(clicked == "0" && legendClicked == "0" && bookClicked == "0" 
            || clicked == "0" && legendClicked == (d.type).split(' ').join('')){

                //---------------------- Circles ----------------------

                //Reduce opacity of all circles
                nodes
                .style('opacity', .1)
                .style("cursor", "pointer");

                //Only current circle and all connected circles stay the same color 
                for(i = 1; i < 8; i++){
                    d3.select("#id" + id + i + "-" + (d.type).split(' ').join(''))
                    .style('opacity', 1);
                }

                //---------------------- Connections ----------------------

                links
                //Color of the link
                .style('stroke', function (link_d){ 
                    if(link_d.source === d.id || link_d.target === d.id){
                        return color((d.type).split(' ').join('')); 
                    }
                    else{
                        return '#b8b8b8';
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
                        return color((d.type).split(' ').join(''));
                    }
                })

                //---------------------- Tooltip ----------------------

                circleTooltip
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY + 30 + "px")
                .style("display", "inline-block")
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
                .style("top", d3.event.pageY + 30 + "px")
                .style("display", "inline-block")
                .html(
                    d.spell + ":" + "<br>" + "Used " 
                    + d.size + " times in book " + book
                );
            }

            //ELSE IF a circle is clicked and we are hovering above a connected circle
            else if(!(clicked == "0") && id == clicked.slice(0,clicked.length-1)){

                //---------------------- Circles ----------------------
                d3.select("#id" + hover + "-" + (d.type).split(' ').join(''))
                .style("cursor", "pointer");

                //---------------------- Tooltip ----------------------
                circleTooltip
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY + 30 + "px")
                .style("display", "inline-block")
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

                //---------------------- Connections ----------------------
                links
                .style('stroke', 'grey')
                .style('stroke-opacity', .8)
                .style('stroke-width', '1');

                //---------------------- Lables ----------------------
                labels
                .style("font-size", 0);
            }

            //ELSE IF no circle but rect on legend is clicked and mouse is moving of of corresponding circle  
            else if(clicked == "0" && legendClicked == (d.type).split(' ').join('')){
                
                for(j = 1; j < allCircles.length; j++){
                    for(i = 1; i < 8; i++){
                        d3.select("#id" + allCircles[j] + "-" + (d.type).split(' ').join(''))
                        .style('opacity', 1);
                    }
                }

                //Reduce opacity of all links
                links
                .style('stroke', '#b8b8b8')
                .style('stroke-opacity',0.2)
                .style('stroke-width', '1');

                //Labels
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
            //OR IF no circle was clicked but this circle is the same type as the clicked rect
            if(clicked == "0" && legendClicked == "0" && bookClicked == "0"
            || clicked == "0" && legendClicked == (d.type).split(' ').join('')){

                //Mark as clicked
                clicked = d.id;

                //---------------------- Circles ----------------------

                //Reduce opacity of all circles
                nodes
                .style('opacity', .1);

                //Only current circle and all connected circles stay the same color 
                for(i = 1; i < 8; i++){
                    d3.select("#id" + id + i + "-" + (d.type).split(' ').join(''))
                    .style('opacity', 1);
                }

                //---------------------- Connections ----------------------

                links
                //Color of the link
                .style('stroke', function (link_d){ 
                    if(link_d.source === d.id || link_d.target === d.id){
                    return color((d.type).split(' ').join('')); 
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
                        return color((d.type).split(' ').join(''));
                    }
                })

                //---------------------- Legend ----------------------

                //Reduce opacity of all rect
                legend
                .style('opacity', .3);

                //Only rect of current type stays colored 
                d3.select("#idrect" + (d.type).split(' ').join(''))
                .style('opacity', 1)
                .style("stroke",function(d){
                    return color(d);
                })
                .style("stroke-width",3);

                //Lower opacity of all labels
                legendLabels
                .style("opacity", 0.3);
                
                //Return opacity of current label back to 1
                d3.select("#idlabel" + (d.type).split(' ').join(''))
                .style("opacity", 1);
            }

            //ELSE IF a circle or connected circle is clicked (again) and no rect is clicked 
            else if(clicked.slice(0,clicked.length-1) == d.id.slice(0,clicked.length-1) && legendClicked == "0"){

                //Mark as no longer clicked
                clicked = "0";

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
            }

            //ELSE IF circle or connected circle is clicked (again) and rect is clicked
            else if(clicked.slice(0,clicked.length-1) == d.id.slice(0,clicked.length-1) && legendClicked == (d.type).split(' ').join('')){

                //Mark as no longer clicked
                clicked = "0";

                //---------------------- Circles ----------------------

                for(i = 1; i < allCircles.length; i++){
                    d3.select("#id" + allCircles[i] + "-" + (d.type).split(' ').join(''))
                    .style('opacity', 1);
                }

                //---------------------- Labels ----------------------
                labels
                .style("font-size", 0); 
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
            .data(allTypes)
            .enter()
            .append("text")
            .attr("id", function(d){
                return ("idlabel" + d);
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

        .on("mouseover", function(d){

            //IF no rect, no circle and no book is clicked
            if(legendClicked == "0" && clicked == "0" && bookClicked == "0"){

                //The rect we are hovering above 
                d3.select(this)
                .style("stroke",function(d){
                    return color(d);
                })
                .style("stroke-width",3)
                .style("cursor", "pointer");
            }  
            //ELSE IF no circle, no book but rect is clicked and we are hovering above it 
            else if(legendClicked == d && clicked == "0" && bookClicked == "0"){

                d3.select(this)
                .style("cursor", "pointer");
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
            if(legendClicked == "0" && clicked == "0" && bookClicked == "0"){

                legend
                .style("stroke","white")
                .style("stroke-width",0);
            }
        })

        //---------------------- Click ----------------------

        .on("click", function(d){

            //IF no rect, no circle and no book is clicked
            if(legendClicked == "0" && clicked == "0" && bookClicked == "0"){

                //Clicked = true
                legendClicked = d;

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
                .style('opacity', .1)
                .style("cursor", "pointer");

                //Only current circle and all connected circles stay the same color 
                for(i = 1; i < allCircles.length; i++){
                    d3.select("#id" + allCircles[i] + "-" + d)
                    .style('opacity', 1);
                }

                //Reduce opacity of all links
                links
                .style('stroke-opacity', function(link_d){ 

                    /*for(i = 1; i < allCircles.length; i++){
                        if(link_d.source === allCircles[i] && d.type == d|| link_d.target === allCircles[i]){
                            return 1;
                        }
                        else{*/
                            return 0.2;
                        //}
                    //}
                });
            }

            //ELSE IF no circle, no book but rect is clicked and we are clicking on the same one again 
            else if(legendClicked == d && clicked == "0" && bookClicked == "0"){
                
                //Clicked = false
                legendClicked = "0";

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
                .style("cursor", "pointer");

                //Return opacity of all links back to 1
                links
                .style('stroke-opacity', .8)
                .style('stroke-width', '1');
            }
        })

        //---------------------- Add Book Lables ----------------------

        var bookLabels = svg
            .selectAll("mybookLables")
            .data(allBooks)
            .enter()
            .append("text")
            .attr("id", function(d,i){
                //return "idbook" + d;
                return "idbook" + bookId[i];
            })
            .attr("x", 0)
            .attr("y", 430)
            .text(function(d){
                return d;
            })
            .style("text-anchor", "front")
            .style("font-size", 13)
            .attr("transform", function(d, i) { return "translate(" + i * width/7 + ",0)"; }); 

        bookLabels
        .on("mouseover", function(d,i){

            //IF no circle, no rect and no book is clicked
            if(clicked == "0" && legendClicked == "0" && bookClicked == "0"){

                d3.select(this)
                .style("opacity", .3)
                .style("cursor", "pointer");

                //---------------------- Tooltip ----------------------
                bookTooltip
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY + 30 + "px")
                .style("display", "inline-block")
                .html(bookNames[i]);
            }
            //ELSE IF no circle, no rect but book is clicked an mouse is moving over it
            else if(clicked == "0" && legendClicked == "0" && bookClicked == d){

                d3.select(this)
                .style("cursor", "pointer");
                
                //---------------------- Tooltip ----------------------
                bookTooltip
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY + 30 + "px")
                .style("display", "inline-block")
                .html(bookNames[i]);
            }
            else{
                bookLabels
                .style("cursor", "default");
            }
        })
        .on("mouseout", function(d){

            if(legendClicked == "0" && clicked == "0" && bookClicked == "0"){
                d3.select(this)
                .style("opacity", 1);
            }
            
            //---------------------- Tooltip ----------------------

            bookTooltip
            .style("display","none");
        })
        .on("click", function(d){

            if(bookClicked == "0"){

                bookClicked = d;

                bookLabels
                .style('opacity', .3);

                d3.select(this)
                .style('opacity', 1);
            }
            else if(bookClicked == d){

                bookClicked = "0";

                bookLabels
                .style('opacity', 1);
            }
        })
    })
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
    spell.style.fontSize = '20px';
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
        e.style.fontSize = '15px';
        e.style.color = 'black';
    });
}

function color(element){
    //choose respective color for each spell type
    var type = String(element.querySelector('.type .infoContent').innerHTML);
    
    switch(type){
        case "Charm":
            //green
            return ["rgb(100, 183, 17)", "rgba(100, 183, 17, 0.4)"];
        case "Spell":
            //blue
            return ["rgb(0, 136, 255)", "rgba(0, 136, 255, 0.4)"];
        case "Curse":
            //orange
            return ["#FFAE19", "rgba(255, 132, 0, 0.4)"];
        case "Unforgivable Curse":
            //red
            return ["rgb(184, 12, 12)", "rgba(184, 12, 12, 0.4)"];
    }
}

function highlight_path(){
    var id = this.id;
    // console.log("highlight_path: " + this.id);
}