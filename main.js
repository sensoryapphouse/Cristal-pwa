/* Copyright:		© 2012 by Vitaly Gordon (rocket.mind@gmail.com)
 * Licensed under:	MIT
 
 
 PB:    1. pause/play
        2. pen width
        3. clear
        4. speed
        5. erase mode
        6. cellular mode - set rules
        7. hue, contrast etc - i.e. filter
        
        Gamepad code from Mandala
 */
window.onload = () => {
    'use strict';
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js');
    }
}


var debug = false
var speed = 5;

var audio;
var paused = false;
var crosshairs;
var button;
var button1;
var button2;
var button3;
var button4;
var buttonl;
var buttonr;
var splash;
var cvs;
var linewidth;
var brushSize = 16.0; // PB thickness of brush
var viewStyle = 0;
var that = null;
var tmr = null;
var toggleAnimate = false;
var filterString = "";

function PlaySound(s) {
    if (audio != undefined)
        audio.pause();
    try {
        audio = new Audio('sounds/' + s);
        audio.play();
        console.log('Sound: ' + s);
    } catch {};
}

function Action(i) {
    PlaySound("cork.mp3");
    switch (i) {
        case 1: // pause play
            that.randomPaint();
            paused = !paused;
            if (paused)
                buttonl.style.backgroundImage = "url('images/play.png')";
            else
                buttonl.style.backgroundImage = "url('images/pause.png')";
            break;
        case 2: // brushsize
            switch (brushSize) {
                case 16:
                    brushSize = 24;
                    break;
                case 24:
                    brushSize = 2;
                    break;
                case 2:
                    brushSize = 4;
                    break;
                case 4:
                    brushSize = 8;
                    break;
                default:
                    brushSize = 16;
                    break;
            }
            break
        case 3: // clear screen
            that.reset('nothing');
            that.eraseMode = false;
            break;
        case 4: // speed
            switch (speed) {
                case 5:
                    speed = 40;
                    break;
                case 40:
                    speed = 20;
                    break;
                default:
                    speed = 5;
                    break;
            }
            break;
        case 5: // erase
            that.eraseMode = !that.eraseMode;
            if (that.eraseMode)
                button3.style.backgroundImage = "url('images/erase.png')";
            else
                button3.style.backgroundImage = "url('images/paint.png')";
            break;
        case 6: // cellular rules change
            that.currentRuleset--;
            if (that.currentRuleset < 0)
                that.currentRuleset = 2;
            break;
        case 7: /// change hue/invert/etc
            viewStyle++;
            switch (viewStyle) {
                case 1:
                    filterString = "sepia(50%)"
                    break;
                case 2:
                    filterString = "sepia(80%)"
                    break;
                case 3:
                    filterString = "grayscale(50%)"
                    break;
                case 4:
                    filterString = "grayscale(80%)"
                    break;
                case 5:
                    filterString = "invert(100%)";
                    break;
                case 6:
                    filterString = "sepia(50%) invert(100%)"
                    break;
                case 7:
                    filterString = "sepia(80%) invert(100%)"
                    break;
                case 8:
                    filterString = "grayscale(50%) invert(100%)"
                    break;
                case 9:
                    filterString = "grayscale(80%) invert(100%)"
                    break;
                default:
                    toggleAnimate = !toggleAnimate;
                    if (toggleAnimate) {
                        tmr = setInterval(frame, 20);
                        var hue = 0;

                        function frame() {
                            hue += 1;
                            if (hue >= 360)
                                hue = 0;
                            var s = "hue-rotate(" + hue.toString() + "deg)"
                            cvs.style.filter = s + filterString;
                        }
                    } else {
                        clearInterval(tmr);
                    }

                    viewStyle = 0;
                    filterString = "";
                    break;
            }
            cvs.style.filter = filterString;
            break;
    }
    //    this.setCurrentRuleset(index) // 1-3
    //    this.setRules()
    // conway rules  =  0, 0, 1, 2, 0, 0, 0, 0, 0
    // default rules    0, 0, 1, 2, 0, 0, 0, 1, 0
    // breeder2         0, 0, 1, 2, 0, 0, 1, 1, 0
    // thermal sensor   1, 0, 2, 0, 1, 0, 0, 1, 0
}

function toggleButtons() {
    button.hidden = !button.hidden;
    button1.hidden = !button1.hidden;
    button2.hidden = !button2.hidden;
    button3.hidden = !button3.hidden;
    button4.hidden = !button4.hidden;
    buttonl.hidden = !buttonl.hidden;
    buttonr.hidden = !buttonr.hidden;
}

Life = _.extends(Viewport, {
    init: function () {
        splash = document.querySelector('splash');
        crosshairs = document.querySelector('crosshairs');
        crosshairs.hidden = true;
        button = document.querySelector('button');
        button1 = document.querySelector('button1');
        button2 = document.querySelector('button2');
        button3 = document.querySelector('button3');
        button4 = document.querySelector('button4');
        buttonl = document.querySelector('buttonl');
        buttonr = document.querySelector('buttonr');
        cvs = document.querySelector('canvas');
        window.requestAnimFrame =
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 300);
            };
        var tmr = window.setTimeout(function () {
            if (document.body.requestFullscreen) {
                document.body.requestFullscreen();
            } else if (document.body.msRequestFullscreen) {
                document.body.msRequestFullscreen();
            } else if (document.body.mozRequestFullScreen) {
                document.body.mozRequestFullScreen();
            } else if (document.body.webkitRequestFullscreen) {
                document.body.webkitRequestFullscreen();
            }
            splash.hidden = true;
        }, 3000); // hide Splash screen after 2.5 seconds
        splash.onclick = function (e) {
            clearTimeout(tmr);
            if (document.body.requestFullscreen) {
                document.body.requestFullscreen();
            } else if (document.body.msRequestFullscreen) {
                document.body.msRequestFullscreen();
            } else if (document.body.mozRequestFullScreen) {
                document.body.mozRequestFullScreen();
            } else if (document.body.webkitRequestFullscreen) {
                document.body.webkitRequestFullscreen();
            }
            splash.hidden = true;
        }

        buttonl.onclick = function (e) {
            Action(1);
        }
        button.onclick = function (e) {
            Action(2);
        }
        button1.onclick = function (e) {
            Action(3);
        }
        button2.onclick = function (e) {
            Action(4);
        }
        button3.onclick = function (e) {
            Action(5);
        }
        button4.onclick = function (e) {
            Action(6);
        }
        buttonr.onclick = function (e) {
            Action(7);
        }

        function MonitorKeyDown(e) { // stop autorepeat of keys with KeyState1-4 flags
            if (!e) e = window.event;
            if (e.repeat)
                return;
            if (e.keyCode == 32 || e.keyCode == 49) {
                Action(1);
            } else if (e.keyCode == 50) {
                Action(2);
            } else if (e.keyCode == 51 || e.keyCode == 13) {
                Action(3);
            } else if (e.keyCode == 52) {
                Action(4);
            } else if (e.keyCode == 53) {
                toggleButtons();
            } else if (e.keyCode == 189 || e.keycode == 27) { // +
                Action(5);
            } else if (e.keyCode == 187) { // -
                Action(6);
            }
            return false;
        }
        document.onkeydown = MonitorKeyDown;
        that = this;
        _.extend(this, {
            /* shaders */
            randomNoiseShader: this.shaderProgram({
                vertex: 'cell-vs',
                fragment: 'cell-random-noise-fs',
                attributes: ['position'],
                uniforms: ['seed']
            }),
            updateFromBitmapShader: this.shaderProgram({
                vertex: 'cell-vs',
                fragment: 'cell-update-from-bitmap-fs',
                attributes: ['position'],
                uniforms: ['source']
            }),
            iterationShader: this.shaderProgram({
                vertex: 'cell-vs-pixeloffset',
                fragment: 'cell-iteration-fs',
                attributes: ['position'],
                uniforms: ['previousStep', 'rulesOffset', 'screenSpace', 'pixelOffset', 'rules', 'activeRules', 'swirlFactor']
            }),
            parametricBrushShader: this.shaderProgram({
                vertex: 'cell-vs-pixeloffset',
                fragment: 'cell-brush-fs',
                attributes: ['position'],
                uniforms: ['cells', 'rules', 'rulesOffset', 'activeRules', 'swirlFactor',
					'brushPosition1', 'brushPosition2', 'brushSize', 'seed',
					'pixelSpace', 'screenSpace', 'pixelOffset', 'noise', 'fill', 'animate', 'hue']
            }),
            patternBrushShader: this.shaderProgram({
                vertex: 'cell-vs-pixeloffset',
                fragment: 'cell-bake-brush-fs',
                attributes: ['position'],
                uniforms: ['brush', 'cells', 'rulesOffset', 'rules', 'activeRules', 'swirlFactor', 'origin',
					'scale', 'color', 'screenSpace', 'pixelOffset', 'animate']
            }),
            copyBrushShader: this.shaderProgram({
                vertex: 'cell-vs',
                fragment: 'cell-copy-brush-fs',
                attributes: ['position'],
                uniforms: ['source', 'origin', 'scale']
            }),
            drawCellsShader: this.shaderProgram({
                vertex: 'simple-vs',
                fragment: 'draw-cells-fs',
                attributes: ['position'],
                uniforms: ['cells', 'transform']
            }),
            brushCursorShader: this.shaderProgram({
                vertex: 'simple-vs',
                fragment: 'brush-selection-cursor-fs',
                attributes: ['position'],
                uniforms: ['color', 'transform']
            }),
            /* square mesh */
            square: this.vertexBuffer({
                type: this.gl.TRIANGLE_STRIP,
                vertices: [
			         1.0, 1.0, 0.0,
			        -1.0, 1.0, 0.0,
			         1.0, -1.0, 0.0,
			        -1.0, -1.0, 0.0
		        ]
            }),
            /* rules */
            rulesBuffer: this.texture({
                width: 16,
                height: 4,
                data: this.genRulesBufferData(this.rules = [
					0, 0, 1, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
					0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					1, 0, 2, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
					1, 0, 2, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0])
            }),
            /* buffers */
            cellBuffer: null, // current
            cellBuffer1: this.renderTexture({
                width: 2048, // PB debug ? 512 : 1024,
                height: 1024 // PB 512
            }), // back
            cellBuffer2: this.renderTexture({
                width: 2048, // PB debug ? 512 : 1024,
                height: 1024 // PB512
            }), // front
            brushBuffer: this.renderTexture({
                width: 8,
                height: 8
            }), // clone stamp
            /* transform matrices */
            transform: new Transform(),
            screenTransform: new Transform(),
            /* changeable parameters */
            scrollSpeed: 0.0,
            patternBrushScale: 128.0,
            brushColor: 0.0, // set colour between 0 and 1
            brushType: 'noise',
            activeRules: 0, // PB
            currentRuleset: 0,
            swirlFactor: Math.pow(2.0, -10),
            /* other stuff */
            firstFrame: true
        })
        this.cellBuffer = this.cellBuffer1
        this.fillWithNothing()
        this.initUserInput()
        //this.initGUI()
        const initialise = {
            clientX: window.innerWidth / 2,
            clientY: window.innerHeight / 2
        };
        this.onPaintStart(initialise)
        this.onPaintEnd()
    },
    randomPaint: function (input) {
        const i = {
            clientX: Math.random() * window.innerWidth,
            clientY: Math.random() * window.innerHeight
        };
        this.onPaintStart(i)
        this.onPaintEnd()
    },
    genRulesBufferData: function (input) {
        return new Uint8Array(_.flatten(_.map(input, function (i) {
            return i == 2 ? [0, 255, 0, 0] : (i == 1 ? [0, 0, 0, 0] : [255, 0, 0, 0])
        })))
    },
    setCurrentRuleset: function (i) {
        this.currentRuleset = i;
    },
    setRules: function (rules) {
        for (index = 0; index < rules.length; index++)
            this.rules[this.currentRuleset * 16 + index] = rules[index];
        this.rulesBuffer.update(this.genRulesBufferData(this.rules))
    },
    rulesUpdate: function (at) {
        var rule = $('<div class="rule">').append($('<span class="count">' + at + ':</span>'))
        var buttons = $('<div class="btn-group" data-toggle="buttons-radio">').appendTo(rule)
        var die, keep, born
        var updateUI = rule.get(0).updateUI = function (value) {
            die.attr('class', 'btn ' + (value == 0 ? 'active btn-danger' : 'btn-inverse'))
            keep.attr('class', 'btn ' + (value == 1 ? 'active btn-info' : 'btn-inverse'))
            born.attr('class', 'btn ' + (value == 2 ? 'active btn-success' : 'btn-inverse'))
        }
        var commit = $.proxy(function (value) {
            this.rules[this.currentRuleset * 16 + at] = value
            this.rulesBuffer.update(this.genRulesBufferData(this.rules))
        }, this)
        die = $('<button class="btn">die</button>').click(function () {
            updateUI(0);
            commit(0);
        }).appendTo(buttons)
        keep = $('<button class="btn">keep</button>').click(function () {
            updateUI(1);
            commit(1);
        }).appendTo(buttons)
        born = $('<button class="btn">born</button>').click(function () {
            updateUI(2);
            commit(2);
        }).appendTo(buttons)
        updateUI(this.rules[at])
        return rule
    },
    initUserInput: function () {
        $(this.canvas).mousewheel($.proxy(this.onZoom, this))
        $(this.canvas).mousedown($.proxy(function (e) {
            if (!e.button) {
                if (!this.isCloning) {
                    this.onPaintStart(e)
                }
            } else {
                this.onDragStart(e)
            }
        }, this))
        $(this.canvas).bind('contextmenu', function (e) {
            e.preventDefault()
        })
        //        $(this.canvas).mousemove($.proxy(function (e) {
        //            this.cloneStampPosition = this.eventPoint(e)
        //        }, this))
        $(window).resize($.proxy(function () {
            var container = $('.viewport-container')
            var width = container.width(),
                height = container.height()
            if (width >= this.cellBuffer.width && height >= this.cellBuffer.height) {
                this.resize(this.cellBuffer.width, this.cellBuffer.height)
            } else {
                this.resize(width, height)
            }
        }, this)).resize();
        that.canvas.ontouchstart = function (e) {
            e.preventDefault();
            var touchs = e.changedTouches;
            that.onPaintStart(touchs[0]);
            that.onPaintEnd();
            console.log("Touch Start");
        };
        that.canvas.ontouchmove = function (e) {
            e.preventDefault();
            var touchs = e.changedTouches;
            that.paintTo = that.eventPoint(touchs[0])
            //            this.eraseMode = e.shiftKey
            that.shouldPaint = true
            console.log("Touch Move");
        };
        that.canvas.ontouchend = function (e) {
            e.preventDefault();
            that.onPaintEnd();
            console.log("Touch End");
        };
    },
    hueToCSSColor: function (H) {
        var r = Math.max(0.0, Math.min(1.0, Math.abs(H * 6.0 - 3.0) - 1.0))
        var g = Math.max(0.0, Math.min(1.0, 2.0 - Math.abs(H * 6.0 - 2.0)))
        var b = Math.max(0.0, Math.min(1.0, 2.0 - Math.abs(H * 6.0 - 4.0)))
        return 'rgba(' + Math.round(r * 255) + ',' + Math.round(g * 255) + ',' + Math.round(b * 255) + ', 1.0)'
    },
    enableScroll: function (enable) {
        this.scrollSpeed = enable ? 2.0 : 0.0
        $('.btn-scroll').toggleClass('yes', enable)
    },
    resizeBuffers: function (w, h) {
        this.cellBuffer1.resize(w, h)
        this.cellBuffer2.resize(w, h)
        $(window).resize()
        this.reset('nothing')
        this.updateTransform(new Transform())
    },
    reset: function (type) {
        if (type == 'noise') {
            this.fillWithRandomNoise()
        } else if (type == 'image') {
            $('.modal-overlay.loading').fadeIn(200)
            this.resizeBuffers(1024, 512)
            var image = new Image();
            image.onload = $.proxy(function () {
                this.cellBuffer.updateFromImage(image)
                this.cellBuffer.draw(function () {
                    this.updateFromBitmapShader.use()
                    this.updateFromBitmapShader.attributes.position.bindBuffer(this.square)
                    this.updateFromBitmapShader.uniforms.source.bindTexture(this.cellBuffer)
                    this.square.draw()
                }, this)
                $('.modal-overlay.loading').fadeOut(200)
            }, this)
            image.src = '';
        } else {
            this.fillWithNothing()
        }
    },
    eventPoint: function (e) {
        var offset = $(this.canvas).offset()
        return [
			(e.clientX - offset.left) / (this.viewportWidth * 0.5) - 1.0,
			(offset.top - e.clientY) / (this.viewportHeight * 0.5) + 1.0, 0.0]
    },
    onZoom: function (e) {
        var isMac = navigator.platform == 'MacIntel'
        var zoom = Math.pow(1.03, e.originalEvent.wheelDelta ?
            (e.originalEvent.wheelDelta / (isMac ? 360.0 : 36.0)) : -e.originalEvent.detail * (isMac ? 0.5 : 1.0))
        var origin = this.transform.applyInverse(this.eventPoint(e))
        this.updateTransform(this.transform.multiply(new Transform()
            .translate(origin)
            .scale([zoom, zoom, 1.0])
            .translate([-origin[0], -origin[1], 0.0])))
    },
    getZoom: function () {
        return vec3.length(vec3.subtract(
            this.transform.apply([0, 0, 0]),
            this.transform.apply([1, 0, 0])))
    },
    onDragStart: function (e) {
        this.isDragging = true
        var origin = this.transform.applyInverse(this.eventPoint(e))
        $(window).mousemove($.proxy(function (e) {
            var point = this.transform.applyInverse(this.eventPoint(e))
            this.updateTransform(this.transform.translate([point[0] - origin[0], point[1] - origin[1], 0.0]))
        }, this))
        $(window).mouseup($.proxy(function () {
            this.isDragging = false
            $(window).unbind('mouseup')
            $(window).unbind('mousemove')
        }, this))
    },
    onPaintStart: function (e) {
        var tmp = this.parametricBrushShader.uniforms.hue.set1f;
        this.paintFrom = this.paintTo = this.eventPoint(e)
        //        this.eraseMode = e.shiftKey
        this.shouldPaint = true
        this.isPainting = true
        this.parametricBrushShader.use()
        this.parametricBrushShader.uniforms.hue.set1f(Math.random())
        $(window).mousemove($.proxy(function (e) {
            this.paintTo = this.eventPoint(e)
            //            this.eraseMode = e.shiftKey
            this.shouldPaint = true
        }, this))
        $(window).mouseup($.proxy(function () {
            this.isPainting = false
            $(window).unbind('mouseup')
            $(window).unbind('mousemove')
        }, this))
    },
    onPaintEnd: function () {
        //this.shouldPaint = false
        this.isPainting = false
        $(window).unbind('mouseup')
        $(window).unbind('mousemove')
    },
    fillWithRandomNoise: function () {
        this.cellBuffer.draw(function () {
            this.randomNoiseShader.use()
            this.randomNoiseShader.attributes.position.bindBuffer(this.square)
            this.randomNoiseShader.uniforms.seed.set2f(Math.random(), Math.random())
            this.square.draw()
        }, this)
        this.firstFrame = true
    },
    fillWithNothing: function () {
        this.cellBuffer.draw(function () {
            this.gl.clearColor(0.0, 0.0, 0.0, 1.0)
            this.gl.clear(this.gl.COLOR_BUFFER_BIT)
        }, this)
    },
    springDynamics: function () {
        var zoom = this.getZoom()
        if (!this.isDragging) {
            if (zoom > 0.99) {
                var center = this.transform.apply([0, 0, 0])
                var springForce = [
					(Math.max(0, Math.abs(center[0]) - (zoom - 1))) / zoom,
					(Math.max(0, Math.abs(center[1]) - (zoom - 1))) / zoom]
                this.updateTransform(this.transform.translate([
					(Math.pow(1.2, springForce[0]) - 1.0) * (center[0] > 0 ? -1 : 1),
					(Math.pow(1.2, springForce[1]) - 1.0) * (center[1] > 0 ? -1 : 1), 0.0]))
            } else {
                this.updateTransform(this.transform.translate(this.transform.applyInverse([0, 0, 0])))
            }
        }
        if (zoom < 1.0) {
            var springForce = Math.pow(1.2, 1.0 - zoom)
            this.updateTransform(this.transform.scale([springForce, springForce, 1.0]))
        }
    },
    updateTransform: function (newTransform) {
        var viewportTransform = new Transform()
        var aspect = this.viewportWidth / this.viewportHeight
        var bufferAspect = this.cellBuffer.width / this.cellBuffer.height
        if (this.cellBuffer.width < this.viewportWidth && this.cellBuffer.height < this.viewportHeight) {
            viewportTransform = viewportTransform.scale([
				this.cellBuffer.width / this.viewportWidth,
				this.cellBuffer.height / this.viewportHeight, 1.0])
        } else {
            //            viewportTransform = viewportTransform.scale(this.cellBuffer.width > this.cellBuffer.height ? [1.0, aspect / bufferAspect, 1.0] : [bufferAspect / aspect, 1.0, 1.0]) // PB change transform
            viewportTransform = viewportTransform.scale([1.0, window.innerWidth / window.innerHeight, 1.0]) // PB change transform

        }
        this.transform = newTransform || this.transform
        this.screenTransform = this.transform.multiply(viewportTransform)
    },
    beforeDraw: function () {
        if (!paused) {
            if (this.shouldPaint) {
                this.paint(true)
            } else {
                this.iterate()
            }
        } else if (this.shouldPaint) {
            this.paint(false)
        }
        this.springDynamics()
    },
    renderCells: function (callback) {
        /* backbuffering */
        var targetBuffer = (this.cellBuffer == this.cellBuffer1 ? this.cellBuffer2 : this.cellBuffer1)
        targetBuffer.draw(callback, this)
        this.cellBuffer = targetBuffer
        this.firstFrame = false
    },
    iterate: function () {
        this.renderCells(function () {
            this.iterationShader.use()
            this.iterationShader.attributes.position.bindBuffer(this.square)
            this.iterationShader.uniforms.previousStep.bindTexture(this.cellBuffer, 0)
            this.iterationShader.uniforms.rules.bindTexture(this.rulesBuffer, 1)
            this.iterationShader.uniforms.swirlFactor.set1f(this.swirlFactor * 1.0)
            this.iterationShader.uniforms.activeRules.set1f(this.activeRules * 1.0)
            this.iterationShader.uniforms.rulesOffset.set1f(this.activeRules > 0 ? 0.0 : (this.currentRuleset / 4.0))
            this.iterationShader.uniforms.screenSpace.set2f(1.0 / this.cellBuffer.width, 1.0 / this.cellBuffer.height)
            this.iterationShader.uniforms.pixelOffset.set2f(
                0.0 / this.cellBuffer.width,
                -(0.5 + this.scrollSpeed * !this.firstFrame) / this.cellBuffer.height)
            this.square.draw()
        })
    },
    paint: function (animate) {
        if (this.brushType == 'pattern' && this.brushBufferReady) {
            this.paintBrushBuffer(animate)
        } else {
            this.paintParametricBrush(animate)
        }
        this.paintFrom = this.paintTo
        this.shouldPaint = false
    },
    paintBrushBuffer: function (animate) {
        this.renderCells(function () {
            this.patternBrushShader.use()
            this.patternBrushShader.attributes.position.bindBuffer(this.square)
            this.patternBrushShader.uniforms.cells.bindTexture(this.cellBuffer, 0)
            this.patternBrushShader.uniforms.rules.bindTexture(this.rulesBuffer, 1)
            this.patternBrushShader.uniforms.swirlFactor.set1f(this.swirlFactor * 1.0)
            this.patternBrushShader.uniforms.activeRules.set1f(this.activeRules * 1.0)
            this.patternBrushShader.uniforms.rulesOffset.set1f(this.activeRules > 0 ? 0.0 : (this.currentRuleset / 4.0))
            this.patternBrushShader.uniforms.brush.bindTexture(this.brushBuffer, 2)
            this.patternBrushShader.uniforms.pixelOffset.set2f(0.0,
                animate ? (-(0.5 + this.scrollSpeed * !this.firstFrame) / this.cellBuffer.height) : 0.0)
            this.patternBrushShader.uniforms.screenSpace.set2f(1.0 / this.cellBuffer.width, 1.0 / this.cellBuffer.height)
            this.patternBrushShader.uniforms.color.set3fv(this.eraseMode ? vec3.create([0, 0, 0]) : vec3.create([1, 1, 1]))
            this.patternBrushShader.uniforms.origin.set2fv(this.screenTransform.applyInverse(this.paintTo))
            this.patternBrushShader.uniforms.animate.set1i(animate ? 1 : 0)
            this.patternBrushShader.uniforms.scale.set2f(
                (this.brushBuffer.width / this.cellBuffer.width),
                (this.brushBuffer.height / this.cellBuffer.height))
            this.square.draw()
        })
    },
    paintParametricBrush: function (animate) {
        this.renderCells(function () {
            var pixelSpace = new Transform()
                .scale([this.viewportWidth, this.viewportHeight, 1.0])
                .multiply(this.screenTransform)
            var texelSize =
                pixelSpace.apply([0, 0, 0])[0] -
                pixelSpace.apply([-1.0 / this.cellBuffer.width, 0, 0])[0]
            this.parametricBrushShader.use()
            this.parametricBrushShader.attributes.position.bindBuffer(this.square)
            this.parametricBrushShader.uniforms.cells.bindTexture(this.cellBuffer, 0)
            this.parametricBrushShader.uniforms.rules.bindTexture(this.rulesBuffer, 1)
            this.parametricBrushShader.uniforms.swirlFactor.set1f(this.swirlFactor * 1.0)
            this.parametricBrushShader.uniforms.activeRules.set1f(this.activeRules * 1.0)
            this.parametricBrushShader.uniforms.rulesOffset.set1f(this.activeRules > 0 ? 0.0 : (this.currentRuleset / 4.0))
            this.parametricBrushShader.uniforms.brushPosition1.set2fv(this.screenTransform.applyInverse(this.paintFrom))
            this.parametricBrushShader.uniforms.brushPosition2.set2fv(this.screenTransform.applyInverse(this.paintTo))
            this.parametricBrushShader.uniforms.pixelSpace.setMatrix(pixelSpace)
            this.parametricBrushShader.uniforms.pixelOffset.set2f(0.0,
                animate ? (-(0.5 + this.scrollSpeed * !this.firstFrame) / this.cellBuffer.height) : 0.0)
            this.parametricBrushShader.uniforms.screenSpace.set2f(1.0 / this.cellBuffer.width, 1.0 / this.cellBuffer.height)
            this.parametricBrushShader.uniforms.brushSize.set1f(Math.max(brushSize, texelSize))
            this.parametricBrushShader.uniforms.seed.set2f(Math.random(), Math.random())
            this.parametricBrushShader.uniforms.noise.set1i(this.brushType == 'noise')
            this.parametricBrushShader.uniforms.fill.set1f(this.eraseMode ? 0.0 : 1.0)
            this.parametricBrushShader.uniforms.animate.set1i(animate ? 1 : 0)
            if (this.brushColor > 0.01) {
                this.parametricBrushShader.uniforms.hue.set1f(this.brushColor)
            }
            this.square.draw()
        })
    },
    updateBrushBuffer: function () {
        this.brushBuffer.draw(function () {
            this.copyBrushShader.use()
            this.copyBrushShader.attributes.position.bindBuffer(this.square)
            this.copyBrushShader.uniforms.source.bindTexture(this.cellBuffer, 0)
            this.copyBrushShader.uniforms.origin.set2fv(this.screenTransform.applyInverse(this.cloneStampPosition))
            this.copyBrushShader.uniforms.scale.set2f(
                this.brushBuffer.width / this.cellBuffer.width,
                this.brushBuffer.height / this.cellBuffer.height)
            this.square.draw()
            this.brushBufferReady = true;
        }, this)
    },
    draw: function () {
        this.gl.disable(this.gl.DEPTH_TEST)
        this.drawCellsShader.use()
        this.drawCellsShader.attributes.position.bindBuffer(this.square)
        this.drawCellsShader.uniforms.transform.setMatrix(this.screenTransform)
        this.drawCellsShader.uniforms.cells.bindTexture(this.cellBuffer, 0)
        this.square.draw()
    },
    noGL: function () {
        $('.no-webgl').modal('show')
    }
})

$(document).ready(function () {
    var life = new Life({
        canvas: $('.viewport').get(0)
    })

    var mouseDown = false;

    function MouseClick() {
        var s; //        
        var elements = document.elementsFromPoint(crosshairs.offsetLeft + (crosshairs.offsetWidth) / 2, crosshairs.offsetTop + (crosshairs.offsetHeight) / 2);
        try {
            if (elements[0].className == "viewport") {
                mouseX = crosshairs.offsetLeft + (crosshairs.offsetWidth) / 2;
                mouseY = crosshairs.offsetTop + (crosshairs.offsetHeight) / 2;
                const i = {
                    clientX: mouseX,
                    clientY: mouseY
                };
                that.onPaintStart(i);
                that.onPaintEnd();
                lastInputGpad = true;
                mouseX /= canvas.width;
                mouseY /= canvas.height;
            } else {
                elements[0].click();
                mouseState = 0;
            }
        } catch (e) {}
    }

    function MoveMouse(xm, ym) {
        try {
            mouseX = crosshairs.offsetLeft + (crosshairs.offsetWidth) / 2;
            mouseY = crosshairs.offsetTop + (crosshairs.offsetHeight) / 2;
            mouseX += xm;
            mouseY += ym;
            if (mouseX < 10)
                mouseX = 10;
            if (mouseY < 10)
                mouseY = 10;
            if (mouseX >= window.innerWidth - 10)
                mouseX = window.innerWidth - 10;
            if (mouseY >= window.innerHeight - 10)
                mouseY = window.innerHeight - 10;
            console.log('MoveTo: ', mouseX, mouseY);
            crosshairs.style.left = mouseX - crosshairs.offsetWidth / 2 + "px";
            crosshairs.style.top = mouseY - crosshairs.offsetHeight / 2 + "px";
            if (mouseDown) {
                const i = {
                    clientX: mouseX,
                    clientY: mouseY
                };
                that.shouldPaint = true;
                that.paintTo = that.eventPoint(i)
                that.onPaintEnd();
            }
        } catch (e) {}
    }

    function JoystickMoveTo(jy, jx) {
        crosshairs.hidden = false;
        if (Math.abs(jx) < .1 && Math.abs(jy) < .1) {
            try {
                if (gpad.getButton(14).value > 0) // dpad left
                    MoveMouse(-10, 0);
                if (gpad.getButton(12).value > 0) // dup
                    MoveMouse(0, -7);
                if (gpad.getButton(13).value > 0) // ddown
                    MoveMouse(0, 7);
                if (gpad.getButton(15).value > 0) // dright
                    MoveMouse(10, 0);
            } catch (e) {}
            return;
        }
        if (Math.abs(jx) < .1)
            jx = 0;
        if (Math.abs(jy) < .1)
            jy = 0;
        if (jx == 0 && jy == 0)
            return;
        MoveMouse(jx * 15, jy * 15);
    }

    function showPressedButton(index) {
        if (!splash.hidden) {
            splash.hidden = true;
            return;
        }
        console.log("Press: ", index);
        switch (index) {
            case 0: // A
            case 8:
            case 9:
                MouseClick();
                mouseDown = true;
                break;
            case 1: // B - fun animations
            case 2: // X
                Action(3);
                break;
            case 8:
            case 3: // Y
            case 9:
                Action(7);
                break;
            case 10: // XBox
                break;
            case 12: // dpad handled by timer elsewhere
            case 13:
            case 14:
            case 15:
                break;
            default:
        }
    }

    function removePressedButton(index) {
        console.log("Releasd: ", index);
        if (index == 0)
            mouseDown = false;
    }

    function moveJoystick(values, isLeft) {
        JoystickMoveTo(values[1], values[0]);
    }

    var gpad;

    function getAxes() {
        //       console.log('Axis', gpad.getAxis(0), gpad.getAxis(1), gpad.getButton(14).value);
        if (splash.hidden) {
            JoystickMoveTo(gpad.getAxis(1), gpad.getAxis(0));
            JoystickMoveTo(gpad.getAxis(3), gpad.getAxis(2));
        } else {
            splash.hidden = true;
        }
        setTimeout(function () {
            getAxes();
        }, 50);
    }

    gamepads.addEventListener('connect', e => {
        crosshairs.hidden = false;
        console.log('Gamepad connected:');
        console.log(e.gamepad);
        gpad = e.gamepad;
        e.gamepad.addEventListener('buttonpress', e => showPressedButton(e.index));
        e.gamepad.addEventListener('buttonrelease', e => removePressedButton(e.index));
        setTimeout(function () {
            getAxes();
        }, 50);
    });

    gamepads.addEventListener('disconnect', e => {
        console.log('Gamepad disconnected:');
        console.log(e.gamepad);
    });

    gamepads.start();
})
