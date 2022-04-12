// Requires
const puppeteer = require("puppeteer");

// Config / Options
const runHeadless = false;
const numberOfAdults = 2;
const dateToCheck = "2022-04-04"; // Do not put a Tuesday
const ajaxWaitInterval = 2000;
const timeoutInterval = 2000;

// --- Code below

// Times
const selectTimeValuesWeekends = [
  "11:00 AM",
  "12:30 PM",
  "5:00 PM",
  "6:30 PM",
  "8:00 PM",
];
const selectTimeValuesWeekdays = ["4:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"];

// const seenSet = new Set();
let checkingTimeState = 0;
const dateToCheckParsed = new Date(Date.parse(dateToCheck));
const dateToCheckDayIndex = dateToCheckParsed.getDay();

const selectTimeValues =
  dateToCheckDayIndex === 6 || dateToCheckDayIndex === 0
    ? selectTimeValuesWeekends
    : selectTimeValuesWeekdays;

(async () => {
  const browser = await puppeteer.launch({
    headless: runHeadless,
  });

  const page = await browser.newPage();

  await page.goto(
    "https://www.tablecheck.com/en/shops/tamafuji-us-kapahulu/reserve"
  );

  //   Select 2 Adults
  await page.select("#reservation_num_people_adult", `${numberOfAdults}`);

  //   Select Date
  // await page.click("#reservation_start_date");

  await page.$eval(
    "#reservation_start_date",
    (el, dateToCheck) => {
      el.value = dateToCheck;
      el.dispatchEvent(new Event("change"));
    },
    dateToCheck
  );

  await new Promise(r => setTimeout(r, ajaxWaitInterval));

  //   Find time values
  for (const [
    selectTimeValueIndex,
    selectTimeValue,
  ] of selectTimeValues.entries()) {
    selectTimeValues[selectTimeValueIndex] = await page.$$eval(
      "option",
      (options, selectTimeValue) =>
        options.find(o => o.innerText === selectTimeValue)?.value,
      selectTimeValue
    );
  }

  console.log(selectTimeValues);

  // const availability = await page.$("#availability");

  // while (true) {
  //   await page.select(
  //     "select#reservation_start_at_epoch",
  //     selectTimeValues[checkingTimeState++]
  //   );

  //   if (checkingTimeState === selectTimeValues.length) {
  //     checkingTimeState = 0;
  //   }

  //   let isCheckingOtherDates = true;
  //   let availabilityValue = "";

  //   // Wait for Checking Other Date
  //   while (isCheckingOtherDates) {
  //     await new Promise(r => setTimeout(r, ajaxWaitInterval));

  //     availabilityValue = (
  //       await page.evaluate(el => el.textContent, availability)
  //     ).trim();

  //     if (
  //       availabilityValue === "" ||
  //       !availabilityValue.includes("Checking other dates…")
  //     ) {
  //       isCheckingOtherDates = false;
  //     }
  //   }

  //   if (availabilityValue.includes("but")) {
  //     console.log(new Date().toLocaleString() + " --> " + availabilityValue);
  //   }

  //   // if (!seenSet.has(availabilityValue)) {
  //   //   console.log(new Date().toLocaleString() + " --> " + availabilityValue);
  //   //   seenSet.add(availabilityValue);
  //   // }

  //   await new Promise(r => setTimeout(r, timeoutInterval));
  // }

  // await browser.close();
})();
