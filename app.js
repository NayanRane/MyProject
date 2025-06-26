let searchError = document.getElementById("searchError");
let cardTitle = document.getElementById("cardTitle");
let temperature = document.getElementById("temperature");
let humidity = document.getElementById("humidity");
let windSpeed = document.getElementById("windSpeed");
let img = document.getElementById("img");
const weatherIcons = {
    Clouds: "Images/clouds.png",
    Rain: "Images/rain.png",
    Clear: "Images/clear.png",
    Snow: "Images/snow.png",
    Mist: "Images/mist.png",
    Drizzle: "Images/drizzle.png"
}



// let cardTitle = document.getElementsByClassName("card-title").value;

let apiKey = "ff64049707b1a6f8ad5a3f7fe9b54694" ;
let apiurl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q="
document.getElementById("searchBtn").onclick = () =>{
    let cityName = document.getElementById("city").value;

    if(cityName != ""){
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
    
    }else{
        searchError.textContent = "City name is required";

    }

    
}


const showData  = (data) => {
    const {name,main,wind,weather} = data;

    cardTitle.textContent = name ;
    temperature.textContent = Math.round(main.temp);
    humidity.textContent = main.humidity;
    windSpeed.textContent = wind.speed;

   const weatherMain = weather[0].main; 
   const iconSrc = weatherIcons [weatherMain];

   if(iconSrc){
        img.setAttribute("src", iconSrc);
   }

}