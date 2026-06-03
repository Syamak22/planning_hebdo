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
  var fieldPlaRowId      = properties.field_pla_row_id;
  var fieldPlaConducteur    = properties.field_pla_conducteur;
  var fieldPlaConducteurSst = properties.field_pla_conducteur_sst;
  var fieldVehLoc           = properties.field_veh_loc;
  var fieldPlaAtelierType   = properties.field_pla_atelier_type;
  var fieldPlaAtelierCha    = properties.field_pla_atelier_cha;
  var fieldPlaAtelierCom    = properties.field_pla_atelier_commentaire;
  instance.data.isDisplay = !!properties.is_display;
  instance.data.isOff     = !!properties.jour_off;

  var ttList = readList(properties.table_abs_tt);
  var ttMap  = {};
  ttList.forEach(function(u) {
    var name = u && typeof u.get === 'function' ? u.get(properties.field_user_name) : null;
    if (name) ttMap[name] = true;
  });
  instance.data.teletravailUsers = ttMap;

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
    var chJour                    = readList(props.table_ch_jour);
    var atelierPlaItems           = readList(props.table_pla_atelier);
    var atelierTypeItems          = readList(props.table_type_atelier);
    var atelierTransportTypeItems = readList(props.table_type_atelier_transport);
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
    var dayDateNorm = dayDate ? (function() { var d = new Date(dayDate); d.setHours(0,0,0,0); return d; }()) : null;
    var hash = 'display:' + (instance.data.isDisplay ? '1' : '0') + '|off:' + (instance.data.isOff ? '1' : '0') + '|tt:' + Object.keys(ttMap).join(',') + '|date:' + (dayDateNorm ? dayDateNorm.toISOString() : '');
    hash += '|u:' + userItems.map(function(u) { return getField(u, fieldUserName) || ''; }).join(',');
    hash += '|s:' + sttItems.map(function(s) { return getField(s, fieldSttName) || ''; }).join(',');
    hash += '|v:' + vehItems.map(function(v) { return getField(v, fieldVehName) || ''; }).join(',');
    hash += '|vi:' + vehIndispo.map(function(v) { return v.get('_id'); }).join(',');
    hash += '|abs:' + absenceItems.length;
    hash += '|pos:' + posteItems.length;
    hash += '|chDeb:' + (fieldChDateDebut ? chAll.map(function(c) {
      var d = c.get(fieldChDateDebut); return d ? d.getTime() : '';
    }).join(',') : '');
    hash += '|chJ:' + chJour.map(function(c) { return getField(c, fieldChName) || ''; }).join(',');
    hash += '|atelierTrans:' + atelierTransportTypeItems.map(function(t) {
      return t && typeof t.get === 'function' ? (t.get('display') || '') : '';
    }).join(',');
    hash += '|atelierPla:' + atelierPlaItems.map(function(a) {
      if (!a || typeof a.get !== 'function') return '';
      var typeOS  = fieldPlaAtelierType ? a.get(fieldPlaAtelierType) : null;
      var typeStr = typeOS && typeof typeOS.get === 'function' ? (typeOS.get('display') || '') : '';
      var chaObj  = fieldPlaAtelierCha ? a.get(fieldPlaAtelierCha) : null;
      var chaName = chaObj && typeof chaObj.get === 'function' ? (getField(chaObj, fieldChName) || '') : '';
      var com     = fieldPlaAtelierCom ? (a.get(fieldPlaAtelierCom) || '') : '';
      return typeStr + ':' + chaName + ':' + com;
    }).join(',');
    hash += '|chAll:' + chAll.map(function(c) { return getField(c, fieldChName) || ''; }).join(',');
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
      var motifOS    = fieldPlaMotif ? p.get(fieldPlaMotif) : null;
      var motifStr   = (motifOS && typeof motifOS.get === 'function') ? (motifOS.get('display') || '') : '';
      var condObjPla    = fieldPlaConducteur ? p.get(fieldPlaConducteur) : null;
      var condIdPla     = (condObjPla && typeof condObjPla.get === 'function') ? (condObjPla.get('_id') || '') : '';
      var condObjSstPla = (!condObjPla && fieldPlaConducteurSst) ? p.get(fieldPlaConducteurSst) : null;
      var condIdSstPla  = (condObjSstPla && typeof condObjSstPla.get === 'function') ? (condObjSstPla.get('_id') || '') : '';
      var comPla        = fieldPlaCom ? (p.get(fieldPlaCom) || '') : '';
      return id + ':' + typeStr + ':' + eqLen + ':' + sttLen2 + ':' + chaLen + ':' + vehId + ':' + posteStr + ':' + motifStr + ':' + condIdPla + ':' + condIdSstPla + ':' + comPla;
    }).join(',');

    if (instance.data.lastMasterHash === hash) return;

    // ----------------------------------------------------------
    // DATE
    // day_date utilisé uniquement à l'initialisation (st.date non encore définie).
    // Permet aussi d'ouvrir le planning sur une date spécifique depuis Bubble
    // en réinitialisant le plugin. Une fois la date définie, elle est gérée
    // en interne par le plugin et day_date est ignoré.
    // ----------------------------------------------------------
    var st = instance.data.state;
    if (dayDateNorm && !instance.data.dateInitialized) {
      st.date = dayDateNorm;
      instance.data.dateInitialized = true;
      try { instance.publishState('selected_date', dayDateNorm); } catch(e) {}
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
    var vehiculeLocMap = {};
    vehItems.forEach(function(v) {
      var name = getField(v, fieldVehName);
      if (!name) return;
      allVehicules.push(name);
      resourceMap[name] = { obj: v, type: 'vehicule' };
      if (fieldOrdre) {
        var ord = v.get(fieldOrdre);
        if (ord !== null && ord !== undefined) vehiculeOrdreMap[name] = Number(ord);
      }
      if (fieldVehLoc) {
        var isLoc = v.get(fieldVehLoc);
        if (isLoc) vehiculeLocMap[name] = true;
      }
    });
    instance.data.vehiculeOrdreMap = vehiculeOrdreMap;
    instance.data.vehiculeLocMap   = vehiculeLocMap;

    // MAP véhicule → conducteur par défaut (via field_conduc1 sur l'objet véhicule)
    var defaultConducteurMap = {};
    if (fieldConduc1) {
      vehItems.forEach(function(v) {
        var vName = getField(v, fieldVehName);
        if (!vName) return;
        try {
          var cObj = v.get(fieldConduc1);
          if (cObj && typeof cObj.get === 'function') {
            var cName = getField(cObj, fieldUserName);
            if (cName) {
              defaultConducteurMap[vName] = { name: cName, obj: cObj };
              if (!resourceMap[cName]) resourceMap[cName] = { obj: cObj, type: 'user' };
            }
          }
        } catch(e) {}
      });
    }
    instance.data.defaultConducteurMap = defaultConducteurMap;

    var allChJour = chJour.map(function(c) { return getField(c, fieldChName); }).filter(Boolean);

    // Types atelier dynamiques depuis l'option set
    var atelierTypes = atelierTypeItems.map(function(t) {
      return t && typeof t.get === 'function' ? (t.get('display') || '') : '';
    }).filter(Boolean);

    var atelierTransportTypes = atelierTransportTypeItems.map(function(t) {
      return t && typeof t.get === 'function' ? (t.get('display') || '') : '';
    }).filter(Boolean);
    instance.data.atelierTransportTypes = atelierTransportTypes;

    // Maps atelier : typeDisplay → [chantierNames] et chantierName → commentaire
    var atelierTypeChantierMap   = {};
    var atelierChantierCommentMap = {};
    atelierTypes.forEach(function(t) { atelierTypeChantierMap[t] = []; });

    var chantierDebutMap = {};
    atelierPlaItems.forEach(function(a) {
      if (!a || typeof a.get !== 'function') return;
      var typeOS  = fieldPlaAtelierType ? a.get(fieldPlaAtelierType) : null;
      var typeStr = typeOS && typeof typeOS.get === 'function' ? (typeOS.get('display') || '') : '';
      var chaObj  = fieldPlaAtelierCha ? a.get(fieldPlaAtelierCha) : null;
      var chaName = chaObj && typeof chaObj.get === 'function' ? getField(chaObj, fieldChName) : null;
      if (!typeStr || !chaName) return;
      if (!atelierTypeChantierMap[typeStr]) atelierTypeChantierMap[typeStr] = [];
      if (atelierTypeChantierMap[typeStr].indexOf(chaName) === -1) atelierTypeChantierMap[typeStr].push(chaName);
      resourceMap[chaName] = { obj: chaObj, type: 'chantier' };
      if (fieldChDateDebut) {
        try { var d = chaObj.get(fieldChDateDebut); if (d) chantierDebutMap[chaName] = d; } catch(e) {}
      }
      var com = fieldPlaAtelierCom ? (a.get(fieldPlaAtelierCom) || '') : '';
      if (com) atelierChantierCommentMap[chaName] = com;
    });

    instance.data.atelierTypes             = atelierTypes;
    instance.data.atelierTypeChantierMap   = atelierTypeChantierMap;
    instance.data.atelierChantierCommentMap = atelierChantierCommentMap;

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
      var atelierAllChantiers = [];
      atelierTypes.forEach(function(t) {
        (atelierTypeChantierMap[t] || []).forEach(function(n) {
          if (atelierAllChantiers.indexOf(n) === -1) atelierAllChantiers.push(n);
        });
      });
      chantierList = allChJour.concat(atelierAllChantiers)
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

      // Conducteur (override planning ou défaut véhicule)
      var conducteur = null;
      var condObjRow = fieldPlaConducteur ? planObj.get(fieldPlaConducteur) : null;
      if (condObjRow && typeof condObjRow.get === 'function') {
        var cRowName = getField(condObjRow, fieldUserName);
        if (cRowName) {
          conducteur = { name: cRowName, obj: condObjRow, type: 'equipier' };
          if (!resourceMap[cRowName]) resourceMap[cRowName] = { obj: condObjRow, type: 'user' };
        }
      }
      if (!conducteur && fieldPlaConducteurSst) {
        var condSstRow = planObj.get(fieldPlaConducteurSst);
        if (condSstRow && typeof condSstRow.get === 'function') {
          var cSstName = getField(condSstRow, fieldSttName);
          if (cSstName) {
            conducteur = { name: cSstName, obj: condSstRow, type: 'soustraitant' };
            if (!resourceMap[cSstName]) resourceMap[cSstName] = { obj: condSstRow, type: 'soustraitant' };
          }
        }
      }
      if (!conducteur && vehName && defaultConducteurMap[vehName]) {
        conducteur = defaultConducteurMap[vehName];
      }

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
          conducteur:  conducteur,
          commentaire: commentaire,
        });

      } else if (typeNorm === 'transport') {
        var chantiersForTransport = chantiers.map(function(c) {
          var derivedPool = null;
          atelierTransportTypes.forEach(function(t) {
            if (!derivedPool && (atelierTypeChantierMap[t] || []).indexOf(c.name) !== -1) derivedPool = t;
          });
          return { name: c.name, type: c.type, origPool: derivedPool };
        });
        rows.transport.push({
          rowId:       rowId,
          chantiers:   chantiersForTransport,
          equipiers:   equipiers,
          vehicule:    vehName ? { name: vehName, type: 'vehicule' } : null,
          conducteur:  conducteur,
          commentaire: commentaire,
        });

      } else if (typeNorm === 'atelier') {
        var posteOS  = planObj.get(fieldPlaPoste);
        var posteStr = getDisplay(posteOS) || (postes[0] || 'K2');
        var POSTE_TO_POOL = { 'K2': '⚙️ K2', 'Finition K2': '✅ Finitions K2', 'Fabrication': '🏭 Fabrication' };
        var postePool = POSTE_TO_POOL[posteStr] || null;
        var chantiersWithPool = chantiers.map(function(c) {
          return { name: c.name, type: c.type, origPool: postePool };
        });
        rows.atelier.push({
          rowId:       rowId,
          poste:       posteStr,
          chantiers:   chantiersWithPool,
          equipiers:   equipiers,
          commentaire: commentaire,
        });

      } else if (typeNorm === 'bureau') {
        rows.bureau.push({
          rowId:       rowId,
          equipiers:   equipiers,
          vehicule:    vehName ? { name: vehName, type: 'vehicule' } : null,
          conducteur:  conducteur,
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

    // Pool-aware : un chantier ne disparaît d'un pool que s'il a été posé DEPUIS ce pool
    function notInRowsForPool(name, poolKey, zoneRows) {
      return !zoneRows.some(function(r) {
        return (r.chantiers || []).some(function(c) { return c.name === name && c.origPool === poolKey; });
      });
    }

    st.pools.chantiers.chantier = allChJour.filter(function(n) { return notInRows(n, rows.chantier); });

    var atelierTransportTypeSet = {};
    atelierTransportTypes.forEach(function(t) { atelierTransportTypeSet[t] = true; });

    atelierTypes.forEach(function(t) {
      var relevantRows = atelierTransportTypeSet[t] ? rows.transport : rows.atelier;
      st.pools.chantiers[t] = (atelierTypeChantierMap[t] || []).filter(function(n) {
        return notInRowsForPool(n, t, relevantRows);
      });
    });

    // Conserver les lignes "locales" (non encore sauvegardées en DB)
    // Une ligne locale = rowId non présent dans aucun planItem
    var dbRowIds = {};
    planItems.forEach(function(p) {
      if (!p || typeof p.get !== 'function') return;
      var rid = fieldPlaRowId ? p.get(fieldPlaRowId) : null;
      if (rid) dbRowIds[rid] = true;
    });
    var prevRenderDate = instance.data.lastRenderDate;
    var dateUnchanged = prevRenderDate && st.date && prevRenderDate.getTime() === st.date.getTime();
    if (dateUnchanged) {
      ['chantier', 'transport', 'atelier', 'bureau'].forEach(function(zone) {
        var prevRows = st.rows[zone] || [];
        prevRows.forEach(function(r) {
          if (r.rowId && !dbRowIds[r.rowId]) {
            rows[zone].push(r);
          }
        });
      });
    }

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
    instance.data.lastMasterHash  = hash;
    instance.data.lastRenderDate  = st.date;
  }
}