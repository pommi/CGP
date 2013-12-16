function draw(id) {
        var rrdgraph = prepare_draw(id);

        try {
                rrdgraph.graph_paint();
        } catch (e) {
                alert(e+"\n"+e.stack);
        }
}

function drawAll()
{
        var list=[];
        var a=document.getElementsByClassName('rrd');
        for (var i=0,l=a.length;i<l;i++)
        {
                draw(a[i].getAttribute('id'))
        }
}

window.onload = drawAll()
