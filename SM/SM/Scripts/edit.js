$(document).ready(function () {
    console.log("ready!");

    var counter = 1;
    var current = 1;
    var max = 1;
    var showSlide = false;
    var si;
    var color;

    var mousePressed = false;
    var lastX, lastY;
    var ctx = null;

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

    function hideCurrent()
    {
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
        $('html,body').scrollTop($("#services").offset().top + 60)
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

        if (adjustment > 100 || adjustment < 0)
        {
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

        if (contrast > 100 || contrast < 0) {
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
            var s = 1.05;
            context.clearRect(0, 0, canvas.width, canvas.height);
            canvas.width = canvas.width * s;
            myImageData.width = canvas.width;
            myImageData.height = canvas.height;

            context.scale(s, 1);
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
            var s = 0.95;
            context.clearRect(0, 0, canvas.width, canvas.height);
            canvas.width = canvas.width * s;
            myImageData.width = canvas.width;
            myImageData.height = canvas.height;

            context.scale(s, 1);
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
        if (!showSlide)
        {
            $('#slide-show').html('Stop Show  <i class="fa fa-picture-o" aria-hidden="true"></i>')
            showSlide = true;
            si = setInterval(function () {
                if (i >= max) {
                    i = 1;
                }
                for (var j = 1; j <= max; j++){
                    $('#c' + j).hide();
                }
                $('#c' + i).show();

                console.dir('se arata')
                i++;
            }, 2000);
        }
        else
        {
            showSlide = false;
            $('#slide-show').html('Start Show  <i class="fa fa-picture-o" aria-hidden="true"></i>')
            clearInterval(si);
            $('#c' + i).hide();
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

});