let apiKey = "ff64049707b1a6f8ad5a3f7fe9b54694" ;
let apiurl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q="
document.getElementById("searchBtn").onclick = () =>{
    let cityName = document.getElementById("city").value;

    fetch(apiurl + cityName + `&appid=${apiKey}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // parse JSON from the response
    })
    .then(data => {
        console.log(data); // handle the data
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
    
}