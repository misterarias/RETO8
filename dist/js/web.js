var years = [1990, 2000, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015];
var getTopNForGroup = function (n, group) {
    return {
        all: function () {
            return group.top(n);
        }
    };
};

var formatter = function (data) {
    row = {
        code: data["Country Code"], name: data["Country Name"],
        wiki_link: "https://en.wikipedia.org/wiki/" + data["Country Name"]
    };

    for (var y in years) {
        var year = years[y];
        row["pop_" + year] = parseInt(data[year + " [YR" + year + "]"]);
    }

    row.total_evolution = row.pop_2015 - row.pop_1990;
    row.last_decade_evolution = row.pop_2015 - row.pop_2006;
    row.first_decade_evolution = row.pop_2000 - row.pop_1990;
    return row;
};
var parser = function (error, countries) {

    var ndx = crossfilter(countries),
        evoDimension = ndx.dimension(function (d) {
            return d.name;
        }),
        lastDecadeTopGroup = evoDimension.group().reduceSum(function (d) {
            return d.last_decade_evolution;
        }), lastDecadeLastGroup = evoDimension.group().reduceSum(function (d) {
            return -d.last_decade_evolution;
        }), totalTopGroup = evoDimension.group().reduceSum(function (d) {
            return d.total_evolution;
        }), totalLastGroup = evoDimension.group().reduceSum(function (d) {
            return -d.total_evolution;
        });

    drawBarChart("#last_decade_evolution_top", evoDimension, lastDecadeTopGroup);
    drawBarChart("#last_decade_evolution_last", evoDimension, lastDecadeLastGroup);

    drawBarChart("#total_evolution_top", evoDimension, totalTopGroup);
    drawBarChart("#total_evolution_last", evoDimension, totalLastGroup);

    dc.redrawAll();
};

var drawBarChart = function (id, dimension, group) {

    var width = 400,
        height = 250,
        barNumber = 6,
        margin = {top: 10, right: 5, bottom: 30, left: 100};

    var chart = dc.barChart(id)
        .margins(margin)
        .width(width)
        .height(height)
        .dimension(dimension)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .group(getTopNForGroup(barNumber, group))
        ;

    chart.render();
    return chart;
};

d3.csv("data/countries_pop.csv", formatter, parser);
