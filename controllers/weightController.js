const Weight = require("../models/weight");
const Yarn = require("../models/yarn");
const async = require("async");
const { body, validationResult } = require("express-validator");

exports.weight_list = (req, res, next) => {
  async.parallel(
    {
      find_weight(callback) {
        Weight.find().exec(callback);
      },
      find_yarn(callback) {
        Yarn.find().exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      const weightmap = new Map();
      for (let i = 0; i < results.find_weight.length; i++) {
        const weightid = results.find_weight[i]._id.toString();
        let counter = 0;
        results.find_yarn.forEach((yarn) =>
          yarn.weight._id.toString() === weightid ? counter++ : null
        );
        weightmap.set(weightid, {
          name: results.find_weight[i].weight,
          url: results.find_weight[i].url,
          counter: counter,
        });
      }
      res.render("weight_list", {
        title: "Weight",
        weight_list: weightmap,
      });
    }
  );
};

exports.weight_detail = (req, res, next) => {
  async.parallel(
    {
      findweight(callback) {
        Weight.findById(req.params.id).exec(callback);
      },
      findyarn(callback) {
        Yarn.find({ weight: req.params.id })
          .populate("producer")
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("weight_detail", {
        title: "Weight: " + results.findweight.weight,
        weight_info: results.findweight,
        yarninfo: results.findyarn,
      });
    }
  );
};

exports.weight_create_get = (req, res, next) => {
  const allowedWeight = Weight.schema.path("weight").enumValues;
  Weight.find().exec((err, results) => {
    if (err) {
      return next(err);
    }
    let missingweights = [];
    for (let i = 0; i < allowedWeight.length; i++) {
      // look for this weight in results
      let stored = false;
      for (let j = 0; j < results.length; j++) {
        if (results[j].weight === allowedWeight[i]) {
          stored = true;
          break;
        }
      }
      if (stored) {
        continue;
      } else {
        missingweights.push(allowedWeight[i]);
      }
    }

    res.render("weight_create", {
      title: "Add Weight",
      weightstocreate: missingweights,
    });
  });
};

exports.weight_create_post = [
  body("createweight").escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    const newweight = new Weight({ weight: req.body.createweight });

    if (!errors.isEmpty()) {
      res.render("weight_create", {
        title: "Add Weight",
        errorspresent: errors,
      });
      return;
    }
    Weight.find({ weight: req.body.createweight }).exec((err, weightexists) => {
      if (err) {
        return next(err);
      }
      if (weightexists.length > 0) {
        res.redirect(weightexists.url);
      } else {
        newweight.save((err) => {
          if (err) {
            return next(err);
          }
          res.redirect(newweight.url);
        });
      }
    });
  },
];

exports.weight_delete_get = (req, res, next) => {
  async.parallel(
    {
      findweight(callback) {
        Weight.findById(req.params.id).exec(callback);
      },
      findyarn(callback) {
        Yarn.find({ weight: req.params.id })
          .populate("producer")
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.findweight === null) {
        res.redirect("/inventory/weight");
        return;
      }
      res.render("weight_delete", {
        title: "Delete: " + results.findweight.weight,
        weight: results.findweight,
        yarn: results.findyarn,
      });
    }
  );
};

exports.weight_delete_post = (req, res, next) => {
  async.parallel(
    {
      weightexists(callback) {
        Weight.findById(req.params.id).exec(callback);
      },
      yarnwiththisweight(callback) {
        Yarn.find({ weight: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.weightexists.length > 0) {
        res.render("weight_delete", {
          title: "Delete: " + results.findweight.weight,
          weight: results.weightexists,
          yarn: results.yarnwiththisweight,
        });
        return;
      }
      // no yarn has this weight
      Weight.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/inventory/weight");
      });
    }
  );
};
