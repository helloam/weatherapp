
var date = moment().format('MM/DD/YYYY');
var apiKey = '4e4c7ba3fe27e6a028d58369839454fe';
var cityEl = $('#cityName');
var tempEl = $('#temp');
var humidEl = $('#humidity');
var windEl = $('#wind');
var uvi = $('#uv');


function getWeather(city) {
    var weatherURL = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + apiKey;
    $.ajax({
        url: weatherURL,
        method: 'GET',
    }).then(function (weatherResponse) {
        weather = weatherResponse;
      
        var temp = ((weather.main.temp - 273.15) * (9 / 5) + 32).toFixed(0);

        var icon = weatherResponse.weather[0].icon;
        var iconSrc = 'https://openweathermap.org/img/wn/' + icon + '@2x.png';
      
        cityEl.text(weather.name + ' (' + date + ')');
       
        tempEl.text('Temperature: ' + temp + '°F');
        humidEl.text('Humidity: ' + weather.main.humidity + '%');
        windEl.text('Windspeed: ' + weather.wind.speed + 'mph');
        $('#forecastHeader').text('Five-Day Forecast:');

        var lon = weather.coord.lon;
        var lat = weather.coord.lat;
        var uvURL = 'https://api.openweathermap.org/data/2.5/uvi?lat=' + lat + '&lon=' + lon + '&appid=' + apiKey;
        $.ajax({
            url: uvURL,
            method: 'GET'
        }).then(function (uvResponse) {
            uvi.text('UV Index: ' + uvResponse.value);
            if (uvResponse.value < 3) {
                $('#uv').attr('class', 'low');
            } else if (uvResponse.value >= 3 && uvResponse.value <= 5) {
                $('#uv').attr('class', 'moderate');
            } else if (uvResponse.value > 5 && uvResponse.value <= 7) {
                $('#uv').attr('class', 'high');
            } else if (uvResponse.value > 7) {
                $('#uv').attr('class', 'severe');
            }
        })
    })

    var forecastURL = 'https://api.openweathermap.org/data/2.5/forecast?q=' + city + '&appid=' + apiKey;
    $.ajax({
        url: forecastURL,
        method: 'GET'
    }).then(function (forecastResponse) {
        $('#forecastDisplay').empty();
        var forecast = forecastResponse;
      
        for (i = 0; i < forecast.list.length; i += 8) {
            
            var card = $('<div class="col-2" id="cardContainer">');
            var day = $('<h4>');
            var dayTemp = $('<p>');
            var dayHumidity = $('<p>');
            var tempK = forecast.list[i].main.temp;
            var dateTime = forecast.list[i].dt;
            var formattedDate = moment.unix(dateTime).format('MM/DD/YYYY');
            var iconSrc = 'https://openweathermap.org/img/wn/' + forecastResponse.list[i].weather[0].icon + '@2x.png';
       
            day.text(formattedDate);
            dayTemp.text('Temp: ' + ((tempK - 273.15) * (9 / 5) + 32).toFixed(0) + '\xB0F');
            dayHumidity.text('Humidity: ' + forecast.list[i].main.humidity + '%');
            card.append(day, '<img id="forecastIcon" src= \'' + iconSrc + '\'/>', dayTemp, dayHumidity);
            $('#forecastDisplay').append(card);
        }
    })
}


$('#btn').on('click', function (event) {
    event.preventDefault();
    var city = $('#input').val().trim();
    var citiesSearched = JSON.parse(localStorage.getItem('citiesSearched'));
    if (citiesSearched == null) {
        citiesSearched = [];
    }
    citiesSearched.unshift(city);
    var citiesPast = localStorage.setItem('citiesSearched', JSON.stringify(citiesSearched));
    addCityButton(city);
    getWeather(city);
})


function addCityButton(city) {
    $('#th').text('Previous Cities Searched');
    var newSearch = $('<tr id="previousSearch">');
    var cityButton = $('<button id=' + city + ' class=btn>').text(city);
    newSearch.append(cityButton);
    cityButton.on('click', function () {
        getWeather(city);
    })
    $('#cityButton').prepend(newSearch);
}


window.onload = function () {
    var citiesPast = JSON.parse(localStorage.getItem('citiesSearched'));
    console.log(citiesPast);
    if (citiesPast == null) {
        citiesPast = [];
    }

    for (i = 0; i < citiesPast.length; i++) {
        if (citiesPast[i] != null) {
            addCityButton(citiesPast[i]);
        }
    }

    if (citiesPast.length > 0) {
        getWeather(citiesPast[0]);
    }
}