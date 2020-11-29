//For sound and analysis
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

//Visual
let canvasWidth;
let canvasHeight;
let canvas;
let titleText = "Algorhythm";

//Machine Learning
let video;
let handpose;
let handPoses;
let handPose;
let handConfidence;
let lastGesture = "middle";
let THRESHOLD = 0.80;
let defaultVolume = 0.5;

let MLOn = true;
let button;
let xMouse;
let yMouse;

function preload() {
    cursiveFont = loadFont("data/Yellowtail-Regular.ttf");
}


//Setting up of p5 canvas
function setup() {

    canvasWidth = displayWidth - 10;
    canvasHeight = displayHeight - 110;
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

    if (MLOn) {
        video = createCapture(VIDEO);
        handpose = ml5.handpose(video, () => console.log("Model successfully initialized"));
        handpose.on("predict", gotHandPoses);
    }

    canvas.drop(gotFile);

}


//To receive and integrate mp3 files dropped onto canvas
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


//Plays next song 
function nextSongLoaded() {
    songUp.setVolume(defaultVolume);
    songUp.play();
}

//Function to pause song
function pauseSong() {
    if (songUp.isPlaying()) {
        songUp.pause();
    } else {
        songUp.play();
    }
}


function draw() {
    background(0);
    circularVolume();
    linearVolume();
    fftComposition();
    drawText();
    if (handPose) {
        pinkyUp();
        indexUp();
    }
}



function circularVolume() {
    let volumeVisualC = amp.getLevel();
    volumeHistoryC.push(volumeVisualC);
    stroke(255);
    strokeWeight(2);
    push();
    translate(canvasWidth / 2, canvasHeight / 2);

    noFill();
    beginShape();
    for (let i = 0; i < 360; i++) {
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
function linearVolume() {
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
    for (let i = 0; i < spectrum.length; i++) {
        let fftHeight = spectrum[i];
        let fftY = map(fftHeight, 0, 1024, height, 0);
        fill(i, 160, 240);
        rect(20 + i * fftWidth, fftY, fftWidth - 2, height - fftY);
    }
    colorMode(RGB);

}



//Drawing associated text

function drawText() {
    let textVolume = amp.getLevel();

    let textSizey = map(textVolume, 0, 1, 100, 120)
    textFont(cursiveFont);
    fill(255);
    textSize(textSizey);
    text(titleText, 500, 300);
    textSize(40);
    text("Volume: " + (defaultVolume * 100).toFixed(0), 2000, 1200);

}



//Functions for AI gesture recognition

if (MLOn) {
    function gotHandPoses(results) {
        handPoses = results;
        if (handPoses.length > 0) {
            handPose = handPoses[0].annotations;
            handConfidence = handPoses[0].handInViewConfidence;
        }
    }
}


function pinkyUp() {
    if (handPose.pinky[3] && handConfidence > THRESHOLD) {
        // checking if up

        fill(0, 0, 255);
        noStroke();
        //ellipse(handPose.pinky[3][0], handPose.pinky[3][1], 30, 30);
        if (tallest(handPose.pinky[3])) {
            console.log("Pinky is up");
            if (defaultVolume > 0.05) {
                defaultVolume -= 0.05;
                songUp.setVolume(defaultVolume);
            }
            return true;;
        }
    }
    return false;
}

function indexUp() {
    if (handPose.indexFinger[3] && handConfidence > THRESHOLD) {
        fill(0, 255, 0);
        noStroke();
        //ellipse(handPose.indexFinger[3][0], handPose.indexFinger[3][1], 30, 30);
        if (tallest(handPose.indexFinger[3])) {
            console.log("index is up");
            if (defaultVolume < 1) {
                defaultVolume += 0.05;
                songUp.setVolume(defaultVolume);
            }
            return true;;
        }
    }
    return false;
}

function thumbUp() {
    if (handPose.thumb[3] && handConfidence > THRESHOLD) {
        fill(255, 0, 255);
        noStroke();
        //ellipse(handPose.thumb[3][0], handPose.thumb[3][1], 30, 30);
        if (tallest(handPose.thumb[3])) {
            console.log("thumb is up");
            return true;
        }
    }
    return false;
}


function tallest(input) {
    if (input[1] <= handPose.thumb[3][1] && input[1] <= handPose.indexFinger[3][1] && input[1] <= handPose.middleFinger[3][1] && input[1] <= handPose.ringFinger[3][1] && input[1] <= handPose.pinky[3][1]) {
        return true;
    } else {
        return false;
    }
}