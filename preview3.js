function(instance, properties) {

  const chantiers = [
    { name: 'Nouveau A', start: true, livraison: true },
    { name: 'Nouveau B', start: true, livraison: false },
    { name: 'Chantier 1', start: false, livraison: true },
    { name: 'Chantier 2', start: false, livraison: false },
    { name: 'Chantier 3', start: false, livraison: false },
    { name: 'Chantier 4', start: false, livraison: false }
  ];

  // Fake data for preview
  const planningData = {
    'Nouveau A': {
      personnel: ['L. Garcia'],
      vehicules: ['Camion 5T'],
      soustraitants: [],
      atelier: ['R. Petit'],
      commentaire: 'RDV 8h sur site'
    },
    'Nouveau B': {
      personnel: [],
      vehicules: [],
      soustraitants: ['Terras Co'],
      atelier: [],
      commentaire: ''
    },
    'Chantier 1': {
      personnel: ['J. Dupont', 'M. Martin'],
      vehicules: ['Camion 3T'],
      soustraitants: ['Elec Pro'],
      atelier: ['B. Noel'],
      commentaire: 'Finir pose charpente'
    },
    'Chantier 2': {
      personnel: ['P. Durand'],
      vehicules: [],
      soustraitants: [],
      atelier: [],
      commentaire: ''
    },
    'Chantier 3': {
      personnel: [],
      vehicules: ['Fourgon 2'],
      soustraitants: ['Plomb Express'],
      atelier: [],
      commentaire: 'Attente livraison bois'
    },
    'Chantier 4': { personnel: [], vehicules: [], soustraitants: [], atelier: [], commentaire: '' }
  };

  const availablePersonnel = ['A. Leroy', 'S. Morel'];
  const availableVehicules = ['Berlingo', 'Benne 5T'];
  const availableSoustraitants = ['Peinture+'];

  // Absences / Indisponibilités
  const absences = [
    { type: 'Congés', personnel: ['K. Bensaid', 'T. Moreau'] },
    { type: 'Formation', personnel: ['H. Lemoine'] },
    { type: 'Arrêt de travail', personnel: ['C. Fabre'] },
    { type: 'Visite médicale', personnel: ['N. Roux'] },
    { type: 'Divers', personnel: [] }
  ];

  // Colors
  const personnelColor = '#3B82F6';
  const vehiculeColor = '#10B981';
  const soustraitantColor = '#F59E0B';
  const atelierColor = '#8B5CF6';

  const personnelBg = '#EFF6FF';
  const vehiculeBg = '#ECFDF5';
  const soustraitantBg = '#FFFBEB';
  const atelierBg = '#F5F3FF';

  const bureauColor = '#0EA5E9';
  const bureauBg = '#F0F9FF';

  const absenceColor = '#EF4444';
  const absenceBg = '#FEF2F2';

  // Bureau
  const bureauPersonnel = ['D. Laurent', 'V. Simon'];

  function renderTag(name, color, bg) {
    return `<span style="
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      margin: 2px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      color: ${color};
      background: ${bg};
      border: 1px solid ${color}22;
      white-space: normal;
      word-break: break-word;
      max-width: 180px;
      line-height: 1.4;
    ">${name}</span>`;
  }

  function renderDropZone(items, color, bg, label) {
    const tags = items.length > 0
      ? items.map(i => renderTag(i, color, bg)).join('')
      : `<span style="font-size: 10px; color: ${color}88; font-style: italic;">${label}</span>`;

    return `<div style="
      flex: 1;
      min-height: 28px;
      padding: 3px 4px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 2px;
      background: ${bg}66;
      border-right: 1px solid #F1F5F9;
      border-radius: 4px;
      margin: 2px;
    ">${tags}</div>`;
  }

  function renderChantierRow(name, data, isStart, hasLivraison) {
    const livraisonBadge = hasLivraison
      ? `<span style="
          display: inline-flex;
          align-items: center;
          gap: 2px;
          padding: 1px 5px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
          background: #FFF7ED;
          color: #EA580C;
          border: 1px solid #FDBA7488;
          line-height: 1.5;
        ">🚚 Livraison</span>`
      : '';

    return `<div style="
      display: flex;
      align-items: stretch;
      border-bottom: 1px solid #F1F5F9;
      min-height: 44px;
    ">
      <div style="
        width: 110px;
        min-width: 110px;
        padding: 8px 8px 8px ${isStart ? '9px' : '12px'};
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 3px;
        font-size: 12px;
        font-weight: 600;
        color: #1E293B;
        border-right: 1px solid #E2E8F0;
        background: #FAFBFC;
        ${isStart ? 'border-left: 3px solid #10B981;' : ''}
      ">
        <div style="display:flex;align-items:center;gap:6px;width:100%;">
          <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;">${name}</span><span style="
        width: 18px; height: 18px; min-width: 18px;
        display: inline-flex; align-items: center; justify-content: center;
        border-radius: 50%; border: 1px solid #CBD5E1;
        background: #FFFFFF; color: #64748B;
        cursor: pointer;
      " title="Commentaire"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span><span style="
        width: 18px; height: 18px; min-width: 18px;
        display: inline-flex; align-items: center; justify-content: center;
        border-radius: 50%; border: 1px solid #CBD5E1;
        background: #FFFFFF; color: #64748B;
        font-size: 10px; font-weight: 700; font-style: italic;
        font-family: Georgia, serif; cursor: pointer;
      ">i</span>
        </div>
        ${livraisonBadge}
      </div>
      ${renderDropZone(data.personnel, personnelColor, personnelBg, 'Personnel')}
      ${renderDropZone(data.vehicules, vehiculeColor, vehiculeBg, 'Véhicules')}
      ${renderDropZone(data.soustraitants, soustraitantColor, soustraitantBg, 'Sous-trait.')}
      ${renderDropZone(data.atelier, atelierColor, atelierBg, 'Atelier')}
    </div>`;
  }

  function renderResourceSection(title, items, color, bg, icon) {
    const tags = items.map(i => renderTag(i, color, bg)).join('');
    return `<div style="margin-bottom: 10px;">
      <div style="
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: ${color};
        margin-bottom: 4px;
        display: flex;
        align-items: center;
        gap: 4px;
      ">${icon} ${title}</div>
      <div style="
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        padding: 6px;
        background: ${bg}88;
        border-radius: 6px;
        min-height: 28px;
        border: 1px dashed ${color}33;
      ">${tags || '<span style="font-size:10px;color:#94A3B8;font-style:italic;">Aucun</span>'}</div>
    </div>`;
  }

  // Absence section
  function renderAbsenceRow(type, personnel) {
    const tags = personnel.length > 0
      ? personnel.map(p => renderTag(p, absenceColor, absenceBg)).join('')
      : `<span style="font-size: 10px; color: #94A3B8; font-style: italic;">—</span>`;

    return `<div style="
      display: flex;
      align-items: center;
      border-bottom: 1px solid #F1F5F9;
      min-height: 34px;
    ">
      <div style="
        width: 130px;
        min-width: 130px;
        padding: 6px 10px;
        font-size: 11px;
        font-weight: 600;
        color: #64748B;
        border-right: 1px solid #E2E8F0;
        background: #FAFBFC;
      ">${type}</div>
      <div style="
        flex: 1;
        padding: 4px 6px;
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        align-items: center;
      ">${tags}</div>
    </div>`;
  }

  // Date
  const today = new Date();
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const dateStr = `${days[today.getDay()]} ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

  const html = `
    <div style="
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      display: flex;
      gap: 12px;
      padding: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #FFFFFF;
      overflow: hidden;
    ">
      <!-- Main Column (Planning + Absences) -->
      <div style="
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
        gap: 12px;
        overflow: hidden;
      ">
        <!-- Planning Grid -->
        <div style="
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          overflow: hidden;
        ">
          <!-- Date Header -->
          <div style="
            padding: 6px 16px;
            background: #F8FAFC;
            border-bottom: 1px solid #E2E8F0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            position: relative;
          ">
            <div style="
              width: 28px; height: 28px;
              display: flex; align-items: center; justify-content: center;
              border-radius: 6px;
              cursor: pointer;
              color: #64748B;
              background: #E2E8F0;
              font-size: 14px;
              font-weight: 600;
            ">&#x2039;</div>
            <div style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <span style="font-size: 13px; font-weight: 600; color: #1E293B;">${dateStr}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div style="
              width: 28px; height: 28px;
              display: flex; align-items: center; justify-content: center;
              border-radius: 6px;
              cursor: pointer;
              color: #64748B;
              background: #E2E8F0;
              font-size: 14px;
              font-weight: 600;
            ">&#x203A;</div>
            <div style="
              width: 28px; height: 28px;
              display: flex; align-items: center; justify-content: center;
              border-radius: 6px;
              cursor: pointer;
              color: #64748B;
              background: #E2E8F0;
              position: absolute;
              right: 48px;
            " title="Dupliquer"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
            <div style="
              width: 28px; height: 28px;
              display: flex; align-items: center; justify-content: center;
              border-radius: 6px;
              cursor: pointer;
              color: #64748B;
              background: #E2E8F0;
              position: absolute;
              right: 12px;
            " title="Imprimer"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg></div>
          </div>

          <!-- Column Headers -->
          <div style="
            display: flex;
            border-bottom: 2px solid #E2E8F0;
            background: #F8FAFC;
          ">
            <div style="
              width: 110px;
              min-width: 110px;
              padding: 6px 12px;
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #64748B;
              border-right: 1px solid #E2E8F0;
            ">Chantier</div>
            <div style="flex: 1; padding: 6px 8px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${personnelColor}; border-right: 1px solid #F1F5F9; text-align: center;">&#128100; Personnel</div>
            <div style="flex: 1; padding: 6px 8px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${vehiculeColor}; border-right: 1px solid #F1F5F9; text-align: center;">&#128663; Véhicules</div>
            <div style="flex: 1; padding: 6px 8px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${soustraitantColor}; border-right: 1px solid #F1F5F9; text-align: center;">&#128188; Sous-trait.</div>
            <div style="flex: 1; padding: 6px 8px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${atelierColor}; text-align: center;">&#128295; Atelier</div>
          </div>

          <!-- Rows -->
          <div style="flex: 1; overflow-y: auto;">
            ${chantiers.map(c => renderChantierRow(c.name, planningData[c.name], c.start, c.livraison)).join('')}
          </div>
        </div>

        <!-- Absences / Indisponibilités -->
        <div style="
          display: flex;
          flex-direction: column;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          overflow: hidden;
        ">
          <div style="
            padding: 8px 12px;
            background: ${absenceBg};
            border-bottom: 1px solid #E2E8F0;
            font-size: 11px;
            font-weight: 600;
            color: ${absenceColor};
            display: flex;
            align-items: center;
            gap: 6px;
          ">&#128683; Absences / Indisponibilités</div>
          ${absences.map(a => renderAbsenceRow(a.type, a.personnel)).join('')}
        </div>

        <!-- Bureau + Atelier général (50/50) -->
        <div style="display: flex; gap: 12px;">
          <!-- Bureau -->
          <div style="
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            overflow: hidden;
          ">
            <div style="
              padding: 8px 12px;
              background: ${bureauBg};
              border-bottom: 1px solid #E2E8F0;
              font-size: 11px;
              font-weight: 600;
              color: ${bureauColor};
              display: flex;
              align-items: center;
              gap: 6px;
            ">&#128188; Bureau</div>
            <div style="
              padding: 6px 10px;
              display: flex;
              flex-wrap: wrap;
              gap: 4px;
              align-items: center;
              min-height: 34px;
            ">${bureauPersonnel.map(p => renderTag(p, bureauColor, bureauBg)).join('')}</div>
          </div>
          <!-- Atelier général -->
          <div style="
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            overflow: hidden;
          ">
            <div style="
              padding: 8px 12px;
              background: #F5F3FF;
              border-bottom: 1px solid #E2E8F0;
              font-size: 11px;
              font-weight: 600;
              color: #8B5CF6;
              display: flex;
              align-items: center;
              gap: 6px;
            ">&#128295; Atelier général</div>
            <div style="
              padding: 6px 10px;
              display: flex;
              flex-wrap: wrap;
              gap: 4px;
              align-items: center;
              min-height: 34px;
            ">${['C. Michel', 'F. Blanc'].map(p => renderTag(p, atelierColor, atelierBg)).join('')}</div>
          </div>
        </div>
      </div>

      <!-- Resources Panel -->
      <div style="
        width: 160px;
        min-width: 160px;
        display: flex;
        flex-direction: column;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        overflow: hidden;
      ">
        <div style="
          padding: 8px 12px;
          background: #F8FAFC;
          border-bottom: 1px solid #E2E8F0;
          font-size: 11px;
          font-weight: 600;
          color: #1E293B;
          text-align: center;
        ">Ressources</div>
        <div style="padding: 10px; flex: 1; overflow-y: auto;">
          ${renderResourceSection('Personnel', availablePersonnel, personnelColor, personnelBg, '&#128100;')}
          ${renderResourceSection('Véhicules', availableVehicules, vehiculeColor, vehiculeBg, '&#128663;')}
          ${renderResourceSection('Sous-traitants', availableSoustraitants, soustraitantColor, soustraitantBg, '&#128188;')}
        </div>
      </div>
    </div>
  `;

  $(instance.canvas).empty().append(html);
}