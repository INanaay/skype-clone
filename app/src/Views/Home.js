import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useHistory } from "react-router-dom";
import './Home.css'


const Home = () => {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const history = useHistory();

  const joinExistingRoom = () => {
    if (!name || name.length === 0) {
      alert("Your name is empty");
      return;
    }
    history.push({
      pathname: '/room/' + roomId,
      state: {
        'name': name
      }
    })
  };

  return (
    <div id="home-container">
    <h1>Welcome to Uvid</h1>
      <h2>Please enter your name before joining</h2>
        <input type="text" value={name} placeholder="Enter your name" onChange={(event => {
          setName(event.target.value)})}/>

      <h2>Choose room name : if it does not exist, room will be created !</h2>

      <input type="text" value={roomId} placeholder="Enter room name" onChange={(event => {
        setRoomId(event.target.value)})}/>
      <button onClick={() => {
        joinExistingRoom()
      }}>
        Join Room
      </button>
    </div>
  )
}

export default Home;