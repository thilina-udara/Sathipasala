class SoundManager {
  constructor() {
    this.sounds = {};
    this.muted = false;
    this.volume = 0.5; // 50% volume by default
    
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      this.muted = localStorage.getItem('sathipasala_muted') === 'true';
      const savedVolume = localStorage.getItem('sathipasala_volume');
      if (savedVolume) this.volume = parseFloat(savedVolume);
    }
  }

  load(id, url) {
    if (this.sounds[id]) {
      return this.sounds[id];
    }

    // Create audio element but don't try to load the file if it doesn't exist
    const audio = new Audio();
    audio.volume = this.muted ? 0 : this.volume;
    
    // Only set src if running in browser and the URL is provided
    if (typeof window !== 'undefined' && url) {
      try {
        audio.src = url;
        // Handle errors silently to prevent breaking the app if sounds aren't available
        audio.onerror = () => console.log(`Sound file not found: ${url}`);
      } catch (e) {
        console.log('Error loading sound:', e);
      }
    }
    
    this.sounds[id] = audio;
    return audio;
  }

  play(id) {
    const sound = this.sounds[id];
    if (!sound) {
      console.log(`Sound not found: ${id}`);
      return Promise.resolve();
    }
    
    // Reset the audio to the beginning if it's already playing
    sound.currentTime = 0;
    
    // Return promise but catch any errors to prevent breaking the app
    return sound.play().catch(e => {
      console.log('Error playing sound:', e);
    });
  }

  stop(id) {
    const sound = this.sounds[id];
    if (sound) {
      try {
        sound.pause();
        sound.currentTime = 0;
      } catch (e) {
        console.log('Error stopping sound:', e);
      }
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    // Update all sounds with new volume
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.muted ? 0 : this.volume;
    });
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('sathipasala_volume', this.volume.toString());
    }
  }

  mute() {
    this.muted = true;
    
    // Mute all sounds
    Object.values(this.sounds).forEach(sound => {
      sound.volume = 0;
    });
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('sathipasala_muted', 'true');
    }
  }

  unmute() {
    this.muted = false;
    
    // Restore volume to all sounds
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume;
    });
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('sathipasala_muted', 'false');
    }
  }

  toggleMute() {
    if (this.muted) {
      this.unmute();
    } else {
      this.mute();
    }
    return this.muted;
  }
}

// Create and export a singleton instance
const soundManager = new SoundManager();
export default soundManager;
