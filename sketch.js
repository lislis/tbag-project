Array.prototype.sample = function(){
  return this[Math.floor(Math.random()*this.length)];
};
let peakDetect, cnv, amplitude, fft, song, font, songProgress;

let cameraZ, camDirZ, camFlip;
let state = 1;
let starrySky = [];
let planetColors = [
  [242, 197, 164], // cream
  [96, 86, 84], // dark cream
  [51, 120, 152], // blue-ish
  [205, 13, 130], // very pink
  [16, 4, 73], // dark bluie
  [239, 106, 97], // orange-red
  [150, 83, 120], // purple-ish
];

function preload() {
  song = loadSound('assets/fazerdaze-take_it_slow.mp3');
  font = loadFont('assets/ostrich-sans-master/OstrichSansRounded-Medium.otf');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noFill();

  let framerate = 60;
  frameRate(framerate);
  let bpm = 112;
  let framesPerPeak = framerate / (bpm / framerate );
  peakDetect = new p5.PeakDetect(500, 5000, 0.25, framesPerPeak);
  peakDetect.onPeak(getBeatCallback);

  fft = new p5.FFT();

  analyzer = new p5.Amplitude();
  analyzer.setInput(song);

  song.setVolume(0.1);
  userStartAudio();

  textFont(font);
  textSize(width * 0.1);
  textAlign(CENTER, CENTER);

  planetColors = planetColors.map(x => color(x[0], x[1], x[2]));
  //cameraZ = (height/2) / tan(PI/6);
  cameraZ = 500;
  camDirZ = 1;
  camFlip = true;
}

function draw() {
  background(32, 26, 36);

  //perspective(PI/3, width/height, cameraZ/10, cameraZ*10); //, where eyeZ is equal to ((height/2) / tan(PI/6))

  ambientLight(132, 126, 136, 1);
  directionalLight(255, 255, 255, createVector(0, -1, -1));


  if (song.isPlaying()) {
//    debugAmplitude();
//    debugFFTSpectrum();
    //    debugFFTWaveform();

    camera(0, 0, (height/2) / tan(PI/6), 0, 0, 0, 0, 1, 0);
    translate(0, 0, cameraZ);

    songProgress = Math.round(song.currentTime() / song.duration() * 100);
    console.log(songProgress + '%');

    let spectrum = fft.analyze();
    let rms = analyzer.getLevel();
    let wave = fft.waveform();
    peakDetect.update(fft);

    // what are we painting?
    paintStarrySky(rms);

    if (state === 1 && songProgress > 5) {
      state = 2;
    }
    if (state === 3 && songProgress > 20) {
      state = 4;
    }
    // based on time
    if (state == 2) {
      moveShip(deltaTime);
    }
    if (state == 3) {
      panCamera(deltaTime);
    }

  } else {
    camera(0, 0, ((height / 2) / tan(PI/6)), 0, 0, 0, 0, 1, 0);
    push();
    fill(200);
    translate(0, 0, 0);
    text("Click/tap to play", 0, 0);
    pop();
  }
}

function panCamera(dt) {
  // show that we're actually a spaceship
  // pan the camera and move back or something?
  console.log('state3')
}

function planetExpo(dt) {
  // zoom in on a planet
  console.log('state4')
}

function moveShip(dt) {
  cameraZ += (10 * deltaTime / 100);

  /*
  if (camFlip) {
    cameraZ -= (10 * deltaTime / 100);
    camDirZ = 1;
  } else {
    camDirZ = -1;
    cameraZ += (10 * deltaTime / 100);
  }
  if (cameraZ < 100) {
    camFlip = false;
    //state = 3;
  }*/
}

function paintStarrySky(outsideFactor) {
  starrySky.forEach((v, i) => {
    push();
    ambientMaterial(v.material);
    translate(createVector(v.x, v.y, v.z));
    sphere(v.size + (outsideFactor * 200), 8, 8);
    pop();
  });
}

function getBeatCallback(val) {
  starrySky.push({
    x: random(0, width) - (width/ 2),
    y: random(0, height) - (height/ 2),
    z: random(cameraZ - 1000, cameraZ - 4000),
    size: random(20, 200),
    material: planetColors.sample(),
  });
}

function mousePressed() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.play();
  }
}

function debugAmplitude() {
  let rms = analyzer.getLevel();

  console.log(rms);

  ellipse(width / 2, height / 2, 10 + rms * 200, 10 + rms * 200);
}

function debugFFTSpectrum() {
  let spectrum = fft.analyze();

  console.log(spectrum);

  beginShape();
  for (i = 0; i < spectrum.length; i++) {
    vertex(i, map(spectrum[i], 0, 255, height, 0));
  }
  endShape();
}

function debugFFTWaveform() {
  let waveform = fft.waveform();

  console.log(waveform);

  beginShape();
  for (let i = 0; i < waveform.length; i++){
    let x = map(i, 0, waveform.length, 0, width);
    let y = map( waveform[i], -1, 1, 0, height);
    vertex(x,y);
  }
  endShape();
}
