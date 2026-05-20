# CyberTuner - macOS Premium Guitar Tuner 🎸

一个专为 macOS 打造的高精度、未来科技感（Cyberpunk Glassmorphism）网页吉他调音器。利用 Web Audio API 提供毫秒级实时音高捕捉与自相关（Autocorrelation）音高识别算法，助你快速、精准地调整吉他音准。

---

## 🌟 特色功能

1. **高精度音高识别**：采用基于时间域的自相关算法（Autocorrelation），相比普通 FFT，在低频区（吉他六弦 E2: 82.4Hz）具备更高的分辨率与稳定性，精准度可达 ±1 音分。
2. **拟真拟物霓虹仪表盘**：动态绘制的拟物调音指针与发光弧形刻度，当音准完美对齐时会呈现动感绿色呼吸灯效果。
3. **多重调音预设（Tuning Presets）**：
   - 🎸 Standard E（标准调音）：E2, A2, D3, G3, B3, E4
   - 🎸 Drop D（降D调音）：D2, A2, D3, G3, B3, E4
   - 🎸 DADGAD（爱尔兰调音）：D2, A2, D3, G3, A3, D4
   - 🎸 Half-Step Down（降半调）：Eb2, Ab2, Db3, Gb3, Bb3, Eb4
   - 🎸 Open G（开G调音）：D2, G2, D3, G3, B3, D4
4. **实时频谱分析仪（Spectrogram Analyzer）**：极具科技感的实时音频能量波形与谐波频谱渲染，显示弹奏时的谐波分布。
5. **手动模式 & 模拟吉他声**：支持点击虚拟吉他弦/琴轴播放极具共鸣感的吉他合成音（包含泛音谐波合成），用于人耳比对调音。
6. **自动与手动锁弦（Auto / Manual String Lock）**：自动捕捉弹奏的哪根弦，或者锁定某根弦专门调整。

---

## 🚀 极速启动（macOS）

由于现代浏览器（如 Safari, Chrome）的安全策略，访问麦克风（Web Audio API）必须在 `localhost`、`127.0.0.1` 或 HTTPS 环境下。请按以下简单步骤在本地运行：

1. **打开终端 (Terminal)**。
2. **进入项目目录**：
   ```bash
   cd /Users/ellaycrown/Documents/antigravity/intelligent-rutherford
   ```
3. **启动 Python 内置轻量服务器**：
   ```bash
   python3 -m http.server 8080
   ```
4. **在浏览器中打开**：
   访问 [http://localhost:8080](http://localhost:8080)。
5. **授权麦克风**：点击界面上的“启动麦克风 (Start Tuner)”按钮，并在弹出的浏览器提示中允许使用麦克风，即可开始调音！

---

## 🛠️ 技术内幕

- **音频处理**：使用 HTML5 `AudioContext` 创建输入源，并通过 `AnalyserNode` 进行高速低延迟的时域数据捕获。
- **音高算法**：为了在低频获得极高精度，使用 **自相关（Autocorrelation）** 算法，通过寻找信号波形的自相似周期计算出确切频率，再根据 MIDI 频率公式计算音名与偏离度（Cents Deviation）。
- **动效绘制**：仪表盘和底盘频谱均基于 HTML5 `Canvas` 绘制，配合缓动函数（Easing Function）实现顺滑指针运动与细腻的发光动效，确保 CPU 占用极低。
- **音色合成**：手动调理音色使用 `OscillatorNode` 进行基频与多级泛音（Harmonics）叠加（1:0.5:0.25:0.1），生成饱满、接近真实声学弦乐的参考音。
