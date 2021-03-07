const { freezerTable } = require('../helpers/airtable');
const { formatResponse } = require('../helpers/response');

function toFreezerItem(airtableData) {
  return {
    id: airtableData.id,
    date: airtableData.fields.Date,
    name: airtableData.fields.Name,
    amount: airtableData.fields.Amount,
    meatTypeId: airtableData.fields.Type,
    meatTypeName: airtableData.fields['Name (from Type)'],
    size: airtableData.fields.Size,
  };
}

async function getFreezerItems(event) {
  try {
    const frezeerItems = await freezerTable.select().firstPage();
    const formattedFreezerItems = frezeerItems.map(toFreezerItem);
    return formatResponse({ items: formattedFreezerItems });
  } catch (err) {
    return formatResponse({ error: err.message }, err.statusCode ?? 500);
  }
}

async function addFreezerItems(event) {
  try {
    const itemFromRequest = JSON.parse(event.body);
    const createdItem = await freezerTable.create([
      { fields: itemFromRequest },
    ]);
    const freezerItems = createdItem.map(toFreezerItem);
    return formatResponse({ items: freezerItems });
  } catch (err) {
    return formatResponse({ error: err }, 500);
  }
}

async function removeFreezerItem(event) {
  try {
    const itemFromRequest = JSON.parse(event.body);
    const freezerItem = await freezerTable.find(itemFromRequest.id);
    const newAmount = freezerItem.fields.Amount - 1;
    if (newAmount < 0) {
      return formatResponse({ error: 'No item in the freezer' }, 403);
    }
    const updatedItem = await freezerItem.updateFields({
      Amount: newAmount,
    });
    return formatResponse({ item: toFreezerItem(updatedItem) });
  } catch (err) {
    console.log(err);
    return formatResponse({ error: err }, 500);
  }
}

module.exports = {
  getFreezerItems,
  addFreezerItems,
  removeFreezerItem,
};
