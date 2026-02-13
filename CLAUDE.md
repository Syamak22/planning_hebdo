Bubble Web Plugin Rules

# Bubble Web Plugin Rules (for Claude)

---

## 1) Tech + File Contracts (JavaScript & CSS only)

- The plugin must be built with **JavaScript and CSS only** (no modules/bundlers).
- **`update.js`**
  - Runs **every time** Bubble re-renders or properties change.
  - All code **must** be wrapped in:

    ```js
    function(instance, properties, context) { ... }
    ```

    More info about update.js : 
    
    ```for example if I have 4 properties, I can access them :
    properties = {
     app_type: String (type ID)
     data_type: List of Objects
     day_date: Date
     name_display: String
     bubble: Object containing the element bubble properties (see below)
    }````

    when I have a data type properties I have function : 
    data_type = {
     length: function() - returns the length of the list as a Number
     get: function(start, length) - returns an array of objects starting from start with the speicified length (0 is first)
    }

    data_type.get(0, n)[0] = {
     get: function(fieldName: String) - returns the value of a field for the object
     listProperties: function() - returns an array of the different fields you can access
    }

    You can access all bubble properties :

    properties.bubble = {
     width: function() - returns a Number
     height: function() - returns a Number
     background_style: function() - returns a String
     bgcolor: function() - returns a String
     background_gradient_style: function() - returns a String
     background_gradient_direction: function() - returns a String
     background_gradient_custom_angle: function() - returns a Number
     background_radial_gradient_shape: function() - returns a String
     background_radial_gradient_size: function() - returns a String
     background_radial_gradient_xpos: function() - returns a Number
     background_radial_gradient_ypos: function() - returns a Number
     background_gradient_from: function() - returns a String
     background_gradient_to: function() - returns a String
     background_gradient_mid: function() - returns a String
     background_image: function() - returns a String
     center_background: function() - returns a Boolean
     background_size_cover: function() - returns a Boolean
     crop_responsive: function() - returns a Boolean
     repeat_background_vertical: function() - returns a Boolean
     repeat_background_horizontal: function() - returns a Boolean
     background_color_if_empty_image: function() - returns a String
     four_border_style: function() - returns a Boolean
     border_style: function() - returns a String
     border_roundness: function() - returns a Number
     border_width: function() - returns a Number
     border_color: function() - returns a String
     border_style_top: function() - returns a String
     border_roundness_top: function() - returns a Number
     border_width_top: function() - returns a Number
     border_color_top: function() - returns a String
     border_style_right: function() - returns a String
     border_roundness_right: function() - returns a Number
     border_width_right: function() - returns a Number
     border_color_right: function() - returns a String
     border_style_bottom: function() - returns a String
     border_roundness_bottom: function() - returns a Number
     border_width_bottom: function() - returns a Number
     border_color_bottom: function() - returns a String
     border_style_left: function() - returns a String
     border_roundness_left: function() - returns a Number
     border_width_left: function() - returns a Number
     border_color_left: function() - returns a String
     padding_vertical: function() - returns a Number
     padding_horizontal: function() - returns a Number
     is_visible: function() - returns a Boolean
    }


- **`initialize.js`**
  - Runs **once on page load** (place all initialization code here).
  - All code **must** be wrapped in:

    ```js
    function(instance, context) { ... }
    ```

    More info about initialize.js : 
    
    ```instance = {
     canvas: div wrapped in a jQuery object
     publishState: function(name: String, value) - changes the value of a state
     triggerEvent: function(name: String, callback: function(err)) - triggers an event
     data: Object containing custom data - read and write by doing instance.data.your_variable
    }```

    ```context = {
     currentUser: {
         get: function(fieldName: String) - returns the value of a field for the object
         listProperties: function() - returns an array of the different fields you can access. These fields will include email, logged_in, Slug, Created Date, Modified Date, and _id. 
     }
     jQuery: main jQuery object
     uploadContent: function(fileName: String, contents: Base64 String, callback: function(err, url), [attachTo])
                    attachTo: optional parameter to attach the file to. It has to be a thing in Bubble
     async: call context.async with a function that kicks off an asynchronous operation, 
         taking a callback taking (err, res). Returns res or else throws error.
     keys: Object with Keys defined in the Plugins Tab
     onCookieOptIn: function(callback: function - runs callback once cookies are allowed (immediately if already accepted)
     reportDebugger: function(message: String) - reports an error to the debugger
    }```



- **`style.css`**
  - Stores **all styles and CSS**.
  - CSS **must** be wrapped in `<style> ... </style>` tags.

- **`preview.js`**
  - A simplified render for the editor preview.
  - All code **must** be wrapped in:

    ```js
    function(properties, context) { ... }
    ```

  - Example:

    ```js
    function(properties, context) {
      return `<div style="width: 100%; height: 20px; background: ${properties.bg_color || '#E0E0E0'}; border-radius: 10px; overflow: hidden;">
                <div style="height: 100%; width: ${Math.max(0, Math.min(100, properties.progress_value || 0))}%; background: ${properties.fill_color || '#4CAF50'};"></div>
              </div>`;
    }
    ```

---

## 2) Module Syntax

- **Never** use `module.exports` (keyword or object).

---

## 3)

---

## 4) Publishing State

- To publish/save a state, use:

  ```js
  instance.publishState("name", value);
  ```

---

## 5) Triggering Events

- To trigger an event, use:

  ```js
  instance.triggerEvent("event_name");
  ```

---

## 6) Dynamic Properties

- Access dynamic values via `properties.<property_name>`. Examples:

  ```js
  const totalStars = properties.totalStars || 5;
  const filledColor = properties.filledColor || "#facc15";
  const readOnly = properties.readOnly || false;
  ```

---

## 7) External Libraries

- You may **import external libraries** if needed (via `<script>` tags, etc.).

---

## 8) Property Ordering

- **All properties must be defined at the top/beginning** of the code.

---

## 9) Per-Instance ID

- **Always** create an ID for the element at the beginning of the code:

  ```js
  let instanceId = (Math.random() * Math.pow(2, 54)).toString(36);
  instance.data.instanceName = "chessBoard-" + instanceId;
  ```

---

## 10) Default Style Inheritance

- Add default styles so the element inherits font and color from the host:
  - Inline style example:

    ```html
    style="font-family: inherit; font-size: inherit; font-weight: inherit;
    color: inherit;"
    ```

  - **Style Inheritance** sample:

    ```js
    let style = document.createElement("style");
    style.innerHTML = `.chessBoard-${instanceId} {
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      color: inherit;
      width: 100%;
      height: 100%;
      padding: 0;
      margin: 0;
      background-color: transparent;
      border: 0;
    }`;
    ```

---

## 11) File Upload to Bubble

- To upload files to Bubble's storage, use `context.uploadContent()`:

  ```js
  // Convert blob to base64 data URL first
  const reader = new FileReader();
  reader.onload = function () {
    const dataUrl = reader.result;
    const base64Data = dataUrl.includes("base64,")
      ? dataUrl.split("base64,")[1]
      : dataUrl;

    const fileName = "my-file.webp";

    function uploadContentCallback(err, url) {
      if (err) {
        console.error("Upload callback error:", err);
        return;
      }
      console.log("Received URL from Bubble:", url);
      if (url) {
        instance.publishState("bubble_url", url);
      }
    }

    context.uploadContent(fileName, base64Data, uploadContentCallback);
  };

  reader.onerror = function (error) {
    console.error("FileReader error:", error);
  };

  reader.readAsDataURL(blob);
  ```

- **Important Notes:**
  - Always convert blobs to base64 data URLs before uploading
  - The callback function receives `(error, url)` parameters
  - Handle both success and error cases in the callback
  - Use `instance.publishState()` to store the returned URL

- **Complete Upload Function Example:**

  ```js
  instance.data.uploadToBubble = function (blob, fileName) {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = function () {
          const dataUrl = reader.result;
          const base64Data = dataUrl.includes("base64,")
            ? dataUrl.split("base64,")[1]
            : dataUrl;

          function uploadContentCallback(err, url) {
            if (err) {
              console.error("Upload callback error:", err);
              reject(err);
              return;
            }
            console.log("Received URL from Bubble:", url);
            if (url) {
              instance.publishState("bubble_url", url);
              resolve(url);
            } else {
              reject(new Error("Upload failed - no URL returned"));
            }
          }

          context.uploadContent(fileName, base64Data, uploadContentCallback);
        };

        reader.onerror = function (error) {
          console.error("FileReader error:", error);
          reject(error);
        };

        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Upload to Bubble error:", error);
        reject(error);
      }
    });
  };
  ```

---

## Sample Code

### `initialize.js` Sample Code

```js
function(instance, context) {
  // Generate a unique identifier for this instance
  const uniqueId = 'dropdown_' + Math.random().toString(36).substr(2, 9);

  // Create the main dropdown container
  const dropdownContainer = document.createElement('div');
  dropdownContainer.className = 'dropdown-container';
  dropdownContainer.setAttribute('data-instance', uniqueId);

  // Create the dropdown header
  const dropdownHeader = document.createElement('div');
  dropdownHeader.className = 'dropdown-header';

  // Create the header text
  const headerText = document.createElement('span');
  headerText.textContent = 'Select options';
  headerText.className = 'header-text';

  // Create the chevron icon
  const chevron = document.createElement('div');
  chevron.className = 'chevron';
  instance.data.chevron = chevron;

  // Append text and chevron to header
  dropdownHeader.appendChild(headerText);
  dropdownHeader.appendChild(chevron);

  // Create the options container
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'options-container';
  optionsContainer.setAttribute('data-instance', uniqueId);

  // Store references in instance.data
  instance.data.dropdownContainer = dropdownContainer;
  instance.data.optionsContainer = optionsContainer;
  instance.data.headerText = headerText;
  instance.data.dropdownHeader = dropdownHeader;

  // Initialize empty options array - will be populated in update function
  instance.data.options = [];

  // Function to update header text
  function updateHeaderText() {
    const selectedOptions = instance.data.options.filter(option => option.selected);

    if (selectedOptions.length === 0) {
      headerText.textContent = 'Select options';
    } else if (selectedOptions.length === 1) {
      headerText.textContent = selectedOptions[0].label;
    } else {
      headerText.textContent = `${selectedOptions.length} selected`;
    }
  }

  // Position the options container relative to the dropdown header
  function positionOptionsContainer() {
    const headerRect = dropdownHeader.getBoundingClientRect();
    optionsContainer.style.width = headerRect.width + 'px';
    optionsContainer.style.top = (headerRect.bottom + 5) + 'px';
    optionsContainer.style.left = headerRect.left + 'px';
  }

  // Add the dropdown header click handler
  dropdownHeader.addEventListener('click', (event) => {
    event.stopPropagation();

    // Don't do anything if disabled
    if (dropdownContainer.classList.contains('disabled')) {
      return;
    }

    const isOpen = optionsContainer.style.display === 'block';

    if (!isOpen) {
      positionOptionsContainer();
      optionsContainer.style.display = 'block';
      chevron.classList.add('open');

      // When opening the dropdown, force update all checkboxes
      const checkmarkSvg = `
<svg viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
  <path d="M3.5 6.5l2 2 4-4" stroke="white" stroke-width="2" fill="none"/>
</svg>
`;

      // Clear and recreate all options to ensure proper state
      optionsContainer.innerHTML = '';

      instance.data.options.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';

        const checkbox = document.createElement('div');
        checkbox.className = 'checkbox';
        if (option.selected) {
          checkbox.classList.add('selected');
          checkbox.innerHTML = checkmarkSvg;
        }

        const label = document.createElement('span');
        label.textContent = option.label;
        label.className = 'option-label';

        optionElement.appendChild(checkbox);
        optionElement.appendChild(label);

        // Add click handler
        optionElement.addEventListener('click', (e) => {
          e.stopPropagation();

          // Set user interaction flag immediately
          instance.data.userHasInteracted = true;

          // Check if we should use this as single select
          const useAs = instance.data.useAs || 'Multi select';
          const isSingleSelect = useAs === 'Single select';

          if (isSingleSelect) {
            // For single select, deselect all other options first
            instance.data.options.forEach(opt => {
              if (opt !== option) {
                opt.selected = false;
              }
            });

            // Then select this option
            option.selected = true;

            // Publish single select value
            const selectedData = option.originalData || null;
            instance.publishState('single_select', selectedData);
            instance.publishState('multi_select', []);

            // Close dropdown after selection
            setTimeout(() => {
              optionsContainer.style.display = 'none';
              chevron.classList.remove('open');
            }, 100);
          } else {
            // For multi-select, toggle selection
            option.selected = !option.selected;

            if (option.selected) {
              checkbox.classList.add('selected');
              checkbox.innerHTML = checkmarkSvg;
            } else {
              checkbox.classList.remove('selected');
              checkbox.innerHTML = '';
            }

            // Publish multi-select values
            const selectedData = instance.data.options
              .filter(opt => opt.selected)
              .map(opt => opt.originalData || null);

            instance.publishState('multi_select', selectedData);
            instance.publishState('single_select', null);
          }

          // Trigger the event once for both single and multi select modes
          instance.triggerEvent('selection_changed');

          // Update header text
          const selectedCount = instance.data.options.filter(opt => opt.selected).length;
          if (selectedCount === 0) {
            headerText.textContent = 'Select options';
          } else if (selectedCount === 1) {
            headerText.textContent = instance.data.options.find(opt => opt.selected).label;
          } else {
            headerText.textContent = `${selectedCount} selected`;
          }
        });

        optionsContainer.appendChild(optionElement);
      });
    } else {
      optionsContainer.style.display = 'none';
      chevron.classList.remove('open');
    }
  });

  // Modify the document click handler to only close this instance
  document.addEventListener('click', (event) => {
    // Check if the click is outside both the dropdown container and options container
    const isClickOutside = !event.target.closest(`[data-instance="${uniqueId}"]`);

    if (isClickOutside && optionsContainer.style.display === 'block') {
      optionsContainer.style.display = 'none';
      chevron.classList.remove('open');
    }
  });

  // Handle window resize to reposition the dropdown
  window.addEventListener('resize', () => {
    if (optionsContainer.style.display === 'block') {
      positionOptionsContainer();
    }
  });

  // Append elements to the container
  dropdownContainer.appendChild(dropdownHeader);
  document.body.appendChild(optionsContainer);

  // Append the dropdown header to the canvas
  instance.canvas.append(dropdownContainer);

  // Set initialization flag at the end of initialize
  instance.data.inizialized = true;
}
```

### `update.js` Sample Code

```js
function(instance, properties, context) {
  // Add recursion protection to prevent infinite loops
  if (instance.data.isUpdating) {
    console.warn('Update function called while already updating - preventing recursion');
    return; // Exit early if already in update cycle
  }
  instance.data.isUpdating = true;

  // Ensure we reset the flag even if an error occurs
  const resetUpdateFlag = () => {
    setTimeout(() => {
      instance.data.isUpdating = false;
    }, 10);
  };

  try {
    // Wait for initialization to complete
    if (!instance.data.inizialized) {
      instance.publishState('multi_select', []);
      instance.publishState('single_select', null);
      instance.data.defaultsProcessed = true; // Mark as processed since we're using dynamic data
      instance.data.dataLoaded = true; // Mark as loaded since we're using dynamic data
      resetUpdateFlag();
      return;
    }

    // Centralized function to publish states consistently
    function publishStates() {
      // Add guard to prevent recursive state publishing
      if (instance.data.isPublishingStates) {
        return;
      }
      instance.data.isPublishingStates = true;

      try {
        if (!instance.data.options) {
          instance.publishState('single_select', null);
          instance.publishState('multi_select', []);
          return;
        }

        const isSingleSelect = (instance.data.useAs || properties.use_as || 'Multi select') === 'Single select';

        if (isSingleSelect) {
          // For single select mode
          const selectedOption = instance.data.options.find(opt => opt.selected);
          const selectedData = selectedOption ? selectedOption.originalData : null;
          instance.publishState('single_select', selectedData);
          instance.publishState('multi_select', []);
        } else {
          // For multi select mode
          const selectedData = instance.data.options
            .filter(opt => opt.selected)
            .map(opt => opt.originalData || null);
          instance.publishState('multi_select', selectedData);
          instance.publishState('single_select', null);
        }
      } finally {
        // Reset the guard after a short delay to allow legitimate calls
        setTimeout(() => {
          instance.data.isPublishingStates = false;
        }, 10);
      }
    }

    // Store the publishStates function for external access
    instance.data.publishStates = publishStates;

    // Add force refresh mechanism for rapid updates
    const now = Date.now();
    if (!instance.data.lastUpdateTime) {
      instance.data.lastUpdateTime = now;
    }

    // Force refresh if update was called very recently (less than 100ms ago)
    // This handles rapid succession calls from Bubble
    const timeSinceLastUpdate = now - instance.data.lastUpdateTime;
    const shouldForceRefresh = timeSinceLastUpdate < 100;
    instance.data.lastUpdateTime = now;

    if (shouldForceRefresh) {
      instance.data.shouldUpdateOptions = true;
    }

    // Helper function to get current selection state as a comparable string
    function getSelectionStateKey(options, useAs) {
      if (!options || options.length === 0) {
        return 'empty';
      }

      const isSingleSelect = useAs === 'Single select';

      if (isSingleSelect) {
        const selected = options.find(opt => opt.selected);
        if (!selected) {
          return 'none';
        }
        try {
          const id = selected.originalData ? selected.originalData.get('_id') : null;
          return `single:${id || selected.value}`;
        } catch (e) {
          return `single:${selected.value}`;
        }
      } else {
        const selectedOptions = options.filter(opt => opt.selected);

        const selectedIds = selectedOptions.map(opt => {
          try {
            const hasOriginalData = opt.originalData && typeof opt.originalData.get === 'function';
            if (hasOriginalData) {
              const id = opt.originalData.get('_id');
              return id || opt.value;
            } else {
              return opt.value;
            }
          } catch (e) {
            return opt.value;
          }
        }).sort(); // Sort for consistent comparison

        return `multi:${selectedIds.join(',')}`;
      }
    }

    // Helper function to check if selection actually changed and trigger event if so
    function checkAndTriggerSelectionChange() {
      const currentStateKey = getSelectionStateKey(instance.data.options, instance.data.useAs);

      // Initialize lastSelectionStateKey if it doesn't exist
      if (instance.data.lastSelectionStateKey === undefined) {
        instance.data.lastSelectionStateKey = currentStateKey;
        return; // Don't trigger on initial setup
      }

      // Always check if state changed and trigger if user has interacted
      if (instance.data.lastSelectionStateKey !== currentStateKey) {
        const previousState = instance.data.lastSelectionStateKey;
        instance.data.lastSelectionStateKey = currentStateKey;

        // Trigger event if user has actually interacted OR if this is the first meaningful change
        // (not just initialization/data loading)
        const shouldTrigger = instance.data.userHasInteracted ||
          (instance.data.hasLoadedBefore && previousState !== 'empty' && currentStateKey !== 'empty');

        if (shouldTrigger) {
          instance.triggerEvent('selection_changed');
        }
      }
    }

    // STEP 1: DATA SOURCE HANDLING - ALWAYS RUNS FIRST
    // Always check for data source changes and update options accordingly
    let dataSourceChanged = false;
    let forceRefresh = false;

    // Create a comprehensive hash of the current data source to detect changes
    let currentDataHash = '';
    if (properties.data_source && typeof properties.data_source.length === 'function') {
      try {
        const length = properties.data_source.length();
        currentDataHash = `length:${length}`;

        if (length > 0) {
          // Add comprehensive sample of items to hash for better change detection
          const sampleSize = Math.min(5, length); // Increased sample size
          const sampleItems = properties.data_source.get(0, sampleSize);

          // Create a more detailed hash including item structure
          const sampleHash = sampleItems.map((item, index) => {
            if (item && typeof item.get === 'function') {
              try {
                // Try to get a few key properties to detect changes
                const props = [];
                if (typeof item.listProperties === 'function') {
                  const availableProps = item.listProperties();
                  /
```

### `css.style` Sample Code

```html
<style>
  /* Add these CSS custom properties to the root */
  :root {
    --shadow-color: rgba(0, 0, 0, 0.1);
    --input-bg-color: #ffffff;
    --dropdown-bg-color: #ffffff;
    --input-border-radius: 8px;
    --dropdown-border-radius: 8px;
    --chevron-size: 10px;
    --input-border-color: #cccccc; /* Separate border color for input */
    --dropdown-border-color: #cccccc; /* Separate border color for dropdown */
    --input-border-width: 1px; /* Default border width for input */
    --input-padding: 10px 15px; /* Default padding for input (top/bottom left/right) */
    --placeholder-color: #888888; /* Default placeholder color */
  }

  /* Base dropdown container styles */
  .dropdown-container {
    position: relative;
    width: 100%;
    min-width: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  /* Dropdown header styles */
  .dropdown-header {
    border: var(--input-border-width) solid var(--input-border-color);
    border-radius: var(--input-border-radius);
    padding: var(--input-padding);
    background-color: var(--input-bg-color);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    box-sizing: border-box;
  }

  /* Header text styles */
  .header-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
    max-width: calc(100% - 25px); /* Space for chevron */
  }

  /* Chevron icon */
  .chevron {
    width: var(--chevron-size);
    height: var(--chevron-size);
    border-right: 2px solid #666;
    border-bottom: 2px solid #666;
    transform: rotate(45deg); /* Points down when closed */
    flex-shrink: 0;
    margin-left: 10px;
    transition: transform 0.3s ease;
  }

  /* Chevron open state */
  .chevron.open {
    transform: rotate(225deg); /* Points up when open */
  }

  /* Dropdown options container */
  .options-container {
    position: fixed;
    background-color: var(--dropdown-bg-color);
    border: 1px solid var(--dropdown-border-color);
    border-radius: var(--dropdown-border-radius);
    box-shadow: 0 2px 8px var(--shadow-color);
    box-sizing: border-box;
    display: none;
    opacity: 0;
    max-height: 300px;
    overflow: hidden;
    z-index: 9999;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }
</style>
```

## Interractive Preview.js sample code

//This code is used for preview purposes on the editor. A simple display of what the real element might look like. And could share some properties with update.js too.

function(instance, properties) {
// Default properties with fallbacks
const starSize = properties.star_size || 30;
const starColor = properties.star_color || '#FFD700';
const starCount = properties.star_count || 5;
const initialValue = properties.initial_value || 0;

// Generate star HTML with half-star support
const generateStar = (filled, index) => {
const isHalfFilled = filled === 0.5;

    if (isHalfFilled) {
      return `
        <div style="
          position: relative;
          width: ${starSize}px;
          height: ${starSize}px;
          display: inline-block;
        ">
          <svg
            width="${starSize}"
            height="${starSize}"
            viewBox="0 0 24 24"
            fill="none"
            stroke="${starColor}"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            style="position: absolute; top: 0; left: 0;"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <div style="
            position: absolute;
            left: 0;
            top: 0;
            width: ${starSize / 2}px;
            height: ${starSize}px;
            overflow: hidden;
          ">
            <svg
              width="${starSize}"
              height="${starSize}"
              viewBox="0 0 24 24"
              fill="${starColor}"
              stroke="${starColor}"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        </div>
      `;
    }

    return `
      <svg
        width="${starSize}"
        height="${starSize}"
        viewBox="0 0 24 24"
        fill="${filled ? starColor : 'none'}"
        stroke="${starColor}"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    `;

};

// Generate preview HTML
let previewHTML = `
<div style="
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      overflow: hidden;
      margin: 0;
      padding: 0;
    ">
<div style="
        display: flex;
        gap: 4px;
        padding: 0;
        margin: 0;
        flex-wrap: nowrap;
      ">
${[...Array(starCount)].map((\_, i) => {
// Calculate fill state for this star with decimal support
let fillState = 0; // not filled
const ratingFloor = Math.floor(initialValue);
const ratingDecimal = initialValue - ratingFloor;

          if (i < ratingFloor) {
            fillState = 1; // fully filled
          } else if (i === ratingFloor && ratingDecimal >= 0.5) {
            fillState = 0.5; // half filled
          }

          return generateStar(fillState, i);
        }).join('')}
      </div>
    </div>

`;

// Clear the instance canvas before appending
$(instance.canvas).empty().append(previewHTML);

## Small Preview

//This is a small and simple version of preview.js

function(instance, properties) {
const container = `     <div 
      style="
        background-color: transparent;
        margin: 0; 
        padding: 0; 
        width: 100%; 
        height: 100%; 
        display: flex; 
        justify-content: center; 
        align-items: center;
      "
    >
      <img 
        src="https://meta-q.cdn.bubble.io/f1759585871435x990565085194633200/math.webp" 
        alt="Math icon"
        style="
          width: 20px; 
          height: 20px; 
          margin: 0; 
          padding: 0;
          display: block;
        "
      />
    </div>
  `;

$(instance.canvas).append(container);
}

## Client side action code sample

function(properties, context) {
// Access the message property
const message = properties.message || 'No message provided';

// Fire the browser alert
alert(message);
}

## Server side action code sample

async function(properties, context) {
// Access properties
const inputValue = properties.input_value || '';

// Perform some processing (example: convert to uppercase)
const result = inputValue.toString().toUpperCase();

// Return in key-value format as specified, Return value must be returned in this format
return {
"result": result
}
}

---

## 12) Server-Side Actions: Async/Await & Data Access

**CRITICAL: Server-side actions in Bubble execute asynchronously**

### Understanding Promises and `await`

In **server-side actions**, all Bubble data operations return **Promises** (asynchronous operations). You **MUST** use `await` to get the actual values.

**Without `await` (WRONG ❌):**

```js
const listLength = dataSource.length();
console.log(listLength); // [object Promise] - NOT a number!
```

**With `await` (CORRECT ✓):**

```js
const listLength = await dataSource.length();
console.log(listLength); // 3 - actual number!
```

### What is `await`?

`await` pauses code execution until an asynchronous operation completes and returns the actual value.

**Analogy:** Ordering a pizza

- **Without `await`**: You get a receipt (Promise) and try to eat it ❌
- **With `await`**: You wait for the pizza to arrive, then eat it ✓

**Important:** `await` does NOT make code slower - the waiting time is the same. It just ensures you get the real data instead of a Promise object.

---

### Accessing Bubble Data in Server-Side Actions

**Required pattern for all data operations:**

```js
async function(properties, context) {
  const dataSource = properties.data_source;
  const dateField = properties.field_name;

  if (dataSource) {
    try {
      // MUST use await for length()
      const listLength = await dataSource.length();

      if (listLength > 0) {
        // MUST use await for get()
        const objects = await dataSource.get(0, listLength);

        for (let i = 0; i < objects.length; i++) {
          const obj = objects[i];

          if (obj) {
            // MUST use await for get() on object fields
            const fieldValue = await obj.get(dateField);

            if (fieldValue) {
              // Now you have the actual value
              console.log(fieldValue);
            }
          }
        }
      }
    } catch (error) {
      // Handle errors gracefully
      console.error('Error loading data:', error);
    }
  }

  return {
    "result": "success"
  };
}
```

**Key operations that require `await` in server-side actions:**

1. `await dataSource.length()` - Get list length
2. `await dataSource.get(start, end)` - Get objects from list
3. `await object.get(fieldName)` - Get field value from object

---

### Timezone Handling & Date Normalization

**Problem:** Dates in Bubble can shift by one day due to timezone differences between user's local time and server UTC time.

**Example Issue:**

- User (Paris UTC+1) selects: Nov 7, 2025 at 00:00
- Server (UTC) receives: Nov 6, 2025 at 23:00
- Result: Wrong day used in calculations! ❌

**Solution: Add 12 hours to normalize dates**

```js
// Normalize all dates by adding 12 hours
const currentDate = new Date(startDate);
const normalized = new Date(currentDate.getTime() + 12 * 60 * 60 * 1000);

// Then use UTC methods for consistency
const year = normalized.getUTCFullYear();
const month = String(normalized.getUTCMonth() + 1).padStart(2, "0");
const day = String(normalized.getUTCDate()).padStart(2, "0");
const dateStr = `${year}-${month}-${day}`;
```

**Why +12 hours?**

- Pushes all dates to mid-day UTC (12:00 UTC)
- Works for all timezones (UTC-12 to UTC+14)
- Ensures consistent day extraction across timezones

**Always use UTC methods after normalization:**

- `getUTCFullYear()` instead of `getFullYear()`
- `getUTCMonth()` instead of `getMonth()`
- `getUTCDate()` instead of `getDate()`
- `getUTCDay()` instead of `getDay()`

---

### Complete Working Example: Business Days Calculator

```js
async function(properties, context) {
  const startDate = properties.start_date;
  const numberOfDays = properties.number_of_days;
  const dataSource = properties.data_source; // List of off-day objects
  const dateField = properties.date_field;   // Field name containing dates

  if (numberOfDays <= 0) {
    return { "end_date": startDate };
  }

  // Store off days in a Set for fast lookup
  const offDaysSet = new Set();

  if (dataSource) {
    try {
      // AWAIT: Get list length
      const listLength = await dataSource.length();

      if (listLength > 0) {
        // AWAIT: Get all objects
        const offDayObjects = await dataSource.get(0, listLength);

        for (let i = 0; i < offDayObjects.length; i++) {
          const offDayObject = offDayObjects[i];

          if (offDayObject) {
            // AWAIT: Get date field value
            const offDate = await offDayObject.get(dateField);

            if (offDate) {
              // Normalize timezone (+12h)
              const dateObj = new Date(offDate);
              const normalized = new Date(dateObj.getTime() + (12 * 60 * 60 * 1000));

              // Use UTC methods
              const year = normalized.getUTCFullYear();
              const month = String(normalized.getUTCMonth() + 1).padStart(2, '0');
              const day = String(normalized.getUTCDate()).padStart(2, '0');
              const dateStr = `${year}-${month}-${day}`;

              offDaysSet.add(dateStr);
            }
          }
        }
      }
    } catch (error) {
      // Continue without off days if error
    }
  }

  // Helper: Check if weekend (using UTC)
  function isWeekend(date) {
    const day = date.getUTCDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  }

  // Helper: Check if off day
  function isOffDay(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return offDaysSet.has(dateStr);
  }

  // Helper: Check if business day
  function isBusinessDay(date) {
    return !isWeekend(date) && !isOffDay(date);
  }

  // Calculate end date
  let currentDate = new Date(startDate);
  // Normalize timezone (+12h)
  currentDate = new Date(currentDate.getTime() + (12 * 60 * 60 * 1000));

  // Start date counts as day 1
  let daysToAdd = numberOfDays - 1;

  // Add business days, skipping weekends and off days
  while (daysToAdd > 0) {
    currentDate.setDate(currentDate.getDate() + 1);

    if (isBusinessDay(currentDate)) {
      daysToAdd--;
    }
    // If not a business day, skip without counting
  }

  return {
    "end_date": currentDate
  };
}
```

---

### Key Takeaways

1. **Always use `async function(properties, context)` for server-side actions**
2. **Always use `await` for:**
   - `dataSource.length()`
   - `dataSource.get()`
   - `object.get(fieldName)`
3. **Always normalize dates with +12 hours** for timezone consistency
4. **Always use UTC methods** after normalization:
   - `getUTCFullYear()`, `getUTCMonth()`, `getUTCDate()`, `getUTCDay()`
5. **Use `Set` for fast lookups** when checking if dates are in a list
6. **Handle errors with try/catch** to prevent action failures

---
