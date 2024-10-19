import React, { useContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Design/Login.css'
import { AuthContext } from '../../context/AuthContext';


const Signup = () => {
  const [formData, setFormData] = useState({ Username: '', password: '', confirmPassword: '', phoneNumber: '' });
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); 

  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://chat-app-backend-n31i.onrender.com/chat_app/v1/auth/signup', formData);
      // console.log(res)
      localStorage.setItem('token', res.data.token);  
      localStorage.setItem('user', res.data.data.user)

      const token  = res.data.token;
      const user = res.data.data.user

      login(user, token);

      navigate('/home');  
    } catch (error) {
      alert(error.res.data.message)
      console.error('Signup failed:', error.res.data.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>SignUp</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" name="Username" placeholder="Username" onChange={handleChange} />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} />
            <input type="text" name="phoneNumber" placeholder="Phone Number" onChange={handleChange} />
            <button type="submit">Signup</button>
          </form>
       </div>
    </div>
  );
};

export default Signup;
