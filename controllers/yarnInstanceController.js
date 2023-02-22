const YarnInstance = require("../models/yarninstance");
const Yarn = require("../models/yarn");

exports.instances_list = (req, res, next) => {
  YarnInstance.find()
    .populate("yarn")
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
