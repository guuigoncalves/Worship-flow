const TOM_FREQUENCIAS: Record<string, number> = {
  'C': 261.63,
  'C#': 277.18,
  'D': 293.66,
  'Eb': 311.13,
  'E': 329.63,
  'F': 349.23,
  'F#': 369.99,
  'G': 392.00,
  'Ab': 415.30,
  'A': 440.00,
  'Bb': 466.16,
  'B': 493.88,
};

let audioContext: AudioContext | null = null;
let oscillators: OscillatorNode[] = [];
let gainNode: GainNode | null = null;
let releaseTimeout: ReturnType<typeof setTimeout> | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

export function iniciarPad(tom: string): void {
  pararPad();

  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }

  const freq = TOM_FREQUENCIAS[tom] ?? 440;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.6);
  masterGain.connect(ctx.destination);
  gainNode = masterGain;

  const harmonicos = [
    { ratio: 1, gain: 0.45, type: 'sine' as OscillatorType },
    { ratio: 2, gain: 0.18, type: 'sine' as OscillatorType },
    { ratio: 3, gain: 0.08, type: 'sine' as OscillatorType },
    { ratio: 4, gain: 0.04, type: 'sine' as OscillatorType },
    { ratio: 0.5, gain: 0.10, type: 'sine' as OscillatorType },
  ];

  harmonicos.forEach((harmonico) => {
    const osc = ctx.createOscillator();
    osc.type = harmonico.type;
    osc.frequency.value = freq * harmonico.ratio;

    const oscGain = ctx.createGain();
    oscGain.gain.value = harmonico.gain;

    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start();

    oscillators.push(osc);
  });
}

export function pararPad(): void {
  if (releaseTimeout) {
    clearTimeout(releaseTimeout);
    releaseTimeout = null;
  }

  if (gainNode && audioContext && audioContext.state !== 'closed') {
    const ctx = audioContext;
    gainNode.gain.cancelScheduledValues(ctx.currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);

    releaseTimeout = setTimeout(() => {
      oscillators.forEach((osc) => {
        try { osc.stop(); } catch {}
      });
      oscillators = [];
      try { ctx.close(); } catch {}
      audioContext = null;
      gainNode = null;
      releaseTimeout = null;
    }, 900);
  } else {
    oscillators.forEach((osc) => {
      try { osc.stop(); } catch {}
    });
    oscillators = [];
    audioContext = null;
    gainNode = null;
  }
}
