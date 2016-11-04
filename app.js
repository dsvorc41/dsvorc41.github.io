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
                alert("No data found! Try again with different spelling and punctuation. Try to capitalize first letter, add a comma and space (e.g. Bristol, United Kingdom)");
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
    //3. we now add the event listener to trigger the rest of our code once the DOM content has loaded (the document is ready)
document.addEventListener('DOMContentLoaded', function() {
    //4. we declare all variables first, so any function can later access them    
    var destinationCity = "";
    //var mapsAPI = "";
    var weatherAPI = "";
    var WikiArticle = "";
    var WikiImage = "";
    var destinationStateOrCountry = "";

    //5. we now select appropriate elements by ID from the index.html
    //6. and add the even listner for input in order to populate 
    //7. the variables we declared in step 2 above
    var destinationCityInput = document.querySelector("#destinationCity");
    destinationCityInput.addEventListener('keydown', function(event) {
        var key = event.keyCode || event.charCode;

        if (key === 8 || key === 46) {
            destinationCity = destinationCity.slice(0, destinationCity.length - 1);
        } else if (key >= 65 && key <= 90 || key === 32) {
            destinationCity += String.fromCharCode(key);
        }

        function toTitleCase(str) {
            return str.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }

        destinationCity = toTitleCase(destinationCity);

    });

    var destinationStateOrCountryInput = document.querySelector("#stateOrCountry");
    destinationStateOrCountryInput.addEventListener('keydown', function() {

        var key = event.keyCode || event.charCode;

        if (key === 8 || key === 46) {
            destinationStateOrCountry = destinationStateOrCountry.slice(0, destinationStateOrCountry.length - 1);
        } else if (key >= 65 && key <= 90 || key === 32) {
            destinationStateOrCountry += String.fromCharCode(key);
        }

        function toTitleCase(str) {
            return str.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }

        destinationStateOrCountry = toTitleCase(destinationStateOrCountry);

    });
    //8. we now select the submit button
    //9. add the event listener for click on the submit button
    //10. and now we can perform the functions with the variables gathered in steps 1-5.
    var submitButton = document.querySelector("#submit");
    submitButton.addEventListener('click', function() {
        //11. we now complete the API request links by adding the necessary values
        // from the user input into the appropriate spots in the query string (varies for each API)
        weatherAPI = "https://api.wunderground.com/api/bb3eb942efe7ac14/conditions/q/" + destinationStateOrCountry + "/" + destinationCity + ".json";
       
        //12. now we initiate the XML request (to get API data)
        //we'll first get the weather data
        var getApiData = function(url) {
                var request = new XMLHttpRequest();
                request.open('GET', url, true);
                request.onload = function(e) {
                    if (request.readyState === 4) {
                        if (request.status === 200) {
                            formatWeatherData(request.responseText);
                        } else {
                            alert(request.statusText);
                        }
                    }

                };
                request.send(null);
            }
            //13. we recieved the JSONstring from the weather API request, and now we need to format the data
            //and add it to appropriate place index the index.html
        var formatWeatherData = function(jsonString) {

                //13a. here we parse the jsonstring recieved from API and asign it to a variable (object);
                var weatherObject = JSON.parse(jsonString);
                //13b. selecting the appropriate elements from index.html by their id name
                var city = document.querySelector("#wCity");
                var localTime = document.querySelector("#wlocalTime");
                var temp = document.querySelector("#wTemp");

                var pressure = document.querySelector("#wPressure");
                var humidity = document.querySelector("#wHumidity");
                var wind = document.querySelector("#wWind");
                var icon = document.querySelector("#wIcon");
                var lastUpdated = document.querySelector("#wLastUpdated");

                //13c. assigning values from the weatherobject(parsed string we recieved from API request) to
                //appropriate elements in the index.html
                city.innerHTML = weatherObject["current_observation"]["display_location"]["full"];
                localTime.innerHTML = weatherObject["current_observation"]["local_time_rfc822"];
                temp.innerHTML = weatherObject["current_observation"]["temperature_string"];
                pressure.innerHTML = weatherObject["current_observation"]["pressure_mb"] + " mbar";
                humidity.innerHTML = weatherObject["current_observation"]["relative_humidity"];
                ""
                wind.innerHTML = weatherObject["current_observation"]["wind_string"];
                icon.src = weatherObject["current_observation"]["icon_url"];
                lastUpdated.innerHTML = weatherObject["current_observation"]["observation_time"];

                var latitude = weatherObject["current_observation"]["observation_location"]["latitude"];
                var longitude = weatherObject["current_observation"]["observation_location"]["longitude"];

                mapsAPI = "https://www.google.com/maps/embed/v1/place?key=AIzaSyDBwNdqeYTYxY0kDNgv2ty9lykzQSgOwJ8&q=" + latitude + "," + longitude + "&zoom=12";
                embededMap.src = mapsAPI;
            }

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
        getApiData(weatherAPI);

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
