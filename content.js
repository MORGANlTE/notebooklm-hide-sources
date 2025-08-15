(function () {
  "use strict";

  const TOGGLE_BUTTON_ID = "source-toggle-button";
  const TOGGLE_CONTAINER_ID = "source-toggle-container";
  const HIDDEN_CLASS = "nblm-source-hidden";
  let sourcesHidden = false; // Default state

  // Function to apply the display style based on the current state
  const applySourceVisibility = () => {
    const citationSpans = document.querySelectorAll("button.citation-marker");
    citationSpans.forEach((button) => {
      const parentSpan = button.closest("span");
      if (parentSpan) {
        if (sourcesHidden) {
          parentSpan.classList.add(HIDDEN_CLASS);
        } else {
          parentSpan.classList.remove(HIDDEN_CLASS);
        }
      }
    });
  };

  // Function to update the icon and text on our toggle button
  const updateButtonState = () => {
    const button = document.getElementById(TOGGLE_BUTTON_ID);
    if (!button) return;

    const icon = button.querySelector("mat-icon");
    const label = button.querySelector(".button-label-text");

    if (icon && label) {
      const actionText = sourcesHidden ? "Show" : "Hide";
      icon.textContent = sourcesHidden ? "visibility_off" : "visibility";
      label.textContent = `${actionText}`;
      button.setAttribute("aria-label", `${actionText}`);
    }
  };

  // Main toggle function that runs on click
  const toggleSources = () => {
    sourcesHidden = !sourcesHidden; // Flip the state
    chrome.storage.local.set({ sourcesHidden: sourcesHidden }); // Save the new state
    applySourceVisibility();
    updateButtonState();
  };

  // Function to create and inject our button into the page
  const createToggleButton = () => {
    // Check if the button container already exists
    if (document.getElementById(TOGGLE_CONTAINER_ID)) {
      return;
    }

    // Find the "Share" button's container to insert our button next to it
    const shareButtonContainer = document.querySelector(
      "div.share-button-container"
    );
    if (shareButtonContainer && shareButtonContainer.parentElement) {
      // 1. Create the wrapper div, copying the share button's container classes
      const wrapperDiv = document.createElement("div");
      wrapperDiv.id = TOGGLE_CONTAINER_ID;
      wrapperDiv.className = shareButtonContainer.className;

      // 2. Create the button, copying the share button's classes
      const toggleButton = document.createElement("button");
      toggleButton.id = TOGGLE_BUTTON_ID;
      toggleButton.className =
        "mdc-fab mat-mdc-fab-base mat-mdc-fab mat-mdc-button-base mat-primary";
      toggleButton.className += " mdc-fab--extended mat-mdc-extended-fab";
      toggleButton.addEventListener("click", toggleSources);

      // 3. Create the icon
      const icon = document.createElement("mat-icon");
      icon.className =
        "mat-icon notranslate google-symbols mat-icon-no-color fab-icon";
      icon.setAttribute("role", "img");

      // 4. Create the text label structure
      const labelWrapper = document.createElement("span");
      labelWrapper.className = "mdc-button__label";
      const labelText = document.createElement("span");
      labelText.className = "button-label-text"; // Custom class for easy selection
      labelWrapper.appendChild(labelText);

      // 5. Add everything to the button
      toggleButton.appendChild(icon);
      toggleButton.appendChild(labelWrapper);

      // 6. Add the button to its wrapper
      wrapperDiv.appendChild(toggleButton);

      // 7. Insert our new button container before the share button container
      shareButtonContainer.parentElement.insertBefore(
        wrapperDiv,
        shareButtonContainer
      );

      // 8. Set the initial state of the button's text and icon
      updateButtonState();
    }
  };

  // --- SCRIPT EXECUTION STARTS HERE ---

  // Load the saved state from storage first
  chrome.storage.local.get("sourcesHidden", (data) => {
    sourcesHidden = data.sourcesHidden || false;
    // The MutationObserver will handle the initial creation and application
  });

  // Watch the page for changes to inject our button and update sources
  const observer = new MutationObserver((mutations) => {
    createToggleButton();
    applySourceVisibility();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
