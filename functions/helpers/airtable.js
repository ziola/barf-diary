const Airtable = require('airtable');

const { AIRTABLE_API_KEY, AIRTABLE_BARF_BASE_ID } = process.env;

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(
  AIRTABLE_BARF_BASE_ID
);

const TABLES = {
  MEAT_TYPES: 'Meat-Types',
  FREEZER: 'Freezer',
};

module.exports = {
  meatTypesTable: base.table(TABLES.MEAT_TYPES),
  freezerTable: base.table(TABLES.FREEZER),
};
