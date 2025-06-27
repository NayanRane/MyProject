let searchError = document.getElementById("searchError");
let cardTitle = document.getElementById("cardTitle");
let temperature = document.getElementById("temperature");
let humidity = document.getElementById("humidity");
let windSpeed = document.getElementById("windSpeed");
let img = document.getElementById("img");
let sunrise = document.getElementById("sunrise");
let sunset = document.getElementById("sunset");
let conditions = document.getElementById("weather");

const weatherIcons = {
  Clouds: "Images/clouds.png",
  Rain: "Images/rain.png",
  Clear: "Images/clear.png",
  Snow: "Images/snow.png",
  Mist: "Images/mist.png",
  Drizzle: "Images/drizzle.png",
};

// let cardTitle = document.getElementsByClassName("card-title").value;

let apiKey = "ff64049707b1a6f8ad5a3f7fe9b54694";
let apiurl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
document.getElementById("searchBtn").onclick = () => {
  let cityName = document.getElementById("city").value;

  if (cityName != "") {
    let city = cityName.trim();

    fetch(apiurl + city + `&appid=${apiKey}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json(); // parse JSON from the response
      })
      .then((data) => {
        showData(data);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  } else {
    searchError.textContent = "City name is required";
  }
};

const showData = (data) => {
  const { name, main, wind, weather, sys } = data;

  // const { cx, cy, rx, ry } = drawSunPath();
  const { cx, cy, radius } = drawSunPath();

  const weatherMain = weather[0].main;

  cardTitle.textContent = name;
  temperature.textContent = Math.round(main.temp);
  humidity.textContent = main.humidity;
  windSpeed.textContent = wind.speed;
  conditions.textContent = weatherMain;
  sunrise.textContent = convertTimestampToTime(data.sys.sunrise);
  sunset.textContent = convertTimestampToTime(data.sys.sunset);

  const sunriseInMin = timeToMinutes(convertTimestampToTime(data.sys.sunrise));
  const sunsetInMin = timeToMinutes(convertTimestampToTime(data.sys.sunset));

  const sun = document.getElementById("sun");
  const skyWidth = document.getElementById("sky").offsetWidth;
  const now = getCurrentMinutes();

  const sunProgress = Math.max(
    0,
    Math.min(1, (now - sunriseInMin) / (sunsetInMin - sunriseInMin))
  );

  // const sunAngle = sunProgress * Math.PI; // from 0 (sunrise) to π (sunset)

  // // X and Y on the elliptical arc
  // const sunX = cx - rx * Math.cos(sunAngle);
  // const sunY = cy - ry * Math.sin(sunAngle);

  // sun.style.left = `${sunX}px`;
  // sun.style.top = `${sunY}px`;

  const sunAngle = sunProgress * Math.PI * 0.8; // 0 to π

  const sunX = cx - radius * Math.cos(sunAngle);
  const sunY = cy - radius * Math.sin(sunAngle);

  sun.style.left = `${sunX}px`;
  sun.style.top = `${sunY}px`;

  const iconSrc = weatherIcons[weatherMain];

  if (iconSrc) {
    img.setAttribute("src", iconSrc);
  }
};

function getCurrentMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

// function drawSunPath() {
//     const svg = document.getElementById("sunPathSVG");
//     const path = document.getElementById("sunPath");
//     const width = svg.clientWidth;
//     const height = svg.clientHeight;

//     // Ellipse radii
//     const rx = width / 2.5;         // Horizontal radius
//     const ry = height / 3;          // Vertical radius

//     // Arc center position — middle of the container
//     const cx = width / 2;
//     const cy = height / 2;

//     // Start and end points of the arc
//     const startX = cx - rx;
//     const endX = cx + rx;

//     // Elliptical arc path
//     const d = `M ${startX},${cy} A ${rx},${ry} 0 0,1 ${endX},${cy}`;
//     path.setAttribute("d", d);

//     return { cx, cy, rx, ry };
// }

function drawSunPath() {
  const svg = document.getElementById("sunPathSVG");
  const path = document.getElementById("sunPath");
  const width = svg.clientWidth;
  const height = svg.clientHeight;

  // Set arc radius (should be less than half width/height)
  const radius = Math.min(width, height) / 2.2;

  // Arc center (x = middle of sky, y = lower than middle to push arc up)
  const cx = width / 2;
  const cy = height * 0.75; // Adjust 0.75 to move the arc up or down

  // Start and end points of the arc
  const startX = cx - radius;
  const startY = cy;
  const endX = cx + radius;
  const endY = cy;

  // Draw arc from left to right: large-arc-flag = 0, sweep-flag = 1
  const d = `M ${startX},${startY} A ${radius},${radius} 0 0,1 ${endX},${endY}`;
  path.setAttribute("d", d);

  return { cx, cy, radius };
}

function convertTimestampToTime(timestamp) {
  const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Format hours and minutes with leading zeros if needed
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}`;
}

function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}
