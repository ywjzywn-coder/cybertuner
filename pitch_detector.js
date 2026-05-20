/**
 * ==========================================================================
 * CyberTuner - Audio Pitch Detection Algorithms
 * Uses Time-Domain Autocorrelation with Parabolic Interpolation
 * ==========================================================================
 */

const PitchDetector = {
  // Configurable thresholds for tuning
  RMS_THRESHOLD: 0.008, // Minimum signal power to process (prevents feedback on silence)
  CENTER_CLIP_RATIO: 0.2, // Center clipping threshold ratio to suppress harmonics
  
  // Audio notes standard mapping
  NOTE_NAMES: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],

  /**
   * Performs high-accuracy autocorrelation pitch detection on time domain buffer
   * @param {Float32Array} buffer - The raw time-domain audio samples (Float32 in [-1, 1])
   * @param {number} sampleRate - The current audio system sample rate (e.g., 44100 or 48000)
   * @returns {number} The fundamental frequency detected (Hz), or -1 if no pitch is found
   */
  detectPitch(buffer, sampleRate) {
    const bufferSize = buffer.length;
    
    // 1. Calculate Root Mean Square (RMS) amplitude to ensure signal is loud enough
    let sumOfSquares = 0;
    for (let i = 0; i < bufferSize; i++) {
      sumOfSquares += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sumOfSquares / bufferSize);
    
    // If signal is too quiet (noise floor), exit early
    if (rms < this.RMS_THRESHOLD) {
      return -1;
    }

    // 2. Preprocessing: Center Clipping to remove low-amplitude harmonic components
    // This helps emphasize the fundamental period peaks in the autocorrelation function
    const clippedBuffer = new Float32Array(bufferSize);
    let maxVal = 0;
    for (let i = 0; i < bufferSize; i++) {
      maxVal = Math.max(maxVal, Math.abs(buffer[i]));
    }
    const clipThreshold = maxVal * this.CENTER_CLIP_RATIO;
    for (let i = 0; i < bufferSize; i++) {
      if (Math.abs(buffer[i]) > clipThreshold) {
        clippedBuffer[i] = buffer[i] > 0 ? buffer[i] - clipThreshold : buffer[i] + clipThreshold;
      } else {
        clippedBuffer[i] = 0;
      }
    }

    // 3. Autocorrelation: compute similarity of the signal with itself shifted by lag k
    // We restrict lag search to the range of guitar frequencies (from ~50 Hz up to ~1000 Hz)
    // Period = SampleRate / Frequency.
    const minFreq = 50;  // Corresponds to max lag (E2 is ~82.4 Hz, 50 Hz leaves a safety margin)
    const maxFreq = 1000; // Corresponds to min lag (E4 is ~329.6 Hz, 1000 Hz handles harmonics)
    
    const maxLag = Math.min(bufferSize, Math.floor(sampleRate / minFreq));
    const minLag = Math.floor(sampleRate / maxFreq);
    
    const r = new Float32Array(maxLag);
    
    // Compute autocorrelation R(k) = sum( x[i] * x[i+k] )
    for (let k = 0; k < maxLag; k++) {
      let sum = 0;
      for (let i = 0; i < bufferSize - k; i++) {
        sum += clippedBuffer[i] * clippedBuffer[i + k];
      }
      r[k] = sum;
    }

    // 4. Find the first major peak (local maximum) in autocorrelation after the zero lag
    // R[0] is always the global maximum. We must first walk down to find the zero-crossing or valley.
    let valleyIdx = 0;
    for (let i = 0; i < maxLag - 1; i++) {
      if (r[i] < 0 || r[i+1] > r[i]) {
        valleyIdx = i;
        break;
      }
    }

    // If no valley found, correlation did not fall, signal may be noise
    if (valleyIdx === 0) {
      return -1;
    }

    // Now find the highest peak after the valley
    let peakValue = -1;
    let peakIdx = -1;
    
    for (let i = Math.max(valleyIdx, minLag); i < maxLag - 1; i++) {
      // Is it a local maximum?
      if (r[i] > r[i - 1] && r[i] > r[i + 1]) {
        if (r[i] > peakValue) {
          peakValue = r[i];
          peakIdx = i;
        }
      }
    }

    // Ensure we found a peak that is strong enough relative to the global max (R[0])
    const rZero = r[0];
    if (peakIdx !== -1 && peakValue > 0.15 * rZero) {
      // 5. Parabolic Interpolation for Sub-Sample accuracy
      // This is crucial! Standard integer sample lags can only estimate frequency discretely.
      // e.g. at 44100Hz, lag 535 = 82.43Hz, lag 536 = 82.28Hz. We need sub-Hz resolution!
      const alpha = r[peakIdx - 1];
      const beta = r[peakIdx];
      const gamma = r[peakIdx + 1];
      
      // Calculate peak offset using the vertex of a parabola passing through the 3 points
      const denominator = alpha - 2 * beta + gamma;
      let preciseLag = peakIdx;
      
      if (Math.abs(denominator) > 1e-5) {
        const offset = 0.5 * (alpha - gamma) / denominator;
        preciseLag = peakIdx + offset;
      }
      
      const frequency = sampleRate / preciseLag;
      return frequency;
    }

    return -1;
  },

  /**
   * Convert frequency in Hz to closest MIDI note details
   * @param {number} frequency - Detected frequency (Hz)
   * @returns {Object} Containing note name, octave, MIDI number, deviation in cents, target frequency
   */
  getNoteDetails(frequency) {
    if (frequency <= 0 || isNaN(frequency)) {
      return null;
    }

    // Standard formula: MIDI_number = 12 * log2(frequency / 440) + 69
    const midiNumberRaw = 12 * Math.log2(frequency / 440) + 69;
    const midiNumber = Math.round(midiNumberRaw);
    
    const noteName = this.NOTE_NAMES[midiNumber % 12];
    const octave = Math.floor(midiNumber / 12) - 1;
    
    // Target exact frequency for this MIDI note
    const targetFrequency = 440 * Math.pow(2, (midiNumber - 69) / 12);
    
    // Calculate cents deviation: cents = 1200 * log2(frequency / targetFrequency)
    const centsDeviation = 1200 * Math.log2(frequency / targetFrequency);

    return {
      frequency: parseFloat(frequency.toFixed(2)),
      midiNumber: midiNumber,
      noteName: noteName,
      octave: octave,
      fullNote: `${noteName}${octave}`,
      targetFrequency: parseFloat(targetFrequency.toFixed(2)),
      deviation: Math.round(centsDeviation * 10) / 10 // Round to 1 decimal place (cents)
    };
  }
};
