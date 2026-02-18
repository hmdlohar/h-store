const cron = require("node-cron");
const JobQueueService = require("../services/JobQueueService");
const { fetchIpInfoForSessions } = require("./ipFetcher");

const cronJobs = {
  PROCESS_JOB_QUEUE: {
    cron: "*/10 * * * * *", // every 10 seconds
    handler: () => {
      return JobQueueService.processPendingJobs();
    },
    oneAtTime: true, // only one instance of the job can run at a time
  },
  FETCH_IP_INFO: {
    cron: "*/10 * * * * *", // every 10 seconds
    handler: () => {
      return fetchIpInfoForSessions();
    },
    oneAtTime: true, // only one instance at a time to respect rate limits
  },
};

function initCron() {
  console.log("initCron");
  Object.keys(cronJobs).forEach((key) => {
    cron.schedule(cronJobs[key].cron, () => {
      runCron(key, cronJobs[key].context);
    });
  });
  console.log("initCron done");
}

async function runCron(key, context) {
  let objJob = undefined;
  try {
    objJob = cronJobs[key];
    if (!objJob) {
      throw new Error(`Cron job ${key} not found`);
    }
    if (objJob.oneAtTime && objJob.isRunning === true) {
      console.log(`Cron job ${key} is already running`);
      return [null, null];
    }
    objJob.isRunning = true;
    const result = await objJob.handler(context);
    objJob.isRunning = false;
    return [null, result];
  } catch (error) {
    if (objJob) {
      objJob.isRunning = false;
    }
    return [error, null];
  }
}

module.exports = { initCron, runCron };
