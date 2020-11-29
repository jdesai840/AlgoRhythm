let song;
let amp;
let fft;
let fftHeight;
let fftWidth;
let cursiveFont;
let songs = [];
let songUp;

let volumeHistory = [];
let volumeHistoryC = [];

let canvasWidth;
let canvasHeight;
let canvas;
let titleText = "Algorhythm";

function preload() {
    cursiveFont = loadFont("data/Yellowtail-Regular.ttf");
}


//Setting up of p5 canvas
function setup() {
    
    canvasWidth = displayWidth-10;
    canvasHeight = displayHeight-110;
    canvas = createCanvas(canvasWidth, canvasHeight);
    
    angleMode(DEGREES);

    // noStroke();
    // fill(255, 255, 255);
    // button = rect(canvasWidth-2400, canvasHeight - 1200, 400, 100);
    // fill(0);
    
    //song = loadSound("music/Careless Whisper.mp3", songLoaded);

    amp = new p5.Amplitude();
    fft = new p5.FFT(0.8, 128);
    fftWidth = canvasWidth / 128;

    canvas.drop(gotFile);
}

function gotFile(file) {
    if (songUp) {
        songUp.stop();
    }
    let titleTextRaw = file.name;
    titleText = titleTextRaw.replace(".mp3", "");
    songUp = loadSound(file.data, nextSongLoaded);
    // songs.push(nextSong);
    // songs[songs.length-1].play();

}


//Callback function to play song when song loads
// function songLoaded() {
//     song.play();
// }


function nextSongLoaded() {
    songUp.play();
}


//Function to pause song
function pauseSong() {
    if (song.isPlaying()) {
        song.pause();
    }
    else {
        song.play();
    }
}


function draw() {
    background(0);
    circularVolume();
    linearVolume();
    fftComposition();
    drawText();

}


function circularVolume() {
    let volumeVisualC = amp.getLevel();
    volumeHistoryC.push(volumeVisualC);
    stroke(255);
    strokeWeight(2);
    push();
    translate(canvasWidth/2, canvasHeight/2);
    
    noFill();
    beginShape();
    for (let i=0; i < 360; i++) {
        stroke(random(1, 255), random(1, 255), random(1, 255));
        let r = map(volumeHistoryC[i], 0, 1, 150, 500);
        let x = r * cos(i);
        let y = r * sin(i);
        vertex(x + 600, y - 340);
    }
    endShape();
    pop();
    if (volumeHistoryC.length > 360) {
        volumeHistoryC.splice(0, 1);
    }
}

//Graphs amplitude of sound
function linearVolume () {
    let volumeVisual = amp.getLevel();
    volumeHistory.push(volumeVisual);
    // console.log(volumeHistory);
    fill(255, 255, 255);
    noStroke();
    
    let volumeRadius = map(volumeVisual, 0, 1, 300, 500);
    ellipse(240, 280, volumeRadius, volumeRadius);
    noFill();
    
    // stroke(255);
    // beginShape();
    // for (let i=0; i < volumeHistory.length; i++) {
    //     let y = map(volumeHistory[i], 0, 1, canvasHeight, 0);
    //     vertex(i, y - 400);
    // }
    // endShape();

    // //For scrolling effect of music amplitude
    // if (volumeHistory.length > width) {
    //     volumeHistory.splice(0, 1);
    // }
}

//Using the fast fourier transform algorithm in order to break apart sound into component frequencies
function fftComposition() {
    colorMode(HSB);
    let spectrum = fft.analyze();
    //console.log(spectrum);
    noStroke();
    for (let i=0; i<spectrum.length; i++) {
        let fftHeight = spectrum[i];
        let fftY = map(fftHeight, 0, 1024, height, 0);
        fill(i, 160, 240);
        rect(20 + i*fftWidth, fftY, fftWidth - 2, height - fftY);
    }
    colorMode(RGB);

}

function drawText() {
    let textVolume = amp.getLevel();
    
    let textSizey = map(textVolume, 0, 1, 100, 120)
    textFont(cursiveFont);
    fill(255);
    textSize(textSizey);
    text(titleText, 500, 300);
}