const Fiber = require("../models/fiber");
const Yarn = require("../models/yarn");
const async = require("async");
const { body, validationResult } = require("express-validator");

// list fibers
exports.fiber_list = (req, res, next) => {
  Fiber.find().exec(function(err, list_fibers) {
    if (err) {
      return next(err);
    }
    res.render("fiber_list", {
      title: "Fiber",
      fiber_list: list_fibers,
    });
  });
};

exports.fiber_detail = (req, res, next) => {
  async.parallel(
    {
      findfiber(callback) {
        Fiber.findById(req.params.id).exec(callback);
      },
      findyarnwiththisfiber(callback) {
        Yarn.find({ "fibercomposition.fibertype": req.params.id })
          .populate("producer")
          .populate("fibercomposition.fibertype")
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("fiber_detail", {
        title: "Fiber: ",
        fiber_info: results.findfiber,
        yarn: results.findyarnwiththisfiber,
      });
    }
  );
};

// make sure it doesnt exist on yarn
exports.fiber_delete_get = (req, res, next) => {
  async.parallel(
    {
      fiberexists(callback) {
        Fiber.findById(req.params.id).exec(callback);
      },
      yarnwiththisfiber(callback) {
        Yarn.find({ "fibercomposition.fibertype": req.params.id })
          .populate("producer")
          .populate("fibercomposition.fibertype")
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.fiberexists === null) {
        res.redirect("/inventory/fiber");
        return;
      }
      res.render("fiber_delete", {
        title: "Delete: ",
        fiber: results.fiberexists,
        yarn: results.yarnwiththisfiber,
      });
    }
  );
};

exports.fiber_delete_post = (req, res, next) => {
  async.parallel(
    {
      fiberexists(callback) {
        Fiber.findById(req.params.id).exec(callback);
      },
      yarnwiththisfiber(callback) {
        Yarn.find({ "fibercomposition.fibertype": req.params.id }).exec(
          callback
        );
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.yarnwiththisfiber.length > 0) {
        res.render("fiber_delete", {
          title: "Delete: ",
          fiber: results.fiberexists,
          yarn: results.yarnwiththisfiber,
        });
        return;
      }
      // no yarn has this fiber type
      Fiber.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/inventory/fiber");
      });
    }
  );
};

exports.fiber_create_get = (req, res, next) => {
  const allowedfibers = Fiber.schema.path("fibertype").enumValues;
  Fiber.find().exec((err, results) => {
    if (err) {
      return next(err);
    }
    let missingfibers = [];
    for (let i = 0; i < allowedfibers.length; i++) {
      // look for this fiber in results
      let stored = false;
      for (let j = 0; j < results.length; j++) {
        if (results[j].fibertype === allowedfibers[i]) {
          stored = true;
          break;
        }
      }
      if (stored) {
        continue;
      } else {
        missingfibers.push(allowedfibers[i]);
      }
    }
    res.render("fiber_create", {
      title: "Create Fiber",
      fiberstocreate: missingfibers,
    });
  });
};

exports.fiber_create_post = [
  body("createfiber").escape(),
  // only handle request after validating
  (req, res, next) => {
    const errors = validationResult(req);
    const newfiber = new Fiber({
      fibertype: req.body.createfiber,
    });
    if (!errors.isEmpty()) {
      res.render("fiber_create", {
        title: "Create Fiber",
        errorspresent: errors,
      });
      return;
    }
    // check if it already exists
    Fiber.find({ fibertype: req.body.createfiber }).exec((err, fiberexists) => {
      if (err) {
        return next(err);
      }
      if (fiberexists.length > 0) {
        res.redirect(fiberexists.url);
      } else {
        // if it doesnt, save it do db
        newfiber.save((err) => {
          if (err) {
            return next(err);
          }
          res.redirect(newfiber.url);
        });
      }
    });
  },
];
