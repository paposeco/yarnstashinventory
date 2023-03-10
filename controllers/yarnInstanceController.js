const YarnInstance = require("../models/yarninstance");
const Yarn = require("../models/yarn");
const Producers = require("../models/producer");
const async = require("async");
const { body, validationResult } = require("express-validator");
require("dotenv").config();
const editingforms = process.env.EDIT_FORMS_KEY;

exports.instance_detail = (req, res, next) => {
  // turns out, you can populate a populated field. I'm leaving this here to remember where I began.
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
        title: results[1].brandname + " " + results[0].yarn.name,
        yarninstance: results[0],
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

exports.delete_post = [
  body("editformpass")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Password is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty() || req.body.editformpass !== editingforms) {
      YarnInstance.findById(req.body.yarninstanceid)
        .populate("yarn")
        .exec((err, yarninstance) => {
          if (err) {
            return next(err);
          }
          if (errors.isEmpty()) {
            res.render("yarn_instance_delete", {
              title: "Delete dyelot",
              yarninstance: yarninstance,
              errors: "Wrong password",
            });
            return;
          } else {
            res.render("yarn_instance_delete", {
              title: "Delete dyelot",
              yarninstance: yarninstance,
              errors: errors,
            });
            return;
          }
        });
    }
    YarnInstance.findByIdAndRemove(req.body.yarninstanceid, (err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/inventory/yarn/" + req.body.yarnid);
    });
  },
];

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
            yarn: req.params.yarnid,
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
          res.redirect("/inventory");
        }
        if (results.checkfordyelot.length > 0) {
          res.render("yarn_instance_create", {
            title: "Add new colorway or dyelot",
            curryarninstance: req.body,
            yarninfo: results.findyarninfo,
            yarninstances: results.findinstances,
            errors:
              "Error: Dyelot for this colorway already exists. Update stock on that dyelot instead",
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

exports.create_instance_yarnselector_get = (req, res, next) => {
  Yarn.find({})
    .populate("producer")
    .sort({ producer: 1 })
    .exec((err, results) => {
      if (err) {
        return next(err);
      }
      res.render("yarn_instance_create_select", {
        title: "Add colorway or dyelot",
        yarnavailable: results,
      });
    });
};

exports.create_instance_yarnselector_post = [
  body("selectyarn")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Yarn must be selected"),
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
        findcurryarn(callback) {
          Yarn.findById(req.body.selectyarn).exec(callback);
        },
        checkfordyelot(callback) {
          YarnInstance.find({
            yarn: req.body.selectyarn,
            colorwayid: req.body.colorway,
            dyelot: req.body.dyelot,
          }).exec(callback);
        },
        findyarn(callback) {
          Yarn.find({})
            .populate("producer")
            .sort({ producer: 1 })
            .exec(callback);
        },
      },
      (err, results) => {
        if (!errors.isEmpty()) {
          res.render("yarn_instance_create_select", {
            yarnavailable: results.findyarn,
            errors: errors.array(),
          });
          return;
        }
        if (err) {
          return next(err);
        }

        if (results.findcurryarn === null) {
          res.redirect("/inventory");
        }
        if (results.checkfordyelot.length > 0) {
          res.render("yarn_instance_create_select", {
            title: "Add colorway or dyelot",
            curryarninstance: req.body,
            yarnavailable: results.findyarn,
            errors:
              "Error: Dyelot for this colorway already exists. Update stock on that dyelot instead",
          });
          return;
        }
        const newyarninstance = new YarnInstance({
          yarn: req.body.selectyarn,
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

// selected option on error

exports.update_get = (req, res, next) => {
  async.waterfall(
    [
      function(callback) {
        YarnInstance.findById(req.params.yarnid)
          .populate({ path: "yarn", populate: { path: "producer" } })
          .exec((err, yarninstance) => {
            if (err) {
              return next(err);
            }
            callback(null, yarninstance);
          });
      },
      function(yarninstance, callback) {
        YarnInstance.find({ yarn: yarninstance.yarn }, null, {
          sort: { colorwayid: 1 },
        }).exec((err, yarninstancecollection) => {
          if (err) {
            return next(err);
          }
          callback(null, [yarninstance, yarninstancecollection]);
        });
      },
    ],
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results[0] === null) {
        const err = new Error("Yarn colorway or dyelot not found");
        err.status = 404;
        return next(err);
      }
      res.render("yarn_instance_create", {
        title: "Edit yarn colorway/dyelot",
        yarninfo: results[0].yarn,
        yarninstances: results[1],
        curryarninstance: results[0],
      });
    }
  );
};

exports.update_post = [
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
  body("editformpass")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Password is required"),

  (req, res, next) => {
    const errors = validationResult(req);

    async.parallel(
      {
        findyarninstance(callback) {
          YarnInstance.findById(req.params.yarnid)
            .populate({ path: "yarn", populate: { path: "producer" } })
            .exec(callback);
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
            title: "Edit colorway or dyelot",
            curryarninstance: req.body,
            yarninfo: results.findyarninstance.yarn,
            yarninstances: results.findinstances,
            errors: errors.array(),
          });
          return;
        }
        if (req.body.editformpass !== editingforms) {
          res.render("yarn_instance_create", {
            title: "Edit colorway or dyelot",
            curryarninstance: req.body,
            yarninfo: results.findyarninstance.yarn,
            yarninstances: results.findinstances,
            errors: "Wrong password",
          });
          return;
        }
        if (err) {
          return next(err);
        }
        if (results.findyarninstance === null) {
          res.redirect("/inventory/yarn");
        }
        const updatedyarninstance = new YarnInstance({
          yarn: results.findyarninstance.yarn,
          dyelot: req.body.dyelot,
          colorwayid: req.body.colorway,
          stock: req.body.stock,
          _id: req.params.yarnid,
        });
        YarnInstance.findByIdAndUpdate(
          req.params.yarnid,
          updatedyarninstance,
          {},
          (err, theinstance) => {
            if (err) {
              return next(err);
            }
            res.redirect(updatedyarninstance.url);
          }
        );
      }
    );
  },
];
