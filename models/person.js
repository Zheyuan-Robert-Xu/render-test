const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const url = process.env.MONGODB_URI;

console.log('connecting to', url);

mongoose
  .connect(url)
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: String,
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    const transformedObject = { ...returnedObject };
    transformedObject.id = transformedObject._id.toString();
    delete transformedObject._id;
    delete transformedObject.__v;
    return transformedObject;
  },
});

module.exports = mongoose.model('Person', personSchema);
