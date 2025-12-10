// src/composables/useRTC.ts
import { ref, Ref, readonly } from 'vue';

interface SignalingMessage {
  type: string;
  from: string;
  to: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

interface Signaling {
  send: (msg: SignalingMessage) => void;
  userId: string;
  currentTarget: string;
}

export function useRTC(signaling: Signaling, localAudioElRef: Ref<HTMLAudioElement | null>) {
  const pcRef = ref<RTCPeerConnection | null>(null);
  const localStreamRef = ref<MediaStream | null>(null);
  const status = ref<'idle' | 'calling' | 'in-call' | 'ringing' | 'connecting'>('idle');

  const createPeer = (isCaller = true) => {
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
        // Add TURN config here for production
      ]
    };
    const pc = new RTCPeerConnection(config);
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        signaling.send({
          type: 'ice',
          from: signalingUserId(),
          to: currentTargetId(),
          candidate: e.candidate
        });
      }
    };
    pc.ontrack = (e) => {
      const el = localAudioElRef.value;
      if (el) {
        el.srcObject = e.streams[0];
        el.play().catch(() => {});
      }
    };
    pcRef.value = pc;
    return pc;
  };

  const startLocalAudio = async () => {
    if (localStreamRef.value) return localStreamRef.value;
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.value = s;
      return s;
    } catch (error) {
      console.error('Failed to get user media:', error);
      throw error;
    }
  };

  const call = async (toUserId: string) => {
    status.value = 'calling';
    try {
      await startLocalAudio();
      const pc = createPeer(true);
      localStreamRef.value!.getTracks().forEach(t => pc.addTrack(t, localStreamRef.value!));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      signaling.send({
        type: 'offer',
        from: signalingUserId(),
        to: toUserId,
        sdp: offer
      });
    } catch (error) {
      console.error('Call failed:', error);
      status.value = 'idle';
      throw error;
    }
  };

  const handleOffer = async (msg: SignalingMessage) => {
    status.value = 'ringing';
    try {
      await startLocalAudio();
      const pc = createPeer(false);
      localStreamRef.value!.getTracks().forEach(t => pc.addTrack(t, localStreamRef.value!));
      await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp!));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      signaling.send({
        type: 'answer',
        from: signalingUserId(),
        to: msg.from,
        sdp: answer
      });
      status.value = 'in-call';
    } catch (error) {
      console.error('Handle offer failed:', error);
      status.value = 'idle';
      throw error;
    }
  };

  const handleAnswer = async (msg: SignalingMessage) => {
    const pc = pcRef.value;
    if (!pc) return;
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp!));
      status.value = 'in-call';
    } catch (error) {
      console.error('Handle answer failed:', error);
      throw error;
    }
  };

  const handleIce = (msg: SignalingMessage) => {
    const pc = pcRef.value;
    if (!pc) return;
    try {
      pc.addIceCandidate(new RTCIceCandidate(msg.candidate!));
    } catch (e) {
      console.warn('ICE add error', e);
    }
  };

  const hangup = () => {
    if (pcRef.value) {
      pcRef.value.close();
      pcRef.value = null;
    }
    if (localStreamRef.value) {
      localStreamRef.value.getTracks().forEach(t => t.stop());
      localStreamRef.value = null;
    }
    status.value = 'idle';
  };

  // Helper placeholders
  const signalingUserId = () => signaling.userId;
  const currentTargetId = () => signaling.currentTarget;

  return {
    call,
    handleOffer,
    handleAnswer,
    handleIce,
    hangup,
    status: readonly(status)
  };
}