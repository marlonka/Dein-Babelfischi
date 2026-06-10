import { useCallback, useRef, useState } from 'react';

const TARGET_SAMPLE_RATE = 16000;
const CHUNK_SAMPLES = 1600;

function int16ToBase64(samples: Int16Array): string {
  const bytes = new Uint8Array(samples.buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function downsampleTo16Khz(input: Float32Array, inputSampleRate: number): Int16Array {
  if (inputSampleRate === TARGET_SAMPLE_RATE) {
    return floatToInt16(input);
  }

  const ratio = inputSampleRate / TARGET_SAMPLE_RATE;
  const outputLength = Math.floor(input.length / ratio);
  const output = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i += 1) {
    output[i] = input[Math.floor(i * ratio)] ?? 0;
  }

  return floatToInt16(output);
}

function floatToInt16(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, input[i]));
    output[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }
  return output;
}

function calculateRms(input: Float32Array): number {
  let sumSquares = 0;
  for (let i = 0; i < input.length; i += 1) {
    sumSquares += input[i] * input[i];
  }
  return Math.sqrt(sumSquares / input.length);
}

export function useLiveMicrophone() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [amplitude, setAmplitude] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const pendingSamplesRef = useRef<number[]>([]);

  const stop = useCallback(() => {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    audioContextRef.current?.close();

    processorRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    audioContextRef.current = null;
    pendingSamplesRef.current = [];
    setAmplitude(0);
    setIsStreaming(false);
  }, []);

  const start = useCallback(async (onChunk: (base64Pcm: string) => void) => {
    stop();

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextCtor();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      setAmplitude(calculateRms(input));

      const samples = downsampleTo16Khz(input, audioContext.sampleRate);
      const pending = pendingSamplesRef.current;
      for (let i = 0; i < samples.length; i += 1) {
        pending.push(samples[i]);
      }

      while (pending.length >= CHUNK_SAMPLES) {
        const chunk = pending.splice(0, CHUNK_SAMPLES);
        onChunk(int16ToBase64(Int16Array.from(chunk)));
      }
    };

    source.connect(processor);
    processor.connect(audioContext.destination);

    streamRef.current = stream;
    audioContextRef.current = audioContext;
    sourceRef.current = source;
    processorRef.current = processor;
    setIsStreaming(true);
  }, [stop]);

  return { isStreaming, amplitude, start, stop };
}
