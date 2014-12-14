var CGP = (function() {
    'use strict';

    var mouse_move = function(e) {
        if (this.rrdgraph.mousedown) {
            var factor = (this.rrdgraph.end - this.rrdgraph.start) / this.rrdgraph.xsize;
            var x = e.pageX - this.offsetLeft;
            var diff = x - this.rrdgraph.mousex;
            var difffactor = Math.abs(Math.round(diff * factor));
            if (diff > 0) {
                this.rrdgraph.end -= difffactor;
                this.rrdgraph.start -= difffactor;
            } else {
                this.rrdgraph.end += difffactor;
                this.rrdgraph.start += difffactor;
            }
            this.rrdgraph.mousex = x;
            try {
                this.rrdgraph.graph_paint();
            } catch (ex) {
                console.error('mouse_move:', ex, ex.stack);
            }
        }
    };
    var mouse_up = function(e) {
        this.rrdgraph.mousedown = false;
        this.style.cursor = 'default';
    };
    var mouse_down = function(e) {
        var x = e.pageX - this.offsetLeft;
        this.rrdgraph.mousedown = true;
        this.rrdgraph.mousex = x;
        this.style.cursor = 'move';
    };
    var mouse_scroll = function(e) {
        e = e ? e : window.event;
        var wheel = e.detail ? e.detail * -1 : e.wheelDelta / 40;
        var cstime = this.stime[this.stidx];
        if (wheel < 0) {
            this.stidx++;
            if (this.stidx >= this.stlen) this.stidx = this.stlen - 1;
        } else {
            this.stidx--;
            if (this.stidx < 0) this.stidx = 0;
        }
        if (cstime !== this.stime[this.stidx]) {
            var posx = e.clientX - e.target.getBoundingClientRect().left - this.rrdgraph.xorigin;
            var relx = this.rrdgraph.xsize / Math.min(Math.max(posx, 0), this.rrdgraph.xsize);
            var cntr = this.rrdgraph.start + Math.abs(Math.round((this.rrdgraph.end - this.rrdgraph.start) / relx));
            this.rrdgraph.start = Math.round(cntr - this.stime[this.stidx] / relx);
            this.rrdgraph.end = this.rrdgraph.start + this.stime[this.stidx];

            try {
                this.rrdgraph.graph_paint();
            } catch (ex) {
                console.error('mouse_scroll:', ex, ex.stack);
            }
        }

        if (e.stopPropagation)
            e.stopPropagation();
        if (e.preventDefault)
            e.preventDefault();
        e.cancelBubble = true;
        e.cancel = true;
        e.returnValue = false;
        return false;
    };

    function prepare_draw(id) {
        RrdGraph.prototype.mousex = 0;
        RrdGraph.prototype.mousedown = false;

        var cmdline = document.getElementById(id).textContent;
        var gfx = new RrdGfxCanvas(id);
        var fetch = new RrdDataFile();
        var rrdcmdline = null;

        try {
            rrdcmdline = new RrdCmdLine(gfx, fetch, cmdline);
        } catch (e) {
            console.error('prepare_draw:', e, e.stack);
        }

        var rrdgraph = rrdcmdline.graph;

        gfx.canvas.stime = [300, 600, 900, 1200, 1800, 3600, 7200, 21600, 43200, 86400, 172800, 604800, 2592000, 5184000, 15768000, 31536000];
        gfx.canvas.stlen = gfx.canvas.stime.length;
        gfx.canvas.stidx = 0;

        gfx.canvas.rrdgraph = rrdgraph;
        gfx.canvas.removeEventListener('mousemove', mouse_move, false);
        gfx.canvas.addEventListener('mousemove', mouse_move, false);
        gfx.canvas.removeEventListener('mouseup', mouse_up, false);
        gfx.canvas.addEventListener('mouseup', mouse_up, false);
        gfx.canvas.removeEventListener('mousedown', mouse_down, false);
        gfx.canvas.addEventListener('mousedown', mouse_down, false);
        gfx.canvas.removeEventListener('mouseout', mouse_up, false);
        gfx.canvas.addEventListener('mouseout', mouse_up, false);
        gfx.canvas.removeEventListener('DOMMouseScroll', mouse_scroll, false);
        gfx.canvas.addEventListener('DOMMouseScroll', mouse_scroll, false);
        gfx.canvas.removeEventListener('mousewheel', mouse_scroll, false);
        gfx.canvas.addEventListener('mousewheel', mouse_scroll, false);

        var diff = rrdgraph.end - rrdgraph.start;
        for (var i = 0; i < gfx.canvas.stlen; i++) {
            if (gfx.canvas.stime[i] >= diff) break;
        }
        if (i === gfx.canvas.stlen) gfx.canvas.stidx = gfx.canvas.stlen - 1;
        else gfx.canvas.stidx = i;

        return rrdgraph;
    }

    function draw(id, async) {
        var rrdgraph = prepare_draw(id);
        try {
            if (async) {
                rrdgraph.graph_paint_async();
            } else {
                rrdgraph.graph_paint();
            }
        } catch (e) {
            console.error('draw(' + id + '):', e, e.stack);
        }
    }

    /**
     * For each canvas.rrd element, initialize a draggable graph.
     */
    function drawAll(async) {
        var canvases = document.getElementsByClassName('rrd');
        for (var i = 0; i < canvases.length; i++) {
            draw(canvases[i].id, async);
        }
    }

    return {
        drawAll: drawAll
    };
}());
