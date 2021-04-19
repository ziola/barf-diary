const { freezerTable } = require("../helpers/airtable");
const { formatResponse } = require("../helpers/response");

function toFreezerItem(airtableData) {
  return {
    id: airtableData.id,
    name: airtableData.fields.Name,
    amount: airtableData.fields.Amount,
    type: airtableData.fields.Type,
    meatTypeName: airtableData.fields["Name (from Type)"],
    meatType: airtableData.fields["Type (from Type)"][0],
  };
}

function fromFreezerItem(data) {
  return {
    Name: data.name,
    Amount: data.amount,
    Type: [data.type],
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
    const formattedFreezerItems = frezeerItems.map(toFreezerItem);
    const grouppedFreezerItems = frezeerItems.reduce((groups, aItem) => {
      const item = toFreezerItem(aItem);
      if (!groups[item.meatType]) {
        groups[item.meatType] = {
          name: item.meatTypeName,
          items: [],
          amount: 0,
        };
      }
      const group = groups[item.meatType];
      group.items.push(item);
      group.amount += item.amount;
      return groups;
    }, {});
    return formatResponse(grouppedFreezerItems);
  } catch (err) {
    return formatResponse({ error: err.message }, err.statusCode || 500);
  }
}

async function addFreezerItems(event) {
  try {
    const itemFromRequest = JSON.parse(event.body);
    const createdItem = await freezerTable.create([
      { fields: fromFreezerItem(itemFromRequest) },
    ]);
    const freezerItems = createdItem.map(toFreezerItem);
    return formatResponse(freezerItems[0]);
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

module.exports = {
  getFreezerItems,
  addFreezerItems,
  removeFreezerItem,
};
