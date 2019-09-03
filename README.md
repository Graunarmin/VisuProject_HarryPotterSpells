# The Spells of the Wizarding World

## Find the Visualization [**Here**](https://webuser.uni-weimar.de/~hete0356/Visu_Project/spellvisu.html)

***
## Content

1. [First Steps](#first-steps)
2. [Layout](#layout-of-the-visualization)
3. [Interactions](#interactions)

***
## First Steps

### Idea 
##### Using the spells of the Harry Potter Books 
A Visu on when each spell got introduced for the first time, how often they were used in which year, and additional information on what they do and how dangerous they are
- Goal: Find out whether there are more and more advanced and/or dangerous spells used when the characters get older and the story gets darker (e.g. Voldemort's return)


### Dataset
There was no useful dataset, so we created one ourselves:
- collected all the Harry Potter Books as txt files and got a list of all the spells from [here](https://www.pojo.com/harry-potter-spell-list/), which we sortet by hand (we eliminated spells with unknown incantation and all those that do not appear in the books -> knowledge)
- then we used python to 
  - search all the books for all the spells 
  - create a [Dataset](https://github.com/Graunarmin/VisuProject_HarryPotterSpells/blob/master/Spells/Data/used/spells.csv) with the spells as keys, and information on 
    - how often each spell appears in each book
    - what it does (Effect)
    - how dangerous it is (Harmless, Harful, Severe, Lethal)
    - it's type (Charm, Spell, Curse, Unforgivable Curse)
    - it's category (Fight, Tools, Healing, Mind[e.g. Legilimens, Obliviate], Protection, Counter)
    - a link to [Pottermore](https://www.pottermore.com/) or the [Harry Potter Wiki](https://harrypotter.fandom.com/wiki/Main_Page) for further reference.
  - create the [spellvisu.html](https://github.com/Graunarmin/VisuProject_HarryPotterSpells/blob/master/Visu/spellvisu.html) 
- after that we started creating a visualization based on this html file in javascript, using [D3](https://d3js.org/)


[comment]: <> (--------------------------------------------------------)


## Layout of the Visualization

After several experiments with other forms, we decided on using an [arc diagram](https://github.com/Graunarmin/VisuProject_HarryPotterSpells/wiki/Arc-Diagram), because it can depict
- the temporal development of the use of all spells
- the number of uses by the size of the nodes
- which spells are common and which are not
- links between the same spell used in different books

![[Picture of Visualization]](https://github.com/Graunarmin/VisuProject_HarryPotterSpells/blob/master/Presentation/Screenshots/Visu_Default.png)

### List
- Contains all the spells from the books, sorted alphabetically
- The headline shows, on which filter level you are at the moment (which book and/or type is selected or if you are at the default list with "All Spells")
- Reveals further details on each spell (on selecting a spell)

### Timeline
- Goes from the first to the seventh book 
- Shows all used spells per book
- Each spell is represented as a node/circle
- The size of each circle indicates how often the spell is used in that book
- The color of each circle represents the spell type
  - Green  = Charm
  - Blue   = Spell
  - Orange = Curse
  - Red    = Unforgivable Curse
- If a spell occurs in more than one book, there are connections between all the occurances

### Legend
- Shows the four different types of spells: Charms, Spells, Curses and Unforgivable Curses
- Here you can filter for a spell-type

### Books
- Show all 7 Books (1 = Philosopher's Stone, 2 = Chamber of Secrets, 3 = Prizoner of Azkaban, 4 = Goblet of Fire, 5 = Order of the Phoenix, 6 = Half-Blood Prince, 7 = Deathly Hallows)
- Not aligned with the timeline of spells
  - too cramped and confusing, as the first books contain too few and the last ones too many spells to find a good scale
  - would interfere with the interactions

## Interactions

The basic interactions all work the same:
- You can hover above an element and get further information through a tooltip
- You can click on an element to select and highlight it 
- You can click on the same element again to deselect it or click on an other element to further filter the visualization
- Clicking on one element always has an effect on the other components, they adapt to show more specific information

### List

**Hovering over an entry:**
- Spell name gets highlighted in color of corresponding spell type

**Clicking on an entry:**
- **List:** Info-box of the spell opens, all other entries disappear 
- **Timeline:** every appearance of the spell (the circles) and the paths are highlighted in the colour their spell type
- **Legend:** corresponding spell type is highlighted, others are greyed out
- **Books:** the books in which the spell appears are highlighted, the others are greyed out		
- **Deselect:** to deselect click on selected spell, either in list (entry) or diagram (circle)

### Timeline

**Hovering over a circle:**
- **Tooltip** with name of the spell and how often it appears in this book
- The paths that connect this circle with the corresponding circles get highlighted in the color of the spell type
  - To give a first idea of how often the spell appeared throughout the series
  
**Clicking on a circle:**
- The paths that connect this circle with the corresponding circles and the circles themselves get highlighted in the color of the spell type
- **Timeline:** All other circles and paths get greyed out
- **Legend:** corresponding spell type is highlighted, others are greyed out
- **List:** info-box of the spell opens, all other entries disappear
- **Books:** the books in which the spell appears are highlighted, the others are greyed out 
- **Deselect:** to deselect click on selected spell, either in list (entry) or diagram (circle)


### Legend

**Hovering over a rectangle:**
- **Tooltip:** with information about specific spell type
- The rectangle gets bigger 

**Clicking on a rectangle:**
- **Legend:** Clicked rectangle stays bigger (highlighted), others get greyed out
- **Timeline:** only circles with same spell type and their paths stay coloured 
- **List:** only entries with same spell type remain in list, headline adapts
- **Books:** stay the same, further filtering possible 
- **Deselect:** to deselect click on selected rectangle again 	

### Books

**Hovering over a book:**
- **Tooltip:** with name of the book and amount of different spells 

**Clicking on a book:**
- **Books:** Book gets highlighted, others get greyed out
- **Timeline:** only the circles of the spells that appear in this book stay coloured, others get greyed out (there are no paths, since they are over different books), circles can still get selected
- **List:** only entries of spells that appear in this book remain in list, headline adapts, entries can still get selected 
- **Legend:** stays the same, further filtering possible 
- **Deselect:** to deselect click on selected book again

There are also more complex interactions where a filter can be applied over a current filter 	


### Combinations 

**Clicked legend:**
  - select spell of selected spell type
  - select book to further filter
    - select spell of selected spell type and book
   
   
**Clicked book:**
  - select spell of selected book
  - select spell type in legend to further filter
    - select spell of selected book and spell type
