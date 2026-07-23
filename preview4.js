function(instance, properties) {

  var C = {
    equipier:     { main: '#3B82F6', bg: '#EFF6FF' },
    soustraitant: { main: '#7C3AED', bg: '#F5F3FF' },
    vehicule:     { main: '#10B981', bg: '#ECFDF5' },
    chantier:     { main: '#F59E0B', bg: '#FFFBEB' },
    transport:    { main: '#0EA5E9', bg: '#F0F9FF' },
    atelier:      { main: '#64748B', bg: '#F8FAFC' },
    bureau:       { main: '#0EA5E9', bg: '#F0F9FF' },
    absence:      { main: '#EF4444', bg: '#FEF2F2' },
  };

  var POSTE_COLORS = {
    'K2':          { main: '#8B5CF6', bg: '#F5F3FF' },
    'Finition K2': { main: '#EC4899', bg: '#FDF2F8' },
    'Fabrication': { main: '#64748B', bg: '#F8FAFC' },
  };

  // Équipiers présents dans plusieurs zones (pour badge ambre)
  var multiNames = { 'Brandon. FE': 2, 'M. Martin': 2 };

  var INDISPO_VEH = { 'Camion 3T': true, 'Fourgon 2': true };

  var SEP_COL = '1px solid #F1F5F9';
  var SEP_ROW = '1px solid #F1F5F9';

  var today = new Date();
  var days   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  var months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  var dateStr = days[today.getDay()] + ' ' + today.getDate() + ' ' + months[today.getMonth()] + ' ' + today.getFullYear();

  // ---- helpers ----
  function esc(v) { return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function multiSuffix(name) {
    return multiNames[name]
      ? '<sup style="display:inline-flex;align-items:center;justify-content:center;min-width:14px;height:14px;padding:0 3px;border-radius:7px;background:#F59E0B;color:#fff;font-size:9px;font-weight:800;line-height:1;vertical-align:super;margin-left:2px;box-sizing:border-box;">' + multiNames[name] + '</sup>'
      : '';
  }

  function tag(name, colorMain, colorBg, extraStyle) {
    var s = extraStyle || '';
    return '<span style="display:inline-flex;align-items:center;padding:2px 7px;margin:2px;border-radius:4px;font-size:11px;font-weight:500;white-space:normal;word-break:break-word;color:' + colorMain + ';background:' + colorBg + ';border:1px solid ' + colorMain + '22;cursor:grab;' + s + '">'
      + esc(name) + multiSuffix(name)
      + '<span style="margin-left:5px;opacity:0.5;font-size:10px;cursor:pointer;">×</span>'
      + '</span>';
  }

  function vehTag(name) {
    var indispo = INDISPO_VEH[name];
    return '<span style="display:inline-flex;align-items:center;padding:2px 7px;margin:2px;border-radius:4px;font-size:11px;font-weight:500;color:' + C.vehicule.main + ';background:' + C.vehicule.bg + ';border:1px solid ' + C.vehicule.main + '22;cursor:grab;' + (indispo ? 'opacity:0.45;text-decoration:line-through;' : '') + '">'
      + esc(name)
      + '<span style="margin-left:5px;opacity:0.5;font-size:10px;cursor:pointer;">×</span>'
      + '</span>';
  }

  function ph(text, color) {
    return '<span style="font-size:10px;color:' + color + '55;font-style:italic;">' + text + '</span>';
  }

  function dz(content, bg, borderRight) {
    return '<div style="padding:3px 4px;display:flex;flex-wrap:wrap;align-items:center;gap:2px;background:' + bg + '55;' + (borderRight !== false ? 'border-right:' + SEP_COL + ';' : '') + 'border-bottom:' + SEP_ROW + ';min-height:34px;">' + content + '</div>';
  }

  function comment(text) {
    return '<div style="padding:4px 6px;display:flex;align-items:center;font-size:10px;color:#64748B;font-style:italic;border-bottom:' + SEP_ROW + ';min-height:34px;word-break:break-word;">'
      + (text ? esc(text) : '<span style="color:#CBD5E1;">—</span>')
      + '</div>';
  }

  function deleteCell() {
    return '<div style="width:20px;min-width:20px;display:flex;align-items:center;justify-content:center;border-bottom:' + SEP_ROW + ';min-height:34px;">'
      + '<span style="font-size:14px;color:#CBD5E1;cursor:pointer;line-height:1;">×</span>'
      + '</div>';
  }

  function colHd(label, color) {
    return '<div style="padding:5px 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;color:' + color + ';border-right:' + SEP_COL + ';border-bottom:2px solid #E2E8F0;background:#F8FAFC;text-align:center;">' + label + '</div>';
  }

  function addBtn() {
    return '<div style="padding:5px 10px;font-size:10px;color:#94A3B8;cursor:pointer;display:flex;align-items:center;gap:5px;border-top:1px dashed #E2E8F0;">'
      + '<span style="width:16px;height:16px;border-radius:50%;background:#E2E8F0;display:inline-flex;align-items:center;justify-content:center;font-size:12px;color:#64748B;">+</span>'
      + 'Ajouter une ligne</div>';
  }

  function sectionHd(label, color, bg, count) {
    var svgCopy = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    var countBadge = count !== undefined
      ? '<span style="font-size:11px;font-weight:700;background:' + color + '22;color:' + color + ';border-radius:10px;padding:1px 8px;">' + count + '</span>'
      : '';
    return '<div style="padding:8px 12px;background:' + bg + ';border-bottom:1px solid #E2E8F0;font-size:13px;font-weight:800;color:' + color + ';display:flex;align-items:center;gap:6px;">'
      + label + countBadge
      + '<span style="margin-left:auto;width:22px;height:22px;display:flex;align-items:center;justify-content:center;border-radius:4px;background:' + color + '22;color:' + color + ';cursor:pointer;flex-shrink:0;">' + svgCopy + '</span>'
      + '</div>';
  }

  // ---- ZONE CHANTIER ----
  var chRows = [
    { ch: ['Mr Martin BOUYGUES'],                   eq: ['Brandon. FE', 'Thomas. FE'], veh: ['3 - Luis. A'],  com: '' },
    { ch: ['Tatarnikov – Tatarnikov'],               eq: ['Belgacem. SD', 'Brandon. FE', 'S. AZADEH Archi&Co'], veh: ['4 - LORENC'], com: 'abcde' },
    { ch: ['Francial Finance'],                      eq: ['Saïd. MO', 'Stephane A. AU', 'Stephane. AB'], veh: ['5 -'],    com: '' },
    { ch: ['SCI Bon Puits – Villa Bon Puits'],       eq: ['Brandon. FE', 'Mickael.o. OR'], veh: ['6 - MONTANELI'], com: '' },
    { ch: ['Scp Le Sablier – Maison Le sablier'],    eq: ['Rdt. HC', 'Tech. NO'],        veh: ['7 - RAMBAUD'], com: '' },
    { ch: ['GCPM PURIC – Pool house Baron'],         eq: ['Marc. RA', 'Corentin. LO'],   veh: ['12 - SDIRI'], com: '' },
  ];
  var chGTC = '2fr 1.5fr 1fr 80px 20px';

  function buildChantier() {
    var hdRow = '<div style="display:grid;grid-template-columns:' + chGTC + ';">'
      + colHd('🏗 Chantiers associés', C.chantier.main)
      + colHd('👤 Équipe', C.equipier.main)
      + colHd('🚛 Véhicule', C.vehicule.main)
      + colHd('💬', '#94A3B8')
      + '<div style="border-bottom:2px solid #E2E8F0;background:#F8FAFC;"></div>'
      + '</div>';
    var rows = chRows.map(function(r) {
      var chTags = r.ch.map(function(n) { return tag(n, C.chantier.main, C.chantier.bg); }).join('') || ph('Chantiers', C.chantier.main);
      var eqTags = r.eq.map(function(n) { return tag(n, C.equipier.main, C.equipier.bg); }).join('') || ph('Équipier', C.equipier.main);
      var vTags  = r.veh.map(function(n) { return vehTag(n); }).join('') || ph('Véhicule', C.vehicule.main);
      return '<div style="display:grid;grid-template-columns:' + chGTC + ';">'
        + dz(chTags, C.chantier.bg)
        + dz(eqTags, C.equipier.bg)
        + dz(vTags,  C.vehicule.bg)
        + comment(r.com)
        + deleteCell()
        + '</div>';
    }).join('');
    return '<div style="flex:1;min-width:0;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;background:#FFF;display:flex;flex-direction:column;">'
      + sectionHd('🏗 Chantier', C.chantier.main, C.chantier.bg, chRows.length)
      + hdRow + rows + addBtn()
      + '</div>';
  }

  // ---- ZONE TRANSPORT ----
  var trRows = [
    { ch: ['GCPM PURIC – Pool house Baron'], eq: ['N. Adeline', 'Elim CO'], veh: 'Camion 3T', com: '' },
    { ch: ['Sodobat – Groupe scolaire'],     eq: ['R. Petit'],              veh: 'Fourgon 2',  com: 'Retour 17h' },
    { ch: [],                                eq: [],                         veh: '',           com: '' },
  ];
  var trGTC = '2fr 1.5fr 1fr 80px 20px';

  function buildTransport() {
    var hdRow = '<div style="display:grid;grid-template-columns:' + trGTC + ';">'
      + colHd('🏗 Chantiers associés', C.chantier.main)
      + colHd('👤 Équipe', C.equipier.main)
      + colHd('🚛 Véhicule', C.vehicule.main)
      + colHd('💬', '#94A3B8')
      + '<div style="border-bottom:2px solid #E2E8F0;background:#F8FAFC;"></div>'
      + '</div>';
    var rows = trRows.map(function(r) {
      var chTags = r.ch.map(function(n) { return tag(n, C.chantier.main, C.chantier.bg); }).join('') || ph('Chantiers', C.chantier.main);
      var eqTags = r.eq.map(function(n) { return tag(n, C.equipier.main, C.equipier.bg); }).join('') || ph('Équipier', C.equipier.main);
      var vTag   = r.veh ? vehTag(r.veh) : ph('Véhicule', C.vehicule.main);
      return '<div style="display:grid;grid-template-columns:' + trGTC + ';">'
        + dz(chTags, C.chantier.bg) + dz(eqTags, C.equipier.bg) + dz(vTag, C.vehicule.bg) + comment(r.com) + deleteCell()
        + '</div>';
    }).join('');
    return '<div style="flex:1;min-width:0;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;background:#FFF;display:flex;flex-direction:column;">'
      + sectionHd('🚚 Transport', C.transport.main, C.transport.bg)
      + hdRow + rows + addBtn()
      + '</div>';
  }

  // ---- ZONE ATELIER ----
  var atRows = [
    { poste: 'K2',          ch: ['BB_SO.FO.VAR DRAGUIGNAN'],  eq: ['N. Adeline'],   com: '' },
    { poste: 'K2',          ch: ['JDGA St TROPEZ'],           eq: ['M. Martin'],    com: 'Matinée seulement' },
    { poste: 'Finition K2', ch: ['Sodobat – Groupe scolaire'],eq: ['Stéphane D.'],  com: '' },
    { poste: 'Fabrication', ch: ['Maison Bois Littoral'],     eq: ['Chalidu R.'],   com: '' },
    { poste: 'Fabrication', ch: [],                           eq: [],               com: '' },
  ];
  var atGTC = '110px 2fr 1.5fr 80px 20px';

  function buildAtelier() {
    var hdRow = '<div style="display:grid;grid-template-columns:' + atGTC + ';">'
      + colHd('Poste', '#64748B')
      + colHd('🏗 Chantiers associés', C.chantier.main)
      + colHd('👤 Équipe', C.equipier.main)
      + colHd('💬', '#94A3B8')
      + '<div style="border-bottom:2px solid #E2E8F0;background:#F8FAFC;"></div>'
      + '</div>';
    var rows = atRows.map(function(r) {
      var pc    = POSTE_COLORS[r.poste] || { main: '#64748B', bg: '#F8FAFC' };
      var chTags = r.ch.map(function(n) { return tag(n, C.chantier.main, C.chantier.bg); }).join('') || ph('Chantiers', C.chantier.main);
      var eqTags = r.eq.map(function(n) { return tag(n, C.equipier.main, C.equipier.bg); }).join('') || ph('Équipier', C.equipier.main);
      var posteCell = '<div style="padding:3px 6px;display:flex;align-items:center;border-right:' + SEP_COL + ';border-bottom:' + SEP_ROW + ';background:' + pc.bg + '55;min-height:34px;">'
        + '<span style="font-size:11px;font-weight:700;color:' + pc.main + ';padding:2px 8px;background:' + pc.bg + ';border-radius:4px;border:1px solid ' + pc.main + '33;">' + esc(r.poste || '—') + '</span>'
        + '</div>';
      return '<div style="display:grid;grid-template-columns:' + atGTC + ';">'
        + posteCell + dz(chTags, C.chantier.bg) + dz(eqTags, C.equipier.bg) + comment(r.com) + deleteCell()
        + '</div>';
    }).join('');
    return '<div style="flex:1;min-width:0;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;background:#FFF;display:flex;flex-direction:column;">'
      + sectionHd('🔧 Atelier', C.atelier.main, C.atelier.bg)
      + hdRow + rows + addBtn()
      + '</div>';
  }

  // ---- ZONE BUREAU ----
  var buRows = [
    { eq: ['D. Laurent'], com: '' },
    { eq: ['V. Simon'],   com: 'Réunion 14h' },
  ];
  var buGTC = '1fr 80px 20px';

  function buildBureau() {
    var hdRow = '<div style="display:grid;grid-template-columns:' + buGTC + ';">'
      + colHd('👤 Équipe', C.equipier.main)
      + colHd('💬', '#94A3B8')
      + '<div style="border-bottom:2px solid #E2E8F0;background:#F8FAFC;"></div>'
      + '</div>';
    var rows = buRows.map(function(r) {
      var eqTags = r.eq.map(function(n) { return tag(n, C.equipier.main, C.equipier.bg); }).join('') || ph('Équipier', C.equipier.main);
      return '<div style="display:grid;grid-template-columns:' + buGTC + ';">'
        + dz(eqTags, C.equipier.bg) + comment(r.com) + deleteCell()
        + '</div>';
    }).join('');
    return '<div style="border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;background:#FFF;display:flex;flex-direction:column;">'
      + sectionHd('🏢 Bureau', C.bureau.main, C.bureau.bg)
      + hdRow + rows + addBtn()
      + '</div>';
  }

  // ---- ZONE ABSENCES ----
  var absences = [
    { motif: 'Congés',           names: ['K. Bensaid', 'T. Moreau'] },
    { motif: 'Formation',        names: ['H. Lemoine'] },
    { motif: 'Arrêt de travail', names: ['C. Fabre'] },
    { motif: 'Visite médicale',  names: ['N. Roux'] },
    { motif: 'Autre',            names: [] },
  ];

  function buildAbsences() {
    var cols = absences.map(function(a) {
      var tags = a.names.length
        ? a.names.map(function(n) { return tag(n, C.absence.main, C.absence.bg); }).join('')
        : ph('—', C.absence.main);
      return '<div style="flex:1;min-width:100px;display:flex;flex-direction:column;border-right:1px solid #E2E8F0;">'
        + '<div style="padding:5px 8px;font-size:10px;font-weight:700;color:' + C.absence.main + ';background:#FEF2F2;border-bottom:1px solid #E2E8F0;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(a.motif) + '</div>'
        + '<div style="padding:5px 6px;display:flex;flex-wrap:wrap;gap:2px;min-height:32px;">' + tags + '</div>'
        + '</div>';
    }).join('');
    return '<div style="border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;background:#FFF;">'
      + '<div style="padding:8px 12px;background:' + C.absence.bg + ';border-bottom:1px solid #E2E8F0;font-size:13px;font-weight:800;color:' + C.absence.main + ';">🚫 Absences / Indisponibilités</div>'
      + '<div style="display:flex;overflow-x:auto;">' + cols + '</div>'
      + '</div>';
  }

  // ---- POOLS ----
  function poolCard(label, color, bg, items, typeTag) {
    var tagsHtml = items.map(function(item) {
      var indispo = typeTag === 'veh' && INDISPO_VEH[item];
      return '<span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500;cursor:grab;color:' + color + ';background:' + bg + ';border:1px solid ' + color + '22;margin:2px;' + (indispo ? 'opacity:0.45;text-decoration:line-through;' : '') + '">' + esc(item) + '</span>';
    }).join('');
    var count = '<span style="margin-left:auto;font-size:10px;font-weight:700;color:' + color + ';background:' + color + '22;padding:1px 6px;border-radius:10px;">' + items.length + '</span>';
    var chevron = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>';
    return '<div style="border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;background:#FFF;display:flex;flex-direction:column;">'
      + '<div style="padding:6px 10px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;font-size:11px;font-weight:700;color:' + color + ';display:flex;align-items:center;gap:4px;cursor:pointer;">'
      + label + count + chevron + '</div>'
      + '<div style="padding:6px 8px;display:flex;flex-wrap:wrap;gap:2px;align-content:flex-start;">' + tagsHtml + '</div>'
      + '</div>';
  }

  var POOL_W = '200px';

  var poolEquipiers     = ['A. Bernard', 'F. Blanc', 'C. Michel', 'Paul. DU'];
  var poolSoustraitants = ['Terras Co', 'Elec Pro', 'Plomb Express', 'Peinture+'];
  var poolVehicules     = ['Camion 3T','Fourgon 2','Berlingo 1','Berlingo 2','Pickup 1','Nacelle','Remorque 1'];
  var poolChantierCh    = ['Vecchini Bois – test', 'Mme Gilet Sandrine'];
  var poolChantierTr    = ['Scp Le Sablier'];
  var poolChantierK2    = ['Palaia – Carport'];
  var poolChantierFin   = ['Maison Bois Littoral'];
  var poolChantierFab   = ['JDGA St TROPEZ', 'BB_SO.FO.VAR'];

  function rightPool(items) {
    return '<div style="width:' + POOL_W + ';min-width:' + POOL_W + ';flex-shrink:0;display:flex;flex-direction:column;gap:8px;">' + items + '</div>';
  }

  // ---- TOPBAR ----
  var svgCopy = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  var svgDown = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
  var svgPrint = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>';
  function iconBtn(svg) {
    return '<div style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;border-radius:5px;background:#F1F5F9;color:#64748B;cursor:pointer;">' + svg + '</div>';
  }

  var topbar = '<div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:8px;padding:8px 16px;display:flex;align-items:center;justify-content:center;gap:10px;position:relative;">'
    + '<div style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;border-radius:5px;background:#F1F5F9;color:#64748B;font-size:14px;font-weight:700;cursor:pointer;">‹</div>'
    + '<span style="font-size:14px;font-weight:700;color:#1E293B;">' + dateStr + '</span>'
    + '<div style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;border-radius:5px;background:#F1F5F9;color:#64748B;font-size:14px;font-weight:700;cursor:pointer;">›</div>'
    + '<div style="position:absolute;right:12px;display:flex;gap:6px;">' + iconBtn(svgCopy) + iconBtn(svgDown) + iconBtn(svgPrint) + '</div>'
    + '</div>';

  // ---- LAYOUT ----
  var html = '<div style="display:flex;flex-direction:column;gap:8px;padding:12px;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif;background:#F1F5F9;min-height:100%;box-sizing:border-box;">'

    + topbar

    // Chantier + pool
    + '<div style="display:flex;gap:8px;align-items:flex-start;">'
    + buildChantier()
    + rightPool(
        poolCard('👤 Équipiers',     C.equipier.main,     C.equipier.bg,     poolEquipiers,     'eq')
      + poolCard('🤝 Sous-traitants', C.soustraitant.main, C.soustraitant.bg, poolSoustraitants, 'stt')
      + poolCard('🚛 Véhicules',      C.vehicule.main,     C.vehicule.bg,     poolVehicules,     'veh')
      + poolCard('🏗 Chantiers',      C.chantier.main,     C.chantier.bg,     poolChantierCh,    'ch')
    )
    + '</div>'

    // Transport + pool
    + '<div style="display:flex;gap:8px;align-items:flex-start;">'
    + buildTransport()
    + rightPool(poolCard('🏗 Chantiers transport', C.transport.main, C.transport.bg, poolChantierTr, 'ch'))
    + '</div>'

    // Atelier + pools
    + '<div style="display:flex;gap:8px;align-items:flex-start;">'
    + buildAtelier()
    + rightPool(
        poolCard('K2',          POSTE_COLORS['K2'].main,          POSTE_COLORS['K2'].bg,          poolChantierK2,  'ch')
      + poolCard('Finition K2', POSTE_COLORS['Finition K2'].main, POSTE_COLORS['Finition K2'].bg, poolChantierFin, 'ch')
      + poolCard('Fabrication', POSTE_COLORS['Fabrication'].main, POSTE_COLORS['Fabrication'].bg, poolChantierFab, 'ch')
    )
    + '</div>'

    // Bureau + Absences pleine largeur
    + buildBureau()
    + buildAbsences()

    + '</div>';

  $(instance.canvas).empty().append(html);
}