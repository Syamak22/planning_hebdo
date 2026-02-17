function(instance, context) {

  // --- Instance ID ---
  let instanceId = (Math.random() * Math.pow(2, 54)).toString(36);
  instance.data.instanceName = 'planningHebdo-' + instanceId;

  // --- Colors ---
  instance.data.colors = {
    personnel:     { main: '#3B82F6', bg: '#EFF6FF' },
    vehicule:      { main: '#10B981', bg: '#ECFDF5' },
    soustraitant:  { main: '#F59E0B', bg: '#FFFBEB' },
    atelier:       { main: '#8B5CF6', bg: '#F5F3FF' },
    bureau:        { main: '#0EA5E9', bg: '#F0F9FF' },
    absence:       { main: '#EF4444', bg: '#FEF2F2' }
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

    /* --- Main column (grid + absences + bureau) --- */
    .planningHebdo-${instanceId} .ph-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      min-height: 0;
      gap: 12px;
      overflow: hidden;
    }

    .planningHebdo-${instanceId} .ph-grid {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      min-height: 0;
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
      min-height: 0;
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

    .planningHebdo-${instanceId} .ph-drop-zone.zone-atelier {
      background: #F5F3FF66;
    }

    .planningHebdo-${instanceId} .ph-drop-zone.zone-bureau {
      background: #F0F9FF66;
    }

    .planningHebdo-${instanceId} .ph-drop-zone.zone-absence {
      background: #FEF2F266;
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

    .planningHebdo-${instanceId} .ph-empty-label.label-atelier {
      color: #8B5CF688;
    }

    .planningHebdo-${instanceId} .ph-empty-label.label-bureau {
      color: #0EA5E988;
    }

    .planningHebdo-${instanceId} .ph-empty-label.label-absence {
      color: #EF444488;
    }

    /* --- Absences / Bureau sections --- */
    .planningHebdo-${instanceId} .ph-section {
      flex: none;
      display: flex;
      flex-direction: column;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      overflow: hidden;
    }

    .planningHebdo-${instanceId} .ph-section-header {
      padding: 8px 12px;
      border-bottom: 1px solid #E2E8F0;
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .planningHebdo-${instanceId} .ph-absence-row {
      display: flex;
      align-items: stretch;
      border-bottom: 1px solid #F1F5F9;
      min-height: 38px;
    }

    .planningHebdo-${instanceId} .ph-absence-row:last-child {
      border-bottom: none;
    }

    .planningHebdo-${instanceId} .ph-absence-label {
      width: 130px;
      min-width: 130px;
      padding: 6px 10px;
      font-size: 11px;
      font-weight: 600;
      color: #64748B;
      border-right: 1px solid #E2E8F0;
      background: #FAFBFC;
      display: flex;
      align-items: center;
    }

    /* --- Bureau section --- */
    .planningHebdo-${instanceId} .ph-bureau-zone {
      padding: 6px 10px;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      align-items: center;
      min-height: 34px;
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

    .planningHebdo-${instanceId} .ph-drop-zone.zone-atelier.ph-drag-over {
      outline-color: #8B5CF6;
      background: #F5F3FFAA;
    }

    .planningHebdo-${instanceId} .ph-drop-zone.zone-bureau.ph-drag-over {
      outline-color: #0EA5E9;
      background: #F0F9FFAA;
    }

    .planningHebdo-${instanceId} .ph-drop-zone.zone-absence.ph-drag-over {
      outline-color: #EF4444;
      background: #FEF2F2AA;
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

    /* --- Duplicate button --- */
    .planningHebdo-${instanceId} .ph-duplicate-btn {
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
      right: 48px;
    }

    .planningHebdo-${instanceId} .ph-duplicate-btn:hover {
      background: #CBD5E1;
      color: #334155;
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

    /* (print handled via popup window) */
  `;
  document.head.appendChild(style);

  // --- DOM Structure ---
  var container = document.createElement('div');
  container.className = 'planningHebdo-' + instanceId;

  // Main column (grid + absences + bureau)
  var mainCol = document.createElement('div');
  mainCol.className = 'ph-main';

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
    var dateStr = instance.data.currentDate
      ? instance.data.formatDate(instance.data.currentDate)
      : '';
    var now = new Date();
    var timestamp = ('0' + now.getDate()).slice(-2) + '/' + ('0' + (now.getMonth() + 1)).slice(-2) + '/' + now.getFullYear() + ' ' + ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);

    // --- Build chantier rows HTML ---
    var chantierRowsHtml = '';
    var rows = instance.data.rowsContainer.querySelectorAll('.ph-row');
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var chantierCell = row.querySelector('.ph-cell-chantier');
      var chantierName = chantierCell ? chantierCell.textContent.replace(/[iℹ]?\s*$/, '').trim() : '';
      var isStart = row.classList.contains('ph-row-start');
      var zones = row.querySelectorAll('.ph-drop-zone');
      var cells = '';
      for (var z = 0; z < zones.length; z++) {
        var tags = zones[z].querySelectorAll('.ph-res-tag');
        var tagsHtml = '';
        if (tags.length > 0) {
          for (var t = 0; t < tags.length; t++) {
            var tagText = tags[t].textContent.replace(/\s*×\s*$/, '').trim();
            var tagClass = '';
            if (tags[t].classList.contains('tag-personnel')) tagClass = 'tag-personnel';
            else if (tags[t].classList.contains('tag-vehicule')) tagClass = 'tag-vehicule';
            else if (tags[t].classList.contains('tag-soustraitant')) tagClass = 'tag-soustraitant';
            tagsHtml += '<span class="tag ' + tagClass + '">' + tagText + '</span>';
          }
        }
        cells += '<td class="cell">' + tagsHtml + '</td>';
      }
      chantierRowsHtml += '<tr' + (isStart ? ' class="row-start"' : '') + '><td class="cell cell-chantier">' + chantierName + '</td>' + cells + '</tr>';
    }

    // --- Build absence rows HTML ---
    var absenceRowsHtml = '';
    var absRows = instance.data.absencesBody.querySelectorAll('.ph-absence-row');
    for (var i = 0; i < absRows.length; i++) {
      var motifCell = absRows[i].querySelector('.ph-cell-chantier');
      var motifName = motifCell ? motifCell.textContent.trim() : '';
      var zone = absRows[i].querySelector('.ph-drop-zone');
      var tags = zone ? zone.querySelectorAll('.ph-res-tag') : [];
      var tagsHtml = '';
      for (var t = 0; t < tags.length; t++) {
        var tagText = tags[t].textContent.replace(/\s*×\s*$/, '').trim();
        tagsHtml += '<span class="tag tag-personnel">' + tagText + '</span>';
      }
      absenceRowsHtml += '<tr><td class="cell cell-motif">' + motifName + '</td><td class="cell" colspan="4">' + tagsHtml + '</td></tr>';
    }

    // --- Build bureau HTML ---
    var bureauTagsHtml = '';
    var bureauTags = instance.data.bureauZone.querySelectorAll('.ph-res-tag');
    for (var t = 0; t < bureauTags.length; t++) {
      var tagText = bureauTags[t].textContent.replace(/\s*×\s*$/, '').trim();
      bureauTagsHtml += '<span class="tag tag-personnel">' + tagText + '</span>';
    }

    // --- Full HTML document ---
    var html = '<!DOCTYPE html><html><head><meta charset="utf-8">' +
      '<title>Planning' + (dateStr ? ' - ' + dateStr : '') + '</title>' +
      '<style>' +
      '* { margin: 0; padding: 0; box-sizing: border-box; }' +
      'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 11px; color: #1e293b; padding: 20px; }' +
      '.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 9px; color: #94a3b8; }' +
      '.date-title { text-align: center; font-size: 14px; font-weight: 600; padding: 10px 0; border: 1px solid #ccc; border-bottom: none; background: #f8fafc; }' +
      'table { width: 100%; border-collapse: collapse; }' +
      'th { background: #f8fafc; font-weight: 600; text-align: left; padding: 4px 6px; border: 1px solid #ccc; font-size: 10px; }' +
      'th.col-chantier { width: 22%; }' +
      'td.cell { padding: 4px 6px; border: 1px solid #ddd; vertical-align: top; }' +
      'td.cell-chantier, td.cell-motif { font-weight: 500; width: 22%; }' +
      'tr.row-start td.cell-chantier { border-left: 3px solid #22c55e; }' +
      '.section-title { font-size: 11px; font-weight: 600; padding: 6px; border: 1px solid #ccc; border-bottom: none; margin-top: 12px; }' +
      '.section-title.absence { color: #ef4444; }' +
      '.section-title.bureau { color: #3b82f6; }' +
      '.bureau-content { padding: 6px; border: 1px solid #ccc; min-height: 24px; display: flex; flex-wrap: wrap; gap: 4px; }' +
      '.tag { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 10px; border: 1px solid; margin: 1px; }' +
      '.tag-personnel { color: #1d4ed8; border-color: #1d4ed8; background: #eff6ff; }' +
      '.tag-vehicule { color: #15803d; border-color: #15803d; background: #f0fdf4; }' +
      '.tag-soustraitant { color: #c2410c; border-color: #c2410c; background: #fff7ed; }' +
      '@media print { body { padding: 10px; } }' +
      '</style></head><body>' +
      '<div class="header"><span>' + timestamp + '</span><span>Planning - ' + dateStr + '</span></div>' +
      '<div class="date-title">' + dateStr + '</div>' +
      '<table>' +
      '<thead><tr><th class="col-chantier">CHANTIER</th><th>\ud83d\udc64 PERSONNEL</th><th>\ud83d\ude9a V\u00c9HICULES</th><th>\ud83d\udce6 SOUS-TRAITANTS</th><th>\ud83d\udd27 ATELIER</th></tr></thead>' +
      '<tbody>' + chantierRowsHtml + '</tbody>' +
      '</table>' +
      '<div class="section-title absence">\u26d4 Absences / Indisponibilit\u00e9s</div>' +
      '<table><tbody>' + absenceRowsHtml + '</tbody></table>' +
      '<div class="section-title bureau">\ud83c\udfe2 Bureau</div>' +
      '<div class="bureau-content">' + (bureauTagsHtml || '<span style="color:#94a3b8;">Personnel au bureau</span>') + '</div>' +
      '</body></html>';

    var printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = function() { printWindow.print(); };
  });

  // Duplicate button + hidden date input
  var btnDuplicate = document.createElement('div');
  btnDuplicate.className = 'ph-duplicate-btn';
  btnDuplicate.title = 'Dupliquer le planning vers une autre date';
  btnDuplicate.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

  var duplicateDateInput = document.createElement('input');
  duplicateDateInput.type = 'date';
  duplicateDateInput.className = 'ph-date-input';
  btnDuplicate.appendChild(duplicateDateInput);

  btnDuplicate.addEventListener('click', function() {
    duplicateDateInput.showPicker();
  });

  duplicateDateInput.addEventListener('change', function() {
    if (!duplicateDateInput.value) return;
    var parts = duplicateDateInput.value.split('-');
    var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    d.setHours(0, 0, 0, 0);
    duplicateDateInput.value = '';
    resetAllStates();
    instance.publishState('duplicate_target_date', d);
    instance.triggerEvent('duplicate_requested');
  });

  dateHeader.appendChild(btnPrev);
  dateHeader.appendChild(dateCenter);
  dateHeader.appendChild(btnNext);
  dateHeader.appendChild(btnDuplicate);
  dateHeader.appendChild(btnPrint);

  // Column headers (5 columns: chantier + personnel + vehicule + soustraitant + atelier)
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
  colVehicule.textContent = '\u{1F699} V\u00e9hicules';

  var colSoustraitant = document.createElement('div');
  colSoustraitant.className = 'ph-col-header';
  colSoustraitant.style.color = '#F59E0B';
  colSoustraitant.textContent = '\u{1F4BC} Sous-traitants';

  var colAtelier = document.createElement('div');
  colAtelier.className = 'ph-col-header';
  colAtelier.style.color = '#8B5CF6';
  colAtelier.textContent = '\u{1F527} Atelier';

  colHeaders.appendChild(colChantier);
  colHeaders.appendChild(colPersonnel);
  colHeaders.appendChild(colVehicule);
  colHeaders.appendChild(colSoustraitant);
  colHeaders.appendChild(colAtelier);

  // Rows container
  var rowsContainer = document.createElement('div');
  rowsContainer.className = 'ph-rows';

  // Assemble grid
  grid.appendChild(dateHeader);
  grid.appendChild(colHeaders);
  grid.appendChild(rowsContainer);

  // --- Absences section ---
  var absencesSection = document.createElement('div');
  absencesSection.className = 'ph-section';

  var absencesHeader = document.createElement('div');
  absencesHeader.className = 'ph-section-header';
  absencesHeader.style.background = '#FEF2F2';
  absencesHeader.style.color = '#EF4444';
  absencesHeader.innerHTML = '\u{1F6AB} Absences / Indisponibilit\u00e9s';

  var absencesBody = document.createElement('div');
  absencesBody.className = 'ph-absences-body';

  absencesSection.appendChild(absencesHeader);
  absencesSection.appendChild(absencesBody);

  // --- Bureau section ---
  var bureauSection = document.createElement('div');
  bureauSection.className = 'ph-section';

  var bureauHeader = document.createElement('div');
  bureauHeader.className = 'ph-section-header';
  bureauHeader.style.background = '#F0F9FF';
  bureauHeader.style.color = '#0EA5E9';
  bureauHeader.innerHTML = '\u{1F4BC} Bureau';

  var bureauZone = document.createElement('div');
  bureauZone.className = 'ph-bureau-zone ph-drop-zone zone-bureau';
  var bureauEmptyLabel = document.createElement('span');
  bureauEmptyLabel.className = 'ph-empty-label label-bureau';
  bureauEmptyLabel.textContent = 'Personnel au bureau';
  bureauZone.appendChild(bureauEmptyLabel);

  bureauSection.appendChild(bureauHeader);
  bureauSection.appendChild(bureauZone);

  // Assemble main column
  mainCol.appendChild(grid);
  mainCol.appendChild(absencesSection);
  mainCol.appendChild(bureauSection);

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
  labelVehicule.textContent = '\u{1F699} V\u00e9hicules';
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
  container.appendChild(mainCol);
  container.appendChild(resources);

  // --- Store references ---
  instance.data.container = container;
  instance.data.dateLabel = dateLabel;
  instance.data.dateInput = dateInput;
  instance.data.rowsContainer = rowsContainer;
  instance.data.poolPersonnel = poolPersonnel;
  instance.data.poolVehicule = poolVehicule;
  instance.data.poolSoustraitant = poolSoustraitant;
  instance.data.absencesBody = absencesBody;
  instance.data.bureauZone = bureauZone;
  instance.data.btnDuplicate = btnDuplicate;
  instance.data.instanceId = instanceId;

  // --- Helper: format date in French ---
  instance.data.formatDate = function(date) {
    var days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    var months = ['janvier', 'f\u00e9vrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'ao\u00fbt', 'septembre', 'octobre', 'novembre', 'd\u00e9cembre'];
    var d = new Date(date);
    return days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  };

  // --- Helper: create a chantier row (now with 4 drop zones) ---
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
    labelV.textContent = 'V\u00e9hicules';
    zoneVehicule.appendChild(labelV);

    var zoneSoustraitant = document.createElement('div');
    zoneSoustraitant.className = 'ph-drop-zone zone-soustraitant';
    var labelS = document.createElement('span');
    labelS.className = 'ph-empty-label label-soustraitant';
    labelS.textContent = 'Sous-traitants';
    zoneSoustraitant.appendChild(labelS);

    var zoneAtelier = document.createElement('div');
    zoneAtelier.className = 'ph-drop-zone zone-atelier';
    var labelA = document.createElement('span');
    labelA.className = 'ph-empty-label label-atelier';
    labelA.textContent = 'Atelier';
    zoneAtelier.appendChild(labelA);

    row.appendChild(cellChantier);
    row.appendChild(zonePersonnel);
    row.appendChild(zoneVehicule);
    row.appendChild(zoneSoustraitant);
    row.appendChild(zoneAtelier);

    return row;
  };

  // --- Helper: create an absence row ---
  instance.data.createAbsenceRow = function(typeName) {
    var row = document.createElement('div');
    row.className = 'ph-absence-row';

    var label = document.createElement('div');
    label.className = 'ph-absence-label';
    label.textContent = typeName;

    var zone = document.createElement('div');
    zone.className = 'ph-drop-zone zone-absence';
    zone.style.flex = '1';
    var emptyLabel = document.createElement('span');
    emptyLabel.className = 'ph-empty-label label-absence';
    emptyLabel.textContent = '\u2014';
    zone.appendChild(emptyLabel);

    row.appendChild(label);
    row.appendChild(zone);

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
    resetAllStates();
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
    resetAllStates();
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

  // --- Helper: get zone type from class (what resource type the zone accepts) ---
  function getZoneAcceptsType(el) {
    if (el.classList.contains('zone-personnel') || el.classList.contains('pool-personnel')) return 'personnel';
    if (el.classList.contains('zone-vehicule') || el.classList.contains('pool-vehicule')) return 'vehicule';
    if (el.classList.contains('zone-soustraitant') || el.classList.contains('pool-soustraitant')) return 'soustraitant';
    // Atelier, bureau, absence accept personnel only
    if (el.classList.contains('zone-atelier')) return 'personnel';
    if (el.classList.contains('zone-bureau')) return 'personnel';
    if (el.classList.contains('zone-absence')) return 'personnel';
    return null;
  }

  // --- Helper: get the drop_zone semantic name ---
  function getDropZoneName(el) {
    if (el.classList.contains('zone-personnel')) return 'personnel';
    if (el.classList.contains('zone-vehicule')) return 'vehicule';
    if (el.classList.contains('zone-soustraitant')) return 'soustraitant';
    if (el.classList.contains('zone-atelier')) return 'atelier';
    if (el.classList.contains('zone-bureau')) return 'bureau';
    if (el.classList.contains('zone-absence')) return 'absence';
    if (el.classList.contains('pool-personnel')) return 'pool';
    if (el.classList.contains('pool-vehicule')) return 'pool';
    if (el.classList.contains('pool-soustraitant')) return 'pool';
    return null;
  }

  // --- Helper: get absence motif from an absence row ---
  function getAbsenceMotif(zone) {
    var absRow = zone.closest('.ph-absence-row');
    if (!absRow) return null;
    return absRow._motifName || null;
  }

  // --- Helper: restore empty label if zone has no tags left ---
  function maybeRestoreLabel(zone) {
    if (!zone || !zone.classList.contains('ph-drop-zone')) return;
    if (zone.querySelectorAll('.ph-res-tag').length > 0) return;
    var zoneName = getDropZoneName(zone);
    var label = document.createElement('span');
    label.className = 'ph-empty-label label-' + zoneName;
    if (zoneName === 'personnel') label.textContent = 'Personnel';
    else if (zoneName === 'vehicule') label.textContent = 'V\u00e9hicules';
    else if (zoneName === 'soustraitant') label.textContent = 'Sous-traitants';
    else if (zoneName === 'atelier') label.textContent = 'Atelier';
    else if (zoneName === 'bureau') label.textContent = 'Personnel au bureau';
    else if (zoneName === 'absence') label.textContent = '\u2014';
    zone.appendChild(label);
  }

  // --- Helper: get pool element by type ---
  function getPool(type) {
    if (type === 'personnel') return poolPersonnel;
    if (type === 'vehicule') return poolVehicule;
    if (type === 'soustraitant') return poolSoustraitant;
    return null;
  }

  // --- Helper: reset all states before publishing new ones ---
  function resetAllStates() {
    instance.publishState('resource_type', null);
    instance.publishState('resource_id', null);
    instance.publishState('source_chantier', null);
    instance.publishState('target_chantier', null);
    instance.publishState('source_zone', null);
    instance.publishState('drop_zone', null);
    instance.publishState('motif_absence', null);
    instance.publishState('selected_chantier', null);
    instance.publishState('selected_date', null);
    instance.publishState('duplicate_target_date', null);
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
    var sourceAbsRow = sourceZone ? sourceZone.closest('.ph-absence-row') : null;

    dragData = {
      tag: tag,
      type: type,
      resourceId: tag._resourceId,
      sourceRow: sourceRow,
      sourceAbsRow: sourceAbsRow,
      sourceZone: sourceZone,
      sourceZoneName: sourceZone ? getDropZoneName(sourceZone) : 'pool'
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

    // Check if the zone accepts this resource type
    if (getZoneAcceptsType(zone) !== dragData.type) return;

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
    if (getZoneAcceptsType(zone) !== dragData.type) { dragData = null; return; }

    var isPool = zone.classList.contains('ph-res-pool');
    var targetRow = isPool ? null : zone.closest('.ph-row');
    var targetAbsRow = isPool ? null : zone.closest('.ph-absence-row');
    var sourceRow = dragData.sourceRow;
    var sourceAbsRow = dragData.sourceAbsRow;
    var isFromPool = !sourceRow && !sourceAbsRow && dragData.sourceZoneName === 'pool';

    var sourceChantierObj = (sourceRow && sourceRow._bubbleObject) ? sourceRow._bubbleObject : null;
    var targetChantierObj = (targetRow && targetRow._bubbleObject) ? targetRow._bubbleObject : null;

    var targetZoneName = getDropZoneName(zone);
    var sourceZoneName = dragData.sourceZoneName;

    // Compute target absence motif
    var targetMotif = (targetAbsRow && targetAbsRow._motifName) ? targetAbsRow._motifName : null;
    var sourceMotif = (sourceAbsRow && sourceAbsRow._motifName) ? sourceAbsRow._motifName : null;

    // --- Drop on pool = removal ---
    if (isPool) {
      if (isFromPool) { dragData = null; return; }

      var tag = dragData.tag;
      tag.classList.remove('ph-dragging');
      var btn = tag.querySelector('.ph-tag-remove');
      if (btn) btn.remove();
      zone.appendChild(tag);
      maybeRestoreLabel(dragData.sourceZone);

      resetAllStates();
      instance.publishState('resource_type', dragData.type);
      instance.publishState('resource_id', dragData.resourceId);
      instance.publishState('source_chantier', sourceChantierObj);
      instance.publishState('source_zone', sourceZoneName);
      instance.publishState('drop_zone', 'pool');
      instance.publishState('motif_absence', sourceMotif);
      instance.triggerEvent('assignment_removed');
      dragData = null;
      return;
    }

    // --- Prevent dropping on exact same zone ---
    if (dragData.sourceZone === zone) { dragData.tag.classList.remove('ph-dragging'); dragData = null; return; }

    // --- Check if same chantier same zone type (no-op) ---
    var sourceId = sourceChantierObj ? sourceChantierObj.get('_id') : null;
    var targetId = targetChantierObj ? targetChantierObj.get('_id') : null;
    if (sourceId && targetId && sourceId === targetId && sourceZoneName === targetZoneName) {
      dragData.tag.classList.remove('ph-dragging');
      dragData = null;
      return;
    }

    var tag = dragData.tag;
    tag.classList.remove('ph-dragging');

    // Add X button if coming from pool
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
      maybeRestoreLabel(dragData.sourceZone);
    }

    resetAllStates();
    instance.publishState('resource_type', dragData.type);
    instance.publishState('resource_id', tag._resourceId);
    instance.publishState('target_chantier', targetChantierObj);
    instance.publishState('source_chantier', sourceChantierObj);
    instance.publishState('drop_zone', targetZoneName);
    instance.publishState('source_zone', sourceZoneName);
    instance.publishState('motif_absence', targetMotif);
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
  // X BUTTON (remove → back to pool)
  // ===========================================
  container.addEventListener('click', function(e) {
    var btn = e.target.closest('.ph-tag-remove');
    if (!btn) return;

    var tag = btn.closest('.ph-res-tag');
    if (!tag) return;

    var zone = tag.parentElement;
    if (!zone) return;

    var type = getTagType(tag);
    if (!type) return;

    var row = zone.closest('.ph-row');
    var absRow = zone.closest('.ph-absence-row');
    var chantierObj = (row && row._bubbleObject) ? row._bubbleObject : null;
    var zoneName = getDropZoneName(zone);
    var motif = (absRow && absRow._motifName) ? absRow._motifName : null;

    btn.remove();
    var pool = getPool(type);
    if (pool) pool.appendChild(tag);

    maybeRestoreLabel(zone);

    resetAllStates();
    instance.publishState('resource_type', type);
    instance.publishState('resource_id', tag._resourceId);
    instance.publishState('source_chantier', chantierObj);
    instance.publishState('source_zone', zoneName);
    instance.publishState('drop_zone', 'pool');
    instance.publishState('motif_absence', motif);
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

    resetAllStates();
    instance.publishState('selected_chantier', row._bubbleObject);
    instance.triggerEvent('chantier_info_clicked');
  });

  // Append to canvas
  instance.canvas.append(container);

  instance.data.initialized = true;
}