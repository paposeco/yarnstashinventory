const Fiber = require("../models/fiber");
const Yarn = require("../models/yarn");
const async = require("async");
const { body, validationResult } = require("express-validator");

// list fibers
exports.fiber_list = (req, res, next) => {
  async.parallel(
    {
      find_fiber(callback) {
        Fiber.find().exec(callback);
      },
      find_yarn(callback) {
        Yarn.find().exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      const fibermap = new Map();
      for (let i = 0; i < results.find_fiber.length; i++) {
        let counter = 0;
        for (let j = 0; j < results.find_yarn.length; j++) {
          const fiberinyarn = results.find_yarn[j].fibercomposition;
          fiberinyarn.forEach((fib) => {
            console.log(fib._id.toString());
            fib.fibertype._id.toString() ===
              results.find_fiber[i]._id.toString()
              ? ++counter
              : null;
          });
        }
        fibermap.set(results.find_fiber[i]._id.toString(), {
          fibername: results.find_fiber[i].fibertype,
          counter: counter,
          url: results.find_fiber[i].url,
        });
      }
      console.log(fibermap);
      res.render("fiber_list", {
        title: "Fiber",
        fiber_list: fibermap,
      });
    }
  );
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
        title: "Fiber: " + results.findfiber.fibertype,
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
        title: "Delete: " + results.fiberexists.fibertype,
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
          title: "Delete: " + results.fiberexists.fibertype,
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
      title: "Add Fiber",
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
        title: "Add Fiber",
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
