function(instance, properties) {

  const fields = ['_id', 'Created Date', 'Modified Date', 'nom_text', 'email_text', 'statut_custom_statut', 'equipe_list_user'];

  const html = `
    <div style="
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      padding: 12px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
    ">
      <div style="
        font-size: 12px;
        font-weight: 600;
        color: #64748B;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
      ">${fields.length} fields</div>
      ${fields.map(f => `<div style="
        font-size: 13px;
        padding: 6px 10px;
        background: #F1F5F9;
        border-radius: 4px;
        color: #1E293B;
        font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
      ">${f}</div>`).join('')}
    </div>
  `;

  $(instance.canvas).empty().append(html);
}
