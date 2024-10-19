import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import UserChat from './components/Home/UserChat';
import ChatRoomChat from './components/Home/ChatRoomChat';
import HomePage from './components/Home/HomePage';
import { useState, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import NavBar from './components/Navbar';


function App() {
  const [chatuser, setChatuser] = useState('');
  const [chatroomname, setchatroomname] = useState('');

  return (
    <AuthProvider>
      <Router>
        <div>
          <NavBar /> 
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/home" element={<HomePage setchatroomname={setchatroomname} setChatuser={setChatuser} />} />
            <Route path="/home/users/chat/:id" element={<UserChat chatuser={chatuser} />} />
            <Route path="/home/chatrooms/chat/:id" element={<ChatRoomChat chatroomname={chatroomname} chatuser={chatuser} />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}


export default App;
