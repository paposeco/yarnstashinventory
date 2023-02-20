const Fiber = require("../models/fiber");

// list fibers
exports.fiber_list = (req, res, next) => {
  Fiber.find().exec(function(err, list_fibers) {
    if (err) {
      return next(err);
    }
    console.log(list_fibers);
    res.render("fiber_list", {
      title: "Fiber List",
      fiber_list: list_fibers,
    });
  });
};
