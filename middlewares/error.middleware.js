import { ZodError } from "zod";

export const errorMiddleware = (err, req, res, next) => {
  let statuscode = err.statuscode || 500;
  let message = err.message || "Internal Server Error";
  if (err instanceof ZodError) {
    statuscode = 400;
    message = err.issues.map((issue) => ({
      feild: issue.path.join("."),
      message: issue.message,
    }));
  }
  console.error(err.stack);
  res.status(statuscode).json({
    success: false,
    errors: message,
  });
};
