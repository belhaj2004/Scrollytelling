
/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scrollVis = function () {
  // constants to define the size
  // and margins of the vis area.
  var width = 600;
  var height = 520;
  var margin = { top: 10, left: 20, bottom: 40, right: 10 };

  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;

  // Sizing for the grid visualization
  var squareSize = 6;
  var squarePad = 2;
  var numPerRow = width / (squareSize + squarePad);

  // main svg used for visualization
  var svg = null;

  // d3 selection that will be used
  // for displaying visualizations
  var g = null;

  // We will set the domain when the
  // data is processed.
  // @v4 using new scale names
  // The bar chart display is both 
  // horizontal and vertical
  // @v4 using new scale type

/**
  axis list for first bar chart
  */

  var xBarScale = d3.scaleLinear()
  .range([0, width-100]);
  var yBarScale = d3.scaleBand()
    .paddingInner(0.06)
    .range([0, height]);
  var xAxisBar = d3.axisBottom()
    .scale(xBarScale);
  var yAxisBar = d3.axisLeft()
    .scale(yBarScale);

/**
  axis list for second bar chart
  */

  var yBarScaleSecond = d3.scaleLinear()
  .range([0, height]);
  var xBarScaleSecond = d3.scaleBand()
  .paddingInner(0.06)
  .range([0, width-100]);
  var xAxisNewBar = d3.axisBottom()
  .scale(xBarScaleSecond);
  var yAxisNewBar = d3.axisLeft()
  .scale(yBarScaleSecond);


/**
  axis list for third bar chart
  */

  
  var yBarScaleThird = d3.scaleLinear()
  .range([0, height]);
  var xBarScaleThird = d3.scaleBand()
  .paddingInner(0.06)
  .range([0, width-100]);
  var xAxisNewBarThird = d3.axisBottom()
  .scale(xBarScaleThird);
  var yAxisNewBarThird = d3.axisLeft()
  .scale(yBarScaleThird);



/**
  axis list for fourth bar chart
  */

  var yBarScaleFourth = d3.scaleLinear()
  .range([0, height]);
  var xBarScaleFourth = d3.scaleBand()
  .paddingInner(0.06)
  .range([0, width-55]);
  var xAxisNewBarFourth = d3.axisBottom()
  .scale(xBarScaleFourth);
  var yAxisNewBarFourth = d3.axisLeft()
  .scale(yBarScaleFourth);


  // Color is determined just by the index of the bars
  var barColors = { 0: '#FFA5A0', 1: '#964B00', 2: '#808080', 3: '#0000FF', 4: '#FFA500', 5: '#FF0000', 6: '#87CEEB', 7: '#00FF00', 8: '#FFFF00', 9: '#7F00FF', 10:'#92cad1', 11:'#a73c5a' };


  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
  var updateFunctions = [];

  /**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
  var chart = function (selection) {
    selection.each(function (rawData) {
      // create svg and give it a width and height
      svg = d3.select(this).selectAll('svg').data([planeData]);
      var svgE = svg.enter().append('svg');
      // @v4 use merge to combine enter and existing selection
      svg = svg.merge(svgE);

      svg.attr('width', width + margin.left + margin.right);
      svg.attr('height', height + margin.top + margin.bottom);

      svg.append('g');


      // this group element will be used to contain all
      // other elements.
      g = svg.select('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // perform some preprocessing on raw data
      var planeData = getAccidents(rawData);
      console.log("accidents= ", planeData);
      // filter to just include plane accidents
      var injuries =  getPlaneAccident(planeData);
      console.log("injuries= ",injuries);
      // get the counts of countries for the
      // bar chart display
      var countryCounts = groupByCountries(injuries);
      console.log("countryCounts= ",countryCounts);

      var makerList = groupByMaker(injuries);
      console.log("makers: ", makerList);

      var phaseList=groupByPhase(injuries);
      console.log("Phase: ", phaseList);


      var CarrierCounts = [{ key: 'Delta', value: 86 },
      { key: 'American', value: 80 },{ key: 'United', value: 54 },
      { key: 'Southwest', value: 41 },{ key: 'Continental', value: 36 },
      { key: 'US Airways', value: 28 },{ key: 'Northwest', value: 24 },
      { key: 'FedEx', value: 21 },{ key: 'America West', value: 16 },
      { key: 'Alaska', value: 15 }
    ];

    console.log("Carrier= ",CarrierCounts);
      // set the bar scale's domain
      var countMax = d3.max(countryCounts, function (d) { return d.value;});
      xBarScale.domain([0, countMax+100]);
      yBarScale.domain(countryCounts.slice(0, 10).map(function(d) { return d.key; }))


      xBarScaleSecond.domain(CarrierCounts.map(function(d) { return d.key; }))
      yBarScaleSecond.domain([100,0])


      xBarScaleThird.domain(makerList.map(function(d) { return d.key; }))
      yBarScaleThird.domain([1300,0])

      
      xBarScaleFourth.domain(phaseList.map(function(d) { return d.key; }))
      yBarScaleFourth.domain([210,0])


      setupVis(planeData, countryCounts, CarrierCounts, makerList, phaseList);

      setupSections();
    });
  };


  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   * @param planeData - data object for each accident.
   * @param countryCounts - nested data that includes
   *  element for each accident type.
   */
  var setupVis = function (planeData, countryCounts, CarrierCounts, makerList, phaseList) {
    // axis
    g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(' + 60 + ',' + height + ')')
      .call(xAxisBar);
    g.select('.x.axis').style('opacity', 0);

    g.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(' + (width-540) + ', 0)') 
    .call(yAxisBar);
  g.select('.y.axis').style('opacity', 0);


  g.append('g')
  .attr('class', 'xx axis')
  .attr('transform', 'translate(' + 60 + ',' + height + ')')
  .call(xAxisNewBar);
g.select('.xx.axis').style('opacity', 0);

g.append('g')
.attr('class', 'yy axis')
.attr('transform', 'translate(' + (width-540) + ', 0)') 
.call(yAxisNewBar);
g.select('.yy.axis').style('opacity', 0);



g.append('g')
.attr('class', 'xxx axis')
.attr('transform', 'translate(' + 60 + ',' + height + ')')
.call(xAxisNewBarThird);
g.select('.xxx.axis').style('opacity', 0);

g.append('g')
.attr('class', 'yyy axis')
.attr('transform', 'translate(' + (width-540) + ', 0)') 
.call(yAxisNewBarThird);
g.select('.yyy.axis').style('opacity', 0);


g.append('g')
.attr('class', 'xxxx axis')
.attr('transform', 'translate(' + 60 + ',' + height + ')')
.call(xAxisNewBarFourth);
g.select('.xxxx.axis').style('opacity', 0);
g.select('.xxxx.axis').style('font', '7px times');

g.append('g')
.attr('class', 'yyyy axis')
.attr('transform', 'translate(' + (width-540) + ', 0)') 
.call(yAxisNewBarFourth);
g.select('.yyyy.axis').style('opacity', 0);



    // count openvis title
    g.append('text')
      .attr('class', 'title openvis-title')
      .attr('x', width / 2)
      .attr('y', height / 3)
      .text('');

    g.append('text')
      .attr('class', 'sub-title openvis-title')
      .attr('x', width / 2)
      .attr('y', (height / 3) + (height / 5))
      .text('');

    g.selectAll('.openvis-title')
      .attr('opacity', 0);

    // count plane count title
    g.append('text')
      .attr('class', 'title count-title highlight')
      .attr('x', width / 2)
      .attr('y', height / 3)
      .text('180');

    g.append('text')
      .attr('class', 'sub-title count-title')
      .attr('x', width / 2)
      .attr('y', (height / 3) + (height / 5))
      .text('');

    g.selectAll('.count-title')
      .attr('opacity', 0);

    //end of dot chart
        // count accidents
        g.append('text')
        .attr('class', 'title dotone')
        .attr('x', width / 2)
        .attr('y', height / 3)
        .text('');
  
      g.append('text')
        .attr('class', 'sub-title dotone')
        .attr('x', width / 2)
        .attr('y', (height / 3) + (height / 5))
        .text('');
  
      g.selectAll('.dot-title')
        .attr('opacity', 0);

    // dot grid
    // @v4 Using .merge here to ensure
    // new and old data have same attrs applied


      var circles = g.selectAll('.circle').data(planeData, function (d) { return d.Accident_Number; });
      var circlesE = circles.enter()
        .append('circle')
        .classed('circle', true);
      circles = circles.merge(circlesE)
        .attr('r', 3) // Set the radius as needed
        .attr('fill', '#fff')
        .classed('fill-circle', function (d) { return d.Total_Fatal_Injuries; })
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; })
        .attr('opacity', 0);

        console.log("Total number of circles:", circles.size());
      

    // barchart
    // @v4 Using .merge here to ensure
    // new and old data have same attrs applied
    var bars = g.selectAll('.bar').data(countryCounts.slice(0, 10));
    var barsE = bars.enter()
      .append('rect')
      .attr('class', 'bar');
    bars = bars.merge(barsE)
      .attr('x', 61)
      .attr('y', function (d, i) { return yBarScale(d.key);})
      .attr('fill', function (d, i) { return barColors[i]; })
      .attr('width', 0)
      .attr('height', yBarScale.bandwidth());



      var newbars = g.selectAll('.newbar').data(CarrierCounts);
      var newbarsE = newbars.enter()
        .append('rect')
        .attr('class', 'newbar');
      newbars = newbars.merge(newbarsE)
        .attr('x', function (d, i) { return xBarScaleSecond(d.key)+61;})
        .attr('y', function (d, i) { return yBarScaleSecond(d.value);})
        .attr('fill', function (d, i) { return barColors[i]; })
        .attr('width', xBarScaleSecond.bandwidth())
        .attr('height', 0);



        var newbars3 = g.selectAll('.newbar3').data(makerList);
        var newbarsE3 = newbars3.enter()
          .append('rect')
          .attr('class', 'newbar3');
        newbars3 = newbars3.merge(newbarsE3)
          .attr('x', function (d, i) { return xBarScaleThird(d.key)+61;})
          .attr('y', function (d, i) { return yBarScaleThird(d.value);})
          .attr('fill', function (d, i) { return barColors[i]; })
          .attr('width', xBarScaleThird.bandwidth())
          .attr('height', 0);


          
        var newbars4 = g.selectAll('.newbar4').data(phaseList);
        var newbarsE4 = newbars4.enter()
          .append('rect')
          .attr('class', 'newbar4');
        newbars4 = newbars4.merge(newbarsE4)
          .attr('x', function (d, i) { return xBarScaleFourth(d.key)+61;})
          .attr('y', function (d, i) { return yBarScaleFourth(d.value);})
          .attr('fill', function (d, i) { return barColors[i]; })
          .attr('width', xBarScaleFourth.bandwidth())
          .attr('height', 0);



  };

  /**
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   *
   */
  var setupSections = function () {
    // activateFunctions are called each
    // time the active section changes
    activateFunctions[0] = showTitle;
    activateFunctions[1] = showGrid;
    activateFunctions[2] = highlightGrid;
    activateFunctions[3] = highlightGrid2;
    activateFunctions[4] = highlightGrid3;
    activateFunctions[5] = showBar;
    activateFunctions[6] = showBarSecond;
    activateFunctions[7] = showBarThird;
    activateFunctions[8] = showBarFourth;
    activateFunctions[9] = showBarThird;

    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for (var i = 0; i < 10; i++) {
      updateFunctions[i] = function () {};
    }
  };

  /**
   * ACTIVATE FUNCTIONS
   *
   * These will be called their
   * section is scrolled to.
   *
   * General pattern is to ensure
   * all content for the current section
   * is transitioned in, while hiding
   * the content for the previous section
   * as well as the next section (as the
   * user may be scrolling up or down).
   *
   */

  /**
   * showTitle - initial title
   *
   * hides: count title
   * (no previous step to hide)
   * shows: intro title
   *
   */
  function showTitle() {
    g.selectAll('.openvis-title')
      .transition()
      .duration(600)
      .attr('opacity', 1.0);

      g.selectAll('.circle')
      .transition()
      .duration(0)
      .attr('opacity', 0);



  }


  /**
   * showGrid - dot grid
   * shows: dot grid
   *
   */
  function showGrid() {
    g.selectAll('.count-title')
      .transition()
      .duration(0)
      .attr('opacity', 0);


    g.selectAll('.circle')
      .transition()
      .duration(600)
      .delay(function (d) {
        return 5 * d.row;
      })
      .attr('opacity', 1.0)
      .attr('fill', '#8d8d8d');
  }

  function highlightGrid3() {
    g.selectAll('.count-title')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    g.selectAll('.circle')
      .transition()
      .duration(600)
      .delay(function (d) {
        return 5 * d.row;
      })
      .attr('opacity', 0)
      .attr('fill', '#8d8d8d');


      g.selectAll('.newbar')
      .transition()
      .duration(600)
      .attr('height', 0);

      g.selectAll('.fill-circle')
      .transition()
      .duration(600)
      .delay(function (d) {
        return 5 * d.row;
      })
      .attr('opacity', 0)
      .attr('fill', '#8d8d8d');

      hideAxis();
      hideAgain();
      hideAlso();
      g.selectAll('.bar')
        .transition()
        .duration(600)
        .attr('width', 0);
  
      g.selectAll('.bar-text')
        .transition()
        .duration(0)
        .attr('opacity', 0);
  }

  /**
   * highlightGrid - show incidents in grid
   *
   * hides: barchart, text and axis
   * shows: dot grid and highlighted
   *  incidents.
   */
  function highlightGrid() {
    hideAxis();
    hideAgain();
    hideAlso();
    g.selectAll('.bar')
      .transition()
      .duration(600)
      .attr('width', 0);

    g.selectAll('.bar-text')
      .transition()
      .duration(0)
      .attr('opacity', 0);


    g.selectAll('.circle')
      .transition()
      .duration(0)
      .attr('opacity', 1.0)
      .attr('fill', '#8d8d8d');

    // use named transition to ensure
    // move happens even if other
    // transitions are interrupted.
    g.selectAll('.fill-circle')
      .transition('move-fills')
      .duration(800)
      .attr('cx', function (d) {
        return d.x;
      })
      .attr('cy', function (d) {
        return d.y;
      });

      g.selectAll('.newbar')
      .transition()
      .duration(600)
      .attr('height', 0);

    g.selectAll('.fill-circle')
      .transition()
      .duration(800)
      .attr('opacity', 1.0)
      .attr('fill', function (d) { return (d.Total_Fatal_Injuries !=='0') ? '#FF0000' : '#8d8d8d'; });
  }

  function highlightGrid2() {
    hideAxis();
    hideAgain();
    g.selectAll('.bar')
      .transition()
      .duration(600)
      .attr('width', 0);

    g.selectAll('.bar-text')
      .transition()
      .duration(0)
      .attr('opacity', 0);


      g.selectAll('.newbar')
      .transition()
      .duration(600)
      .attr('height', 0);


    g.selectAll('.circle')
      .transition()
      .duration(0)
      .attr('opacity', 1.0)
      .attr('fill', '#8d8d8d');

    // use named transition to ensure
    // move happens even if other
    // transitions are interrupted.
    g.selectAll('.fill-circle')
      .transition('move-fills')
      .duration(800)
      .attr('cx', function (d) {
        return d.x;
      })
      .attr('cy', function (d) {
        return d.y;
      });

    g.selectAll('.fill-circle')
      .transition()
      .duration(800)
      .attr('opacity', 1.0)
      .attr('fill', function (d) {
        if (d.Total_Fatal_Injuries !== '0') {
            return '#FF0000'; // Red for the first condition
        } else if (d.Injury_Severity == 'Non-Fatal') {
            return '#FFA500'; // Yellow for the second condition
        } else {
            return '#8d8d8d'; // Default color if neither condition is met
        }
    });
  }
  /**
   * showBar - barchart
   *
   * hides: dot grid
   * shows: barchart
   *
   */
  function showBar() {
    // ensure bar axis is set
    showAxis();
    hideAgain();
    hideAlso();
    //showAxis(yAxisBar);

    g.selectAll('.circle')
      .transition()
      .duration(800)
      .attr('opacity', 0);

    // g.selectAll('.fill-square')
    //   .transition()
    //   .duration(800)
    //   .attr('x', 0)
    //   .attr('y', function (d, i) {
    //     return yBarScale(i % 3) + yBarScale.bandwidth() / 2;
    //   })
    //   .transition()
    //   .duration(0)
    //   .attr('opacity', 0);

    g.selectAll('.newbar')
    .transition()
    .duration(600)
    .attr('height', 0);


    g.selectAll('.bar')
      .transition()
      .delay(function (d, i) { return 300 * (i + 1);})
      .duration(600)
      .attr('width', function (d) { return xBarScale(d.value); });

    g.selectAll('.bar-text')
      .transition()
      .duration(600)
      .delay(1200)
      .attr('opacity', 1);
  }

  /**
   * showBarSecond - shows bar chart for carrier
   *
   * hides: first barchart
   *
   */
  function showBarSecond() {
    hideAxis();
    showAgain();
    hideAlso();

    g.selectAll('.bar-text')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    g.selectAll('.bar')
      .transition()
      .duration(600)
      .attr('width', 0);
      

      g.selectAll('.newbar')
      .transition()
      .delay(function (d, i) { return 300 * (i + 1);})
      .duration(600)
      .attr('height', function (d) { return height-yBarScaleSecond(d.value); });





    g.selectAll('.newbar3')
    .transition()
    .duration(600)
    .attr('height', 0);
  }

  /**
   * showBarThird - 
   * shows: veritical bars
   *
   */
  function showBarThird() {

  
    hideAxis();
    hideAgain();

    showAlso();

    g.selectAll('.newbar')
    .transition()
    .duration(600)
    .attr('height', 0);

    g.selectAll('.newbar4')
    .transition()
    .duration(600)
    .attr('height', 0);



      g.selectAll('.newbar3')
      .transition()
      .delay(function (d, i) { return 300 * (i + 1);})
      .duration(600)
      .attr('height', function (d) { return height-yBarScaleThird(d.value); });


      hideLast();
  }

  /**
   * showBarFourth
   *
   * hides: nothing
   *
   */
  function showBarFourth() {
    hideAxis();
    hideAlso();
    hideAgain();
    showLast();

    g.selectAll('.newbar4')
    .transition()
    .delay(function (d, i) { return 300 * (i + 1);})
    .duration(600)
    .attr('height', function (d) { return height-yBarScaleFourth(d.value); });

    
    g.selectAll('.newbar3')
    .transition()
    .duration(600)
    .attr('height', 0);

  }

  /**
   * showAxis - helper function to
   * display particular xAxis
   *
   */
  function showAxis() {
    g.select('.x.axis')
      .transition().duration(500)
      .style('opacity', 1);

      g.select('.y.axis')
      .transition().duration(500)
      .style('opacity', 1);
  }

  function showAgain() {
    g.select('.xx.axis')
      .transition().duration(500)
      .style('opacity', 1);

      g.select('.yy.axis')
      .transition().duration(500)
      .style('opacity', 1);
  }


  function showAlso() {
    g.select('.xxx.axis')
      .transition().duration(500)
      .style('opacity', 1);

      g.select('.yyy.axis')
      .transition().duration(500)
      .style('opacity', 1);
  }


  function showLast() {
    g.select('.xxxx.axis')
      .transition().duration(500)
      .style('opacity', 1);


      g.select('.yyyy.axis')
      .transition().duration(500)
      .style('opacity', 1);
  }
  /**
   * hideAxis - helper function
   * to hide the axis
   *
   */
  function hideAxis() {
    g.select('.x.axis')
      .transition().duration(500)
      .style('opacity', 0);

      g.select('.y.axis')
      .transition().duration(500)
      .style('opacity', 0);
  }


  function hideAgain() {
    g.select('.xx.axis')
      .transition().duration(500)
      .style('opacity', 0);

      g.select('.yy.axis')
      .transition().duration(500)
      .style('opacity', 0);
  }

  function hideAlso() {
    g.select('.xxx.axis')
      .transition().duration(500)
      .style('opacity', 0);

      g.select('.yyy.axis')
      .transition().duration(500)
      .style('opacity', 0);
  }


  function hideLast() {
    g.select('.xxxx.axis')
      .transition().duration(500)
      .style('opacity', 0);

      g.select('.yyyy.axis')
      .transition().duration(500)
      .style('opacity', 0);
  }

  /**
   * DATA FUNCTIONS
   *
   * Used to coerce the data into the
   * formats we need to visualize
   *
   */

  /**
   * getAccidents - maps raw data to
   * array of data objects. There is
   * one data object for each word in the speach
   * data.
   *
   * This function converts some attributes into
   * numbers and adds attributes used in the visualization
   *
   * @param rawData - data read in from file
   */
  function getAccidents(rawData) {
    return rawData.map(function (d, i) {


      // positioning for square visual
      // stored here to make it easier
      // to keep track of.
      d.col = i % numPerRow;
      d.x = d.col * (squareSize + squarePad);
      d.row = Math.floor(i / numPerRow);
      d.y = d.row * (squareSize + squarePad);
      return d;
    });
    
  }
  /**
   *  getPlaneAccident - returns array of
   * only injuries
   *
   * @param data - accident data from getAccidents
   */
  function getPlaneAccident(data) {
    return data.filter(function (d) {return d.Injury_Severity; });
  }

  /**
   * groupByCountries - group countries together
   * using nest. Used to get counts for
   * barcharts.
   *
   * @param words
   */
  function groupByCountries(words) {
    return d3.nest()
      .key(function (d) { return d.Country; })
      .rollup(function (v) { return v.length; })
      .entries(words)
      .sort(function (a, b) {return b.value - a.value;});
  }

  function groupByCarrier(words) {
    return d3.nest()
      .key(function (d) { return d.Air_Carrier; })
      .rollup(function (v) { return v.length; })
      .entries(words)
      .sort(function (a, b) {return b.value - a.value;});
  }


  function groupByMaker(words) {
    return d3.nest()
      .key(function (d) { return d.Make; })
      .rollup(function (v) { return v.length; })
      .entries(words)
      .sort(function (a, b) {return b.value - a.value;});
  }


  function groupByPhase(words) {
    return d3.nest()
      .key(function (d) { return d.Broad_Phase_of_Flight; })
      .rollup(function (v) { return v.length; })
      .entries(words)
      .filter(function (entry) { return entry.key !== ''; })
  }
  
  /**
   * activate -
   *
   * @param index - index of the activated section
   */
  chart.activate = function (index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function (i) {
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  /**
   * update
   *
   * @param index
   * @param progress
   */
  chart.update = function (index, progress) {
    updateFunctions[index](progress);
  };

  // return chart function
  return chart;
};


/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded tsv data
 */
function display(data) {
  // create a new plot and
  // display it
  var plot = scrollVis();
  d3.select('#vis')
    .datum(data)
    .call(plot);

  // setup scroll functionality
  var scroll = scroller()
    .container(d3.select('#graphic'));

  // pass in .step selection as the steps
  scroll(d3.selectAll('.step'));

  // setup event handling
  scroll.on('active', function (index) {
    // highlight current step text
    d3.selectAll('.step')
      .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });

    // activate current section
    plot.activate(index);
  });

  scroll.on('progress', function (index, progress) {
    plot.update(index, progress);
  });
}

// load data and display

d3.csv('data/incidents.csv', display);

// );
