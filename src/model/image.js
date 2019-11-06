'use strict';

const imageSchema = require('./image-schema.js');
const dataModel = require('./model.js');

class Image extends dataModel {}

module.exports = new Image(imageSchema);