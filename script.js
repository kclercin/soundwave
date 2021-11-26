window.onload = function () {





      function getRandomInt(max) {
        return Math.floor(Math.random() * max);
      }

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
          var adjustedLength;
          let blueSkew = (blackFrequency / 500) * (1.5 * ratio);
          blueSkew = blueSkew - (blueSkew % 5)
          let blackSkew = (blueFrequency / 500) * (2 * ratio);
          blackSkew = blackSkew - (blackSkew % 5)
          let redSkew = (redFrequency / 500) * (1.5 * ratio);
          redSkew = redSkew - (redSkew % 5)
          //console.log(blackSkew, blueSkew, redSkew)
          blackCircles.css({
            transform: 'skewX(' + blackSkew / 2 +'deg)' + 'skewY(' + blackSkew + 'deg)'
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

      /*window.navigator = window.navigator || {};
      /*navigator.getUserMedia =  navigator.getUserMedia       ||
                                navigator.webkitGetUserMedia ||
                                navigator.mozGetUserMedia    ||
                                null;*/
      navigator.getUserMedia({ audio: true }, soundAllowed, soundNotAllowed);

    };
