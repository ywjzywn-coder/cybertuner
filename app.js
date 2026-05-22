/**
 * ==========================================================================
 * CyberTuner - Main Application & Web Audio Integration
 * coordinates UI, Audio capture, Synthesizers, Canvas drawings
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Tuning Presets Definition
  // String numbering in guitar: 6th is thickest (E2), 1st is thinnest (E4)
  const TUNING_PRESETS = [
    {
      id: "std-e",
      name: "Standard E (标准调音)",
      strings: [
        { note: "E", octave: 4, freq: 329.63, label: "1E" }, // 1st String (Thinnest)
        { note: "B", octave: 3, freq: 246.94, label: "2B" },
        { note: "G", octave: 3, freq: 196.00, label: "3G" },
        { note: "D", octave: 3, freq: 146.83, label: "4D" },
        { note: "A", octave: 2, freq: 110.00, label: "5A" },
        { note: "E", octave: 2, freq: 82.41,  label: "6E" }  // 6th String (Thickest)
      ]
    },
    {
      id: "drop-d",
      name: "Drop D (降D调音)",
      strings: [
        { note: "E", octave: 4, freq: 329.63, label: "1E" },
        { note: "B", octave: 3, freq: 246.94, label: "2B" },
        { note: "G", octave: 3, freq: 196.00, label: "3G" },
        { note: "D", octave: 3, freq: 146.83, label: "4D" },
        { note: "A", octave: 2, freq: 110.00, label: "5A" },
        { note: "D", octave: 2, freq: 73.42,  label: "6D" }
      ]
    },
    {
      id: "dadgad",
      name: "DADGAD (爱尔兰调音)",
      strings: [
        { note: "D", octave: 4, freq: 293.66, label: "1D" },
        { note: "A", octave: 3, freq: 220.00, label: "2A" },
        { note: "G", octave: 3, freq: 196.00, label: "3G" },
        { note: "D", octave: 3, freq: 146.83, label: "4D" },
        { note: "A", octave: 2, freq: 110.00, label: "5A" },
        { note: "D", octave: 2, freq: 73.42,  label: "6D" }
      ]
    },
    {
      id: "half-down",
      name: "Half-Step Down (降半调)",
      strings: [
        { note: "Eb", octave: 4, freq: 311.13, label: "1Eb" },
        { note: "Bb", octave: 3, freq: 233.08, label: "2Bb" },
        { note: "Gb", octave: 3, freq: 185.00, label: "3Gb" },
        { note: "Db", octave: 3, freq: 138.59, label: "4Db" },
        { note: "Ab", octave: 2, freq: 103.83, label: "5Ab" },
        { note: "Eb", octave: 2, freq: 77.78,  label: "6Eb" }
      ]
    },
    {
      id: "open-g",
      name: "Open G (开G调音)",
      strings: [
        { note: "D", octave: 4, freq: 293.66, label: "1D" },
        { note: "B", octave: 3, freq: 246.94, label: "2B" },
        { note: "G", octave: 3, freq: 196.00, label: "3G" },
        { note: "D", octave: 3, freq: 146.83, label: "4D" },
        { note: "G", octave: 2, freq: 98.00,  label: "5G" },
        { note: "D", octave: 2, freq: 73.42,  label: "6D" }
      ]
    }
  ];

  // 2. Application State variables
  let audioContext = null;
  let micStream = null;
  let sourceNode = null;
  let analyserNode = null;
  let isListening = false;
  
  let currentPresetIdx = 0;
  let activeStringIdx = 5; // Default 6th string E2
  let trackingMode = "auto"; // "auto" or "manual"
  
  let detectedFreq = -1;
  let targetFreq = -1;
  let deviationCents = 0;
  let smoothedDeviation = 0; // Low-pass filter for smooth needle movements
  
  // Animation frames IDs
  let renderLoopId = null;
  
  // Reference Synthesizer playback references
  let audioSynthNodes = [];

  // 3. UI DOM Elements
  const appContainer = document.getElementById("appContainer");
  const micToggleBtn = document.getElementById("micToggleBtn");
  const micBtnText = document.getElementById("micBtnText");
  const tuningSelect = document.getElementById("tuningSelect");
  
  const autoModeBtn = document.getElementById("autoModeBtn");
  const manualModeBtn = document.getElementById("manualModeBtn");
  
  const displayNote = document.getElementById("displayNote");
  const displayCents = document.getElementById("displayCents");
  const displayFreq = document.getElementById("displayFreq");
  const displayTargetPreset = document.getElementById("displayTargetPreset");
  
  const stringsContainer = document.getElementById("stringsContainer");
  
  const dialCanvas = document.getElementById("dialCanvas");
  const dialCtx = dialCanvas.getContext("2d");
  
  const spectrogramCanvas = document.getElementById("spectrogramCanvas");
  const spectrogramCtx = spectrogramCanvas.getContext("2d");

  // 4. Setup Responsive Canvas Resolutions
  function resizeCanvases() {
    // Dial Canvas setting
    const dialRect = dialCanvas.getBoundingClientRect();
    dialCanvas.width = dialRect.width * window.devicePixelRatio;
    dialCanvas.height = dialRect.height * window.devicePixelRatio;
    dialCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Spectrogram Canvas setting
    const spectRect = spectrogramCanvas.getBoundingClientRect();
    spectrogramCanvas.width = spectRect.width * window.devicePixelRatio;
    spectrogramCanvas.height = spectRect.height * window.devicePixelRatio;
    spectrogramCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  
  window.addEventListener("resize", resizeCanvases);

  // 5. Populate Tuning Select Dropdown options
  function initPresetSelector() {
    tuningSelect.innerHTML = "";
    TUNING_PRESETS.forEach((preset, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = preset.name;
      tuningSelect.appendChild(option);
    });
    tuningSelect.addEventListener("change", (e) => {
      selectPreset(parseInt(e.target.value));
    });
  }

  // Handle Tuning Preset Change
  function selectPreset(presetIndex) {
    currentPresetIdx = presetIndex;
    
    // Auto-select string index based on standard selection
    if (activeStringIdx >= TUNING_PRESETS[currentPresetIdx].strings.length) {
      activeStringIdx = TUNING_PRESETS[currentPresetIdx].strings.length - 1;
    }
    
    renderStringsBoard();
    updateTunerInfoDisplay(null);
  }

  // 6. Render Guitar Pegboard & Interactive Strings Panel
  function renderStringsBoard() {
    stringsContainer.innerHTML = "";
    const preset = TUNING_PRESETS[currentPresetIdx];
    
    // Map E4 to E2 in correct UI order (index 0 is string 1 (thinnest E4) at the top, index 5 is string 6 (thickest E2) at the bottom)
    preset.strings.forEach((stringObj, idx) => {
      const row = document.createElement("div");
      row.className = `guitar-string-row string-row-${stringObj.label}`;
      row.dataset.note = stringObj.note;
      
      row.innerHTML = `
        <div class="string-dot"></div>
        <div class="peg-label-left">${stringObj.note}</div>
        <div class="string-info-text">
          <span class="string-target-freq">${stringObj.freq} Hz</span>
        </div>
      `;
      
      // Interaction handlers
      row.addEventListener("click", () => {
        // Toggle Active state manually
        if (trackingMode === "manual") {
          setActiveString(idx);
        } else {
          // If in Auto-mode, click plays reference tone but also temporary switch
          setActiveString(idx);
          setTrackingMode("manual");
        }
        
        // Play synthesizer guitar chord reference tone
        playReferenceTone(string.freq, row);
      });
      
      stringsContainer.appendChild(row);
    });
    
    displayTargetPreset.textContent = preset.name;
  }

  // Update actively lock targeted string
  function setActiveString(index) {
    activeStringIdx = index;
    const rows = stringsContainer.querySelectorAll(".guitar-string-row");
    rows.forEach((row, idx) => {
      if (idx === index) {
        row.classList.add("active");
      } else {
        row.classList.remove("active");
      }
    });
  }

  // 7. Track Mode Selectors (Auto string lock vs Manual string lock)
  autoModeBtn.addEventListener("click", () => setTrackingMode("auto"));
  manualModeBtn.addEventListener("click", () => setTrackingMode("manual"));

  function setTrackingMode(mode) {
    trackingMode = mode;
    if (mode === "auto") {
      autoModeBtn.classList.add("active");
      manualModeBtn.classList.remove("active");
    } else {
      manualModeBtn.classList.add("active");
      autoModeBtn.classList.remove("active");
    }
  }

  // 8. Guitar Synth Voice Reference Tone Plucking Generator
  // emulates strings acoustic vibrations using frequency base oscillator + harmonics
  function playReferenceTone(frequency, rowElement) {
    // 1. Initial Web Audio Context
    initAudioContext();
    if (!audioContext) return;
    
    // Stop any currently running oscillators to prevent overlap
    stopAllReferenceTones();

    // Visual trigger string vibrating animation
    rowElement.classList.add("playing");
    setTimeout(() => {
      rowElement.classList.remove("playing");
    }, 2800);

    const destination = audioContext.destination;
    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0, audioContext.currentTime);
    // Envelope: Linear Pluck ramp up instantly, fade out slowly
    masterGain.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.04);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 2.8);
    masterGain.connect(destination);
    
    // Create base + harmonic frequencies (1x freq, 2x freq, 3x freq, 4x freq)
    // Emulates real guitar string spectrum
    const harmonics = [
      { type: "sine", scale: 1.0, volume: 0.6 },
      { type: "triangle", scale: 2.0, volume: 0.25 },
      { type: "sine", scale: 3.0, volume: 0.12 },
      { type: "sine", scale: 4.0, volume: 0.05 }
    ];

    harmonics.forEach(harmonic => {
      const osc = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      osc.type = harmonic.type;
      osc.frequency.setValueAtTime(frequency * harmonic.scale, audioContext.currentTime);
      gainNode.gain.setValueAtTime(harmonic.volume, audioContext.currentTime);
      
      osc.connect(gainNode);
      gainNode.connect(masterGain);
      
      osc.start();
      osc.stop(audioContext.currentTime + 3.0);
      
      audioSynthNodes.push(osc);
    });
  }

  function stopAllReferenceTones() {
    audioSynthNodes.forEach(node => {
      try {
        node.stop();
      } catch(e) {}
    });
    audioSynthNodes = [];
  }

  // 9. Web Audio API Input Captures & Mic Request
  micToggleBtn.addEventListener("click", toggleTunerListening);

  function initAudioContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
  }

  async function toggleTunerListening() {
    initPresetSelector(); // Guard
    initAudioContext();
    
    if (isListening) {
      // Stop Tuner
      stopTunerStream();
    } else {
      // Start Tuner
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        });
        
        sourceNode = audioContext.createMediaStreamSource(micStream);
        
        // Analyser Node: buffer size 4096 gives excellent time-domain window sizes for low frequency E2
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 2048; 
        
        sourceNode.connect(analyserNode);
        
        isListening = true;
        micToggleBtn.classList.add("listening");
        micBtnText.textContent = "关闭调音器";
        
        // Clear references
        stopAllReferenceTones();
        
        // Start Render loops & analytical polling
        resizeCanvases();
        startProcessingLoops();
      } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("无法开启麦克风。请确保在 macOS 系统设置 -> 隐私与安全性 -> 麦克风中允许浏览器访问，并在网页中给予授权。");
      }
    }
  }

  function stopTunerStream() {
    isListening = false;
    micToggleBtn.classList.remove("listening");
    micBtnText.textContent = "启动麦克风";
    
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
      micStream = null;
    }
    
    if (sourceNode) {
      sourceNode.disconnect();
      sourceNode = null;
    }
    
    if (renderLoopId) {
      cancelAnimationFrame(renderLoopId);
      renderLoopId = null;
    }
    
    // Clear display
    updateTunerInfoDisplay(null);
    clearSpectrogramCanvas();
    drawStaticDial();
  }

  // 10. Core Polling & Visualization Loop (60 FPS rendering)
  function startProcessingLoops() {
    const timeBuffer = new Float32Array(analyserNode.fftSize);
    const freqBuffer = new Uint8Array(analyserNode.frequencyBinCount);
    
    function tick() {
      if (!isListening) return;
      
      // Get Time Domain Data for pitch detection
      analyserNode.getFloatTimeDomainData(timeBuffer);
      // Get Frequency Domain Data for bottom spectrogram
      analyserNode.getByteFrequencyData(freqBuffer);
      
      // Perform math pitch analysis
      const detected = PitchDetector.detectPitch(timeBuffer, audioContext.sampleRate);
      
      if (detected !== -1) {
        detectedFreq = detected;
        const details = PitchDetector.getNoteDetails(detectedFreq);
        
        if (details) {
          processTuningResults(details);
        }
      } else {
        // Slowly ease needle back to center or last tracked note if no audio
        detectedFreq = -1;
        deviationCents = 0;
      }
      
      // Continuous Canvas drawing updates
      renderDialMeter();
      renderSpectrumVisualizer(freqBuffer);
      
      renderLoopId = requestAnimationFrame(tick);
    }
    
    renderLoopId = requestAnimationFrame(tick);
  }

  // 11. Core Tuning Rules & Target Matching
  function processTuningResults(details) {
    const preset = TUNING_PRESETS[currentPresetIdx];
    
    if (trackingMode === "auto") {
      // Find the closest guitar string matching the current absolute frequency
      let closestIdx = 0;
      let minDiff = Infinity;
      
      preset.strings.forEach((str, idx) => {
        const diff = Math.abs(details.frequency - str.freq);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      
      setActiveString(closestIdx);
      targetFreq = preset.strings[closestIdx].freq;
    } else {
      // Manual Lock: Lock target onto selected string
      targetFreq = preset.strings[activeStringIdx].freq;
    }
    
    // Calculate custom cents deviation specifically for the active string target frequency
    // cents = 1200 * log2(detected / target)
    deviationCents = 1200 * Math.log2(details.frequency / targetFreq);
    
    // Clamp deviation to max visual gauge boundaries (-50 to +50 cents)
    deviationCents = Math.max(-50, Math.min(50, deviationCents));
    
    // Update labels
    const currentTargetString = preset.strings[activeStringIdx];
    const centsText = deviationCents >= 0 ? `+${deviationCents.toFixed(1)}` : deviationCents.toFixed(1);
    
    // Perfect tuning threshold is within ±3 cents
    const inTune = Math.abs(deviationCents) <= 3;
    
    updateTunerInfoDisplay({
      note: details.noteName,
      cents: centsText,
      freq: details.frequency.toFixed(2),
      inTune: inTune,
      targetFreq: targetFreq,
      deviation: deviationCents
    });
  }

  // Update digital readings in HTML card panels
  function updateTunerInfoDisplay(data) {
    if (!data) {
      displayNote.textContent = "--";
      displayNote.className = "note-bubble";
      displayCents.textContent = "0.0 cents";
      displayCents.className = "note-cents";
      displayFreq.textContent = "待检测频率: -- Hz";
      appContainer.className = "app-container";
      
      // Reset all string visual in-tune overlays
      const rows = stringsContainer.querySelectorAll(".guitar-string-row");
      rows.forEach(r => r.classList.remove("in-tune"));
      return;
    }
    
    displayNote.textContent = data.note;
    displayFreq.textContent = `当前频率: ${data.freq} Hz (目标: ${data.targetFreq} Hz)`;
    
    const rows = stringsContainer.querySelectorAll(".guitar-string-row");
    const activeRow = rows[activeStringIdx];
    
    if (data.inTune) {
      displayNote.className = "note-bubble perfect-pitch";
      displayCents.textContent = "完美对齐 (In Tune)";
      displayCents.className = "note-cents cents-perfect";
      appContainer.className = "app-container in-tune";
      
      if (activeRow) {
        activeRow.classList.add("in-tune");
      }
    } else {
      appContainer.className = "app-container out-tune";
      if (activeRow) {
        activeRow.classList.remove("in-tune");
      }
      
      if (data.deviation < 0) {
        displayNote.className = "note-bubble flat-pitch";
        displayCents.textContent = `偏低 ${Math.abs(data.deviation).toFixed(1)} 音分 (Flat)`;
        displayCents.className = "note-cents cents-flat";
      } else {
        displayNote.className = "note-bubble sharp-pitch";
        displayCents.textContent = `偏高 ${data.deviation.toFixed(1)} 音分 (Sharp)`;
        displayCents.className = "note-cents cents-sharp";
      }
    }
  }

  // 12. Canvas Dial Meter Gauge Drawer (Analog Pointer Needle)
  function renderDialMeter() {
    const width = dialCanvas.width / window.devicePixelRatio;
    const height = dialCanvas.height / window.devicePixelRatio;
    
    dialCtx.clearRect(0, 0, width, height);
    
    // Easing interpolation filter for buttery smooth needle movement
    smoothedDeviation += (deviationCents - smoothedDeviation) * 0.15;
    
    const centerX = width / 2;
    const centerY = height - 15;
    const radius = Math.min(width / 2 - 20, height - 30);
    
    const isDark = document.body.classList.contains("dark-theme");
    
    // Select styling theme colors based on pitch correctness
    let themeColor = isDark ? "#f5f5f5" : "#111111"; // Default (Flat/General)
    const activeColor = "#ff4f00"; // Orange Accent
    const successColor = "#00a651"; // Green Accent
    const dimColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)";
    const highlightColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.3)";
    const bgColor = isDark ? "#1e1e1e" : "#ffffff";
    
    if (detectedFreq !== -1) {
      if (Math.abs(smoothedDeviation) <= 3) {
        themeColor = activeColor;
      } else {
        themeColor = isDark ? "#aaaaaa" : "#888888";
      }
    }
    
    // 1. Draw outer curved dial arc track
    dialCtx.beginPath();
    dialCtx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI, false);
    dialCtx.lineWidth = 4;
    dialCtx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    dialCtx.stroke();
    
    // 2. Draw glowing active color wedge
    dialCtx.beginPath();
    dialCtx.arc(centerX, centerY, radius - 4, Math.PI, 2 * Math.PI, false);
    dialCtx.lineWidth = 1;
    dialCtx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    dialCtx.stroke();

    // 3. Draw tick divisions and graduation lines (from -50 to +50 cents)
    const tickCount = 20; // 20 divisions
    for (let i = 0; i <= tickCount; i++) {
      const angle = Math.PI + (i / tickCount) * Math.PI;
      const isMajor = i % 5 === 0;
      const isCenter = i === tickCount / 2;
      
      const tickLength = isMajor ? 12 : 6;
      
      const startX = centerX + (radius - tickLength) * Math.cos(angle);
      const startY = centerY + (radius - tickLength) * Math.sin(angle);
      const endX = centerX + radius * Math.cos(angle);
      const endY = centerY + radius * Math.sin(angle);
      
      dialCtx.beginPath();
      dialCtx.moveTo(startX, startY);
      dialCtx.lineTo(endX, endY);
      dialCtx.lineWidth = isMajor ? 2.5 : 1.2;
      
      if (isCenter) {
        dialCtx.strokeStyle = successColor;
      } else {
        dialCtx.strokeStyle = isMajor ? highlightColor : dimColor;
      }
      dialCtx.stroke();
      
      // Draw Text Cents indicators for major ticks
      if (isMajor) {
        const centsVal = (i / tickCount) * 100 - 50;
        const textDist = radius - 24;
        const textX = centerX + textDist * Math.cos(angle);
        const textY = centerY + textDist * Math.sin(angle) + 4;
        
        dialCtx.fillStyle = isCenter ? successColor : (isDark ? "#999999" : "#666666");
        dialCtx.font = "10px 'IBM Plex Mono', monospace";
        dialCtx.textAlign = "center";
        dialCtx.fillText(centsVal === 0 ? "0" : (centsVal > 0 ? `+${centsVal}` : centsVal), textX, textY);
      }
    }
    
    // 4. Draw safety background sector
    if (detectedFreq !== -1) {
      dialCtx.save();
      dialCtx.beginPath();
      dialCtx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
      dialCtx.fillStyle = "transparent";
      dialCtx.strokeStyle = dimColor;
      dialCtx.stroke();
      dialCtx.restore();
    }
    
    // 5. Draw the Dynamic Rotating Tuning Needle
    // Map -50..50 cents into radians Math.PI..2*Math.PI. Angle offset: cents * (Math.PI / 100)
    const needleAngle = Math.PI * 1.5 + (smoothedDeviation * (Math.PI / 100));
    const needleLen = radius - 10;
    const needleX = centerX + needleLen * Math.cos(needleAngle);
    const needleY = centerY + needleLen * Math.sin(needleAngle);
    
    dialCtx.save();
    dialCtx.beginPath();
    dialCtx.moveTo(centerX, centerY);
    dialCtx.lineTo(needleX, needleY);
    dialCtx.lineWidth = 2; // Thinner needle
    dialCtx.lineCap = "square"; // Flat cap
    dialCtx.shadowBlur = 0; // No glow
    dialCtx.strokeStyle = themeColor;
    dialCtx.stroke();
    dialCtx.restore();
    
    // 6. Draw central pivot cap
    dialCtx.beginPath();
    dialCtx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
    dialCtx.fillStyle = isDark ? "#ffffff" : "#111111";
    dialCtx.strokeStyle = "transparent";
    dialCtx.lineWidth = 0;
    dialCtx.fill();
    dialCtx.stroke();
    
    // Little glowing node
    dialCtx.beginPath();
    dialCtx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
    dialCtx.fillStyle = themeColor;
    dialCtx.fill();
  }

  function drawStaticDial() {
    deviationCents = 0;
    smoothedDeviation = 0;
    renderDialMeter();
  }

  // 13. Dynamic glowing bar-spectrum drawer
  function renderSpectrumVisualizer(frequencyData) {
    const width = spectrogramCanvas.width / window.devicePixelRatio;
    const height = spectrogramCanvas.height / window.devicePixelRatio;
    
    spectrogramCtx.clearRect(0, 0, width, height);
    
    const barWidth = (width / 50); // Show lower 50 bin bars (focus on tuning ranges)
    let x = 0;
    
    const gradient = spectrogramCtx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, dimColor);
    gradient.addColorStop(0.5, highlightColor);
    gradient.addColorStop(1, isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.5)");
    
    for (let i = 0; i < 50; i++) {
      // Frequency values inside FFT buffer
      const percent = frequencyData[i] / 255;
      const barHeight = percent * height * 0.9;
      
      spectrogramCtx.fillStyle = gradient;
      
      // Draw rounded rectangle bars
      spectrogramCtx.beginPath();
      spectrogramCtx.roundRect(x, height - barHeight, barWidth - 1, barHeight, [4, 4, 0, 0]);
      spectrogramCtx.fill();
      
      x += barWidth;
    }
  }

  function clearSpectrogramCanvas() {
    const width = spectrogramCanvas.width / window.devicePixelRatio;
    const height = spectrogramCanvas.height / window.devicePixelRatio;
    spectrogramCtx.clearRect(0, 0, width, height);
  }

  // 14. Program initializations
  initPresetSelector();
  selectPreset(0);
  drawStaticDial();
  resizeCanvases();
});
