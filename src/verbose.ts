let verbose = 5;
export default function verboseMode(options?) {
  if (options && options?.verbose) {
    // log unhandledRejections
    process.on("unhandledRejection", (error: Error, promise: Promise<unknown>) => {
      console.error("Unhandled Rejection at: Promise", promise, "reason:", error);
      // Stack Trace
      console.error(error.stack);
    });
  }
  return (verbose = verbose ? verbose : options?.verbose);
}
