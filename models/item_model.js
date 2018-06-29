const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    itemName: String,
    itemSupplierProductName: String,
    itemQuantity: String,
    itemOption: String,
    itemSupplierName: String,
    itemShippingCompanyName: String,
    itemTracking: String,
    itemPrice: String
});

const Item = mongoose.model('item', itemSchema);

module.exports = Item;