window.onload = function () {
  "use strict";
  var redMask = $('.red');
  var ratio = 1.1;
  var whiteMask = $('.white');
  var blueMask = $('.blue');
  var complexity = 15;
  var maxLength = 300;
  var blueDelay = 10;
  var h = document.getElementsByTagName('h1')[0];
  var redHistory = [];
  const numPoints = 255;
  const offset = 500;
  const lengthOffset = 120;

  function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  $(document).on("keypress", function(e) {
    if(e.key == "c") {
      $("#configPanel").toggleClass("close")
    }
    if(e.key == "f") {
      toggleFullScreen();
    }
  })

  $("#rotate").on("change", function(e) {
    const checked = e.target.checked;
    $('svg').toggleClass('rotate');
  });

  $("#ratio").on("change", function() {
    const value = $(this).val();
    ratio = parseFloat(value, 10) || 1;
  })

  $("#blueDelay").on("change", function() {
    const value = $(this).val();
    blueDelay = parseFloat(value, 10);
  })

  $("#maxLength").on("change", function() {
    const value = $(this).val();
    maxLength = parseFloat(value, 10) || 250;
  })

  $("#complexity").on("change", function() {
    const value = $(this).val();
    complexity = parseFloat(value, 10) || 15;
  })

  function formatPoints(points, close) {
  points = [...points];
  // so that coords can be passed as objects or arrays
  if (!Array.isArray(points[0])) {
    points = points.map(({ x, y }) => [x, y]);
  }

  if (close) {
    const lastPoint = points[points.length - 1];
    const secondToLastPoint = points[points.length - 2];

    const firstPoint = points[0];
    const secondPoint = points[1];

    points.unshift(lastPoint);
    points.unshift(secondToLastPoint);

    points.push(firstPoint);
    points.push(secondPoint);
  }

  return points.flat();
  }

  function spline(points = [], tension = 1, close = true, cb) {
    points = formatPoints(points, close);

    const size = points.length;
    const last = size - 4;

    const startPointX = close ? points[2] : points[0];
    const startPointY = close ? points[3] : points[1];

    let path = "M" + [startPointX, startPointY];

    cb && cb("MOVE", [startPointX, startPointY]);

    const startIteration = close ? 2 : 0;
    const maxIteration = close ? size - 4 : size - 2;
    const inc = 2;

    for (let i = startIteration; i < maxIteration; i += inc) {
      const x0 = i ? points[i - 2] : points[0];
      const y0 = i ? points[i - 1] : points[1];

      const x1 = points[i + 0];
      const y1 = points[i + 1];

      const x2 = points[i + 2];
      const y2 = points[i + 3];

      const x3 = i !== last ? points[i + 4] : x2;
      const y3 = i !== last ? points[i + 5] : y2;

      const cp1x = x1 + ((x2 - x0) / 6) * tension;
      const cp1y = y1 + ((y2 - y0) / 6) * tension;

      const cp2x = x2 - ((x3 - x1) / 6) * tension;
      const cp2y = y2 - ((y3 - y1) / 6) * tension;

      path += "C" + [cp1x, cp1y, cp2x, cp2y, x2, y2];

      cb && cb("CURVE", [cp1x, cp1y, cp2x, cp2y, x2, y2]);
    }

    return path;
  }

  var soundAllowed = function (stream) {
    //Audio stops listening in FF without // window.persistAudioStream = stream;
    //https://bugzilla.mozilla.org/show_bug.cgi?id=965483
    //https://support.mozilla.org/en-US/questions/984179
    window.persistAudioStream = stream;
    h.innerHTML = "Thanks";
    h.setAttribute('style', 'opacity: 0;');
    var audioContent = new AudioContext();
    var audioStream = audioContent.createMediaStreamSource( stream );
    var analyser = audioContent.createAnalyser();
    audioStream.connect(analyser);
    analyser.fftSize = 2048;
    analyser.maxDecibels = 110;

    var frequencyArray = new Uint8Array(analyser.frequencyBinCount);

    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    $("svg").append(p)

    var adjustPoints = (points, ratio = 1) => {
      return points.reduce((acc, value, index) => {
        var pointRatio = 1;

        var x = ((value[0] - offset) * ratio * pointRatio) + offset;
        var y = ((value[1] - offset) * ratio * pointRatio) + offset;

        acc.push([x, y]);
        return acc;
      }, [])
    };
    function average(data) {
        var sum = data.reduce(function(sum, value) {
            return sum + value;
        }, 0);
        var avg = sum / data.length;
        return avg;
    }

    function smooth(values, alpha = 1) {
        var weighted = average(values) * alpha;
        var smoothed = [];
        for (var i in values) {
            var curr = values[i];
            var prev = smoothed[i - 1] || values[values.length - 1];
            var next = curr || values[0];
            var improved = Number(average([weighted, prev, curr, next]).toFixed(2));
            smoothed.push(improved);
        }
        return smoothed;
    }


    var doDraw = function () {
      requestAnimationFrame(doDraw);
      analyser.getByteFrequencyData(frequencyArray);
      let invertedPoints = []
      var index = 0;
      var ls = [];
      for(var i = 0; i < numPoints; i++) {
          ls.push(Math.floor(frequencyArray[i]) * 0.7);
      }
      var lengths = []
      console.log(ls.length)
      lengths = _.chunk(ls, complexity).map(values => {
        var max = _.max(values);
        return max;
      });
      //lengths = smooth(lengths)

      var angleStep = (Math.PI) / lengths.length;
      index = 0;
      var points = lengths.reduce((acc, length, index) => {
        const theta = index * angleStep;
        length = length * ratio + lengthOffset
        if(length < 130) length = 130;
        if(length > maxLength) length = maxLength;
        const yRadius = Math.sin(theta) * length;
        const xRadius = Math.cos(theta) * length;

        const x = offset + xRadius
        const y = offset + yRadius;
        const invertedY = offset - yRadius;
        invertedPoints.push([x, invertedY])
        index++;
        acc.push([x, y]);

        return acc;
      }, []);

      points = points.concat(invertedPoints.reverse());
      points.splice(points.length - 1, 1)

      const redPoints = adjustPoints(points);

      const redPath = spline(redPoints);

      const whitePoints = adjustPoints(points, 0.90);
      const whitePath = spline(whitePoints);
      redHistory.push(redPath);

      redMask.children("path").attr('d', redPath)
      whiteMask.children("path").attr('d', whitePath)

      if (redHistory.length >= blueDelay) {
        const bluePath = redHistory.splice(0, 1);
        blueMask.children("path").attr('d', bluePath)
      }
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
  navigator.getUserMedia({audio:true}, soundAllowed, soundNotAllowed);

};
