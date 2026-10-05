// main.js
const { Actor } = require("apify");
const { default: axios } = require("axios");

Actor.main(async () => {
  try {
    // 1. Get input from Apify task / API
    const rawInput = (await Actor.getInput()) || {};

    const input = {

      ...rawInput,

      includeKeyword: rawInput.includeKeyword || "software engineer",

      countryName: rawInput.countryName || "uk",

      locationName: rawInput.locationName || "London",

      pagesToFetch: rawInput.pagesToFetch || 1,

      datePosted: rawInput.datePosted || "all",

    };
    console.log("Received input:", input);

    const allowedFields = [
      "includeKeyword",
      "locationName",
      "countryName",
      "pagesToFetch",
      "companyName",
      "jobType",
      "datePosted",
      "targetLocations",
    ];
    const unsupported = Object.keys(input).filter(
      (key) => !allowedFields.includes(key)
    );
    if (unsupported.length > 0) {
      throw new Error(
        `Unsupported parameter${unsupported.length > 1 ? "s" : ""}: ` +
          `${unsupported.join(", ")}. This Actor only supports: ` +
          `${allowedFields.join(", ")}.`
      );
    }

    const missingFields = ["includeKeyword", "locationName", "countryName"].filter(
      (field) => !input[field]
    );
    if (missingFields.length > 0) {
      throw new Error(
        `Missing required input field(s): ${missingFields.join(", ")}. This Actor ` +
          "expects includeKeyword, locationName, countryName, pagesToFetch " +
          "(optional: companyName, jobType, datePosted) -- check your input " +
          "against the Actor's input schema."
      );
    }
        const { userIsPaying } = Actor.getEnv();
    const isFreeUser = !userIsPaying;

    // 2. Call your external API
    const res = await axios.post("https://api.orgupdate.com/search-jobs-v1", {
      ...input,
      isFreeUser,
      source: "reed",
    });

    const jobs = res.data;

    // 3. Store results into Apify dataset
    await Actor.pushData(jobs);

    console.log(`✅ Saved ${jobs.length || 0} jobs to dataset`);
    // Actor ends automatically when main() resolves
  } catch (err) {
    console.error("❌ Job search failed:", err.message);
    throw err; // Actor will be marked as FAILED in console
  }
});
