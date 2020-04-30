var charts = [];
var rolling_days = 7;

var state_date = [];
var positives = [];
var positivesIncrease = [];
var positivesIncreasePercent = [];
var hospitalized = [];
var deaths = [];
var deathsIncrease = [];
var tests = [];
var positivesRatio = [];

var population_usa;
var population = {};

var states = {
    'AL': 'Alabama',
    'AK': 'Alaska',
    'AZ': 'Arizona',
    'AR': 'Arkansas',
    'CA': 'California',
    'CO': 'Colorado',
    'CT': 'Connecticut',
    'DE': 'Delaware',
    'DC': 'District of Columbia',
    'FL': 'Florida',
    'GA': 'Georgia',
    'HI': 'Hawaii',
    'ID': 'Idaho',
    'IL': 'Illinois',
    'IN': 'Indiana',
    'IA': 'Iowa',
    'KS': 'Kansas',
    'KY': 'Kentucky',
    'LA': 'Louisiana',
    'ME': 'Maine',
    'MD': 'Maryland',
    'MA': 'Massachusetts',
    'MI': 'Michigan',
    'MN': 'Minnesota',
    'MS': 'Mississippi',
    'MO': 'Missouri',
    'MT': 'Montana',
    'NE': 'Nebraska',
    'NV': 'Nevada',
    'NH': 'New Hampshire',
    'NJ': 'New Jersey',
    'NM': 'New Mexico',
    'NY': 'New York',
    'NC': 'North Carolina',
    'ND': 'North Dakota',
    'OH': 'Ohio',
    'OK': 'Oklahoma',
    'OR': 'Oregon',
    'PA': 'Pennsylvania',
    'RI': 'Rhode Island',
    'SC': 'South Carolina',
    'SD': 'South Dakota',
    'TN': 'Tennessee',
    'TX': 'Texas',
    'UT': 'Utah',
    'VT': 'Vermont',
    'VA': 'Virginia',
    'WA': 'Washington',
    'WV': 'West Virginia',
    'WI': 'Wisconsin',
    'WY': 'Wyoming'
};

function main() {

    // Retrieve set states
    var state_1 = getCookie("state_1");
    if (state_1.length === 2) {
        $("#state_1").val(state_1);
    } else {
        $("#state_1").val("NY");
    }

    var state_2 = getCookie("state_2");
    if (state_2.length === 2) {
        $("#state_2").val(state_2);
    } else {
        $("#state_2").val("VA");
    }

    // Get USA population
    $.getJSON("https://datausa.io/api/data?drilldowns=Nation&measures=Population&year=latest", function (data) {

        population_usa = data.data[0].Population / 1e6;

        state_date.s0 = [];

        positives.x0 = [];
        positives.y0 = [];

        positivesIncrease.x0 = [];
        positivesIncrease.y0 = [];

        positivesIncreasePercent.x0 = [];
        positivesIncreasePercent.y0 = [];

        hospitalized.x0 = [];
        hospitalized.y0 = [];

        deaths.x0 = [];
        deaths.y0 = [];

        deathsIncrease.x0 = [];
        deathsIncrease.y0 = [];

        tests.x0 = [];
        tests.y0 = [];

        positivesRatio.x0 = [];
        positivesRatio.y0 = [];

        // Get USA Covid Data
        $.getJSON( "https://covidtracking.com/api/us/daily.json", function( data ) {

            for (var i = 0; i < data.length; i++) {

                var date_str =  data[data.length - i - 1].date.toString();
                var date = parseDate2(date_str);

                var positive = data[data.length - i - 1].positive;
                var positiveIncrease = data[data.length - i - 1].positiveIncrease;
                var positiveIncreasePercent = 0;
                if (positives.x0.length > 0) {
                    var positivePrevious = data[data.length - i].positive;
                    positiveIncreasePercent = positiveIncrease / positivePrevious;
                }
                if (positive > 0) {
                    positives.x0.push(date);
                    positives.y0.push(Math.round(positive / population_usa * 10) / 10);

                    positivesIncrease.x0.push(date);
                    positivesIncrease.y0.push(Math.round(positiveIncrease / population_usa * 10) / 10);

                    positivesIncreasePercent.x0.push(date);
                    positivesIncreasePercent.y0.push(Math.round(positiveIncreasePercent * 1000) / 10);
                }

                var hospital = data[data.length - i - 1].hospitalized;
                if (hospital > 0) {
                    hospitalized.x0.push(date);
                    hospitalized.y0.push(Math.round(hospital / population_usa * 10) / 10);
                }

                var death = data[data.length - i - 1].death;
                var deathIncrease = Math.max(0, data[data.length - i - 1].deathIncrease);
                if (death > 0) {
                    deaths.x0.push(date);
                    deaths.y0.push(Math.round(death / population_usa * 10) / 10);

                    deathsIncrease.x0.push(date);
                    deathsIncrease.y0.push(Math.round(deathIncrease / population_usa * 10) / 10);
                }

                var test = data[data.length - i - 1].totalTestResults;
                if (test > 0) {
                    tests.x0.push(date);
                    tests.y0.push(Math.round(test / population_usa * 10) / 10);
                }

                if (test > 0) {
                    positivesRatio.x0.push(date);
                    positivesRatio.y0.push(Math.round(positive / test * 1000) / 10);
                }
            } // for (var i = 0; i < data.length; i++) {

            positivesIncrease.y0r = calculateRollingAverage(positivesIncrease.y0, rolling_days);
            positivesIncreasePercent.y0r = calculateRollingAverage(positivesIncreasePercent.y0, rolling_days);
            deathsIncrease.y0r = calculateRollingAverage(deathsIncrease.y0, rolling_days);

            state_date.s0 = parseDate(data[0].date);

            // Get selected states Covid Data
            $.getJSON("https://datausa.io/api/data?drilldowns=State&measures=Population&year=latest", function (data) {
                population = data.data;
                getStates();
            });
        });
    });

}

function getStates() {
    for (var i = 0; i < charts.length; i++) {
        charts[i].destroy();
    }

    var state_1 = document.getElementById("state_1").value;
    var state_2 = document.getElementById("state_2").value;

    setCookie("state_1",state_1);
    setCookie("state_2",state_2);

    getData(state_1, state_2);
}

function getData(state_1, state_2) {

    state_date.s1 = [];
    state_date.s2 = [];

    positives.x1 = [];
    positives.x2 = [];
    positives.y1 = [];
    positives.y2 = [];

    positivesIncrease.x1 = [];
    positivesIncrease.x2 = [];
    positivesIncrease.y1 = [];
    positivesIncrease.y2 = [];

    positivesIncreasePercent.x1 = [];
    positivesIncreasePercent.x2 = [];
    positivesIncreasePercent.y1 = [];
    positivesIncreasePercent.y2 = [];

    hospitalized.x1 = [];
    hospitalized.x2 = [];
    hospitalized.y1 = [];
    hospitalized.y2 = [];

    deaths.x1 = [];
    deaths.x2 = [];
    deaths.y1 = [];
    deaths.y2 = [];

    deathsIncrease.x1 = [];
    deathsIncrease.x2 = [];
    deathsIncrease.y1 = [];
    deathsIncrease.y2 = [];

    tests.x1 = [];
    tests.x2 = [];
    tests.y1 = [];
    tests.y2 = [];

    positivesRatio.x1 = [];
    positivesRatio.x2 = [];
    positivesRatio.y1 = [];
    positivesRatio.y2 = [];

    $.getJSON( "https://covidtracking.com/api/states/daily?state=" + state_1, function( data ) {

        var state_pop = getPopulation(state_1);

        for (var i = 0; i < data.length; i++) {

            var date_str =  data[data.length - i - 1].date.toString();
            var date = parseDate2(date_str);

            var positive = data[data.length - i - 1].positive;
            var positiveIncrease = Math.max(0, data[data.length - i - 1].positiveIncrease);
            var positiveIncreasePercent = 0;
            if (positives.x1.length > 0) {
                var positivePrevious = data[data.length - i].positive;
                positiveIncreasePercent = positiveIncrease / positivePrevious;
            }
            if (positive > 0) {
                positives.x1.push(date);
                positives.y1.push(Math.round(positive / state_pop * 10) / 10);

                positivesIncrease.x1.push(date);
                positivesIncrease.y1.push(Math.round(positiveIncrease / state_pop * 10) / 10);

                positivesIncreasePercent.x1.push(date);
                positivesIncreasePercent.y1.push(Math.round(positiveIncreasePercent * 1000) / 10);
            }

            var hospital = data[data.length - i - 1].hospitalized;
            if (hospital > 0) {
                hospitalized.x1.push(date);
                hospitalized.y1.push(Math.round(hospital / state_pop * 10) / 10);
            }

            var death = data[data.length - i - 1].death;
            var deathIncrease = data[data.length - i - 1].deathIncrease;
            if (death > 0) {
                deaths.x1.push(date);
                deaths.y1.push(Math.round(death / state_pop * 10) / 10);

                deathsIncrease.x1.push(date);
                deathsIncrease.y1.push(Math.round(deathIncrease / state_pop * 10) / 10);
            }

            var test = data[data.length - i - 1].totalTestResults;
            if (test > 0) {
                tests.x1.push(date);
                tests.y1.push(Math.round(test / state_pop * 10) / 10);
            }

            if (test > 0) {
                positivesRatio.x1.push(date);
                positivesRatio.y1.push(Math.round(positive / test * 1000) / 10);
            }
        }

        positivesIncrease.y1r = calculateRollingAverage(positivesIncrease.y1, rolling_days);
        positivesIncreasePercent.y1r = calculateRollingAverage(positivesIncreasePercent.y1, rolling_days);
        deathsIncrease.y1r = calculateRollingAverage(deathsIncrease.y1, rolling_days);

        state_date.s1 = parseDate(data[0].date);

        check_ready(state_1, state_2);
    });

    $.getJSON( "https://covidtracking.com/api/states/daily?state=" + state_2, function( data ) {

        var state_pop = getPopulation(state_2);

        for (var i = 0; i < data.length; i++) {

            var date_str =  data[data.length - i - 1].date.toString();
            var date = parseDate2(date_str);

            var positive = data[data.length - i - 1].positive;
            var positiveIncrease = data[data.length - i - 1].positiveIncrease;
            var positiveIncreasePercent = 0;
            if (positives.x2.length > 0) {
                var positivePrevious = data[data.length - i].positive;
                positiveIncreasePercent = positiveIncrease / positivePrevious;
            }
            if (positive > 0) {
                positives.x2.push(date);
                positives.y2.push(Math.round(positive / state_pop * 10) / 10);

                positivesIncrease.x2.push(date);
                positivesIncrease.y2.push(Math.round(positiveIncrease / state_pop * 10) / 10);

                positivesIncreasePercent.x2.push(date);
                positivesIncreasePercent.y2.push(Math.round(positiveIncreasePercent * 1000) / 10);
            }

            var hospital = data[data.length - i - 1].hospitalized;
            if (hospital > 0) {
                hospitalized.x2.push(date);
                hospitalized.y2.push(Math.round(hospital / state_pop * 10) / 10);
            }

            var death = data[data.length - i - 1].death;
            var deathIncrease = Math.max(0, data[data.length - i - 1].deathIncrease);
            if (death > 0) {
                deaths.x2.push(date);
                deaths.y2.push(Math.round(death / state_pop * 10) / 10);

                deathsIncrease.x2.push(date);
                deathsIncrease.y2.push(Math.round(deathIncrease / state_pop * 10) / 10);
            }

            var test = data[data.length - i - 1].totalTestResults;
            if (test > 0) {
                tests.x2.push(date);
                tests.y2.push(Math.round(test / state_pop * 10) / 10);
            }

            if (test > 0) {
                positivesRatio.x2.push(date);
                positivesRatio.y2.push(Math.round(positive / test * 1000) / 10);
            }
        }

        positivesIncrease.y2r = calculateRollingAverage(positivesIncrease.y2, rolling_days);
        positivesIncreasePercent.y2r = calculateRollingAverage(positivesIncreasePercent.y2, rolling_days);
        deathsIncrease.y2r = calculateRollingAverage(deathsIncrease.y2, rolling_days);

        state_date.s2 = parseDate(data[0].date);

        check_ready(state_1, state_2);
    });

}

function check_ready(state_1, state_2) {

    if (positives.y1.length > 0 && positives.y2.length > 0) {
        plot('positivesChart', positives.x0, positives.y0, null, positives.x1, positives.y1, null, positives.x2, positives.y2, null, state_1, state_2, 'Covid-19 cases per 1M', 'Date', 'Cases per 1M', undefined);
    }

    if (positivesIncrease.y1.length > 0 && positivesIncrease.y2.length > 0) {
        plot('positivesIncreaseChart', positivesIncrease.x0, positivesIncrease.y0r, positivesIncrease.y0, positivesIncrease.x1, positivesIncrease.y1r, positivesIncrease.y1, positivesIncrease.x2, positivesIncrease.y2r, positivesIncrease.y2, state_1, state_2, 'New Covid-19 cases per 1M', 'Date', 'New cases per 1M', undefined);
    }

    if (positivesIncreasePercent.y1.length > 0 && positivesIncreasePercent.y2.length > 0) {
        plot('positivesIncreasePercentChart', positivesIncreasePercent.x0, positivesIncreasePercent.y0r, positivesIncreasePercent.y0, positivesIncreasePercent.x1, positivesIncreasePercent.y1r, positivesIncreasePercent.y1, positivesIncreasePercent.x2, positivesIncreasePercent.y2r, positivesIncreasePercent.y2, state_1, state_2, 'Increase in Covid-19 cases (%)', 'Date', 'Percent increase in Covid-19 cases', 50);
    }

    if (hospitalized.y1.length > 0 && hospitalized.y2.length > 0) {
        plot('hospitalizedChart', hospitalized.x0, hospitalized.y0, null, hospitalized.x1, hospitalized.y1, null, hospitalized.x2, hospitalized.y2, null, state_1, state_2, 'Covid-19 hospitalizations per 1M', 'Date', 'Hospitalizations per 1M', undefined);
    }

    if (deaths.y1.length > 0 && deaths.y2.length > 0) {
        plot('deathsChart', deaths.x0, deaths.y0, null, deaths.x1, deaths.y1, null, deaths.x2, deaths.y2, null, state_1, state_2, 'Covid-19 deaths per 1M', 'Date', 'Deaths per 1M', undefined);
    }

    if (deathsIncrease.y1.length > 0 && deathsIncrease.y2.length > 0) {
        plot('deathsIncreaseChart', deathsIncrease.x0, deathsIncrease.y0r, deathsIncrease.y0, deathsIncrease.x1, deathsIncrease.y1r, deathsIncrease.y1, deathsIncrease.x2, deathsIncrease.y2r, deathsIncrease.y2, state_1, state_2, 'New Covid-19 deaths per 1M', 'Date', 'New death per 1M', undefined);
    }

    if (tests.y1.length > 0 && tests.y2.length > 0) {
        plot('testsChart', tests.x0, tests.y0, null, tests.x1, tests.y1, null, tests.x2, tests.y2, null, state_1, state_2, 'Covid-19 tests per 1M', 'Date', 'Tests per 1M', undefined);
    }

    if (positivesRatio.y1.length > 0 && positivesRatio.y2.length > 0) {
        plot('positivesRatioChart', positivesRatio.x0, positivesRatio.y0, null, positivesRatio.x1, positivesRatio.y1, null, positivesRatio.x2, positivesRatio.y2, null, state_1, state_2, 'Percent positive Covid-19 tests', 'Date', 'Positive tests (%)', undefined);
    }

    // Display when data last updated
    $('#lastUpdateSpan0').html('USA: ' + state_date.s0);
    $('#lastUpdateSpan1').html(state_1 + ': ' + state_date.s1);
    $('#lastUpdateSpan2').html(state_2 + ': ' + state_date.s2);

}

function plot(chart_id, x0, y0, y0r, x1, y1, y1r, x2, y2, y2r, state_1, state_2, title, xtitle, ytitle, yMax) {

    var data_0  = formatPlotData(x0, y0);
    var data_0r = formatPlotData(x0, y0r);

    var data_1  = formatPlotData(x1, y1);
    var data_1r = formatPlotData(x1, y1r);

    var data_2  = formatPlotData(x2, y2);
    var data_2r = formatPlotData(x2, y2r);

    var ctx = document.getElementById(chart_id).getContext('2d');
    charts.push(new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: state_1,
                data: data_1,
                borderColor: 'blue',
                fill: false,
                pointRadius: 0
            },{
                label: state_2,
                data: data_2,
                borderColor: 'orange',
                fill: false,
                pointRadius: 0
            }, {
                label: 'USA',
                data: data_0,
                borderColor: 'black',
                fill: false,
                pointRadius: 0
            },{
                label: null,
                data: data_1r,
                borderColor: 'rgba(0,0,255,0.25)',
                borderWidth: 1,
                fill: false,
                pointRadius: 0
            },{
                label: null,
                data: data_2r,
                borderColor: 'rgba(255,165,0,0.5)',
                borderWidth: 1,
                fill: false,
                pointRadius: 0
            },{
                label: null,
                data: data_0r,
                borderColor: 'rgba(0,0,0,0.25)',
                borderWidth: 1,
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            elements: {
                line: {
                    tension: 0
                }
            },
            responsive: true,
            title: {
                display: true,
                text: title,
                fontSize: 24
            },
            tooltips: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: xtitle,
                        fontSize: 18
                    },
                    time: {
                        min: Math.min(x1[0],x2[0])
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: ytitle,
                        fontSize: 18
                    },
                    ticks: {
                        max: yMax
                    }
                }]
            },
            legend: {
                display: true,
                labels: {
                    filter: function(legendItem, data) {
                        return legendItem.text != null
                    }
                }
            }
        }
    }));

}

function getPopulation(stateID) {
    for (var i = 0; i < population.length; i++) {
        if (population[i].State === states[stateID]) {
            return population[i].Population / 1e6;
        }
    }
}

function parseDate(date_num) {
    date_str = date_num.toString();
    year_str = date_str.substr(0, 4);
    month_str = date_str.substr(4, 2);
    day_str = date_str.substr(6, 2);
    return month_str + '/' + day_str + '/' + year_str;
}

function parseDate2(date_str) {
    return new Date(parseInt(date_str.slice(0,4)), parseInt(date_str.slice(4,6))-1, parseInt(date_str.slice(6,8)));
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function calculateRollingAverage(data, length) {
    rolling_data_average = [];
    for (var i = 0; i < data.length; i++) {
        var rolling_data = data.slice(Math.max(0,i-length+1),i+1);
        var rolling_average = rolling_data.reduce((a,b) => a + b, 0) / rolling_data.length;
        rolling_average = Math.round(rolling_average * 10) / 10;
        rolling_data_average.push(rolling_average);
    }
    return rolling_data_average;
}

function formatPlotData(x,y) {
    var data;
    if (y === null) {
        data = null;
    } else {
        data = [];
        for (var i = 0; i < x.length; i++) {
            var point = {};
            point.x = x[i];
            point.y = y[i];
            data.push(point);
        }
    }
    return data;
}