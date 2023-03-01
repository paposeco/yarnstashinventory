const Yarn = require("../models/yarn");
const YarnInstance = require("../models/yarninstance");
const Producer = require("../models/producer");
const Weight = require("../models/weight");
const Fiber = require("../models/fiber");
const async = require("async");
const { body, validationResult } = require("express-validator");

exports.index = (req, res) => {
  async.parallel(
    {
      yarn_count(callback) {
        Yarn.countDocuments({}, callback);
      },
      yarn_instances_list(callback) {
        YarnInstance.find({}, callback);
      },
    },
    (err, results) => {
      /* if(err){
       *   return next(err)
       * } */ //if there's an error, it will be rendered on the page
      res.render("index", {
        title: "Yarn Inventory",
        error: err,
        data: results,
      });
    }
  );
};

exports.yarn_list = (req, res, next) => {
  Yarn.find({}, null, { sort: { weight: 1 } })
    .populate("producer")
    .populate("weight")
    .exec(function(err, list_yarn) {
      if (err) {
        return next(err);
      }
      res.render("yarn_list", {
        title: "Yarn List",
        yarnlist: list_yarn,
      });
    });
};

exports.yarn_detail = (req, res, next) => {
  async.series(
    [
      function(callback) {
        Yarn.findById(req.params.id)
          .populate("producer")
          .populate("weight")
          .populate("fibercomposition.fibertype")
          .exec((err, queryresult) => {
            if (err) {
              next(err);
            }
            callback(null, queryresult);
          });
      },
      function(callback) {
        YarnInstance.find({ yarn: req.params.id }).exec(
          (err, yarninstancesquery) => {
            if (err) {
              return next(err);
            }
            callback(null, yarninstancesquery);
          }
        );
      },
    ],
    function(err, results) {
      if (err) {
        return next(err);
      }
      res.render("yarn_detail", {
        title: "Yarn",
        yarn_info: results[0],
        yarncolorways: results[1],
      });
    }
  );
};

exports.yarn_delete_get = (req, res, next) => {
  async.parallel(
    {
      findyarn(callback) {
        Yarn.findById(req.params.id)
          .populate("producer")
          .populate("fibercomposition.fibertype")
          .populate("weight")
          .exec(callback);
      },
      findinstances(callback) {
        YarnInstance.find({ yarn: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.findyarn === null) {
        res.redirect("/inventory/null");
      }
      res.render("yarn_delete", {
        title: "Delete: ",
        yarn_info: results.findyarn,
        yarncolorways: results.findinstances,
      });
    }
  );
};

exports.yarn_delete_post = (req, res, next) => {
  async.parallel(
    {
      findyarn(callback) {
        Yarn.findById(req.body.yarnid)
          .populate("producer")
          .populate("fibercomposition.fibertype")
          .populate("weight")
          .exec(callback);
      },
      findinstances(callback) {
        YarnInstance.find({ yarn: req.body.yarnid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.findinstances.length > 0) {
        res.render("yarn_delete", {
          title: "Delete: ",
          yarn_info: results.findyarn,
          yarncolorways: results.findinstances,
        });
        return;
      }
      Yarn.findByIdAndRemove(req.body.yarnid, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/inventory/yarn");
      });
    }
  );
};

exports.yarn_create_fiber_input_get = (req, res, next) => {
  res.render("yarn_create_fiber", {
    title: "Add yarn",
  });
};

exports.yarn_create_fiber_input_post = (req, res, next) => {
  const numberfibers = req.body.numberFibers;
  res.redirect("/inventory/yarn/create/" + numberfibers);
};

exports.yarn_create_get = (req, res, next) => {
  async.parallel(
    {
      producers(callback) {
        Producer.find({}, null, { sort: { brandname: 1 } }).exec(callback);
      },
      weights(callback) {
        Weight.find().exec(callback);
      },
      fibers(callback) {
        Fiber.find().exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("yarn_create", {
        title: "Add yarn",
        producers: results.producers,
        weights: results.weights,
        fibers: results.fibers,
        numberfibers: req.params.numberfibers,
      });
    }
  );
};

exports.yarn_create_post = [
  // convert fibertype to array
  (req, res, next) => {
    req.body.price = Number(req.body.price);
    let fiberarray = [];
    const numberfibers = req.body.numberfibersinput;
    for (let i = 0; i < numberfibers; i++) {
      const bodynameperc = "fiberperc" + i;
      const bodynametype = "fibertype" + i;
      const fiberobj = {
        fibertype: req.body[bodynametype],
        percentage: Number(req.body[bodynameperc]),
      };
      fiberarray.push(fiberobj);
    }
    req.body.numberfibersinput = fiberarray;
    next();
  },

  body("yarnname", "Yarn name is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("weight", "Weight must be selected")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("unitweight")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Unit weight must not be empty")
    .isNumeric()
    .withMessage("Must be a number"),
  body("meterage")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Meterage must not be empty")
    .isNumeric()
    .withMessage("Must be a number"),
  body("price")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Price  must not be empty")
    .isNumeric()
    .withMessage("Must be a number"),
  body("producer", "Producer must be selected")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    const yarn = new Yarn({
      name: req.body.yarnname,
      weight: req.body.weight,
      fibercomposition: req.body.numberfibersinput,
      unitweight: req.body.unitweight,
      meterage: req.body.meterage,
      price: req.body.price,
      producer: req.body.producer,
    });
    // this stays so that I trust my gut in the future
    /* findfibers(callback) {
     *   // why do I get the feeling that this is unnecessary?
     *   let idsarray = [];
     *   req.body.numberfibersinput.forEach((obj) =>
     *     idsarray.push(obj.fibertype)
     *   );
     *   Fiber.find({ _id: { $in: idsarray } }).exec(callback);
     * }, */

    if (!errors.isEmpty()) {
      async.parallel(
        {
          producers(callback) {
            Producer.find({}, null, { sort: { brandname: 1 } }).exec(callback);
          },
          weights(callback) {
            Weight.find().exec(callback);
          },
          fibers(callback) {
            Fiber.find().exec(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }
          res.render("yarn_create", {
            title: "Add yarn",
            producers: results.producers,
            weights: results.weights,
            fibers: results.fibers,
            numberfibers: yarn.fibercomposition.length,
            yarn,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    yarn.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect(yarn.url);
    });
  },
];
