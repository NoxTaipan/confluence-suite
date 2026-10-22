// Avisa cuando hay una version nueva de Confluence (consulta /api/update, que mira GitHub Releases).
(function () {
  var es = !/^en/i.test(navigator.language);
  fetch('/api/update').then(function (r) { return r.json(); }).then(function (u) {
    if (!u || !u.hasUpdate || !u.url) return;
    try { if (sessionStorage.getItem('confluence-update-dismissed') === u.latest) return; } catch (e) {}
    var bar = document.createElement('div');
    bar.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 12px;margin:0 0 8px;background:#1b2a4a;border:1px solid #3d63c9;border-radius:6px;font:500 12px "IBM Plex Sans","Segoe UI",sans-serif;color:#e8ecff';
    var txt = document.createElement('span');
    txt.style.flex = '1';
    txt.textContent = (es ? 'Nueva versión disponible: v' : 'New version available: v') + u.latest + ' (' + (es ? 'tienes v' : 'you have v') + u.current + ')';
    var a = document.createElement('a');
    a.href = u.url; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = es ? 'Descargar' : 'Download';
    a.style.cssText = 'color:#fff;background:#3d63c9;padding:3px 10px;border-radius:4px;text-decoration:none;font-weight:600';
    var x = document.createElement('button');
    x.textContent = '✕'; x.title = es ? 'Ocultar' : 'Dismiss';
    x.style.cssText = 'background:none;border:0;color:#9aa4d0;cursor:pointer;font-size:13px';
    x.onclick = function () { try { sessionStorage.setItem('confluence-update-dismissed', u.latest); } catch (e) {} bar.remove(); };
    bar.appendChild(txt); bar.appendChild(a); bar.appendChild(x);
    document.body.insertBefore(bar, document.body.firstChild);
  }).catch(function () {});
})();
