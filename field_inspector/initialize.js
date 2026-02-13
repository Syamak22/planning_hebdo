function(instance, context) {

  let instanceId = (Math.random() * Math.pow(2, 54)).toString(36);
  instance.data.instanceName = 'fieldInspector-' + instanceId;

  let style = document.createElement('style');
  style.innerHTML = `
    .fieldInspector-${instanceId} {
      font-family: inherit;
      font-size: inherit;
      color: inherit;
      width: 100%;
      height: 100%;
      padding: 12px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .fieldInspector-${instanceId} .fi-title {
      font-size: 12px;
      font-weight: 600;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .fieldInspector-${instanceId} .fi-field {
      font-size: 13px;
      padding: 6px 10px;
      background: #F1F5F9;
      border-radius: 4px;
      color: #1E293B;
      font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
      cursor: pointer;
      user-select: all;
      transition: background 0.15s;
    }

    .fieldInspector-${instanceId} .fi-field:hover {
      background: #E2E8F0;
    }

    .fieldInspector-${instanceId} .fi-empty {
      font-size: 13px;
      color: #94A3B8;
      font-style: italic;
      padding: 8px;
    }
  `;
  document.head.appendChild(style);

  var container = document.createElement('div');
  container.className = 'fieldInspector-' + instanceId;

  instance.data.container = container;
  instance.canvas.append(container);
  instance.data.initialized = true;
}
