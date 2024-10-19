// HomePage.js
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../Design/HomePage.css'; 
import { AuthContext } from '../../context/AuthContext';
import { io } from 'socket.io-client';

const socket = io('https://chat-app-backend-n31i.onrender.com'); 

const HomePage = ({setchatroomname,setChatuser}) => {
  const { authData, logout } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [roomName, setRoomName] = useState(''); 
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  // const currentUser = JSON.parse(localStorage.getItem('user')); 
  const currentUser = authData.user
  console.log(currentUser)
  const navigate = useNavigate()

  useEffect(() => {
    if (!authData.token) {
      navigate('/');
    }
  }, [authData.token, navigate]);
  
  useEffect(() => {
    if(!authData.token) return
    try {
      const fetchUsers = async () => {
        const res = await axios.get('https://chat-app-backend-n31i.onrender.com/chat_app/v1/auth/getuser', {
          headers: { Authorization: `Bearer ${authData.token}` }
        });
        setUsers(res.data.data);
      };
      fetchUsers();
    } catch (error) {
      alert(error.response.data.message)
      console.error( error.response.data.message);
    }
  }, []);

  
    const fetchChatRooms = async () => {
      try {
        const res = await axios.get('https://chat-app-backend-n31i.onrender.com/chat_app/v1/chatroom/getchatrooms', {
          headers: { Authorization: `Bearer ${authData.token}` }
        });
        setChatRooms(res.data.data);
        
      } catch (error) {
        alert(error.response.data.message)
        console.error( error.response.data.message);
      }
    };

  useEffect(() => {
    if(!authData.token) return
    fetchChatRooms();

    socket.on('new_room', (data) => {
      fetchChatRooms();
    });

    socket.on('room_deleted', (data) => {
      fetchChatRooms();
    });

    return () => {
      socket.off('new_room');
      socket.off('room_deleted');
    };
  }, []);
  

  const handleCreateChatRoom = async () => {
    if (!roomName) {
      alert('Please enter a room name.');
      return;
    }

    try {
      const response = await axios.post(
        'https://chat-app-backend-n31i.onrender.com/chat_app/v1/chatroom/create_room',
        { room_name: roomName },
        {
          headers: { Authorization: `Bearer ${authData.token}` }
        }
      );

      setChatRooms([...chatRooms, response.data.data]);
      setRoomName(''); // Clear the input field
      setIsCreatingRoom(false); // Hide the input field
      alert('Chat room created successfully!'); // Notify the user
    } catch (error) {
      console.error('Error creating chat room:', error.response.data.message);
      alert(error.response.data.message || 'Failed to create chat room.');
    }
  };

  const handleJoinRoom = async (roomId) => {
    try {
      await axios.patch(
        `https://chat-app-backend-n31i.onrender.com/chat_app/v1/chatroom/join_room/${roomId}`,
        {},
        {
          headers: { Authorization: `Bearer ${authData.token}` }
        }
      );
      alert('Joined the chat room successfully!');
      const updatedChatRooms = await axios.get('https://chat-app-backend-n31i.onrender.com/chat_app/v1/chatroom/getchatrooms', {
        headers: { Authorization: `Bearer ${authData.token}` }
      });
      setChatRooms(updatedChatRooms.data.data);
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join room.');
    }
  };

  const handleLeaveRoom = async (roomId) => {
    try {
      await axios.patch(
        `https://chat-app-backend-n31i.onrender.com/chat_app/v1/chatroom/leave_room/${roomId}`,
        {},
        {
          headers: { Authorization: `Bearer ${authData.token}` }
        }
      );
      alert('Left the chat room successfully!');
      const updatedChatRooms = await axios.get('https://chat-app-backend-n31i.onrender.com/chat_app/v1/chatroom/getchatrooms', {
        headers: { Authorization: `Bearer ${authData.token}` }
      });
      setChatRooms(updatedChatRooms.data.data);
    } catch (error) {
      console.error('Error leaving room:', error);
      alert('Failed to leave room.');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      await axios.delete(
        `https://chat-app-backend-n31i.onrender.com/chat_app/v1/chatroom/delete_room/${roomId}`,
        {
          headers: { Authorization: `Bearer ${authData.token}` }
        }
      );
      alert('Chat room deleted successfully!');
      const updatedChatRooms = await axios.get('https://chat-app-backend-n31i.onrender.com/chat_app/v1/chatroom/getchatrooms', {
        headers: { Authorization: `Bearer ${authData.token}` }
      });
      setChatRooms(updatedChatRooms.data.data);
    } catch (error) {
      console.error('Error deleting room:', error.stack);
      alert('Failed to delete room.');
    }
  };

  const handleLogout = () => {
    logout(); 
    navigate('/'); 
  };

  return (
    <div className="homepage-container">
      <button className="logout-btn" onClick={handleLogout} style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'red', color: 'white', padding: '10px', border: 'none', cursor: 'pointer' }}>
        Logout
      </button>
      <div className="users-section">
        <h2>Users</h2>
        <div className="users-list">
          {users.map(user => (
            <div
              key={user._id}
              className="user-card"
              onClick={() => {
                setChatuser(user.Username); 
                navigate(`/home/users/chat/${user._id}`); 
              }}
            >
              <img
                src={`https://via.placeholder.com/50`} 
                alt={`${user.Username}'s profile`}
                className="user-image"
              />
              <span className="username">{user.Username}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="chatrooms-section">
        <h2>
          Chat Rooms 
          <button className="create-chatroom-btn" onClick={() => setIsCreatingRoom(true)}>
            Create Chat Room
          </button>
        </h2>

        {isCreatingRoom && (
          <div className="create-room-container">
            <input
              type="text"
              placeholder="Enter chat room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)} 
              className="room-name-input"
            />
            <button className="submit-room-btn" onClick={handleCreateChatRoom}>
              Submit
            </button>
            <button className="cancel-room-btn" onClick={() => setIsCreatingRoom(false)}>
              Cancel
            </button>
          </div>
        )}

<div className="chatrooms-list">
          {chatRooms.map(room => {
            let isnotmember = true;
            let isMember = room.users.includes(currentUser._id);
            const isAdmin = room.created_by === currentUser._id;
            if (isAdmin) isMember = false
            if (isAdmin || isMember) isnotmember = false;

            return (
              <div key={room._id} className="chatroom-card">
                <div
                  className="chatroom-link"
                  onClick={() => {
                    setchatroomname(room.room_name); 
                    navigate(`/home/chatrooms/chat/${room._id}`); 
                  }}
                >
                  <img
                    src={`https://via.placeholder.com/50`} 
                    alt={`${room.room_name}'s profile`}
                    className="user-image"
                  />
                  <span className="chatroom-name">{room.room_name}</span>
                </div>
                <div className="chatroom-buttons">
                  {isAdmin && <button className="delete-room-btn" onClick={() => handleDeleteRoom(room._id)}>Delete Room</button>}
                  {isMember && <button className="leave-room-btn" onClick={() => handleLeaveRoom(room._id)}>Leave Room</button>}
                  {isnotmember && <button className="join-room-btn" onClick={() => handleJoinRoom(room._id)}>Join Room</button>}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default HomePage;
