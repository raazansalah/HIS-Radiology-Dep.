const Complain = require('./../models/complainModel');
const factory = require('./../controllers/handleController');

exports.getAllComplains = factory.getAll(Complain);
exports.getComplain = factory.getOne(Complain);
exports.createComplain = factory.createOne(Complain);
exports.updateComplain = factory.updateOne(Complain);
exports.deleteComplain = factory.deleteOne(Complain);
