var data;
var dates = [];

var charts = [];

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

    Papa.parse("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv", {
        download: true,
        complete: function (results) {
            // console.log(results);
            data = results.data;

            for (var i = 11; i < data[0].length; i++) {
                dates.push(data[0][i]);
            }

            // console.log(dates);

            // Retrieve set states
            var state = getCookie("state");
            if (state.length === 2) {
                $("#states").val(state);
            } else {
                $("#states").val("VA");
            }
            fillCounties();

            var fips = getCookie("fips");
            if (fips.length > 0) {
                $("#counties").val(fips);
            } else {
                $("#counties").val("51019.0");
            }

            var range = getCookie("range");
            if (range.length > 0) {
                $("#range").val(range);
            } else {
                $("#range").val("50");
            }
            performAnalysis();
        }
    });

}

function fillCounties() {

    var state = $("#states").val();
    var select = $("#counties")[0];

    select.options.length = 0;
    select.options[select.options.length] = new Option("", "0");

    for(var i = 0; i < data.length; i++) {

        // Skip if not county
        if (data[i][3] !== '840') { continue }

        // Skip if wrong state
        if (data[i][6] !== states[state]) { continue }

        select.options[select.options.length] = new Option(data[i][5], data[i][4]);
    }
}

function performAnalysis() {

    for (var i = 0; i < charts.length; i++) {
        charts[i].destroy();
    }

    var fips = $("#counties").val();
    var county = getCounty(fips);
    var range_sm =parseFloat($("#range").val());

    var counties = getCounties(county, range_sm);
    var cases = getCases(counties);

    //console.log(counties);
    //console.log(cases);

    var positives = {};
    positives.x = [];
    positives.y = [];

    var positivesIncrease = {};
    positivesIncrease.x = [];
    positivesIncrease.y = [];

    for (var i = 0; i < cases.length; i++) {

        var positive = cases[i];
        var positiveIncrease = 0;
        if (i > 0) {
            positiveIncrease = Math.max(0,cases[i] - cases[i-1]);
        }

        if (positive > 0) {
            positives.x.push(dates[i]);
            positives.y.push(positive);

            positivesIncrease.x.push(dates[i]);
            positivesIncrease.y.push(positiveIncrease);
        }

    }

    // console.log(positives);
    // console.log(positivesIncrease);

    plot('positivesChart', positives, positivesIncrease, 'Covid-19 cases per 1M', 'Date', 'Total Cases', 'New Cases');

}

function getCounty(fips) {

    var county;

    for(var i = 0; i < data.length; i++) {

        // Skip if not correct fips
        if (data[i][4] !== fips) { continue }

        county = data[i];
        break;
    }

    return county;
}

function getCounties(county, range_sm) {

    var counties = [];

    var org_lat = parseFloat(county[8]);
    var org_lon = parseFloat(county[9]);

    for(var i = 0; i < data.length; i++) {

        // Skip if not county
        if (data[i][3] !== '840') { continue }

        var des_lat = parseFloat(data[i][8]);
        var des_lon = parseFloat(data[i][9]);

        if (isNaN(des_lat) || isNaN(des_lon)) { continue }

        var dist_sm = distance(org_lat, org_lon, des_lat, des_lon, 'M');

        if (dist_sm > range_sm) { continue }

        counties.push(data[i]);
    }

    return counties;
}

function getCases(counties) {

    var cases = [];

    for (var i = 11; i < counties[0].length; i++) {
        var day_sum = 0;
        for (var c = 0; c < counties.length; c++) {
            day_sum += parseInt(counties[c][i]);
        }
        cases.push(day_sum);
    }

    return cases;
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

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                         :::
//:::  This routine calculates the distance between two points (given the     :::
//:::  latitude/longitude of those points). It is being used to calculate     :::
//:::  the distance between two locations using GeoDataSource (TM) prodducts  :::
//:::                                                                         :::
//:::  Definitions:                                                           :::
//:::    South latitudes are negative, east longitudes are positive           :::
//:::                                                                         :::
//:::  Passed to function:                                                    :::
//:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'M' is statute miles (default)                         :::
//:::                  'K' is kilometers                                      :::
//:::                  'N' is nautical miles                                  :::
//:::                                                                         :::
//:::  Worldwide cities and other features databases with latitude longitude  :::
//:::  are available at https://www.geodatasource.com                         :::
//:::                                                                         :::
//:::  For enquiries, please contact sales@geodatasource.com                  :::
//:::                                                                         :::
//:::  Official Web site: https://www.geodatasource.com                       :::
//:::                                                                         :::
//:::               GeoDataSource.com (C) All Rights Reserved 2018            :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

function distance(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit=="K") { dist = dist * 1.609344 }
        if (unit=="N") { dist = dist * 0.8684 }
        return dist;
    }
}

function plot(chart_id, series_y1, series_y2, title, x_title, y1_title, y2_title) {

    var data_y1  = formatPlotData(series_y1.x, series_y1.y);
    var data_y2 = formatPlotData(series_y2.x, series_y2.y);

    var ctx = document.getElementById(chart_id).getContext('2d');
    charts.push(new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Total Cases',
                data: data_y1,
                borderColor: 'red',
                backgroundColor: 'red',
                fill: false,
                pointRadius: 0,
                yAxisID: 'y1',
                type: 'line'
            },{
                label: 'New Cases',
                data: data_y2,
                borderColor: 'blue',
                backgroundColor: 'blue',
                fill: true,
                pointRadius: 0,
                yAxisID: 'y2',
                type: 'bar'
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
                        labelString: x_title,
                        fontSize: 18
                    },
                    offset: true,
                    gridLines: {
                        display: false
                    }
                }],
                yAxes: [{
                    id: 'y1',
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: y1_title,
                        fontSize: 18
                    },
                    position: 'left'
                },{
                    id: 'y2',
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: y2_title,
                        fontSize: 18
                    },
                    position: 'right',
                    gridLines: {
                        display: false
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