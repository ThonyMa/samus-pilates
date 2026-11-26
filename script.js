/* Samus Pilates — interações (sem dependências, sem backend) */
(function () {
  'use strict';
  var WA = '5547992179353';
  function wa(text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); }

  /* Links de WhatsApp com mensagem pronta */
  document.querySelectorAll('.js-wa').forEach(function (a) {
    var m = a.getAttribute('data-msg');
    var text = !m ? 'Olá! Vim pelo site e gostaria de mais informações sobre o pilates.'
      : m === 'experimental' ? 'Olá! Vim pelo site e gostaria de agendar uma aula experimental.'
      : /^plano/.test(m) ? 'Olá! Vim pelo site e gostaria de saber o valor do ' + m + '.'
      : 'Olá! Vim pelo site e gostaria de agendar uma aula experimental de ' + m + '.';
    a.href = wa(text);
  });

  /* Menu no celular */
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('nav-menu');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    toggle.querySelector('.sr').textContent = open ? 'Fechar menu' : 'Abrir menu';
  }
  toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); toggle.focus(); } });

  /* Formulário da aula experimental -> WhatsApp */
  var form = document.getElementById('exp-form');
  var err = document.getElementById('exp-error');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = form.nome.value.trim();
    if (!nome) { err.textContent = 'Informe seu nome para enviarmos o pedido.'; form.nome.focus(); return; }
    err.textContent = '';
    var lines = [
      'Olá! Vim pelo site e gostaria de agendar uma aula experimental.',
      '',
      'Nome: ' + nome,
      'Modalidade: ' + form.querySelector('input[name="modalidade"]:checked').value,
      'Melhor período: ' + form.querySelector('input[name="periodo"]:checked').value
    ];
    var obj = form.objetivo.value.trim();
    if (obj) lines.push('Objetivo: ' + obj);
    window.open(wa(lines.join('\n')), '_blank', 'noopener');
  });

  /* Aberto ou fechado agora (America/Sao_Paulo) */
  var WEEK = [[360, 660], [840, 1080], [1140, 1380]];
  var HOURS = { 0: [], 1: WEEK, 2: WEEK, 3: WEEK, 4: WEEK, 5: WEEK, 6: [[360, 720]] };
  var NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  function now() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { day: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday], mins: (+o.hour % 24) * 60 + (+o.minute), year: o.year };
  }
  function hhmm(m) { return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }
  function update() {
    var n = now(), el = document.getElementById('open-status'), t = el.querySelector('.status__text');
    document.querySelectorAll('.hours tr').forEach(function (tr) {
      tr.classList.toggle('is-today', tr.getAttribute('data-days').split(',').indexOf(String(n.day)) !== -1);
    });
    var today = HOURS[n.day];
    for (var i = 0; i < today.length; i++) {
      if (n.mins >= today[i][0] && n.mins < today[i][1]) { el.className = 'status is-open'; t.textContent = 'Aberto agora · até ' + hhmm(today[i][1]); return; }
    }
    el.className = 'status is-closed';
    for (var j = 0; j < today.length; j++) {
      if (n.mins < today[j][0]) { t.textContent = 'Fechado agora · abre hoje às ' + hhmm(today[j][0]); return; }
    }
    for (var d = 1; d <= 7; d++) {
      var k = (n.day + d) % 7;
      if (HOURS[k].length) {
        var when = d === 1 ? 'amanhã' : (k === 6 ? 'no sábado' : 'na ' + NAMES[k]);
        t.textContent = 'Fechado agora · abre ' + when + ' às ' + hhmm(HOURS[k][0][0]); return;
      }
    }
  }
  update(); setInterval(update, 60000);
  document.getElementById('year').textContent = now().year;
})();
