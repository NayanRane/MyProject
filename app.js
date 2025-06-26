let searchError = document.getElementById("searchError");
let cardTitle = document.getElementById("cardTitle");
let temperature = document.getElementById("temperature");
let humidity = document.getElementById("humidity");
let windSpeed = document.getElementById("windSpeed");
let img = document.getElementById("img");
let sunrise = document.getElementById("sunrise");
let sunset = document.getElementById("sunset");

const weatherIcons = {
    Clouds: "Images/clouds.png",
    Rain: "Images/rain.png",
    Clear: "Images/clear.png",
    Snow: "Images/snow.png",
    Mist: "Images/mist.png",
    Drizzle: "Images/drizzle.png"
}



// let cardTitle = document.getElementsByClassName("card-title").value;

let apiKey = "ff64049707b1a6f8ad5a3f7fe9b54694";
let apiurl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q="
document.getElementById("searchBtn").onclick = () => {
    let cityName = document.getElementById("city").value;

    if (cityName != "") {
        let city = cityName.trim();

        fetch(apiurl + city + `&appid=${apiKey}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // parse JSON from the response
            })
            .then(data => {
                showData(data);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });

    } else {
        searchError.textContent = "City name is required";

    }


}

const showData = (data) => {

    const { name, main, wind, weather, sys } = data;

    cardTitle.textContent = name;
    temperature.textContent = Math.round(main.temp);
    humidity.textContent = main.humidity;
    windSpeed.textContent = wind.speed;
    sunrise.textContent = convertTimestampToTime(data.sys.sunrise);
    sunset.textContent = convertTimestampToTime(data.sys.sunset);

    const sunriseInMin = timeToMinutes(convertTimestampToTime(data.sys.sunrise));
    const sunsetInMin = timeToMinutes(convertTimestampToTime(data.sys.sunset))

    function getCurrentMinutes() {
        const now = new Date();
        return now.getHours() * 60 + now.getMinutes();
    }

    const sun = document.getElementById('sun');
    const skyWidth = document.getElementById('sky').offsetWidth;
    const now = getCurrentMinutes();


    const sunProgress = Math.max(0, Math.min(1, (now - sunriseInMin) / (sunsetInMin  - sunriseInMin)));


    const sunX = sunProgress * skyWidth;    
    const sunY = Math.sin(sunProgress * Math.PI) * -100 + 100; // Simulates an arc

    sun.style.left = `${sunX}px`;
    sun.style.top = `${sunY}px`;


    const weatherMain = weather[0].main;
    const iconSrc = weatherIcons[weatherMain];

    if (iconSrc) {
        img.setAttribute("src", iconSrc);
    }

}


function convertTimestampToTime(timestamp) {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Format hours and minutes with leading zeros if needed
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
}

function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}