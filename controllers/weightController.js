const Weight = require("../models/weight");

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
  Weight.findById(req.params.id).exec((err, weightinfo) => {
    if (err) {
      return next(err);
    }

    res.render("weight_detail", {
      title: "Weight",
      weight_info: weightinfo,
    });
  });
};
