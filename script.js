const map = L.map("map").setView([49, -123], 10);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

//Render weather info
const weatherContainer = document.querySelector(".weather__container");

const renderWeatherInfo = function (locationData, weatherData) {
  const html = `
  <div class="weather__data">
    <div class="weather__location">
      <div class="weather__city">${locationData.address.city},</div>
      <div class="weather__country">
        ${locationData.address.country}
      </div>
    </div>
    <div class="weather__temperature">
      <span>🌡${weatherData.dataseries[0].temp2m}</span>℃
    </div>
    <div class="weather__forecast">
      ${weatherData.dataseries[0].prec_type}
    </div>
    <div class="weather__highlow">
      <div class="weather__high">H:12℃</div>
      <div class="weather__low">L:5℃</div>
    </div>
  </div>
  <div class="weather__change">
<div class="weather__change-now"></div>
<div class="weather__change-3h"></div>
<div class="weather__change-6h"></div>
<div class="weather__change-9h"></div>
<div class="weather__change-12h"></div>
  </div>
    `;
  //Question:
  //how to show weather icon (ex⛅☔)
  //how to get highest/lowest temp?
  //how to build weather changing?
  //How to change default location to Tokyo from Hamburg?

  weatherContainer.insertAdjacentHTML("beforeend", html);
  weatherContainer.style.opacity = 1;
};

//

async function onClick(e) {
  const { lat, lng } = e.latlng;
  // Set marker
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
         className: "marker",//Qustion: how?
      })
    )
    .setPopupContent("City Name")//Qustion: how?
    .openPopup();

  // Get location data
  const locationDataRaw = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
  );
  const locationData = await locationDataRaw.json();
  console.log(
    `City:${locationData.address.city}, Country:${locationData.address.country}`
  );
  console.log(locationData);

  // Get weather data
  const weatherDataRaw = await fetch(
    `https://www.7timer.info/bin/civil.php?lon=${lng}&lat=${lat}&ac=0&unit=metric&output=json&tzshift=0`
  );
  let weatherData = await weatherDataRaw.json();
  console.log(
    `${weatherData.dataseries[0].temp2m}℃,${weatherData.dataseries[0].prec_type}`
  );
  console.log(weatherData);

  //Show icon ☔or⛄ Question
  const rainOrSnowIcon = function (precType) {
    if (precType === "snow") {
      weatherData.dataseries[0].prec_type = `${weatherData.dataseries[0].prec_type} ⛄`;
      console.log("⛄");
    } else if ((precType === "rain") | "frzr") {
      weatherData.dataseries[0].prec_type = `${weatherData.dataseries[0].prec_type} ☔`;
      console.log("☔");
    } else {
      return;
    }
  };
  rainOrSnowIcon(weatherData.dataseries[0].prec_type);

  //Show icon ☁️ Question
  const cloudIcon = function (cloudcover, precType) {
    if (cloudcover > 5 && precType !== "rain ☔" && precType !== "snow ⛄") {
      weatherData.dataseries[0].prec_type = "Cloudy ☁️";
      console.log("☁️");
    } else if (
      cloudcover <= 5 &&
      precType !== "rain ☔" &&
      precType !== "snow ⛄"
    ) {
      weatherData.dataseries[0].prec_type = "Sunny ☀︎";
      console.log("☀︎");
    }
  };
  cloudIcon(
    weatherData.dataseries[0].cloudcover,
    weatherData.dataseries[0].prec_type
  );

  // Render
  renderWeatherInfo(locationData, weatherData);
}

map.on("click", onClick);

/////////////////////////////////////////////////
// Emoji are so called Unicode Characters
//and modern HTML and JavaScript support that.
//So you can simply insert these emoji in your HTML Template
//because they behave like strings.
//However if you would like to decide which Emoji to display
//you need to write some logic to determine
//which Emoji is the most fitting given the data.
//Each entry in dataseries has "cloudcover" and "prec_type" and "prec_amount".
//Cloudcover will tell you how cloudy it is.
//1 means 0%-6% of the sky is clouded.
//2 means 6%-19%, 3 means 19%-31% and so on.
//You can see the full table down here
//http://www.7timer.info/doc.php?lang=en#api.
//Similarly "prec_type" stands for precipitation type
//so whether it is raining or snowing or nothing at all
//and it can have the values: "none", "snow", "rain",
//"frzr" for freezing rain and "icep" for ice pellets.
//★So you want to write a function which takes "cloudcover"
//★and "prec_type" as inputs and return an emoji.
//Then you can use that function for a given datapoint
//to determine the correct emoji and use it in your render function.

//how to get highest/lowest temp?
// In order to get the highest/lowest temp of the day
// you need to use the temp2m value of multiple datapoints and find the lowest.
// The easiest way to do that is to use the Math.min() and Math.max() functions
// which are built into javascript so you can simply use them without importing anything.
// So for the current day you need to find out which datapoints correspond to that day.
// For that look at the last two digits of init in the fetch response.
// They well tell you the starting hour. If it is 12, then it means it is just midnight.
// In that case you can include the first 8 datapoints since they are 3 hours apart.
// If it was 03 then you can include the first 7 datapoints and so on.
// Since dataseries is an array, getting the first 7 datapoints
// for example can be done with the dataseries.slice(7) method.
// Now the Math.min() and Math.max() functions don't know how to work with arrays,
// and especially not with arrays containing objects.
// So you need to:
// 1) Turn the result of dataseries.slice(7)  into an array with just the numbers
// (think of the .map() method)
// 2) destructure those numbers into the arguments of Math.min() and Math.max().

//how to build weather changing?
// In order to display multiple datapoints
// you want to render the location and the forcast seperately in two functions.
// However the forcast function you want to execute multiple times for each datapoint.
// Try using the forEach method on your array to do that.

// how to change first location to Tokyo from Hamburg?
