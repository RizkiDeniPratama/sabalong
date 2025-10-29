// --- Global error handler ---
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  console.error("🔥 Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
