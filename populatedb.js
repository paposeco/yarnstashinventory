#! /usr/bin/env node

console.log(
  'This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const async = require("async");
const Yarn = require("./models/yarn");
const YarnInstance = require("./models/yarninstance");
const Fiber = require("./models/fiber");
const Weight = require("./models/weight");
const Producer = require("./models/producer");

const mongoose = require("mongoose");
mongoose.set("strictQuery", false); // Prepare for Mongoose 7

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

const yarns = [];
const yarninstances = [];
const fibers = [];
const weights = [];
const producers = [];

function producerCreate(brandname, country, contact, cb) {
  producerdetail = { brandname: brandname };
  if (country != false) producerdetail.country = country;
  if (contact != false) producerdetail.contact = contact;

  const producer = new Producer(producerdetail);

  producer.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Producer: " + producer);
    producers.push(producer);
    cb(null, producer);
  });
}

function fiberCreate(fibertype, cb) {
  const fiber = new Fiber({ fibertype: fibertype });
  fiber.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Fiber: " + fiber);
    fibers.push(fiber);
    cb(null, fiber);
  });
}

function weightCreate(yarnweight, cb) {
  const weight = new Weight({ weight: yarnweight });
  weight.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Weight: " + weight);
    weights.push(weight);
    cb(null, weight);
  });
}

function yarnCreate(
  name,
  weight,
  fibercomposition,
  unitweight,
  meterage,
  price,
  producer,
  cb
) {
  yarndetail = {
    name: name,
    weight: weight,
    fibercomposition: fibercomposition,
    unitweight: unitweight,
    meterage: meterage,
    producer: producer,
  };
  if (price !== false) yarndetail.price = price;

  const yarn = new Yarn(yarndetail);
  yarn.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Yarn: " + yarn);
    yarns.push(yarn);
    cb(null, yarn);
  });
}

function yarnInstanceCreate(yarn, dyelot, colorwayid, stock, cb) {
  yarninstancedetail = {
    yarn: yarn,
    dyelot: dyelot,
    colorwayid: colorwayid,
    stock: stock,
  };
  const yarninstance = new YarnInstance(yarninstancedetail);
  yarninstance.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Yarn Instance: " + yarninstance);
    yarninstances.push(yarninstance);
    cb(null, yarninstance);
  });
}

function createProducer(cb) {
  async.series(
    [
      function (callback) {
        producerCreate("DROPS", "Norway", "+4723303220", callback);
      },
      function (callback) {
        producerCreate(
          "Rosa Pomar",
          "Portugal",
          "retrosaria@rosapomar.com",
          callback
        );
      },
      function (callback) {
        producerCreate(
          "Schachenmayr",
          "Germany",
          "vertrieb@mezcrafts.com",
          callback
        );
      },
      function (callback) {
        producerCreate(
          "De Rerum Natura",
          "France",
          "contact@dererumnatura.fr",
          callback
        );
      },
      function (callback) {
        producerCreate(
          "Noro Yarns",
          "Japan",
          "contact@noroyarns.com",
          callback
        );
      },
    ],
    cb
  );
}

function createWeightFiber(cb) {
  async.series(
    [
      function (callback) {
        weightCreate("Fingering", callback);
      },
      function (callback) {
        weightCreate("Sport", callback);
      },
      function (callback) {
        weightCreate("DK", callback);
      },
      function (callback) {
        weightCreate("Worsted", callback);
      },
      function (callback) {
        fiberCreate("Wool", callback);
      },
      function (callback) {
        fiberCreate("Nylon", callback);
      },
      function (callback) {
        fiberCreate("Silk", callback);
      },
      function (callback) {
        fiberCreate("Merino", callback);
      },
      function (callback) {
        fiberCreate("Cotton", callback);
      },
    ],
    cb
  );
}

function createYarn(cb) {
  async.series(
    [
      function (callback) {
        yarnCreate(
          "Merino Extra Fine",
          weights[2],
          [{ fibertype: fibers[3], percentage: 100 }],
          50,
          105,
          3.45,
          producers[0],
          callback
        );
      },
      function (callback) {
        yarnCreate(
          "Mondim",
          weights[0],
          [{ fibertype: fibers[0], percentage: 100 }],
          100,
          385,
          10.1,
          producers[1],
          callback
        );
      },
      function (callback) {
        yarnCreate(
          "Brusca",
          weights[2],
          [
            { fibertype: fibers[0], percentage: 50 },
            { fibertype: fibers[3], percentage: 50 },
          ],
          50,
          125,
          5.75,
          producers[1],
          callback
        );
      },
      function (callback) {
        yarnCreate(
          "Design Line by Arne & Carlos Lofoten Color 4 ply",
          weights[0],
          [
            { fibertype: fibers[0], percentage: 75 },
            { fibertype: fibers[1], percentage: 25 },
          ],
          100,
          420,
          9,
          producers[2],
          callback
        );
      },
      function (callback) {
        yarnCreate(
          "Gilliatt",
          weights[3],
          [{ fibertype: fibers[3], percentage: 100 }],
          100,
          250,
          13,
          producers[3],
          callback
        );
      },
      function (callback) {
        yarnCreate(
          "Melody",
          weights[0],
          [
            { fibertype: fibers[4], percentage: 50 },
            { fibertype: fibers[0], percentage: 17 },
            { fibertype: fibers[1], percentage: 17 },
            { fibertype: fibers[2], percentage: 16 },
          ],
          40,
          167,
          8,
          producers[4],
          callback
        );
      },
    ],
    cb
  );
}

function createYarnInstances(cb) {
  async.parallel(
    [
      function (callback) {
        yarnInstanceCreate(yarns[0], "3008", "6", 20, callback);
      },
      function (callback) {
        yarnInstanceCreate(yarns[0], "3020", "6", 10, callback);
      },
      function (callback) {
        yarnInstanceCreate(yarns[0], "3200", "1", 8, callback);
      },
      function (callback) {
        yarnInstanceCreate(yarns[1], "0510", "208", 3, callback);
      },
      function (callback) {
        yarnInstanceCreate(yarns[1], "0510", "100", 15, callback);
      },
      function (callback) {
        yarnInstanceCreate(yarns[1], "0718", "301", 5, callback);
      },
      function (callback) {
        yarnInstanceCreate(yarns[2], "0122/0409", "B", 30, callback);
      },
      function (callback) {
        yarnInstanceCreate(yarns[3], "273", "3880", 5, callback);
      },
      function (callback) {
        yarnInstanceCreate(yarns[5], "A", "6", 10, callback);
      },
      function (callback) {
        yarnInstanceCreate(yarns[5], "A", "11", 12, callback);
      },
    ],
    cb
  );
}

async.series(
  [createProducer, createWeightFiber, createYarn, createYarnInstances],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      console.log("yarnInstances: " + yarninstances);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
