import React from 'react';

type MqttStatusProps = {
  status: 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting';
  onDisconnect: () => void;
};

const MqttStatus: React.FC<MqttStatusProps> = ({ status, onDisconnect }) => {
  return (
    <div className="status-container">
      <span>
        MQTT Status: <span className={`status-${status}`}>{status}</span>
      </span>
      <button className="disconnect-button" onClick={onDisconnect}>
        Disconnect
      </button>
    </div>
  );
};

export default MqttStatus;
