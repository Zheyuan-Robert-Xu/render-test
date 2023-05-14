const mongoose = require("mongoose");

if (process.argv.length !== 3 && process.argv.length !== 5) {
    console.log("Invalid command. Usage:");
    console.log("To add an entry: node mongo.js <password> <name> <number>");
    console.log("To list all entries: node mongo.js <password>");
    console.log("give password as argument");
    process.exit(1);
}

// the password created for the database user
const password = process.argv[2];

const url = `mongodb+srv://exerciseAdmin:${password}@cluster0.tkifrx6.mongodb.net/phoneBookApp?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const phoneBookSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", phoneBookSchema);

if (process.argv.length === 3) {
  // Display all entries
  console.log("phonebook:");
  Person.find({}).then((persons) => {
    persons.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
} else if (process.argv.length === 5) {
  // Add a new entry
  const name = process.argv[3];
  const number = process.argv[4];

  const person = new Person({
    name: name,
    number: number,
  });

  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  });
} 