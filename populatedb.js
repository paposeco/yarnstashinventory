#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"');

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const async = require('async')
const Yarn = require('./models/yarn')
const YarnInstance = require('./models/yarninstance')
const Fiber = require('./models/fiber')
const Weight = require('./models/weight')
const Producer = require("./models/producer")


const mongoose = require('mongoose');
mongoose.set('strictQuery', false); // Prepare for Mongoose 7

const mongoDB = userArgs[0];

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

const yarns = []
const yarninstances = []
const fibers = []
const weights = []
const producers = []

function producerCreate(brandname, country, telephonenumber, cb) {
  producerdetail = {brandname: brandname}
  if (country != false) producerdetail.country = country
  if (telephonenumber != false) producerdetail.telephonenumber = telephonenumber
  
  const producer = new Producer(producerdetail);
       
  producer.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Producer: ' + producer);
    producers.push(producer)
    cb(null, producer)
  });
}

function fiberCreate(fibertype, cb){
    const fiber = new Fiber({fibertype: fibertype});
    fiber.save(function(err){
        if(err){
            cb(err, null);
            return;
        }
        console.log("New Fiber: " + fiber);
        fibers.push(fiber);
        cb(null, fiber);
    });
}

function weightCreate(yarnweight, cb){
    const weight = new Weight({weight: yarnweight});
    weight.save(function(err){
        if(err){
            cb(err, null);
            return;
        }
        console.log("New Weight: "+ weight);
        weights.push(weight);
        cb(null, weight);
    })
}

function yarnCreate(name, weight, fibertype, unitweight, meterage, price, producer, cb){
    yarndetail = {
        name: name,
        weight: weight,
        fibertype: fibertype,
        unitweight: unitweight,
        meterage: meterage,
        producer: producer
    }
    if(price !== false) yarndetail.price = price

    const yarn = new Yarn(yarndetail);
    yarn.save(function(err){
        if(err){
            cb(err, null)
            return
        }
        console.log("New Yarn: " + yarn);
        yarns.push(yarn);
        cb(null, yarn)
    })
}

function yarnInstanceCreate(yarn, dyelot, colorwayid, stock, cb){
    yarninstancedetail = {
        yarn: yarn,
        dyelot: dyelot,
        colorwayid: colorwayid,
        stock: stock
    }
    const yarninstance = new YarnInstance(yarninstancedetail);
    yarninstance.save(function(err){
        if(err){
            cb(err, null)
            return
        }
        console.log("New Yarn Instance: " + yarninstance);
        yarninstances.push(yarninstance)
        cb(null, book)
    })
}


function createGenreAuthors(cb) {
    async.series([
        function(callback) {
          authorCreate('Patrick', 'Rothfuss', '1973-06-06', false, callback);
        },
        function(callback) {
          authorCreate('Ben', 'Bova', '1932-11-8', false, callback);
        },
        function(callback) {
          authorCreate('Isaac', 'Asimov', '1920-01-02', '1992-04-06', callback);
        },
        function(callback) {
          authorCreate('Bob', 'Billings', false, false, callback);
        },
        function(callback) {
          authorCreate('Jim', 'Jones', '1971-12-16', false, callback);
        },
        function(callback) {
          genreCreate("Fantasy", callback);
        },
        function(callback) {
          genreCreate("Science Fiction", callback);
        },
        function(callback) {
          genreCreate("French Poetry", callback);
        },
        ],
        // optional callback
        cb);
}


function createBooks(cb) {
    async.parallel([
        function(callback) {
          bookCreate('The Name of the Wind (The Kingkiller Chronicle, #1)', 'I have stolen princesses back from sleeping barrow kings. I burned down the town of Trebon. I have spent the night with Felurian and left with both my sanity and my life. I was expelled from the University at a younger age than most people are allowed in. I tread paths by moonlight that others fear to speak of during day. I have talked to Gods, loved women, and written songs that make the minstrels weep.', '9781473211896', authors[0], [genres[0],], callback);
        },
        function(callback) {
          bookCreate("The Wise Man's Fear (The Kingkiller Chronicle, #2)", 'Picking up the tale of Kvothe Kingkiller once again, we follow him into exile, into political intrigue, courtship, adventure, love and magic... and further along the path that has turned Kvothe, the mightiest magician of his age, a legend in his own time, into Kote, the unassuming pub landlord.', '9788401352836', authors[0], [genres[0],], callback);
        },
        function(callback) {
          bookCreate("The Slow Regard of Silent Things (Kingkiller Chronicle)", 'Deep below the University, there is a dark place. Few people know of it: a broken web of ancient passageways and abandoned rooms. A young woman lives there, tucked among the sprawling tunnels of the Underthing, snug in the heart of this forgotten place.', '9780756411336', authors[0], [genres[0],], callback);
        },
        function(callback) {
          bookCreate("Apes and Angels", "Humankind headed out to the stars not for conquest, nor exploration, nor even for curiosity. Humans went to the stars in a desperate crusade to save intelligent life wherever they found it. A wave of death is spreading through the Milky Way galaxy, an expanding sphere of lethal gamma ...", '9780765379528', authors[1], [genres[1],], callback);
        },
        function(callback) {
          bookCreate("Death Wave","In Ben Bova's previous novel New Earth, Jordan Kell led the first human mission beyond the solar system. They discovered the ruins of an ancient alien civilization. But one alien AI survived, and it revealed to Jordan Kell that an explosion in the black hole at the heart of the Milky Way galaxy has created a wave of deadly radiation, expanding out from the core toward Earth. Unless the human race acts to save itself, all life on Earth will be wiped out...", '9780765379504', authors[1], [genres[1],], callback);
        },
        function(callback) {
          bookCreate('Test Book 1', 'Summary of test book 1', 'ISBN111111', authors[4], [genres[0],genres[1]], callback);
        },
        function(callback) {
          bookCreate('Test Book 2', 'Summary of test book 2', 'ISBN222222', authors[4], false, callback)
        }
        ],
        // optional callback
        cb);
}


function createBookInstances(cb) {
    async.parallel([
        function(callback) {
          bookInstanceCreate(books[0], 'London Gollancz, 2014.', false, 'Available', callback)
        },
        function(callback) {
          bookInstanceCreate(books[1], ' Gollancz, 2011.', false, 'Loaned', callback)
        },
        function(callback) {
          bookInstanceCreate(books[2], ' Gollancz, 2015.', false, false, callback)
        },
        function(callback) {
          bookInstanceCreate(books[3], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
        },
        function(callback) {
          bookInstanceCreate(books[3], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
        },
        function(callback) {
          bookInstanceCreate(books[3], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
        },
        function(callback) {
          bookInstanceCreate(books[4], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Available', callback)
        },
        function(callback) {
          bookInstanceCreate(books[4], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Maintenance', callback)
        },
        function(callback) {
          bookInstanceCreate(books[4], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Loaned', callback)
        },
        function(callback) {
          bookInstanceCreate(books[0], 'Imprint XXX2', false, false, callback)
        },
        function(callback) {
          bookInstanceCreate(books[1], 'Imprint XXX3', false, false, callback)
        }
        ],
        // Optional callback
        cb);
}



async.series([
    createGenreAuthors,
    createBooks,
    createBookInstances
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('BOOKInstances: '+bookinstances);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});




