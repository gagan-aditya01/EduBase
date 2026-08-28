// Asynchronous Background Task Queue
class BackgroundQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  // Push task to queue without blocking HTTP response
  enqueue(taskName, taskFn) {
    this.queue.push({ taskName, taskFn, timestamp: new Date().toISOString() });
    console.log(`[Queue Enqueued] Task '${taskName}' added to background processing queue.`);
    this.processQueue();
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const currentTask = this.queue.shift();

    try {
      console.log(`[Queue Processing] Executing background task '${currentTask.taskName}'...`);
      await currentTask.taskFn();
      console.log(`[Queue Completed] Task '${currentTask.taskName}' finished successfully.`);
    } catch (error) {
      console.error(`[Queue Error] Background task '${currentTask.taskName}' failed: ${error.message}`);
    } finally {
      this.isProcessing = false;
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }
  }
}

const backgroundQueue = new BackgroundQueue();
module.exports = backgroundQueue;
