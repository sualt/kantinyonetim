import { useState } from 'react';

export default function Login({ onLogin, error }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('kantin123');

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin({ username, password });
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: '80px auto' }}>
      <h2>Giriş Yap</h2>
      {error ? <div className="error-box">{error}</div> : null}
      <form onSubmit={handleSubmit} className="input-row">
        <input
          placeholder="Kullanıcı adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />
        <input
          type="password"
          placeholder="Parola"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="primary">
          Giriş
        </button>
      </form>
    </div>
  );
}
