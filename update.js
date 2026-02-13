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

  var dataPlanning = properties.data_type_planning;
  var fieldChantier = properties.field_chantier;
  var fieldDate = properties.field_date;
  var fieldPersonnel = properties.field_personnel;
  var fieldVehicule = properties.field_vehicule;
  var fieldSoustraitant = properties.field_soustraitant;

  // --- Recursion protection (synchronous) ---
  if (instance.data.isUpdating) { return; }
  instance.data.isUpdating = true;

  try {

  if (!instance.data.initialized) { return; }

  // --- Date header ---
  if (dayDate) {
    instance.data.dateHeader.textContent = instance.data.formatDate(dayDate);
  } else {
    instance.data.dateHeader.textContent = '\u2014';
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
  // STEP 2: READ PLANNING DATA
  // ===========================================
  var planningMap = {};
  var assignedPersonnel = {};
  var assignedVehicule = {};
  var assignedSoustraitant = {};

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

        // Filter by date: skip if planning date != dayDate
        if (fieldDate && dayDate) {
          var planDate = planItem.get(fieldDate);
          if (planDate) {
            var d1 = new Date(dayDate);
            var d2 = new Date(planDate);
            if (d1.getFullYear() !== d2.getFullYear() || d1.getMonth() !== d2.getMonth() || d1.getDate() !== d2.getDate()) {
              continue;
            }
          } else {
            continue;
          }
        }

        // Get chantier ID (could be a Bubble object or a string ID)
        var chRef = fieldChantier ? planItem.get(fieldChantier) : null;
        var chId = null;
        if (chRef && typeof chRef.get === 'function') {
          chId = chRef.get('_id');
        } else if (typeof chRef === 'string') {
          chId = chRef;
        }
        if (!chId) { continue; }

        var entry = {
          personnel: extractIds(planItem, fieldPersonnel),
          vehicule: extractIds(planItem, fieldVehicule),
          soustraitant: extractIds(planItem, fieldSoustraitant)
        };
        planningMap[chId] = entry;

        // Track assigned resource IDs
        for (var j = 0; j < entry.personnel.length; j++) { assignedPersonnel[entry.personnel[j]] = true; }
        for (var j = 0; j < entry.vehicule.length; j++) { assignedVehicule[entry.vehicule[j]] = true; }
        for (var j = 0; j < entry.soustraitant.length; j++) { assignedSoustraitant[entry.soustraitant[j]] = true; }
      }
    }
  } catch (e) {
    if (!e.not_ready_key) { console.error('PH planning read:', e); }
  }

  // ===========================================
  // STEP 3: BUILD HASH & CHECK FOR CHANGES
  // ===========================================
  var hash = '';

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

  // Planning hash (includes chantier→resource mapping)
  var planKeys = Object.keys(planningMap).sort();
  hash += '|pl:' + planKeys.length;
  for (var i = 0; i < planKeys.length; i++) {
    var pe = planningMap[planKeys[i]];
    hash += '|' + planKeys[i] + '=' + pe.personnel.join(',') + '/' + pe.vehicule.join(',') + '/' + pe.soustraitant.join(',');
  }

  if (instance.data.lastMasterHash === hash) { return; }
  instance.data.lastMasterHash = hash;

  // ===========================================
  // STEP 4: BUILD CHANTIER ROWS + ASSIGNMENTS
  // ===========================================
  instance.data.rowsContainer.innerHTML = '';

  if (chantierItems && chantierItems.length > 0) {
    for (var i = 0; i < chantierItems.length; i++) {
      var item = chantierItems[i];
      if (!item || typeof item.get !== 'function') { continue; }

      var displayName = nameChantier ? item.get(nameChantier) : '\u2014';
      var row = instance.data.createRow(displayName || '\u2014');
      row._bubbleObject = item;

      // Populate drop zones with assigned resources
      var chantierId = item.get('_id');
      if (chantierId && planningMap[chantierId]) {
        var assignments = planningMap[chantierId];
        var zones = row.querySelectorAll('.ph-drop-zone');
        // zones[0] = personnel, zones[1] = vehicule, zones[2] = soustraitant

        function fillZone(zone, ids, resourceMap, type) {
          if (!zone || ids.length === 0) { return; }
          // Remove placeholder label
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

        fillZone(zones[0], assignments.personnel, personnelById, 'personnel');
        fillZone(zones[1], assignments.vehicule, vehiculeById, 'vehicule');
        fillZone(zones[2], assignments.soustraitant, soustraitantById, 'soustraitant');
      }

      instance.data.rowsContainer.appendChild(row);
    }

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