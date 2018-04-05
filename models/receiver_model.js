const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const receiverSchema = new Schema({
    receiverName: String,
    receiverPhone: String,
    receiverZipcode: String,
    receiverAddress: String
});

const Receiver = mongoose.model('receiver', receiverSchema);

module.exports = Receiver;