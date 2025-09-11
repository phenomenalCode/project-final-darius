import { useState } from 'react';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log("Submitting:", username, password);

    setMessage('');

    try {
      const res = await fetch('https://project-final-darius-1.onrender.com/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log("Response:", data);
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setMessage('🎉 Registered successfully!');
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  return  (
    <form onSubmit={handleRegister} aria-labelledby="register-form-title">
      <h2 id="register-form-title" style={{ color: '#005FCC' }}>
        Register
      </h2>

      <label htmlFor="username-input" style={{ color: '#005FCC' }}>
        Username  
      </label>
      <input
        id="username-input"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        aria-required="true"
        aria-describedby="username-desc"
        placeholder="Enter your username"
        style={{ color: '#005FCC' }}
      />
      <small id="username-desc" style={{ display: 'block', marginBottom: '1rem', color: '#005FCC' }}>
        Choose a unique username.
      </small>

      <label htmlFor="password-input" style={{ color: '#005FCC' }}>
        Password
      </label>
      <input
        id="password-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        aria-required="true"
        aria-describedby="password-desc"
        placeholder="Enter your password"
        style={{ color: '#005FCC' }}
      />
      <small id="password-desc" style={{ display: 'block', marginBottom: '1rem', color: '#005FCC' }}>
        Use at least 6 characters. 
      </small>

      <button
  type="submit"
  aria-label="Register new account"
  style={{
    color: '#005FCC',          // blue text
    backgroundColor: 'beige',  // button background
    border: '3px solid #005FCC', // thick blue border
    fontWeight: 'bold',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  }}
>
  Register
</button>


      {message && (
        <p
          role={message.startsWith('❌') ? 'alert' : 'status'}
          aria-live="polite"
          style={{ marginTop: '1rem', color: '#005FCC' }}
        >
          {message}
        </p>
      )}
    </form>
  );
};


export default RegisterForm;
