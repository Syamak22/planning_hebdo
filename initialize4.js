function(instance, context) {

  // ============================================================
  // CONSTANTES
  // ============================================================
  // ============================================================
  // EMOJIS — modifier ici pour changer tous les emojis du plugin
  // ============================================================
  var EMOJIS = {
    chantier:     '🏗',
    transport:    '🚚',
    atelier:      '🔧',
    bureau:       '🏢',
    absence:      '🚫',
    equipier:     '👷🏻‍♂️',
    vehicule:     '🏎️',
    soustraitant: '🤝',
    commentaire:  '💬',
    conducteur:   '👨🏼‍✈️',
    // Affichage (display mode) — emojis plus expressifs
    eq_dv:        '👷🏻‍♂️',
    stt_dv:       '🤝',
    veh_dv:       '🏎️',
  };

  var LABELS = {
    zones: {
      chantier:  EMOJIS.chantier  + ' Chantier',
      transport: EMOJIS.transport + ' Transport',
      atelier:   EMOJIS.atelier   + ' Atelier',
      bureau:    EMOJIS.bureau    + ' Bureau',
      absence:   EMOJIS.absence   + ' Absences',
    },
    cols: {
      chantiers:   EMOJIS.chantier     + ' Chantiers associés',
      equipier:    EMOJIS.equipier     + ' Équipe',
      vehicule:    EMOJIS.vehicule     + ' Véhicule',
      commentaire: EMOJIS.commentaire,
      poste:       'Poste',
    },
    pools: {
      equipiers:    EMOJIS.equipier     + ' Équipiers',
      soustraitants:EMOJIS.soustraitant + ' Sous-traitants',
      vehicules:    EMOJIS.vehicule     + ' Véhicules',
      chantier:     EMOJIS.chantier     + ' Chantier',
    },
    // Alias vers EMOJIS pour le display mode
    emojis: {
      equipier:     EMOJIS.eq_dv,
      soustraitant: EMOJIS.stt_dv,
      vehicule:     EMOJIS.veh_dv,
    },
    addLine:             'Ajouter une ligne',
    copyZone:            'Copier la veille pour cette zone',
    copyGlobal:          'Copier la veille',
    print:               'Imprimer',
    today:               'Aujourd\'hui',
    noChantier:          'Chantiers',
    noEquipier:          'Équipier',
    noVehicule:          'Véhicule',
    commentPlaceholder:  'Commentaire...',
  };

  // ============================================================
  // TEXTES DUPLIQUER — modifier ici pour changer les libellés
  // ============================================================
  var COPY_TEXTS = {
    // Titre du popover de confirmation
    title:    'Dupliquer le planning ?',
    // Corps du message — {date} sera remplacé par la date choisie
    body:     'Voulez-vous copier le planning du {date} sur la date en cours ?',
    // Bouton de confirmation
    ok:       'Dupliquer',
    // Bouton d\'annulation
    cancel:   'Annuler',
  };

  // Pas de ligne fantôme — les lignes viennent du clic ou de la DB
  var MIN_ROWS = { chantier: 0, transport: 0, atelier: 0, bureau: 0 };

  // ============================================================
  // SÉPARATEURS — modifier ici pour ajuster le style des grilles
  // ============================================================
  var SEP = {
    // Séparateur entre les lignes (horizontal)
    row:    { width: '1px', style: 'solid', color: '#E2E8F0' },
    // Séparateur entre les colonnes (vertical)
    col:    { width: '1px', style: 'solid', color: '#E2E8F0' },
  };
  // Raccourcis css générés à partir de SEP
  var SEP_ROW = SEP.row.width + ' ' + SEP.row.style + ' ' + SEP.row.color;
  var SEP_COL = SEP.col.width + ' ' + SEP.col.style + ' ' + SEP.col.color;

  // ============================================================
  // LAYOUT — largeurs des colonnes
  // pool_pct : largeur du panneau pool en % de la largeur totale
  // La zone prend le reste automatiquement (flex:1)
  // ============================================================
  var LAYOUT = {
    pool_pct: 25,   // ex: 20 → pool = 20%, zone = ~80%
  };

  // Mapping pool → zone cible autorisée pour le drag de chantiers
  function getChantierPoolToZone() {
    var transportSet = {};
    (instance.data.atelierTransportTypes || []).forEach(function(t) { transportSet[t] = true; });
    var map = { chantier: 'chantier' };
    (instance.data.atelierTypes || []).forEach(function(t) {
      map[t] = transportSet[t] ? 'transport' : 'atelier';
    });
    return map;
  }

  var POOL_W = LAYOUT.pool_pct + '%';

  // ============================================================
  // COULEURS
  // ============================================================
  var C = {
    equipier:     { main: '#3B82F6', bg: '#EFF6FF' },
    vehicule:     { main: '#10B981', bg: '#ECFDF5' },
    chantier:     { main: '#F59E0B', bg: '#FFFBEB' },
    soustraitant: { main: '#3a0bf5', bg: '#edebff' },
    transport:    { main: '#0EA5E9', bg: '#F0F9FF' },
    k2:           { main: '#8B5CF6', bg: '#F5F3FF' },
    finition:     { main: '#EC4899', bg: '#FDF2F8' },
    atelier:      { main: '#64748B', bg: '#F8FAFC' },
    bureau:       { main: '#0EA5E9', bg: '#F0F9FF' },
    absence:      { main: '#EF4444', bg: '#FEF2F2' },
  };

  // ============================================================
  // LARGEURS DE COLONNES
  // ============================================================
  var COL_W = {
    commentaire: '250px',
    poste:       '100px',
    chantiers:   2,
    equipier:    1,
    vehicule:    1,
  };

  var POSTE_COLORS = {
    'K2':          C.k2,
    'Finition K2': C.finition,
    'Fabrication': C.atelier,
  };

  // ============================================================
  // INSTANCE ID + CSS
  // ============================================================
  var instanceId = (Math.random() * Math.pow(2, 54)).toString(36);
  instance.data.instanceName = 'planningHebdo-' + instanceId;
  var ID = instance.data.instanceName;

  var styleEl = document.createElement('style');
  styleEl.textContent = [
    '.' + ID + ' { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; width:100%; height:100%; overflow:hidden; }',
    '.' + ID + ' * { box-sizing:border-box; }',
    '.' + ID + ' .ph-wrap { display:flex; flex-direction:column; gap:8px; padding:12px; background:#F1F5F9; height:100%; overflow-y:auto; min-height:0; }',
    '.' + ID + ' .ph-wrap > * { flex-shrink:0; }',
    '.' + ID + ' .ph-tag { display:inline-flex; align-items:center; padding:2px 7px; margin:2px; border-radius:4px; font-size:11px; font-weight:500; white-space:normal; word-break:break-word; cursor:grab; user-select:none; gap:4px; transition:opacity 0.15s; position:relative; }',
    '.' + ID + ' .ph-tag.dragging { opacity:0.35; }',
    '.' + ID + ' .ph-tag.ph-dup { cursor:copy; }',
    '.' + ID + ' .ph-dup-badge { position:absolute; top:-5px; right:-5px; min-width:14px; height:14px; padding:0 3px; border-radius:7px; background:#F59E0B; color:#fff; font-size:9px; font-weight:800; line-height:14px; text-align:center; pointer-events:none; animation:ph-blink-' + instanceId + ' 1.2s ease-in-out infinite; z-index:1; }',
    '@keyframes ph-blink-' + instanceId + ' { 0%,100% { opacity:1; } 50% { opacity:0.25; } }',
    '.' + ID + ' .ph-tag-rm { display:inline-flex; align-items:center; justify-content:center; width:12px; height:12px; border-radius:50%; background:rgba(0,0,0,0.12); font-size:9px; line-height:1; cursor:pointer; flex-shrink:0; }',
    '.' + ID + ' .ph-tag-rm:hover { background:rgba(0,0,0,0.28); }',
    '.' + ID + ' .ph-tag-com { display:inline-flex; align-items:center; font-size:10px; opacity:0.75; flex-shrink:0; cursor:default; }',
    '#ph-tooltip { position:fixed; background:#1E293B; color:#F8FAFC; font-size:11px; font-weight:400; line-height:1.4; white-space:normal; word-break:normal; width:220px; padding:6px 9px; border-radius:6px; box-shadow:0 4px 12px rgba(0,0,0,0.25); pointer-events:none; z-index:99999; display:none; }',
    '.' + ID + ' .ph-drop { min-height:26px; padding:3px 4px; display:flex; flex-wrap:wrap; align-items:center; gap:2px; border-radius:0; margin:0; transition:outline 0.1s,background 0.1s; border-bottom:' + SEP_ROW + '; }',
    '.' + ID + ' .ph-drop.dv-ok  { outline:2px dashed var(--dv-color,#3B82F6); outline-offset:-2px; background:rgba(59,130,246,0.06); }',
    '.' + ID + ' .ph-pool-drop { transition:outline 0.1s,background 0.1s; min-height:60px; }',
    '.' + ID + ' .ph-pool-drop.dv-ok { outline:2px dashed var(--dv-color,#10B981); outline-offset:-2px; background:rgba(16,185,129,0.06); border-radius:4px; }',
    '.' + ID + ' .ph-loader { display:flex; align-items:center; justify-content:center; height:100%; width:100%; background:#F1F5F9; }',
    '.' + ID + ' .ph-loader-box { display:flex; flex-direction:column; align-items:center; gap:14px; width:260px; }',
    '.' + ID + ' .ph-loader-label { font-size:12px; font-weight:600; color:#475569; letter-spacing:0.02em; }',
    '.' + ID + ' .ph-loader-track { width:100%; height:8px; background:#E2E8F0; border-radius:5px; overflow:hidden; }',
    '.' + ID + ' .ph-loader-fill { height:100%; background:#1E293B; border-radius:5px; transition:width 0.4s ease-out; width:0%; }',
    '.' + ID + ' .ph-loader-pct { font-size:11px; font-weight:700; color:#1E293B; letter-spacing:0.04em; }',
    '.' + ID + ' .ph-loader-box.ph-loader-done .ph-loader-fill { background:#10B981; }',
    '@keyframes ph-shimmer-' + instanceId + ' { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }',
    '.' + ID + ' .ph-skeleton-zone { background:#fff; border:1px solid #E2E8F0; border-left:4px solid #E2E8F0; border-radius:8px; overflow:hidden; flex:1; min-width:0; }',
    '.' + ID + ' .ph-skeleton-bar { height:14px; border-radius:4px; background:linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%); background-size:400px 100%; animation:ph-shimmer-' + instanceId + ' 1.4s ease-in-out infinite; }',
    '.' + ID + ' .ph-skeleton-row { display:flex; gap:12px; align-items:center; padding:10px 12px; border-bottom:1px solid #F1F5F9; }',
    '.' + ID + ' .ph-skeleton-header { padding:10px 12px; border-bottom:1px solid #E2E8F0; background:#F8FAFC; }',
    '.' + ID + ' .ph-comment { padding:4px 6px; display:flex; align-items:center; gap:4px; font-size:10px; color:#64748B; font-style:italic; border-bottom:' + SEP_ROW + '; cursor:pointer; word-break:break-word; overflow-wrap:break-word; position:relative; }',
    '.' + ID + ' .ph-comment span { white-space:pre-wrap; word-break:break-word; overflow-wrap:break-word; flex:1; }',
    '.' + ID + ' .ph-comment:hover { background:#F8FAFC; }',
    '.' + ID + ' .ph-row-delete-cell { width:20px; min-width:20px; flex-shrink:0; display:flex; align-items:center; justify-content:center; border-bottom:' + SEP_ROW + '; position:relative; }',
    '.' + ID + ' .ph-row-delete { display:flex; width:16px; height:16px; align-items:center; justify-content:center; border-radius:3px; color:#CBD5E1; cursor:pointer; font-size:14px; line-height:1; }',
    '.' + ID + ' .ph-row-delete:hover { background:#FEF2F2; color:#EF4444; }',
    '.' + ID + ' .ph-del-confirm { position:absolute; right:24px; top:50%; transform:translateY(-50%); display:flex; align-items:center; gap:6px; background:#fff; border:1px solid #E2E8F0; border-radius:5px; padding:4px 8px; box-shadow:0 2px 8px rgba(0,0,0,0.1); z-index:100; white-space:nowrap; font-size:11px; color:#475569; font-style:normal; }',
    '.' + ID + ' .ph-del-confirm-yes { font-size:11px; font-weight:600; color:#EF4444; cursor:pointer; padding:2px 6px; border-radius:3px; border:1px solid #FECACA; background:#FEF2F2; }',
    '.' + ID + ' .ph-del-confirm-yes:hover { background:#FEE2E2; }',
    '.' + ID + ' .ph-del-confirm-no { font-size:11px; color:#94A3B8; cursor:pointer; }',
    '.' + ID + ' .ph-del-confirm-no:hover { color:#475569; }',
    '.' + ID + ' .ph-addbtn { padding:5px 10px; font-size:10px; color:#94A3B8; cursor:pointer; display:flex; align-items:center; gap:5px; border-top:1px dashed #E2E8F0; flex-shrink:0; }',
    '.' + ID + ' .ph-addbtn:hover { background:#F8FAFC; }',
    '.' + ID + ' .ph-zone-card { flex:1; min-width:0; border:1px solid #E2E8F0; border-left:4px solid #E2E8F0; border-radius:8px; overflow:hidden; display:flex; flex-direction:column; }',
    '.' + ID + ' .ph-zone-row { display:flex; gap:8px; align-items:flex-start; }',
    '.' + ID + ' .ph-pool-card { width:100%; border:1px solid #E2E8F0; border-radius:8px; overflow:hidden; background:#FFFFFF; display:flex; flex-direction:column; }',
    '.' + ID + ' .ph-select { border:none; background:transparent; font-size:11px; font-weight:600; cursor:pointer; outline:none; width:100%; }',
    '.' + ID + ' .ph-zone-grid { display:grid; }',
    '.' + ID + ' .ph-col-hd { padding:4px 8px; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.4px; text-align:center; background:#F8FAFC; border-bottom:1px solid #E2E8F0; border-right:' + SEP_COL + '; }',
    '.' + ID + ' .ph-poste-cell { padding:3px 4px; display:flex; align-items:center; border-right:' + SEP_COL + '; border-bottom:' + SEP_ROW + '; position:relative; }',
    '.' + ID + ' .ph-icon-btn { width:26px; height:26px; display:flex; align-items:center; justify-content:center; border-radius:5px; background:#E2E8F0; color:#64748B; cursor:pointer; flex-shrink:0; }',
    '.' + ID + ' .ph-icon-btn:hover { background:#CBD5E1; }',
    '.' + ID + ' .ph-today-btn { padding:3px 8px; font-size:10px; font-weight:600; color:#3B82F6; background:#EFF6FF; border:1px solid #BFDBFE; border-radius:4px; cursor:pointer; flex-shrink:0; }',
    '.' + ID + ' .ph-today-btn:hover { background:#DBEAFE; }',
    '.' + ID + ' .ph-copy-zone-btn { width:22px; height:22px; display:flex; align-items:center; justify-content:center; border-radius:4px; cursor:pointer; flex-shrink:0; }',
    '.' + ID + ' .ph-copy-zone-btn:hover { opacity:0.75; }',
    '.' + ID + ' .ph-tag.insert-before { border-left:2px solid #3B82F6 !important; margin-left:3px; }',
    '.' + ID + ' .ph-tag.insert-after  { border-right:2px solid #3B82F6 !important; margin-right:3px; }',
    '.' + ID + ' .ph-drop.ph-dz-active { outline:2px solid #3B82F6; outline-offset:-2px; background:rgba(59,130,246,0.06); }',
    // --- Display mode ---
    '.' + ID + '.ph-display { background:#F1F5F9; }',
    '.' + ID + ' .ph-dv-wrap { padding:20px; display:flex; flex-direction:column; gap:16px; height:100%; overflow-y:auto; box-sizing:border-box; }',
    '.' + ID + ' .ph-dv-date { font-size:clamp(20px,3vw,36px); font-weight:800; color:#1E293B; text-align:center; padding:18px 24px; background:#FFFFFF; border-radius:12px; border:1px solid #E2E8F0; letter-spacing:-0.5px; }',
    '.' + ID + ' .ph-dv-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:12px; }',
    '.' + ID + ' .ph-dv-zone { background:#FFFFFF; border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 1px 3px rgba(0,0,0,0.06); }',
    '.' + ID + ' .ph-dv-zone-full { background:#FFFFFF; border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.06); }',
    '.' + ID + ' .ph-dv-zone-hd { padding:12px 16px; font-size:clamp(13px,1.5vw,17px); font-weight:800; display:flex; align-items:center; gap:8px; border-left:4px solid; border-bottom:1px solid #E2E8F0; }',
    '.' + ID + ' .ph-dv-zone-body { flex:1; padding:0; display:flex; flex-direction:column; }',
    '.' + ID + ' .ph-dv-row { display:flex; flex-direction:column; gap:10px; padding:16px 18px; border-bottom:1px solid #E2E8F0; background:#FFFFFF; }',
    '.' + ID + ' .ph-dv-row:nth-child(even) { background:#F8FAFC; }',
    '.' + ID + ' .ph-dv-row:last-child { border-bottom:none; }',
    '.' + ID + ' .ph-dv-row-line { display:flex; flex-wrap:wrap; gap:6px; align-items:center; }',
    '.' + ID + ' .ph-dv-row-bottom { justify-content:space-between; }',
    '.' + ID + ' .ph-dv-cell { display:flex; flex-wrap:wrap; gap:4px; flex:1; }',
    '.' + ID + ' .ph-dv-cell-veh { display:flex; flex-wrap:wrap; gap:4px; flex-shrink:0; }',
    '.' + ID + ' .ph-dv-comment { font-size:13px; color:#475569; font-style:italic; padding:4px 10px; background:#F8FAFC; border-radius:4px; border-left:3px solid #CBD5E1; word-break:break-word; overflow-wrap:break-word; }',
    '.' + ID + ' .ph-dv-tag { display:inline-flex; align-items:center; padding:3px 9px; border-radius:5px; font-size:clamp(11px,1.1vw,13px); font-weight:600; white-space:nowrap; border:1px solid transparent; }',
    '.' + ID + ' .ph-dv-tag-com { flex-direction:column; align-items:flex-start; gap:2px; white-space:normal; }',
    '.' + ID + ' .ph-dv-tag-sub { font-size:clamp(9px,0.85vw,11px); font-weight:400; opacity:0.75; line-height:1.3; }',
    '.' + ID + ' .ph-dv-poste-group { margin-bottom:4px; }',
    '.' + ID + ' .ph-dv-poste-lbl { font-size:10px; font-weight:700; padding:2px 8px; border-radius:3px; display:inline-block; text-transform:uppercase; letter-spacing:0.4px; margin-bottom:2px; }',
    '.' + ID + ' .ph-dv-abs-cols { display:flex; flex-wrap:wrap; gap:10px; padding:12px 16px; }',
    '.' + ID + ' .ph-dv-abs-col { flex:1; min-width:100px; display:flex; flex-direction:column; gap:4px; }',
    '.' + ID + ' .ph-dv-abs-tags { display:flex; flex-wrap:wrap; gap:4px; }',
    '.' + ID + ' .ph-dv-abs-motif { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.3px; }',
    '.' + ID + ' .ph-dv-people { display:flex; flex-direction:column; align-items:flex-start; gap:4px; flex:1; }',
    '.' + ID + ' .ph-dv-person { font-size:clamp(11px,1.1vw,13px); font-weight:600; display:inline-flex; align-items:center; gap:4px; }',
    '.' + ID + ' .ph-dv-people-sep { color:#475569; font-size:10px; }',
    '.' + ID + ' .ph-dv-veh-txt { font-size:clamp(11px,1.1vw,13px); font-weight:700; color:#059669; white-space:nowrap; flex-shrink:0; }',
    // --- TV view : chantier cards ---
    '.' + ID + ' .ph-tv-ch-section { display:flex; flex-direction:column; gap:8px; }',
    '.' + ID + ' .ph-tv-ch-section-hd { font-size:clamp(12px,1.3vw,15px); font-weight:800; padding:7px 14px; background:#FFF; border-radius:8px 8px 0 0; border-left:4px solid; letter-spacing:0.2px; }',
    '.' + ID + ' .ph-tv-ch-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:12px; }',
    '.' + ID + ' .ph-tv-ch-card { background:#FFF; border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.06); display:flex; flex-direction:column; }',
    '.' + ID + ' .ph-tv-ch-card-hd { padding:9px 14px; background:#FFF; border-bottom:1px solid #E2E8F0; font-size:clamp(11px,1.1vw,13px); font-weight:700; display:flex; flex-wrap:wrap; gap:4px; min-height:36px; }',
    '.' + ID + ' .ph-tv-ch-card-body { display:flex; flex-direction:column; flex:1; }',
    '.' + ID + ' .ph-tv-ch-card-sec { padding:8px 14px; border-bottom:1px solid #F1F5F9; display:flex; align-items:flex-start; gap:8px; }',
    '.' + ID + ' .ph-tv-ch-card-sec:last-child { border-bottom:none; }',
    '.' + ID + ' .ph-tv-ch-card-sec-veh { background:#F0FDF4; border-bottom:1px solid #BBF7D0; min-height:36px; padding:5px 14px; align-items:center; }',
    '.' + ID + ' .ph-tv-ch-card-sec-equipe { background:#FFF; border-bottom:1px solid #F1F5F9; }',
    '.' + ID + ' .ph-tv-ch-card-sec-comment { background:#F8FAFC; }',
    '.' + ID + ' .ph-tv-ch-card-lbl { font-size:15px; flex-shrink:0; line-height:1.5; }',
    '.' + ID + ' .ph-tv-ch-card-tags { display:flex; flex-wrap:wrap; gap:3px; flex:1; }',
    '.' + ID + ' .ph-tv-ch-veh-name { font-size:clamp(12px,1.2vw,14px); font-weight:800; color:#059669; letter-spacing:-0.3px; }',
    '.' + ID + ' .ph-tv-ch-card-comment { font-size:11px; color:#64748B; font-style:italic; word-break:break-word; flex:1; }',
    '.' + ID + ' .ph-tv-empty { color:#94A3B8; font-style:italic; font-size:13px; padding:12px 16px; background:#FFF; border-radius:8px; border:1px solid #E2E8F0; }',
    // --- TV view : compact bottom zones ---
    '.' + ID + ' .ph-tv-bottom { display:flex; flex-direction:column; gap:16px; }',
    '.' + ID + ' .ph-tv-ch-card-hd .ph-dv-tag { white-space:normal; word-break:break-word; }',
    '.' + ID + ' .ph-tv-ch-card-tags .ph-dv-tag { white-space:normal; word-break:break-word; max-width:100%; }',
    '.' + ID + ' .ph-tv-cpt-zone { width:100%; background:#FFF; border:1px solid #E2E8F0; border-radius:8px; overflow:hidden; box-sizing:border-box; }',
    '.' + ID + ' .ph-tv-cpt-zone-abs { }',
    '.' + ID + ' .ph-tv-cpt-zone-hd { padding:7px 14px; font-size:clamp(12px,1.3vw,15px); font-weight:800; border-left:4px solid; background:#FFF; border-radius:0; letter-spacing:0.2px; border-bottom:1px solid #E2E8F0; }',
    '.' + ID + ' .ph-tv-cpt-row:last-child { border-bottom:none; }',
    '.' + ID + ' .ph-tv-cpt-sep { color:#CBD5E1; }',
    '.' + ID + ' .ph-tv-cpt-ch { font-weight:600; color:#D97706; }',
    '.' + ID + ' .ph-tv-cpt-eq { font-weight:500; color:#2563EB; }',
    '.' + ID + ' .ph-tv-cpt-stt { font-weight:500; color:#7C3AED; }',
    '.' + ID + ' .ph-tv-cpt-veh { font-weight:600; color:#059669; }',
    '.' + ID + ' .ph-tv-cpt-poste { font-size:10px; font-weight:700; text-transform:uppercase; background:#64748B22; color:#64748B; padding:1px 5px; border-radius:3px; }',
    '.' + ID + ' .ph-tv-cpt-comment { font-size:11px; color:#64748B; font-style:italic; }',
    '.' + ID + ' .ph-tv-abs-cols { display:flex; flex-wrap:wrap; gap:0; padding:0; }',
    '.' + ID + ' .ph-tv-abs-col { display:flex; flex-direction:column; gap:2px; min-width:140px; flex:1; padding:8px 16px; border-right:1px solid #F1F5F9; }',
    '.' + ID + ' .ph-tv-abs-col:last-child { border-right:none; }',
    '.' + ID + ' .ph-tv-abs-motif { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.4px; margin-bottom:4px; }',
    '.' + ID + ' .ph-tv-abs-name { font-size:13px; font-weight:500; color:#1E293B; }',
    '.' + ID + ' .ph-tv-cpt-row { display:flex; flex-wrap:wrap; align-items:center; gap:16px; padding:7px 16px; border-bottom:1px solid #F1F5F9; font-size:13px; line-height:1.5; }',
    // --- Conducteur ---
    '.' + ID + ' .ph-conduc-line { display:flex; align-items:center; gap:4px; padding:1px 4px 2px; font-size:10px; color:#059669; width:100%; border-top:1px dashed #A7F3D0; margin-top:2px; }',
    '.' + ID + ' .ph-conduc-name { flex:1; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }',
    '.' + ID + ' .ph-conduc-none { color:#CBD5E1 !important; font-weight:400 !important; }',
    '.' + ID + ' .ph-conduc-edit { cursor:pointer; color:#94A3B8; font-size:10px; flex-shrink:0; padding:1px 3px; border-radius:2px; line-height:1; }',
    '.' + ID + ' .ph-conduc-edit:hover { color:#059669; background:#D1FAE5; }',
    // --- Date label cliquable ---
    '.' + ID + ' .ph-date-label { cursor:pointer; padding:2px 6px; border-radius:4px; transition:background 0.15s; }',
    '.' + ID + ' .ph-date-label:hover { background:#F1F5F9; }',
    // --- Mini calendrier ---
    '.ph-cal { position:fixed; z-index:10000; background:#FFF; border:1px solid #E2E8F0; border-radius:5px; width:260px; user-select:none; font-family:inherit; }',
    '.ph-cal-header { display:flex; align-items:center; justify-content:space-between; padding:10px 12px 8px; border-bottom:1px solid #E2E8F0; }',
    '.ph-cal-nav { background:none; border:1px solid #E2E8F0; cursor:pointer; font-size:13px; color:#64748B; width:28px; height:28px; border-radius:5px; display:flex; align-items:center; justify-content:center; transition:background 0.15s; }',
    '.ph-cal-nav:hover { background:#F1F5F9; }',
    '.ph-cal-month { font-size:13px; font-weight:700; color:#1E293B; }',
    '.ph-cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:1px; padding:8px 8px 4px; }',
    '.ph-cal-dow { text-align:center; font-size:9px; font-weight:700; color:#64748B; padding:2px 0 5px; text-transform:uppercase; letter-spacing:0.08em; }',
    '.ph-cal-day { text-align:center; font-size:12px; padding:5px 2px; border-radius:5px; cursor:pointer; color:#1E293B; transition:background 0.15s; }',
    '.ph-cal-day:hover { background:#F1F5F9; }',
    '.ph-cal-today { font-weight:700; text-decoration:underline; text-underline-offset:2px; }',
    '.ph-cal-selected { background:#1E293B !important; color:#FFF !important; }',
    '.ph-cal-foot { padding:6px 8px 8px; border-top:1px solid #E2E8F0; display:flex; justify-content:center; }',
    '.ph-cal-today-btn { background:none; border:1px solid #E2E8F0; color:#475569; font-size:11px; font-weight:600; cursor:pointer; border-radius:5px; padding:4px 14px; transition:background 0.15s; }',
    '.ph-cal-today-btn:hover { background:#F1F5F9; }',
    // --- Popover confirmation ---
    '.ph-copy-popover { position:fixed; z-index:10001; background:#FFF; border:1px solid #E2E8F0; border-radius:5px; padding:10px 12px; width:220px; box-shadow:0 4px 12px rgba(0,0,0,0.1); }',
    '.ph-copy-popover-title { font-size:12px; font-weight:700; color:#1E293B; margin-bottom:4px; }',
    '.ph-copy-popover-body { font-size:11px; color:#475569; margin-bottom:10px; line-height:1.5; }',
    '.ph-copy-popover-btns { display:flex; gap:8px; justify-content:flex-end; }',
    '.ph-copy-popover-ok { padding:6px 14px; border-radius:5px; background:#1E293B; color:#FFF; border:none; font-size:12px; font-weight:600; cursor:pointer; transition:background 0.15s; }',
    '.ph-copy-popover-ok:hover { background:#0F172A; }',
    '.ph-copy-popover-cancel { padding:6px 14px; border-radius:5px; background:#F1F5F9; color:#475569; border:1px solid #E2E8F0; font-size:12px; font-weight:600; cursor:pointer; transition:background 0.15s; }',
    '.ph-copy-popover-cancel:hover { background:#E2E8F0; }',
  ].join('\n');
  document.head.appendChild(styleEl);
  instance.data.styleEl = styleEl;

  // ============================================================
  // ÉTAT
  // ============================================================
  instance.data.dateInitialized = false;
  instance.data.state = {
    date: (function() { var _d = new Date(); _d.setHours(0,0,0,0); return _d; }()),
    rows: {
      chantier:  [],
      transport: [],
      atelier:   [],
      bureau:    [],
    },
    absences: {},
    pools: {
      equipiers:     [],
      soustraitants: [],
      vehicules:     [],
      chantiers: {
        chantier:    [],
        transport:   [],
        k2:          [],
        finitionK2:  [],
        fabrication: [],
      },
    },
  };
  instance.data.dragData = null;

  // ============================================================
  // VALIDATION DROP
  // ============================================================
  function isPoolDropAllowed(drag, poolKey) {
    if (drag.type === 'equipier')     return poolKey === 'equipiers';
    if (drag.type === 'soustraitant') return poolKey === 'soustraitants';
    if (drag.type === 'vehicule')     return poolKey === 'vehicules';
    if (drag.type === 'chantier')     return poolKey === (drag.origPool || drag.poolKey);
    return false;
  }

  function isDropAllowed(drag, targetZone, targetCol) {
    if (drag.type === 'equipier')     return targetCol === 'equipier';
    if (drag.type === 'soustraitant') return targetCol === 'equipier' && targetZone === 'chantier';
    if (drag.type === 'vehicule')     return targetCol === 'vehicule' && !drag.zone;
    if (drag.type === 'chantier') {
      if (targetCol !== 'chantiers') return false;
      if (drag.poolKey) return getChantierPoolToZone()[drag.poolKey] === targetZone;
      return drag.zone === targetZone;
    }
    return false;
  }

  // ============================================================
  // CHANTIER PICKER
  // ============================================================
  function closeChantierPicker(clearState) {
    var picker = instance.data.activePicker;
    if (picker && picker.parentNode) picker.parentNode.removeChild(picker);
    instance.data.activePicker = null;
    if (instance.data.pickerCleanup) {
      instance.data.pickerCleanup(!!clearState);
      instance.data.pickerCleanup = null;
    }
    if (clearState) instance.data.openPickerState = null;
  }

  // ---- Helpers partagés pickers ----
  function positionPicker(el, anchor) {
    var r  = anchor.getBoundingClientRect();
    var ew = el.offsetWidth  || 300;
    var eh = el.offsetHeight || 200;
    var left = r.left;
    var top  = r.bottom + 4;
    if (left + ew > window.innerWidth  - 8) left = Math.max(8, window.innerWidth  - ew - 8);
    if (top  + eh > window.innerHeight - 8) top  = Math.max(8, r.top - 4 - eh);
    el.style.left = left + 'px';
    el.style.top  = top  + 'px';
  }

  function pickerCleanupSetup(picker, anchor) {
    var ready = false;
    function onOut(ev) { if (ready && !picker.contains(ev.target) && !anchor.contains(ev.target)) closeChantierPicker(true); }
    function onKey(ev) { if (ev.key === 'Escape') closeChantierPicker(true); }
    function onScroll(ev) { if (ready && !picker.contains(ev.target)) closeChantierPicker(true); }
    instance.data.pickerCleanup = function() {
      document.removeEventListener('mousedown', onOut, true);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      var wrap = instance.data.container.querySelector('.ph-wrap');
      if (wrap) wrap.removeEventListener('scroll', onScroll);
    };
    document.addEventListener('mousedown', onOut, true);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    var wrap = instance.data.container.querySelector('.ph-wrap');
    if (wrap) wrap.addEventListener('scroll', onScroll);
    setTimeout(function() { ready = true; }, 0);
  }

  function pickerBase(dzEl, widthPx) {
    closeChantierPicker();
    var w = widthPx || 300;
    var el = document.createElement('div');
    el.className = 'ph-chantier-picker';
    el.style.cssText = 'position:fixed;z-index:9999;background:#FFF;border:1px solid #E2E8F0;border-radius:5px;width:' + w + 'px;display:flex;flex-direction:column;overflow:hidden;top:-9999px;left:-9999px;';
    document.body.appendChild(el);
    instance.data.activePicker = el;
    pickerCleanupSetup(el, dzEl);
    return el;
  }

  function showEquipierPicker(dzEl) {
    var zone  = dzEl.dataset.dzZone;
    var rowId = dzEl.dataset.dzRow;
    var st    = instance.data.state;
    ensureRow(st, zone, parseInt(rowId));
    var row = getRow(st, zone, rowId);
    if (!row) return;

    var picker = pickerBase(dzEl, 300);

    var addedNames = (row.equipiers || []).map(function(e) { return e.name; });

    function getItems(filter) {
      var eq  = st.pools.equipiers.map(function(n)  { return { name: n, type: 'equipier',     origPool: 'equipiers'     }; });
      var stt = st.pools.soustraitants.map(function(n) { return { name: n, type: 'soustraitant', origPool: 'soustraitants' }; });
      var all = eq.concat(stt);
      if (filter) all = all.filter(function(x) { return x.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1; });
      return all;
    }

    picker.innerHTML = '<div style="padding:8px 12px;border-bottom:1px solid #E2E8F0;flex-shrink:0;">'
      + '<input type="text" class="ph-cp-search" placeholder="Rechercher..." style="width:100%;padding:5px 8px;border:1px solid #E2E8F0;border-radius:5px;font-size:12px;outline:none;color:#1E293B;box-sizing:border-box;">'
      + '</div>'
      + '<div class="ph-cp-list" style="max-height:200px;overflow-y:auto;padding:4px 0;"></div>';

    var searchEl = picker.querySelector('.ph-cp-search');
    var listEl   = picker.querySelector('.ph-cp-list');

    function renderList(filter) {
      var items = getItems(filter);
      if (!items.length) { listEl.innerHTML = '<div style="padding:10px;font-size:11px;color:#94A3B8;text-align:center;">Aucun équipier disponible</div>'; return; }
      listEl.innerHTML = items.map(function(x) {
        var isAdded = addedNames.indexOf(x.name) !== -1;
        var dot = x.type === 'soustraitant' ? '<span style="width:6px;height:6px;border-radius:50%;background:#7C3AED;display:inline-block;flex-shrink:0;"></span>' : '';
        return '<div class="ph-cp-item" data-cp-name="' + encodeURIComponent(x.name) + '" data-cp-type="' + x.type + '" data-cp-pool="' + x.origPool + '" style="padding:8px 14px;font-size:12px;cursor:' + (isAdded ? 'default' : 'pointer') + ';color:' + (isAdded ? '#94A3B8' : '#1E293B') + ';display:flex;align-items:center;gap:6px;border-bottom:1px solid #F8FAFC;">'
          + dot + '<span style="flex:1;">' + x.name + '</span>'
          + (isAdded ? '<span style="font-size:10px;color:#10B981;">✓</span>' : '<span style="font-size:11px;color:#CBD5E1;">+</span>')
          + '</div>';
      }).join('');
    }

    renderList('');
    positionPicker(picker, dzEl);
    searchEl.focus();
    searchEl.addEventListener('input', function() { renderList(searchEl.value); });

    listEl.addEventListener('click', function(e) {
      var item = e.target.closest('[data-cp-name]');
      if (!item || addedNames.indexOf(decodeURIComponent(item.dataset.cpName)) !== -1) return;
      var name = decodeURIComponent(item.dataset.cpName);
      var type = item.dataset.cpType;
      var pool = item.dataset.cpPool;

      // Retire du pool
      var poolArr = type === 'soustraitant' ? st.pools.soustraitants : st.pools.equipiers;
      var idx = poolArr.indexOf(name);
      if (idx !== -1) poolArr.splice(idx, 1);

      if (!row.equipiers) row.equipiers = [];
      row.equipiers.push({ name: name, type: type, origPool: pool });
      addedNames.push(name);
      // Appliquer poste par défaut si la ligne atelier n'en a pas
      if (zone === 'atelier' && !row.poste) {
        var defPostes = instance.data.postes || [];
        if (defPostes.length) row.poste = defPostes[0];
      }
      var res = instance.data.resourceMap && instance.data.resourceMap[name];
      resetStates();
      if (res) instance.publishState('tag_' + res.type, res.obj);
      instance.publishState('source_zone', 'POOL');
      instance.publishState('drop_zone',   zoneLabel(zone));
      instance.publishState('row_id_drop', row.rowId || '');
      if (zone === 'atelier' && row.poste) instance.publishState('poste_atelier', row.poste);
      instance.triggerEvent('tag_moved');
      renderList(searchEl.value);
      render();
    });
  }

  function showVehiculePicker(dzEl) {
    var zone  = dzEl.dataset.dzZone;
    var rowId = dzEl.dataset.dzRow;
    var st    = instance.data.state;
    ensureRow(st, zone, parseInt(rowId));
    var row = getRow(st, zone, rowId);
    if (!row) return;

    var picker = pickerBase(dzEl, 280);

    // Véhicule actuel de la ligne
    var currentVeh = zone === 'chantier'
      ? (row.vehicules && row.vehicules[0] ? row.vehicules[0].name : null)
      : (row.vehicule ? row.vehicule.name : null);

    picker.innerHTML = '<div class="ph-cp-list" style="max-height:220px;overflow-y:auto;padding:4px 0;"></div>';
    var listEl = picker.querySelector('.ph-cp-list');

    function renderList() {
      var ordreMap = instance.data.vehiculeOrdreMap || {};
      var vehs = st.pools.vehicules.slice().sort(function(a, b) {
        var oA = ordreMap[a] !== undefined ? ordreMap[a] : Infinity;
        var oB = ordreMap[b] !== undefined ? ordreMap[b] : Infinity;
        return oA - oB;
      });
      // Ajouter le véhicule actuel si absent du pool (déjà placé)
      if (currentVeh && vehs.indexOf(currentVeh) === -1) vehs.unshift(currentVeh);
      if (!vehs.length) { listEl.innerHTML = '<div style="padding:10px;font-size:11px;color:#94A3B8;text-align:center;">Aucun véhicule disponible</div>'; return; }
      listEl.innerHTML = vehs.map(function(name) {
        var isCurrent = name === currentVeh;
        var indispo = instance.data.indispoVehicules && instance.data.indispoVehicules[name];
        return '<div class="ph-cp-item" data-cp-name="' + encodeURIComponent(name) + '" style="padding:8px 14px;font-size:12px;cursor:pointer;color:' + (indispo ? '#94A3B8' : '#1E293B') + ';display:flex;align-items:center;gap:6px;border-bottom:1px solid #F8FAFC;' + (isCurrent ? 'background:#F8FAFC;' : '') + '">'
          + EMOJIS.vehicule + ' <span style="flex:1;' + (indispo ? 'text-decoration:line-through;' : '') + '">' + name + '</span>'
          + (isCurrent ? '<span style="font-size:10px;color:#10B981;">✓</span>' : '')
          + '</div>';
      }).join('');
    }

    renderList();
    positionPicker(picker, dzEl);

    listEl.addEventListener('click', function(e) {
      var item = e.target.closest('[data-cp-name]');
      if (!item) return;
      var name = decodeURIComponent(item.dataset.cpName);

      // Retour de l'ancien véhicule au pool
      if (currentVeh && currentVeh !== name) {
        if (st.pools.vehicules.indexOf(currentVeh) === -1) st.pools.vehicules.push(currentVeh);
        if (zone === 'chantier') {
          row.vehicules = (row.vehicules || []).filter(function(v) { return v.name !== currentVeh; });
        } else { row.vehicule = null; }
      }

      // Retire du pool
      var idx = st.pools.vehicules.indexOf(name);
      if (idx !== -1) st.pools.vehicules.splice(idx, 1);

      // Ajoute à la ligne
      var vObj = { name: name, type: 'vehicule', origPool: 'vehicules' };
      if (zone === 'chantier') {
        row.vehicules = [vObj];
      } else {
        row.vehicule = vObj;
      }
      currentVeh = name;
      // Re-trier la zone chantier par ordre de véhicule (même logique que update4.js)
      if (zone === 'chantier') {
        var ordreMap = instance.data.vehiculeOrdreMap || {};
        st.rows.chantier.sort(function(a, b) {
          var vA = a.vehicules && a.vehicules[0] ? a.vehicules[0].name : null;
          var vB = b.vehicules && b.vehicules[0] ? b.vehicules[0].name : null;
          var oA = vA !== null && ordreMap[vA] !== undefined ? ordreMap[vA] : Infinity;
          var oB = vB !== null && ordreMap[vB] !== undefined ? ordreMap[vB] : Infinity;
          return oA - oB;
        });
      }
      instance.data.openPickerState = null;
      var res = instance.data.resourceMap && instance.data.resourceMap[name];
      resetStates();
      if (res) instance.publishState('tag_vehicule', res.obj);
      instance.publishState('source_zone', 'POOL');
      instance.publishState('drop_zone',   zoneLabel(zone));
      instance.publishState('row_id_drop', row.rowId || '');
      instance.triggerEvent('tag_moved');
      render();
    });
  }

  function showConducteurPicker(anchor, zone, rowIdx) {
    closeChantierPicker();
    var st  = instance.data.state;
    var row = st.rows[zone] && st.rows[zone][parseInt(rowIdx)];
    if (!row) return;
    var equipiers = row.equipiers || [];
    if (!equipiers.length) return;

    var picker = document.createElement('div');
    picker.className = 'ph-chantier-picker';
    picker.style.cssText = 'position:fixed;z-index:9999;background:#FFF;border:1px solid #E2E8F0;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.12);min-width:190px;display:flex;flex-direction:column;overflow:hidden;top:-9999px;left:-9999px;';
    document.body.appendChild(picker);
    instance.data.activePicker = picker;

    var currentCondName = row.conducteur ? row.conducteur.name : null;

    picker.innerHTML = '<div style="padding:6px 10px;border-bottom:1px solid #E2E8F0;font-size:10px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.06em;flex-shrink:0;">Conducteur</div>'
      + '<div class="ph-cp-list">'
      + equipiers.map(function(e) {
          var isSel = e.name === currentCondName;
          var isStt = e.type === 'soustraitant';
          var dot = isStt ? '<span style="width:6px;height:6px;border-radius:50%;background:#7C3AED;display:inline-block;flex-shrink:0;"></span>' : '';
          return '<div class="ph-cp-item" data-cond-name="' + encodeURIComponent(e.name) + '" data-cond-type="' + e.type + '" style="padding:8px 12px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:8px;border-bottom:1px solid #F8FAFC;color:' + (isSel ? '#1D4ED8' : '#1E293B') + ';background:' + (isSel ? '#EFF6FF' : '#FFF') + ';">'
            + dot + '<span style="flex:1;">' + e.name + '</span>'
            + (isSel ? '<span style="color:#10B981;font-size:10px;">✓</span>' : '')
            + '</div>';
        }).join('')
      + '</div>';

    positionPicker(picker, anchor);
    pickerCleanupSetup(picker, anchor);

    picker.querySelector('.ph-cp-list').addEventListener('click', function(e) {
      var item = e.target.closest('[data-cond-name]');
      if (!item) return;
      var name    = decodeURIComponent(item.dataset.condName);
      var condType = item.dataset.condType || 'equipier';
      var res     = instance.data.resourceMap && instance.data.resourceMap[name];
      var resObj  = res ? res.obj : null;
      row.conducteur = { name: name, obj: resObj, type: condType };
      closeChantierPicker(true);
      resetStates();
      if (condType === 'soustraitant') {
        instance.publishState('tag_conducteur_sst', resObj);
      } else {
        instance.publishState('tag_conducteur', resObj);
      }
      instance.publishState('row_id_drop',   row.rowId || '');
      instance.triggerEvent('conducteur_changed');
      render();
    });
  }

  function showChantierPicker(dzEl) {
    closeChantierPicker();
    dzEl.classList.add('ph-dz-active');
    var zone  = dzEl.dataset.dzZone;
    var rowId = dzEl.dataset.dzRow;
    var st    = instance.data.state;

    // Auto-créer la ligne si c'est une ligne fantôme
    ensureRow(st, zone, parseInt(rowId));

    var row = getRow(st, zone, rowId);
    if (!row) return;

    var added = (row.chantiers || []).map(function(c) { return c.name; });

    var picker = document.createElement('div');
    picker.className = 'ph-chantier-picker';
    picker.style.cssText = 'position:fixed;z-index:9999;background:#FFF;border:1px solid #E2E8F0;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.14);width:350px;display:flex;flex-direction:column;overflow:hidden;top:-9999px;left:-9999px;';

    picker.innerHTML = '<div style="padding:10px 14px;border-bottom:1px solid #E2E8F0;flex-shrink:0;">'
      + '<input type="text" placeholder="Rechercher un chantier..." class="ph-cp-search" style="width:100%;padding:6px 10px;border:1px solid #E2E8F0;border-radius:5px;font-size:12px;outline:none;color:#1E293B;box-sizing:border-box;">'
      + '</div>'
      + '<div class="ph-cp-list" style="max-height:220px;overflow-y:auto;padding:4px 0;"></div>';

    var searchEl = picker.querySelector('.ph-cp-search');
    var listEl   = picker.querySelector('.ph-cp-list');

    function renderList() {
      var filter     = (searchEl.value || '').trim().toLowerCase();
      var allResults = instance.data.chSearchResults || [];
      var results    = filter.length
        ? allResults.filter(function(n) { return n.toLowerCase().indexOf(filter) !== -1; })
        : allResults;
      if (!results.length) {
        listEl.innerHTML = '<div style="padding:12px;font-size:11px;color:#94A3B8;text-align:center;">Aucun résultat</div>';
        return;
      }
      listEl.innerHTML = results.map(function(name) {
        var isAdded = added.indexOf(name) !== -1;
        return '<div class="ph-cp-item" data-cp-name="' + encodeURIComponent(name) + '" data-cp-added="' + isAdded + '" style="padding:10px 16px;font-size:12px;cursor:' + (isAdded ? 'default' : 'pointer') + ';color:' + (isAdded ? '#94A3B8' : '#1E293B') + ';display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #F8FAFC;">'
          + '<span>' + name + '</span>'
          + (isAdded ? '<span style="font-size:10px;color:#10B981;">✓</span>' : '<span style="font-size:11px;color:#CBD5E1;">+</span>')
          + '</div>';
      }).join('');
    }

    // Exposer renderList pour que update4.js puisse rafraîchir le picker quand les résultats arrivent
    instance.data.pickerRenderList = renderList;

    document.body.appendChild(picker);
    instance.data.activePicker = picker;
    renderList();
    positionPicker(picker, dzEl);
    searchEl.focus();

    // Restaurer la saisie précédente si le picker a été recréé suite à un re-render
    if (instance.data.pickerSearchValue) {
      searchEl.value = instance.data.pickerSearchValue;
    }
    renderList();

    searchEl.addEventListener('input', function() {
      instance.data.pickerSearchValue = searchEl.value;
      renderList();
    });
    searchEl.addEventListener('keydown', function(ev) { if (ev.key === 'Escape') closeChantierPicker(true); });

    listEl.addEventListener('mouseover', function(e) {
      var item = e.target.closest('[data-cp-name]');
      if (item && item.dataset.cpAdded !== 'true') item.style.background = '#F1F5F9';
    });
    listEl.addEventListener('mouseout', function(e) {
      var item = e.target.closest('[data-cp-name]');
      if (item) item.style.background = '';
    });

    listEl.addEventListener('click', function(e) {
      var item = e.target.closest('[data-cp-name]');
      if (!item || item.dataset.cpAdded === 'true') return;
      var name = decodeURIComponent(item.dataset.cpName);
      if (!row.chantiers) row.chantiers = [];

      // Retire du pool de la zone si présent, et mémorise origPool pour le retour
      var atelierTypesNow = instance.data.atelierTypes || [];
      var _tSet2 = {};
      (instance.data.atelierTransportTypes || []).forEach(function(t) { _tSet2[t] = true; });
      var transportTypes   = atelierTypesNow.filter(function(t) { return !!_tSet2[t]; });
      var atelierOnlyTypes = atelierTypesNow.filter(function(t) { return !_tSet2[t]; });
      var zonePoolKeys = {
        chantier:  ['chantier'],
        transport: transportTypes,
        atelier:   atelierOnlyTypes,
      };
      var relevantPools = zonePoolKeys[zone] || [];
      var foundPool = null;
      relevantPools.forEach(function(pk) {
        var pool = instance.data.state.pools.chantiers[pk];
        if (pool) { var idx = pool.indexOf(name); if (idx !== -1) { pool.splice(idx, 1); foundPool = pk; } }
      });

      if (zone === 'atelier' && foundPool) {
        var CP_POOL_TO_POSTE = { '⚙️ K2': 'K2', '✅ Finitions K2': 'Finition K2', '🏭 Fabrication': 'Fabrication' };
        var cpAutoPoste = CP_POOL_TO_POSTE[foundPool];
        if (cpAutoPoste) row.poste = cpAutoPoste;
      }

      row.chantiers.push({ name: name, type: 'chantier', origPool: foundPool });
      added.push(name);
      var cpResource = instance.data.resourceMap && instance.data.resourceMap[name];
      resetStates();
      if (cpResource) instance.publishState('tag_chantier', cpResource.obj);
      instance.publishState('source_zone',   foundPool ? 'POOL' : null);
      instance.publishState('drop_zone',     zoneLabel(zone));
      instance.publishState('row_id_drop',   row.rowId || '');
      if (zone === 'atelier') instance.publishState('poste_atelier', row.poste || '');
      instance.triggerEvent('tag_moved');
      renderList();
      render();
    });

    var ready = false;
    function onOutsideClick(ev) {
      if (ready && !picker.contains(ev.target) && !dzEl.contains(ev.target)) closeChantierPicker(true);
    }
    function onKeydown(ev) { if (ev.key === 'Escape') closeChantierPicker(true); }
    function onScroll(ev) { if (ready && !picker.contains(ev.target)) closeChantierPicker(true); }

    instance.data.pickerCleanup = function(byUser) {
      dzEl.classList.remove('ph-dz-active');
      document.removeEventListener('mousedown', onOutsideClick, true);
      document.removeEventListener('keydown', onKeydown);
      window.removeEventListener('scroll', onScroll, true);
      var wrap = instance.data.container.querySelector('.ph-wrap');
      if (wrap) wrap.removeEventListener('scroll', onScroll);
      instance.data.pickerRenderList  = null;
      instance.data.pickerSearchValue = '';
    };

    document.addEventListener('mousedown', onOutsideClick, true);
    document.addEventListener('keydown', onKeydown);
    window.addEventListener('scroll', onScroll, true);
    var wrap2 = instance.data.container.querySelector('.ph-wrap');
    if (wrap2) wrap2.addEventListener('scroll', onScroll);
    setTimeout(function() { ready = true; }, 0);
  }

  // ============================================================
  // RENDER
  // ============================================================
  function render() {
    var s   = instance.data.state;
    var cnt = instance.data.container;
    if (instance.data.loaderTimer) { clearInterval(instance.data.loaderTimer); instance.data.loaderTimer = null; }
    var prevWrap = cnt.querySelector('.ph-wrap');
    var savedScroll = prevWrap ? prevWrap.scrollTop : 0;
    var savedPickerState = instance.data.openPickerState || null;
    closeChantierPicker();

    // ---- helpers HTML ----
    var countMap = buildCountMap(s);

    function isDebutToday(name) {
      var chefs = instance.data.chantierChefMap && instance.data.chantierChefMap[name];
      if (chefs && chefs.length) {
        return chefs.some(function(c) { return c.isStartingToday; });
      }
      // Fallback sur chantierDebutMap si pas de chefs
      var d = instance.data.chantierDebutMap && instance.data.chantierDebutMap[name];
      if (!d) return false;
      var d1 = new Date(d); d1.setHours(0,0,0,0);
      var d2 = new Date(instance.data.state.date); d2.setHours(0,0,0,0);
      return d1.getTime() === d2.getTime();
    }

    function chefTooltip(name) {
      var chefs = instance.data.chantierChefMap && instance.data.chantierChefMap[name];
      if (!chefs || !chefs.length) return null;
      return chefs.map(function(c) { return c.label; }).join('\n');
    }

    function tag(name, type, colorMain, colorBg, dragAttrs, removable, rmAttrs, extraStyle, noBadge, atelierComment) {
      var border = '1px solid ' + colorMain + '22';
      var rm = removable
        ? '<span class="ph-tag-rm" ' + rmAttrs + '>✕</span>'
        : '';
      var cnt2 = (!noBadge && countMap[name]) || 0;
      var badge = cnt2 > 1 ? '<span class="ph-dup-badge">' + cnt2 + '</span>' : '';
      var tt = (type === 'equipier' && instance.data.teletravailUsers && instance.data.teletravailUsers[name])
        ? '<span style="display:inline-block;padding:0 4px;border-radius:3px;background:#DBEAFE;border:1px solid #93C5FD;color:#1D4ED8;font-size:9px;font-weight:700;line-height:14px;margin-left:3px;flex-shrink:0;">TT</span>'
        : '';
      var ar = (type === 'vehicule' && instance.data.archivedVehicules && instance.data.archivedVehicules[name])
        ? '<span style="display:inline-block;padding:0 4px;border-radius:3px;background:#F1F5F9;border:1px solid #94A3B8;color:#64748B;font-size:9px;font-weight:700;line-height:14px;margin-left:3px;flex-shrink:0;">AR</span>'
        : '';
      var com = atelierComment
        ? '<span class="ph-tag-com" data-tip="Commentaire · ' + atelierComment.replace(/"/g, '&quot;') + '">💬</span>'
        : '';
      var style = 'color:' + colorMain + ';background:' + colorBg + ';border:' + border + ';' + (extraStyle || '');
      return '<span class="ph-tag" style="' + style + '" ' + dragAttrs + '>' + badge + name + tt + ar + com + rm + '</span>';
    }

    function makeDragAttrs(type, name, poolKey, zone, row, col, origPool) {
      return 'draggable="true"'
        + ' data-dt="' + type + '"'
        + ' data-dn="' + encodeURIComponent(name) + '"'
        + (poolKey  !== undefined && poolKey  !== null ? ' data-dp="' + poolKey  + '"' : '')
        + (zone     !== undefined && zone     !== null ? ' data-dz="' + zone     + '"' : '')
        + (row      !== undefined && row      !== null ? ' data-dr="' + row      + '"' : '')
        + (col      !== undefined && col      !== null ? ' data-dc="' + col      + '"' : '')
        + (origPool !== undefined && origPool !== null ? ' data-op="' + origPool + '"' : '');
    }

    function makeRmAttrs(type, name, zone, row, col, origPool) {
      return 'data-rm="1"'
        + ' data-rmt="' + type + '"'
        + ' data-rmn="' + encodeURIComponent(name) + '"'
        + ' data-rmz="' + zone + '"'
        + ' data-rmr="' + row  + '"'
        + ' data-rmc="' + col  + '"'
        + (origPool ? ' data-rmop="' + origPool + '"' : '');
    }

    function poolTag(name, type, colorMain, colorBg, poolKey) {
      var da = makeDragAttrs(type, name, poolKey, null, null, null);
      var indispo = type === 'vehicule' && instance.data.indispoVehicules && instance.data.indispoVehicules[name];
      var extra = indispo ? 'color:#94A3B8;background:#F1F5F9;border:1px solid #94A3B8 !important;text-decoration:line-through;' : '';
      return tag(name, type, colorMain, colorBg, da, false, '', extra, true);
    }

    function dropZoneHtml(items, colorMain, colorBg, placeholder, _flexVal, dvColor, zone, col, rowId) {
      var style = 'background:' + colorBg + '55;border-right:' + SEP_COL + ';--dv-color:' + dvColor + ';';
      var dataAttrs = ' data-dz-zone="' + zone + '" data-dz-col="' + col + '" data-dz-row="' + rowId + '"';
      var content = items && items.length
        ? items.map(function(it) {
            var tc = it.type === 'soustraitant' ? C.soustraitant : (C[it.type] || { main: colorMain, bg: colorBg });
            var da = makeDragAttrs(it.type, it.name, null, zone, rowId, col, it.origPool || null);
            var ra = makeRmAttrs(it.type, it.name, zone, rowId, col, it.origPool || null);
            var indispoVeh  = it.type === 'vehicule' && instance.data.indispoVehicules && instance.data.indispoVehicules[it.name];
            var archivedVeh = it.type === 'vehicule' && instance.data.archivedVehicules && instance.data.archivedVehicules[it.name];
            var extra = (indispoVeh || archivedVeh) ? 'color:#94A3B8;background:#F1F5F9;border:1px solid #94A3B8 !important;text-decoration:line-through;' : '';
            var atelierCom = null;
            if (it.type === 'chantier' && (zone === 'atelier' || zone === 'transport') && instance.data.atelierChantierCommentMap) {
              var typeMap = instance.data.atelierChantierCommentMap[it.origPool];
              atelierCom = typeMap ? (typeMap[it.name] || null) : null;
            }
            var t = tag(it.name, it.type, tc.main, tc.bg, da, true, ra, extra, false, atelierCom);
            if (it.type === 'chantier') {
              var chefTip = chefTooltip(it.name);
              if (chefTip) {
                t = t.replace('class="ph-tag"', 'class="ph-tag" data-chef-tip="' + chefTip.replace(/"/g, '&quot;').replace(/\n/g, '&#10;') + '"');
              }
              if (isDebutToday(it.name)) {
                t = t.replace('class="ph-tag"', 'class="ph-tag" style="border-color:#10B981 !important;background:#D1FAE5;color:#065F46;"')
                     .replace('>' + it.name + '<', '>🟢 ' + it.name + '<');
              }
            }
            return t;
          }).join('')
        : '<span style="font-size:10px;color:' + colorMain + '55;font-style:italic;">' + placeholder + '</span>';
      return '<div class="ph-drop" style="' + style + '"' + dataAttrs + '>' + content + '</div>';
    }

    function commentHtml(text, zone, rowId) {
      return '<div class="ph-comment" data-cm-zone="' + zone + '" data-cm-row="' + rowId + '">'
        + (text ? '<span>' + escHtml(text) + '</span>' : '<span style="color:#CBD5E1;">—</span>')
        + '</div>';
    }

    function deleteCell(zone, rowId) {
      return '<div class="ph-row-delete-cell">'
        + '<span class="ph-row-delete" data-del-zone="' + zone + '" data-del-row="' + rowId + '" title="Supprimer la ligne">×</span>'
        + '</div>';
    }

    function sectionHeaderHtml(label, color, bg, zone, withCopy, count, extraBtn) {
      var svgCopy = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
      var copyBtn = withCopy
        ? '<span class="ph-copy-zone-btn" data-cp-zone="' + zone + '" title="' + LABELS.copyZone + '" style="background:' + color + '22;color:' + color + ';">' + svgCopy + '</span>'
        : '';
      var countBadge = (count !== undefined && count !== null)
        ? '<span style="font-size:11px;font-weight:700;background:' + color + '22;color:' + color + ';border-radius:10px;padding:1px 8px;">' + count + '</span>'
        : '';
      return '<div style="padding:8px 12px;background:' + bg + ';border-bottom:1px solid #E2E8F0;font-size:13px;font-weight:800;color:' + color + ';display:flex;align-items:center;gap:6px;">'
        + label + countBadge + '<span style="margin-left:auto;display:flex;align-items:center;gap:6px;">' + (extraBtn || '') + copyBtn + '</span>' + '</div>';
    }

    function addBtnHtml(zone) {
      return '<div class="ph-addbtn" data-add-zone="' + zone + '">'
        + '<span style="width:16px;height:16px;border-radius:50%;background:#E2E8F0;display:inline-flex;align-items:center;justify-content:center;font-size:12px;line-height:1;color:#64748B;">+</span>'
        + LABELS.addLine + '</div>';
    }

    // cols: [{ key, label, color, gtc }]  gtc = grid-template-columns token (ex: '2fr', '250px')
    // rowsFn(cols) → HTML string of display:contents rows (cells in same order as cols)
    function zoneGridHtml(cols, rowsHtml) {
      var gtc = cols.map(function(c) { return c.gtc; }).join(' ');
      var header = '<div style="display:contents;">'
        + cols.map(function(c) {
            return c.key === 'delete'
              ? '<div style="background:#F8FAFC;border-bottom:1px solid #E2E8F0;"></div>'
              : '<div class="ph-col-hd" style="color:' + c.color + ';">' + c.label + '</div>';
          }).join('')
        + '</div>';
      return '<div class="ph-zone-grid" style="grid-template-columns:' + gtc + ';">' + header + rowsHtml + '</div>';
    }

    function chevronSvg(collapsed) {
      return '<svg style="flex-shrink:0;transition:transform 0.2s;transform:rotate(' + (collapsed ? '-90deg' : '0deg') + ');" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>';
    }

    function poolCardHtml(headerLabel, headerColor, headerBg, items, type, colorMain, colorBg, poolKey, searchVal) {
      var collapsed = !!instance.data.collapsedPools[poolKey];
      var hasSearch = searchVal !== undefined;
      var filteredItems = (hasSearch && searchVal)
        ? items.filter(function(n) { return n.toLowerCase().indexOf(searchVal.toLowerCase()) !== -1; })
        : items;
      var tagsHtml = filteredItems.map(function(n) {
        var indispo  = type === 'vehicule' && instance.data.indispoVehicules  && instance.data.indispoVehicules[n];
        var archived = type === 'vehicule' && instance.data.archivedVehicules && instance.data.archivedVehicules[n];
        var tagEl = poolTag(n, type, colorMain, colorBg, poolKey);
        if (indispo || archived) {
          tagEl = tagEl.replace('class="ph-tag"', 'class="ph-tag" style="background:#F1F5F9;color:#94A3B8;border-color:#CBD5E1;text-decoration:line-through;"');
        } else if (type === 'chantier') {
          var chefTipPool = chefTooltip(n);
          if (chefTipPool) {
            tagEl = tagEl.replace('class="ph-tag"', 'class="ph-tag" data-chef-tip="' + chefTipPool.replace(/"/g, '&quot;').replace(/\n/g, '&#10;') + '"');
          }
          if (isDebutToday(n)) {
            tagEl = tagEl.replace(
              'class="ph-tag"',
              'class="ph-tag" style="border-color:#10B981 !important;background:#D1FAE5;color:#065F46;"'
            ).replace('>' + n + '<', '>🟢 ' + n + '<');
          }
        }
        return tagEl;
      }).join('');
      var countBadge = '<span style="margin-left:auto;font-size:10px;font-weight:700;color:' + headerColor + ';background:' + headerColor + '22;padding:1px 6px;border-radius:10px;">' + items.length + '</span>';
      var searchHtml = '';
      if (hasSearch && !collapsed) {
        var safeVal = (searchVal || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        searchHtml = '<div style="padding:4px 6px;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;gap:4px;background:#FAFAFA;">'
          + '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" style="flex-shrink:0;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
          + '<input type="text" class="ph-pool-search" data-pool-search="' + poolKey + '" value="' + safeVal + '" placeholder="Rechercher..." style="flex:1;min-width:0;border:none;outline:none;font-size:11px;background:transparent;color:#1E293B;">'
          + (searchVal ? '<span data-pool-search-clear="' + poolKey + '" style="cursor:pointer;color:#94A3B8;font-size:12px;line-height:1;flex-shrink:0;padding:0 2px;">✕</span>' : '')
          + '</div>';
      }
      return '<div class="ph-pool-card">'
        + '<div data-pool-toggle="' + poolKey + '" style="padding:6px 10px;background:' + headerBg + ';border-bottom:1px solid #E2E8F0;font-size:11px;font-weight:700;color:' + headerColor + ';flex-shrink:0;display:flex;align-items:center;gap:4px;cursor:pointer;">' + headerLabel + countBadge + chevronSvg(collapsed) + '</div>'
        + (collapsed ? '' : searchHtml + '<div class="ph-pool-drop" style="flex:1;overflow-y:auto;padding:6px 8px;display:flex;flex-wrap:wrap;gap:3px;align-content:flex-start;" data-pool-key="' + poolKey + '">' + tagsHtml + '</div>')
        + '</div>';
    }

    function escHtml(s) {
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // Cell véhicule avec ligne conducteur
    function vehicleCellHtml(items, zone, rowId, conducteur) {
      var base = dropZoneHtml(items, C.vehicule.main, C.vehicule.bg, LABELS.noVehicule, 0, C.vehicule.main, zone, 'vehicule', rowId);
      if (!items || !items.length) return base;
      var condName = conducteur ? conducteur.name : null;
      var condLine = '<div class="ph-conduc-line" data-cond-zone="' + zone + '" data-cond-row="' + rowId + '">'
        + EMOJIS.conducteur + ' <span class="' + (condName ? 'ph-conduc-name' : 'ph-conduc-name ph-conduc-none') + '">'
        + (condName ? escHtml(condName) : '—')
        + '</span>'
        + '<span class="ph-conduc-edit" data-cond-edit-zone="' + zone + '" data-cond-edit-row="' + rowId + '" title="Changer le conducteur">✎</span>'
        + '</div>';
      return base.slice(0, -6) + condLine + '</div>';
    }

    // Retourne les lignes padées jusqu'au minimum
    function padRows(rows, zone) {
      var min = MIN_ROWS[zone] !== undefined ? MIN_ROWS[zone] : 0;
      var result = rows.slice();
      var empty = emptyRow(zone);
      while (result.length < min) result.push(empty());
      return result;
    }

    function emptyRow(zone) {
      return function() {
        if (zone === 'chantier')  return { chantiers:[], equipiers:[], vehicules:[], commentaire:'' };
        if (zone === 'transport') return { chantiers:[], equipiers:[], vehicule:null, commentaire:'' };
        if (zone === 'atelier')   return { poste:'', chantiers:[], equipiers:[], commentaire:'' };
        if (zone === 'bureau')    return { equipiers:[], vehicule:null, commentaire:'' };
        return {};
      };
    }

    // ---- ZONE CHANTIER ----
    function buildChantierZone() {
      var cols = [
        { key:'chantiers',   label:LABELS.cols.chantiers,   color:C.chantier.main, gtc:COL_W.chantiers + 'fr' },
        { key:'equipier',    label:LABELS.cols.equipier,    color:C.equipier.main, gtc:COL_W.equipier  + 'fr' },
        { key:'vehicule',    label:LABELS.cols.vehicule,    color:C.vehicule.main, gtc:COL_W.vehicule  + 'fr' },
        { key:'commentaire', label:LABELS.cols.commentaire, color:'#94A3B8',       gtc:COL_W.commentaire },
        { key:'delete',      label:'',                      color:'transparent',   gtc:'20px' },
      ];
      var rows = padRows(s.rows.chantier, 'chantier').map(function(r, i) {
        return '<div style="display:contents;">'
          + dropZoneHtml(r.chantiers,  C.chantier.main, C.chantier.bg, LABELS.noChantier, 0, C.chantier.main, 'chantier', 'chantiers', i)
          + dropZoneHtml(r.equipiers,  C.equipier.main, C.equipier.bg, LABELS.noEquipier, 0, C.equipier.main, 'chantier', 'equipier',  i)
          + vehicleCellHtml(r.vehicules, 'chantier', i, r.conducteur)
          + commentHtml(r.commentaire, 'chantier', i)
          + deleteCell('chantier', i)
          + '</div>';
      }).join('');
      var chCount = s.rows.chantier.filter(function(r) {
        return (r.chantiers&&r.chantiers.length)||(r.equipiers&&r.equipiers.length)||(r.vehicules&&r.vehicules.length)||r.commentaire;
      }).length;
      var preRemplirBtn = '';
      return '<div class="ph-zone-card" style="border-left-color:' + C.chantier.main + ';">'
        + sectionHeaderHtml(LABELS.zones.chantier, C.chantier.main, C.chantier.bg, 'chantier', true, chCount, preRemplirBtn)
        + zoneGridHtml(cols, rows)
        + addBtnHtml('chantier')
        + '</div>';
    }

    // ---- ZONE TRANSPORT ----
    function buildTransportZone() {
      var cols = [
        { key:'chantiers',   label:LABELS.cols.chantiers,   color:C.chantier.main,  gtc:COL_W.chantiers + 'fr' },
        { key:'equipier',    label:LABELS.cols.equipier,    color:C.equipier.main,  gtc:COL_W.equipier  + 'fr' },
        { key:'vehicule',    label:LABELS.cols.vehicule,    color:C.vehicule.main,  gtc:COL_W.vehicule  + 'fr' },
        { key:'commentaire', label:LABELS.cols.commentaire, color:'#94A3B8',        gtc:COL_W.commentaire },
        { key:'delete',      label:'',                      color:'transparent',    gtc:'20px' },
      ];
      var rows = padRows(s.rows.transport, 'transport').map(function(r, i) {
        return '<div style="display:contents;">'
          + dropZoneHtml(r.chantiers,                  C.chantier.main, C.chantier.bg, LABELS.noChantier, 0, C.chantier.main, 'transport', 'chantiers', i)
          + dropZoneHtml(r.equipiers||[],              C.equipier.main, C.equipier.bg, LABELS.noEquipier, 0, C.equipier.main, 'transport', 'equipier',  i)
          + vehicleCellHtml(r.vehicule ? [r.vehicule] : [], 'transport', i, r.conducteur)
          + commentHtml(r.commentaire, 'transport', i)
          + deleteCell('transport', i)
          + '</div>';
      }).join('');
      return '<div class="ph-zone-card" style="border-left-color:' + C.transport.main + ';">'
        + sectionHeaderHtml(LABELS.zones.transport, C.transport.main, C.transport.bg, 'transport', true)
        + zoneGridHtml(cols, rows)
        + addBtnHtml('transport')
        + '</div>';
    }

    // ---- ZONE ATELIER ----
    function buildAtelierZone() {
      var cols = [
        { key:'poste',       label:LABELS.cols.poste,       color:'#64748B',        gtc:COL_W.poste },
        { key:'chantiers',   label:LABELS.cols.chantiers,   color:C.chantier.main,  gtc:COL_W.chantiers + 'fr' },
        { key:'equipier',    label:LABELS.cols.equipier,    color:C.equipier.main,  gtc:COL_W.equipier  + 'fr' },
        { key:'commentaire', label:LABELS.cols.commentaire, color:'#94A3B8',        gtc:COL_W.commentaire },
        { key:'delete',      label:'',                      color:'transparent',    gtc:'20px' },
      ];
      var rows = padRows(s.rows.atelier, 'atelier').map(function(r, i) {
        var pc = POSTE_COLORS[r.poste] || C.atelier;
        var dynamicPostes = instance.data.postes || POSTES;
        var opts = dynamicPostes.map(function(p) {
          var sel = p === r.poste;
          return '<div class="ph-poste-opt' + (sel ? ' ph-poste-opt-sel' : '') + '" data-poste-val="' + p + '" data-poste-row="' + i + '" style="padding:5px 10px;font-size:11px;font-weight:' + (sel ? '700' : '500') + ';color:' + (POSTE_COLORS[p] || C.atelier).main + ';background:' + (sel ? (POSTE_COLORS[p] || C.atelier).bg : '#FFFFFF') + ';cursor:pointer;white-space:nowrap;">' + p + '</div>';
        }).join('');
        var posteLabel = r.poste || '—';
        return '<div style="display:contents;">'
          + '<div class="ph-poste-cell" style="background:' + pc.bg + '55;">'
          + '<div class="ph-poste-trigger" data-poste-row="' + i + '" style="display:flex;align-items:center;justify-content:space-between;width:100%;cursor:pointer;gap:4px;">'
          + '<span style="font-size:11px;font-weight:600;color:' + pc.main + ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + posteLabel + '</span>'
          + '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="' + pc.main + '" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>'
          + '</div>'
          + '<div class="ph-poste-menu" data-poste-row="' + i + '" style="display:none;position:fixed;z-index:9999;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.12);min-width:130px;overflow:hidden;">' + opts + '</div>'
          + '</div>'
          + dropZoneHtml(r.chantiers,   C.chantier.main, C.chantier.bg, LABELS.noChantier, 0, C.chantier.main, 'atelier', 'chantiers', i)
          + dropZoneHtml(r.equipiers||[], C.equipier.main, C.equipier.bg, LABELS.noEquipier, 0, C.equipier.main, 'atelier', 'equipier',  i)
          + commentHtml(r.commentaire, 'atelier', i)
          + deleteCell('atelier', i)
          + '</div>';
      }).join('');
      return '<div class="ph-zone-card" style="border-left-color:' + C.atelier.main + ';">'
        + sectionHeaderHtml(LABELS.zones.atelier, C.atelier.main, C.atelier.bg, 'atelier', true)
        + zoneGridHtml(cols, rows)
        + addBtnHtml('atelier')
        + '</div>';
    }

    // ---- ZONE BUREAU ----
    function buildBureauZone() {
      var cols = [
        { key:'equipier',    label:LABELS.cols.equipier,    color:C.equipier.main, gtc:'1fr' },
        { key:'vehicule',    label:LABELS.cols.vehicule,    color:C.vehicule.main, gtc:'1fr' },
        { key:'commentaire', label:LABELS.cols.commentaire, color:'#94A3B8',       gtc:'1fr' },
        { key:'delete',      label:'',                      color:'transparent',   gtc:'20px' },
      ];
      var rows = padRows(s.rows.bureau, 'bureau').map(function(r, i) {
        return '<div style="display:contents;">'
          + dropZoneHtml(r.equipiers||[], C.bureau.main, C.bureau.bg, LABELS.noEquipier, 0, C.bureau.main, 'bureau', 'equipier', i)
          + vehicleCellHtml(r.vehicule ? [r.vehicule] : [], 'bureau', i, r.conducteur || null)
          + commentHtml(r.commentaire, 'bureau', i)
          + deleteCell('bureau', i)
          + '</div>';
      }).join('');
      return '<div class="ph-zone-card" style="border-left-color:' + C.bureau.main + ';">'
        + sectionHeaderHtml(LABELS.zones.bureau, C.bureau.main, C.bureau.bg, 'bureau', true)
        + zoneGridHtml(cols, rows)
        + addBtnHtml('bureau')
        + '</div>';
    }

    // ---- ZONE ABSENCES ----
    function buildAbsenceZone() {
      var motifs = Object.keys(s.absences);
      if (!motifs.length) return '';
      var cols = motifs.map(function(m) {
        return { key: m, label: escHtml(m), color: C.absence.main, gtc: '1fr' };
      });
      var dataRow = '<div style="display:contents;">'
        + motifs.map(function(m) {
            var eqs = s.absences[m] || [];
            var items = eqs.map(function(n) { return { name: n, type: 'equipier' }; });
            return dropZoneHtml(items, C.absence.main, C.absence.bg, '—', 0, C.absence.main, 'absence', 'equipier', m);
          }).join('')
        + '</div>';
      return '<div style="border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;">'
        + sectionHeaderHtml(LABELS.zones.absence, C.absence.main, C.absence.bg, 'absence', false)
        + zoneGridHtml(cols, dataRow)
        + '</div>';
    }

    // ---- POOL ÉQUIPES + VÉHICULES (zone chantier) ----
    function buildChantierPools() {
      var pc = s.pools.chantiers;

      var collVehicules = !!instance.data.collapsedPools['vehicules'];

      var equipes = poolCardHtml(LABELS.pools.equipiers, C.equipier.main, C.equipier.bg, s.pools.equipiers, 'equipier', C.equipier.main, C.equipier.bg, 'equipiers', instance.data.equipierSearch || '');
      var soustraitants = poolCardHtml(LABELS.pools.soustraitants, C.soustraitant.main, C.soustraitant.bg, s.pools.soustraitants, 'soustraitant', C.soustraitant.main, C.soustraitant.bg, 'soustraitants');

      var vehicules = '<div style="border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;background:#FFFFFF;display:flex;flex-direction:column;">'
        + '<div data-pool-toggle="vehicules" style="padding:7px 12px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;font-size:11px;font-weight:700;color:' + C.vehicule.main + ';flex-shrink:0;display:flex;align-items:center;gap:4px;cursor:pointer;">🚛 Véhicules<span style="margin-left:auto;font-size:10px;font-weight:700;color:' + C.vehicule.main + ';background:' + C.vehicule.main + '22;padding:1px 6px;border-radius:10px;">' + s.pools.vehicules.length + '</span>' + chevronSvg(collVehicules) + '</div>'
        + (collVehicules ? '' : '<div class="ph-pool-drop" style="flex:1;overflow-y:auto;padding:6px 8px;display:flex;flex-wrap:wrap;gap:3px;align-content:flex-start;" data-pool-key="vehicules">'
          + s.pools.vehicules.map(function(v) { return poolTag(v, 'vehicule', C.vehicule.main, C.vehicule.bg, 'vehicules'); }).join('')
          + '</div>')
        + '</div>';

      var chantierPool = poolCardHtml(LABELS.pools.chantier, C.chantier.main, C.chantier.bg, pc.chantier, 'chantier', C.chantier.main, C.chantier.bg, 'chantier');

      return '<div style="width:' + POOL_W + ';min-width:' + POOL_W + ';flex-shrink:0;display:flex;flex-direction:column;gap:8px;position:sticky;top:0;align-self:flex-start;max-height:calc(100vh - 60px);overflow-y:auto;">'
        + chantierPool + vehicules + soustraitants + equipes
        + '</div>';
    }

    // ---- POOL BUREAU ----
    function buildBureauPool() {
      return '<div style="width:' + POOL_W + ';min-width:' + POOL_W + ';flex-shrink:0;"></div>';
    }

    var _transportTypeSet = {};
    (instance.data.atelierTransportTypes || []).forEach(function(t) { _transportTypeSet[t] = true; });
    function isTransportAtelierType(t) { return !!_transportTypeSet[t]; }

    // ---- POOLS ATELIER ----
    function buildAtelierPools() {
      var types = (instance.data.atelierTypes || []).filter(function(t) { return !isTransportAtelierType(t); });
      var cards = types.map(function(t) {
        var names = s.pools.chantiers[t] || [];
        return poolCardHtml(t, C.atelier.main, C.atelier.bg, names, 'chantier', C.atelier.main, C.atelier.bg, t);
      }).join('');
      return '<div style="width:' + POOL_W + ';min-width:' + POOL_W + ';flex-shrink:0;display:flex;flex-direction:column;gap:8px;position:sticky;top:0;align-self:flex-start;max-height:calc(100vh - 60px);overflow-y:auto;">'
        + cards
        + '</div>';
    }

    // ---- DATE HEADER ----
    var days   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
    var months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
    var d = s.date;
    var dateStr = days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();

    var transportAtelierTypes = (instance.data.atelierTypes || []).filter(isTransportAtelierType);
    var transportAtelierCards = transportAtelierTypes.map(function(t) {
      var names = s.pools.chantiers[t] || [];
      return poolCardHtml(t, C.transport.main, C.transport.bg, names, 'chantier', C.transport.main, C.transport.bg, t);
    }).join('');
    var transportPool = '<div style="width:' + POOL_W + ';min-width:' + POOL_W + ';flex-shrink:0;">'
      + (transportAtelierCards || '')
      + '</div>';

    cnt.innerHTML = '<div class="' + ID + '"><div class="ph-wrap">'

      // DATE HEADER — aligné sur la zone gauche uniquement (pas le panneau pools)
      + '<div style="display:flex;gap:8px;align-items:flex-start;position:sticky;top:0;z-index:10;">'
      + '<div style="flex:1;min-width:0;' + (s.isOff ? 'background:#FFF7ED;border:1px solid #FED7AA;' : 'background:#FFFFFF;border:1px solid #E2E8F0;') + 'border-radius:8px;padding:8px 16px;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">'
      + '<div class="ph-icon-btn ph-date-prev">&#x2039;</div>'
      + '<span class="ph-date-label" style="font-size:18px;font-weight:800;color:#1E293B;margin:0 4px;letter-spacing:-0.3px;">' + dateStr + '</span>'
      + (s.isOff ? '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:5px;background:#FFEDD5;border:1px solid #FED7AA;font-size:10px;font-weight:700;letter-spacing:0.06em;color:#EA580C;text-transform:uppercase;">&#x26D4; Jour off</span>' : '')
      + '<div class="ph-icon-btn ph-date-next">&#x203A;</div>'
      + (function() {
            var today = new Date(); today.setHours(0,0,0,0);
            var cur = new Date(d); cur.setHours(0,0,0,0);
            var isToday = cur.getTime() === today.getTime();
            return '<div class="ph-today-btn" style="visibility:' + (isToday ? 'hidden' : 'visible') + ';margin-left:4px;">' + LABELS.today + '</div>';
          }())
      + '<div style="margin-left:auto;display:flex;gap:6px;flex-shrink:0;">'
      + '<div class="ph-icon-btn ph-copy-global" title="' + LABELS.copyGlobal + '"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>'
      + (function() {
            var allClosed = ALL_POOL_KEYS.every(function(k) { return instance.data.collapsedPools[k]; });
            var title = allClosed ? 'Ouvrir tous les pools' : 'Fermer tous les pools';
            var icon = allClosed
              ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/><line x1="12" y1="3" x2="12" y2="15"/></svg>'
              : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/><line x1="12" y1="21" x2="12" y2="9"/></svg>';
            return '<div class="ph-icon-btn ph-pools-toggle" title="' + title + '">' + icon + '</div>';
          }())
      + '<div class="ph-icon-btn ph-print" title="' + LABELS.print + '"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg></div>'
      + '</div>'
      + '</div>'
      + '<div style="width:' + POOL_W + ';min-width:' + POOL_W + ';flex-shrink:0;"></div>'
      + '</div>'

      // ZONES
      + '<div class="ph-zone-row">' + buildChantierZone()  + buildChantierPools() + '</div>'
      + '<div class="ph-zone-row">' + buildTransportZone() + transportPool        + '</div>'
      + '<div class="ph-zone-row">' + buildAtelierZone()   + buildAtelierPools()  + '</div>'
      + '<div class="ph-zone-row">' + buildBureauZone() + buildBureauPool() + '</div>'
      + buildAbsenceZone()

      + '</div></div>';

    var newWrap = cnt.querySelector('.ph-wrap');
    if (newWrap && savedScroll) newWrap.scrollTop = savedScroll;

    // Restaurer le picker si update.js a déclenché un re-render
    if (savedPickerState) {
      var sel = '[data-dz-col="' + savedPickerState.col + '"][data-dz-zone="' + savedPickerState.zone + '"][data-dz-row="' + savedPickerState.rowId + '"]';
      var dzEl = cnt.querySelector(sel);
      if (dzEl) {
        if (savedPickerState.col === 'chantiers') showChantierPicker(dzEl);
        else if (savedPickerState.col === 'equipier') showEquipierPicker(dzEl);
        else if (savedPickerState.col === 'vehicule') showVehiculePicker(dzEl);
      }
    }
  }

  // ============================================================
  // DISPLAY MODE
  // ============================================================
  function renderDisplay() {
    var s   = instance.data.state;
    var cnt = instance.data.container;

    var days   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
    var months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
    var d = s.date;
    var dateStr = days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();

    function esc(v) {
      return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // Compte le nb de lignes (toutes zones) où chaque equipier/STT apparaît
    var multiMap = {};
    var allZoneRows = [].concat(s.rows.chantier, s.rows.transport, s.rows.atelier, s.rows.bureau);
    allZoneRows.forEach(function(r) {
      (r.equipiers || []).forEach(function(e) {
        multiMap[e.name] = (multiMap[e.name] || 0) + 1;
      });
    });

    function multiSuffix(name) {
      var n = multiMap[name] || 0;
      return n > 1 ? '<sup style="display:inline-flex;align-items:center;justify-content:center;min-width:14px;height:14px;padding:0 3px;border-radius:7px;background:#F59E0B;color:#fff;font-size:9px;font-weight:800;line-height:1;vertical-align:super;margin-left:2px;box-sizing:border-box;">' + n + '</sup>' : '';
    }

    function dvTag(name, colorMain, colorBg) {
      return '<span class="ph-dv-tag" style="color:' + colorMain + ';background:' + colorBg + ';border-color:' + colorMain + '44;">' + esc(name) + multiSuffix(name) + '</span>';
    }
    function dvTagWithComment(name, colorMain, colorBg, comment) {
      if (!comment) return dvTag(name, colorMain, colorBg);
      return '<span class="ph-dv-tag ph-dv-tag-com" style="color:' + colorMain + ';background:' + colorBg + ';border-color:' + colorMain + '44;">'
        + '<span>' + esc(name) + multiSuffix(name) + '</span>'
        + '<span class="ph-dv-tag-sub" style="color:#1E293B;"><span style="font-weight:700;">Commentaire · </span>' + esc(comment) + '</span>'
        + '</span>';
    }

    // ── Chantier : 1 card par ligne ──────────────────────────────
    var chRowsFiltered = s.rows.chantier.filter(function(r) {
      return (r.chantiers&&r.chantiers.length)||(r.equipiers&&r.equipiers.length)||(r.vehicules&&r.vehicules.length)||r.commentaire;
    }).sort(function(a, b) {
      var ordreMap = instance.data.vehiculeOrdreMap || {};
      var vA = a.vehicules && a.vehicules[0] ? a.vehicules[0].name : null;
      var vB = b.vehicules && b.vehicules[0] ? b.vehicules[0].name : null;
      var pA = parseInt(vA, 10); var oA = vA ? (ordreMap[vA] !== undefined ? ordreMap[vA] : (isNaN(pA) ? Infinity : pA)) : Infinity;
      var pB = parseInt(vB, 10); var oB = vB ? (ordreMap[vB] !== undefined ? ordreMap[vB] : (isNaN(pB) ? Infinity : pB)) : Infinity;
      return oA - oB;
    });
    var TV_CHANTIER_COLOR = '#92400E';
    var TV_CHANTIER_BG    = '#FFFBEB';

    var chCards = chRowsFiltered.map(function(r) {
      var tvMap      = instance.data.chantierTvNameMap || {};
      var parentMap  = instance.data.chantierParentMap || {};
      var chHd = (r.chantiers||[]).map(function(c) {
        var label      = tvMap[c.name] || c.name;
        var parentName = parentMap[c.name];
        if (parentName) {
          return '<span style="display:inline-flex;flex-direction:column;background:' + TV_CHANTIER_BG + ';color:' + TV_CHANTIER_COLOR + ';border:1px solid ' + TV_CHANTIER_COLOR + '33;border-radius:4px;padding:2px 7px;line-height:1.3;">'
            + '<span style="font-size:0.75em;opacity:0.7;font-weight:600;">' + esc(parentName) + '</span>'
            + '<span>' + esc(label) + '</span>'
            + '</span>';
        }
        return dvTag(label, TV_CHANTIER_COLOR, TV_CHANTIER_BG);
      }).join(' ');

      var equipList    = r.equipiers || [];
      var equipiers    = equipList.filter(function(e) { return e.type !== 'soustraitant'; });
      var soustraitants = equipList.filter(function(e) { return e.type === 'soustraitant'; });

      var vehName  = r.vehicules && r.vehicules[0] ? r.vehicules[0].name : null;
      var condName = r.conducteur ? r.conducteur.name : null;
      var numInterne2 = vehName ? ((instance.data.vehiculeNumInterneMap || {})[vehName] || null) : null;
      var isLoc = vehName && instance.data.vehiculeLocMap && instance.data.vehiculeLocMap[vehName];
      var locPrefix = isLoc ? '(L) - ' : '';
      var vehDisplayHtml;
      if (vehName) {
        vehDisplayHtml = numInterne2
          ? locPrefix + esc(numInterne2) + (condName ? ' - ' + esc(condName) : '')
          : locPrefix + esc(vehName);
      }
      var vehSec = vehName
        ? '<div class="ph-tv-ch-card-sec ph-tv-ch-card-sec-veh">'
          + '<span class="ph-tv-ch-card-lbl">' + LABELS.emojis.vehicule + '</span>'
          + '<span class="ph-tv-ch-veh-name">' + vehDisplayHtml + '</span>'
          + '</div>' : '';

      var allEquipe = equipiers.concat(soustraitants);
      var equipSec = allEquipe.length
        ? '<div class="ph-tv-ch-card-sec ph-tv-ch-card-sec-equipe">'
          + '<span class="ph-tv-ch-card-lbl">' + LABELS.emojis.equipier + '</span>'
          + '<div class="ph-tv-ch-card-tags">'
          + equipiers.map(function(e) { return dvTag(e.name, C.equipier.main, C.equipier.bg); }).join(' ')
          + soustraitants.map(function(e) { return dvTag(e.name, C.soustraitant.main, C.soustraitant.bg); }).join(' ')
          + '</div></div>' : '';

      var commentSec = r.commentaire
        ? '<div class="ph-tv-ch-card-sec ph-tv-ch-card-sec-comment">'
          + '<span class="ph-tv-ch-card-lbl">💬</span>'
          + '<span class="ph-tv-ch-card-comment">' + esc(r.commentaire) + '</span>'
          + '</div>' : '';

      return '<div class="ph-tv-ch-card">'
        + vehSec
        + '<div class="ph-tv-ch-card-hd">' + (chHd || '<span style="color:#94A3B8;font-style:italic;">Sans chantier</span>') + '</div>'
        + '<div class="ph-tv-ch-card-body">' + equipSec + commentSec + '</div>'
        + '</div>';
    }).join('');

    // ── Compact zones (transport, atelier, bureau) ───────────────
    function cptRow(r, zone) {
      var chantierObjs = r.chantiers || [];
      var equipList   = r.equipiers || [];
      var equipiers   = equipList.filter(function(e) { return e.type !== 'soustraitant'; }).map(function(e) { return e.name; });
      var stts        = equipList.filter(function(e) { return e.type === 'soustraitant'; }).map(function(e) { return e.name; });
      var vehName     = (zone === 'transport' || zone === 'bureau') ? (r.vehicule ? r.vehicule.name : '') : '';
      var poste       = zone === 'atelier' ? (r.poste || '') : '';

      var parts = [];
      if (poste)            parts.push('<span class="ph-tv-cpt-poste">' + esc(poste) + '</span>');
      var tvMap2 = instance.data.chantierTvNameMap || {};
      if (chantierObjs.length) {
        var atelComMapTV = (zone === 'atelier' || zone === 'transport') ? (instance.data.atelierChantierCommentMap || {}) : {};
        parts.push(chantierObjs.map(function(c) {
          var posteToPool = instance.data.posteToPool || {};
          var typeKey = zone === 'atelier' ? (posteToPool[poste] || poste) : (c.origPool || '');
          var typeMapTV = atelComMapTV[typeKey];
          var com = typeMapTV ? (typeMapTV[c.name] || null) : null;
          return dvTagWithComment(tvMap2[c.name] || c.name, TV_CHANTIER_COLOR, TV_CHANTIER_BG, com);
        }).join(' '));
      }
      if (vehName) {
        var condNameCpt  = r.conducteur ? r.conducteur.name : null;
        var numIntCpt    = (instance.data.vehiculeNumInterneMap || {})[vehName] || null;
        var isLocCpt     = instance.data.vehiculeLocMap && instance.data.vehiculeLocMap[vehName];
        var locPrefixCpt = isLocCpt ? '(L) - ' : '';
        var vehLabelCpt  = numIntCpt
          ? locPrefixCpt + esc(numIntCpt) + (condNameCpt ? ' - ' + esc(condNameCpt) : '')
          : locPrefixCpt + esc(vehName);
        parts.push('<span class="ph-tv-cpt-veh">' + EMOJIS.vehicule + ' ' + vehLabelCpt + '</span>');
      }
      if (equipiers.length) parts.push(equipiers.map(function(n) { return dvTag(n, C.equipier.main, C.equipier.bg); }).join(' '));
      if (stts.length)      parts.push(stts.map(function(n) { return dvTag(n, C.soustraitant.main, C.soustraitant.bg); }).join(' '));
      if (r.commentaire) parts.push('<span class="ph-tv-cpt-comment">💬 ' + esc(r.commentaire) + '</span>');

      if (!parts.length) return '';
      return '<div class="ph-tv-cpt-row">' + parts.join('<span class="ph-tv-cpt-sep">&nbsp;&nbsp;&nbsp;</span>') + '</div>';
    }

    function cptZone(label, color, rows, zone) {
      var body = rows.map(function(r) { return cptRow(r, zone); }).filter(Boolean).join('');
      if (!body) return '';
      return '<div class="ph-tv-cpt-zone">'
        + '<div class="ph-tv-cpt-zone-hd" style="border-left-color:' + color + ';color:' + color + ';">' + label + '</div>'
        + body + '</div>';
    }

    var trHtml = cptZone(LABELS.zones.transport, C.transport.main, s.rows.transport, 'transport');
    var atHtml = cptZone(LABELS.zones.atelier,   C.atelier.main,   s.rows.atelier,   'atelier');
    var buHtml = cptZone(LABELS.zones.bureau,     C.bureau.main,    s.rows.bureau,    'bureau');

    // ── Absences ─────────────────────────────────────────────────
    var abMotifs = Object.keys(s.absences).filter(function(m) { return s.absences[m] && s.absences[m].length; });
    var abHtml = '';
    if (abMotifs.length) {
      abHtml = '<div class="ph-tv-cpt-zone ph-tv-cpt-zone-abs">'
        + '<div class="ph-tv-cpt-zone-hd" style="border-left-color:' + C.absence.main + ';color:' + C.absence.main + ';">' + LABELS.zones.absence + '</div>'
        + '<div class="ph-tv-abs-cols">'
        + abMotifs.map(function(m) {
            return '<div class="ph-tv-abs-col">'
              + '<div class="ph-tv-abs-motif" style="color:' + C.absence.main + ';">' + esc(m) + '</div>'
              + '<div class="ph-tv-abs-tags" style="display:flex;flex-wrap:wrap;gap:4px;">' + (s.absences[m]||[]).map(function(n) { return dvTag(n, C.absence.main, C.absence.bg); }).join('') + '</div>'
              + '</div>';
          }).join('')
        + '</div></div>';
    }

    var bottomHtml = (trHtml || atHtml || buHtml || abHtml)
      ? '<div class="ph-tv-bottom">' + trHtml + atHtml + buHtml + abHtml + '</div>'
      : '';

    cnt.innerHTML = '<div class="' + ID + ' ph-display">'
      + '<div class="ph-dv-wrap">'
      + '<div class="ph-dv-date">' + dateStr + '</div>'
      + '<div class="ph-tv-ch-section">'
      + '<div class="ph-tv-ch-section-hd" style="color:' + TV_CHANTIER_COLOR + ';border-left-color:' + TV_CHANTIER_COLOR + ';display:flex;align-items:center;gap:8px;">' + LABELS.zones.chantier + '<span style="font-size:11px;font-weight:700;background:' + TV_CHANTIER_COLOR + '22;color:' + TV_CHANTIER_COLOR + ';border-radius:10px;padding:1px 8px;">' + chRowsFiltered.length + '</span></div>'
      + (chCards ? '<div class="ph-tv-ch-grid">' + chCards + '</div>' : '<div class="ph-tv-empty">Aucun chantier planifié</div>')
      + '</div>'
      + bottomHtml
      + '</div></div>';
  }

  // ============================================================
  // CALENDRIER & POPOVER DUPLIQUER
  // ============================================================

  var DAYS_SHORT   = ['Lu','Ma','Me','Je','Ve','Sa','Di'];
  var MONTHS_LONG  = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  var MONTHS_SHORT = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];

  function calHtml(year, month, selectedTs) {
    var first = new Date(year, month, 1).getDay();
    first = (first + 6) % 7; // lundi = 0
    var total = new Date(year, month + 1, 0).getDate();
    var today = new Date(); today.setHours(0,0,0,0);
    var rows = '<div class="ph-cal-header">'
      + '<button class="ph-cal-nav" data-cal-dir="-1">&#x2039;</button>'
      + '<span class="ph-cal-month">' + MONTHS_LONG[month] + ' ' + year + '</span>'
      + '<button class="ph-cal-nav" data-cal-dir="1">&#x203A;</button>'
      + '</div><div class="ph-cal-grid">';
    DAYS_SHORT.forEach(function(d) { rows += '<div class="ph-cal-dow">' + d + '</div>'; });
    for (var i = 0; i < first; i++) rows += '<div></div>';
    for (var day = 1; day <= total; day++) {
      var dt = new Date(year, month, day); dt.setHours(0,0,0,0);
      var cls = 'ph-cal-day';
      if (dt.getTime() === today.getTime())   cls += ' ph-cal-today';
      if (selectedTs && dt.getTime() === selectedTs) cls += ' ph-cal-selected';
      rows += '<div class="' + cls + '" data-cal-y="' + year + '" data-cal-m="' + month + '" data-cal-d="' + day + '">' + day + '</div>';
    }
    return rows + '</div>'
      + '<div class="ph-cal-foot"><button class="ph-cal-today-btn" data-cal-goto-today>Aujourd\'hui</button></div>';
  }

  function closeCal() {
    if (instance.data.activeCal) {
      if (instance.data.activeCal.parentNode) instance.data.activeCal.parentNode.removeChild(instance.data.activeCal);
      instance.data.activeCal = null;
    }
    if (instance.data.calOutside) {
      document.removeEventListener('mousedown', instance.data.calOutside);
      instance.data.calOutside = null;
    }
    if (instance.data.calEsc) {
      document.removeEventListener('keydown', instance.data.calEsc);
      instance.data.calEsc = null;
    }
    if (instance.data.calScroll) {
      instance.data.container.removeEventListener('scroll', instance.data.calScroll, true);
      instance.data.calScroll = null;
    }
    closeCopyPopover();
  }

  function closeCopyPopover() {
    if (instance.data.activePopover) {
      if (instance.data.activePopover.parentNode) instance.data.activePopover.parentNode.removeChild(instance.data.activePopover);
      instance.data.activePopover = null;
    }
    if (instance.data.popOutside) {
      document.removeEventListener('mousedown', instance.data.popOutside);
      instance.data.popOutside = null;
    }
    if (instance.data.popEsc) {
      document.removeEventListener('keydown', instance.data.popEsc);
      instance.data.popEsc = null;
    }
    if (instance.data.popScroll) {
      instance.data.container.removeEventListener('scroll', instance.data.popScroll, true);
      instance.data.popScroll = null;
    }
  }

  function positionEl(el, anchor) {
    var r  = anchor.getBoundingClientRect();
    // offsetWidth/Height force un reflow → dimensions réelles
    var ew = el.offsetWidth  || 280;
    var eh = el.offsetHeight || 340;
    var left = r.left;
    var top  = r.bottom + 6;
    // Débordement droit
    if (left + ew > window.innerWidth - 8)  left = Math.max(8, window.innerWidth - ew - 8);
    // Débordement bas → ouvrir au-dessus
    if (top  + eh > window.innerHeight - 8) top  = Math.max(8, r.top - 6 - eh);
    el.style.left = left + 'px';
    el.style.top  = top  + 'px';
  }

  // Ouvre un mini calendrier ancré sur `anchor`.
  // `onSelect(date)` est appelé avec la Date choisie.
  // `selectedDate` (optionnel) : Date pré-sélectionnée.
  function openCalPicker(anchor, onSelect, selectedDate) {
    closeCal();
    var now = selectedDate || instance.data.state.date || new Date();
    var curYear  = now.getFullYear();
    var curMonth = now.getMonth();
    var selTs    = selectedDate ? selectedDate.getTime() : null;

    var el = document.createElement('div');
    el.className = 'ph-cal';
    el.innerHTML = calHtml(curYear, curMonth, selTs);
    document.body.appendChild(el);
    positionEl(el, anchor);
    instance.data.activeCal = el;

    el.addEventListener('click', function(e) {
      // Navigation mois
      var nav = e.target.closest('[data-cal-dir]');
      if (nav) {
        curMonth += parseInt(nav.dataset.calDir, 10);
        if (curMonth > 11) { curMonth = 0; curYear++; }
        if (curMonth < 0)  { curMonth = 11; curYear--; }
        el.innerHTML = calHtml(curYear, curMonth, selTs);
        return;
      }
      // Bouton "Aujourd'hui"
      if (e.target.closest('[data-cal-goto-today]')) {
        var t = new Date(); t.setHours(0,0,0,0);
        curYear = t.getFullYear(); curMonth = t.getMonth();
        selTs = t.getTime();
        el.innerHTML = calHtml(curYear, curMonth, selTs);
        return;
      }
      // Sélection jour
      var day = e.target.closest('[data-cal-d]');
      if (day) {
        var chosen = new Date(parseInt(day.dataset.calY,10), parseInt(day.dataset.calM,10), parseInt(day.dataset.calD,10));
        chosen.setHours(0,0,0,0);
        // Fermer le cal AVANT onSelect pour éviter que calOutside n'intercepte le click sur le popover
        if (instance.data.calOutside) {
          document.removeEventListener('mousedown', instance.data.calOutside);
          instance.data.calOutside = null;
        }
        if (instance.data.calEsc) {
          document.removeEventListener('keydown', instance.data.calEsc);
          instance.data.calEsc = null;
        }
        if (instance.data.calScroll) {
          instance.data.container.removeEventListener('scroll', instance.data.calScroll, true);
          instance.data.calScroll = null;
        }
        if (el.parentNode) el.parentNode.removeChild(el);
        instance.data.activeCal = null;
        onSelect(chosen);
      }
    });

    instance.data.calOutside = function(ev) {
      if (!el.contains(ev.target) && ev.target !== anchor) closeCal();
    };
    instance.data.calEsc = function(ev) { if (ev.key === 'Escape') closeCal(); };
    instance.data.calScroll = function() { closeCal(); };
    setTimeout(function() {
      document.addEventListener('mousedown', instance.data.calOutside);
      document.addEventListener('keydown', instance.data.calEsc);
      instance.data.container.addEventListener('scroll', instance.data.calScroll, true);
    }, 0);
  }

  // Ouvre le popover de confirmation de duplication.
  // `chosenDate` : Date choisie dans le calendrier.
  // `onConfirm()` : callback si l'utilisateur confirme.
  function openCopyPopover(anchor, chosenDate, onConfirm) {
    closeCopyPopover();
    var days2   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
    var dateStr = days2[chosenDate.getDay()] + ' ' + chosenDate.getDate() + ' ' + MONTHS_SHORT[chosenDate.getMonth()] + ' ' + chosenDate.getFullYear();
    var body    = COPY_TEXTS.body.replace('{date}', dateStr);

    var el = document.createElement('div');
    el.className = 'ph-copy-popover';
    el.innerHTML = '<div class="ph-copy-popover-title">' + COPY_TEXTS.title + '</div>'
      + '<div class="ph-copy-popover-body">' + body + '</div>'
      + '<div class="ph-copy-popover-btns">'
      + '<button class="ph-copy-popover-cancel">' + COPY_TEXTS.cancel + '</button>'
      + '<button class="ph-copy-popover-ok">' + COPY_TEXTS.ok + '</button>'
      + '</div>';
    document.body.appendChild(el);
    positionEl(el, anchor);
    instance.data.activePopover = el;

    el.querySelector('.ph-copy-popover-ok').addEventListener('click', function() {
      closeCopyPopover();
      onConfirm();
    });
    el.querySelector('.ph-copy-popover-cancel').addEventListener('click', closeCopyPopover);

    instance.data.popOutside = function(ev) {
      if (!el.contains(ev.target)) closeCopyPopover();
    };
    instance.data.popEsc = function(ev) { if (ev.key === 'Escape') closeCopyPopover(); };
    instance.data.popScroll = function() { closeCopyPopover(); };
    setTimeout(function() {
      document.addEventListener('mousedown', instance.data.popOutside);
      document.addEventListener('keydown', instance.data.popEsc);
      instance.data.container.addEventListener('scroll', instance.data.popScroll, true);
    }, 0);
  }

  function openPreRemplirConfirm(anchor, onConfirm) {
    closeCopyPopover();
    var el = document.createElement('div');
    el.className = 'ph-copy-popover';
    el.innerHTML = '<div class="ph-copy-popover-title">⚠️ Pré-remplir depuis devant chantier</div>'
      + '<div class="ph-copy-popover-body">Cette action va écraser le planning chantier existant pour cette date. Continuer ?</div>'
      + '<div class="ph-copy-popover-btns">'
      + '<button class="ph-copy-popover-cancel">Annuler</button>'
      + '<button class="ph-copy-popover-ok">Oui, écraser</button>'
      + '</div>';
    document.body.appendChild(el);
    positionEl(el, anchor);
    instance.data.activePopover = el;

    el.querySelector('.ph-copy-popover-ok').addEventListener('click', function() {
      closeCopyPopover();
      onConfirm();
    });
    el.querySelector('.ph-copy-popover-cancel').addEventListener('click', closeCopyPopover);

    instance.data.popOutside = function(ev) { if (!el.contains(ev.target) && ev.target !== anchor) closeCopyPopover(); };
    instance.data.popEsc    = function(ev) { if (ev.key === 'Escape') closeCopyPopover(); };
    instance.data.popScroll = function() { closeCopyPopover(); };
    setTimeout(function() {
      document.addEventListener('mousedown', instance.data.popOutside);
      document.addEventListener('keydown', instance.data.popEsc);
      instance.data.container.addEventListener('scroll', instance.data.popScroll, true);
    }, 0);
  }

  // ============================================================
  // EVENTS (delegation — attachés une seule fois)
  // ============================================================
  var cnt = instance.canvas[0];
  instance.data.container = cnt;
  cnt.innerHTML = '<div class="' + ID + '"><div class="ph-loader"><div class="ph-loader-box">'
    + '<div class="ph-loader-label">Chargement du planning...</div>'
    + '<div class="ph-loader-track"><div class="ph-loader-fill"></div></div>'
    + '<div class="ph-loader-pct">0 %</div>'
    + '</div></div></div>';
  startLoaderAnim();

  // Capture le modifier au mousedown — fiable même dans un iframe Bubble
  instance.data.modifierDown = false;
  cnt.addEventListener('mousedown', function(e) {
    instance.data.modifierDown = e.altKey || e.ctrlKey;
  });

  window.addEventListener('scroll', function() {
    cnt.querySelectorAll('.ph-poste-menu').forEach(function(m) { m.style.display = 'none'; });
  }, true);

  // ---- Drag Start ----
  cnt.addEventListener('dragstart', function(e) {
    var el = e.target.closest('[data-dt]');
    if (!el) return;
    var isZoneTag = !!el.dataset.dz;
    var isDup = instance.data.modifierDown && (el.dataset.dt === 'equipier' || el.dataset.dt === 'soustraitant') && isZoneTag;
    instance.data.dragData = {
      type:        el.dataset.dt,
      name:        decodeURIComponent(el.dataset.dn),
      poolKey:     el.dataset.dp || null,
      zone:        el.dataset.dz || null,
      row:         el.dataset.dr !== undefined && el.dataset.dr !== '' ? el.dataset.dr : null,
      col:         el.dataset.dc || null,
      origPool:    el.dataset.op || null,
      isDuplicate: isDup,
    };
    e.dataTransfer.effectAllowed = isDup ? 'copy' : 'move';
    el.classList.add('dragging');
  });

  // ---- Drag End ----
  cnt.addEventListener('dragend', function(e) {
    var el = e.target.closest('[data-dt]');
    if (el) el.classList.remove('dragging');
    cnt.querySelectorAll('.dv-ok,.dv-no').forEach(function(d) { d.classList.remove('dv-ok','dv-no'); });
    cnt.querySelectorAll('.insert-before,.insert-after').forEach(function(d) { d.classList.remove('insert-before','insert-after'); });
    instance.data.dragData = null;
  });

  // ---- Drag Over ----
  cnt.addEventListener('dragover', function(e) {
    var drag = instance.data.dragData;
    if (!drag) return;

    // Autoscroll pendant le drag (fix Windows/Chrome où la molette est bloquée)
    var wrap = cnt.querySelector('.ph-wrap');
    if (wrap) {
      var wRect = wrap.getBoundingClientRect();
      var ZONE = 100, SPEED = 14;
      if (e.clientY < wRect.top + ZONE)    wrap.scrollTop -= SPEED;
      else if (e.clientY > wRect.bottom - ZONE) wrap.scrollTop += SPEED;
    }

    var hoverTag = e.target.closest('.ph-tag[data-dz]');
    if (hoverTag && !hoverTag.classList.contains('dragging')
        && hoverTag.dataset.dz === drag.zone
        && hoverTag.dataset.dc === drag.col
        && hoverTag.dataset.dr === String(drag.row)) {
      e.preventDefault();
      cnt.querySelectorAll('.insert-before,.insert-after').forEach(function(d) { d.classList.remove('insert-before','insert-after'); });
      var rect = hoverTag.getBoundingClientRect();
      var insertBefore = e.clientX < rect.left + rect.width / 2;
      hoverTag.classList.add(insertBefore ? 'insert-before' : 'insert-after');
      return;
    }

    cnt.querySelectorAll('.insert-before,.insert-after').forEach(function(d) { d.classList.remove('insert-before','insert-after'); });

    var pool = e.target.closest('[data-pool-key]');
    if (pool && !pool.closest('[data-dz-zone]')) {
      var poolOk = isPoolDropAllowed(drag, pool.dataset.poolKey);
      if (poolOk) {
        e.preventDefault();
        var poolColor = drag.type === 'vehicule' ? C.vehicule.main : drag.type === 'soustraitant' ? C.soustraitant.main : drag.type === 'chantier' ? C.chantier.main : C.equipier.main;
        pool.style.setProperty('--dv-color', poolColor);
        pool.classList.add('dv-ok');
      }
      return;
    }

    var drop = e.target.closest('[data-dz-zone]');
    if (!drop) return;
    e.preventDefault();
    var ok = isDropAllowed(drag, drop.dataset.dzZone, drop.dataset.dzCol);
    drop.classList.toggle('dv-ok', ok);
  });

  // ---- Drag Leave ----
  cnt.addEventListener('dragleave', function(e) {
    var pool = e.target.closest('[data-pool-key]');
    if (pool && !pool.contains(e.relatedTarget)) {
      pool.classList.remove('dv-ok');
    }
    var drop = e.target.closest('[data-dz-zone]');
    if (drop && !drop.contains(e.relatedTarget)) {
      drop.classList.remove('dv-ok','dv-no');
    }
    var hoverTag = e.target.closest('.ph-tag');
    if (hoverTag && !hoverTag.contains(e.relatedTarget)) {
      hoverTag.classList.remove('insert-before','insert-after');
    }
  });

  // ---- Drop ----
  cnt.addEventListener('drop', function(e) {
    var drag = instance.data.dragData;
    if (!drag) return;
    instance.data.openPickerState = null;

    // Drop sur un pool → retour au pool
    var pool = e.target.closest('[data-pool-key]');
    if (pool && !pool.closest('[data-dz-zone]') && isPoolDropAllowed(drag, pool.dataset.poolKey)) {
      e.preventDefault();
      pool.classList.remove('dv-ok');

      // Même origine → pas d'event
      if (drag.poolKey && pool.dataset.poolKey === drag.poolKey) return;

      var st = instance.data.state;
      if (drag.zone && drag.row !== null && !drag.poolKey) removeFromRow(st, drag);
      returnToPool(st, drag);
      render();

      var dropResource = instance.data.resourceMap && instance.data.resourceMap[drag.name];
      var srcRowPool = (!drag.poolKey && drag.zone && drag.zone !== 'absence') ? getRow(instance.data.state, drag.zone, drag.row) : null;
      var srcAbsPool = (drag.zone === 'absence') ? getOrCreateAbsenceRowId(drag.row) : '';
      resetStates();
      if (dropResource) instance.publishState('tag_' + dropResource.type, dropResource.obj);
      instance.publishState('source_zone',   drag.zone ? zoneLabel(drag.zone) : null);
      instance.publishState('row_id_source', srcRowPool ? (srcRowPool.rowId || '') : srcAbsPool);
      instance.triggerEvent('tag_moved');
      return;
    }

    var drop = e.target.closest('[data-dz-zone]');
    if (!drop) return;
    e.preventDefault();
    drop.classList.remove('dv-ok','dv-no');

    var targetZone = drop.dataset.dzZone;
    var targetCol  = drop.dataset.dzCol;
    var targetRow  = drop.dataset.dzRow;

    if (!isDropAllowed(drag, targetZone, targetCol)) return;

    // Même position → pas d'event
    if (!drag.poolKey && drag.zone === targetZone && String(drag.row) === String(targetRow) && drag.col === targetCol) return;

    var st = instance.data.state;

    // Réordonnancement dans la même colonne
    var hoverTag = e.target.closest('.ph-tag[data-dz]');
    if (hoverTag && !hoverTag.classList.contains('dragging')
        && drag.zone && drag.row !== null && !drag.poolKey
        && hoverTag.dataset.dz === drag.zone
        && hoverTag.dataset.dc === drag.col
        && hoverTag.dataset.dr === String(drag.row)) {
      var targetName   = decodeURIComponent(hoverTag.dataset.dn);
      var rect         = hoverTag.getBoundingClientRect();
      var insertBefore = e.clientX < rect.left + rect.width / 2;
      reorderInCol(st, drag, targetName, insertBefore);
      render();
      return;
    }

    cnt.querySelectorAll('.insert-before,.insert-after').forEach(function(d) { d.classList.remove('insert-before','insert-after'); });

    // Auto-créer la ligne si elle est fantôme (index >= lignes réelles)
    if (targetZone !== 'absence') ensureRow(st, targetZone, parseInt(targetRow));

    // Pré-vérif slot véhicule unique
    if (targetCol === 'vehicule') {
      var checkRow = getRow(st, targetZone, targetRow);
      if (checkRow) {
        var vOccupied = targetZone === 'chantier'
          ? (checkRow.vehicules && checkRow.vehicules.length > 0)
          : !!checkRow.vehicule;
        if (vOccupied) { render(); return; }
      }
    }

    // Retire de la source (sauf duplication Ctrl+drag)
    if (!drag.isDuplicate) {
      if (drag.poolKey) {
        removeFromPool(st, drag);
      } else if (drag.zone && drag.row !== null) {
        // Déplacement véhicule entre deux lignes chantier → toute la ligne suit
        if (drag.type === 'vehicule' && drag.zone === 'chantier' && targetZone === 'chantier' && targetCol === 'vehicule') {
          var srcRow = getRow(st, drag.zone, drag.row);
          if (srcRow) {
            var migratedEquipiers = srcRow.equipiers ? srcRow.equipiers.splice(0) : [];
            var migratedChantiers = srcRow.chantiers ? srcRow.chantiers.splice(0) : [];
            var migratedCommentaire = srcRow.commentaire || '';
            srcRow.commentaire = '';
            ensureRow(st, targetZone, parseInt(targetRow));
            var tgtRow = getRow(st, targetZone, targetRow);
            if (tgtRow) {
              migratedEquipiers.forEach(function(eq) {
                if (!tgtRow.equipiers.some(function(e) { return e.name === eq.name; })) tgtRow.equipiers.push(eq);
              });
              migratedChantiers.forEach(function(ch) {
                if (!tgtRow.chantiers.some(function(c) { return c.name === ch.name; })) tgtRow.chantiers.push(ch);
              });
              if (!tgtRow.commentaire) tgtRow.commentaire = migratedCommentaire;
            }
          }
        }
        removeFromRow(st, drag);
      }
    }

    // Place dans la cible
    var addResult = addToTarget(st, drag, targetZone, targetCol, targetRow);

    // Auto-poste atelier selon le pool source (écrase toujours)
    if (targetZone === 'atelier' && targetCol === 'chantiers') {
      var poolSource = drag.poolKey || drag.origPool;
      var POOL_TO_POSTE = {
        '⚙️ K2':           'K2',
        '✅ Finitions K2':  'Finition K2',
        '🏭 Fabrication':  'Fabrication'
      };
      var autoPoste = poolSource && POOL_TO_POSTE[poolSource];
      if (autoPoste) {
        var atelRow = getRow(st, 'atelier', targetRow);
        if (atelRow) atelRow.poste = autoPoste;
      }
    }

    // Capturer les refs de lignes AVANT le tri (le tri réordonne le tableau, l'index devient invalide)
    var srcRowForId = (!drag.poolKey && drag.zone && drag.zone !== 'absence') ? getRow(st, drag.zone, drag.row) : null;
    var tgtRowForId = (targetZone !== 'absence') ? getRow(st, targetZone, targetRow) : null;

    // Tri zone chantier par ordre véhicule après chaque drop
    if (targetZone === 'chantier' || drag.zone === 'chantier') sortChantierRows(st);

    if (drag.poolKey === 'equipiers') instance.data.equipierSearch = '';
    render();

    var dropResource2 = instance.data.resourceMap && instance.data.resourceMap[drag.name];
    var srcAbsRowId = (drag.zone === 'absence') ? getOrCreateAbsenceRowId(drag.row) : '';
    var tgtAbsRowId = (targetZone === 'absence') ? getOrCreateAbsenceRowId(targetRow) : '';
    resetStates();
    if (dropResource2) instance.publishState('tag_' + dropResource2.type, dropResource2.obj);
    if (targetZone === 'absence') {
      var motifObj = instance.data.absenceMotifMap && instance.data.absenceMotifMap[targetRow];
      if (motifObj) instance.publishState('motif_absence', motifObj);
    }
    if (targetZone === 'atelier') {
      var atelRowDrop = tgtRowForId || getRow(st, 'atelier', targetRow);
      if (atelRowDrop) {
        // Appliquer le poste par défaut si la ligne n'en a pas encore
        if (!atelRowDrop.poste) {
          var defaultPostes = instance.data.postes || [];
          if (defaultPostes.length) atelRowDrop.poste = defaultPostes[0];
        }
        if (atelRowDrop.poste) instance.publishState('poste_atelier', atelRowDrop.poste);
      }
    }
    instance.publishState('source_zone', (!drag.isDuplicate && drag.zone) ? zoneLabel(drag.zone) : null);
    instance.publishState('drop_zone',   zoneLabel(targetZone));
    instance.publishState('row_id_source', drag.isDuplicate ? '' : (srcRowForId ? (srcRowForId.rowId || '') : srcAbsRowId));
    instance.publishState('row_id_drop',   tgtRowForId ? (tgtRowForId.rowId || '') : tgtAbsRowId);
    instance.triggerEvent('tag_moved');
  });

  // ---- Show Loader ----
  function startLoaderAnim() {
    if (instance.data.loaderTimer) { clearInterval(instance.data.loaderTimer); instance.data.loaderTimer = null; }
    var fill = instance.data.container.querySelector('.ph-loader-fill');
    var pct  = instance.data.container.querySelector('.ph-loader-pct');
    if (!fill || !pct) return;
    var current = 0;
    var steps = [{ target: 30, delay: 150 }, { target: 55, delay: 250 }, { target: 70, delay: 350 }, { target: 80, delay: 500 }];
    var stepIdx = 0;
    function applyStep() {
      if (!fill.parentNode) return;
      if (stepIdx < steps.length) {
        var s = steps[stepIdx++];
        current = s.target;
        fill.style.width = current + '%';
        pct.textContent = current + ' %';
        setTimeout(applyStep, s.delay);
      } else {
        instance.data.loaderTimer = setInterval(function() {
          if (!fill.parentNode) { clearInterval(instance.data.loaderTimer); return; }
          if (current < 97) { current += 0.5; fill.style.width = current.toFixed(1) + '%'; pct.textContent = Math.round(current) + ' %'; }
        }, 600);
      }
    }
    void fill.offsetWidth; // force reflow
    requestAnimationFrame(function() { requestAnimationFrame(applyStep); });
  }

  function showLoader() {
    if (instance.data.loaderTimer) { clearInterval(instance.data.loaderTimer); instance.data.loaderTimer = null; }
    // Invalider le hash pour forcer un re-render même si on revient sur une date déjà vue
    instance.data.lastMasterHash = null;
    // Après le premier chargement : skeleton avec header date visible
    if (instance.data.initialized) {
      showSkeleton();
      return;
    }
    instance.data.container.innerHTML = '<div class="' + ID + '"><div class="ph-loader"><div class="ph-loader-box">'
      + '<div class="ph-loader-label">Chargement du planning...</div>'
      + '<div class="ph-loader-track"><div class="ph-loader-fill"></div></div>'
      + '<div class="ph-loader-pct">0 %</div>'
      + '</div></div></div>';
    startLoaderAnim();
  }

  function showSkeleton() {
    var st = instance.data.state;
    var d  = st ? st.date : null;
    var dateStr = '';
    if (d) {
      var days  = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
      var months = ['jan.','fév.','mar.','avr.','mai','juin','juil.','aoû.','sep.','oct.','nov.','déc.'];
      dateStr = days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    }

    function skRow(w1, w2, w3) {
      return '<div class="ph-skeleton-row">'
        + '<div class="ph-skeleton-bar" style="width:' + w1 + ';flex-shrink:0;"></div>'
        + '<div class="ph-skeleton-bar" style="width:' + w2 + ';flex-shrink:0;"></div>'
        + (w3 ? '<div class="ph-skeleton-bar" style="width:' + w3 + ';flex-shrink:0;"></div>' : '')
        + '</div>';
    }

    function skZone(color, nRows) {
      var rows = '';
      for (var i = 0; i < nRows; i++) {
        var w1 = (55 + i * 17 % 30) + 'px';
        var w2 = (90 + i * 23 % 50) + 'px';
        rows += skRow(w1, w2, i % 2 === 0 ? (70 + i * 11 % 30) + 'px' : '');
      }
      return '<div class="ph-skeleton-zone" style="border-left-color:' + color + ';">'
        + '<div class="ph-skeleton-header"><div class="ph-skeleton-bar" style="width:80px;"></div></div>'
        + rows
        + '</div>';
    }

    var C = { chantier:'#3B82F6', transport:'#F59E0B', atelier:'#8B5CF6', bureau:'#10B981' };
    instance.data.container.innerHTML = '<div class="' + ID + '"><div class="ph-wrap">'
      + '<div style="display:flex;gap:8px;align-items:flex-start;position:sticky;top:0;z-index:10;">'
      + '<div style="flex:1;min-width:0;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:8px;padding:8px 16px;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">'
      + '<div class="ph-icon-btn ph-date-prev">&#x2039;</div>'
      + '<span style="font-size:18px;font-weight:800;color:#1E293B;white-space:nowrap;margin:0 4px;letter-spacing:-0.3px;">' + dateStr + '</span>'
      + '<div class="ph-icon-btn ph-date-next">&#x203A;</div>'
      + '<div class="ph-today-btn" style="visibility:hidden;margin-left:4px;">' + LABELS.today + '</div>'
      + '<div style="margin-left:auto;display:flex;gap:6px;flex-shrink:0;">'
      + '<div class="ph-icon-btn" style="visibility:hidden;"></div>'
      + '<div class="ph-icon-btn" style="visibility:hidden;"></div>'
      + '<div class="ph-icon-btn" style="visibility:hidden;"></div>'
      + '</div>'
      + '</div>'
      + '<div style="width:' + POOL_W + ';min-width:' + POOL_W + ';flex-shrink:0;"></div>'
      + '</div>'
      + '<div class="ph-zone-row">' + skZone(C.chantier, 3)   + '</div>'
      + '<div class="ph-zone-row">' + skZone(C.transport, 2)  + '</div>'
      + '<div class="ph-zone-row">' + skZone(C.atelier, 2)    + '</div>'
      + '<div class="ph-zone-row">' + skZone(C.bureau, 1)     + '</div>'
      + '</div></div>';
  }

  // ---- Pool Search Input ----
  cnt.addEventListener('input', function(e) {
    var inp = e.target.closest('.ph-pool-search');
    if (!inp) return;
    instance.data.equipierSearch = inp.value;
    render();
    var newInp = cnt.querySelector('.ph-pool-search[data-pool-search="' + inp.dataset.poolSearch + '"]');
    if (newInp) { newInp.focus(); var l = newInp.value.length; newInp.setSelectionRange(l, l); }
  });

  // ---- Tooltip ----
  var phTooltip = document.getElementById('ph-tooltip');
  if (!phTooltip) {
    phTooltip = document.createElement('div');
    phTooltip.id = 'ph-tooltip';
    document.body.appendChild(phTooltip);
  }
  cnt.addEventListener('mouseover', function(e) {
    var el = e.target.closest('.ph-tag-com[data-tip]') || e.target.closest('.ph-tag[data-chef-tip]');
    if (!el) return;
    var tip = el.getAttribute('data-tip') || el.getAttribute('data-chef-tip');
    if (!tip) return;
    phTooltip.style.whiteSpace = 'pre-wrap';
    phTooltip.textContent = tip.replace(/&#10;/g, '\n');
    phTooltip.style.display = 'block';
    var r = el.getBoundingClientRect();
    var tw = phTooltip.offsetWidth;
    var left = r.right - tw;
    if (left < 8) left = 8;
    var top = r.top - phTooltip.offsetHeight - 6;
    if (top < 8) top = r.bottom + 6;
    phTooltip.style.left = left + 'px';
    phTooltip.style.top  = top  + 'px';
  });
  cnt.addEventListener('mouseout', function(e) {
    if (e.target.closest('.ph-tag-com[data-tip]') || e.target.closest('.ph-tag[data-chef-tip]')) phTooltip.style.display = 'none';
  });

  // ---- Pool Toggle ----
  cnt.addEventListener('click', function(e) {
    var toggle = e.target.closest('[data-pool-toggle]');
    if (!toggle) return;
    var key = toggle.dataset.poolToggle;
    instance.data.collapsedPools[key] = !instance.data.collapsedPools[key];
    if (key === 'equipiers') instance.data.equipierSearch = '';
    render();
  }, true);

  // ---- Click ----
  cnt.addEventListener('click', function(e) {
    var st = instance.data.state;

    // Clear search équipiers
    var clearBtn = e.target.closest('[data-pool-search-clear]');
    if (clearBtn) {
      instance.data.equipierSearch = '';
      render();
      return;
    }

    // Clic sur zone chantier → ouvrir le picker
    var dzChantier = e.target.closest('[data-dz-col="chantiers"]');
    if (dzChantier && !e.target.closest('[data-rm]') && !e.target.closest('[data-dt]')) {
      instance.data.openPickerState = { col: 'chantiers', zone: dzChantier.dataset.dzZone, rowId: dzChantier.dataset.dzRow };
      showChantierPicker(dzChantier);
      return;
    }

    // Clic sur zone équipier → ouvrir le picker équipier
    var dzEquipier = e.target.closest('[data-dz-col="equipier"]');
    if (dzEquipier && !e.target.closest('[data-rm]') && !e.target.closest('[data-dt]')) {
      instance.data.openPickerState = { col: 'equipier', zone: dzEquipier.dataset.dzZone, rowId: dzEquipier.dataset.dzRow };
      showEquipierPicker(dzEquipier);
      return;
    }

    // Clic sur bouton ✎ conducteur
    var condEdit = e.target.closest('[data-cond-edit-zone]');
    if (condEdit) {
      e.stopPropagation();
      showConducteurPicker(condEdit, condEdit.dataset.condEditZone, condEdit.dataset.condEditRow);
      return;
    }

    // Clic sur zone véhicule → ouvrir le picker véhicule (pas si clic dans la ligne conducteur)
    var dzVehicule = e.target.closest('[data-dz-col="vehicule"]');
    if (dzVehicule && !e.target.closest('[data-rm]') && !e.target.closest('[data-dt]') && !e.target.closest('.ph-conduc-line')) {
      instance.data.openPickerState = { col: 'vehicule', zone: dzVehicule.dataset.dzZone, rowId: dzVehicule.dataset.dzRow };
      showVehiculePicker(dzVehicule);
      return;
    }

    // Supprime un tag (X)
    var rm = e.target.closest('[data-rm]');
    if (rm) {
      e.stopPropagation();
      var drag = {
        type:     rm.dataset.rmt,
        name:     decodeURIComponent(rm.dataset.rmn),
        zone:     rm.dataset.rmz,
        row:      rm.dataset.rmr,
        col:      rm.dataset.rmc,
        poolKey:  null,
        origPool: rm.dataset.rmop || null,
      };
      removeFromRow(st, drag);
      returnToPool(st, drag);
      render();
      var rmResource = instance.data.resourceMap && instance.data.resourceMap[drag.name];
      var rmRow = (drag.zone && drag.zone !== 'absence') ? getRow(st, drag.zone, drag.row) : null;
      var rmAbsRowId = (drag.zone === 'absence') ? getOrCreateAbsenceRowId(drag.row) : '';
      resetStates();
      if (rmResource) instance.publishState('tag_' + rmResource.type, rmResource.obj);
      instance.publishState('source_zone',   drag.zone ? zoneLabel(drag.zone) : null);
      instance.publishState('row_id_source', rmRow ? (rmRow.rowId || '') : rmAbsRowId);
      instance.triggerEvent('tag_moved');
      return;
    }

    // Dropdown poste atelier — clic sur le trigger
    var posteTrigger = e.target.closest('.ph-poste-trigger');
    if (posteTrigger) {
      e.stopPropagation();
      var allMenus = cnt.querySelectorAll('.ph-poste-menu');
      var menu = posteTrigger.parentElement.querySelector('.ph-poste-menu');
      var showing = menu && menu.style.display !== 'none';
      allMenus.forEach(function(m) { m.style.display = 'none'; });
      if (menu && !showing) {
        var trigRect = posteTrigger.getBoundingClientRect();
        menu.style.display = 'block';
        var mh = menu.offsetHeight || 120;
        var mt = trigRect.bottom + 2;
        if (mt + mh > window.innerHeight - 8) mt = Math.max(8, trigRect.top - 2 - mh);
        menu.style.top  = mt + 'px';
        var ml = trigRect.left;
        if (ml + (menu.offsetWidth || 130) > window.innerWidth - 8) ml = Math.max(8, window.innerWidth - (menu.offsetWidth || 130) - 8);
        menu.style.left = ml + 'px';
      }
      return;
    }

    // Dropdown poste atelier — clic sur une option
    var posteOpt = e.target.closest('[data-poste-val]');
    if (posteOpt) {
      e.stopPropagation();
      var ri = parseInt(posteOpt.dataset.posteRow);
      ensureRow(instance.data.state, 'atelier', ri);
      var rowA = instance.data.state.rows.atelier[ri];
      if (rowA) {
        rowA.poste = posteOpt.dataset.posteVal;
        resetStates();
        instance.publishState('drop_zone',     zoneLabel('atelier'));
        instance.publishState('row_id_drop',   rowA.rowId || '');
        instance.publishState('poste_atelier', rowA.poste);
        instance.triggerEvent('poste_changed');
        render();
      }
      return;
    }

    // Ferme tous les menus poste ouverts au clic ailleurs
    cnt.querySelectorAll('.ph-poste-menu').forEach(function(m) { m.style.display = 'none'; });

    // Ajouter une ligne
    var addZoneEl = e.target.closest('[data-add-zone]');
    if (addZoneEl) {
      addNewRow(st, addZoneEl.dataset.addZone);
      render();
      return;
    }

    // Clic confirm "Oui" suppression
    var delYes = e.target.closest('.ph-del-confirm-yes');
    if (delYes) {
      e.stopPropagation();
      var delZone2  = delYes.dataset.delZone;
      var delRowId2 = delYes.dataset.delRow;
      var delRow2   = getRow(st, delZone2, delRowId2);
      if (delRow2) {
        var delRows2 = st.rows[delZone2];
        var delIdx2  = delRows2 ? delRows2.indexOf(delRow2) : -1;
        if (delIdx2 !== -1) delRows2.splice(delIdx2, 1);
        var savedRowId = delRow2.rowId || '';
        render();
        resetStates();
        instance.publishState('row_id_source', savedRowId);
        instance.triggerEvent('row_deleted');
      }
      return;
    }

    // Clic annuler suppression
    if (e.target.closest('.ph-del-confirm-no')) {
      e.stopPropagation();
      var existingConfirm = cnt.querySelector('.ph-del-confirm');
      if (existingConfirm) existingConfirm.remove();
      return;
    }

    // Clic suppression ligne → affiche confirmation inline
    var delBtn = e.target.closest('[data-del-zone]');
    if (delBtn) {
      e.stopPropagation();
      // Ferme toute confirmation déjà ouverte
      cnt.querySelectorAll('.ph-del-confirm').forEach(function(el) { el.remove(); });
      var delCell = delBtn.closest('.ph-row-delete-cell');
      if (!delCell) return;
      var confirm = document.createElement('div');
      confirm.className = 'ph-del-confirm';
      confirm.innerHTML = 'Supprimer ?'
        + ' <span class="ph-del-confirm-no">Annuler</span>'
        + ' <span class="ph-del-confirm-yes" data-del-zone="' + delBtn.dataset.delZone + '" data-del-row="' + delBtn.dataset.delRow + '">Oui</span>';
      delCell.appendChild(confirm);
      // Ferme au clic en dehors + Entrée = confirmer, Échap = annuler
      setTimeout(function() {
        function onOutside(ev) {
          if (!confirm.contains(ev.target)) { confirm.remove(); document.removeEventListener('mousedown', onOutside, true); document.removeEventListener('keydown', onKey); }
        }
        function onKey(ev) {
          if (ev.key === 'Enter') { confirm.querySelector('.ph-del-confirm-yes') && confirm.querySelector('.ph-del-confirm-yes').click(); document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onOutside, true); }
          if (ev.key === 'Escape') { confirm.remove(); document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onOutside, true); }
        }
        document.addEventListener('mousedown', onOutside, true);
        document.addEventListener('keydown', onKey);
      }, 0);
      return;
    }

    // Clic commentaire → édition inline
    var cm = e.target.closest('[data-cm-zone]');
    if (cm && !cm.querySelector('input')) {
      var zone   = cm.dataset.cmZone;
      var rowId  = cm.dataset.cmRow;
      // Auto-créer si ligne fantôme
      ensureRow(st, zone, parseInt(rowId));
      var row    = getRow(st, zone, rowId);
      var prev   = row ? (row.commentaire || '') : '';
      var inp    = document.createElement('input');
      inp.type   = 'text';
      inp.value  = prev;
      inp.placeholder = LABELS.commentPlaceholder;
      inp.style.cssText = 'border:none;outline:none;width:100%;font-size:10px;color:#64748B;font-style:italic;background:transparent;';
      cm.innerHTML = '';
      cm.appendChild(inp);
      inp.focus();
      var cancelled = false;
      inp.addEventListener('blur', function() {
        if (cancelled) return;
        if (row) row.commentaire = inp.value;
        render();
        resetStates();
        instance.publishState('commentaire', inp.value);
        instance.publishState('drop_zone',   row ? zoneLabel(zone) : null);
        instance.publishState('row_id_drop', row ? (row.rowId || '') : '');
        instance.triggerEvent('add_commentaire');
      });
      inp.addEventListener('keydown', function(ev) {
        if (ev.key === 'Enter') { inp.blur(); }
        if (ev.key === 'Escape') {
          cancelled = true;
          if (row) row.commentaire = prev;
          render();
        }
      });
      return;
    }

    // Pré-remplir chantier
    var preRemplirBtn = e.target.closest('.ph-pre-remplir-btn');
    if (preRemplirBtn) {
      openPreRemplirConfirm(preRemplirBtn, function() {
        instance.publishState('selected_date', new Date(st.date));
        instance.triggerEvent('pre_remplir');
      });
      return;
    }

    // Copie zone
    var cpZone = e.target.closest('[data-cp-zone]');
    if (cpZone) {
      var cpZoneKey = cpZone.dataset.cpZone;
      openCalPicker(cpZone, function(chosen) {
        instance.data.copySourceDate = chosen;
        openCopyPopover(cpZone, chosen, function() {
          instance.publishState('date_copy', chosen);
          instance.publishState('copy_planning', (instance.data.zoneTypeMap || {})[cpZoneKey] || null);
          instance.triggerEvent('copy_planning');
        });
      });
      return;
    }

    // Copie globale planning
    var cpGlobal = e.target.closest('.ph-copy-global');
    if (cpGlobal) {
      openCalPicker(cpGlobal, function(chosen) {
        instance.data.copySourceDate = chosen;
        openCopyPopover(cpGlobal, chosen, function() {
          instance.publishState('date_copy', chosen);
          instance.publishState('copy_planning', null);
          instance.triggerEvent('copy_planning');
        });
      });
      return;
    }

    // Toggle global pools
    if (e.target.closest('.ph-pools-toggle')) {
      var allClosed = ALL_POOL_KEYS.every(function(k) { return instance.data.collapsedPools[k]; });
      ALL_POOL_KEYS.forEach(function(k) { instance.data.collapsedPools[k] = !allClosed; });
      render();
      return;
    }

    // Imprimer
    if (e.target.closest('.ph-print')) {
      doPrint(st);
      return;
    }

    // Aujourd'hui
    if (e.target.closest('.ph-today-btn')) {
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      st.date = today;
      instance.data.equipierSearch = '';
      showLoader();
      instance.publishState('selected_date', st.date);
      instance.triggerEvent('date_changed');
      return;
    }

    // Clic sur la date → mini calendrier
    if (e.target.closest('.ph-date-label')) {
      var labelEl = e.target.closest('.ph-date-label');
      openCalPicker(labelEl, function(chosen) {
        closeCal();
        st.date = chosen;
        instance.data.equipierSearch = '';
        showLoader();
        instance.publishState('selected_date', st.date);
        instance.triggerEvent('date_changed');
      }, st.date);
      return;
    }

    // Navigation date
    if (e.target.closest('.ph-date-prev')) {
      st.date = new Date(st.date.getTime() - 86400000);
      instance.data.equipierSearch = '';
      showLoader();
      instance.publishState('selected_date', st.date);
      instance.triggerEvent('date_changed');
      return;
    }
    if (e.target.closest('.ph-date-next')) {
      st.date = new Date(st.date.getTime() + 86400000);
      instance.data.equipierSearch = '';
      showLoader();
      instance.publishState('selected_date', st.date);
      instance.triggerEvent('date_changed');
      return;
    }
  });


  // ============================================================
  // HELPERS STATE
  // ============================================================
  function zoneLabel(zone) {
    var map = instance.data.zoneTypeMap || {};
    return map[zone] || null;
  }

  function getOrCreateAbsenceRowId(motif) {
    if (!instance.data.absenceRowIdMap) instance.data.absenceRowIdMap = {};
    if (!instance.data.absenceRowIdMap[motif]) {
      instance.data.absenceRowIdMap[motif] = genRowId();
    }
    return instance.data.absenceRowIdMap[motif];
  }

  function getRow(st, zone, rowId) {
    if (zone === 'absence') return null;
    var rows = st.rows[zone];
    if (!rows) return null;
    var idx = parseInt(rowId);
    return isNaN(idx) ? null : (rows[idx] || null);
  }

  function buildCountMap(st) {
    var map = {};
    function inc(name) { map[name] = (map[name] || 0) + 1; }
    ['chantier', 'transport', 'atelier', 'bureau'].forEach(function(zone) {
      (st.rows[zone] || []).forEach(function(r) {
        (r.equipiers || []).forEach(function(e) { inc(e.name); });
        (r.chantiers || []).forEach(function(c) { inc(c.name); });
      });
    });
    Object.keys(st.absences || {}).forEach(function(m) {
      (st.absences[m] || []).forEach(function(name) { inc(name); });
    });
    return map;
  }

  function countOccurrences(st, name) {
    var count = 0;
    ['chantier', 'transport', 'atelier', 'bureau'].forEach(function(zone) {
      (st.rows[zone] || []).forEach(function(r) {
        (r.equipiers || []).forEach(function(e) { if (e.name === name) count++; });
        (r.chantiers || []).forEach(function(c) { if (c.name === name) count++; });
      });
    });
    Object.keys(st.absences || {}).forEach(function(m) {
      (st.absences[m] || []).forEach(function(n) { if (n === name) count++; });
    });
    return count;
  }

  function resetStates() {
    var _sd = new Date(instance.data.state.date); _sd.setHours(0, 0, 0, 0);
    instance.publishState('selected_date', _sd);
    instance.publishState('tag_user',      null);
    instance.publishState('tag_contact',   null);
    instance.publishState('tag_vehicule',  null);
    instance.publishState('tag_chantier',  null);
    instance.publishState('tag_conducteur',     null);
    instance.publishState('tag_conducteur_sst', null);
    instance.publishState('source_zone',   null);
    instance.publishState('drop_zone',     null);
    instance.publishState('row_id_source', '');
    instance.publishState('row_id_drop',   '');
    instance.publishState('motif_absence', null);
    instance.publishState('poste_atelier', null);
    instance.publishState('commentaire',   null);
  }

  // Crée les lignes vides jusqu'à l'index cible (lignes fantômes → lignes réelles)
  function ensureRow(st, zone, idx) {
    if (isNaN(idx) || zone === 'absence') return;
    var rows = st.rows[zone];
    if (!rows) return;
    while (rows.length <= idx) addNewRow(st, zone);
  }

  function removeFromPool(st, drag) {
    var pools = st.pools;
    if (drag.type === 'equipier') {
      var i = pools.equipiers.indexOf(drag.name);
      if (i !== -1) pools.equipiers.splice(i, 1);
    } else if (drag.type === 'soustraitant') {
      var i2 = pools.soustraitants.indexOf(drag.name);
      if (i2 !== -1) pools.soustraitants.splice(i2, 1);
    } else if (drag.type === 'vehicule') {
      var i3 = pools.vehicules.indexOf(drag.name);
      if (i3 !== -1) pools.vehicules.splice(i3, 1);
    } else if (drag.type === 'chantier' && drag.poolKey) {
      var pc = pools.chantiers[drag.poolKey];
      if (pc) {
        var i4 = pc.indexOf(drag.name);
        if (i4 !== -1) pc.splice(i4, 1);
      }
    }
  }

  function removeFromRow(st, drag) {
    if (drag.zone === 'absence') {
      var list = st.absences[drag.row];
      if (list) {
        var i = list.indexOf(drag.name);
        if (i !== -1) list.splice(i, 1);
      }
      return;
    }
    var row = getRow(st, drag.zone, drag.row);
    if (!row) return;
    if (drag.col === 'chantiers') {
      row.chantiers = (row.chantiers || []).filter(function(c) { return c.name !== drag.name; });
    } else if (drag.col === 'equipier') {
      row.equipiers = (row.equipiers || []).filter(function(e) { return e.name !== drag.name; });
    } else if (drag.col === 'vehicule') {
      if (drag.zone === 'chantier') {
        row.vehicules = (row.vehicules || []).filter(function(v) { return v.name !== drag.name; });
      } else {
        row.vehicule = null;
      }
    }
  }

  function returnToPool(st, drag) {
    if (countOccurrences(st, drag.name) > 0) return;
    if (drag.type === 'equipier') {
      if (st.pools.equipiers.indexOf(drag.name) === -1) st.pools.equipiers.push(drag.name);
    } else if (drag.type === 'soustraitant') {
      if (st.pools.soustraitants.indexOf(drag.name) === -1) st.pools.soustraitants.push(drag.name);
    } else if (drag.type === 'vehicule') {
      var isAr = instance.data.archivedVehicules && instance.data.archivedVehicules[drag.name];
      if (!isAr && st.pools.vehicules.indexOf(drag.name) === -1) st.pools.vehicules.push(drag.name);
    } else if (drag.type === 'chantier' && drag.origPool) {
      var pool = st.pools.chantiers[drag.origPool];
      if (pool && pool.indexOf(drag.name) === -1) pool.push(drag.name);
    }
  }

  function addToTarget(st, drag, targetZone, targetCol, targetRow) {
    if (targetZone === 'absence') {
      if (!st.absences[targetRow]) st.absences[targetRow] = [];
      if (st.absences[targetRow].indexOf(drag.name) === -1) st.absences[targetRow].push(drag.name);
      return;
    }
    var row = getRow(st, targetZone, targetRow);
    if (!row) return;

    if (targetCol === 'chantiers') {
      if (!row.chantiers) row.chantiers = [];
      var exists = row.chantiers.some(function(c) { return c.name === drag.name; });
      if (!exists) {
        row.chantiers.push({ name: drag.name, type: 'chantier', origPool: drag.poolKey || drag.origPool || null });
      }

    } else if (targetCol === 'equipier') {
      var item = { name: drag.name, type: drag.type };
      if (!row.equipiers) row.equipiers = [];
      var exists2 = row.equipiers.some(function(e) { return e.name === drag.name; });
      if (!exists2) row.equipiers.push(item);

    } else if (targetCol === 'vehicule') {
      var vitem = { name: drag.name, type: 'vehicule' };
      if (targetZone === 'chantier') {
        if (row.vehicules && row.vehicules.length > 0) return false;
        if (!row.vehicules) row.vehicules = [];
        row.vehicules.push(vitem);
      } else {
        if (row.vehicule) return false;
        row.vehicule = vitem;
      }
    }
    return true;
  }

  function reorderInCol(st, drag, targetName, insertBefore) {
    var arr = getColArray(st, drag.zone, drag.row, drag.col);
    if (!arr) return;
    var fromIdx = arr.findIndex(function(it) { return (it.name || it) === drag.name; });
    var toIdx   = arr.findIndex(function(it) { return (it.name || it) === targetName; });
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
    var item = arr.splice(fromIdx, 1)[0];
    var insertIdx = arr.findIndex(function(it) { return (it.name || it) === targetName; });
    if (!insertBefore) insertIdx += 1;
    arr.splice(insertIdx, 0, item);
  }

  function sortChantierRows(st) {
    var ordreMap = instance.data.vehiculeOrdreMap || {};
    st.rows.chantier.sort(function(a, b) {
      var vA = a.vehicules && a.vehicules[0] ? a.vehicules[0].name : null;
      var vB = b.vehicules && b.vehicules[0] ? b.vehicules[0].name : null;
      var oA = vA !== null && ordreMap[vA] !== undefined ? ordreMap[vA] : Infinity;
      var oB = vB !== null && ordreMap[vB] !== undefined ? ordreMap[vB] : Infinity;
      return oA - oB;
    });
  }

  function getColArray(st, zone, rowId, col) {
    if (zone === 'absence') return st.absences[rowId] || null;
    var row = getRow(st, zone, rowId);
    if (!row) return null;
    if (col === 'chantiers') return row.chantiers || null;
    if (col === 'equipier') return row.equipiers || null;
    if (col === 'vehicule'  && zone === 'chantier') return row.vehicules  || null;
    return null;
  }

  function genRowId() {
    return (Math.random() * Math.pow(2, 54)).toString(36);
  }

  function addNewRow(st, zone) {
    if (zone === 'chantier')  st.rows.chantier.push({ rowId: genRowId(), chantiers:[], equipiers:[], vehicules:[], commentaire:'' });
    if (zone === 'transport') st.rows.transport.push({ rowId: genRowId(), chantiers:[], equipiers:[], vehicule:null, commentaire:'' });
    if (zone === 'atelier')   st.rows.atelier.push({ rowId: genRowId(), poste:'', chantiers:[], equipiers:[], commentaire:'' });
    if (zone === 'bureau')    st.rows.bureau.push({ rowId: genRowId(), equipiers:[], vehicule:null, commentaire:'' });
  }

  // ============================================================
  // PRINT
  // ============================================================
  function doPrint(st) {
    var days   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
    var months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
    var d = st.date;
    var dateStr = days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();

    var PRINT_COLORS = { chantier: '#92400E', equipier: '#1D4ED8', vehicule: '#065F46', soustraitant: '#5B21B6', poste: '#374151' };
    function pTag(name, color) {
      return '<span style="display:inline-block;padding:1px 6px;border-radius:3px;font-size:10px;border:1px solid ' + color + ';color:' + color + ';margin:1px;">' + name + '</span>';
    }

    function vehCondPrint(vehName, conducteur) {
      if (!vehName) return '—';
      var locMap      = instance.data.vehiculeLocMap || {};
      var numInt      = (instance.data.vehiculeNumInterneMap || {})[vehName] || null;
      var condName    = conducteur ? conducteur.name : null;
      var locPfx      = locMap[vehName] ? '(L) - ' : '';
      var label       = numInt
        ? locPfx + numInt + (condName ? ' - ' + condName : '')
        : locPfx + vehName;
      var isIndispo   = !!(instance.data.indispoVehicules  && instance.data.indispoVehicules[vehName]);
      var isArchived  = !!(instance.data.archivedVehicules && instance.data.archivedVehicules[vehName]);
      var badge       = isArchived ? ' <span style="font-size:9px;font-weight:700;color:#64748B;background:#F1F5F9;border:1px solid #94A3B8;border-radius:3px;padding:0 3px;">AR</span>' : '';
      var extraStyle  = (isIndispo || isArchived) ? 'text-decoration:line-through;color:#94A3B8;border-color:#94A3B8;' : '';
      return '<span style="display:inline-block;padding:1px 6px;border-radius:3px;font-size:10px;border:1px solid ' + PRINT_COLORS.vehicule + ';color:' + PRINT_COLORS.vehicule + ';margin:1px;' + extraStyle + '">' + label + badge + '</span>';
    }

    function rowsHtml(rows, zoneName) {
      if (!rows || !rows.length) return '<tr><td colspan="5" style="padding:6px;color:#94A3B8;font-style:italic;">Aucune ligne</td></tr>';
      return rows.map(function(r) {
        var chantiers = (r.chantiers||[]).map(function(c){ return pTag(c.name, PRINT_COLORS.chantier); }).join(' ');
        var equipiers = (r.equipiers||[]).map(function(e){ return pTag(e.name, e.type === 'soustraitant' ? PRINT_COLORS.soustraitant : PRINT_COLORS.equipier); }).join(' ');
        // Véhicule(s) avec conducteur
        var vehObjs   = (r.vehicules||[]).concat(r.vehicule ? [r.vehicule] : []);
        var vehicules = vehObjs.map(function(v) { return vehCondPrint(v.name, r.conducteur); }).join(' ');
        var poste     = r.poste ? pTag(r.poste, PRINT_COLORS.poste) : '';
        var tdS = 'style="padding:4px 8px;word-break:break-word;vertical-align:top;"';
        var tdC = 'style="padding:4px 8px;font-size:10px;color:#64748B;font-style:italic;word-break:break-word;vertical-align:top;"';
        if (zoneName === 'bureau') {
          var buVeh = r.vehicule ? vehCondPrint(r.vehicule.name, r.conducteur) : '—';
          return '<tr style="border-bottom:1px solid #eee;">'
            + '<td ' + tdS + '>' + (equipiers || '—') + '</td>'
            + '<td ' + tdS + '>' + buVeh + '</td>'
            + '<td ' + tdC + '>' + (r.commentaire || '') + '</td>'
            + '</tr>';
        }
        return '<tr style="border-bottom:1px solid #eee;">'
          + (zoneName === 'atelier' ? '<td ' + tdS + '>' + poste + '</td>' : '')
          + '<td ' + tdS + '>' + (chantiers || '—') + '</td>'
          + '<td ' + tdS + '>' + (equipiers  || '—') + '</td>'
          + (zoneName !== 'atelier' ? '<td ' + tdS + '>' + (vehicules || '—') + '</td>' : '')
          + '<td ' + tdC + '>' + (r.commentaire || '') + '</td>'
          + '</tr>';
      }).join('');
    }

    function section(title, color, thead, tbody, colwidths) {
      var cols = colwidths ? colwidths.map(function(w) { return '<col style="width:' + w + '">'; }).join('') : '';
      return '<div style="margin-bottom:16px;">'
        + '<div style="padding:6px 10px;background:' + color + '22;border-left:4px solid ' + color + ';font-weight:700;color:' + color + ';font-size:12px;margin-bottom:0;">' + title + '</div>'
        + '<table style="width:100%;border-collapse:collapse;font-size:11px;table-layout:fixed;">'
        + (cols ? '<colgroup>' + cols + '</colgroup>' : '')
        + '<thead style="background:#F8FAFC;"><tr>' + thead + '</tr></thead>'
        + '<tbody>' + tbody + '</tbody>'
        + '</table></div>';
    }

    var th = function(label) { return '<th style="padding:5px 8px;text-align:left;border-bottom:2px solid #E2E8F0;font-weight:600;color:#475569;word-break:break-word;">' + label + '</th>'; };

    var absHtml = Object.keys(st.absences).map(function(m) {
      var names = (st.absences[m]||[]).join(', ') || '—';
      return '<tr><td style="padding:4px 8px;font-weight:600;">' + m + '</td><td style="padding:4px 8px;">' + names + '</td></tr>';
    }).join('');

    var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Planning ' + dateStr + '</title>'
      + '<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:20px;color:#1E293B;}'
      + '@media print{body{padding:10px;}-webkit-print-color-adjust:exact;print-color-adjust:exact;}'
      + '</style></head><body>'
      + '<h2 style="margin:0 0 16px;font-size:16px;color:#1E293B;">Planning du ' + dateStr + '</h2>'
      + section('🏗 Chantier', '#92400E',
          th('Chantiers') + th('Équipiers') + th('Véhicules') + th('Commentaire'),
          rowsHtml(st.rows.chantier, 'chantier'),
          ['35%','30%','15%','20%'])
      + section('🚚 Transport', '#0EA5E9',
          th('Chantiers') + th('Équipier') + th('Véhicule') + th('Commentaire'),
          rowsHtml(st.rows.transport, 'transport'),
          ['35%','30%','15%','20%'])
      + section('🔧 Atelier', '#64748B',
          th('Poste') + th('Chantiers') + th('Équipier') + th('Commentaire'),
          rowsHtml(st.rows.atelier, 'atelier'),
          ['15%','35%','30%','20%'])
      + section('🏢 Bureau', '#0EA5E9',
          th('Équipier') + th('Véhicule') + th('Commentaire'),
          rowsHtml(st.rows.bureau, 'bureau'),
          ['40%','25%','35%'])
      + section('🚫 Absences', '#EF4444',
          th('Motif') + th('Équipiers'),
          absHtml,
          ['25%','75%'])
      + '</body></html>';

    var win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.onload = function() { win.print(); };
  }

  // ============================================================
  // ÉTAT INITIAL VIDE — les données arrivent via update.js
  // ============================================================
  instance.data.chantierList = [];
  instance.data.resourceMap  = {};
  instance.data.zoneTypeMap  = {};
  instance.data.indispoVehicules = {};
  instance.data.absenceMotifMap  = {};
  instance.data.absenceRowIdMap  = {};
  instance.data.chantierDebutMap = {};
  instance.data.chantierChefMap  = {}; // { nomChantier: [{ name, dateDebut, dateFin, isStartingToday, label }] }
  instance.data.vehiculeOrdreMap = {};
  instance.data.equipierSearch = '';
  var ALL_POOL_KEYS = ['equipiers', 'soustraitants', 'vehicules', 'chantier', 'bureau_eq'].concat(instance.data.atelierTypes || []);
  instance.data.collapsedPools = (function() {
    var map = {};
    ALL_POOL_KEYS.forEach(function(k) { map[k] = true; });
    return map;
  }());

  // Même pattern que v3 : getBoundingClientRect au moment de l'initialize
  // Le canvas est déjà positionné par Bubble quand initialize s'exécute
  var cachedCanvasTop = null;

  function setCanvasHeight() {
    if (cachedCanvasTop === null) {
      cachedCanvasTop = instance.canvas[0].getBoundingClientRect().top;
    }
    var h = Math.floor(window.innerHeight - cachedCanvasTop - 16);
    if (h > 100) { instance.canvas[0].style.height = h + 'px'; }
  }

  window.addEventListener('resize', function() {
    // Sur resize, recalculer car le viewport change
    cachedCanvasTop = instance.canvas[0].getBoundingClientRect().top;
    setCanvasHeight();
  });

  // Appel immédiat + RAF comme filet de sécurité (identique à v3)
  setCanvasHeight();
  requestAnimationFrame(setCanvasHeight);

  instance.data.render = function() {
    if (instance.data.isDisplay) {
      renderDisplay();
    } else {
      render();
    }
  };

  instance.data.initialized = true;
}