function(instance, properties, context) {

  // --- Properties ---
  var dataChantier = properties.data_type_chantier;
  var nameChantier = properties.name_display_chantier;
  var dayDate = properties.day_date;

  var dataPersonnel = properties.data_type_personnel;
  var namePersonnel = properties.name_display_personnel;

  var dataVehicule = properties.data_type_vehicule;
  var nameVehicule = properties.name_display_vehicule;

  var dataSoustraitant = properties.data_type_soustraitant;
  var nameSoustraitant = properties.name_display_soustraitant;

  var fieldDateDebut = properties.date_debut_chantier;

  var dataPlanning = properties.data_type_planning;
  var fieldChantier = properties.field_chantier;
  var fieldPersonnel = properties.field_chantier_personnel;
  var fieldVehicule = properties.field_vehicule;
  var fieldSoustraitant = properties.field_soustraitant;
  var fieldAtelierPersonnel = properties.field_atelier_personnel;
  var fieldCommentaire = properties.field_commentaire;

  // Absences: list of text strings (type names)
  var dataAbsenceTypes = properties.data_type_absence_types;

  // Absence planning entries (already filtered by date from Bubble)
  var dataAbsencePlanning = properties.data_type_absence_planning;
  var fieldAbsenceType = properties.field_absence_type;
  var fieldAbsencePersonnel = properties.field_absence_personnel;

  // Bureau planning (already filtered by date from Bubble)
  var dataBureauPlanning = properties.data_type_bureau_planning;
  var fieldBureauPersonnel = properties.field_bureau_personnel;

  // --- Recursion protection (synchronous) ---
  if (instance.data.isUpdating) { return; }
  instance.data.isUpdating = true;

  try {

  if (!instance.data.initialized) { return; }

  // --- Date header ---
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

  // Helper: read a Bubble list into an array
  function readList(dataSource) {
    if (!dataSource || typeof dataSource.length !== 'function') { return null; }
    var len = dataSource.length();
    if (len === 0) { return []; }
    return dataSource.get(0, len);
  }

  // Read chantier items
  var chantierItems = null;
  try { chantierItems = readList(dataChantier); }
  catch (e) { if (!e.not_ready_key) { console.error('PH chantier read:', e); } }

  // Build resource lookup maps: { id -> { object, name } }
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

  // ===========================================
  // STEP 2: READ PLANNING DATA (chantiers)
  // ===========================================
  var planningMap = {};
  var assignedPersonnel = {};
  var assignedVehicule = {};
  var assignedSoustraitant = {};

  // Helper: check if two dates are the same day
  function isSameDay(dateVal, refDate) {
    if (!dateVal || !refDate) return false;
    var d1 = new Date(refDate);
    var d2 = new Date(dateVal);
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  }

  // Helper: extract IDs from a relation field (list or single)
  function extractIds(sourceItem, fieldName) {
    if (!fieldName) { return []; }
    var ids = [];
    var ref = sourceItem.get(fieldName);
    if (!ref) { return ids; }

    // Bubble list object (has .length() and .get())
    if (typeof ref.length === 'function') {
      var len = ref.length();
      if (len > 0) {
        var items = ref.get(0, len);
        for (var j = 0; j < items.length; j++) {
          if (items[j] && typeof items[j].get === 'function') {
            var id = items[j].get('_id');
            if (id) { ids.push(id); }
          } else if (typeof items[j] === 'string') {
            ids.push(items[j]);
          }
        }
      }
    }
    // Plain array
    else if (Array.isArray(ref)) {
      for (var j = 0; j < ref.length; j++) {
        if (ref[j] && typeof ref[j].get === 'function') {
          var id = ref[j].get('_id');
          if (id) { ids.push(id); }
        } else if (typeof ref[j] === 'string') {
          ids.push(ref[j]);
        }
      }
    }
    return ids;
  }

  try {
    var planItems = readList(dataPlanning);
    if (planItems) {
      for (var i = 0; i < planItems.length; i++) {
        var planItem = planItems[i];
        if (!planItem || typeof planItem.get !== 'function') { continue; }

        // Get chantier ID
        var chRef = fieldChantier ? planItem.get(fieldChantier) : null;
        var chId = null;
        if (chRef && typeof chRef.get === 'function') {
          chId = chRef.get('_id');
        } else if (typeof chRef === 'string') {
          chId = chRef;
        }
        if (!chId) { continue; }

        var commentaire = fieldCommentaire ? (planItem.get(fieldCommentaire) || '') : '';

        var entry = {
          personnel: extractIds(planItem, fieldPersonnel),
          vehicule: extractIds(planItem, fieldVehicule),
          soustraitant: extractIds(planItem, fieldSoustraitant),
          atelier: extractIds(planItem, fieldAtelierPersonnel),
          commentaire: commentaire
        };
        planningMap[chId] = entry;

        // Track assigned resource IDs
        for (var j = 0; j < entry.personnel.length; j++) { assignedPersonnel[entry.personnel[j]] = true; }
        for (var j = 0; j < entry.vehicule.length; j++) { assignedVehicule[entry.vehicule[j]] = true; }
        for (var j = 0; j < entry.soustraitant.length; j++) { assignedSoustraitant[entry.soustraitant[j]] = true; }
        for (var j = 0; j < entry.atelier.length; j++) { assignedPersonnel[entry.atelier[j]] = true; }
      }
    }
  } catch (e) {
    if (!e.not_ready_key) { console.error('PH planning read:', e); }
  }

  // ===========================================
  // STEP 2b: READ ABSENCE DATA
  // ===========================================
  // absenceMap: { typeName -> [personnelId, ...] }
  var absenceMap = {};

  // Read absence types (list of text strings)
  var absenceTypeItems = null;
  try { absenceTypeItems = readList(dataAbsenceTypes); }
  catch (e) { if (!e.not_ready_key) { console.error('PH absence types read:', e); } }

  if (absenceTypeItems) {
    for (var i = 0; i < absenceTypeItems.length; i++) {
      var typeName = absenceTypeItems[i];
      if (typeName && typeof typeName === 'string') {
        absenceMap[typeName] = [];
      }
    }
  }

  // Read absence planning entries
  try {
    var absItems = readList(dataAbsencePlanning);
    if (absItems) {
      for (var i = 0; i < absItems.length; i++) {
        var absItem = absItems[i];
        if (!absItem || typeof absItem.get !== 'function') { continue; }

        // Get absence type name (text field on the planning entry)
        var typeName = fieldAbsenceType ? absItem.get(fieldAbsenceType) : null;
        if (!typeName || typeof typeName !== 'string') { continue; }

        // Get personnel IDs
        var absPersonnelIds = extractIds(absItem, fieldAbsencePersonnel);
        if (!absenceMap[typeName]) { absenceMap[typeName] = []; }
        for (var j = 0; j < absPersonnelIds.length; j++) {
          absenceMap[typeName].push(absPersonnelIds[j]);
          assignedPersonnel[absPersonnelIds[j]] = true;
        }
      }
    }
  } catch (e) {
    if (!e.not_ready_key) { console.error('PH absence planning read:', e); }
  }

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
  } catch (e) {
    if (!e.not_ready_key) { console.error('PH bureau planning read:', e); }
  }

  // ===========================================
  // STEP 3: BUILD HASH & CHECK FOR CHANGES
  // ===========================================
  var hash = 'date:' + (dayDate ? new Date(dayDate).toISOString().slice(0, 10) : 'null');

  // Chantier hash
  if (chantierItems) {
    hash += 'c:' + chantierItems.length;
    for (var i = 0; i < chantierItems.length; i++) {
      if (chantierItems[i] && typeof chantierItems[i].get === 'function') {
        hash += '|' + (chantierItems[i].get('_id') || '');
      }
    }
  }

  // Resource counts
  hash += '|p:' + Object.keys(personnelById).length;
  hash += '|v:' + Object.keys(vehiculeById).length;
  hash += '|s:' + Object.keys(soustraitantById).length;

  // Planning hash
  var planKeys = Object.keys(planningMap).sort();
  hash += '|pl:' + planKeys.length;
  for (var i = 0; i < planKeys.length; i++) {
    var pe = planningMap[planKeys[i]];
    hash += '|' + planKeys[i] + '=' + pe.personnel.join(',') + '/' + pe.vehicule.join(',') + '/' + pe.soustraitant.join(',') + '/' + pe.atelier.join(',') + '/' + pe.commentaire;
  }

  // Absence hash
  var absKeys = Object.keys(absenceMap).sort();
  hash += '|abs:' + absKeys.length;
  for (var i = 0; i < absKeys.length; i++) {
    hash += '|' + absKeys[i] + '=' + absenceMap[absKeys[i]].join(',');
  }

  // Bureau hash
  hash += '|bur:' + bureauPersonnelIds.sort().join(',');

  if (instance.data.lastMasterHash === hash) { return; }
  instance.data.lastMasterHash = hash;
  instance.data.planningMap = planningMap;

  // ===========================================
  // STEP 4: BUILD CHANTIER ROWS + ASSIGNMENTS
  // ===========================================
  instance.data.rowsContainer.innerHTML = '';

  if (chantierItems && chantierItems.length > 0) {
    // Sort: chantiers starting today first
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
          var tag = instance.data.createTag(res.name, type, true);
          tag._bubbleObject = res.object;
          tag._resourceId = ids[k];
          zone.appendChild(tag);
        }
      }
    }

    for (var i = 0; i < chantierItems.length; i++) {
      var item = chantierItems[i];
      if (!item || typeof item.get !== 'function') { continue; }

      var displayName = nameChantier ? item.get(nameChantier) : '\u2014';
      var row = instance.data.createRow(displayName || '\u2014');
      row._bubbleObject = item;

      // Mark row if chantier starts today
      if (fieldDateDebut && dayDate) {
        var startDate = item.get(fieldDateDebut);
        if (isSameDay(startDate, dayDate)) {
          row.classList.add('ph-row-start');
        }
      }

      // Populate drop zones with assigned resources
      var chantierId = item.get('_id');
      if (chantierId && planningMap[chantierId]) {
        var assignments = planningMap[chantierId];
        var zones = row.querySelectorAll('.ph-drop-zone');

        fillZone(zones[0], assignments.personnel, personnelById, 'personnel');
        fillZone(zones[1], assignments.vehicule, vehiculeById, 'vehicule');
        fillZone(zones[2], assignments.soustraitant, soustraitantById, 'soustraitant');
        fillZone(zones[3], assignments.atelier, personnelById, 'personnel');

        // Highlight comment button if comment exists
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

      // Fill with assigned personnel
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
  // STEP 5: BUILD RESOURCE POOLS (unassigned only)
  // ===========================================
  function populatePool(pool, resourceMap, assignedMap, type) {
    pool.innerHTML = '';
    var keys = Object.keys(resourceMap);
    for (var i = 0; i < keys.length; i++) {
      if (assignedMap[keys[i]]) { continue; }
      var res = resourceMap[keys[i]];
      var tag = instance.data.createTag(res.name, type);
      tag._bubbleObject = res.object;
      tag._resourceId = keys[i];
      pool.appendChild(tag);
    }
  }

  populatePool(instance.data.poolPersonnel, personnelById, assignedPersonnel, 'personnel');
  populatePool(instance.data.poolVehicule, vehiculeById, assignedVehicule, 'vehicule');
  populatePool(instance.data.poolSoustraitant, soustraitantById, assignedSoustraitant, 'soustraitant');

  } finally {
    instance.data.isUpdating = false;
  }
}