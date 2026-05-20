import { useState } from 'react';

export default function Login({ onLogin, error }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('kantin123');

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin({ username, password });
  };

  return (
    <div className="auth-card">
      <h2 className="section-title">Giriş Yap</h2>
      {error ? <div className="error-box">{error}</div> : null}
      <form onSubmit={handleSubmit} className="input-row">
        <input
          placeholder="Kullanıcı adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          className="field-input"
        />
        <input
          type="password"
          placeholder="Parola"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field-input"
        />
        <button type="submit" className="btn btn-primary">
          Giriş
        </button>
      </form>
    </div>
  );
}
