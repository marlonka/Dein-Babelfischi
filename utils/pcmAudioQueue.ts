const OUTPUT_SAMPLE_RATE = 24000;

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToAudioBuffer(bytes: Uint8Array, audioContext: AudioContext): AudioBuffer {
  const samples = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
  const audioBuffer = audioContext.createBuffer(1, samples.length, OUTPUT_SAMPLE_RATE);
  const channelData = audioBuffer.getChannelData(0);

  for (let i = 0; i < samples.length; i += 1) {
    channelData[i] = samples[i] / 32768;
  }

  return audioBuffer;
}

export class PcmAudioQueue {
  private audioContext: AudioContext | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();

  private getAudioContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextCtor({ sampleRate: OUTPUT_SAMPLE_RATE });
      this.nextStartTime = this.audioContext.currentTime;
    }

    return this.audioContext;
  }

  enqueue(base64Pcm: string): void {
    const audioContext = this.getAudioContext();
    const buffer = bytesToAudioBuffer(base64ToBytes(base64Pcm), audioContext);
    const source = audioContext.createBufferSource();

    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.onended = () => {
      source.disconnect();
      this.sources.delete(source);
    };

    const startAt = Math.max(audioContext.currentTime + 0.015, this.nextStartTime);
    source.start(startAt);
    this.nextStartTime = startAt + buffer.duration;
    this.sources.add(source);
  }

  replay(chunks: string[]): void {
    this.stop();
    for (const chunk of chunks) {
      this.enqueue(chunk);
    }
  }

  stop(): void {
    for (const source of this.sources) {
      try {
        source.stop();
      } catch {
        // Source may already have ended.
      }
    }
    this.sources.clear();

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.nextStartTime = this.audioContext.currentTime;
    }
  }

  async close(): Promise<void> {
    this.stop();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      await this.audioContext.close();
    }
    this.audioContext = null;
  }
}
