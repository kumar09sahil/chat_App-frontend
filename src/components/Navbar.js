import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

const NavBar = () => {
    const { authData } = useContext(AuthContext); 
    const navigate = useNavigate();
  
    return (
      <div style={navBarStyle}>
        {!authData.token ? (
          <div style={{display:'flex'}}>
            <button style={buttonStyle} onClick={() => navigate('/')}>Login</button>
            <button style={buttonStyle} onClick={() => navigate('/signup')}>Signup</button>
          </div>
        ) : (
          <div>
          </div>
        )}
      </div>
    );
  }
  
  const navBarStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '10px',
    backgroundColor: '#f0f0f0',
  };
  
  const buttonStyle = {
    width:'100px',
    marginLeft: '10px',
    padding: '10px 20px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    borderRadius: '5px',
  };
  
export default NavBar;