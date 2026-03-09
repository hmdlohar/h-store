const { parseErrorString } = require("hyper-utils");
const enums = require("../enums");
const JobQueue = require("../models/JobQueue");
const {
  processOrderNotification,
  processOrderPaid,
  processCodOrderPlaced,
  processCodOrderConfirmed,
} = require("../util/orderUtils");
class JobQueueService {
  static async createJob({ type, context }) {
    const job = new JobQueue({ type, context });
    await job.save();
    return job;
  }

  static async processPendingJobs() {
    const jobs = await JobQueue.find({ status: "pending" });
    console.log(`Processing ${jobs.length} pending jobs`);
    let success = 0;
    for (const job of jobs) {
      const [, isSuccess] = await this.processJob(job);
      if (isSuccess) {
        success++;
      }
    }
    if (jobs.length) {
      console.log(
        `Processed ${success} pending jobs. ${jobs.length - success} failed`
      );
    }
  }

  static async processJob(job) {
    try {
      const { type, context } = job;
      switch (type) {
        case enums.JOB_TYPE.ORDER_NOTIFICATION:
          await processOrderNotification(context.orderId);
          break;
        case enums.JOB_TYPE.ORDER_PAID:
          await processOrderPaid(context.orderId);
          break;
        case enums.JOB_TYPE.COD_ORDER_PLACED:
          await processCodOrderPlaced(context.orderId);
          break;
        case enums.JOB_TYPE.COD_ORDER_CONFIRMED:
          await processCodOrderConfirmed(context.orderId);
          break;
        default:
          throw new Error(`Unknown job type: ${type}`);
      }
      job.status = "completed";
      await JobQueue.updateOne(
        { _id: job._id },
        { $set: { status: "completed" } }
      );
      return [null, true];
    } catch (error) {
      job.status = "failed";
      job.error = parseErrorString(error);
      await JobQueue.updateOne(
        { _id: job._id },
        { $set: { status: "failed", error: parseErrorString(error) } }
      );
      return [error, false];
    }
  }
}

module.exports = JobQueueService;
