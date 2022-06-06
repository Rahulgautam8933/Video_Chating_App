window.addEventListener('load', (event) => {
    var peer = new Peer()
    var myStream;
    var currentPeer;
    var peerList = [];
    peer.on('open', function (id) {
        document.getElementById("show-peer").innerHTML = id
    })
    peer.on('call', function (call) {
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then((stream) => {
            myStream = stream
            addOurVideo(stream)
            call.answer(stream)
            call.on('stream', function (remoteStream) {
                if (!peerList.includes(call.peer)) {
                    addRemoteVideo(remoteStream)
                    currentPeer = call.PeerConnection
                    peerList.push(call.peer)
                }

            })
        }).catch((err) => {
            console.log(err + "unable to get media")
        })
    })
    document.getElementById("call-peer").addEventListener('click', (e) => {
        let remotePeerId = document.getElementById("peerID").value;
        document.getElementById("show-peer").innerHTML = "connecting" + remotePeerId;
        callPeer(remotePeerId);
    })
    document.getElementById("shareScreen").addEventListener('click', (e) => {
        navigator.mediaDevices.getDisplayMedia({
            video: {
                cursor: "always"
            },
            audio: {
                echoCancellation: true,
                noiseSuppression: true
            }
        }).then((stream) => {
            let videoTrack = stream.getAudioTracks()[0];
            videoTrack.onended = function () {
                stopScreenShare();
            }
            let sender = currentPeer.getSenders().find(function (s) {
                return s.track.kind == videoTrack.kind
            })
            sender.replaceTrack(videoTrack)
        }).catch((err) => {
            console.log("unable to get display media" + err)
        })
    })


    function callPeer(id) {
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then((stream) => {
            myStream = stream
            addOurVideo(stream)
            let call = peer.call(id, stream)
            call.on('stream', function (remoteStream) {
                if (!peerList.includes(call.peer)) {
                    addRemoteVideo(remoteStream)
                    currentPeer = call.PeerConnection
                    peerList.push(call.peer)
                }

            })
        }).catch((err) => {
            console.log(err + "unable to get media")
        })
    }
    function stopScreenShare() {
        let videoTrack = myStream.getVideoTracks()[0];
        var sender = currentPeer.getSenders().find(function (s) {
            return s.track.kind == videoTrack.kind;
        })
        sender.replaceTrack(videoTrack)
    }
    function addRemoteVideo(stream) {
        let video = document.createElement("video");
        video.classList.add("video")
        video.srcObject = stream;
        video.play()
        document.getElementById("remoteVideo").append(video)

    }
    function addOurVideo(stream) {
        let video = document.createElement("video");
        video.classList.add("ourvideo")
        video.srcObject = stream;
        video.play()
        document.getElementById("ourVideo").append(video)

    }

});