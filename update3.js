function(instance, properties, context) {

  // --- Properties ---
  var dataChantier = properties.data_type_chantier;
  var nameChantier = properties.name_display_chantier;
  var dayDate = properties.day_date;

  var dataPersonnel = properties.data_type_personnel;
  var namePersonnel = properties.name_display_personnel;

  var dataVehicule = properties.data_type_vehicule;
  var nameVehicule = properties.name_display_vehicule;
  var dataVehiculeIndisponible = properties.data_type_vehicule_indisponible;
  var fieldConducteur1 = properties.field_conducteur_1_vehicule;
  var fieldConducteur2 = properties.field_conducteur_2_vehicule;

  var dataSoustraitant = properties.data_type_soustraitant;
  var nameSoustraitant = properties.name_display_soustraitant;

  var resourcesPanelPercent = properties.resources_panel_percent;
  var chantierColWidth = properties.chantier_col_width;

  var fieldDateDebut = properties.date_debut_chantier;

  var dataPlanning = properties.data_type_planning;
  var fieldChantier = properties.field_chantier;
  var fieldPersonnel = properties.field_chantier_personnel;
  var fieldVehicule = properties.field_vehicule;
  var fieldSoustraitant = properties.field_soustraitant;
  var fieldAtelierPersonnel = properties.field_atelier_personnel;
  var fieldCommentaire = properties.field_commentaire;

  var dataAbsenceTypes = properties.data_type_absence_types;
  var dataAbsencePlanning = properties.data_type_absence_planning;
  var fieldAbsenceType = properties.field_absence_type;
  var fieldAbsencePersonnel = properties.field_absence_personnel;

  var dataBureauPlanning = properties.data_type_bureau_planning;
  var fieldBureauPersonnel = properties.field_bureau_personnel;

  var dataLivraisonsDuJour = properties.data_type_livraisons_du_jour;
  var fieldChantierLivraison = properties.field_chantier_planning_atelier;

  // --- Recursion protection ---
  if (instance.data.isUpdating) { return; }
  instance.data.isUpdating = true;

  try {

  if (!instance.data.initialized) { return; }

  // --- Layout CSS variables (before hash check) ---
  if (instance.data.container) {
    var rPct = (resourcesPanelPercent > 0) ? resourcesPanelPercent : 28;
    var cPx  = (chantierColWidth > 0) ? chantierColWidth : 140;
    instance.data.container.style.setProperty('--ph-resources-width', rPct + '%');
    instance.data.container.style.setProperty('--ph-chantier-col-width', cPx + 'px');
  }

  // --- Date header (before hash check) ---
  if (dayDate) {
    instance.data.dateLabel.textContent = instance.data.formatDate(dayDate);
    instance.data.currentDate = dayDate;
    var dd = new Date(dayDate);
    var yyyy = dd.getFullYear();
    var mm = ('0' + (dd.getMonth() + 1)).slice(-2);
    var ddd = ('0' + dd.getDate()).slice(-2);
    instance.data.dateInput.value = yyyy + '-' + mm + '-' + ddd;
  } else {
    instance.data.dateLabel.textContent = '\u2014';
    instance.data.currentDate = null;
  }

  // ===========================================
  // STEP 1: READ ALL DATA
  // ===========================================

  function readList(dataSource) {
    if (!dataSource || typeof dataSource.length !== 'function') { return null; }
    var len = dataSource.length();
    if (len === 0) { return []; }
    return dataSource.get(0, len);
  }

  var chantierItems = null;
  try { chantierItems = readList(dataChantier); }
  catch (e) { if (!e.not_ready_key) { console.error('PH chantier read:', e); } }

  var personnelById = {};
  var vehiculeById = {};
  var soustraitantById = {};

  function buildMap(dataSource, nameField, map) {
    var items = readList(dataSource);
    if (!items) { return; }
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item || typeof item.get !== 'function') { continue; }
      var id = item.get('_id');
      if (id) {
        map[id] = { object: item, name: (nameField ? item.get(nameField) : '\u2014') || '\u2014' };
      }
    }
  }

  try { buildMap(dataPersonnel, namePersonnel, personnelById); }
  catch (e) { if (!e.not_ready_key) { console.error('PH personnel read:', e); } }

  try { buildMap(dataVehicule, nameVehicule, vehiculeById); }
  catch (e) { if (!e.not_ready_key) { console.error('PH vehicule read:', e); } }

  try { buildMap(dataSoustraitant, nameSoustraitant, soustraitantById); }
  catch (e) { if (!e.not_ready_key) { console.error('PH soustraitant read:', e); } }

  var conducteurToVehiculeIds = {};
  try {
    for (var vid in vehiculeById) {
      var vObj = vehiculeById[vid].object;
      var conducteurIds = [];
      if (fieldConducteur1) {
        var c1 = vObj.get(fieldConducteur1);
        if (c1 && typeof c1.get === 'function') { var c1id = c1.get('_id'); if (c1id) conducteurIds.push(c1id); }
      }
      if (fieldConducteur2) {
        var c2 = vObj.get(fieldConducteur2);
        if (c2 && typeof c2.get === 'function') { var c2id = c2.get('_id'); if (c2id) conducteurIds.push(c2id); }
      }
      for (var ci = 0; ci < conducteurIds.length; ci++) {
        if (!conducteurToVehiculeIds[conducteurIds[ci]]) { conducteurToVehiculeIds[conducteurIds[ci]] = []; }
        conducteurToVehiculeIds[conducteurIds[ci]].push(vid);
      }
    }
  } catch (e) { if (!e.not_ready_key) { console.error('PH conducteur map:', e); } }
  instance.data.conducteurToVehiculeIds = conducteurToVehiculeIds;

  var vehiculeIndisponibleSet = {};
  try {
    var indispoItems = readList(dataVehiculeIndisponible);
    if (indispoItems) {
      for (var i = 0; i < indispoItems.length; i++) {
        var indispoItem = indispoItems[i];
        if (indispoItem && typeof indispoItem.get === 'function') {
          var indispoId = indispoItem.get('_id');
          if (indispoId) { vehiculeIndisponibleSet[indispoId] = true; }
        }
      }
    }
  } catch (e) { if (!e.not_ready_key) { console.error('PH vehicule indispo read:', e); } }

  // ===========================================
  // STEP 2: READ PLANNING DATA
  // ===========================================
  var planningMap = {};
  var atelierGeneralPersonnelIds = [];
  var assignedPersonnel = {};
  var assignedVehicule = {};
  var assignedSoustraitant = {};

  function isSameDay(dateVal, refDate) {
    if (!dateVal || !refDate) return false;
    var d1 = new Date(refDate);
    var d2 = new Date(dateVal);
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  }

  function extractIds(sourceItem, fieldName) {
    if (!fieldName) { return []; }
    var ids = [];
    var ref = sourceItem.get(fieldName);
    if (!ref) { return ids; }
    if (typeof ref.length === 'function') {
      var len = ref.length();
      if (len > 0) {
        var items = ref.get(0, len);
        for (var j = 0; j < items.length; j++) {
          if (items[j] && typeof items[j].get === 'function') {
            var id = items[j].get('_id');
            if (id) { ids.push(id); }
          } else if (typeof items[j] === 'string') { ids.push(items[j]); }
        }
      }
    } else if (Array.isArray(ref)) {
      for (var j = 0; j < ref.length; j++) {
        if (ref[j] && typeof ref[j].get === 'function') {
          var id = ref[j].get('_id');
          if (id) { ids.push(id); }
        } else if (typeof ref[j] === 'string') { ids.push(ref[j]); }
      }
    }
    return ids;
  }

  var planningDataReady = false;
  try {
    var planItems = readList(dataPlanning);
    planningDataReady = true;
    if (planItems) {
      for (var i = 0; i < planItems.length; i++) {
        var planItem = planItems[i];
        if (!planItem || typeof planItem.get !== 'function') { continue; }
        var chRef = fieldChantier ? planItem.get(fieldChantier) : null;
        var chId = null;
        if (chRef && typeof chRef.get === 'function') { chId = chRef.get('_id'); }
        else if (typeof chRef === 'string') { chId = chRef; }
        if (!chId) {
          // Pas de chantier → atelier général
          var agIds = extractIds(planItem, fieldAtelierPersonnel);
          for (var j = 0; j < agIds.length; j++) {
            atelierGeneralPersonnelIds.push(agIds[j]);
            assignedPersonnel[agIds[j]] = true;
          }
          continue;
        }
        var commentaire = fieldCommentaire ? (planItem.get(fieldCommentaire) || '') : '';
        var entry = {
          personnel: extractIds(planItem, fieldPersonnel),
          vehicule: extractIds(planItem, fieldVehicule),
          soustraitant: extractIds(planItem, fieldSoustraitant),
          atelier: extractIds(planItem, fieldAtelierPersonnel),
          commentaire: commentaire
        };
        planningMap[chId] = entry;
        for (var j = 0; j < entry.personnel.length; j++) { assignedPersonnel[entry.personnel[j]] = true; }
        for (var j = 0; j < entry.vehicule.length; j++) { assignedVehicule[entry.vehicule[j]] = true; }
        for (var j = 0; j < entry.soustraitant.length; j++) { assignedSoustraitant[entry.soustraitant[j]] = true; }
        for (var j = 0; j < entry.atelier.length; j++) { assignedPersonnel[entry.atelier[j]] = true; }
      }
    }
  } catch (e) { if (!e.not_ready_key) { console.error('PH planning read:', e); } }

  // ===========================================
  // STEP 2b: READ ABSENCE DATA
  // ===========================================
  var absenceMap = {};
  var absenceTypeItems = null;
  try { absenceTypeItems = readList(dataAbsenceTypes); }
  catch (e) { if (!e.not_ready_key) { console.error('PH absence types read:', e); } }

  if (absenceTypeItems) {
    for (var i = 0; i < absenceTypeItems.length; i++) {
      var typeName = absenceTypeItems[i];
      if (typeName && typeof typeName === 'string') { absenceMap[typeName] = []; }
    }
  }

  try {
    var absItems = readList(dataAbsencePlanning);
    if (absItems) {
      for (var i = 0; i < absItems.length; i++) {
        var absItem = absItems[i];
        if (!absItem || typeof absItem.get !== 'function') { continue; }
        var typeName = fieldAbsenceType ? absItem.get(fieldAbsenceType) : null;
        if (!typeName || typeof typeName !== 'string') { continue; }
        var absPersonnelIds = extractIds(absItem, fieldAbsencePersonnel);
        if (!absenceMap[typeName]) { absenceMap[typeName] = []; }
        for (var j = 0; j < absPersonnelIds.length; j++) {
          absenceMap[typeName].push(absPersonnelIds[j]);
          assignedPersonnel[absPersonnelIds[j]] = true;
        }
      }
    }
  } catch (e) { if (!e.not_ready_key) { console.error('PH absence planning read:', e); } }

  // ===========================================
  // STEP 2c: READ BUREAU DATA
  // ===========================================
  var bureauPersonnelIds = [];
  try {
    var bureauItems = readList(dataBureauPlanning);
    if (bureauItems) {
      for (var i = 0; i < bureauItems.length; i++) {
        var bItem = bureauItems[i];
        if (!bItem || typeof bItem.get !== 'function') { continue; }
        var bPersonnelIds = extractIds(bItem, fieldBureauPersonnel);
        for (var j = 0; j < bPersonnelIds.length; j++) {
          bureauPersonnelIds.push(bPersonnelIds[j]);
          assignedPersonnel[bPersonnelIds[j]] = true;
        }
      }
    }
  } catch (e) { if (!e.not_ready_key) { console.error('PH bureau planning read:', e); } }

  // ===========================================
  // STEP 2d: READ LIVRAISONS DU JOUR
  // ===========================================
  var livraisonChantierIds = {};
  try {
    var livraisonItems = readList(dataLivraisonsDuJour);
    if (livraisonItems && fieldChantierLivraison) {
      for (var i = 0; i < livraisonItems.length; i++) {
        var livItem = livraisonItems[i];
        if (!livItem || typeof livItem.get !== 'function') { continue; }
        var livChantier = livItem.get(fieldChantierLivraison);
        var livChantierId = null;
        if (livChantier && typeof livChantier.get === 'function') { livChantierId = livChantier.get('_id'); }
        else if (typeof livChantier === 'string') { livChantierId = livChantier; }
        if (livChantierId) { livraisonChantierIds[livChantierId] = true; }
      }
    }
  } catch (e) { if (!e.not_ready_key) { console.error('PH livraisons read:', e); } }

  // ===========================================
  // STEP 3: HASH & CHANGE DETECTION — OPTIMISTIC UI
  //
  // On sépare le hash en deux parties :
  // - structuralHash : date + liste des chantiers + ressources + types d'absence
  //   → change quand la "structure" change (nouveau chantier, nouvelle personne, changement de date)
  //   → déclenche un rebuild complet depuis Bubble
  // - assignmentHash : qui est affecté où
  //   → change quand Bubble confirme un CRUD
  //   → si hasLocalChanges=true, Bubble rattrape juste notre état local → skip rebuild
  // ===========================================

  var structuralHash = 'date:' + (dayDate ? new Date(dayDate).toISOString().slice(0, 10) : 'null');
  if (chantierItems) {
    structuralHash += '|c:' + chantierItems.length;
    for (var i = 0; i < chantierItems.length; i++) {
      if (chantierItems[i] && typeof chantierItems[i].get === 'function') {
        structuralHash += '|' + (chantierItems[i].get('_id') || '');
      }
    }
  }
  structuralHash += '|p:' + Object.keys(personnelById).length;
  structuralHash += '|v:' + Object.keys(vehiculeById).length;
  structuralHash += '|s:' + Object.keys(soustraitantById).length;
  structuralHash += '|vi:' + Object.keys(vehiculeIndisponibleSet).sort().join(',');
  var absKeys = Object.keys(absenceMap).sort();
  structuralHash += '|abst:' + absKeys.join(',');
  structuralHash += '|liv:' + Object.keys(livraisonChantierIds).sort().join(',');

  var assignmentHash = 'pl:' + Object.keys(planningMap).sort().length;
  var planKeys = Object.keys(planningMap).sort();
  for (var i = 0; i < planKeys.length; i++) {
    var pe = planningMap[planKeys[i]];
    assignmentHash += '|' + planKeys[i] + '=' + pe.personnel.join(',') + '/' + pe.vehicule.join(',') + '/' + pe.soustraitant.join(',') + '/' + pe.atelier.join(',') + '/' + pe.commentaire;
  }
  for (var i = 0; i < absKeys.length; i++) {
    assignmentHash += '|' + absKeys[i] + '=' + absenceMap[absKeys[i]].join(',');
  }
  assignmentHash += '|bur:' + bureauPersonnelIds.sort().join(',');
  assignmentHash += '|ag:' + atelierGeneralPersonnelIds.slice().sort().join(',');

  var fullHash = structuralHash + '||' + assignmentHash;

  var shouldRebuild;

  if (instance.data.lastStructuralHash !== structuralHash) {
    // Structure changée (date, liste chantiers, ressources) → rebuild complet
    instance.data.lastStructuralHash = structuralHash;
    instance.data.lastMasterHash = fullHash;
    instance.data.hasLocalChanges = false;
    shouldRebuild = true;

  } else if (instance.data.lastMasterHash === fullHash) {
    // Rien n'a changé
    return;

  } else {
    // Seulement les assignments ont changé
    instance.data.lastMasterHash = fullHash;
    if (instance.data.hasLocalChanges) {
      // Bubble rattrape notre état local → le DOM est déjà correct → skip
      return;
    }
    // Pas de changements locaux → rebuild (premier chargement ou changement externe)
    shouldRebuild = true;
  }

  if (!shouldRebuild) { return; }

  // Pendant un drag actif, différer le rebuild
  if (instance.data.isDragging) {
    instance.data.lastMasterHash = null;
    instance.data.lastStructuralHash = null;
    return;
  }

  instance.data.planningMap = planningMap;

  // --- Calcul des conflits d'assignation (tous les emplacements) ---
  var chantierNameMap = {};
  if (chantierItems) {
    for (var cni = 0; cni < chantierItems.length; cni++) {
      var cniItem = chantierItems[cni];
      if (cniItem && typeof cniItem.get === 'function') {
        chantierNameMap[cniItem.get('_id')] = (nameChantier ? cniItem.get(nameChantier) : null) || '\u2014';
      }
    }
  }

  var personnelLocations = {}; // pid → [location string, ...]

  var chantierConflictKeys = Object.keys(planningMap);
  for (var cci = 0; cci < chantierConflictKeys.length; cci++) {
    var ccId = chantierConflictKeys[cci];
    var pmEntry = planningMap[ccId];
    var cLabel = chantierNameMap[ccId] || '\u2014';
    var ccIds = pmEntry.personnel.concat(pmEntry.atelier || []);
    for (var cpi = 0; cpi < ccIds.length; cpi++) {
      if (!personnelLocations[ccIds[cpi]]) { personnelLocations[ccIds[cpi]] = []; }
      personnelLocations[ccIds[cpi]].push(cLabel);
    }
  }

  var absConflictKeys = Object.keys(absenceMap);
  for (var abi = 0; abi < absConflictKeys.length; abi++) {
    var absTypeName = absConflictKeys[abi];
    var abIds = absenceMap[absTypeName];
    for (var abii = 0; abii < abIds.length; abii++) {
      if (!personnelLocations[abIds[abii]]) { personnelLocations[abIds[abii]] = []; }
      personnelLocations[abIds[abii]].push(absTypeName);
    }
  }

  for (var bii = 0; bii < bureauPersonnelIds.length; bii++) {
    if (!personnelLocations[bureauPersonnelIds[bii]]) { personnelLocations[bureauPersonnelIds[bii]] = []; }
    personnelLocations[bureauPersonnelIds[bii]].push('Bureau');
  }

  for (var agii = 0; agii < atelierGeneralPersonnelIds.length; agii++) {
    if (!personnelLocations[atelierGeneralPersonnelIds[agii]]) { personnelLocations[atelierGeneralPersonnelIds[agii]] = []; }
    personnelLocations[atelierGeneralPersonnelIds[agii]].push('Atelier g\u00e9n.');
  }

  var conflictPersonnelIds = {};
  for (var cpid in personnelLocations) {
    if (personnelLocations[cpid].length >= 2) { conflictPersonnelIds[cpid] = true; }
  }

  // ===========================================
  // STEP 4: BUILD CHANTIER ROWS + ASSIGNMENTS
  // ===========================================
  instance.data.rowsContainer.innerHTML = '';

  if (chantierItems && chantierItems.length > 0) {
    if (fieldDateDebut && dayDate) {
      chantierItems.sort(function(a, b) {
        var aStart = (a && typeof a.get === 'function') ? isSameDay(a.get(fieldDateDebut), dayDate) : false;
        var bStart = (b && typeof b.get === 'function') ? isSameDay(b.get(fieldDateDebut), dayDate) : false;
        if (aStart === bStart) return 0;
        return aStart ? -1 : 1;
      });
    }

    function fillZone(zone, ids, resourceMap, type) {
      if (!zone || ids.length === 0) { return; }
      var label = zone.querySelector('.ph-empty-label');
      if (label) { label.remove(); }
      for (var k = 0; k < ids.length; k++) {
        var res = resourceMap[ids[k]];
        if (res) {
          var isUnavailable = type === 'vehicule' && vehiculeIndisponibleSet[ids[k]];
          var tag = instance.data.createTag(res.name, type, true, isUnavailable);
          tag._bubbleObject = res.object;
          tag._resourceId = ids[k];
          if (type === 'personnel' && conflictPersonnelIds[ids[k]]) {
            tag.classList.add('ph-tag-conflict');
          }
          zone.appendChild(tag);
        }
      }
    }

    for (var i = 0; i < chantierItems.length; i++) {
      var item = chantierItems[i];
      if (!item || typeof item.get !== 'function') { continue; }
      var displayName = nameChantier ? item.get(nameChantier) : '\u2014';
      var chantierId = item.get('_id');
      var hasLivraison = !!(chantierId && livraisonChantierIds[chantierId]);
      var row = instance.data.createRow(displayName || '\u2014', hasLivraison);
      row._bubbleObject = item;
      if (fieldDateDebut && dayDate) {
        var startDate = item.get(fieldDateDebut);
        if (isSameDay(startDate, dayDate)) { row.classList.add('ph-row-start'); }
      }
      if (chantierId && planningMap[chantierId]) {
        var assignments = planningMap[chantierId];
        var zones = row.querySelectorAll('.ph-drop-zone');
        fillZone(zones[0], assignments.personnel, personnelById, 'personnel');
        fillZone(zones[1], assignments.vehicule, vehiculeById, 'vehicule');
        fillZone(zones[2], assignments.soustraitant, soustraitantById, 'soustraitant');
        fillZone(zones[3], assignments.atelier, personnelById, 'personnel');
        if (assignments.commentaire) {
          var cBtn = row.querySelector('.ph-comment-btn');
          if (cBtn) { cBtn.classList.add('has-comment'); }
        }
      }
      instance.data.rowsContainer.appendChild(row);
    }
  }

  // ===========================================
  // STEP 4b: BUILD ABSENCE ROWS
  // ===========================================
  instance.data.absencesBody.innerHTML = '';

  if (absenceTypeItems && absenceTypeItems.length > 0) {
    for (var i = 0; i < absenceTypeItems.length; i++) {
      var atName = absenceTypeItems[i];
      if (!atName || typeof atName !== 'string') { continue; }
      var absRow = instance.data.createAbsenceRow(atName);
      absRow._motifName = atName;
      var absPersonnelIds = absenceMap[atName] || [];
      if (absPersonnelIds.length > 0) {
        var zone = absRow.querySelector('.ph-drop-zone');
        var label = zone.querySelector('.ph-empty-label');
        if (label) { label.remove(); }
        for (var j = 0; j < absPersonnelIds.length; j++) {
          var res = personnelById[absPersonnelIds[j]];
          if (res) {
            var tag = instance.data.createTag(res.name, 'personnel', true);
            tag._bubbleObject = res.object;
            tag._resourceId = absPersonnelIds[j];
            if (conflictPersonnelIds[absPersonnelIds[j]]) { tag.classList.add('ph-tag-conflict'); }
            zone.appendChild(tag);
          }
        }
      }
      instance.data.absencesBody.appendChild(absRow);
    }
  }

  // ===========================================
  // STEP 4c: BUILD BUREAU ZONE
  // ===========================================
  var bureauZone = instance.data.bureauZone;
  bureauZone.innerHTML = '';

  if (bureauPersonnelIds.length > 0) {
    for (var i = 0; i < bureauPersonnelIds.length; i++) {
      var res = personnelById[bureauPersonnelIds[i]];
      if (res) {
        var tag = instance.data.createTag(res.name, 'personnel', true);
        tag._bubbleObject = res.object;
        tag._resourceId = bureauPersonnelIds[i];
        if (conflictPersonnelIds[bureauPersonnelIds[i]]) { tag.classList.add('ph-tag-conflict'); }
        bureauZone.appendChild(tag);
      }
    }
  } else {
    var emptyLabel = document.createElement('span');
    emptyLabel.className = 'ph-empty-label label-bureau';
    emptyLabel.textContent = 'Personnel au bureau';
    bureauZone.appendChild(emptyLabel);
  }

  // ===========================================
  // STEP 4d: BUILD ATELIER GÉNÉRAL ZONE
  // ===========================================
  var atelierGeneralZone = instance.data.atelierGeneralZone;
  atelierGeneralZone.innerHTML = '';

  if (atelierGeneralPersonnelIds.length > 0) {
    for (var i = 0; i < atelierGeneralPersonnelIds.length; i++) {
      var res = personnelById[atelierGeneralPersonnelIds[i]];
      if (res) {
        var tag = instance.data.createTag(res.name, 'personnel', true);
        tag._bubbleObject = res.object;
        tag._resourceId = atelierGeneralPersonnelIds[i];
        if (conflictPersonnelIds[atelierGeneralPersonnelIds[i]]) { tag.classList.add('ph-tag-conflict'); }
        atelierGeneralZone.appendChild(tag);
      }
    }
  } else {
    var emptyLabel = document.createElement('span');
    emptyLabel.className = 'ph-empty-label label-atelier-general';
    emptyLabel.textContent = 'Personnel \u00e0 l\u2019atelier';
    atelierGeneralZone.appendChild(emptyLabel);
  }

  // ===========================================
  // STEP 5: BUILD RESOURCE POOLS (unassigned only)
  // ===========================================
  function populatePool(pool, resourceMap, assignedMap, type) {
    pool.innerHTML = '';
    var keys = Object.keys(resourceMap);
    for (var i = 0; i < keys.length; i++) {
      if (assignedMap[keys[i]]) { continue; }
      var res = resourceMap[keys[i]];
      var isUnavailable = type === 'vehicule' && vehiculeIndisponibleSet[keys[i]];
      var tag = instance.data.createTag(res.name, type, false, isUnavailable);
      tag._bubbleObject = res.object;
      tag._resourceId = keys[i];
      pool.appendChild(tag);
    }
  }

  populatePool(instance.data.poolPersonnel, personnelById, assignedPersonnel, 'personnel');
  if (instance.data.countPersonnel) { instance.data.countPersonnel.textContent = instance.data.poolPersonnel.querySelectorAll('.ph-res-tag').length || ''; }

  populatePool(instance.data.poolVehicule, vehiculeById, assignedVehicule, 'vehicule');
  if (instance.data.countVehicule) { instance.data.countVehicule.textContent = instance.data.poolVehicule.querySelectorAll('.ph-res-tag').length || ''; }

  populatePool(instance.data.poolSoustraitant, soustraitantById, assignedSoustraitant, 'soustraitant');
  if (instance.data.countSoustraitant) { instance.data.countSoustraitant.textContent = instance.data.poolSoustraitant.querySelectorAll('.ph-res-tag').length || ''; }

  // --- Zone alerte conflits ---
  var conflictZoneEl = instance.data.conflictZone;
  if (conflictZoneEl) {
    var conflictIds = Object.keys(conflictPersonnelIds);
    if (conflictIds.length === 0) {
      conflictZoneEl.style.display = 'none';
    } else {
      conflictZoneEl.innerHTML = '';
      var hdr = document.createElement('div');
      hdr.className = 'ph-conflict-header';
      hdr.textContent = '\u26a0\ufe0f ' + conflictIds.length + ' conflit' + (conflictIds.length > 1 ? 's' : '');
      conflictZoneEl.appendChild(hdr);
      for (var cIdx = 0; cIdx < conflictIds.length; cIdx++) {
        var cId = conflictIds[cIdx];
        var pRes = personnelById[cId];
        if (!pRes) { continue; }
        var locations = personnelLocations[cId] || [];
        var desc = locations.join(' \u00b7 ');
        var cItem = document.createElement('div');
        cItem.className = 'ph-conflict-item';
        cItem.textContent = pRes.name + ' \u2014 ' + desc;
        conflictZoneEl.appendChild(cItem);
      }
      conflictZoneEl.style.display = 'block';
    }
  }

  // --- Hide skeleton : stabilité données sur 2 updates consécutifs + délai minimum 600ms ---
  if (instance.data.skeleton && !instance.data.skeletonHidden && chantierItems !== null && planningDataReady) {
    // Horodater le premier update avec données prêtes
    if (!instance.data.skeletonDataReadyAt) {
      instance.data.skeletonDataReadyAt = Date.now();
    }
    var elapsed = Date.now() - instance.data.skeletonDataReadyAt;
    var minDelayOk = elapsed >= 600;

    if (instance.data.lastSkeletonStableHash === fullHash && minDelayOk) {
      // Même hash 2 updates de suite + délai minimum écoulé → cacher
      instance.data.skeletonHidden = true;
      clearTimeout(instance.data.skeletonFallbackTimer);
      var _skel = instance.data.skeleton;
      _skel.style.opacity = '0';
      setTimeout(function() { if (_skel) { _skel.style.display = 'none'; } }, 380);
    } else if (instance.data.lastSkeletonStableHash === fullHash && !minDelayOk) {
      // Même hash mais trop tôt → attendre que le délai soit écoulé
      clearTimeout(instance.data.skeletonFallbackTimer);
      var _remainingDelay = 600 - elapsed;
      instance.data.skeletonFallbackTimer = setTimeout(function() {
        if (!instance.data.skeleton || instance.data.skeletonHidden) return;
        instance.data.skeletonHidden = true;
        instance.data.skeleton.style.opacity = '0';
        setTimeout(function() { if (instance.data.skeleton) { instance.data.skeleton.style.display = 'none'; } }, 380);
      }, _remainingDelay);
    } else {
      // Nouveau hash → noter le hash, attendre le suivant (fallback 700ms)
      instance.data.lastSkeletonStableHash = fullHash;
      clearTimeout(instance.data.skeletonFallbackTimer);
      instance.data.skeletonFallbackTimer = setTimeout(function() {
        if (!instance.data.skeleton || instance.data.skeletonHidden) return;
        instance.data.skeletonHidden = true;
        instance.data.skeleton.style.opacity = '0';
        setTimeout(function() { if (instance.data.skeleton) { instance.data.skeleton.style.display = 'none'; } }, 380);
      }, 700);
    }
  }

  } finally {
    instance.data.isUpdating = false;
  }
}