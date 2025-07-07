import React from 'react';
import JobBoard from '../components/JobBoard';

export type Job = {
  jobId: number;
  command: string;
  args: number[];
  status: 'pending' | 'completed' | 'failed';
  error?: string;
};

type HomeScreenProps = {
  jobs: Job[];
  mqttStatus: 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting';
  onLogout: () => void;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ jobs, mqttStatus, onLogout }) => {
  return (
    <div className="screen home-screen">
      <div className="header">
        <div className="header-title-container">
          <h1>Job Board</h1>
          <p className="disclaimer-note">
            Note: For traceability purposes, incoming jobs are processed after a 5-second delay.
          </p>
        </div>
        <div className="status-container">
          <span className={`status-indicator ${mqttStatus}`}></span>
          <span>
            MQTT Status: {mqttStatus}
          </span>
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
      <JobBoard jobs={jobs} />
    </div>
  );
};

export default HomeScreen;
