import { UserAvatar } from "@/components/user-avatar"
import { useAuth } from "@/context/auth-context"
import { EncryptionPlugin, userMessageToBUserMessage } from "@/context/encryption-plugin"
import * as fireflyContext from "@/context/firefly-context"
import { CallSession } from "@/context/user-call-context"
import { protos as FireflyProtos } from "firefly-client-js"
import { Maximize2, Mic, MicOff, Minimize2, PhoneOff, RefreshCw, Video, VideoOff } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"


enum SessionInitiationStatus {
  initiating,
  initiated,
  uninitiated,
  disposed,
  failed,
}
export default function UserCallPage() {

  const [searchParams, _setSearchParams] = useSearchParams()
  const params = useParams()
  const auth = useAuth()
  const other = params.username!.toString()

  const firefly = fireflyContext.useFirefly()

  const convoId = useMemo(() => {
    const val = Number.parseInt(searchParams.get("convoId") ?? searchParams.get("conversationId") ?? '0')
    if (Number.isNaN(val)) {
      return 0
    } else {
      return val
    }
  }, [searchParams])


  const sessionId = useMemo(() => {
    const sessionId = Number.parseInt(searchParams.get("sessionId") ?? "")
    if (Number.isNaN(sessionId)) {
      return Math.floor(Math.random() * 99999)
    }
    return sessionId

  }, [searchParams])

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOn, setIsVideoOn] = useState<boolean>(searchParams.get("video") == "true" || localStorage.getItem("alwaysEnableVideo") == "true");
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);

  const navigate = useNavigate()

  const getConfiguration = async () => {


    const { iceServers } = (await firefly.service.getWebrtcConfig()) as any as { iceServers: RTCIceServer }

    const config: RTCConfiguration = {
      iceServers: [
        iceServers,
      ]
    }
    return config;
  }


  const session = useRef(new CallSession(
    getConfiguration,
    auth.username!, other, 1000, sessionId, !isMuted, isVideoOn),
  )


  useEffect(() => {
    const onLocalStream = (ev: Event) => {
      const stream = (ev as CustomEvent).detail as (MediaStream | null)
      localVideoElement.current!.srcObject = stream;
    }
    session.current.addEventListener("localStream", onLocalStream)

    const onRemoteStream = (ev: Event) => {
      const stream = (ev as CustomEvent).detail as (MediaStream | null)
      remoteVideoElement.current!.srcObject = stream;
    }
    session.current.addEventListener("remoteStream", onRemoteStream)


    const onConnectionChange = (ev: Event) => {
      const state = (ev as CustomEvent).detail as RTCPeerConnectionState
      console.log({ state })
    }

    session.current.addEventListener("connectionState", onConnectionChange)

    return () => {
      session.current.removeEventListener("localStream", onLocalStream)
      session.current.removeEventListener("remoteStream", onRemoteStream)
      session.current.removeEventListener("connectionState", onConnectionChange)
    }

  }, [])


  useEffect(() => {
    const onCallMessage = (ev: Event) => {
      const callMessage = (ev as CustomEvent).detail as FireflyProtos.CallMessage
      const randomId = Math.floor(Math.random() * 999999)
      console.log(`Sending [${randomId}] to ${other}, ty: ${callMessage.type} ${callMessage.jsonBody}`);

      const userMessageInner = FireflyProtos.UserMessageInner.create({ callMessage })

      const payload = FireflyProtos.UserMessageInner.encode(userMessageInner).finish()

      firefly.encryptAndSend(other, payload).then((response) => {
        console.log(`Sent [${randomId}] ${response.id}`)
      }).catch(console.error)
    }
    session.current.addEventListener("callMessage", onCallMessage)

    return () => session.current.removeEventListener("callMessage", onCallMessage)

  }, [firefly])




  const [sessionInitiated, setSessionInitiated] = useState(SessionInitiationStatus.uninitiated)


  useEffect(() => {
    const accepted = searchParams.get("accepted") == "true"
    const requested = searchParams.get("requested") == "true"
    const sessionId = Number.parseInt(searchParams.get("sessionId")!)
    if (Number.isNaN(sessionId)) {
      console.error("No sessionId provided")
      return
    }

    if (convoId == undefined) {
      console.error("No convoId provided")
      return
    }

    if (sessionInitiated == SessionInitiationStatus.initiating || sessionInitiated == SessionInitiationStatus.initiated) {
      return
    }
    console.log(`Session is being initiated from ${sessionInitiated}`)
    setSessionInitiated(SessionInitiationStatus.initiating)
    session.current.init().then(() => {
      setSessionInitiated(SessionInitiationStatus.initiated)
      if (accepted) {
        session.current.startCall()
      } else if (requested) {
        session.current.requestCall(Date.now() + 60_000)
      }
    }).catch(err => {
      console.error(err)
      setSessionInitiated(SessionInitiationStatus.failed)
    })
  }, [])


  useEffect(() => {
    const cb: fireflyContext.MessageCallbackType = (message) => {

      const msg = FireflyProtos.UserMessageInner.decode(message.text)

      if (message.other != other) {
        return
      }


      if (msg.callMessage) {
        if (msg.callMessage.type == FireflyProtos.CallMessageType.reject || msg.callMessage.type == FireflyProtos.CallMessageType.end) {
          session.current.dispose(true, false)
          navigate(-1)
        } else {
          session.current.onCallMessage(msg.callMessage)
        }

      } else {
        console.warn(`ignoring other message types`)
      }
    }

    firefly.addEventListener(cb)
    return () => firefly.removeEventListener(cb)

  }, [firefly])


  // Call timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = (): void => {
    // callHandler.dispose()

    session.current.endCall()
    navigate(-1)
  };

  const toggleFullscreen = (): void => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (isMinimized) {
    return (
      <div className="minimized-call">
        <div className="minimized-content">
          <div className="minimized-info">
            <UserAvatar username={other!}></UserAvatar>
            <div className="minimized-details">
              <span className="minimized-name">{other}</span>
              <span className="minimized-timer">{formatTime(callDuration)}</span>
            </div>
          </div>
          <div className="minimized-actions">
            <button
              className="minimize-btn"
              onClick={() => setIsMinimized(false)}
            >
              <Maximize2 size={16} />
            </button>
            <button
              className="end-call-btn-mini"
              onClick={handleEndCall}
            >
              <PhoneOff size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  function handleVideo(): void {
    session.current.toggleVideo(!isVideoOn)
    setIsVideoOn(!isVideoOn)
  }

  function handleSpeakerOn(): void {
    if (remoteVideoElement.current == null) return
    remoteVideoElement.current.muted = !isSpeakerOn
    setIsSpeakerOn(!isSpeakerOn)
  }

  function handleMute(): void {
    session.current.toggleMic(isMuted)
    setIsMuted(!isMuted)
  }

  const localVideoElement = useRef<HTMLVideoElement>(null)
  const remoteVideoElement = useRef<HTMLVideoElement>(null)
  const [isSwapped, setIsSwapped] = useState(false)

  function onFlipCamera(): void {
    session.current.flipCamera()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}>
      <div className="relative w-full h-full flex items-center justify-center">

        {/* MAIN DISPLAY */}
        <video
          ref={isSwapped ? localVideoElement : remoteVideoElement}
          autoPlay
          playsInline
          muted={isSwapped}
          className={`w-full h-full object-cover ${isSwapped ? 'scale-x-[-1]' : ''}`}
        />

        {/* SMALL PREVIEW */}
        <video
          ref={isSwapped ? remoteVideoElement : localVideoElement}
          autoPlay
          playsInline
          muted={!isSwapped}
          onClick={() => setIsSwapped((s) => !s)}
          className="w-28 h-40 absolute top-4 right-4 rounded-xl border border-white/50 object-cover cursor-pointer"
          style={{ transform: isSwapped ? 'scaleX(1)' : 'scaleX(-1)' }}
        />

        {/* NAME + TIMER */}
        <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-md px-3 py-2 rounded-lg">
          <div className="text-white font-medium">{other}</div>
          <div className="text-white/80 text-xs">{formatTime(callDuration)}</div>
        </div>

        {/* CONTROLS */}
        <div className="absolute bottom-6 w-full flex justify-center gap-4 px-6">
          <button
            onClick={handleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${isMuted ? 'bg-red-600' : 'bg-white/10'} text-white`}
          >
            {isMuted ? <MicOff /> : <Mic />}
          </button>

          <button
            onClick={handleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${!isVideoOn ? 'bg-red-600' : 'bg-white/10'} text-white`}
          >
            {isVideoOn ? <Video /> : <VideoOff />}
          </button>

          <button onClick={onFlipCamera} className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 text-white">
            <RefreshCw />
          </button>

          <button onClick={() => setIsMinimized(true)} className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 text-white">
            <Minimize2 />
          </button>

          <button onClick={handleEndCall} className="w-12 h-12 rounded-full flex items-center justify-center bg-red-600 text-white">
            <PhoneOff />
          </button>
        </div>
      </div>
    </div>
  )


}
