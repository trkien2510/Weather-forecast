const API_Key = '2f337a85cfbd61727162cdf04f4d58c7';

const timeEL = document.getElementById('time');
const dateEl = document.getElementById('date');
const buttonEl = document.getElementById('btn_find');
const cityName = document.getElementById('input_city_name').value;
var latitude, longitude, lat, lon;
var C_or_F = 'metric';
var noteTemp = '°C';
var noteWindSpeed = 'm/s';

const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
const weatherDescriptions = {
    'clear sky': 'Trời quang',
    'light rain': 'Mưa nhẹ',
    'moderate rain': 'Mưa vừa',
    'heavy intensity rain': 'Mưa lớn',
    'broken clouds': 'Ít mây',
    'overcast clouds': 'U ám',
    'few clouds': 'Mây vừa',
    'scattered clouds': 'Nhiều mây',
    'snow': "Tuyết",
    'light snow': 'Tuyết nhẹ',
    'mist': 'Sương mù'
};

firstUpdate();
setInterval(firstUpdate, 1000);

function firstUpdate() {
    const d = new Date();
    let hour = d.getHours();
    let minutes = d.getMinutes();
    let ampm = hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    let timeString = hour + ':' + minutes + ' ' + ampm;
    timeEL.innerHTML = timeString;

    let day = days[d.getDay()];
    let month = months[d.getMonth()];
    let dateString = `${day}, ${d.getDate()} ${month}`;
    dateEl.innerHTML = dateString;
}

document.getElementById('c').classList.add('selected');
document.getElementById('c').addEventListener('click', function () {
    C_or_F = 'metric';
    noteTemp = '°C';
    noteWindSpeed = 'm/s';
    document.getElementById('c').classList.add('selected');
    document.getElementById('f').classList.remove('selected');
    getHourlyForecast();
    getDailyForecast();
    getInformation();
});

document.getElementById('f').addEventListener('click', function () {
    C_or_F = 'imperial';
    noteTemp = '°F';
    noteWindSpeed = 'mph';
    document.getElementById('f').classList.add('selected');
    document.getElementById('c').classList.remove('selected');
    getHourlyForecast();
    getDailyForecast();
    getInformation();
});

document.addEventListener('DOMContentLoaded', (event) => {
    getLocation();
});

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getWeatherByLocation);
    }
}

function getWeatherByLocation(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_Key}&units=${C_or_F}`;
    getInformation(url);
}

document.getElementById('input_city_name').addEventListener('keydown', function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        const cityName = document.getElementById('input_city_name').value;
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_Key}&units=${C_or_F}`;
        document.getElementById('input_city_name').value = "";
        getInformation(url);
    }
});

buttonEl.addEventListener('click', function () {
    const cityName = document.getElementById('input_city_name').value;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_Key}&units=${C_or_F}`;
    document.getElementById('input_city_name').value = "";
    getInformation(url);
});

async function getInformation(url = null) {
    try {
        if (!url) {
            url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_Key}&units=${C_or_F}`;
        }
        const response = await fetch(url);
        const data = await response.json();

        console.log(data);

        latitude = data.coord.lat.toFixed(2);
        longitude = data.coord.lon.toFixed(2);

        if (latitude < 0 && longitude < 0) {
            lat = Math.abs(latitude) + 'S'
            lon = Math.abs(longitude) + 'W';
        } else if (latitude < 0 && longitude > 0) {
            lat = Math.abs(latitude) + 'S'
            lon = longitude + 'E';
        } else if (latitude > 0 && longitude < 0) {
            lat = latitude + 'N'
            lon = Math.abs(longitude) + 'W';
        } else {
            lat = latitude + 'N'
            lon = longitude + 'E';
        }
        const newMapUrl = `https://www.google.com/maps/place/${lat},${lon}`;

        const iconCode = data.weather[0].icon;
        const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
        changeBackground(iconCode);

        const true_name = data.name;
        if (true_name == 'Turan') {
            document.getElementById('city').textContent = 'Da nang';
        } else {
            document.getElementById('city').textContent = data.name;
        }
        document.getElementById('country').textContent = data.sys.country;
        document.getElementById('map-link').href = newMapUrl;
        document.getElementById('number').textContent = `${Math.round(data.main.temp)}${noteTemp}`;
        document.getElementById('other1').textContent = `${data.main.humidity}%`;
        document.getElementById('other2').textContent = `${data.main.pressure} hPa`;
        document.getElementById('other3').textContent = `${data.wind.speed} ${noteWindSpeed}`;
        document.getElementById('other4').textContent = `${Math.round(data.visibility / 1000)} km`;
        document.getElementById('other5').textContent = data.rain ? `${data.rain['1h'] || 0} mm` : '0 mm';
        document.getElementById('other6').textContent = `${data.clouds.all}%`;
        document.getElementById('other7').textContent = lat + ', ' + lon;
        document.getElementById('icon').src = iconUrl;

        getHourlyForecast();
        getDailyForecast();
    } catch (error) {
        console.error('lỗi xảy ra:', error);
    }
}

function changeBackground(iconCode) {
    let bgImageUrl;

    switch (iconCode) {
        case '01d':
            bgImageUrl = 'url("imgs/clear_sky.jpg")';
            break;
        case '01n':
            bgImageUrl = 'url("imgs/clear_sky_night.jpg")';
            break;
        case '02d':
            bgImageUrl = 'url("imgs/part_cloud.jpg")';
            break;
        case '02n':
            bgImageUrl = 'url("imgs/part_cloud_night.jpg")';
            break;
        case '03d':
        case '03n':
        case '04d':
        case '04n':
            bgImageUrl = 'url("imgs/cloud.jpg")';
            break;
        case '09d':
        case '09n':
        case '10d':
        case '10n':
            bgImageUrl = 'url("imgs/rain.jpg")';
            break;
        case '11d':
        case '11n':
            bgImageUrl = 'url("imgs/thunder.jpg")';
            break;
        case '13d':
        case '13n':
            bgImageUrl = 'url("imgs/snow.jpg")';
            break;
        case '50d':
        case '50n':
            bgImageUrl = 'url("imgs/mist.jpg")';
            break;
        default:
            bgImageUrl = 'url("imgs/clear_sky.jpg")';
            break;
    }
    document.body.style.backgroundImage = bgImageUrl;
}

async function getHourlyForecast() {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_Key}&units=${C_or_F}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const hourlyData = data.list.slice(0, 8);

        hourlyData.forEach((item, index) => {
            const hour = new Date(item.dt * 1000).getHours();
            const temp = Math.round(item.main.temp);
            const description = item.weather[0].description;
            const translatedDescription = weatherDescriptions[description] || description;
            const iconCode = item.weather[0].icon;
            const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

            document.getElementById(`hourly-card-${index + 1}`).innerHTML = `
                <h4 class="card-title">${hour}:00</h4>
                <img class="card-img" src="${iconUrl}" width="70px" height="70px">
                <p class="card-text">${translatedDescription}<br>${temp}${noteTemp}</p>
            `;
        });
    } catch (error) {
        console.error('Lỗi', error);
    }
}

async function getDailyForecast() {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_Key}&units=${C_or_F}`;
    let index = 1;
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);

    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log(data);

        for (let i = 7; i < data.list.length; i += 8) {
            let day = days[currentDate.getDay()];
            let month = months[currentDate.getMonth()];
            let dateString = `${day}, ${currentDate.getDate()} ${month}`;

            const temp = Math.round(data.list[i].main.temp);
            const description = data.list[i].weather[0].description;
            const translatedDescription = weatherDescriptions[description] || description;
            const iconCode = data.list[i].weather[0].icon;
            const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

            document.getElementById(`forecast-day-${index}`).innerHTML = `
                <span class="next-${index}-day">${dateString}</span>
                <span class="note" id="note-${index}">${translatedDescription}</span>
                <br>
                <img id="img-${index}" src="${iconUrl}" width="60px" height="60px">
                <span id="temp-${index}">${temp}${noteTemp}</span>
            `
            currentDate.setDate(currentDate.getDate() + 1);
            index++;
        }
    } catch (error) {
        console.error('Lỗi', error);
    }
}