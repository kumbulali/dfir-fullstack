import React, { useState } from 'react';

type RegisterScreenProps = {
  onRegister: (tenantId: string, enrollmentToken: string) => Promise<void>;
  loading: boolean;
  error: string | null;
};

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister, loading, error }) => {
  const [tenantId, setTenantId] = useState('');
  const [enrollmentToken, setEnrollmentToken] = useState('');

  const handleRegisterClick = () => {
    onRegister(tenantId, enrollmentToken);
  };

  return (
    <div className="screen">
      <h1>Register</h1>
      <div className="form-container">
        <div className="input-group">
          <label htmlFor="tenantId">Tenant ID</label>
          <input
            id="tenantId"
            type="text"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            placeholder="Enter Tenant ID"
          />
        </div>
        <div className="input-group">
          <label htmlFor="enrollmentToken">Enrollment Token</label>
          <input
            id="enrollmentToken"
            type="password"
            value={enrollmentToken}
            onChange={(e) => setEnrollmentToken(e.target.value)}
            placeholder="Enter Enrollment Token"
          />
        </div>
        <button onClick={handleRegisterClick} disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        {error && <p className="message error-message">{error}</p>}
      </div>
    </div>
  );
};

export default RegisterScreen;
