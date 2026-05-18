function(instance, properties, context) {

  // ============================================================
  // PROPERTIES — noms de champs (statiques, fixés dans l'éditeur Bubble)
  // ============================================================
  var fieldChName      = properties.field_ch_name;
  var fieldUserName    = properties.field_user_name;
  var fieldSttName     = properties.field_stt_name;
  var fieldVehName     = properties.field_veh_name;
  var fieldConduc1     = properties.field_conduc1;
  var fieldConduc2     = properties.field_condu2;
  var fieldOrdre       = properties.field_ordre;
  var fieldPlaType     = properties.field_pla_type;
  var fieldPlaCha      = properties.field_pla_cha;
  var fieldPlaEquipe   = properties.field_pla_equipe;
  var fieldPlaStt      = properties.field_pla_stt;
  var fieldPlaVehicule = properties.field_pla_vehicule;
  var fieldPlaCom      = properties.field_pla_commentaire;
  var fieldPlaMotif    = properties.field_pla_motif_absence;
  var fieldPlaPoste    = properties.field_pla_poste_atelier;
  var fieldChDateDebut = properties.field_ch_date_debut;
  var fieldPlaRowId    = properties.field_pla_row_id;
  instance.data.isDisplay = !!properties.is_display;
  instance.data.isOff     = !!properties.jour_off;

  // ============================================================
  // GUARDS
  // ============================================================
  if (instance.data.isUpdating) return;
  if (!instance.data.initialized) return;

  instance.data.isUpdating = true;
  try {
    runUpdate(properties);
  } finally {
    instance.data.isUpdating = false;
  }

  // ============================================================
  // HELPERS
  // ============================================================
  function readList(src) {
    if (!src || typeof src.length !== 'function') return [];
    var len = src.length();
    return len === 0 ? [] : src.get(0, len);
  }

  function getDisplay(obj) {
    if (!obj || typeof obj.get !== 'function') return null;
    return obj.get('display') || null;
  }

  function getField(obj, field) {
    if (!obj || !field || typeof obj.get !== 'function') return null;
    var val = obj.get(field);
    if (val === null || val === undefined) return null;
    if (typeof val === 'string') return val || null;
    return null;
  }

  // ============================================================
  // CORE UPDATE
  // Principe : on laisse propager NotReadyError naturellement.
  // Bubble re-déclenche update.js quand les données sont prêtes.
  // Le hash est écrit UNIQUEMENT après un render réussi.
  // ============================================================
  function runUpdate(props) {

    // ----------------------------------------------------------
    // LIRE LES DONNÉES
    // Ces appels peuvent lancer NotReadyError si les données ne
    // sont pas encore chargées → Bubble re-déclenchera update.js.
    // ----------------------------------------------------------
    var dayDate      = props.day_date;
    var userItems    = readList(props.table_user);
    var sttItems     = readList(props.table_stt);
    var vehItems     = readList(props.table_veh);
    var vehIndispo   = readList(props.liste_veh_indispo);
    var chJour       = readList(props.table_ch_jour);
    var chTrans      = readList(props.table_ch_transport);
    var chK2         = readList(props.table_ch_k2);
    var chFinK2      = readList(props.table_ch_fin_k2);
    var chFab        = readList(props.table_ch_fab);
    var chAll        = readList(props.table_ch);
    var absenceItems    = readList(props.table_absence);
    var posteItems      = readList(props.table_poste_atelier);
    var planItems       = readList(props.table_pla);
    var typePlanItems   = readList(props.table_type_planning);

    // ----------------------------------------------------------
    // HASH CHECK
    // On accède aux champs relationnels (type, equipe, stt, cha)
    // SANS try/catch → NotReadyError se propage → Bubble enregistre
    // la dépendance et re-run quand les champs sont chargés.
    // ----------------------------------------------------------
    var hash = 'display:' + (instance.data.isDisplay ? '1' : '0') + '|off:' + (instance.data.isOff ? '1' : '0') + '|date:' + (dayDate ? dayDate.toISOString() : '');
    hash += '|u:' + userItems.length;
    hash += '|s:' + sttItems.length;
    hash += '|v:' + vehItems.length;
    hash += '|vi:' + vehIndispo.map(function(v) { return v.get('_id'); }).join(',');
    hash += '|abs:' + absenceItems.length;
    hash += '|pos:' + posteItems.length;
    hash += '|chDeb:' + (fieldChDateDebut ? chAll.map(function(c) {
      var d = c.get(fieldChDateDebut); return d ? d.getTime() : '';
    }).join(',') : '');
    hash += '|chJ:' + chJour.length;
    hash += '|chT:' + chTrans.length;
    hash += '|chK2:' + chK2.length;
    hash += '|chFK2:' + chFinK2.length;
    hash += '|chFab:' + chFab.length;
    hash += '|chAll:' + chAll.length;
    hash += '|pla:' + planItems.map(function(p) {
      if (!p || typeof p.get !== 'function') return '';
      var id      = p.get('_id') || '';
      var typeOS  = p.get(fieldPlaType);
      var typeStr = typeOS && typeof typeOS.get === 'function' ? (typeOS.get('display') || '') : '';
      // .length() sans try/catch → NotReadyError propagé si pas chargé
      var eqRef   = fieldPlaEquipe ? p.get(fieldPlaEquipe) : null;
      var eqLen   = (eqRef && typeof eqRef.length === 'function') ? eqRef.length() : 0;
      var sttRef  = fieldPlaStt ? p.get(fieldPlaStt) : null;
      var sttLen2 = (sttRef && typeof sttRef.length === 'function') ? sttRef.length() : 0;
      var chaRef  = fieldPlaCha ? p.get(fieldPlaCha) : null;
      var chaLen  = (chaRef && typeof chaRef.length === 'function') ? chaRef.length() : 0;
      var vehObj    = fieldPlaVehicule ? p.get(fieldPlaVehicule) : null;
      var vehId     = (vehObj && typeof vehObj.get === 'function') ? (vehObj.get('_id') || '') : '';
      var posteOS   = fieldPlaPoste ? p.get(fieldPlaPoste) : null;
      var posteStr  = (posteOS && typeof posteOS.get === 'function') ? (posteOS.get('display') || '') : '';
      var motifOS   = fieldPlaMotif ? p.get(fieldPlaMotif) : null;
      var motifStr  = (motifOS && typeof motifOS.get === 'function') ? (motifOS.get('display') || '') : '';
      return id + ':' + typeStr + ':' + eqLen + ':' + sttLen2 + ':' + chaLen + ':' + vehId + ':' + posteStr + ':' + motifStr;
    }).join(',');

    if (instance.data.lastMasterHash === hash) return;

    // ----------------------------------------------------------
    // DATE
    // ----------------------------------------------------------
    var st = instance.data.state;
    if (dayDate) {
      st.date = dayDate;
      try { instance.publishState('selected_date', dayDate); } catch(e) {}
    }

    // ----------------------------------------------------------
    // OPTION SETS DYNAMIQUES
    // ----------------------------------------------------------
    var postes = posteItems.map(getDisplay).filter(Boolean);
    if (postes.length) instance.data.postes = postes;

    var zoneTypeMap = {};
    typePlanItems.forEach(function(os) {
      var d = getDisplay(os);
      if (d) zoneTypeMap[d.toLowerCase()] = os;
    });
    instance.data.zoneTypeMap = zoneTypeMap;

    // ----------------------------------------------------------
    // RESOURCE MAP  (nom → {obj, type})
    // ----------------------------------------------------------
    var resourceMap = {};

    var allEquipiers = [];
    userItems.forEach(function(u) {
      var name = getField(u, fieldUserName);
      if (name) { allEquipiers.push(name); resourceMap[name] = { obj: u, type: 'user' }; }
    });

    var allStt = [];
    sttItems.forEach(function(s) {
      var name = getField(s, fieldSttName);
      if (name) { allStt.push(name); resourceMap[name] = { obj: s, type: 'contact' }; }
    });

    var indispoNames = {};
    vehIndispo.forEach(function(v) {
      var name = getField(v, fieldVehName);
      if (name) indispoNames[name] = true;
    });

    var allVehicules = [];
    var vehiculeOrdreMap = {};
    vehItems.forEach(function(v) {
      var name = getField(v, fieldVehName);
      if (!name) return;
      allVehicules.push(name);
      resourceMap[name] = { obj: v, type: 'vehicule' };
      if (fieldOrdre) {
        var ord = v.get(fieldOrdre);
        if (ord !== null && ord !== undefined) vehiculeOrdreMap[name] = Number(ord);
      }
    });
    instance.data.vehiculeOrdreMap = vehiculeOrdreMap;

    var allChJour  = chJour.map(function(c)  { return getField(c, fieldChName); }).filter(Boolean);
    var allChTrans = chTrans.map(function(c) { return getField(c, fieldChName); }).filter(Boolean);
    var allChK2    = chK2.map(function(c)    { return getField(c, fieldChName); }).filter(Boolean);
    var allChFinK2 = chFinK2.map(function(c) { return getField(c, fieldChName); }).filter(Boolean);
    var allChFab   = chFab.map(function(c)   { return getField(c, fieldChName); }).filter(Boolean);

    var chantierDebutMap = {};
    var chantierList = chAll.map(function(c) {
      var name = getField(c, fieldChName);
      if (name) {
        resourceMap[name] = { obj: c, type: 'chantier' };
        if (fieldChDateDebut) {
          var d = c.get(fieldChDateDebut);
          if (d) chantierDebutMap[name] = d;
        }
      }
      return name;
    }).filter(Boolean);

    if (!chantierList.length) {
      chantierList = [].concat(allChJour, allChTrans, allChK2, allChFinK2, allChFab)
        .filter(function(n, i, arr) { return arr.indexOf(n) === i; });
    }

    instance.data.chantierList     = chantierList;
    instance.data.resourceMap      = resourceMap;
    instance.data.indispoVehicules = indispoNames;
    instance.data.chantierDebutMap = chantierDebutMap;

    // ----------------------------------------------------------
    // LIGNES depuis le planning
    // ----------------------------------------------------------
    var rows     = { chantier:[], transport:[], atelier:[], bureau:[] };
    var absences = {};

    var absenceMotifMap  = {};
    var absenceRowIdMap  = {};
    absenceItems.forEach(function(a) {
      var motif = getDisplay(a);
      if (motif) { absences[motif] = []; absenceMotifMap[motif] = a; }
    });
    instance.data.absenceMotifMap = absenceMotifMap;

    var usedEquipiers = {};
    var usedStt       = {};
    var usedVehicules = {};

    planItems.forEach(function(planObj) {
      if (!planObj || typeof planObj.get !== 'function') return;

      var typeOS  = planObj.get(fieldPlaType);
      var typeStr = getDisplay(typeOS);
      if (!typeStr) return;

      var commentaire = planObj.get(fieldPlaCom) || '';
      var rowId = (fieldPlaRowId ? planObj.get(fieldPlaRowId) : null) || '';

      // Équipiers
      var equipeList = readList(planObj.get(fieldPlaEquipe));
      var equipiers  = [];
      equipeList.forEach(function(u) {
        var name = getField(u, fieldUserName);
        if (name) { equipiers.push({ name: name, type: 'equipier' }); usedEquipiers[name] = true; }
      });

      // Sous-traitants
      var sttList = readList(planObj.get(fieldPlaStt));
      sttList.forEach(function(s) {
        var name = getField(s, fieldSttName);
        if (name) { equipiers.push({ name: name, type: 'soustraitant' }); usedStt[name] = true; }
      });

      // Chantiers
      var chaList   = readList(planObj.get(fieldPlaCha));
      var chantiers = chaList.map(function(c) {
        var name = getField(c, fieldChName);
        if (name && !resourceMap[name]) resourceMap[name] = { obj: c, type: 'chantier' };
        return name ? { name: name, type: 'chantier', origPool: null } : null;
      }).filter(Boolean);

      // Véhicule
      var vehObj  = planObj.get(fieldPlaVehicule);
      var vehName = vehObj && typeof vehObj.get === 'function' ? getField(vehObj, fieldVehName) : null;
      if (vehName) usedVehicules[vehName] = true;

      var typeNorm = typeStr.toLowerCase();

      if (typeNorm === 'absence') {
        var motifOS  = planObj.get(fieldPlaMotif);
        var motifStr = getDisplay(motifOS);
        if (motifStr) {
          if (!absences[motifStr]) absences[motifStr] = [];
          if (rowId && !absenceRowIdMap[motifStr]) absenceRowIdMap[motifStr] = rowId;
          equipiers.forEach(function(eq) {
            if (absences[motifStr].indexOf(eq.name) === -1) absences[motifStr].push(eq.name);
          });
        }

      } else if (typeNorm === 'chantier') {
        rows.chantier.push({
          rowId:       rowId,
          chantiers:   chantiers,
          equipiers:   equipiers,
          vehicules:   vehName ? [{ name: vehName, type: 'vehicule' }] : [],
          commentaire: commentaire,
        });

      } else if (typeNorm === 'transport') {
        rows.transport.push({
          rowId:       rowId,
          chantiers:   chantiers,
          equipiers:   equipiers,
          vehicule:    vehName ? { name: vehName, type: 'vehicule' } : null,
          commentaire: commentaire,
        });

      } else if (typeNorm === 'atelier') {
        var posteOS  = planObj.get(fieldPlaPoste);
        var posteStr = getDisplay(posteOS) || (postes[0] || 'K2');
        rows.atelier.push({
          rowId:       rowId,
          poste:       posteStr,
          chantiers:   chantiers,
          equipiers:   equipiers,
          commentaire: commentaire,
        });

      } else if (typeNorm === 'bureau') {
        rows.bureau.push({
          rowId:       rowId,
          equipiers:   equipiers,
          commentaire: commentaire,
        });
      }
    });

    // Tri zone chantier par ordre croissant du véhicule (sans véhicule → fin)
    rows.chantier.sort(function(a, b) {
      var vA = a.vehicules && a.vehicules[0] ? a.vehicules[0].name : null;
      var vB = b.vehicules && b.vehicules[0] ? b.vehicules[0].name : null;
      var oA = vA !== null && vehiculeOrdreMap[vA] !== undefined ? vehiculeOrdreMap[vA] : Infinity;
      var oB = vB !== null && vehiculeOrdreMap[vB] !== undefined ? vehiculeOrdreMap[vB] : Infinity;
      return oA - oB;
    });

    // ----------------------------------------------------------
    // POOLS = total − utilisés dans le planning
    // ----------------------------------------------------------
    st.pools.equipiers     = allEquipiers.filter(function(n) { return !usedEquipiers[n]; });
    st.pools.soustraitants = allStt.filter(function(n)       { return !usedStt[n]; });
    st.pools.vehicules     = allVehicules.filter(function(n) { return !usedVehicules[n]; });

    function notInRows(name, zoneRows) {
      return !zoneRows.some(function(r) {
        return (r.chantiers || []).some(function(c) { return c.name === name; });
      });
    }

    st.pools.chantiers.chantier    = allChJour.filter(function(n)  { return notInRows(n, rows.chantier);  });
    st.pools.chantiers.transport   = allChTrans.filter(function(n) { return notInRows(n, rows.transport); });
    st.pools.chantiers.k2          = allChK2.filter(function(n)    { return notInRows(n, rows.atelier);   });
    st.pools.chantiers.finitionK2  = allChFinK2.filter(function(n) { return notInRows(n, rows.atelier);   });
    st.pools.chantiers.fabrication = allChFab.filter(function(n)   { return notInRows(n, rows.atelier);   });

    st.rows     = rows;
    st.absences = absences;
    st.isOff    = instance.data.isOff;
    // Fusionner avec les IDs générés localement (pour ne pas perdre un ID créé avant la synchro BDD)
    var existingAbsRowIds = instance.data.absenceRowIdMap || {};
    Object.keys(existingAbsRowIds).forEach(function(m) {
      if (!absenceRowIdMap[m]) absenceRowIdMap[m] = existingAbsRowIds[m];
    });
    instance.data.absenceRowIdMap = absenceRowIdMap;

    // ----------------------------------------------------------
    // MAP conducteur → véhicules (highlight drag)
    // Relation profonde (vehicule → user) : wrapped en try/catch
    // car optionnel et peut ne pas être chargé sur certains cycles.
    // ----------------------------------------------------------
    if (fieldConduc1 || fieldConduc2) {
      var condMap = {};
      vehItems.forEach(function(v) {
        var vName = getField(v, fieldVehName);
        if (!vName) return;
        [fieldConduc1, fieldConduc2].forEach(function(f) {
          if (!f) return;
          try {
            var cObj = v.get(f);
            if (cObj && typeof cObj.get === 'function') {
              var cName = getField(cObj, fieldUserName);
              if (cName) {
                if (!condMap[cName]) condMap[cName] = [];
                if (condMap[cName].indexOf(vName) === -1) condMap[cName].push(vName);
              }
            }
          } catch(e) {}
        });
      });
      instance.data.conducteurToVehiculeNames = condMap;
    }

    // ----------------------------------------------------------
    // RENDER + COMMIT HASH
    // Le hash est écrit UNIQUEMENT après un render réussi.
    // Si quoi que ce soit a throwé avant ce point, le hash
    // reste à sa valeur précédente → prochain appel réessaie.
    // ----------------------------------------------------------
    if (instance.data.render) instance.data.render();
    instance.data.lastMasterHash = hash;
  }
}