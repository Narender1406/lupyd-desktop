import { createContext, useContext, useEffect, useState } from "react";

type CallEvent = "localStream" | "remoteStream" | "connectionState" | "callMessage";

export class CallSession extends EventTarget {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private isMicEnabled = true;
  private isVideoEnabled = true;
  private currentCamera: string | null = null;
  private username: string;
  private remoteUser: string;
  private initialRetryDuration: number;
  readonly rtcConfiguration: RTCConfiguration

  // sendCallMessage: (data: Uint8Array) => Promise<void>;

  private sessionId: number

  getSessionId() { return this.sessionId };
  getLocalStream() { return this.localStream };
  getRemoteStream() { return this.remoteStream };
  getIsMicEnabled() {
    return this.isMicEnabled;
  }
  getIsVideoEnabled() {
    return this.isVideoEnabled;
  }

  constructor(
    rtcConfiguration: RTCConfiguration,
    username: string,
    remoteUser: string,
    initialRetryDuration: number,
    sessionId: number = Math.floor(Math.random() * 99999),
    isMicEnabled = true,
    isVideoEnabled = true,
  ) {
    super()
    this.username = username;
    this.remoteUser = remoteUser;
    this.initialRetryDuration = initialRetryDuration;
    this.sessionId = sessionId;
    this.isMicEnabled = isMicEnabled
    this.isVideoEnabled = isVideoEnabled
    this.rtcConfiguration = rtcConfiguration
  }

  private _sendCallMessage(payload: any) {
    payload["from"] = this.username;
    payload["sessionId"] = this.sessionId;
    const data = JSON.stringify(payload);
    this.emit("callMessage", data)
  }

  private _currentRetryDuration = 0;
  retryDuration() {
    this._currentRetryDuration += this._currentRetryDuration;
    return this._currentRetryDuration;
  }
  resetRetryDuration() {
    this._currentRetryDuration = this.initialRetryDuration;
  }

  async init() {
    this.pc = new RTCPeerConnection(this.rtcConfiguration);

    this.pc.onconnectionstatechange = () => {
      this.emit("connectionState", this.pc!.connectionState);
      if (
        this.pc!.connectionState === "failed" ||
        this.pc!.connectionState === "disconnected"
      ) {
        // this.silentReconnect();
        setTimeout(() => {
          this.reconnect();
        }, this.retryDuration());
      }

      if (this.pc!.connectionState === "connected") {
        this.resetRetryDuration();
      }
    };

    this.pc.onicecandidate = (e) => {
      if (e.candidate) {
        this._sendCallMessage({
          type: "candidate",
          candidate: e.candidate,
        });
      }
    };

    this.pc.ontrack = (e) => {
      if (!this.remoteStream) this.remoteStream = new MediaStream();
      this.remoteStream.addTrack(e.track);
      this.emit("remoteStream", this.remoteStream);
    };

    if (!this.localStream) {
      await this.setupLocalMedia();
    } else {
      this.localStream
        .getTracks()
        .forEach((track) => this.pc?.addTrack(track, this.localStream!));
    }
  }

  private async setupLocalMedia() {
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: this.isVideoEnabled,
      audio: this.isMicEnabled,
    });

    this.emit("localStream", this.localStream);

    this.localStream
      .getTracks()
      .forEach((track) => this.pc?.addTrack(track, this.localStream!));
  }

  async onCallMessage(data: Uint8Array) {

    const msg = JSON.parse(new TextDecoder().decode(data));

    if (msg.from !== this.remoteUser) return;
    if (msg.sessionId !== this.sessionId) return;

    switch (msg.type) {
      case "offer":
        await this.pc!.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        const answer = await this.pc!.createAnswer();
        await this.pc!.setLocalDescription(answer);
        this._sendCallMessage({ type: "answer", sdp: answer });
        break;

      case "answer":
        await this.pc!.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        break;

      case "candidate":
        await this.pc?.addIceCandidate(msg.candidate);
        break;

      case "request":
      case "reject":
      case "end":
    }
  }

  async startCall() {
    const offer = await this.pc!.createOffer();
    await this.pc!.setLocalDescription(offer);
    this._sendCallMessage({ type: "offer", sdp: offer });
  }

  async requestCall(exp: number) {
    this._sendCallMessage({ type: "request", exp })
  }

  async endCall() {
    this._sendCallMessage({
      type: "end"
    })
  }

  toggleMic(enable: boolean) {
    this.localStream?.getAudioTracks().forEach((t) => (t.enabled = enable));
    this.isMicEnabled = enable;
  }

  toggleVideo(enable: boolean) {
    this.localStream?.getVideoTracks().forEach((t) => (t.enabled = enable));
    this.isVideoEnabled = enable;
  }

  async flipCamera() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((d) => d.kind === "videoinput");
    if (cameras.length < 2) return;

    const currentIndex = cameras.findIndex(
      (c) => c.deviceId === this.currentCamera,
    );
    const next = cameras[(currentIndex + 1) % cameras.length];
    this.currentCamera = next.deviceId;

    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: next.deviceId },
      audio: this.isMicEnabled,
    });

    const newTrack = newStream.getVideoTracks()[0];
    this.pc
      ?.getSenders()
      .find((s) => s.track?.kind === "video")
      ?.replaceTrack(newTrack);

    this.localStream = newStream;
    this.emit("localStream", this.localStream);
  }

  private shouldReconnect = true;

  private async reconnect() {

    if (!this.shouldReconnect) {
      return;
    }

    const oldStream = this.localStream;
    await this.dispose(false); // keep local stream alive
    await this.init(); // recreate RTCPeerConnection
    await this.startCall(); // resend offer

    if (oldStream) this.emit("localStream", oldStream);
  }

  async dispose(stopMedia = true, allowReconnecting = true) {
    this.pc?.close();
    this.pc = null;
    this.shouldReconnect = allowReconnecting;
    if (stopMedia) {
      this.localStream?.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
    this.remoteStream = null;
  }

  private emit(event: CallEvent, data: any) {
    this.dispatchEvent(new CustomEvent(event, {
      detail: data
    }))
  }
}

// type UserCallContextType = {
//   init: (me: string, other: string, onCallMessage: (data: Uint8Array) => Promise<void>, initialRetryDuration: number, sessionId: number,
//     isMicOn: boolean,
//     isVideoOn: boolean,
//   ) => Promise<CallSession>,
//   dispose: () => void,
//   localStream: MediaStream | null,
//   remoteStream: MediaStream | null,
//   session: CallSession | null
//   sessionState: RTCPeerConnectionState | null,
// }

// const UserCallContext = createContext<UserCallContextType | undefined>(undefined)

// export function UserCallHandlerProvider({ children }: { children: React.ReactNode }) {

//   const [session, setSession] = useState<CallSession | null>(null);
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

//   const init = async (me: string, other: string, onCallMessage: (data: Uint8Array) => Promise<void>, initialRetryDuration: number, sessionId: number, isMicOn: boolean, isVideoOn: boolean) => {

//     if (session != null) {
//       throw Error("Session already exists")
//     }

//     const newSession = new CallSession(me, other, onCallMessage, initialRetryDuration, sessionId,isMicOn, isVideoOn)
//     setSession(newSession)

//     await newSession.init().then(() => console.log("Call Session initiated"))

//     return newSession
//   }

//   const [sessionState, setSessionState] = useState<RTCPeerConnectionState | null>(null)

//   useEffect(() => {
//     if (session == null) return
//     session.on("connectionState", (state: RTCPeerConnectionState) => {
//       setSessionState(state)
//     })
//     session.on("localStream", (stream: MediaStream) => {
//       setLocalStream(stream)
//     })
//     session.on("remoteStream", (stream: MediaStream) => {
//       setRemoteStream(stream)
//     })
//   }, [session])

//   const dispose = () => {
//     if (session == null) return
//     session.leave()
//     setSession(null)
//   }


//   return (
//     <UserCallContext.Provider value={{ init, dispose, localStream, remoteStream, session, sessionState }}>
//       {children}
//     </UserCallContext.Provider>
//   )
// }


// export function useUserCallHandler() {
//   const context = useContext(UserCallContext)
//   if (context === undefined) {
//     throw new Error("useUserCallHandler must be used within an UserCallHandlerProvider")
//   }
//   return context
// }
