const {
  getFreezerItems,
  addFreezerItems,
  removeFreezerItem,
} = require('./freezer-methods/freezer');
const { formatResponse } = require('./helpers/response');

exports.handler = async (event) => {
  switch (event.httpMethod) {
    case 'GET':
      return await getFreezerItems(event);
    case 'POST':
      return await addFreezerItems(event);
    case 'PATCH':
      return await removeFreezerItem(event);
    default:
      return formatResponse(405, {});
  }
};
