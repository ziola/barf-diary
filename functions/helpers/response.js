function formatResponse(response, statusCode = 200) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(response),
  };
}

module.exports = {
  formatResponse,
};
