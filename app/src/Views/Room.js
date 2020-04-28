import React from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import {Mic, MicOff, Videocam, VideocamOff} from '@material-ui/icons';
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
    console.log(caller)
      this.peer.signal(caller)
  }
}

class Room extends React.Component {
  constructor(props) {
    super(props);
    let name;
    console.log(props)
    if (props.location.state === undefined) {
      console.log("Undefined");
        alert("You cant enter this room")
      return;
    }
    name = props.location.state.name;
    this.state = {
      isHost: false,
      isMicOn: true,
      isCameraOn: true,
      userVideo: {},
      name

    }
  }
  videoCall = new Call();

  start = (id) =>  {
    const peer = this.videoCall.init(this.state.localStream, this.state.isHost);
    this.setState({peer});

    peer.on('signal', data => {
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

  call = caller => {
    this.videoCall.connect(caller);
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
      console.log(data[1])
      const otherName = this.state.isHost ? data[1] : data[0]
      this.setState({
        otherName
      });
      this.start(roomId)
    });

    socket.on('desc', data => {
      if (data.desc.type === 'offer' && this.state.isHost) return;
      if (data.desc.type === 'answer' && !this.state.isHost) return;
      this.call(data.desc);
    })
  }

  renderVideos() {
    return(
      <div id="videos">
        <div className="single-video">
          <h3>{this.state.name}</h3>
          <video autoPlay id="localVideo" ref={video => (this.localVideo = video)} />
        </div>
        <div className="single-video">
        <h3>{this.state.otherName}</h3>
        <video autoPlay id="remoteVideo" ref={video => {this.remoteVideo = video}}  />
        </div>

      </div>
    )
  }

  setMic = () => {
    if (this.state.localStream.getAudioTracks().length > 0) {
      this.state.localStream.getAudioTracks().forEach(audiotrack => {
        audiotrack.enabled = !audiotrack.enabled
      })
    }
    this.setState({
      isMicOn : !this.state.isMicOn
    });
  };

  setCamera = () => {
    if (this.state.localStream.getVideoTracks().length > 0) {
      this.state.localStream.getVideoTracks().forEach(videoTrack => {
        videoTrack.enabled = !videoTrack.enabled;
      })
    };
    this.setState({
      isCameraOn: !this.state.isCameraOn
    })
  };

  render() {
    return (
      <div id="video-container">
        {this.renderVideos()}

        <div id="controls">
          <button onClick={() => this.setMic()}>
            {this.state.isMicOn ? (<Mic />) : (<MicOff />)}
          </button>

          <button onClick={() => this.setCamera()}>
            {this.state.isCameraOn ? (<Videocam />) : (<VideocamOff />)}
          </button>
        </div>
      </div>
    );
  }
}

export default Room;