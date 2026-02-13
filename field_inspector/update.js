function(instance, properties, context) {

  // --- Properties ---
  var dataSource = properties.data_type;

  if (!instance.data.initialized) { return; }

  // Build hash to avoid useless redraws
  var hash = '';
  try {
    if (dataSource && typeof dataSource.length === 'function') {
      var len = dataSource.length();
      if (len > 0) {
        var first = dataSource.get(0, 1)[0];
        if (first && typeof first.listProperties === 'function') {
          hash = first.listProperties().join('|');
        }
      } else {
        hash = 'empty';
      }
    } else {
      hash = 'none';
    }
  } catch (e) {
    if (!e.not_ready_key) { hash = 'error'; }
    else { return; }
  }

  if (instance.data.lastHash === hash) { return; }
  instance.data.lastHash = hash;

  // Rebuild display
  instance.data.container.innerHTML = '';

  if (!dataSource || typeof dataSource.length !== 'function') {
    var msg = document.createElement('div');
    msg.className = 'fi-empty';
    msg.textContent = 'Aucune source de donn\u00e9es';
    instance.data.container.appendChild(msg);
    return;
  }

  var len = dataSource.length();
  if (len === 0) {
    var msg = document.createElement('div');
    msg.className = 'fi-empty';
    msg.textContent = 'Liste vide';
    instance.data.container.appendChild(msg);
    return;
  }

  var items = dataSource.get(0, 1);
  var item = items[0];
  if (!item || typeof item.listProperties !== 'function') {
    var msg = document.createElement('div');
    msg.className = 'fi-empty';
    msg.textContent = 'Impossible de lire les propri\u00e9t\u00e9s';
    instance.data.container.appendChild(msg);
    return;
  }

  var fields = item.listProperties();

  var title = document.createElement('div');
  title.className = 'fi-title';
  title.textContent = fields.length + ' field' + (fields.length > 1 ? 's' : '');
  instance.data.container.appendChild(title);

  for (var i = 0; i < fields.length; i++) {
    var el = document.createElement('div');
    el.className = 'fi-field';
    el.textContent = fields[i];
    instance.data.container.appendChild(el);
  }
}
