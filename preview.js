function(instance, properties) {

  const chantiers = ['Chantier 1', 'Chantier 2', 'Chantier 3', 'Chantier 4', 'Chantier 5', 'Chantier 6'];

  // Fake data for preview
  const planningData = {
    'Chantier 1': {
      personnel: ['J. Dupont', 'M. Martin'],
      vehicules: ['Camion 3T'],
      soustraitants: ['Elec Pro']
    },
    'Chantier 2': {
      personnel: ['P. Durand'],
      vehicules: [],
      soustraitants: []
    },
    'Chantier 3': {
      personnel: [],
      vehicules: ['Fourgon 2'],
      soustraitants: ['Plomb Express']
    },
    'Chantier 4': { personnel: [], vehicules: [], soustraitants: [] },
    'Chantier 5': { personnel: [], vehicules: [], soustraitants: [] },
    'Chantier 6': { personnel: [], vehicules: [], soustraitants: [] }
  };

  const availablePersonnel = ['A. Leroy', 'S. Morel', 'K. Bensaid'];
  const availableVehicules = ['Berlingo', 'Benne 5T'];
  const availableSoustraitants = ['Peinture+', 'Terras Co'];

  // Colors
  const personnelColor = '#3B82F6';
  const vehiculeColor = '#10B981';
  const soustraitantColor = '#F59E0B';

  const personnelBg = '#EFF6FF';
  const vehiculeBg = '#ECFDF5';
  const soustraitantBg = '#FFFBEB';

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
      white-space: nowrap;
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

  function renderChantierRow(name, data) {
    return `<div style="
      display: flex;
      align-items: stretch;
      border-bottom: 1px solid #F1F5F9;
      min-height: 44px;
    ">
      <div style="
        width: 120px;
        min-width: 120px;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        font-size: 12px;
        font-weight: 600;
        color: #1E293B;
        border-right: 1px solid #E2E8F0;
        background: #FAFBFC;
      ">${name}</div>
      ${renderDropZone(data.personnel, personnelColor, personnelBg, 'Personnel')}
      ${renderDropZone(data.vehicules, vehiculeColor, vehiculeBg, 'Véhicules')}
      ${renderDropZone(data.soustraitants, soustraitantColor, soustraitantBg, 'Sous-traitants')}
    </div>`;
  }

  function renderResourceSection(title, items, color, bg, icon) {
    const tags = items.map(i => renderTag(i, color, bg)).join('');
    return `<div style="margin-bottom: 12px;">
      <div style="
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: ${color};
        margin-bottom: 6px;
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
        min-height: 30px;
        border: 1px dashed ${color}33;
      ">${tags}</div>
    </div>`;
  }

  // Get today's date formatted
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
      <!-- Planning Grid -->
      <div style="
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        overflow: hidden;
      ">
        <!-- Date Header -->
        <div style="
          padding: 10px 16px;
          background: #F8FAFC;
          border-bottom: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        ">
          <span style="font-size: 13px; font-weight: 600; color: #1E293B;">${dateStr}</span>
        </div>

        <!-- Column Headers -->
        <div style="
          display: flex;
          border-bottom: 2px solid #E2E8F0;
          background: #F8FAFC;
        ">
          <div style="
            width: 120px;
            min-width: 120px;
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
          <div style="flex: 1; padding: 6px 8px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${soustraitantColor}; text-align: center;">&#128188; Sous-traitants</div>
        </div>

        <!-- Rows -->
        <div style="flex: 1; overflow-y: auto;">
          ${chantiers.map(c => renderChantierRow(c, planningData[c])).join('')}
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