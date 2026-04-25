(function(){
  'use strict';
  function attach(el){
    if(!el || el.__sp_drag_attached__) return;
    el.__sp_drag_attached__ = true;
    var isDown=false, startX=0, startScroll=0, moved=0;
    el.addEventListener('mousedown', function(e){
      if(e.target.closest('select,input,textarea,button,a,[role="button"]')) return;
      isDown=true; startX=e.pageX; startScroll=el.scrollLeft; moved=0;
      el.classList.add('is-dragging');
    });
    document.addEventListener('mouseup', function(){
      if(!isDown) return;
      isDown=false;
      el.classList.remove('is-dragging');
    });
    document.addEventListener('mousemove', function(e){
      if(!isDown) return;
      var dx = e.pageX - startX;
      moved = Math.abs(dx);
      if(moved > 2) el.scrollLeft = startScroll - dx;
    });
    el.addEventListener('click', function(e){
      if(moved > 5){ e.preventDefault(); e.stopPropagation(); moved = 0; }
    }, true);
    el.addEventListener('wheel', function(e){
      if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    }, {passive:false});
  }
  function initAll(){
    document.querySelectorAll('.sp-scope-filters, .sp-row4, [data-drag-scroll]').forEach(attach);
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initAll);
  } else { initAll(); }
  window.spInitDragScroll = initAll;
})();