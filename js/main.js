var charts = [];

var positives = [];
var deaths = [];

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

    $.getJSON("https://datausa.io/api/data?drilldowns=State&measures=Population&year=latest", function (data) {
        population = data.data;
        getStates();
    });

}

function getStates() {
    for (var i = 0; i < charts.length; i++) {
        charts[i].destroy();
    }

    getData(document.getElementById("state_1").value, document.getElementById("state_2").value);
}

function getData(state_1, state_2) {

    positives.x1 = [];
    positives.x2 = [];
    positives.y1 = [];
    positives.y2 = [];

    deaths.x1 = [];
    deaths.x2 = [];
    deaths.y1 = [];
    deaths.y2 = [];

    $.getJSON( "https://covidtracking.com/api/states/daily?state=" + state_1, function( data ) {

        var positive_counter = 0;
        var death_counter = 0;
        var state_pop = getPopulation(state_1);

        for (var i = 0; i < data.length; i++) {
            var positive = data[data.length - i - 1].positive;
            if (positive > 0) {
                positives.x1.push(positive_counter);
                positives.y1.push(Math.round(positive / state_pop));
                positive_counter += 1
            }

            var death = data[data.length - i - 1].death;
            if (death > 0) {
                deaths.x1.push(death_counter);
                deaths.y1.push(Math.round(death / state_pop));
                death_counter += 1;
            }
        }

        check_ready(state_1, state_2);
    });

    $.getJSON( "https://covidtracking.com/api/states/daily?state=" + state_2, function( data ) {

        var positive_counter = 0;
        var death_counter = 0;
        var state_pop = getPopulation(state_2);

        for (var i = 0; i < data.length; i++) {
            var positive = data[data.length - i - 1].positive;
            if (positive > 0) {
                positives.x2.push(positive_counter);
                positives.y2.push(Math.round(positive / state_pop));
                positive_counter += 1
            }

            var death = data[data.length - i - 1].death;
            if (death > 0) {
                deaths.x2.push(death_counter);
                deaths.y2.push(Math.round(death / state_pop));
                death_counter += 1;
            }
        }

        check_ready(state_1, state_2);
    });

}

function check_ready(state_1, state_2) {

    if (positives.y1.length > 0 && positives.y2.length > 0) {
        var labels;
        if (positives.x1.length > positives.x2.length) {
            labels = positives.x1;
        } else {
            labels = positives.x2;
        }
        plot('casesChart', labels, positives.y1, positives.y2, state_1, state_2, 'Covid-19 cases per 1M', 'Days since first Covid-19 case', 'Covid-19 cases per 1M');
    }

    if (deaths.y1.length > 0 && deaths.y2.length > 0) {
        var labels;
        if (deaths.x1.length > deaths.x2.length) {
            labels = deaths.x1;
        } else {
            labels = deaths.x2;
        }
        plot('deathsChart', labels, deaths.y1, deaths.y2, state_1, state_2, 'Covid-19 deaths per 1M', 'Days since first Covid-19 death', 'Covid-19 deaths per 1M');
    }

}

function plot(chart_id, x_values, y_values_1, y_values_2, state_1, state_2, title, xtitle, ytitle) {

    var ctx = document.getElementById(chart_id).getContext('2d');
    charts.push(new Chart(ctx, {
        type: 'line',
        data: {
            labels: x_values,
            datasets: [{
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