//1. onFetchCOmpleteWikiArticle function has to be defined in the global scope
//data parameter is the actual object retrieved by the API request
var onFetchCompleteWikiArticle = function(data) {
		for (var k in data["query"]["pages"]) {
			//1a. if we get a successful response from the server we can process data
			if (data["query"]["pages"][k]["extract"]) {
				//1b. we assign the response text to a variable
				WikiArticle = (data["query"]["pages"][k]["extract"]);
				//1c. we select and unhide the elements that contain the fetched data - this happens after everything is assigned because this function gets called later in the document
				var showWikiArticle = document.querySelector(".wikipedia-article");
				showWikiArticle.classList.remove("hidden");
				var showWeatherAndMap = document.querySelector(".weather-and-map");
				showWeatherAndMap.classList.remove("hidden");

			//1aa. if there is no valid response, we alert the user to try different input
			} else {
				alert("No data found! Try again with different spelling. If you are searching for a city in United States, try typing a city followed by a coma, space, and state name - e.g. Portland, Oregon");
			}
		}

		//1e. we assign the text retireved from Wikipedia to an element in our HTML page.
		var articleString = document.querySelector("#article");
		articleString.innerHTML = WikiArticle;
	}
	//2. onFetchCompleteWikiImage function has to be defined in the global scope
	//data parameter is the actual object retrieved by the API request. It works on the same way as step 1.
var onFetchCompleteWikiImage = function(data) {
		for (var k in data["query"]["pages"]) {
			if (data["query"]["pages"][k]["thumbnail"]["source"]) {
				WikiImage = (data["query"]["pages"][k]["thumbnail"]["source"]);
			}
		}
		var articleImage = document.querySelector("#city-image");
		articleImage.src = WikiImage;
	}

var onFetchCompleteWeather = function(data) {
		var weatherObject = data;
		//13b. selecting the appropriate elements from index.html by their id name
		var city = document.querySelector("#wCity");
		var country = document.querySelector("#wCountry");
		var weatherDescription = document.querySelector("#wMainDescription");
		var tempCelsius = document.querySelector("#wTempCelsius");
		var tempFahrenheit = document.querySelector("#wTempFahrenheit");
		var pressure = document.querySelector("#wPressure");
		var humidity = document.querySelector("#wHumidity");
		var windSpeed = document.querySelector("#wWindSpeed");
		//13c. assigning values from the weatherobject(parsed string we recieved from API request) to
		//appropriate elements in the index.html
		city.innerHTML = weatherObject["name"];
		country.innerHTML = weatherObject["sys"]["country"];
		weatherDescription.innerHTML = (weatherObject["weather"][0]["description"]).replace(/\w\S*/g, function(txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
		tempCelsius.innerHTML = (weatherObject["main"]["temp"] - 273.15).toFixed(2) + String.fromCharCode(176) + " C";
		tempFahrenheit.innerHTML = ((weatherObject["main"]["temp"]) * 9 / 5 - 459.67).toFixed(2) + String.fromCharCode(176) + " F";
		pressure.innerHTML = weatherObject["main"]["pressure"] + " mbar";
		humidity.innerHTML = weatherObject["main"]["humidity"] + " %";
		windSpeed.innerHTML = weatherObject["wind"]["speed"] + " km/h";
	}

	//3. we now add the event listener to trigger the rest of our code once the DOM content has loaded (the document is ready)
document.addEventListener('DOMContentLoaded', function() {
	//4. we declare all variables first, so any function can later access them    
	var destinationCity = "";
	var mapsAPI = "";
	var weatherAPI = "";
	var WikiArticle = "";
	var WikiImage = "";
	//5. we now select appropriate elements by ID from the index.html
	//6. and add the even listner for input in order to populate 
	//7. the variables we declared in step 2 above
	var destinationCityInput = document.querySelector("#destinationCity");
	destinationCityInput.addEventListener('input', function() {
		destinationCity += this.value[this.value.length - 1];
	});
	//8. we now select the submit button
	//9. add the event listener for click on the submit button
	//10. and now we can perform the functions with the variables gathered in steps 1-5.
	var submitButton = document.querySelector("#submit");
	submitButton.addEventListener('click', function() {
		//11. we now complete the API request links by adding the necessary values
		// from the user input into the appropriate spots in the query string (varies for each API)
		weatherAPI = "http://api.openweathermap.org/data/2.5/weather?q=" + destinationCity + "&appid=99a1e4d3282a262069a4a5844e73f97c&callback=onFetchCompleteWeather";
		mapsAPI = "https://www.google.com/maps/embed/v1/place?key=AIzaSyDBwNdqeYTYxY0kDNgv2ty9lykzQSgOwJ8&q=" + destinationCity;
		//12. now we initiate the XML request (to get API data)
		//we'll first get the weather data
		/*var getApiData = function(url) {
				var request = new XMLHttpRequest();
				request.open('GET', url, true);
				request.onload = function(e) {
					if (request.readyState === 4) {
						if (request.status === 200) {
							formatWeatherData(request.responseText);
						} else {
							console.error(request.statusText);
						}
					}
				};
				request.send(null);
			}
			//13. we recieved the JSONstring from the weather API request, and now we need to format the data
			//and add it to appropriate place index the index.html
		var formatWeatherData = function(jsonString) {
				//13a. here we parse the jsonstring recieved from API and asign it to a variable (object);

			}*/
			//14. add the map data. this is more straightforward than steps 10 and 11
			// we already have the iframe element defined in the index.html
			// we just have to assign the proper url to the src atribute of the iframe element
		embededMap.src = mapsAPI;
		//15. Adding the wikipedia introductory paragraph by creating a dynamic script and using JSONP callback function to exctract the data
		//JSONP callback function (onFetchComplete) is defined in global scope, beyond even document-ready function since
		//the browser looks in the global scope for the callback function
		//*** this gets immediately invoked because we need the output of this function right away
		var getWikiArticle = function() {
			var tempscript = null;
			tempscript = document.createElement("script");
			tempscript.type = "text/javascript";
			tempscript.id = "tempscript";
			if (destinationCity === "New York") {
				destinationCity = "New York City";
			}
			if (destinationCity.indexOf(",") !== -1) {
				destinationCity = destinationCity.match(/[a-z,]/gi).join("").split(",");
				var res = [];
				for (var i = 0; i < destinationCity.length; i++) {
					res.push(destinationCity[i][0].toUpperCase() + destinationCity[i].slice(1).toLowerCase());
				}
				destinationCity = res.join(", ");
			}
			tempscript.src = "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=&explaintext=&format=json&titles=" + destinationCity + "&callback=onFetchCompleteWikiArticle";
			document.body.append(tempscript);
		}();

		//16. Adding the wikipedia article image. Works in the same way as 15.
		//*** this gets immediately invoked because we need the output of this function right away
		var getWikiImage = function() {
			var tempscript = null;
			tempscript = document.createElement("script");
			tempscript.type = "text/javascript";
			tempscript.id = "tempscript";
			if (destinationCity.indexOf(",") !== -1) {
				destinationCity = destinationCity.match(/[a-z,]/gi).join("").split(",");
				var res = [];
				for (var i = 0; i < destinationCity.length; i++) {
					res.push(destinationCity[i][0].toUpperCase() + destinationCity[i].slice(1).toLowerCase());
				}
				destinationCity = res.join(", ");
			}
			tempscript.src = "https://en.wikipedia.org/w/api.php?action=query&titles=" + destinationCity + "&prop=pageimages&format=json&pithumbsize=500&callback=onFetchCompleteWikiImage";
			document.body.append(tempscript);
		}();

		//16. Here we are done with Wikipedia, and are now making an XML request for weather data to Open Weather Map
		//the function was defined above, but we now invoke it with the fully formed weatherAPI string (API request URL)
			var getWeather = function() {
			var tempscript = null;
			tempscript = document.createElement("script");
			tempscript.type = "text/javascript";
			tempscript.id = "tempscript";
			
			tempscript.src = weatherAPI;
			document.body.append(tempscript);
		}();

		//17. empty all the variables so that new input can be properly recorded
		//i.e. start again with a clean slate
		
		destinationCityInput.value = "";
		destinationCity = "";

		//18. we now hide the input text box until user chooses to make another search
		var hideInput = document.querySelector("#submit-info");
		hideInput.classList.add("hidden");

		//19.We change our button text from "submit" to "search again"
		//now that the input box is hidden, the user can click "search again" to reset all the forms
		submitButton.innerHTML = "Search Again";

		//20. we add event handler to listen for click on "search again" button
		//after that happens, the button text goes back to "submit" and everything reloads
		//so the user can start the fresh search again!
		submitButton.addEventListener('click', function() {
			submitButton.innerHTML = "Submit";
			location.reload();
		});
	});
});