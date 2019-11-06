'use strict';

const mongoose = require('mongoose');

const image = new mongoose.Schema({
  title: { type: String, required: true },
  user_id: { type: String, required: true, unique: true },
  description: { type: String },
  url: { type: String, required: true },
  created_at: { type: Date, required: false },
});

const ImageModel = mongoose.model('image', image);

module.exports = ImageModel;
