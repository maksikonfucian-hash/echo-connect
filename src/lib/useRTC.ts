// src/lib/useRTC.ts
import { useRef, useState } from 'react';

export function useRTC(signaling, localAudioElRef) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<'idle'|'calling'|'in-call'|'ringing'|'connecting'>('idle');

  const createPeer = (isCaller=true) => {
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
        // Add TURN config here for production
      ]
    };
    const pc = new RTCPeerConnection(config);
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        signaling.send({ type: 'ice', from: signalingUserId(), to: currentTargetId(), candidate: e.candidate });
      }
    };
    pc.ontrack = (e) => {
      // Assume single remote audio track
      const el = localAudioElRef.current;
      if (el) {
        el.srcObject = e.streams[0];
        el.play().catch(()=>{});
      }
    };
    pcRef.current = pc;
    return pc;
  };

  async function startLocalAudio() {
    if (localStreamRef.current) return localStreamRef.current;
    const s = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    localStreamRef.current = s;
    // attach local playback if needed
    return s;
  }

  async function call(toUserId) {
    setStatus('calling');
    await startLocalAudio();
    const pc = createPeer(true);
    localStreamRef.current!.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current!));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    // send offer via signaling
    signaling.send({ type: 'offer', from: signalingUserId(), to: toUserId, sdp: offer });
    // handle answer via signaling.on('answer', ...)
  }

  async function handleOffer(msg) {
    setStatus('ringing');
    await startLocalAudio();
    const pc = createPeer(false);
    localStreamRef.current!.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current!));
    await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    signaling.send({ type: 'answer', from: signalingUserId(), to: msg.from, sdp: answer });
    setStatus('in-call');
  }

  async function handleAnswer(msg) {
    const pc = pcRef.current;
    if (!pc) return;
    await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    setStatus('in-call');
  }

  function handleIce(msg) {
    const pc = pcRef.current;
    if (!pc) return;
    try {
      pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
    } catch (e) {
      console.warn('ICE add error', e);
    }
  }

  function hangup() {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    setStatus('idle');
  }

  // Helper placeholders — will be injected by caller
  function signalingUserId(){ return (signaling as any).userId; }
  function currentTargetId(){ return (signaling as any).currentTarget; }

  return { call, handleOffer, handleAnswer, handleIce, hangup, status, setStatus };
}
