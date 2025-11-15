
import { protos as FireflyProtos } from "firefly-client-js"


type CallEvent = "localStream" | "remoteStream" | "connectionState" | "callMessage";

export class CallSession extends EventTarget {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private isMicEnabled = true;
  private isVideoEnabled = true;
  private username: string;
  private remoteUser: string;
  private initialRetryDuration: number;
  readonly rtcConfiguration: () => Promise<RTCConfiguration>

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

  maxRetries = 4
  retriesLeft = this.maxRetries

  constructor(
    rtcConfiguration: () => Promise<RTCConfiguration>,
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

  private _sendCallMessage(type: FireflyProtos.CallMessageType, jsonBody: string) {
    const msg = FireflyProtos.CallMessage.create({
      type,
      jsonBody,
      sessionId: this.sessionId,
    })

    this.emit("callMessage", msg)
  }

  private _currentRetryDuration = 0;
  retryDuration() {
    this._currentRetryDuration += this._currentRetryDuration;
    return this._currentRetryDuration;
  }
  resetRetryDuration() {
    this._currentRetryDuration = this.initialRetryDuration;
    this.retriesLeft = this.maxRetries;
  }

  async init() {
    if (this.pc && (this.pc.connectionState == "connected" || this.pc.connectionState == "connecting" || this.pc.connectionState == "new")) {
      console.warn(`Not reinitiating as in the process of connecting`)
      return;
    }


    this.pc = new RTCPeerConnection(await this.rtcConfiguration());

    this.pc.onconnectionstatechange = () => {
      this.emit("connectionState", this.pc!.connectionState);
      if (
        this.pc!.connectionState === "failed" ||
        this.pc!.connectionState === "disconnected"
      ) {
        if (this.retriesLeft <= 0) {
          return;
        }
        // this.silentReconnect();
        setTimeout(() => {
          console.log(`Reconnecting because connection state is ${this.pc!.connectionState}`)
          this.reconnect();
          this.retriesLeft -= 1;
        }, this.retryDuration());
      }

      if (this.pc!.connectionState === "connected") {
        this.resetRetryDuration();
      }
    };

    this.pc.onicecandidate = (e) => {
      if (e.candidate) {
        this._sendCallMessage(
          FireflyProtos.CallMessageType.candidate,
          JSON.stringify(e.candidate.toJSON()),
        );
      }
    };

    this.pc.ontrack = (e) => {
      if (!this.remoteStream) this.remoteStream = new MediaStream();
      console.log(`Remote Track: ${e.track.id} ${e.track.kind}`)
      this.remoteStream.addTrack(e.track);
      this.emit("remoteStream", this.remoteStream);
    };

    this.pc.onnegotiationneeded = async _ => {
      const offer = await this.pc!.createOffer()
      this.pc!.setLocalDescription(offer)

      this._sendCallMessage(FireflyProtos.CallMessageType.offer, JSON.stringify(offer));
    }

    if (!this.localStream) {
      await this.setupLocalMedia();
    }
    this.localStream!
      .getTracks()
      .forEach((track) => {

        console.log(`Adding track to RTCPeerConnection ${track.id} ${track.kind} ${this.pc !== undefined}`)

        this.pc?.addTrack(track, this.localStream!)

      });
  }


  private async setupLocalMedia() {

    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: !this.isVideoEnabled ? false : {
        facingMode: this.facingMode
      },
      audio: this.isMicEnabled,
    });

    console.log({
      video: this.isVideoEnabled,
      audio: this.isMicEnabled,
    })

    if (this.isVideoEnabled) {
      this.facingMode = "user";
    }

    this.emit("localStream", this.localStream);
  }

  async onCallMessage(msg: FireflyProtos.CallMessage) {
    if (msg.sessionId !== this.sessionId) return;

    console.log(`Received Message of Type: ${msg.type} ${msg.jsonBody}`)

    switch (msg.type) {
      case FireflyProtos.CallMessageType.offer:
        await this.pc!.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg.jsonBody)));
        const answer = await this.pc!.createAnswer();
        await this.pc!.setLocalDescription(answer);
        this._sendCallMessage(FireflyProtos.CallMessageType.answer, JSON.stringify(answer));
        break;

      case FireflyProtos.CallMessageType.answer:
        await this.pc!.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg.jsonBody)));
        break;

      case FireflyProtos.CallMessageType.candidate:
        await this.pc?.addIceCandidate(JSON.parse(msg.jsonBody));
        break;
    }
  }

  async startCall() {
    const offer = await this.pc!.createOffer();
    await this.pc!.setLocalDescription(offer);
    this._sendCallMessage(FireflyProtos.CallMessageType.offer, JSON.stringify(offer));
  }

  async requestCall(exp: number) {
    this._sendCallMessage(FireflyProtos.CallMessageType.request, JSON.stringify({ exp }))
  }

  async endCall() {
    this._sendCallMessage(FireflyProtos.CallMessageType.end, "")

    this.dispose(true, false)
  }

  toggleMic(enable: boolean) {
    this.localStream?.getAudioTracks().forEach((t) => (t.enabled = enable));
    this.isMicEnabled = enable;
  }

  facingMode: string | undefined

  async toggleVideo(enable: boolean) {
    this.isVideoEnabled = enable;
    if (this.facingMode) {
      console.log(`toggling video ${this.facingMode} ${enable}`)

      this.localStream?.getVideoTracks().forEach((t) => (t.enabled = enable));
      return
    }

    if (!enable) {
      return
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
      }
    })

    this.facingMode = "user"
    const newTrack = stream.getVideoTracks()[0]
    {
      const oldTrack = this.pc?.getSenders().find((s) => s.track?.kind == "video")
      if (oldTrack) {
        oldTrack.replaceTrack(newTrack)
      } else {
        this.pc?.addTrack(newTrack);
      }
    }
    {
      const oldTrack = this.localStream?.getVideoTracks()[0]

      if (oldTrack)
        this.localStream?.removeTrack(oldTrack)
      this.localStream?.addTrack(newTrack)
    }
    console.log(`Replaced old video track`)
  }

  async flipCamera() {
    if (!this.facingMode) {
      return
    }
    const newFacingMode = this.facingMode === "user" ? "environment" : "user"
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: newFacingMode },
    });

    this.facingMode = newFacingMode;

    const newTrack = newStream.getVideoTracks()[0];
    this.pc
      ?.getSenders()
      .find((s) => s.track?.kind === "video")
      ?.replaceTrack(newTrack);

    const oldTrack = this.localStream?.getVideoTracks()[0]
    if (oldTrack) {
      this.localStream!.removeTrack(oldTrack)
    }
    this.localStream!.addTrack(newTrack);
    console.log(`Replaced old track`);
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
