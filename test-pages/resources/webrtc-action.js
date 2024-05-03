/* eslint-disable */

const socket = io('http://localhost:50080');

let iceServers = {
    iceServers: [{ urls: 'stun:stun.services.mozilla.com' }, { urls: 'stun:stun.l.google.com:19302' }]
};

let creator = false;
let room = 'testroom123456'; // 방 이름 설정
let userStream;
let rtcPeerConnection;

const userVideo = document.getElementById('user-video');
const videoPage = document.getElementById('video-page');

document.addEventListener('DOMContentLoaded', () => {
    webRTCJobInit();

    socket.on('STC-offer', (room) => {
        console.log('STC-offer');
        preparePeerConnection();

        rtcPeerConnection
            .createOffer()
            .then((offer) => {
                rtcPeerConnection.setLocalDescription(new RTCSessionDescription(offer));

                socket.emit('CTS-offer', { offer, room });
            })
            .catch((err) => console.error(err));
    });

    socket.on('STC-set-offer', (data) => {
        console.log('STC-set-offer');
        preparePeerConnection();

        rtcPeerConnection
            .setRemoteDescription(new RTCSessionDescription(data.offer))
            .then(() => rtcPeerConnection.createAnswer())
            .then((answer) => {
                rtcPeerConnection.setLocalDescription(new RTCSessionDescription(answer));

                socket.emit('CTS-answer', { answer, room: data.room });
            })
            .catch((error) => console.error(error));
    });

    socket.on('STC-set-answer', (answer) => {
        console.log('STC-set-answer');
        rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(answer));

        alert('끝!');
    });

    //////////////////////////////////

    socket.on('STC-ice-candidate', (data) => {
        if (data.candidate) {
            rtcPeerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    });
});

function webRTCJobInit() {
    document.getElementById('join').addEventListener('click', function () {
        socket.emit('CTS-join', room);
        videoPage.style.display = 'block';
    });

    navigator.mediaDevices
        .getUserMedia({
            audio: true,
            video: { width: 1280, height: 720 }
        })
        .then((stream) => {
            userStream = stream;
            userVideo.srcObject = stream;
            userVideo.play();
        })
        .catch((err) => {
            alert(`Couldn't access user media: ${err.message}`);
        });
}

function preparePeerConnection() {
    rtcPeerConnection = new RTCPeerConnection(iceServers);

    rtcPeerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('CTS-ice-candidate', { candidate: event.candidate, room: room });
        }
    };

    rtcPeerConnection.ontrack = (event) => {
        const peerVideo = document.getElementById('peer-video');
        if (event.streams && event.streams[0]) {
            peerVideo.srcObject = event.streams[0];
        }
    };

    // 상대방 트랙 추가 설정
    userStream.getTracks().forEach((track) => {
        rtcPeerConnection.addTrack(track, userStream);
    });
}
