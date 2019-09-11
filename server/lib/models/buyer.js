const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const buyerSCH = new Schema({
  DNI: String,
  phone: String,
  email: String,
  collection_id: String,
  preference_id: String,
  status: String,
  item: String,
  participations: Number
});

const Buyer = model('Buyer', buyerSCH);

module.exports = Buyer;