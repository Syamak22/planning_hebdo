function(instance, context) {

  // --- Instance ID ---
  let instanceId = (Math.random() * Math.pow(2, 54)).toString(36);
  instance.data.instanceName = 'planningHebdo-' + instanceId;

  // --- Colors ---
  instance.data.colors = {
    personnel:     { main: '#3B82F6', bg: '#EFF6FF' },
    vehicule:      { main: '#10B981', bg: '#ECFDF5' },
    soustraitant:  { main: '#F59E0B', bg: '#FFFBEB' }
  };

  // --- Style ---
  let style = document.createElement('style');
  style.innerHTML = `
    .planningHebdo-${instanceId} {
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      color: inherit;
      width: 100%;
      height: 100%;
      padding: 0;
      margin: 0;
      background-color: transparent;
      border: 0;
      display: flex;
      gap: 12px;
      overflow: hidden;
    }

    .planningHebdo-${instanceId} .ph-grid {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      overflow: hidden;
    }

    .planningHebdo-${instanceId} .ph-date-header {
      padding: 6px 16px;
      background: #F8FAFC;
      border-bottom: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      position: relative;
    }

    .planningHebdo-${instanceId} .ph-date-nav {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      cursor: pointer;
      color: #64748B;
      background: #E2E8F0;
      font-size: 14px;
      font-weight: 600;
      user-select: none;
      transition: background 0.15s;
    }

    .planningHebdo-${instanceId} .ph-date-nav:hover {
      background: #CBD5E1;
    }

    .planningHebdo-${instanceId} .ph-date-center {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .planningHebdo-${instanceId} .ph-date-label {
      font-size: 13px;
      font-weight: 600;
      color: #1E293B;
    }

    .planningHebdo-${instanceId} .ph-date-icon {
      color: #64748B;
      display: flex;
      align-items: center;
    }

    .planningHebdo-${instanceId} .ph-date-input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      pointer-events: none;
    }

    .planningHebdo-${instanceId} .ph-col-headers {
      display: flex;
      border-bottom: 2px solid #E2E8F0;
      background: #F8FAFC;
    }

    .planningHebdo-${instanceId} .ph-col-header {
      padding: 6px 8px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: center;
      flex: 1;
      border-right: 1px solid #F1F5F9;
    }

    .planningHebdo-${instanceId} .ph-col-header:last-child {
      border-right: none;
    }

    .planningHebdo-${instanceId} .ph-col-chantier {
      width: 140px;
      min-width: 140px;
      flex: none;
      text-align: left;
      padding: 6px 12px;
      color: #64748B;
      border-right: 1px solid #E2E8F0;
    }

    .planningHebdo-${instanceId} .ph-rows {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: #e31e24 #FFFFFF;
    }

    .planningHebdo-${instanceId} .ph-rows::-webkit-scrollbar {
      width: 2px;
    }

    .planningHebdo-${instanceId} .ph-rows::-webkit-scrollbar-track {
      background: #FFFFFF;
    }

    .planningHebdo-${instanceId} .ph-rows::-webkit-scrollbar-thumb {
      background: #e31e24;
      border-radius: 2px;
    }

    .planningHebdo-${instanceId} .ph-rows::-webkit-scrollbar-thumb:hover {
      background: #e31e2480;
    }

    .planningHebdo-${instanceId} .ph-resources-body {
      scrollbar-width: thin;
      scrollbar-color: #e31e24 #FFFFFF;
    }

    .planningHebdo-${instanceId} .ph-resources-body::-webkit-scrollbar {
      width: 2px;
    }

    .planningHebdo-${instanceId} .ph-resources-body::-webkit-scrollbar-track {
      background: #FFFFFF;
    }

    .planningHebdo-${instanceId} .ph-resources-body::-webkit-scrollbar-thumb {
      background: #e31e24;
      border-radius: 2px;
    }

    .planningHebdo-${instanceId} .ph-resources-body::-webkit-scrollbar-thumb:hover {
      background: #e31e2480;
    }

    .planningHebdo-${instanceId} .ph-row {
      display: flex;
      align-items: stretch;
      border-bottom: 1px solid #F1F5F9;
      flex: none;
      min-height: 48px;
    }

    .planningHebdo-${instanceId} .ph-row:last-child {
      border-bottom: none;
    }

    .planningHebdo-${instanceId} .ph-row.ph-row-start .ph-cell-chantier {
      border-left: 3px solid #10B981;
      padding-left: 9px;
    }

    .planningHebdo-${instanceId} .ph-cell-chantier {
      width: 140px;
      min-width: 140px;
      padding: 8px 8px 8px 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #1E293B;
      border-right: 1px solid #E2E8F0;
      background: #FAFBFC;
    }

    .planningHebdo-${instanceId} .ph-chantier-name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .planningHebdo-${instanceId} .ph-info-btn {
      width: 18px;
      height: 18px;
      min-width: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 1px solid #CBD5E1;
      background: #FFFFFF;
      color: #64748B;
      font-size: 10px;
      font-weight: 700;
      font-style: italic;
      font-family: Georgia, serif;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
      flex-shrink: 0;
    }

    .planningHebdo-${instanceId} .ph-info-btn:hover {
      background: #F1F5F9;
      border-color: #94A3B8;
      color: #334155;
    }

    .planningHebdo-${instanceId} .ph-drop-zone {
      flex: 1;
      min-height: 28px;
      padding: 3px 4px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 2px;
      border-radius: 4px;
      margin: 2px;
    }

    .planningHebdo-${instanceId} .ph-drop-zone.zone-personnel {
      background: #EFF6FF66;
    }

    .planningHebdo-${instanceId} .ph-drop-zone.zone-vehicule {
      background: #ECFDF566;
    }

    .planningHebdo-${instanceId} .ph-drop-zone.zone-soustraitant {
      background: #FFFBEB66;
    }

    .planningHebdo-${instanceId} .ph-empty-label {
      font-size: 10px;
      font-style: italic;
    }

    .planningHebdo-${instanceId} .ph-empty-label.label-personnel {
      color: #3B82F688;
    }

    .planningHebdo-${instanceId} .ph-empty-label.label-vehicule {
      color: #10B98188;
    }

    .planningHebdo-${instanceId} .ph-empty-label.label-soustraitant {
      color: #F59E0B88;
    }

    /* --- Resource Panel --- */
    .planningHebdo-${instanceId} .ph-resources {
      width: 180px;
      min-width: 180px;
      display: flex;
      flex-direction: column;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      overflow: hidden;
    }

    .planningHebdo-${instanceId} .ph-resources-title {
      padding: 10px 12px;
      background: #F8FAFC;
      border-bottom: 1px solid #E2E8F0;
      font-size: 13px;
      font-weight: 600;
      color: #1E293B;
      text-align: center;
    }

    .planningHebdo-${instanceId} .ph-resources-body {
      flex: 1;
      padding: 10px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .planningHebdo-${instanceId} .ph-res-section-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .planningHebdo-${instanceId} .ph-res-pool {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      padding: 6px;
      border-radius: 6px;
      min-height: 30px;
      border: 1px dashed;
    }

    .planningHebdo-${instanceId} .ph-res-pool.pool-personnel {
      background: #EFF6FF88;
      border-color: #3B82F633;
    }

    .planningHebdo-${instanceId} .ph-res-pool.pool-vehicule {
      background: #ECFDF588;
      border-color: #10B98133;
    }

    .planningHebdo-${instanceId} .ph-res-pool.pool-soustraitant {
      background: #FFFBEB88;
      border-color: #F59E0B33;
    }

    .planningHebdo-${instanceId} .ph-res-tag {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      white-space: normal;
      word-break: break-word;
      max-width: 180px;
      line-height: 1.4;
      cursor: grab;
    }

    .planningHebdo-${instanceId} .ph-res-tag.tag-personnel {
      color: #3B82F6;
      background: #EFF6FF;
      border: 1px solid #3B82F622;
    }

    .planningHebdo-${instanceId} .ph-res-tag.tag-vehicule {
      color: #10B981;
      background: #ECFDF5;
      border: 1px solid #10B98122;
    }

    .planningHebdo-${instanceId} .ph-res-tag.tag-soustraitant {
      color: #F59E0B;
      background: #FFFBEB;
      border: 1px solid #F59E0B22;
    }

    .planningHebdo-${instanceId} .ph-res-tag:active {
      cursor: grabbing;
    }

    .planningHebdo-${instanceId} .ph-res-tag.ph-dragging {
      opacity: 0.35;
    }

    /* --- Drag over highlights --- */
    .planningHebdo-${instanceId} .ph-drop-zone.ph-drag-over {
      outline: 2px dashed;
      outline-offset: -2px;
    }

    .planningHebdo-${instanceId} .ph-drop-zone.zone-personnel.ph-drag-over {
      outline-color: #3B82F6;
      background: #EFF6FFAA;
    }

    .planningHebdo-${instanceId} .ph-drop-zone.zone-vehicule.ph-drag-over {
      outline-color: #10B981;
      background: #ECFDF5AA;
    }

    .planningHebdo-${instanceId} .ph-drop-zone.zone-soustraitant.ph-drag-over {
      outline-color: #F59E0B;
      background: #FFFBEBAA;
    }

    .planningHebdo-${instanceId} .ph-res-pool.ph-drag-over {
      outline: 2px dashed;
      outline-offset: -2px;
    }

    .planningHebdo-${instanceId} .ph-res-pool.pool-personnel.ph-drag-over {
      outline-color: #3B82F6;
    }

    .planningHebdo-${instanceId} .ph-res-pool.pool-vehicule.ph-drag-over {
      outline-color: #10B981;
    }

    .planningHebdo-${instanceId} .ph-res-pool.pool-soustraitant.ph-drag-over {
      outline-color: #F59E0B;
    }

    /* --- Remove button (X) --- */
    .planningHebdo-${instanceId} .ph-tag-remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      margin-left: 4px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 9px;
      line-height: 1;
      opacity: 0.5;
      transition: opacity 0.15s, background 0.15s;
    }

    .planningHebdo-${instanceId} .ph-tag-remove:hover {
      opacity: 1;
      background: rgba(0,0,0,0.08);
    }

    /* --- Print button --- */
    .planningHebdo-${instanceId} .ph-print-btn {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      cursor: pointer;
      color: #64748B;
      background: #E2E8F0;
      transition: background 0.15s;
      position: absolute;
      right: 12px;
    }

    .planningHebdo-${instanceId} .ph-print-btn:hover {
      background: #CBD5E1;
      color: #334155;
    }

    /* --- Print styles --- */
    @media print {
      /* Hide everything on the page */
      body * {
        visibility: hidden !important;
      }

      /* Show only the planning */
      .planningHebdo-${instanceId},
      .planningHebdo-${instanceId} * {
        visibility: visible !important;
      }

      /* Break out of Bubble's layout */
      .planningHebdo-${instanceId} {
        position: fixed !important;
        left: 0 !important;
        top: 0 !important;
        width: 100vw !important;
        height: auto !important;
        padding: 20px !important;
        margin: 0 !important;
        background: #FFFFFF !important;
        z-index: 999999 !important;
        overflow: visible !important;
        display: block !important;
      }

      /* Hide non-printable elements */
      .planningHebdo-${instanceId} .ph-resources,
      .planningHebdo-${instanceId} .ph-print-btn,
      .planningHebdo-${instanceId} .ph-date-nav,
      .planningHebdo-${instanceId} .ph-date-icon,
      .planningHebdo-${instanceId} .ph-date-input,
      .planningHebdo-${instanceId} .ph-info-btn,
      .planningHebdo-${instanceId} .ph-tag-remove {
        display: none !important;
      }

      /* Grid takes full width */
      .planningHebdo-${instanceId} .ph-grid {
        border: 1px solid #ccc !important;
        border-radius: 0 !important;
        width: 100% !important;
        overflow: visible !important;
        display: flex !important;
        flex-direction: column !important;
      }

      /* Date header centered */
      .planningHebdo-${instanceId} .ph-date-header {
        padding: 10px !important;
        text-align: center !important;
        border-bottom: 1px solid #ccc !important;
        font-size: 14px !important;
      }

      /* Column headers and rows full width table layout */
      .planningHebdo-${instanceId} .ph-col-headers,
      .planningHebdo-${instanceId} .ph-row {
        display: flex !important;
        width: 100% !important;
      }

      .planningHebdo-${instanceId} .ph-col-chantier,
      .planningHebdo-${instanceId} .ph-cell-chantier {
        width: 25% !important;
        min-width: 0 !important;
        flex: none !important;
        border-right: 1px solid #ccc !important;
      }

      .planningHebdo-${instanceId} .ph-col-header:not(.ph-col-chantier),
      .planningHebdo-${instanceId} .ph-drop-zone {
        flex: 1 !important;
        border-right: 1px solid #eee !important;
      }

      /* Rows visible without scroll */
      .planningHebdo-${instanceId} .ph-rows {
        overflow: visible !important;
        max-height: none !important;
        flex: none !important;
      }

      .planningHebdo-${instanceId} .ph-row {
        border-bottom: 1px solid #eee !important;
        min-height: 32px !important;
        page-break-inside: avoid !important;
      }

      /* Tags readable in print */
      .planningHebdo-${instanceId} .ph-res-tag {
        font-size: 10px !important;
        padding: 1px 6px !important;
        border: 1px solid currentColor !important;
      }
    }
  `;
  document.head.appendChild(style);

  // --- DOM Structure ---
  var container = document.createElement('div');
  container.className = 'planningHebdo-' + instanceId;

  // Planning grid
  var grid = document.createElement('div');
  grid.className = 'ph-grid';

  // Date header
  var dateHeader = document.createElement('div');
  dateHeader.className = 'ph-date-header';

  var btnPrev = document.createElement('div');
  btnPrev.className = 'ph-date-nav';
  btnPrev.textContent = '\u2039';

  var dateCenter = document.createElement('div');
  dateCenter.className = 'ph-date-center';

  var dateLabel = document.createElement('span');
  dateLabel.className = 'ph-date-label';
  dateLabel.textContent = '\u2014';

  var dateIcon = document.createElement('span');
  dateIcon.className = 'ph-date-icon';
  dateIcon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';

  var dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.className = 'ph-date-input';

  dateCenter.appendChild(dateLabel);
  dateCenter.appendChild(dateIcon);
  dateCenter.appendChild(dateInput);

  var btnNext = document.createElement('div');
  btnNext.className = 'ph-date-nav';
  btnNext.textContent = '\u203A';

  var btnPrint = document.createElement('div');
  btnPrint.className = 'ph-print-btn';
  btnPrint.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>';
  btnPrint.addEventListener('click', function() {
    var originalTitle = document.title;
    var dateStr = instance.data.currentDate
      ? instance.data.formatDate(instance.data.currentDate)
      : '';
    document.title = 'Planning' + (dateStr ? ' - ' + dateStr : '');

    // Temporarily expand rows so all content is visible for print
    var rows = instance.data.rowsContainer;
    var savedStyle = rows.style.cssText;
    rows.style.overflow = 'visible';
    rows.style.maxHeight = 'none';
    rows.style.height = 'auto';
    rows.style.flex = 'none';

    window.print();

    // Restore after print
    rows.style.cssText = savedStyle;
    document.title = originalTitle;
  });

  dateHeader.appendChild(btnPrev);
  dateHeader.appendChild(dateCenter);
  dateHeader.appendChild(btnNext);
  dateHeader.appendChild(btnPrint);

  // Column headers
  var colHeaders = document.createElement('div');
  colHeaders.className = 'ph-col-headers';

  var colChantier = document.createElement('div');
  colChantier.className = 'ph-col-header ph-col-chantier';
  colChantier.textContent = 'Chantier';

  var colPersonnel = document.createElement('div');
  colPersonnel.className = 'ph-col-header';
  colPersonnel.style.color = '#3B82F6';
  colPersonnel.textContent = '\u{1F464} Personnel';

  var colVehicule = document.createElement('div');
  colVehicule.className = 'ph-col-header';
  colVehicule.style.color = '#10B981';
  colVehicule.textContent = '\u{1F699} Véhicules';

  var colSoustraitant = document.createElement('div');
  colSoustraitant.className = 'ph-col-header';
  colSoustraitant.style.color = '#F59E0B';
  colSoustraitant.textContent = '\u{1F4BC} Sous-traitants';

  colHeaders.appendChild(colChantier);
  colHeaders.appendChild(colPersonnel);
  colHeaders.appendChild(colVehicule);
  colHeaders.appendChild(colSoustraitant);

  // Rows container
  var rowsContainer = document.createElement('div');
  rowsContainer.className = 'ph-rows';

  // Assemble grid
  grid.appendChild(dateHeader);
  grid.appendChild(colHeaders);
  grid.appendChild(rowsContainer);

  // --- Resource Panel ---
  var resources = document.createElement('div');
  resources.className = 'ph-resources';

  var resTitle = document.createElement('div');
  resTitle.className = 'ph-resources-title';
  resTitle.textContent = 'Ressources';

  var resBody = document.createElement('div');
  resBody.className = 'ph-resources-body';

  // Personnel section
  var secPersonnel = document.createElement('div');
  var labelPersonnel = document.createElement('div');
  labelPersonnel.className = 'ph-res-section-label';
  labelPersonnel.style.color = '#3B82F6';
  labelPersonnel.textContent = '\u{1F464} Personnel';
  var poolPersonnel = document.createElement('div');
  poolPersonnel.className = 'ph-res-pool pool-personnel';
  secPersonnel.appendChild(labelPersonnel);
  secPersonnel.appendChild(poolPersonnel);

  // Véhicule section
  var secVehicule = document.createElement('div');
  var labelVehicule = document.createElement('div');
  labelVehicule.className = 'ph-res-section-label';
  labelVehicule.style.color = '#10B981';
  labelVehicule.textContent = '\u{1F699} Véhicules';
  var poolVehicule = document.createElement('div');
  poolVehicule.className = 'ph-res-pool pool-vehicule';
  secVehicule.appendChild(labelVehicule);
  secVehicule.appendChild(poolVehicule);

  // Sous-traitant section
  var secSoustraitant = document.createElement('div');
  var labelSoustraitant = document.createElement('div');
  labelSoustraitant.className = 'ph-res-section-label';
  labelSoustraitant.style.color = '#F59E0B';
  labelSoustraitant.textContent = '\u{1F4BC} Sous-traitants';
  var poolSoustraitant = document.createElement('div');
  poolSoustraitant.className = 'ph-res-pool pool-soustraitant';
  secSoustraitant.appendChild(labelSoustraitant);
  secSoustraitant.appendChild(poolSoustraitant);

  resBody.appendChild(secPersonnel);
  resBody.appendChild(secVehicule);
  resBody.appendChild(secSoustraitant);

  resources.appendChild(resTitle);
  resources.appendChild(resBody);

  // Assemble main container
  container.appendChild(grid);
  container.appendChild(resources);

  // --- Store references ---
  instance.data.container = container;
  instance.data.dateLabel = dateLabel;
  instance.data.dateInput = dateInput;
  instance.data.rowsContainer = rowsContainer;
  instance.data.poolPersonnel = poolPersonnel;
  instance.data.poolVehicule = poolVehicule;
  instance.data.poolSoustraitant = poolSoustraitant;
  instance.data.instanceId = instanceId;

  // --- Helper: format date in French ---
  instance.data.formatDate = function(date) {
    var days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    var months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    var d = new Date(date);
    return days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  };

  // --- Helper: create a chantier row ---
  instance.data.createRow = function(name) {
    var row = document.createElement('div');
    row.className = 'ph-row';

    var cellChantier = document.createElement('div');
    cellChantier.className = 'ph-cell-chantier';

    var chantierName = document.createElement('span');
    chantierName.className = 'ph-chantier-name';
    chantierName.textContent = name;

    var infoBtn = document.createElement('span');
    infoBtn.className = 'ph-info-btn';
    infoBtn.textContent = 'i';

    cellChantier.appendChild(chantierName);
    cellChantier.appendChild(infoBtn);

    var zonePersonnel = document.createElement('div');
    zonePersonnel.className = 'ph-drop-zone zone-personnel';
    var labelP = document.createElement('span');
    labelP.className = 'ph-empty-label label-personnel';
    labelP.textContent = 'Personnel';
    zonePersonnel.appendChild(labelP);

    var zoneVehicule = document.createElement('div');
    zoneVehicule.className = 'ph-drop-zone zone-vehicule';
    var labelV = document.createElement('span');
    labelV.className = 'ph-empty-label label-vehicule';
    labelV.textContent = 'Véhicules';
    zoneVehicule.appendChild(labelV);

    var zoneSoustraitant = document.createElement('div');
    zoneSoustraitant.className = 'ph-drop-zone zone-soustraitant';
    var labelS = document.createElement('span');
    labelS.className = 'ph-empty-label label-soustraitant';
    labelS.textContent = 'Sous-traitants';
    zoneSoustraitant.appendChild(labelS);

    row.appendChild(cellChantier);
    row.appendChild(zonePersonnel);
    row.appendChild(zoneVehicule);
    row.appendChild(zoneSoustraitant);

    return row;
  };

  // --- Helper: create a resource tag ---
  instance.data.createTag = function(name, type, removable) {
    var tag = document.createElement('span');
    tag.className = 'ph-res-tag tag-' + type;
    tag.setAttribute('draggable', 'true');
    tag.textContent = name;
    if (removable) {
      var btn = document.createElement('span');
      btn.className = 'ph-tag-remove';
      btn.textContent = '\u2715';
      tag.appendChild(btn);
    }
    return tag;
  };

  // ===========================================
  // DATE NAVIGATION
  // ===========================================
  instance.data.currentDate = null;

  function shiftDate(delta) {
    if (!instance.data.currentDate) return;
    var d = new Date(instance.data.currentDate);
    d.setDate(d.getDate() + delta);
    d.setHours(0, 0, 0, 0);
    instance.publishState('selected_date', d);
    instance.triggerEvent('date_changed');
  }

  btnPrev.addEventListener('click', function() { shiftDate(-1); });
  btnNext.addEventListener('click', function() { shiftDate(1); });

  dateCenter.addEventListener('click', function() {
    dateInput.showPicker();
  });

  dateInput.addEventListener('change', function() {
    if (!dateInput.value) return;
    var parts = dateInput.value.split('-');
    var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    d.setHours(0, 0, 0, 0);
    instance.publishState('selected_date', d);
    instance.triggerEvent('date_changed');
  });

  // --- Helper: get tag type from class ---
  function getTagType(el) {
    if (el.classList.contains('tag-personnel')) return 'personnel';
    if (el.classList.contains('tag-vehicule')) return 'vehicule';
    if (el.classList.contains('tag-soustraitant')) return 'soustraitant';
    return null;
  }

  // --- Helper: get zone type from class ---
  function getZoneType(el) {
    if (el.classList.contains('zone-personnel') || el.classList.contains('pool-personnel')) return 'personnel';
    if (el.classList.contains('zone-vehicule') || el.classList.contains('pool-vehicule')) return 'vehicule';
    if (el.classList.contains('zone-soustraitant') || el.classList.contains('pool-soustraitant')) return 'soustraitant';
    return null;
  }

  // --- Helper: restore empty label if zone has no tags left ---
  function maybeRestoreLabel(zone, type) {
    if (!zone || !zone.classList.contains('ph-drop-zone')) return;
    if (zone.querySelectorAll('.ph-res-tag').length > 0) return;
    var label = document.createElement('span');
    label.className = 'ph-empty-label label-' + type;
    if (type === 'personnel') label.textContent = 'Personnel';
    else if (type === 'vehicule') label.textContent = 'V\u00e9hicules';
    else if (type === 'soustraitant') label.textContent = 'Sous-traitants';
    zone.appendChild(label);
  }

  // --- Helper: get pool element by type ---
  function getPool(type) {
    if (type === 'personnel') return poolPersonnel;
    if (type === 'vehicule') return poolVehicule;
    if (type === 'soustraitant') return poolSoustraitant;
    return null;
  }

  // --- Helper: clear all drag highlights ---
  function clearHighlights() {
    var items = container.querySelectorAll('.ph-drag-over');
    for (var i = 0; i < items.length; i++) { items[i].classList.remove('ph-drag-over'); }
  }

  // ===========================================
  // DRAG & DROP
  // ===========================================
  var dragData = null;

  container.addEventListener('dragstart', function(e) {
    var tag = e.target.closest('.ph-res-tag');
    if (!tag) return;

    var type = getTagType(tag);
    if (!type) return;

    var sourceZone = tag.parentElement;
    var sourceRow = sourceZone ? sourceZone.closest('.ph-row') : null;

    dragData = {
      tag: tag,
      type: type,
      resourceId: tag._resourceId,
      sourceRow: sourceRow,
      sourceZone: sourceZone
    };

    tag.classList.add('ph-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  });

  container.addEventListener('dragover', function(e) {
    if (!dragData) return;

    clearHighlights();

    var zone = e.target.closest('.ph-drop-zone, .ph-res-pool');
    if (!zone) return;

    if (getZoneType(zone) !== dragData.type) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    zone.classList.add('ph-drag-over');
  });

  container.addEventListener('drop', function(e) {
    e.preventDefault();
    clearHighlights();
    if (!dragData) return;

    var zone = e.target.closest('.ph-drop-zone, .ph-res-pool');
    if (!zone) { dragData = null; return; }
    if (getZoneType(zone) !== dragData.type) { dragData = null; return; }

    var isPool = zone.classList.contains('ph-res-pool');
    var targetRow = isPool ? null : zone.closest('.ph-row');
    var sourceRow = dragData.sourceRow;
    var isFromPool = !sourceRow;

    var sourceObj = (sourceRow && sourceRow._bubbleObject) ? sourceRow._bubbleObject : null;
    var targetObj = (targetRow && targetRow._bubbleObject) ? targetRow._bubbleObject : null;
    var sourceId = sourceObj ? sourceObj.get('_id') : null;
    var targetId = targetObj ? targetObj.get('_id') : null;

    // --- Drop on pool = removal ---
    if (isPool) {
      if (isFromPool) { dragData = null; return; }

      var tag = dragData.tag;
      tag.classList.remove('ph-dragging');
      var btn = tag.querySelector('.ph-tag-remove');
      if (btn) btn.remove();
      zone.appendChild(tag);
      maybeRestoreLabel(dragData.sourceZone, dragData.type);

      instance.publishState('resource_type', dragData.type);
      instance.publishState('resource_id', dragData.resourceId);
      instance.publishState('source_chantier', sourceObj);
      instance.publishState('target_chantier', null);
      instance.triggerEvent('assignment_removed');
      dragData = null;
      return;
    }

    // --- Drop on drop zone ---
    if (!isFromPool && sourceId === targetId) { dragData.tag.classList.remove('ph-dragging'); dragData = null; return; }

    var tag = dragData.tag;
    tag.classList.remove('ph-dragging');

    if (isFromPool) {
      var btn = document.createElement('span');
      btn.className = 'ph-tag-remove';
      btn.textContent = '\u2715';
      tag.appendChild(btn);
    }

    var emptyLabel = zone.querySelector('.ph-empty-label');
    if (emptyLabel) emptyLabel.remove();
    zone.appendChild(tag);

    if (!isFromPool) {
      maybeRestoreLabel(dragData.sourceZone, dragData.type);
    }

    instance.publishState('resource_type', dragData.type);
    instance.publishState('resource_id', tag._resourceId);
    instance.publishState('target_chantier', targetObj);
    instance.publishState('source_chantier', sourceObj);
    instance.triggerEvent('assignment_changed');
    dragData = null;
  });

  container.addEventListener('dragend', function(e) {
    if (dragData && dragData.tag) {
      dragData.tag.classList.remove('ph-dragging');
    }
    clearHighlights();
    dragData = null;
  });

  // ===========================================
  // X BUTTON (remove from chantier → back to pool)
  // ===========================================
  container.addEventListener('click', function(e) {
    var btn = e.target.closest('.ph-tag-remove');
    if (!btn) return;

    var tag = btn.closest('.ph-res-tag');
    if (!tag) return;

    var zone = tag.parentElement;
    var row = zone ? zone.closest('.ph-row') : null;
    if (!row) return;

    var type = getTagType(tag);
    if (!type) return;

    var chantierObj = row._bubbleObject || null;

    btn.remove();
    var pool = getPool(type);
    if (pool) pool.appendChild(tag);

    maybeRestoreLabel(zone, type);

    instance.publishState('resource_type', type);
    instance.publishState('resource_id', tag._resourceId);
    instance.publishState('source_chantier', chantierObj);
    instance.publishState('target_chantier', null);
    instance.triggerEvent('assignment_removed');
  });

  // ===========================================
  // INFO BUTTON (chantier details)
  // ===========================================
  container.addEventListener('click', function(e) {
    var btn = e.target.closest('.ph-info-btn');
    if (!btn) return;

    var row = btn.closest('.ph-row');
    if (!row || !row._bubbleObject) return;

    instance.publishState('selected_chantier', row._bubbleObject);
    instance.triggerEvent('chantier_info_clicked');
  });

  // Append to canvas
  instance.canvas.append(container);

  instance.data.initialized = true;
}