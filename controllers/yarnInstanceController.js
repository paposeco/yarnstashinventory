const YarnInstance = require("../models/yarninstance");
const Yarn = require("../models/yarn");
const Producers = require("../models/producer");
const async = require("async");

exports.instances_list = (req, res, next) => {
  const options = { sort: { name: 1 } };
  YarnInstance.find()
    .populate({ path: "yarn", select: "name" })
    .exec(function(err, list_instances) {
      if (err) {
        return next(err);
      }
      res.render("yarn_instances_list", {
        title: "Yarn Colorways",
        instances: list_instances,
      });
    });
};

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
        //fazer o mesmo com o exec etc
        Producers.findById(queryresult.yarn.producer).exec(
          (err, producerqueryresult) => {
            console.log(producerqueryresult);
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
