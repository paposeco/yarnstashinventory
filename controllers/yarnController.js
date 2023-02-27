const Yarn = require("../models/yarn");
const YarnInstance = require("../models/yarninstance");
const Producer = require("../models/producer");
const Weight = require("../models/weight");
const async = require("async");

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
  Yarn.find()
    .populate("producer")
    .populate("weight")
    .sort({ weight: 1 })
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
