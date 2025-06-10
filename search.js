// Get stored data from session storage
const getStoredData = JSON.parse(sessionStorage.getItem("storeData"));

// API endpoints
const ONE_WAY_API =
  "https://operators-dashboard.bubbleapps.io/api/1.1/wf/webflow_one_way_flight_blackjet";
const ROUND_TRIP_API =
  "https://operators-dashboard.bubbleapps.io/api/1.1/wf/webflow_round_trip_flight_blackjet";

// Function to handle airport item clicks
function handleAirportClick(airportId, storageKey) {
  if (airportId) {
    const currentData = JSON.parse(sessionStorage.getItem("storeData"));
    currentData[storageKey] = airportId;
    sessionStorage.setItem("storeData", JSON.stringify(currentData));
    window.location.reload();
  }
}

// Function to show loading screen
function showLoading() {
  const loadingScreen = document.createElement("div");
  loadingScreen.className = "loading-screen";
  loadingScreen.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
  `;
  document.body.appendChild(loadingScreen);
}

// Function to hide loading screen
function hideLoading() {
  const loadingScreen = document.querySelector(".loading-screen");
  if (loadingScreen) {
    loadingScreen.remove();
  }
}

// Function to make API call
async function makeApiCall() {
  try {
    showLoading(); // Show loading screen before API call

    if (!getStoredData) {
      console.error("No stored data found");
      hideLoading(); // Hide loading screen if no data
      return;
    }

    const apiUrl =
      getStoredData.way.toLowerCase() === "one way"
        ? ONE_WAY_API
        : ROUND_TRIP_API;

    // Prepare request body based on way type
    const requestBody =
      getStoredData.way.toLowerCase() === "one way"
        ? {
            "from airport id": getStoredData.fromId,
            "to airport id": getStoredData.toId,
            date_as_text: getStoredData.dateAsText,
            time_as_text: getStoredData.timeAsText,
            App_Out_Date_As_Text: getStoredData.appDate,
            pax: getStoredData.pax,
            date: getStoredData.timeStamp * 1000,
          }
        : {
            "out-dep airport id": getStoredData.fromId,
            "out-arr airport id": getStoredData.toId,
            "ret-dep airport id": getStoredData.returnFromId,
            "ret-arr airport id": getStoredData.returnToId,
            "out-dep date": getStoredData.timeStamp * 1000,
            "ret-date": getStoredData.timeStampReturn * 1000,
            "out-pax": getStoredData.pax,
            "ret-pax": getStoredData.paxReturn,
            Dep_date_as_text: getStoredData.dateAsText,
            Ret_date_as_text: getStoredData.returnDateAsText,
            Dep_time_as_text: getStoredData.timeAsText,
            Ret_time_as_text: getStoredData.timeAsTextReturn,
            App_Out_Date_As_Text: getStoredData.appDate,
            App_Ret_Date_As_Text: getStoredData.appDateReturn,
          };

    // Make API call
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const apiResponse = data.response;

    // Display aircraft details in ac_result_cnt div
    const acResultCnt = document.querySelector(".ac_result_cnt");
    const apiAircraft = apiResponse.aircraft;
    acResultCnt.innerHTML = "";
    if (acResultCnt && data.response && data.response.aircraft) {
      apiAircraft.forEach((aircraft) => {
        acResultCnt.innerHTML += `
          <div class="ap_aircraft">
            <div class="ap_aircraft_details">  
              <div class="apac_img">
                <img src="${aircraft.aircraft_image_image}" alt="" />
              </div>
              <div class="apac_details">
                <h4>${aircraft.category_text}</h4>
                <p>${aircraft.models_text}</p>
              </div>
              <div class="ap_aircraft_details_price">
                <div class="ap_aircraft_toptip">
                  <h4><sup>$</sup>${Math.round(
                    aircraft.price_number
                  ).toLocaleString()} </h4>
                  <div class="ap_aircraft_tip_text">
                  <span><img src="https://cdn.prod.website-files.com/66fa75fb0d726d65d059a42d/6825cd8e306cd13add181479_toltip.png" alt="" /></span>
                  <p>Total includes taxes and Government Imposed Passenger Fee and fees</p>
                  </div>
                </div>
                <p>${aircraft.flight_time_text}</p>
              </div>
            </div>
            <div class="ap_aircraft_message">
              <div class="ap_aircraft_message_left">
                <p>${aircraft.message_text}</p>
              </div>
              <div class="ap_aircraft_message_right">
                <button>Learn More</button>
              </div>
            </div>
            <div class="ap_aircraft_continue" style="display: none;">
              <a href="#">CoNtinue <img src="https://cdn.prod.website-files.com/66fa75fb0d726d65d059a42d/680d2633fe670f2024b6738a_arr.png" alt="" /></a>
            </div>
          </div>
        `;
      });

      // Add click event handlers after adding the aircraft elements
      document.querySelectorAll(".ap_aircraft").forEach((aircraft) => {
        aircraft.addEventListener("click", function () {
          const continueDiv = this.querySelector(".ap_aircraft_continue");
          continueDiv.style.display =
            continueDiv.style.display === "none" ? "block" : "none";
          this.classList.toggle("active");
        });
      });

      document
        .querySelectorAll(".ap_aircraft_message_right button")
        .forEach((button) => {
          button.addEventListener("click", function (e) {
            e.stopPropagation();
            alert("link clicked");
          });
        });
    }

    //! creating map start
    const fromAirport = {
      name: apiResponse.flight_legs[0].mobile_app_from_airport_name_short_text,
      code:
        apiResponse.flight_legs[0].mobile_app_from_airport_faa_code_text ||
        apiResponse.flight_legs[0].mobile_app_from_airport_iata_code_text ||
        apiResponse.flight_legs[0].mobile_app_from_airport_icao_code_text,
      coordinates: [
        apiResponse.flight_legs[0].mobile_app_from_longitude_number,
        apiResponse.flight_legs[0].mobile_app_from_latitude_number,
      ],
    };

    const toAirport = {
      name: apiResponse.flight_legs[0].mobile_app_to_airport_name_short_text,
      code:
        apiResponse.flight_legs[0].mobile_app_to_airport_faa_code_text ||
        apiResponse.flight_legs[0].mobile_app_to_airport_iata_code_text ||
        apiResponse.flight_legs[0].mobile_app_to_airport_icao_code_text,
      coordinates: [
        apiResponse.flight_legs[0].mobile_app_to_longitude_number,
        apiResponse.flight_legs[0].mobile_app_to_latitude_number,
      ],
    };

    // Initialize Mapbox map
    mapboxgl.accessToken =
      "pk.eyJ1IjoiYmFidTg3NjQ3IiwiYSI6ImNtOXF5dTEyYjF0MWIyam9pYjM4cmhtY28ifQ.z0mjjPx_wTlAA_wrzhzitA";

    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/light-v11",
      center: turf.midpoint(fromAirport.coordinates, toAirport.coordinates)
        .geometry.coordinates,
      zoom: 3,
      minZoom: 2,
    });

    map.on("load", () => {
      // 1. Generate "Other Airports" dots
      const numOtherAirports = 2000;
      const otherAirportsFeatures = [];
      const mapVisibleBounds = map.getBounds();
      const west = mapVisibleBounds.getWest();
      const south = mapVisibleBounds.getSouth();
      const east = mapVisibleBounds.getEast();
      const north = mapVisibleBounds.getNorth();

      for (let i = 0; i < numOtherAirports; i++) {
        otherAirportsFeatures.push(
          turf.randomPoint(1, { bbox: [west, south, east, north] }).features[0]
        );
      }
      const otherAirportsGeoJSON = turf.featureCollection(
        otherAirportsFeatures
      );

      map.addSource("other-airports", {
        type: "geojson",
        data: otherAirportsGeoJSON,
      });

      map.addLayer({
        id: "other-airports-layer",
        type: "circle",
        source: "other-airports",
        paint: {
          "circle-radius": 1.5,
          "circle-color": "#777777",
          "circle-opacity": 0.6,
        },
      });

      // 2. Create the Flight Path
      const route = turf.greatCircle(
        turf.point(fromAirport.coordinates),
        turf.point(toAirport.coordinates),
        { npoints: 100 }
      );

      map.addSource("flight-path", {
        type: "geojson",
        data: route,
      });

      map.addLayer({
        id: "flight-path-layer",
        type: "line",
        source: "flight-path",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#000000",
          "line-width": 2,
          "line-dasharray": [2, 2],
        },
      });

      // 3. Add Airplane Icon
      map.loadImage("airplane.svg", (error, image) => {
        if (error) throw error;
        if (!map.hasImage("airplane-icon")) {
          map.addImage("airplane-icon", image, { sdf: false });
        }

        const routeDistance = turf.length(route);
        const airplanePositionPoint = turf.along(route, routeDistance * 0.8);
        const pointSlightlyBefore = turf.along(route, routeDistance * 0.79);
        const bearing = turf.bearing(
          pointSlightlyBefore,
          airplanePositionPoint
        );

        map.addSource("airplane-source", {
          type: "geojson",
          data: airplanePositionPoint,
        });

        map.addLayer({
          id: "airplane-layer",
          type: "symbol",
          source: "airplane-source",
          layout: {
            "icon-image": "airplane-icon",
            "icon-size": 1,
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
            "icon-rotate": bearing - 90,
          },
        });
      });

      // 4. Custom Airport Markers
      const elFrom = document.createElement("div");
      elFrom.className = "airport-marker";
      elFrom.innerHTML = `
        <div class="airport-info">
          <svg class="plane-icon" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
          ${fromAirport.name}
        </div>
        <div class="airport-code">${fromAirport.code}</div>
      `;
      new mapboxgl.Marker(elFrom, { offset: [55, 0] })
        .setLngLat(fromAirport.coordinates)
        .addTo(map);

      const elTo = document.createElement("div");
      elTo.className = "airport-marker";
      elTo.innerHTML = `
        <div class="airport-info">
          <svg class="plane-icon" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
          ${toAirport.name}
        </div>
        <div class="airport-code">${toAirport.code}</div>
      `;
      new mapboxgl.Marker(elTo, { offset: [45, 0] })
        .setLngLat(toAirport.coordinates)
        .addTo(map);

      // 5. Add filled circles for origin and destination airports
      map.addSource("origin-dest-points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            turf.point(fromAirport.coordinates),
            turf.point(toAirport.coordinates),
          ],
        },
      });
      map.addLayer({
        id: "origin-dest-circles",
        type: "circle",
        source: "origin-dest-points",
        paint: {
          "circle-radius": 5,
          "circle-color": "#000000",
          "circle-stroke-color": "#FFFFFF",
          "circle-stroke-width": 1.5,
        },
      });

      // 6. Fit map to bounds
      const flightPathBounds = new mapboxgl.LngLatBounds();
      route.geometry.coordinates.forEach((coord) => {
        flightPathBounds.extend(coord);
      });
      map.fitBounds(flightPathBounds, {
        padding: { top: 100, bottom: 100, left: 150, right: 150 },
      });
    });
    //! creating map enddata-id

    //? Code for right side content - start
    const departureArea = document.querySelector(".ac_dep_loop");
    const arrivalArea = document.querySelector(".ac_arive_loop");
    const departureAirport = data.response.other_departure_airports;
    const arrivalAirport = data.response.other_arrival_airports;

    console.log("arrivalAirport", arrivalAirport);

    if (departureArea && data.response && departureAirport) {
      departureArea.innerHTML = "";
      // Sort by distance (ascending)
      departureAirport
        .slice() // create a shallow copy to avoid mutating the original array
        .sort((a, b) => {
          // Handle missing or non-numeric values gracefully
          const distA =
            typeof a.distance_to_original_departure_airport_number === "number"
              ? a.distance_to_original_departure_airport_number
              : Infinity;
          const distB =
            typeof b.distance_to_original_departure_airport_number === "number"
              ? b.distance_to_original_departure_airport_number
              : Infinity;
          return distA - distB;
        })
        .forEach((depAirport) => {
          const isActive =
            getStoredData &&
            getStoredData.fromId === depAirport.airport_id_text;
          departureArea.innerHTML += `
            <div class="depair_item depair_item_click ${
              isActive ? "active" : ""
            }" data-id="${depAirport.airport_id_text}">
              <div class="short_code">
                <p>${
                  depAirport.faa_code_text ||
                  depAirport.icao_code_text ||
                  depAirport.iata_code_text ||
                  "N/A"
                }
              </div>
              <div class="depair_item_wrapper">
                <div class="depair_item_left">
                <h3>${depAirport.airport_name_short_text}</h3>
                <p>
                  ${depAirport.location_label_text} <span></span>
                  ${
                    typeof depAirport.distance_to_original_departure_airport_number ===
                    "number"
                      ? depAirport.distance_to_original_departure_airport_number.toFixed(
                          1
                        )
                      : "N/A"
                  } mi
                </p>
              </div>
              <div class="depair_item_right">
                <p>$${
                  depAirport.light_jet_price_number
                    ? depAirport.light_jet_price_number.toLocaleString()
                    : "N/A"
                }</p>
              </div>
              </div>
            </div>
          `;
        });

      // Add click event listeners to departure items
      document.querySelectorAll(".depair_item_click").forEach((item) => {
        item.addEventListener("click", function () {
          // Remove active class from all departure items
          document
            .querySelectorAll(".depair_item_click")
            .forEach((i) => i.classList.remove("active"));
          // Add active class to clicked item
          this.classList.add("active");
          const airportId = this.getAttribute("data-id");
          handleAirportClick(airportId, "fromId");
        });
      });
    }

    if (arrivalArea && data.response && arrivalAirport) {
      arrivalArea.innerHTML = "";
      // Sort by distance (ascending)
      arrivalAirport
        .slice() // create a shallow copy to avoid mutating the original array
        .sort((a, b) => {
          // Handle missing or non-numeric values gracefully
          const distA =
            typeof a.distance_to_original_departure_airport_number === "number"
              ? a.distance_to_original_departure_airport_number
              : Infinity;
          const distB =
            typeof b.distance_to_original_departure_airport_number === "number"
              ? b.distance_to_original_departure_airport_number
              : Infinity;
          return distA - distB;
        })
        .forEach((arrAirport) => {
          const isActive =
            getStoredData && getStoredData.toId === arrAirport.airport_id_text;
          arrivalArea.innerHTML += `
            <div class="depair_item airval_item_click ${
              isActive ? "active" : ""
            }" data-id="${arrAirport.airport_id_text}">
              <div class="short_code">
                <p>${
                  arrAirport.faa_code_text ||
                  arrAirport.icao_code_text ||
                  arrAirport.iata_code_text ||
                  "N/A"
                }
              </div>
              <div class="depair_item_wrapper">
                <div class="depair_item_left">
                <h3>${arrAirport.airport_name_short_text}</h3>
                <p>
                  ${arrAirport.location_label_text} <span></span>
                  ${
                    typeof arrAirport.distance_to_original_departure_airport_number ===
                    "number"
                      ? arrAirport.distance_to_original_departure_airport_number.toFixed(
                          1
                        )
                      : "N/A"
                  } mi
                </p>
              </div>
              <div class="depair_item_right">
                <p>$${
                  arrAirport.light_jet_price_number
                    ? arrAirport.light_jet_price_number.toLocaleString()
                    : "N/A"
                }</p>
              </div>
              </div>
            </div>
          `;
        });

      // Add click event listeners to arrival items
      document.querySelectorAll(".airval_item_click").forEach((item) => {
        item.addEventListener("click", function () {
          // Remove active class from all arrival items
          document
            .querySelectorAll(".airval_item_click")
            .forEach((i) => i.classList.remove("active"));
          // Add active class to clicked item
          this.classList.add("active");
          const airportId = this.getAttribute("data-id");
          handleAirportClick(airportId, "toId");
        });
      });
    }

    //? Code for right side content - end

    return { data, fromAirport, toAirport };
  } catch (error) {
    console.error("Error making API call:", error);
    hideLoading(); // Hide loading screen on error
    throw error;
  } finally {
    hideLoading(); // Hide loading screen after API call completes
  }
}

// Call the API when the page loads
document.addEventListener("DOMContentLoaded", () => {
  makeApiCall().catch((error) => {
    console.error("Failed to make API call:", error);
  });
});
