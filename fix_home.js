// Helper function for reliable date handling
function createTimestamp(dateText) {
  const [year, month, day] = dateText.split("-").map(Number);
  const dateObject = new Date(Date.UTC(year, month - 1, day, 0, 0));
  return dateObject.getTime(); // Returns milliseconds timestamp
}

const oneWaySubmit = document.querySelector(".onewaysubmit");
const roundTripSubmit = document.querySelector(".roundtrip");
const multiCitySubmit = document.querySelector(".multicity_submit");

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

// code for round trip api submition
roundTripSubmit.addEventListener("click", function () {
  const formIdInput = document.querySelector(".rfrom").value;
  const toIdInput = document.querySelector(".rto").value;

  const fromInputReturn = document.querySelector(".rto").value;
  const toInputReturn = document.querySelector(".rfrom").value;

  const fromId = document.querySelector(".roundfromid").textContent;
  const toId = document.querySelector(".roundtoid").textContent;

  const returnFromId = document.querySelector(".roundtoid").textContent;
  const returnToId = document.querySelector(".roundfromid").textContent;

  const dateAsText = document.querySelector(".rdepdate").value;
  const returnDateAsText = document.querySelector(".rretdate").value;

  const timeAsText = "12:00 AM";
  const timeAsTextReturn = "12:00 AM";

  const pax = document.querySelector(".rpax").value;
  const paxReturn = pax;

  const appDate = dateAsText;
  const appDateReturn = returnDateAsText;

  const timeStamp = createTimestamp(dateAsText);
  const timeStampReturn = createTimestamp(returnDateAsText);

  if (formIdInput && toIdInput && dateAsText && returnDateAsText && pax) {
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

// Submission logic for multi-city
multiCitySubmit.addEventListener("click", function () {
  const multiFormPort = document.querySelectorAll(".multicityform");
  const multiToPort = document.querySelectorAll(".multicityto");
  const multiFormId = document.querySelectorAll(".multicityformid");
  const multiToId = document.querySelectorAll(".multicitytoid");
  const multiDateAsText = document.querySelectorAll(".multicitydate");
  const multiPax = document.querySelectorAll(".multicitypax");
  const timeAsText = "12:00 AM";
  let multiUnixTime = [];

  multiDateAsText.forEach((item) => {
    if (item.value) {
      const timeStamp = createTimestamp(item.value);
      multiUnixTime.push(timeStamp);
    }
  });

  let checkFormPort = true;
  let storeFormPort = [];
  multiFormPort.forEach((item) => {
    if (item.value) {
      storeFormPort.push(item.value);
    } else {
      checkFormPort = false;
    }
  });

  let checkToPort = true;
  let storeToPort = [];
  multiToPort.forEach((item) => {
    if (item.value) {
      storeToPort.push(item.value);
    } else {
      checkToPort = false;
    }
  });

  let checkFormId = true;
  let storeFormId = [];
  multiFormId.forEach((item) => {
    if (item.textContent) {
      storeFormId.push(item.textContent);
    } else {
      checkFormId = false;
    }
  });

  let checkToId = true;
  let storeToId = [];
  multiToId.forEach((item) => {
    if (item.textContent) {
      storeToId.push(item.textContent);
    } else {
      checkToId = false;
    }
  });

  let checkDate = true;
  let storeDate = [];
  let storeAppDate = [];
  let storeTime = [];
  multiDateAsText.forEach((item) => {
    if (item.value) {
      storeDate.push(item.value);
      storeAppDate.push(item.value);
      storeTime.push("12:00 AM");
    } else {
      checkDate = false;
    }
  });

  let checkPax = true;
  let storePax = [];
  multiPax.forEach((item) => {
    if (item.value) {
      storePax.push(item.value);
    } else {
      checkPax = false;
    }
  });

  if (
    checkFormPort &&
    checkToPort &&
    checkFormId &&
    checkToId &&
    checkDate &&
    checkPax
  ) {
    const storeData = {
      way: "multi-city",
      fromId: storeFormId,
      toId: storeToId,
      dateAsText: storeDate,
      timeAsText: storeTime,
      pax: storePax,
      appDate: storeAppDate,
      timeStamp: multiUnixTime,
      formIdInput: storeFormPort,
      toIdInput: storeToPort,
    };

    sessionStorage.setItem("storeData", JSON.stringify(storeData));
    if (localStorage.getItem("aircraft_details")) {
      localStorage.removeItem("aircraft_details");
    }

    window.location.href = `/aircraft`;
  } else {
    alert("Please fill up the form properly.");
  }
});
