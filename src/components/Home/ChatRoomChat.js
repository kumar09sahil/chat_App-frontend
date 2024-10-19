import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import '../Design/ChatRoomChat.css';
import { AuthContext } from '../../context/AuthContext';

const socket = io('https://chat-app-backend-n31i.onrender.com'); 

const ChatRoomChat = ({ chatroomname }) => {
  const { id } = useParams(); // Chat room ID from URL
  const { authData } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set()); 
  // const currentUserId = JSON.parse(localStorage.getItem('user'))._id;
  // const currentusername = JSON.parse(localStorage.getItem('user')).Username;
  const currentUserId = authData.user?._id; 
  const currentusername = authData.user?.Username;

  const navigate = useNavigate();
  let typingTimeout; 

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`https://chat-app-backend-n31i.onrender.com/chat_app/v1/chatroom/${id}`, {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      setMessages(res.data.data.messages);
    } catch (err) {
      alert(err.response?.data?.message)
      setError(err.response?.data?.message || 'Error fetching messages');
    }
  };

  useEffect(() => {
    if (!authData.token) return;
    socket.emit('user_connected', currentusername);

    socket.on('update_online_users', (users) => {
      setOnlineUsers(prevUsers => {
        const updatedUsers = new Set(prevUsers);
        users.forEach(user => updatedUsers.add(user)); // Add new users to the Set
        return updatedUsers; // Return the updated Set
      });
    });

    socket.on('user_typing', (userId) => {
      console.log(userId);
      setTypingUsers((prev) => {
        const newTypingUsers = new Set(prev); 
        newTypingUsers.add(userId); 
        return newTypingUsers; 
      });
    });

    socket.on('user_stop_typing', (userId) => {
      console.log(userId, "stop typing");
      setTypingUsers((prev) => {
        const newTypingUsers = new Set(prev); 
        newTypingUsers.delete(userId); 
        return newTypingUsers; 
      });
    });

    fetchMessages();

    socket.on('newchatroomMessage', (data) => {
      fetchMessages();
    });

    socket.on('chatroomDeleteMessage', (data) => {
      fetchMessages();
    });

    return () => {
      socket.off('update_online_users');
      socket.off('user_typing');
      socket.off('user_stop_typing');
      socket.off('newchatroomMessage');
      socket.off('chatroomDeleteMessage');
    };
  }, [id,authData.token]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  
    if (e.target.value) {
      socket.emit('user_typing', currentusername); 
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        socket.emit('user_stop_typing', currentusername); 
      }, 1000);
    } else {
      socket.emit('user_stop_typing', currentusername);
    }
  };
  

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    try {
      const res = await axios.post(
        `https://chat-app-backend-n31i.onrender.com/chat_app/v1/chatroom/send_message/${id}`,
        { message: newMessage },
        {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        }
      );
      setNewMessage('');
      fetchMessages();
      socket.emit('user_stop_typing', currentusername); 
    } catch (error) {
      alert(error.response?.data?.message)
      setError('Failed to send message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const res = await axios.patch(
        `https://chat-app-backend-n31i.onrender.com/chat_app/v1/chatroom/delete_message/${id}`,
        { id: messageId },
        {
          headers: { Authorization: `Bearer ${authData.token}`,
        },
      });
      setMessages(messages.filter((msg) => msg._id !== messageId));
    } catch (error) {
      alert(error.response?.data?.message)
      setError('Failed to delete message');
    }
  };

  const handleBackClick = () => {
    navigate('/home');
  };

  return (
    <div className="chatroom-chat-container">
      <div className="header">
        <button className="back-button" onClick={handleBackClick}>
          ← Back
        </button>
        <h2>{chatroomname}</h2>
      </div>

      <div className="online-users">
        <h3>Online Users:</h3>
        <p>{Array.from(onlineUsers).join(', ')}</p>
      </div>

      <div className="typing-notification">
        {typingUsers.size > 0 && <p>{Array.from(typingUsers).join(', ')} is typing...</p>} 
      </div>

      <div className="chat-messages">
        {messages.length > 0 ? (
          messages.map((msg) => {
            const isCurrentUser = msg.sent_by._id === currentUserId;
            return (
              <div key={msg._id} className={`message-wrapper ${isCurrentUser ? 'sent-wrapper' : 'received-wrapper'}`}>
                {!isCurrentUser && <p className="username">{msg.sent_by.Username}</p>}

                <div className={`message ${isCurrentUser ? 'sent' : 'received'}`}>
                  <p className={`message-content ${isCurrentUser ? 'sent-message' : 'received-message'}`}>
                    {msg.content}
                    {isCurrentUser && (
                      <span
                        className="delete-icon"
                        onClick={() => handleDeleteMessage(msg._id)}
                        title="Delete message"
                      >
                        🗑️
                      </span>
                    )}
                  </p>
                  <span className="timestamp">
                    {msg.createdAt.date} {msg.createdAt.time}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p>No messages yet...</p>
        )}
      </div>

      <div className="message-input-container">
        <input
          className="message-input"
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          placeholder="Type a message..."
        />
        <button className="send-button" onClick={handleSendMessage}>
          Send
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ChatRoomChat;
