var context = new AudioContext()
// Create lineOut
var lineOut = new WebAudiox.LineOut(context)
lineOut.volume = 1.0
var analyser = context.createAnalyser()
analyser.connect(lineOut.destination);
lineOut.destination = analyser;
var play = false;
var source;
// get microphone as source
// navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
// navigator.getUserMedia( {audio:true}, 	function gotStream(stream) {
// 	// Create an AudioNode from the stream.
// 	var source	= context.createMediaStreamSource( stream );

// 	source.connect(lineOut.destination);
// });	


var canvas = document.createElement('canvas');
canvas.width = 840;
canvas.height = 300;
var ctx = canvas.getContext("2d");
document.getElementById("grafic").appendChild(canvas)
var analyser2canvas = new WebAudiox.Analyser2Canvas(analyser, canvas)
requestAnimationFrame(function update() {
    requestAnimationFrame(update);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    analyser2canvas.update()
})

function playHistogram()
{
    if (play == true)
        return;
    play = true;
    var content;
    content = document.getElementById("sunet-1").getAttribute("src");
    // load a sound and play it immediatly
    WebAudiox.loadBuffer(context, content, function (buffer) {
        source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = false
        source.connect(lineOut.destination);
        source.start(0);
    });
    
}

function stopHistogram() {
    source.stop();
    play = false;
}

function play1() {
    var bgm = document.getElementById("sunet-1");
    bgm.play();
}

function pause1() {
    var bgm = document.getElementById("sunet-1");
    bgm.pause();
}

function play2() {
    var bgm = document.getElementById("sunet-2");
    bgm.play();
}

function pause2() {
    var bgm = document.getElementById("sunet-2");
    bgm.pause();
}

function stop1() {
    var bgm = document.getElementById("sunet-1");
    bgm.pause();
    bgm.currentTime = 0;
}

function stop2() {
    var bgm = document.getElementById("sunet-2");
    bgm.pause();
    bgm.currentTime = 0;
}

function pitchUp() {
    var bgm = document.getElementById("sunet-1");
    bgm.playbackRate += 0.1;
}

function pitchDown() {
    var bgm = document.getElementById("sunet-1");

    if (bgm.playbackRate == 0.1)
        return;

    bgm.playbackRate -= 0.1;
}

var context2 = new AudioContext();
var mediaElement = document.getElementById('sunet-1');
var sourceNode = context2.createMediaElementSource(mediaElement);
var isEcho = false;
delay = context2.createDelay();
delay.delayTime.value = 0.5;

feedback = context2.createGain();
feedback.gain.value = 0.2;

filter = context2.createBiquadFilter();
filter.frequency.value = 1000;

delay.connect(feedback);
feedback.connect(filter);
filter.connect(delay);

function echo() {
    if (isEcho == false) {
        sourceNode.connect(delay);
        sourceNode.connect(context2.destination);
        delay.connect(context2.destination);
        isEcho = true;
    }
    else {
        sourceNode.disconnect(delay);
        sourceNode.disconnect(context2.destination);
        delay.disconnect(context2.destination);
        isEcho = false;
    }
    
}

mediaElement.addEventListener('play', function () {

    
});

// EQ Properties
//
var gainDb = -40.0;
var bandSplit = [360, 3600];

var hBand = context2.createBiquadFilter();
hBand.type = "lowshelf";
hBand.frequency.value = bandSplit[0];
hBand.gain.value = gainDb;

var hInvert = context2.createGain();
hInvert.gain.value = -1.0;

var mBand = context2.createGain();

var lBand = context2.createBiquadFilter();
lBand.type = "highshelf";
lBand.frequency.value = bandSplit[1];
lBand.gain.value = gainDb;

var lInvert = context2.createGain();
lInvert.gain.value = -1.0;

sourceNode.connect(lBand);
sourceNode.connect(mBand);
sourceNode.connect(hBand);

hBand.connect(hInvert);
lBand.connect(lInvert);

hInvert.connect(mBand);
lInvert.connect(mBand);

var lGain = context2.createGain();
var mGain = context2.createGain();
var hGain = context2.createGain();

lBand.connect(lGain);
mBand.connect(mGain);
hBand.connect(hGain);

var sum = context2.createGain();
lGain.connect(sum);
mGain.connect(sum);
hGain.connect(sum);
sum.connect(context2.destination);

// Input
//
function changeGain(string, type) {
    var value = parseFloat(string) / 100.0;

    switch (type) {
        case 'lowGain': lGain.gain.value = value; break;
        case 'midGain': mGain.gain.value = value; break;
        case 'highGain': hGain.gain.value = value; break;
    }
}
