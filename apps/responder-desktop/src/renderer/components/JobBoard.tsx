import React from 'react';
import { Job } from '../screens/HomeScreen';

type JobBoardProps = {
  jobs: Job[];
};

const getJobTitle = (job: Job) => {
  switch (job.command) {
    case 'add':
      return `Addition Job #${job.jobId}`;
    case 'subtract':
      return `Subtraction Job #${job.jobId}`;
    default:
      return `Job #${job.jobId}: ${job.command}`;
  }
};

const JobBoard: React.FC<JobBoardProps> = ({ jobs }) => {
  return (
    <div className="job-board-container">
      <div className="job-column">
        <h2>Pending Jobs</h2>
        {jobs
          .filter((job) => job.status === 'pending')
          .map((job) => (
            <div key={job.jobId} className="job-card">
              {getJobTitle(job)}
            </div>
          ))}
      </div>
      <div className="job-column">
        <h2>Completed Jobs</h2>
        {jobs
          .filter((job) => job.status === 'completed')
          .map((job) => (
            <div key={job.jobId} className="job-card completed">
              {getJobTitle(job)}
            </div>
          ))}
      </div>
      <div className="job-column">
        <h2>Failed Jobs</h2>
        {jobs
          .filter((job) => job.status === 'failed')
          .map((job) => (
            <div key={job.jobId} className="job-card failed">
              <p className="job-title">{getJobTitle(job)}</p>
              {job.error && <p className="job-error">Error: {job.error}</p>}
            </div>
          ))}
      </div>
    </div>
  );
};

export default JobBoard;
