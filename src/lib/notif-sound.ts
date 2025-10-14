"use client"

let audio: HTMLAudioElement | null = null

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio("/sound/notif.wav")
    audio.preload = "auto"
    audio.volume = 1.0
  }
  return audio
}

export async function playNotifSound(): Promise<void> {
  try {
    const el = getAudio()
    await el.play()
  } catch (err) {
    // Biasanya diblokir sebelum ada user gesture; cukup log saja.
    console.warn("[notif-sound] play blocked or failed:", (err as any)?.message || err)
  }
}

// Opsional: panggil ini sekali setelah ada user gesture (click/keydown) untuk unlock autoplay di iOS/Safari.
export function primeNotifSoundOnce(): void {
  const once = () => {
    const el = getAudio()
    // Coba play + pause singkat untuk unlock; abaikan error
    el.play().then(() => el.pause()).catch(() => {})
    window.removeEventListener("pointerdown", once)
    window.removeEventListener("keydown", once)
    window.removeEventListener("touchstart", once)
  }
  window.addEventListener("pointerdown", once, { once: true })
  window.addEventListener("keydown", once, { once: true })
  window.addEventListener("touchstart", once, { once: true })
}

