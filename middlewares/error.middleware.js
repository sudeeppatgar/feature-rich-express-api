import { ZodError } from "zod";

export const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  if (err instanceof ZodError) {
    statusCode = 400;
    message = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  }
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }
  res.status(statusCode).json({
    success: false,
    errors: message,
  });
};
