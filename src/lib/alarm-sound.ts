/**
 * Plays an audible alarm chime from the foreground app. Service workers can't play audio
 * (no AudioContext in that scope), so the push handler in worker/index.js only shows the
 * system notification and posts a message to any open tab — this is what that tab plays in
 * response, giving alarms an actual sound instead of relying on the OS's default (often
 * silent, or a generic one-shot) notification sound.
 */
export function playAlarmSound(): void {
  try {
    const AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;
    const ctx = new AudioContextCtor();

    // Three ascending short tones — deliberately distinct from a generic notification blip.
    const notes = [880, 1108, 1318]; // A5, C#6, E6
    const noteDuration = 0.16;
    const gap = 0.06;

    notes.forEach((frequency, index) => {
      const startAt = ctx.currentTime + index * (noteDuration + gap);
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0, startAt);
      gainNode.gain.linearRampToValueAtTime(0.25, startAt + 0.015);
      gainNode.gain.linearRampToValueAtTime(0, startAt + noteDuration);
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + noteDuration);
    });

    const totalDuration = notes.length * (noteDuration + gap);
    setTimeout(() => void ctx.close(), (totalDuration + 0.2) * 1000);
  } catch {
    // Audio is a nice-to-have on top of the system notification, never a hard requirement.
  }
}
