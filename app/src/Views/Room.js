import React from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import './Room.css'

const server = "http://localhost:8080";
const stun_server = "stun:stun4.l.google.com:19302";
const turn_server = "turn:numb.viagenie.ca";


class Call {
  peer = null;

  init = (stream, init) => {
    this.peer = new Peer({
      initiator: init,
      stream: stream,
      reconnectTimer: 500,
      iceTransportPolicy: 'relay',
      trickle: false,
      config: {
        iceServers: [
          { urls: stun_server.split(',') },
          {
            urls: turn_server.split(','),
            username: "nathan.lebon@epitech.eu",
            credential: "test1234"
          },
        ]
      }
    });
    return this.peer;
  };

  connect = (caller) => {
      this.peer.signal(caller)
  }
}

class Room extends React.Component {
  constructor(props) {
    super(props);
    let name;
    console.log(props)
    if (props.location.state === undefined) {
      console.log("Undefined")
        alert("You cant enter this room")
      return;
    }
    name = props.location.state.name;
    this.state = {
      callers: [],
      isHost: false,
      userVideo: {},
      name

    }
  }

  videoCall = new Call();

  start = (id) =>  {
    console.log("starting")
    const peer = this.videoCall.init(this.state.localStream, this.state.isHost);
    this.setState({peer});

    peer.on('signal', data => {
      console.log("Signal")
      console.log(data);
      const signal = {
        room: id,
        name: this.state.name,
        desc: data
      };
      this.state.socket.emit('signal', signal);
    });

    peer.on('stream',stream => {
      console.log("on stream");
      console.log(stream);
      this.remoteVideo.srcObject = stream;
    })
  };

  call = callers => {
    this.videoCall.connect(callers);
  };

  getUserMedia() {
    return new Promise((resolve, reject) => {
      navigator.getUserMedia = navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;
      const options = {
        video: true,
        audio: true
      };
      navigator.getUserMedia(
        options,
        stream => {
          this.setState({ streamUrl: stream, localStream: stream });
          this.localVideo.srcObject = stream;
          resolve();
        },
        () => {}
      );
    });
  }

  componentDidMount() {
    const socket = io(server);
    this.setState({
      socket
    });

    const roomId = this.props.match.params.id;
    const username = this.state.name;

    this.getUserMedia().then(() => {
      socket.emit('join', {roomId, username})
    });

    socket.on('init', () => {
      this.setState({ isHost: true });
    });

    socket.on('ready', data => {
      console.log(data)
      this.start(roomId)
      console.log("Ready")
    });

    socket.on('desc', data => {
      if (data.desc.type === 'offer' && this.state.isHost) return;
      if (data.desc.type === 'answer' && !this.state.isHost) return;
      console.log(data)
      this.call(data.desc);
    })
  }

  renderVideos() {
    return(
      <div id="videos">
        <video autoPlay id="localVideo" ref={video => (this.localVideo = video)} />
        <video autoPlay id="remoteVideo" ref={video => {this.remoteVideo = video}}  />

        {
          this.state.callers.map((caller, index) => {
            return (
              <div>
              </div>
            )
          })
        }
      </div>
    )
  }

  render() {
    return (
      <div id="video-container">

        {this.renderVideos()}
      </div>
    );
  }
}

export default Room;