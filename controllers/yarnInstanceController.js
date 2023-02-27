const YarnInstance = require("../models/yarninstance");
const Yarn = require("../models/yarn");
const Producers = require("../models/producer");
const async = require("async");

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
