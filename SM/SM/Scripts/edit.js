$(document).ready(function () {
    console.log("ready!");

    var counter = 1;
    var current = 1;
    var max = 1;
    var showSlide = false;
    var si;
    var color;
    var vformat = "mp4";
    var vprocessing = false;
    var pprocessing = false;
    var vincarc = false;

    var mousePressed = false;
    var lastX, lastY;
    var ctx = null;
    var colorhistogram = {};
    var histogram = {};


    function drawhist(canvasname) {
        var ctx = $(canvasname)[0].getContext("2d");
        ctx.fillStyle = "rgb(0,0,0);";

        var max = Math.max.apply(null, histogram.values);

        jQuery.each(histogram.values, function (i, x) {
            var pct = (histogram.values[i] / max) * 100;
            ctx.fillRect(i, 100, 1, -Math.round(pct));
        });
    }

    $("#add-photo").click(function () {
        if (showSlide)
            return;
        $("#browse").click();
    });

    function readURL(input) {
        if (showSlide)
            return;

        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                g_d = e.target.result;
                $('#preview').attr('src', e.target.result);
                $('#images').append('<img id="img' + counter + '" " src="#" />');
                $('#img' + counter).attr('src', e.target.result);
                var thumbnail = '<img class="small-img" width="50" height="50" id="i"' + counter + ' src="' + e.target.result + '"/>'
                $('#thumbnails').append('<div id="p' + counter + '" class="preview-small"></div >');
                $('#p' + counter).append(thumbnail);

                hideCurrent();
                $('#window-edit').append('<canvas  id="c' + counter + '" width="320px" height="250px"></canvas >')

                current = counter;
                counter++;
                max = counter;
                initDraw();

                base_image = new Image();
                base_image.src = e.target.result;

                base_image.onload = function () {
                    var canvas = document.getElementById('c' + current)
                    ctx = canvas.getContext('2d');

                    var canvasStyle = getComputedStyle(canvas);
                    var canvasWidth = canvasStyle.width.replace("px", "");
                    canvasWidth = document.getElementById('window-edit').offsetWidth;
                    var imageRatio = this.width / this.height;
                    var canvasHeight = canvasWidth / imageRatio;

                    var diff = canvasHeight / 360;
                    if (diff > 1) {
                        canvasHeight /= diff;
                        canvasWidth /= diff;
                    }

                    canvas.style.height = canvasHeight + "px";
                    canvas.width = canvasWidth;
                    canvas.height = canvasHeight;
                    ctx.drawImage(this, 0, 0, canvasWidth, canvasHeight);
                }

            }

            reader.readAsDataURL(input.files[0]);
        }
    }

    function hideCurrent() {
        $('#c' + current).hide();
    }

    function showCurrent() {
        $('#c' + current).show();
        initDraw();
    }

    $('body').on('click', '.preview-small', function () {
        if (showSlide)
            return;
        var id = String(this.id);
        id = id.split("p")[1];

        hideCurrent();
        current = id;
        showCurrent();
    })

    $("#browse").change(function () {
        if (showSlide)
            return;
        $('.window-edit').css('background-color', 'white');
        readURL(this);
    });

    $("#histogram").click(function () {
        var canvas = document.getElementById('histcanvas');
        var context = canvas.getContext("2d");

        context.clearRect(0, 0, canvas.width, canvas.height);

        $("#c" + current).pixastic("histogram",
            { color: "rgb(255,0,0)", returnValue: histogram });
        drawhist("#histcanvas");
    });

    $("#black-and-white").click(function () {
        if (showSlide)
            return;

        var c = document.getElementById('c' + current);
        var ctx = c.getContext('2d');
        var imgData = ctx.getImageData(0, 0, c.width, c.height);
        var d = imgData.data;
        for (var i = 0; i < d.length; i += 4) {
            var r = d[i];
            var g = d[i + 1];
            var b = d[i + 2];
            // CIE luminance for the RGB
            // The human eye is bad at seeing red and blue, so we de-emphasize them.
            var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            d[i] = d[i + 1] = d[i + 2] = v
        }
        ctx.putImageData(imgData, 0, 0);
    });

    $("#bright").click(function () {

        if (showSlide)
            return;

        var adjustment = Number($('#brightScale').val());

        if (adjustment > 100) {
            $('#brightScale').val() = 0;
            return;
        }
        var c = document.getElementById('c' + current);
        var ctx = c.getContext('2d');
        var imgData = ctx.getImageData(0, 0, c.width, c.height);
        var d = imgData.data;

        for (var i = 0; i < d.length; i += 4) {
            d[i] += adjustment;
            d[i + 1] += adjustment;
            d[i + 2] += adjustment;
        }
        ctx.putImageData(imgData, 0, 0);
    });

    $("#contrast").click(function () {

        if (showSlide)
            return;

        var contrast = Number($('#contrastScale').val());

        if (contrast > 100) {
            $('#contrastScale').val() = 0;
            return;
        }
        var c = document.getElementById('c' + current);
        var ctx = c.getContext('2d');
        var imgData = ctx.getImageData(0, 0, c.width, c.height);
        var d = imgData.data;

        var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        for (var i = 0; i < d.length; i += 4) {
            d[i] = factor * (d[i] - 128) + 128;
            d[i + 1] = factor * (d[i + 1] - 128) + 128;
            d[i + 2] = factor * (d[i + 2] - 128) + 128;
        }
        ctx.putImageData(imgData, 0, 0);
    });

    $("#saturation").click(function () {

        if (showSlide)
            return;

        var saturation = Number($('#saturationScale').val());

        if (saturation > 100 || saturation < 0) {
            $('#saturationScale').val() = 0;
            return;
        }

        var c = document.getElementById('c' + current);
        var ctx = c.getContext('2d');

        ctx.globalCompositeOperation = "saturation";
        ctx.fillStyle = "hsl(0," + saturation + "%, 50%)";  // hue doesn't matter here
        ctx.fillRect(0, 0, c.width, c.height);
    });

    $("#invert").click(function () {

        if (showSlide)
            return;

        var c = document.getElementById('c' + current);
        var ctx = c.getContext('2d');

        ctx.globalCompositeOperation = 'difference';
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, c.width, c.height);
    })

    $("#rotate_right").click(function () {

        if (showSlide)
            return;

        var canvas = document.getElementById('c' + current);
        var context = canvas.getContext("2d");

        myImageData = new Image();
        myImageData.src = canvas.toDataURL();

        myImageData.onload = function () {
            var cw = canvas.width;
            var ch = canvas.height;
            // reset the canvas with new dimensions
            canvas.width = ch;
            canvas.height = cw;
            cw = canvas.width;
            ch = canvas.height;

            context.save();
            // translate and rotate

            context.translate(cw, ch / cw);
            context.rotate(Math.PI / 2);
            // draw the previows image, now rotated
            context.drawImage(myImageData, 0, 0);

            context.restore();

            // clear the temporary image
            myImageData = null;

        }
    });

    $('#mirror').click(function () {

        if (showSlide)
            return;

        var canvas = document.getElementById('c' + current);
        var context = canvas.getContext("2d");

        myImageData = new Image();
        myImageData.src = canvas.toDataURL();

        myImageData.onload = function () {

            context.save();
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
            context.drawImage(myImageData, 0, 0);
            context.restore();

            myImageData = null;

        }

    });

    $('#save').click(function () {
        var c = document.getElementById('c' + current);
        c.toBlob(function (blob) {
            saveAs(blob, "output.png");
        }, "image/png");
    })

    $('#scale_plus').click(function () {

        if (showSlide)
            return;

        var canvas = document.getElementById('c' + current);
        var context = canvas.getContext("2d");

        myImageData = new Image();
        myImageData.src = canvas.toDataURL();

        myImageData.onload = function () {

            context.save();
            var s = 1.1;
            context.clearRect(0, 0, canvas.width, canvas.height);

            myImageData.width = canvas.width;
            myImageData.height = canvas.height;

            context.scale(s, s);
            context.drawImage(myImageData, 0, 0);
            context.restore();

            myImageData = null;

        }
    });

    $('#scale_minus').click(function () {

        if (showSlide)
            return;

        var canvas = document.getElementById('c' + current);
        var context = canvas.getContext("2d");

        myImageData = new Image();
        myImageData.src = canvas.toDataURL();

        myImageData.onload = function () {

            context.save();
            var s = 0.9;
            context.clearRect(0, 0, canvas.width, canvas.height);
            myImageData.width = canvas.width;
            myImageData.height = canvas.height;

            context.scale(s, s);
            context.drawImage(myImageData, 0, 0);
            context.restore();

            myImageData = null;

        }
    });

    $("#undo").click(function () {

        if (showSlide)
            return;

        var img = document.getElementById('img' + current);
        var canvas = document.getElementById('c' + current),
            ctx = canvas.getContext('2d');

        var canvasStyle = getComputedStyle(canvas);
        var canvasWidth = canvasStyle.width.replace("px", "");
        canvasWidth = document.getElementById('window-edit').offsetWidth;
        var imageRatio = img.width / img.height;
        var canvasHeight = canvasWidth / imageRatio;

        var diff = canvasHeight / 360;
        if (diff > 1) {
            canvasHeight /= diff;
            canvasWidth /= diff;
        }

        canvas.style.height = canvasHeight + "px";
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

    });


    $('#slide-show').click(function () {
        var i = 1;
        if (!showSlide) {
            $('#slide-show').html('Stop Show  <i class="fa fa-picture-o" aria-hidden="true"></i>')
            showSlide = true;
            si = setInterval(function () {
                if (i >= max) {
                    i = 1;
                }
                for (var j = 1; j <= max; j++) {
                    $('#c' + j).hide();
                }
                $('#c' + i).show();

                console.dir('se arata')
                i++;
            }, 2000);
        }
        else {
            showSlide = false;
            $('#slide-show').html('Start Show  <i class="fa fa-picture-o" aria-hidden="true"></i>')
            clearInterval(si);
            for (var j = 1; j <= max; j++) {
                $('#c' + j).hide();
            }
            showCurrent();
        }

    });



    function initDraw() {
        ctx = document.getElementById('c' + current).getContext("2d");

        $('#c' + current).mousedown(function (e) {
            mousePressed = true;
            Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false);
        });

        $('#c' + current).mousemove(function (e) {
            if (mousePressed) {
                Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
            }
        });

        $('#c' + current).mouseup(function (e) {
            mousePressed = false;
        });
        $('#c' + current).mouseleave(function (e) {
            mousePressed = false;
        });
    };

    function Draw(x, y, isDown) {
        if (isDown) {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.lineJoin = "round";
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.closePath();
            ctx.stroke();
        }
        lastX = x; lastY = y;
    }

    $('.color-pen').click(function () {
        color = this.id;
    });

    ////////////////////////////////////////////////
    $('#upload_audio').click(function () {
        var data_form = new FormData($('#audio_form')[0]);
        $.ajax({
            url: "/Edit/UploadAudio",
            data: data_form,
            type: 'post',
            cache: false,
            contentType: false,
            processData: false,
            success: function (data) {
                document.getElementById("sunet-1").setAttribute("src", "http://sm.com/content/" + data.name1);
                document.getElementById("sunet-2").setAttribute("src", "http://sm.com/content/" + data.name2);
                alert("Fisiere incarcate cu succes!");
            }
        });
    });

    $('#reverse').click(function () {
        var content = document.getElementById("sunet-1").getAttribute("src");
        content = content.split("/");
        content = content[content.length - 1];
        console.dir(content);

        alert("Fisierul se proceseaza");

        $.ajax({
            url: "/Edit/Reverse",
            data: { 'name': content },
            type: 'post',
            cache: false,
            success: function (data) {
                document.getElementById("sunet-1").setAttribute("src", "http://sm.com/content/" + data.name1);
                alert("Fisierul a fost inversat");
            }
        });
    });

    //////////////////////////////
    $('#upload_video').click(function () {

        if (vprocessing == true)
            return;

        vprocessing = true;
        $('#video_link').hide();
        var data_form = new FormData($('#video_form')[0]);
        var format = vformat;
        data_form.append('toFormat', format);
        $(this).html('<i class="fa fa-refresh fa-spin" aria-hidden="true"></i>')
        $.ajax({
            url: "/Edit/VideoConvert",
            data: data_form,
            type: 'post',
            cache: false,
            contentType: false,
            processData: false,
            success: function (data) {
                vprocessing = false;
                $('#upload_video').html('Convert');
                if (data.succes == true) {
                    $('#video_link').attr('href', data.link);
                    $('#video_link').show();
                }
            },
            error: function (data) {
                vprocessing = false;
                $('#upload_video').html('Convert');
            }
        });
    });

    $('#incarca_video').click(function () {

        if (vincarc == true)
            return;

        vincarc = true;
        var data_form = new FormData($('#video_incarca_form')[0]);
        $(this).html('<i class="fa fa-refresh fa-spin" aria-hidden="true"></i>')
        $.ajax({
            url: "/Edit/UploadVideo",
            data: data_form,
            type: 'post',
            cache: false,
            contentType: false,
            processData: false,
            success: function (data) {
                vincarc = false;
                $('#incarca_video').html('Upload');
                if (data.succes == true) {
                    document.getElementById('video-ascuns').setAttribute("src", data.file);
                    document.getElementById('video-ascuns').load();
                    document.getElementById('video-ascuns').play();
                }
            },
            error: function (data) {
                vincarc = false;
                $('#incarca_video').html('Upload');
            }
        });
    });

    $('select').change(function () {
        vformat = $(this).children('option:selected').val();
    });

    $('#upload_powerpoint').click(function () {

        if (pprocessing == true)
            return;

        pprocessing = true;
        $('#video2_link').hide();
        var data_form = new FormData($('#powerpoint_form')[0]);
        $(this).html('<i class="fa fa-refresh fa-spin" aria-hidden="true"></i>')
        $.ajax({
            url: "/Edit/Transform",
            data: data_form,
            type: 'post',
            cache: false,
            contentType: false,
            processData: false,
            success: function (data) {
                pprocessing = false;
                $('#upload_powerpoint').html('Convert');
                if (data.succes == true) {
                    $('#video2_link').attr('href', data.link);
                    $('#video2_link').show();
                }
            },
            error: function (data) {
                pprocessing = false;
                $('#upload_powerpoint').html('Convert');
            }
        });
    });

    function grayscale(pixels) {
        //see http://www.html5rocks.com/en/tutorials/canvas/imagefilters/ for a full introduction to filters and canvas
        var d = pixels.data;
        for (var i = 0; i < d.length; i += 4) {
            var r = d[i];
            var g = d[i + 1];
            var b = d[i + 2];
            // CIE luminance for the RGB
            // The human eye is bad at seeing red and blue, so we de-emphasize them.
            var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            d[i] = d[i + 1] = d[i + 2] = v
        }
        return pixels;
    }


    function changeBright(pixels) {
        d = pixels.data;
        for (var i = 0; i < d.length; i += 4) {
            d[i] += vbright;
            d[i + 1] += vbright;
            d[i + 2] += vbright;
        }
        return pixels;
    }

    var vbright = 0;
    var grayed = false;
    var invert = false;
    var c_mode = 'source-over';
    var c_opac = 1;
    var v = document.getElementById('video-ascuns');
    var vcanvas = document.getElementById('vidcanvas');
    var vcontext = vcanvas.getContext('2d');
    function draw() {
        if (v.paused || v.ended) return false;
        vcontext.clearRect(0, 0, 720, 480);
        vcontext.globalCompositeOperation = c_mode;
        vcontext.globalAlpha = c_opac;
        vcontext.drawImage(v, 0, 0, 720, 480);
        if (grayed) {
            vcontext.putImageData(grayscale(vcontext.getImageData(0, 0, 720, 480)), 0, 0);
        }
        if (invert) {
            vcontext.globalCompositeOperation = 'difference';
            vcontext.fillStyle = 'white';
            vcontext.fillRect(0, 0, 720, 480);
        }

        vcontext.putImageData(changeBright(vcontext.getImageData(0, 0, 720, 480)), 0, 0);
        requestAnimFrame(draw);
        return true;
    }
    v.addEventListener('play', function () {
        draw();
    }, false);
    
    $('select').bind('change', function (event) {
        c_mode = event.target.value;
    })
    

    $('#test').click(function () {
        v.play();
    });

    $('#vpause').click(function () {
        v.pause();
    })

    $('#vstop').click(function () {
        v.currentTime = 0;
    })

    $('#vplay').click(function () {
        v.playbackRate = 1.0;
        v.play();
    })

    $('#speed_minus').click(function () {
        v.playbackRate = v.playbackRate * 0.5
    })

    $('#speed_plus').click(function () {
        v.playbackRate = v.playbackRate * 2.0
    })

    $('#vblackwhite').click(function () {
        if (grayed == true)
            grayed = false;
        else
            grayed = true;

    })

    $('#vinvert').click(function () {
        if (invert == true)
            invert = false;
        else
            invert = true;

    })

    $('#bright_plus').click(function () {
        vbright = vbright + 10;
    });

    $('#bright_minus').click(function () {
        vbright = vbright - 10;
    });


});