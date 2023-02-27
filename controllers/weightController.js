const Weight = require("../models/weight");
const Yarn = require("../models/yarn");
const async = require("async");

exports.weight_list = (req, res, next) => {
  Weight.find().exec(function(err, list_weights) {
    if (err) {
      return next(err);
    }
    res.render("weight_list", {
      title: "Yarn Weights",
      weight_list: list_weights,
    });
  });
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
        title: "Weight: ",
        weight_info: results.findweight,
        yarninfo: results.findyarn,
      });
    }
  );
};
