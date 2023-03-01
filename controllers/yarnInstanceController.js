const YarnInstance = require("../models/yarninstance");
const Yarn = require("../models/yarn");
const Producers = require("../models/producer");
const async = require("async");
const { body, validationResult } = require("express-validator");

exports.instance_detail = (req, res, next) => {
  async.waterfall(
    [
      function(callback) {
        YarnInstance.findById(req.params.id)
          .populate("yarn")
          .exec((err, queryresult) => {
            if (err) {
              return next(err);
            }
            callback(null, queryresult);
          });
      },
      function(queryresult, callback) {
        Producers.findById(queryresult.yarn.producer).exec(
          (err, producerqueryresult) => {
            if (err) {
              return next(err);
            }
            callback(null, [queryresult, producerqueryresult]);
          }
        );
      },
    ],
    function(err, results) {
      if (err) {
        return next(err);
      }
      res.render("yarn_instance_detail", {
        title: "Yarn Colorway",
        yarninstance: results[0],
        producerdetails: results[1],
      });
    }
  );
};

exports.delete_get = (req, res, next) => {
  YarnInstance.findById(req.params.id)
    .populate("yarn")
    .exec((err, yarninstance) => {
      if (err) {
        return next(err);
      }
      if (yarninstance === null) {
        res.redirect("/inventory/yarn" + yarninstance.yarn._id);
      }
      res.render("yarn_instance_delete", {
        title: "Delete dyelot",
        yarninstance: yarninstance,
      });
    });
};

exports.delete_post = (req, res, next) => {
  YarnInstance.findByIdAndRemove(req.body.yarninstanceid, (err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/inventory/yarn/" + req.body.yarnid);
  });
};

exports.create_instance_get = (req, res, next) => {
  async.parallel(
    {
      findyarn(callback) {
        Yarn.findById(req.params.yarnid).populate("producer").exec(callback);
      },
      // if I only the yarn information on the instance, I won't have access to the producer info
      findyarninstances(callback) {
        YarnInstance.find({ yarn: req.params.yarnid }, null, {
          sort: { colorwayid: 1 },
        }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.findyarn === null) {
        res.redirect("/inventory/yarn");
      }
      res.render("yarn_instance_create", {
        title: "Add new colorway or dyelot",
        yarninfo: results.findyarn,
        yarninstances: results.findyarninstances,
      });
    }
  );
};

exports.create_instance_post = [
  body("dyelot")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Dyelot is required.")
    .isAlphanumeric()
    .withMessage("Dyelot must be letters and/or numbers."),
  body("colorway")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Colorway id is required")
    .isAlphanumeric()
    .withMessage("Colorway id must be letters and/or numbers."),
  body("stock")
    .trim()
    .isLength({ min: 1, max: 3 })
    .escape()
    .withMessage("Stock is required")
    .isNumeric({ no_symbols: true })
    .withMessage("Only integers are allowed"),

  (req, res, next) => {
    const errors = validationResult(req);

    async.parallel(
      {
        findyarninfo(callback) {
          Yarn.findById(req.params.yarnid).exec(callback);
        },
        checkfordyelot(callback) {
          YarnInstance.find({
            colorwayid: req.body.colorway,
            dyelot: req.body.dyelot,
          }).exec(callback);
        },
        findinstances(callback) {
          YarnInstance.find({ yarn: req.params.yarnid }, null, {
            sort: { colorwayid: 1 },
          }).exec(callback);
        },
      },
      (err, results) => {
        if (!errors.isEmpty()) {
          res.render("yarn_instance_create", {
            title: "Add new colorway or dyelot",
            curryarninstance: req.body,
            yarninfo: results.findyarninfo,
            yarninstances: results.findinstances,
            errors: errors.array(),
          });
          return;
        }
        if (err) {
          return next(err);
        }
        if (results.findyarninfo === null) {
          res.redirect("/inventory/yarn");
        }
        if (results.checkfordyelot !== null) {
          res.render("yarn_instance_create", {
            title: "Add new colorway or dyelot",
            curryarninstance: req.body,
            yarninfo: results.findyarninfo,
            yarninstances: results.findinstances,
            errors:
              "Error: Dyelot already exists. Update stock on that dyelot instead",
          });
          return;
        }
        const newyarninstance = new YarnInstance({
          yarn: results.findyarninfo,
          dyelot: req.body.dyelot,
          colorwayid: req.body.colorway,
          stock: req.body.stock,
        });
        newyarninstance.save((error) => {
          if (error) {
            return next(error);
          }
          res.redirect(newyarninstance.url);
        });
      }
    );
  },
];
