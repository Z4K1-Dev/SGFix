'use client'

import { useState, useEffect, useRef } from 'react'

/**
 * Hook untuk mengelola suara notifikasi
 * @param enabled - Status apakah suara notifikasi diaktifkan
 * @param soundPath - Path ke file suara notifikasi
 * @returns Fungsi dan status untuk manajemen suara notifikasi
 */
export function useNotificationSound(enabled: boolean = true, soundPath: string = '/sound/notif.wav') {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(enabled)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  
  // Inisialisasi audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(soundPath)
      audioRef.current.preload = 'auto'
      
      // Tangani error saat memutar audio
      audioRef.current.addEventListener('error', (e) => {
        console.error('Error loading notification sound:', e)
        // Jika file suara tidak ditemukan, gunakan fallback beep
        playBeep()
      })
    }
    
    // Cleanup saat komponen unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close()
        } catch (e) {
          console.warn('Error closing audio context:', e)
        }
      }
    }
  }, [soundPath])
  
  // Inisialisasi AudioContext saat ada interaksi pengguna pertama kali
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleFirstInteraction = () => {
        if (!audioContextRef.current) {
          try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContext();
            console.log('AudioContext initialized on first interaction');
          } catch (error) {
            console.error('Failed to initialize AudioContext:', error);
          }
        }
        
        // Hapus event listener setelah inisialisasi
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
      };
      
      // Tambahkan event listener untuk interaksi pengguna pertama kali
      window.addEventListener('click', handleFirstInteraction);
      window.addEventListener('touchstart', handleFirstInteraction);
      window.addEventListener('keydown', handleFirstInteraction);
      
      return () => {
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
      };
    }
  }, []);

  /**
   * Memutar suara notifikasi menggunakan Web Audio API sebagai fallback
   */
 const playBeep = () => {
    if (typeof window !== 'undefined') {
      try {
        let audioContext: AudioContext;
        
        // Gunakan AudioContext yang telah diinisialisasi atau buat yang baru
        if (audioContextRef.current) {
          audioContext = audioContextRef.current;
        } else {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          audioContext = new AudioContext();
          audioContextRef.current = audioContext;
        }
        
        // Resume AudioContext jika suspended (karena autoplay policy)
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            createAndPlayOscillator(audioContext);
          }).catch((error) => {
            console.error('Failed to resume audio context:', error);
          });
        } else {
          createAndPlayOscillator(audioContext);
        }
      } catch (error) {
        console.error('Error playing beep sound:', error);
      }
    }
 }

  // Fungsi terpisah untuk membuat dan memutar oscillator
  const createAndPlayOscillator = (audioContext: AudioContext) => {
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      setTimeout(() => {
        try {
          oscillator.stop(); // stop() tidak mengembalikan Promise
        } catch (stopError) {
          // Beberapa browser mungkin melempar error jika oscillator sudah berhenti
          console.warn('Error stopping oscillator:', stopError);
        }
        // Tutup audio context setelah selesai untuk menghemat sumber daya
        setTimeout(() => {
          try {
            audioContext.close();
          } catch (closeError) {
            console.warn('Error closing audio context:', closeError);
          }
        }, 10);
      }, 200);
    } catch (error) {
      console.error('Error in oscillator creation:', error);
    }
  }

  /**
   * Memutar suara notifikasi
   */
 const playSound = () => {
    // Hapus pengecekan soundEnabled dari sini karena sudah dicek di luar fungsi
    if (typeof window === 'undefined') return
    
    console.log('playSound called - attempting to play notification sound');
    console.log('Current AudioContext state:', audioContextRef.current?.state);
    setIsPlaying(true)
    
    if (audioRef.current) {
      // Reset audio ke awal sebelum memutar
      audioRef.current.currentTime = 0
      
      // Coba untuk resume AudioContext jika perlu sebelum memutar suara
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().then(() => {
          console.log('AudioContext resumed, attempting to play sound');
        }).catch((error) => {
          console.error('Failed to resume AudioContext:', error);
        });
      }
      
      // Mainkan audio
      audioRef.current.play().then(() => {
        console.log('Notification sound played successfully from audio file');
      }).catch(error => {
        console.error('Error playing notification sound from file:', error)
        // Jika gagal memutar file audio, gunakan fallback beep
        try {
          console.log('Trying fallback beep sound');
          playBeep()
        } catch (beepError) {
          console.error('Fallback beep also failed:', beepError)
        }
      }).finally(() => {
        setIsPlaying(false)
      })
    } else {
      console.log('Audio element not available, trying fallback beep');
      // Jika audio tidak tersedia, gunakan fallback beep
      try {
        playBeep()
      } catch (beepError) {
        console.error('Fallback beep failed:', beepError)
      }
      setIsPlaying(false)
    }
  }

  /**
   * Toggle status suara notifikasi
   */
 const toggleSound = () => {
    const newStatus = !soundEnabled
    setSoundEnabled(newStatus)
    
    // Simpan preferensi ke localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('notificationSoundEnabled', JSON.stringify(newStatus))
    }
  }

 // Muat preferensi dari localStorage saat inisialisasi
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPreference = localStorage.getItem('notificationSoundEnabled')
      if (savedPreference !== null) {
        setSoundEnabled(JSON.parse(savedPreference))
      }
    }
 }, [])

  return {
    soundEnabled,
    isPlaying,
    playSound,
    toggleSound,
    setSoundEnabled
  }
}