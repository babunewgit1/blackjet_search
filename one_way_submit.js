// Helper function for reliable date handling
function createTimestamp(dateText) {
  if (!dateText) return null;
  try {
    const [year, month, day] = dateText.split("-").map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    const dateObject = new Date(Date.UTC(year, month - 1, day, 0, 0));
    if (isNaN(dateObject.getTime())) return null;
    // Convert to seconds for API
    return Math.floor(dateObject.getTime() / 1000);
  } catch (error) {
    console.error("Error creating timestamp:", error);
    return null;
  }
}

// Helper function to ensure valid date
function ensureValidDate(timestamp, dateText) {
  if (!timestamp || timestamp === 0) {
    // If timestamp is invalid, try to create one from dateText
    return createTimestamp(dateText);
  }
  return timestamp;
}

const oneWaySubmit = document.querySelector(".onewaysubmit");

oneWaySubmit.addEventListener("click", function () {
  const formIdInput = document.querySelector("input.onewayform").value;
  const toIdInput = document.querySelector("input.onewayto").value;
  const fromId = document.querySelector(".onewayformid").textContent;
  const toId = document.querySelector(".onewaytoid").textContent;
  const dateAsText = document.querySelector(".onewaydate").value;
  const timeAsText = "12:00 AM";
  const pax = document.querySelector(".onewaypax").value;
  const appDate = dateAsText;

  const timeStamp = createTimestamp(dateAsText);

  if (!timeStamp) {
    console.error("Invalid date:", dateAsText);
    alert("Please enter a valid date");
    return;
  }

  if (fromId && toId && dateAsText && pax && formIdInput && toIdInput) {
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
