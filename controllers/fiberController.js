const Fiber = require("../models/fiber");

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
  Fiber.findById(req.params.id).exec((err, fiber_detail) => {
    if (err) {
      return next(err);
    }
    res.render("fiber_detail", {
      title: "Fiber details",
      fiber_info: fiber_detail,
    });
  });
};
