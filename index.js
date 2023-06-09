/* eslint-disable comma-dangle */
/* eslint-disable implicit-arrow-linebreak */

const express = require('express');

const app = express();
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const Person = require('./models/person');

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
};

const isPhoneNumberValid = (phoneNumber) => {
  const phoneNumberRegex = /^\d{2,3}-\d{6,}$/;
  return phoneNumberRegex.test(phoneNumber);
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }
  return next(error);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(express.static('build'));
// app.use(morgan('tiny')); // is somewhat duplicated with the following code

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get('/info', (request, response) => {
  Person.find({}).then((persons) => {
    const numPerson = persons.length;
    const date = new Date();
    response.send(
      `<div><p>PhoneBook has info for ${numPerson} people</p><p>${date}</p></div>`
    );
  });
});

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;

  // Which will cause our event handler to be called with the new modified document
  // instead of the original.
  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.use(
  morgan(
    (tokens, req, res) =>
      [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'),
        '-',
        tokens['response-time'](req, res),
        'ms',
        JSON.stringify(req.body),
        // eslint-disable-next-line comma-dangle
      ].join(' ')
    // eslint-disable-next-line function-paren-newline
  )
);

// const unknownEndpoint = (req, res) => {
//   res.status(404).send({ error: 'unknown endpoint' });
// };

// app.use(unknownEndpoint);

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      response.json(person);
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post('/api/persons', (request, response, next) => {
  const { body } = request;

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing',
    });
  }
  if (!body.number) {
    return response.status(400).json({
      error: 'number missing',
    });
  }
  if (!isPhoneNumberValid(body.number)) {
    return response.status(400).json({
      error:
        'Invalid phone number. Phone number must have a length of 8 or more and be in the format XX-XXXXXXX.',
    });
  }
  Person.findOne({ name: body.name })
    .then((existingPerson) => {
      if (existingPerson) {
        // Person already exists, update the phone number
        const transformedPerson = { ...existingPerson };
        transformedPerson.number = body.number;
        transformedPerson
          .save()
          .then((updatedPerson) => {
            response.json(updatedPerson);
          })
          .catch((error) => next(error));
      } else {
        // Person does not exist, create a new entry
        const person = new Person({
          name: body.name,
          number: body.number,
        });

        person
          .save()
          .then((savedPerson) => {
            response.json(savedPerson);
          })
          .catch((error) => next(error));
      }
    })
    .catch((error) => next(error));
  return null;
});

app.use(unknownEndpoint);
app.use(errorHandler);

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
