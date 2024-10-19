import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client'; 
import '../Design/UserChat.css'; 
import { AuthContext } from '../../context/AuthContext';

const socket = io('https://chat-app-backend-n31i.onrender.com'); 

const UserChat = ({ chatuser }) => {
  const { id } = useParams(); 
  const { authData } = useContext(AuthContext);
  const location = useLocation(); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // const currentUserId = JSON.parse(localStorage.getItem('user'))._id; // Get the current user's ID
  const currentUserId = authData.user?._id
  const fetchMessages = async () => {
    try {
      const res = await axios.get(`https://chat-app-backend-n31i.onrender.com/chat_app/v1/auth/${id}`, {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      setMessages(res.data.data);
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message)
      setError('Failed to fetch messages');
    }
  };

  useEffect(() => {
    if (!authData.token) return;
    fetchMessages();

    socket.on('newMessage', (data) => {
      console.log("new message");
      fetchMessages();
      
    });

    socket.on('deleteMessage', (data) => {
      console.log("message deleted")
      fetchMessages()
      
    });

    return () => {
      socket.off('newMessage');
      socket.off('deleteMessage');
    };
  }, [id,authData.token]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') return; 

    try {
      await axios.post(`https://chat-app-backend-n31i.onrender.com/chat_app/v1/auth/send_message/${id}`, { message: newMessage }, {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      setNewMessage('');

      const updatedMessages = await axios.get(`https://chat-app-backend-n31i.onrender.com/chat_app/v1/auth/${id}`, {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      setMessages(updatedMessages.data.data);
    } catch (err) {
      alert(err.response?.data?.message)
      setError('Failed to send message');
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const res = await axios.delete(`https://chat-app-backend-n31i.onrender.com/chat_app/v1/auth/delete_message`, {
        data: { id: messageId },
        headers: { Authorization: `Bearer ${authData.token}` },
      });

      setMessages(messages.filter((msg) => msg._id !== messageId));
    } catch (err) {
      alert(err.response?.data?.message)
      setError('Failed to delete message');
    }
  };

  return (
    <div className="user-chat-container">
      <div className="header">
        <button className="back-button" onClick={() => navigate('/home')}>Back</button>
        <h2 className="chat-user-name">{chatuser}</h2> 
      </div>

      <div className="messages-container">
        {messages.map((msg) => {
          const isCurrentUser = msg.sent_by === currentUserId; 
          return (
            <div key={msg._id} className={`message ${isCurrentUser ? 'sent' : 'received'}`}>
              <p className={`message-content ${isCurrentUser ? 'sent-message' : 'received-message'}`}>
                {msg.content}
                {isCurrentUser && (
                  <span
                    className="delete-icon" 
                    onClick={() => deleteMessage(msg._id)} 
                    title="Delete message"
                  >
                    🗑️ 
                  </span>
                )}
                {isCurrentUser && msg.read && <span className="read-indicator">Read</span>}
              </p>
              <span className="timestamp">
                {msg.createdAt?.date || new Date().toDateString()} {msg.createdAt?.time || new Date().toTimeString()}
              </span>
            </div>
          );
        })}
      </div>

      <div className="message-input-container">
        <input 
          className="message-input"
          value={newMessage} 
          onChange={e => setNewMessage(e.target.value)} 
          placeholder="Type a message..." 
        />
        <button className="send-button" onClick={sendMessage}>Send</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default UserChat;
