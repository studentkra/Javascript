var mp3Data = [];
var start_rec = 0;
var recording = 0;
var samples = new Int16Array();
var channels = 1; //1 for mono or 2 for stereo
var sampleRate = 12000; //44.1khz (normal mp3 samplerate)
var kbps = 128; //encode 128kbps mp3
var sampleBlockSize = 1152; //can be anything but make it a multiple of 576 to make encoders life easier
var mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);
var color_button = 0;

function change_colors()
{
var color_table = ['#f00', '#ff3b3b', '#f66', '#ff9494', '#ffbaba', '#fff', '#ffbaba', '#ff9494', '#f66','#ff3b3b'];
document.getElementsByClassName('openwebrx-button openwebrx-demodulator-button openwebrx-button-dig')[0].style.color = color_table[color_button];
if (color_button < color_table.length)
{
color_button ++;
}
else
{
color_button = 0;
}
}

colorsTimer = setInterval(change_colors , 100);
clearInterval(colorsTimer);

function recording_mp3()
{
console.log('FUNCTION');
if ((recording == 0) && (start_rec == 0)) // in no recording. Starting...
{
mp3Data = [];
console.log('Starting record...');
recording = 1;
start_rec = 1;
colorsTimer = setInterval(change_colors , 100);
}
else
{
if ((recording == 1) && (start_rec == 1)) // Recording. Stopping...
{
console.log('Stopping record...');
recording = 0;
start_rec = 0;
clearInterval(colorsTimer);
document.getElementsByClassName('openwebrx-button openwebrx-demodulator-button openwebrx-button-dig')[0].style.color = 'RED';
var my_filename =  'REC' +'_'+ new Date().toLocaleString('sv').replace(' ', 'T'); + '.mp3'
save_mp3(0,my_filename);
}
}


}

var save_mp3 = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, name) {
        var mp3buf = mp3encoder.flush();   //finish writing mp3

if (mp3buf.length > 0) {
    mp3Data.push(new Int8Array(mp3buf));
}
		var blob = new Blob(mp3Data, {type: "audio/mp3"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

ImaAdpcmCodec.prototype.decodeWithSync = function(data) {
    
	var output = new Int16Array(data.length * 2);
    var oi = 0;
    for (var index = 0; index < data.length; index++) {
        switch (this.phase) {
            case 0:
                // search for sync word
                if (data[index] !== this.syncWord.charCodeAt(this.synchronized++)) {
                    // reset if data is unexpected
                    this.synchronized = 0;
                }
                // if sync word has been found pass on to next phase
                if (this.synchronized === 4) {
                    this.syncBufferIndex = 0;
                    this.phase = 1;
                }
                break;
            case 1:
                // read codec runtime data from stream
                this.syncBuffer[this.syncBufferIndex++] = data[index];
                // if data is complete, apply and pass on to next phase
                if (this.syncBufferIndex === 4) {
                    var syncData = new Int16Array(this.syncBuffer.buffer);
                    this.stepIndex = syncData[0];
                    this.predictor = syncData[1];
                    this.syncCounter = 1000;
                    this.phase = 2;
                }
                break;
            case 2:
                // decode actual audio data
                output[oi++] = this.decodeNibble(data[index] & 0x0F);
                output[oi++] = this.decodeNibble(data[index] >> 4);
                // if the next sync keyword is due, reset and return to phase 0
                if (this.syncCounter-- === 0) {
                    this.synchronized = 0;
                    this.phase = 0;
                }
                break;
        }
    }
    
	
	if (start_rec == 1)
	{	
	samples = output.slice(0, oi);
	
	for (var i = 0; i < samples.length; i += sampleBlockSize) {
  sampleChunk = samples.subarray(i, i + sampleBlockSize);
  var mp3buf = mp3encoder.encodeBuffer(sampleChunk);
  if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
  }
}	
	}
return output.slice(0, oi);
};
function change_button ()
{
document.getElementsByClassName('openwebrx-button openwebrx-demodulator-button openwebrx-button-dig')[0].style.color = 'RED';
document.getElementsByClassName('openwebrx-button openwebrx-demodulator-button openwebrx-button-dig')[0].textContent = 'REC';
document.getElementsByClassName('openwebrx-button openwebrx-demodulator-button openwebrx-button-dig')[0].onclick = recording_mp3;
}
setTimeout(change_button, 5000);
