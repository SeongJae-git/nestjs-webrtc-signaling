/* eslint-disable */

const socket = io('http://localhost:50080');

let iceServers = {
    iceServers: [{ urls: 'stun:stun.services.mozilla.com' }, { urls: 'stun:stun.l.google.com:19302' }]
};

let creator = false; // 발신자 구분용
let room; //
let userStream; // userAgent
let rtcPeerConnection; // RTC의 Peer 객체
let iceCandidatesQueue = []; // remoteDescription이 등록되기 전 Candidate 교환 방지용

const userVideo = document.getElementById('user-video');
const peerVideo = document.getElementById('peer-video');

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
            .then(() => {
                addIceCandidatesFromQueue();

                return rtcPeerConnection.createAnswer();
            })
            .then((answer) => {
                rtcPeerConnection.setLocalDescription(new RTCSessionDescription(answer));

                return answer;
            })
            .then((answer) => {
                socket.emit('CTS-answer', { answer, room: data.room });
            })
            .catch((error) => console.error(error));
    });

    socket.on('STC-set-answer', (answer) => {
        console.log('STC-set-answer');
        rtcPeerConnection
            .setRemoteDescription(new RTCSessionDescription(answer))
            .then(() => {
                addIceCandidatesFromQueue();
            })
            .catch((error) => {
                console.error(`Error setting remote description: ${error.toString()}`);
            });
    });

    socket.on('STC-ice-candidate', (data) => {
        console.log('STC-ice-candidate 호출');
        if (rtcPeerConnection && data.candidate) {
            const candidate = new RTCIceCandidate(data.candidate);

            if (rtcPeerConnection.remoteDescription && rtcPeerConnection.remoteDescription.type) {
                rtcPeerConnection.addIceCandidate(candidate).catch((error) => {
                    console.log(`Failed to add ICE Candidate: ${error.toString()}`);
                });
            } else {
                iceCandidatesQueue.push(candidate);
            }
        }
    });
});

function webRTCJobInit() {
    document.getElementById('join').addEventListener('click', function () {
        room = document.getElementById('room-name').value;
        socket.emit('CTS-join', room);
    });

    navigator.mediaDevices
        .getUserMedia({
            audio: true,
            video: { width: 1280, height: 720 }
        })
        .then((stream) => {
            userStream = stream;
            userVideo.srcObject = stream;
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

function addIceCandidatesFromQueue() {
    iceCandidatesQueue.forEach((candidate) => {
        rtcPeerConnection.addIceCandidate(candidate).catch((error) => {
            console.error(`Failed to add queued ICE Candidate: ${error.toString()}`);
        });
    });

    document.getElementById('camera-placeholder-local').style.display = 'none';
    document.getElementById('camera-placeholder-remote').style.display = 'none';
    peerVideo.style.display = 'block';
    userVideo.style.display = 'block';
    userVideo.play();

    iceCandidatesQueue = [];
}
