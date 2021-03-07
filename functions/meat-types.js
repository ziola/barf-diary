const { meatTypesTable } = require('./helpers/airtable');
const { formatResponse } = require('./helpers/response');

function toMeatType(airtableData) {
  return {
    id: airtableData.id,
    name: airtableData.fields.Name,
  };
}

exports.handler = async (event) => {
  try {
    const meatTypes = await meatTypesTable.select().firstPage();
    const formattedMeatTypes = meatTypes.map(toMeatType);
    return formatResponse(formattedMeatTypes);
  } catch (err) {
    return formatResponse(err.message, err.statusCode || 500);
  }
};
