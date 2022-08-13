/**
 * Construct object for json response
 * @param {string} message Message string inside meta
 * @param {?Object} data Object included in data
 * @param {?Object} meta other data include in meta, Optional
 * @returns {object} constructed object for json response
 */
function responseConstruct(message, data, meta) {
  const schema = { meta: { message } };

  // Only assing data response if defined
  if (data) {
    schema.data = data;
  }

  // merge meta object with schema meta if exists
  if (meta) {
    schema.meta = { ...schema.meta, ...meta };
  }

  return schema;
}

module.exports = { responseConstruct };
