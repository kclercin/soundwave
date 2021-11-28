window.onload = function () {
  let ratio = 1;
  let blueRatio = 1.1;
  let blackRatio = 1;
  let redRatio = 1.1;
  let maxDistortionBlack = 30;
  let maxDistortionBlue = 30;
  let maxDistortionRed = 30;

  function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  $("#ratio").on("change", function() {
    const value = $(this).val();
    ratio = parseFloat(value, 10) || 1;
  })

  $("#blackRatio").on("change", function() {
    const value = $(this).val();
    blackRatio = parseFloat(value, 10);
  })
  $("#blueRatio").on("change", function() {
    const value = $(this).val();
    blueRatio = parseFloat(value, 10);
  })
  $("#redRatio").on("change", function() {
    const value = $(this).val();
    redRatio = parseFloat(value, 10);
  })
  $("#maxDistortionBlack").on("change", function() {
    const value = $(this).val();
    maxDistortionBlack = parseFloat(value, 10) || 20;
  });
  $("#maxDistortionBlue").on("change", function() {
    const value = $(this).val();
    maxDistortionBlue = parseFloat(value, 10) || 30;
  });
    $("#maxDistortionRed").on("change", function() {
    const value = $(this).val();
    maxDistortionRed = parseFloat(value, 10) || 25;
  });

  $(document).on("keypress", function(e) {
    if(e.key == "c") {
      $("#configPanel").toggleClass("close")
    }
    if(e.key == "f") {
      toggleFullScreen();
    }
  })

  "use strict";
  var h = document.getElementsByTagName('h1')[0];
  var report = 0;
  var blueCircles = $(".corners4")
  var redCircles = $(".corners2")
  var blackCircles = $(".corners3")

  var soundAllowed = function (stream) {
    //Audio stops listening in FF without // window.persistAudioStream = stream;
    //https://bugzilla.mozilla.org/show_bug.cgi?id=965483
    //https://support.mozilla.org/en-US/questions/984179
    h.setAttribute('style', 'opacity: 0;');
    window.persistAudioStream = stream;
    var audioContent = new AudioContext();
    var audioStream = audioContent.createMediaStreamSource(stream);
    var analyser = audioContent.createAnalyser();
    audioStream.connect(analyser);
    analyser.fftSize = 1024;

    var frequencyArray = new Uint8Array(analyser.frequencyBinCount);
    //visualizer.setAttribute('viewBox', '0 0 255 255');
    var doDraw = function () {
      requestAnimationFrame(doDraw);
      analyser.getByteFrequencyData(frequencyArray);
      const blackFrequency = frequencyArray.slice(0, 84).reduce((acc, value) => acc + value, 0);
      const redFrequency = frequencyArray.slice(85, 169).reduce((acc, value) => acc + value, 0);;
      const blueFrequency = frequencyArray.slice(170, 254).reduce((acc, value) => acc + value, 0);

      let blueSkew = (blackFrequency / 500) * (blueRatio * ratio);
      blueSkew = blueSkew - (blueSkew % 5)
      if (blueSkew > maxDistortionBlue) blueSkew = maxDistortionBlue;

      let blackSkew = (blueFrequency / 500) * (blackRatio * ratio);
      blackSkew = blackSkew - (blackSkew % 5)
      if (blackSkew > maxDistortionBlack) blackSkew = maxDistortionBlack;

      let redSkew = (redFrequency / 500) * (redRatio * ratio);
      redSkew = redSkew - (redSkew % 5)
      if (redSkew > maxDistortionRed) redSkew = maxDistortionRed;
      //console.log(blackSkew, blueSkew, redSkew)

      blackCircles.css({
        transform: 'skewX(' + blackSkew +'deg)' + 'skewY(' + blackSkew + 'deg)'
      });
      blueCircles.css({
        transform: 'skewX(' + blueSkew + 'deg)' + 'skewY(' + blueSkew + 'deg)'
      });
      redCircles.css({
        transform: 'skewX(' + redSkew + 'deg)' + 'skewY(' + redSkew + 'deg)'
      });
    }
    doDraw();
  }

  var soundNotAllowed = function (error) {
    h.innerHTML = "You must allow your microphone.";
    console.log(error);
  }

  window.navigator = window.navigator || {};
  navigator.getUserMedia =  navigator.getUserMedia       ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia    ||
                            null;
  navigator.getUserMedia({ audio: true }, soundAllowed, soundNotAllowed);

};
