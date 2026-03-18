import { body, param, query, validationResult } from "express-validator";
import { AppError } from "./errorHandler.js";

const validate = (validations) => async (req,res,next) => {
  await Promise.all(validations.map(v=>v.run(req)));
  const errors = validationResult(req);
  if(errors.isEmpty()) return next();

  const extracted = errors.array().map(err=>({ field: err.param, message: err.msg }));
  throw new AppError("Validation failed",400,extracted);
};

// Register validation
const validateRegister = [
  body("name").notEmpty().withMessage("Name required").isLength({min:2,max:50}),
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").isLength({min:6}).withMessage("Password min 6 chars")
];

// Login validation
const validateLogin = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password required")
];

// Product validation
const validateProduct = [
  body("name").notEmpty().withMessage("Product name required"),
  body("price").isFloat({ min:0 }).withMessage("Price must be positive")
];

// Review validation
const validateReview = [
  body("rating").isInt({min:1,max:5}).withMessage("Rating 1-5 required"),
  body("comment").notEmpty().withMessage("Comment required").isLength({max:500})
];

export { validate, validateRegister, validateLogin, validateProduct, validateReview };
