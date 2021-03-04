const fetch = require('node-fetch');

const AIRTABLE_BASE_URL = "https://api.airtable.com";
const AIRTABLE_API_VERSION = "v0";
const MEAT_TYPES = "Meat-Types";

exports.handler = async (event) => {
  const { AIRTABLE_API_KEY, AIRTABLE_BARF_BASE_ID } = process.env;
  const meatTypesUrl = `${AIRTABLE_BASE_URL}/${AIRTABLE_API_VERSION}/${AIRTABLE_BARF_BASE_ID}/${MEAT_TYPES}`;

  try {
    const response = await fetch(meatTypesUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    });
    const meatTypes = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(meatTypes),
    };
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      body: JSON.stringify({
        error: err.message,
      }),
    };
  }
};
