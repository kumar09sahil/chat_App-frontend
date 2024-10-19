import React, { useContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';


import '../Design/Login.css'

const Login = () => {
  const [formData, setFormData] = useState({ Username: '', password: '', phoneNumber: '' });
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://chat-app-backend-n31i.onrender.com/chat_app/v1/auth/login', formData);
      localStorage.setItem('token', res.data.token);  
      console.log(res.data.data.user)
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      const token  = res.data.token;
      const user = res.data.data.user

      login(user, token);

      navigate('/home');  
    } catch (error) {
      alert(error.response.data.message)
      console.error('Login failed:', error.response.data.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="Username" placeholder="Username" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <input type="text" name="phoneNumber" placeholder="Phone Number" onChange={handleChange} required />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
