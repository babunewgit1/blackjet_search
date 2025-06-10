document.addEventListener("DOMContentLoaded", function () {
  // Initialize PAX blocks
  function initializePaxBlock(empaxWrapper) {
    const minusBtn = empaxWrapper.querySelector(".empax_minus");
    const plusBtn = empaxWrapper.querySelector(".empax_plus");
    const input = empaxWrapper.querySelector(".expaxinput");
    if (
      !input.value ||
      isNaN(parseInt(input.value, 10)) ||
      parseInt(input.value, 10) < 0
    ) {
      input.value = "0";
    }
    if (parseInt(input.value, 10) <= 0) {
      minusBtn.classList.add("disabled");
    } else {
      minusBtn.classList.remove("disabled");
    }
    plusBtn.addEventListener("click", function () {
      let currentValue = parseInt(input.value, 10) || 0;
      currentValue += 1;
      input.value = currentValue;
      if (currentValue > 0) {
        minusBtn.classList.remove("disabled");
      }
    });
    minusBtn.addEventListener("click", function () {
      let currentValue = parseInt(input.value, 10) || 0;
      if (currentValue > 0) {
        currentValue -= 1;
        input.value = currentValue;
        if (currentValue <= 0) {
          minusBtn.classList.add("disabled");
        }
      }
    });
  }

  // Initialize all PAX wrappers
  const empaxWrappers = document.querySelectorAll(".empax_wrapper");
  empaxWrappers.forEach(function (wrapper) {
    initializePaxBlock(wrapper);
  });

  // Initialize Algolia search
  const searchClient = algoliasearch(
    "ZSPO7HB4MN",
    "2a3621a18dca4f1fb757e9ddaea72440"
  );
  const index = searchClient.initIndex("Airports");

  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  const handleInput = debounce(function (event) {
    const input = event.target;
    if (!input.classList.contains("algolio_input")) return;
    const query = input.value.trim();
    const eminputBlock = input.closest(".eminputblock");
    const resultsContainer = eminputBlock.querySelector(".search-results");
    if (!resultsContainer) {
      console.warn("No .search-results container found for the input.");
      return;
    }

    if (query.length === 0) {
      resultsContainer.innerHTML = "";
      resultsContainer.style.display = "none";
      return;
    }

    // Perform Algolia search
    index
      .search(query)
      .then(({ hits }) => {
        // console.log("Algolia Search Results:", hits);
        if (hits.length > 0) {
          resultsContainer.innerHTML = hits
            .map(
              (hit) =>
                `<div class="port" tabindex="0">
              <div class="emfieldnamewrapper">
                <img
                  src="https://cdn.prod.website-files.com/6713759f858863c516dbaa19/6739f54808efbe5ead7a23c1_Screenshot_1-removebg-preview.avif"
                  alt="Location Icon"
                />
                <p class="emfieldname">${escapeHTML(hit["All Fields"])}</p>
                <p class="uniqueid">${escapeHTML(hit["unique id"])}</p>
                <p class="shortcode">${
                  hit["ICAO Code"]
                    ? escapeHTML(hit["ICAO Code"])
                    : hit["IATA Code"]
                    ? escapeHTML(hit["IATA Code"])
                    : hit["FAA Code"]
                    ? escapeHTML(hit["FAA Code"])
                    : ""
                }</p>
                <p class="cityname">${escapeHTML(hit["AirportCity"])}</p>
              </div>
            </div>`
            )
            .join("");
          resultsContainer.style.display = "block";
        } else {
          resultsContainer.innerHTML = "<p>No results found.</p>";
          resultsContainer.style.display = "block";
        }
      })
      .catch((err) => {
        console.error("Algolia search error:", err);
        resultsContainer.innerHTML = "<p>Error fetching results.</p>";
        resultsContainer.style.display = "block";
      });
  }, 300);

  // Function to handle click events on search results
  function handleClick(event) {
    const portElement = event.target.closest(".port");
    if (portElement) {
      const emfieldname = portElement.querySelector(".emfieldname").textContent;
      const uniqueid = portElement.querySelector(".uniqueid").textContent;
      const shortcode = portElement.querySelector(".shortcode").textContent;
      const citycode = portElement.querySelector(".cityname").textContent;

      // Find the corresponding input and .portid
      const eminputBlock = portElement.closest(".eminputblock");
      const input = eminputBlock.querySelector(".algolio_input");
      const portidElement = eminputBlock.querySelector(".portid");
      const shortElement = eminputBlock.querySelector(".airportshort");
      const airportCityName = eminputBlock.querySelector(".airportcity");
      input.value = emfieldname;
      portidElement.textContent = uniqueid;
      shortElement.textContent = shortcode;
      airportCityName.textContent = citycode;
      const resultsContainer = eminputBlock.querySelector(".search-results");
      resultsContainer.innerHTML = "";
      resultsContainer.style.display = "none";
    }
  }

  // Function to attach event listeners to a given .algolio_wrapper
  function attachListeners(algolioWrapper) {
    algolioWrapper.addEventListener("input", handleInput);
    algolioWrapper.addEventListener("click", handleClick);

    algolioWrapper.addEventListener("focusout", function (event) {
      setTimeout(() => {
        const relatedTarget = event.relatedTarget;

        if (!relatedTarget || !algolioWrapper.contains(relatedTarget)) {
          const allResults = algolioWrapper.querySelectorAll(".search-results");
          allResults.forEach((resultsContainer) => {
            resultsContainer.innerHTML = "";
            resultsContainer.style.display = "none";
          });
        }
      }, 100);
    });
  }

  // Select all existing .algolio_wrapper elements and attach listeners
  const algolioWrappers = document.querySelectorAll(".algolio_wrapper");
  algolioWrappers.forEach(attachListeners);

  // Hide search results when clicking outside any .algolio_wrapper
  document.addEventListener("click", function (event) {
    algolioWrappers.forEach((algolioWrapper) => {
      const isClickInside = algolioWrapper.contains(event.target);

      if (!isClickInside) {
        const allResults = algolioWrapper.querySelectorAll(".search-results");
        allResults.forEach((resultsContainer) => {
          resultsContainer.innerHTML = "";
          resultsContainer.style.display = "none";
        });
      }
    });
  });

  // send form data to session storage
  const oneWaySubmit = document.querySelector(".onewaysubmit");
  const roundTripSubmit = document.querySelector(".roundtrip");

  // code for round trip api submition
  oneWaySubmit.addEventListener("click", async function () {
    const formIdInput = document.querySelector(".fromcityname").textContent;
    const toIdInput = document.querySelector(".tocityname").textContent;
    const fromId = document.querySelector(".onewayformid").textContent;
    const toId = document.querySelector(".onewaytoid").textContent;
    const fromShortCode = document.querySelector(".fromshort").textContent;
    const toShortCode = document.querySelector(".toshort").textContent;
    const dateAsText = document.querySelector(".onewaydate").value;
    const timeAsText = "12:00 AM";
    const pax = document.querySelector(".onewaypax").value;
    const appDate = dateAsText;

    const combinedDateTime = `${dateAsText} ${timeAsText}`;
    const dateObject = new Date(combinedDateTime);

    const timeStamp = Math.floor(dateObject.getTime() / 1000);

    if (
      fromId &&
      toId &&
      dateAsText &&
      pax &&
      formIdInput &&
      toIdInput &&
      fromShortCode &&
      toShortCode
    ) {
      // Show preloader
      document.getElementById("preloader").style.display = "flex";

      try {
        // Call the API
        const apiResponse = await fetch(
          "https://operators-dashboard.bubbleapps.io/api/1.1/wf/webflow_one_way_flight_blackjet",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              "from airport id": fromId,
              "to airport id": toId,
              date_as_text: dateAsText,
              time_as_text: timeAsText,
              App_Out_Date_As_Text: appDate,
              pax: pax,
              date: timeStamp * 1000,
            }),
          }
        );

        if (!apiResponse.ok) {
          throw new Error("API request failed");
        }

        const apiData = await apiResponse.json();

        // Save flightRequestId to session storage
        if (apiData && apiData.response && apiData.response.flightrequest) {
          sessionStorage.setItem(
            "flightRequestId",
            apiData.response.flightrequest
          );
        }

        // Save the rest of the data as before
        const storeData = {
          way: "one way",
          fromId,
          toId,
          dateAsText,
          timeAsText,
          pax,
          appDate,
          timeStamp,
          formIdInput,
          toIdInput,
          fromShortCode,
          toShortCode,
        };

        sessionStorage.setItem("storeData", JSON.stringify(storeData));
        if (localStorage.getItem("aircraft_details")) {
          localStorage.removeItem("aircraft_details");
        }

        // Hide preloader and redirect
        document.getElementById("preloader").style.display = "none";
        window.location.href = `/aircraft`;
      } catch (err) {
        document.getElementById("preloader").style.display = "none";
        alert("There was an error processing your request. Please try again.");
        console.error(err);
      }
    } else {
      alert("Please fill up the form properly");
    }
  });

  // code for round trip api submition
  roundTripSubmit.addEventListener("click", function () {
    const formIdInput = document.querySelector(".rfromcityname").textContent;
    const toIdInput = document.querySelector(".rtocityname").textContent;

    const fromInputReturn = document.querySelector(".rtocityname").textContent;
    const toInputReturn = document.querySelector(".rfromcityname").textContent;

    const fromId = document.querySelector(".roundfromid").textContent;
    const toId = document.querySelector(".roundtoid").textContent;

    const returnFromId = document.querySelector(".roundtoid").textContent;
    const returnToId = document.querySelector(".roundfromid").textContent;

    const dateAsText = document.querySelector(".rdepdate").value;
    const returnDateAsText = document.querySelector(".rretdate").value;

    const fromShortCode = document.querySelector(".fromshortround").textContent;
    const toShortCode = document.querySelector(".toshortround").textContent;

    const timeAsText = "12:00 AM";
    const timeAsTextReturn = "12:00 AM";

    const pax = document.querySelector(".rpax").value;
    const paxReturn = pax;

    const appDate = dateAsText;
    const appDateReturn = returnDateAsText;

    const combinedDateTime = `${dateAsText} ${timeAsText}`;
    const dateObject = new Date(combinedDateTime);
    const timeStamp = Math.floor(dateObject.getTime() / 1000);

    const combinedDateTimeReturn = `${returnDateAsText} ${timeAsTextReturn}`;
    const dateObjectReturn = new Date(combinedDateTimeReturn);
    const timeStampReturn = Math.floor(dateObjectReturn.getTime() / 1000);

    if (
      formIdInput &&
      toIdInput &&
      dateAsText &&
      returnDateAsText &&
      pax &&
      fromId &&
      toId &&
      fromShortCode &&
      toShortCode
    ) {
      const storeData = {
        way: "round trip",
        formIdInput,
        toIdInput,
        fromInputReturn,
        toInputReturn,
        fromId,
        toId,
        returnFromId,
        returnToId,
        dateAsText,
        returnDateAsText,
        timeAsText,
        timeAsTextReturn,
        pax,
        paxReturn,
        appDate,
        appDateReturn,
        timeStamp,
        timeStampReturn,
        fromShortCode,
        toShortCode,
      };

      sessionStorage.setItem("storeData", JSON.stringify(storeData));
      if (localStorage.getItem("aircraft_details")) {
        localStorage.removeItem("aircraft_details");
      }
      window.location.href = `/aircraft`;
    } else {
      alert("Please fill up the form properly");
    }
  });
});
