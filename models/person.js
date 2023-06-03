const mongoose = require ("mongoose");

const Person = mongoose.model('Person',{
    fname: String,
    lname: String,
    email: { type: String, unique: true },
    score: Number,
    password: String,
    userType: String,
});

module.exports = Person