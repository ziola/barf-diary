const { freezerTable } = require("./helpers/airtable");
const { formatResponse } = require('./helpers/response');

exports.handler = async (event) => {
  switch (event.httpMethod) {
    case 'GET':
      return await getFreezerItems(event);
    // case 'POST':
    //   return await addFreezerItems(event);
    case 'PATCH':
      return await removeFreezerItem(event);
    default:
      return formatResponse(405, {});
  }
};

function toFreezerItem(airtableData) {
  return {
    id: airtableData.id,
    name: airtableData.fields.Name,
    amount: airtableData.fields.Amount,
    type: airtableData.fields.Type[0],
    meatTypeName: airtableData.fields["Name (from Type)"][0],
    meatType: airtableData.fields["Type (from Type)"][0],
  };
}

async function getFreezerItems(event) {
  try {
    const frezeerItems = await freezerTable
      .select({
        filterByFormula: "NOT(Amount <= 0)",
        sort: [{ field: "Type" }, { field: "Amount" }],
      })
      .firstPage();

    const grouppedItems = frezeerItems.reduce((groups, aItem) => {
      const item = toFreezerItem(aItem);
      if (!groups[item.meatType]) {
        groups[item.meatType] = {
          name: item.meatTypeName,
          items: [],
          amount: 0,
          id: item.meatType
        };
      }
      const group = groups[item.meatType];
      group.items.push(item);
      group.amount += item.amount;
      return groups;
    }, {});

    const formattedItems = Object.values(grouppedItems);

    return formatResponse(formattedItems);
  } catch (err) {
    return formatResponse({ error: err.message }, err.statusCode || 500);
  }
}

async function removeFreezerItem(event) {
  try {
    const itemFromRequest = JSON.parse(event.body);
    const freezerItem = await freezerTable.find(itemFromRequest.id);
    const newAmount = freezerItem.fields.Amount - 1;
    if (newAmount < 0) {
      return formatResponse({ error: "No item in the freezer" }, 403);
    }
    const updatedItem = await freezerItem.updateFields({
      Amount: newAmount,
    });
    return formatResponse(toFreezerItem(updatedItem));
  } catch (err) {
    console.log(err);
    return formatResponse({ error: err }, 500);
  }
}