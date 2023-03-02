const Producers = require("../models/producer");
const Yarn = require("../models/yarn");
const { body, validationResult } = require("express-validator");
const countryList = require("country-list");
const async = require("async");

exports.producers_list = (req, res, next) => {
  Producers.find().exec(function(err, list_producers) {
    if (err) {
      return next(err);
    }
    res.render("producers_list", {
      title: "Producers",
      producers_list: list_producers,
    });
  });
};

exports.producer_detail = (req, res, next) => {
  Producers.findById(req.params.id).exec((err, producerdetail) => {
    if (err) {
      return next(err);
    }
    res.render("producer_detail", {
      title: "Producer",
      producer_info: producerdetail,
    });
  });
};

exports.producer_delete_get = (req, res, next) => {
  async.parallel(
    {
      findproducer(callback) {
        Producers.findById(req.params.id).exec(callback);
      },
      lookforyarn(callback) {
        Yarn.find({ producer: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("producer_delete", {
        title: "Delete: ",
        producer: results.findproducer,
        yarnlist: results.lookforyarn,
      });
    }
  );
};

exports.producer_delete_post = (req, res, next) => {
  async.parallel(
    {
      findproducer(callback) {
        Producers.findById(req.body.producerid).exec(callback);
      },
      lookforyarn(callback) {
        Yarn.find({ producer: req.body.producerid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.lookforyarn.length > 0) {
        res.render("producer_delete", {
          title: "Delete: ",
          producer: results.findproducer,
          yarnlist: results.lookforyarn,
        });
        return;
      }
      Producers.findByIdAndRemove(req.body.producerid, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/inventory/producers");
      });
    }
  );
};

exports.producer_create_get = (req, res, next) => {
  res.render("producer_create", {
    title: "Add new producer",
    countries: countryList.getNames(),
  });
};

exports.producer_create_post = [
  body("brandname")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("You must specify a Brand name."),
  body("country").escape().optional({ checkFalsy: true }),
  body("contact")
    .trim()
    .escape()
    .optional({ checkFalsy: true })
    .isAlphanumeric("en-US", { ignore: " @+" })
    .withMessage("Only letters, numbers, @ and + are allowed."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("producer_create", {
        title: "Add new producer",
        countries: countryList.getNames(),
        currproducer: req.body,
        selected_country: req.body.country,
        errors: errors.array(),
      });
      return;
    }

    const newproducer = new Producers({
      brandname: req.body.brandname,
      country: req.body.country,
      contact: req.body.contact,
    });
    newproducer.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect(newproducer.url);
    });
  },
];

exports.producer_update_get = (req, res, next) => {
  Producers.findById(req.params.id).exec((err, producer) => {
    if (err) {
      return next(err);
    }
    if (producer === null) {
      const err = new Error("Producer not found");
      err.status = 404;
      return next(err);
    }
    res.render("producer_create", {
      title: "Edit producer",
      countries: countryList.getNames(),
      currproducer: producer,
      selected_country: producer.country,
    });
  });
};

exports.producer_update_post = [
  body("brandname")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("You must specify a Brand name."),
  body("country").escape().optional({ checkFalsy: true }),
  body("contact")
    .trim()
    .escape()
    .optional({ checkFalsy: true })
    .isAlphanumeric("en-US", { ignore: " @+" })
    .withMessage("Only letters, numbers, @ and + are allowed."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("producer_create", {
        title: "Edit producer",
        countries: countryList.getNames(),
        currproducer: req.body,
        selected_country: req.body.country,
        errors: errors.array(),
      });
      return;
    }

    const updatedproducer = new Producers({
      brandname: req.body.brandname,
      country: req.body.country,
      contact: req.body.contact,
      _id: req.params.id,
    });
    Producers.findByIdAndUpdate(
      req.params.id,
      updatedproducer,
      {},
      (err, theproducer) => {
        if (err) {
          return next(err);
        }
        res.redirect(updatedproducer.url);
      }
    );
  },
];
