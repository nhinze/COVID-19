var charts = [];

var state_date = [];
var positives = [];
var positivesIncrease = [];
var hospitalized = [];
var deaths = [];
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

    // Get USA population
    $.getJSON("https://datausa.io/api/data?drilldowns=Nation&measures=Population&year=latest", function (data) {

        population_usa = data.data[0].Population / 1e6;

        state_date.s0 = [];

        positives.x0 = [];
        positives.y0 = [];

        positivesIncrease.x0 = [];
        positivesIncrease.y0 = [];

        hospitalized.x0 = [];
        hospitalized.y0 = [];

        deaths.x0 = [];
        deaths.y0 = [];

        tests.x0 = [];
        tests.y0 = [];

        positivesRatio.x0 = [];
        positivesRatio.y0 = [];

        // Get USA Covid Data
        $.getJSON( "https://covidtracking.com/api/us/daily", function( data ) {

            var positive_counter = 0;
            var hospital_counter = 0;
            var death_counter = 0;
            var test_counter = 0;
            var positivesRatio_counter = 0;

            for (var i = 0; i < data.length; i++) {
                var positive = data[data.length - i - 1].positive;
                var positiveIncrease = data[data.length - i - 1].positiveIncrease;
                if (positive > 0) {
                    positives.x0.push(positive_counter);
                    positives.y0.push(Math.round(positive / population_usa * 10) / 10);

                    positivesIncrease.x0.push(positive_counter);
                    positivesIncrease.y0.push(Math.round(positiveIncrease / population_usa * 10) / 10);
                    positive_counter += 1
                }

                var hospital = data[data.length - i - 1].hospitalized;
                if (hospital > 0) {
                    hospitalized.x0.push(hospital_counter);
                    hospitalized.y0.push(Math.round(hospital / population_usa * 10) / 10);
                    hospital_counter += 1
                }

                var death = data[data.length - i - 1].death;
                if (death > 0) {
                    deaths.x0.push(death_counter);
                    deaths.y0.push(Math.round(death / population_usa * 10) / 10);
                    death_counter += 1;
                }

                var test = data[data.length - i - 1].totalTestResults;
                if (test > 0) {
                    tests.x0.push(test_counter);
                    tests.y0.push(Math.round(test / population_usa * 10) / 10);
                    test_counter += 1;
                }

                if (test > 0) {
                    positivesRatio.x0.push(positivesRatio_counter);
                    positivesRatio.y0.push(Math.round(positive / test * 1000.0) / 10.0);
                    positivesRatio_counter += 1;
                }
            }

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

    getData(document.getElementById("state_1").value, document.getElementById("state_2").value);
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

    hospitalized.x1 = [];
    hospitalized.x2 = [];
    hospitalized.y1 = [];
    hospitalized.y2 = [];

    deaths.x1 = [];
    deaths.x2 = [];
    deaths.y1 = [];
    deaths.y2 = [];

    tests.x1 = [];
    tests.x2 = [];
    tests.y1 = [];
    tests.y2 = [];

    positivesRatio.x1 = [];
    positivesRatio.x2 = [];
    positivesRatio.y1 = [];
    positivesRatio.y2 = [];

    $.getJSON( "https://covidtracking.com/api/states/daily?state=" + state_1, function( data ) {

        var positive_counter = 0;
        var hospital_counter = 0;
        var death_counter = 0;
        var test_counter = 0;
        var positivesRatio_counter = 0;

        var state_pop = getPopulation(state_1);

        for (var i = 0; i < data.length; i++) {
            var positive = data[data.length - i - 1].positive;
            var positiveIncrease = data[data.length - i - 1].positiveIncrease;
            if (positive > 0) {
                positives.x1.push(positive_counter);
                positives.y1.push(Math.round(positive / state_pop * 10) / 10);

                positivesIncrease.x1.push(positive_counter);
                positivesIncrease.y1.push(Math.round(positiveIncrease / state_pop * 10) / 10);
                positive_counter += 1
            }

            var hospital = data[data.length - i - 1].hospitalized;
            if (hospital > 0) {
                hospitalized.x1.push(hospital_counter);
                hospitalized.y1.push(Math.round(hospital / state_pop * 10) / 10);
                hospital_counter += 1
            }

            var death = data[data.length - i - 1].death;
            if (death > 0) {
                deaths.x1.push(death_counter);
                deaths.y1.push(Math.round(death / state_pop * 10) / 10);
                death_counter += 1;
            }

            var test = data[data.length - i - 1].totalTestResults;
            if (test > 0) {
                tests.x1.push(test_counter);
                tests.y1.push(Math.round(test / state_pop * 10) / 10);
                test_counter += 1;
            }

            if (test > 0) {
                positivesRatio.x1.push(positivesRatio_counter);
                positivesRatio.y1.push(Math.round(positive / test * 1000.0) / 10.0);
                positivesRatio_counter += 1;
            }
        }

        state_date.s1 = parseDate(data[0].date);

        check_ready(state_1, state_2);
    });

    $.getJSON( "https://covidtracking.com/api/states/daily?state=" + state_2, function( data ) {

        var positive_counter = 0;
        var hospital_counter = 0;
        var death_counter = 0;
        var test_counter = 0;
        var positivesRatio_counter = 0;

        var state_pop = getPopulation(state_2);

        for (var i = 0; i < data.length; i++) {
            var positive = data[data.length - i - 1].positive;
            var positiveIncrease = data[data.length - i - 1].positiveIncrease;
            if (positive > 0) {
                positives.x2.push(positive_counter);
                positives.y2.push(Math.round(positive / state_pop * 10) / 10);

                positivesIncrease.x2.push(positive_counter);
                positivesIncrease.y2.push(Math.round(positiveIncrease / state_pop * 10) / 10);
                positive_counter += 1
            }

            var hospital = data[data.length - i - 1].hospitalized;
            if (hospital > 0) {
                hospitalized.x2.push(hospital_counter);
                hospitalized.y2.push(Math.round(hospital / state_pop * 10) / 10);
                hospital_counter += 1
            }

            var death = data[data.length - i - 1].death;
            if (death > 0) {
                deaths.x2.push(death_counter);
                deaths.y2.push(Math.round(death / state_pop * 10) / 10);
                death_counter += 1;
            }

            var test = data[data.length - i - 1].totalTestResults;
            if (test > 0) {
                tests.x2.push(test_counter);
                tests.y2.push(Math.round(test / state_pop * 10) / 10);
                test_counter += 1;
            }

            if (test > 0) {
                positivesRatio.x2.push(positivesRatio_counter);
                positivesRatio.y2.push(Math.round(positive / test * 1000.0) / 10.0);
                positivesRatio_counter += 1;
            }
        }

        state_date.s2 = parseDate(data[0].date);

        check_ready(state_1, state_2);
    });

}

function check_ready(state_1, state_2) {

    var max_labels;
    var labels;

    if (positives.y1.length > 0 && positives.y2.length > 0) {
        max_labels = Math.max(...[positives.y0.length, positives.y1.length, positives.y2.length]);
        labels = [...Array(max_labels).keys()];
        plot('positivesChart', labels, positives.y0, positives.y1, positives.y2, state_1, state_2, 'Covid-19 cases per 1M', 'Days since first case', 'Cases per 1M');
    }

    if (positivesIncrease.y1.length > 0 && positivesIncrease.y2.length > 0) {
        max_labels = Math.max(...[positivesIncrease.y0.length, positivesIncrease.y1.length, positivesIncrease.y2.length]);
        labels = [...Array(max_labels).keys()];
        plot('positivesIncreaseChart', labels, positivesIncrease.y0, positivesIncrease.y1, positivesIncrease.y2, state_1, state_2, 'New Covid-19 cases per 1M', 'Days since first case', 'New cases per 1M');
    }

    if (hospitalized.y1.length > 0 && hospitalized.y2.length > 0) {
        max_labels = Math.max(...[hospitalized.y0.length, hospitalized.y1.length, hospitalized.y2.length]);
        labels = [...Array(max_labels).keys()];
        plot('hospitalizedChart', labels, hospitalized.y0, hospitalized.y1, hospitalized.y2, state_1, state_2, 'Covid-19 hospitalizations per 1M', 'Days since first hospitalization', 'Hospitalizations per 1M');
    }

    if (deaths.y1.length > 0 && deaths.y2.length > 0) {
        max_labels = Math.max(...[deaths.y0.length, deaths.y1.length, deaths.y2.length]);
        labels = [...Array(max_labels).keys()];
        plot('deathsChart', labels, deaths.y0, deaths.y1, deaths.y2, state_1, state_2, 'Covid-19 deaths per 1M', 'Days since first death', 'Deaths per 1M');
    }

    if (tests.y1.length > 0 && tests.y2.length > 0) {
        max_labels = Math.max(...[tests.y0.length, tests.y1.length, tests.y2.length]);
        labels = [...Array(max_labels).keys()];
        plot('testsChart', labels, tests.y0, tests.y1, tests.y2, state_1, state_2, 'Covid-19 tests per 1M', 'Days since first test', 'Tests per 1M');
    }

    if (positivesRatio.y1.length > 0 && positivesRatio.y2.length > 0) {
        max_labels = Math.max(...[positivesRatio.y0.length, positivesRatio.y1.length, positivesRatio.y2.length]);
        labels = [...Array(max_labels).keys()];
        plot('positivesRatioChart', labels, positivesRatio.y0, positivesRatio.y1, positivesRatio.y2, state_1, state_2, 'Percent positive Covid-19 tests', 'Days since first test', 'Positive tests (%)');
    }

    // Display when data last updated
    $('#lastUpdateSpan0').html('USA: ' + state_date.s0);
    $('#lastUpdateSpan1').html(state_1 + ': ' + state_date.s1);
    $('#lastUpdateSpan2').html(state_2 + ': ' + state_date.s2);

}

function plot(chart_id, x_values, y_values_0, y_values_1, y_values_2, state_1, state_2, title, xtitle, ytitle) {

    var ctx = document.getElementById(chart_id).getContext('2d');
    charts.push(new Chart(ctx, {
        type: 'line',
        data: {
            labels: x_values,
            datasets: [{
                label: 'USA',
                data: y_values_0,
                borderColor: 'black',
                fill: false
            },{
                label: state_1,
                data: y_values_1,
                borderColor: 'blue',
                fill: false
            },{
                label: state_2,
                data: y_values_2,
                borderColor: 'orange',
                fill: false
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
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: xtitle,
                        fontSize: 18
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: ytitle,
                        fontSize: 18
                    }
                }]
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