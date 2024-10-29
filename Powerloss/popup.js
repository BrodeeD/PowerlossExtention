document.getElementById('checkButton').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: prioritizeCameras
    }, (results) => {
        document.getElementById('status').textContent = results[0].result;
    });
});

function prioritizeCameras() {
    function handleEditPresetDialog(isLeftThermal, isDahua) {
        const dialog = document.querySelector('div.MuiDialog-paper');
        if (!dialog) {
            console.log('Dialog not found');
            return;
        }

        const cameraPrefix = isLeftThermal ? 'Left\\ Thermal' : isDahua ? 'Center' : 'Left';

        const checkboxesToUnselect = [
            `#unit-config__camera-${cameraPrefix}__presets__modal__display-on-camera-control`,
            `#unit-config__camera-${cameraPrefix}__presets__modal__use-light-for-snapshots`
        ];

        checkboxesToUnselect.forEach(selector => {
            const checkbox = dialog.querySelector(selector);
            if (checkbox && checkbox.checked) {
                checkbox.click();
                console.log(`Checkbox ${selector} unselected`);
            } else {
                console.log(`Checkbox ${selector} not found or already unselected`);
            }
        });

        const checkboxesToSelect = [
            `#unit-config__camera-${cameraPrefix}__presets__modal__system_preset`,
            `#unit-config__camera-${cameraPrefix}__presets__modal__overlay-timestamp`,
            `#unit-config__camera-${cameraPrefix}__presets__modal__patrol-and-archive-snapshots`
        ];

        checkboxesToSelect.forEach(selector => {
            const checkbox = dialog.querySelector(selector);
            if (checkbox && !checkbox.checked) {
                checkbox.click();
                console.log(`Checkbox ${selector} selected`);
            } else {
                console.log(`Checkbox ${selector} not found or already selected`);
            }
        });
    }

    function selectDropdownOption(dropdownSelector, optionText) {
        const dropdown = document.querySelector(dropdownSelector);
        if (dropdown) {
            dropdown.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
            dropdown.click();

            setTimeout(() => {
                const dropdownInput = document.querySelector('.MuiSelect-nativeInput');
                if (dropdownInput) {
                    dropdownInput.focus();
                    const firstChar = optionText[0].toUpperCase();
                    const event = new KeyboardEvent('keydown', {
                        bubbles: true,
                        cancelable: true,
                        key: firstChar,
                        charCode: firstChar.charCodeAt(0)
                    });
                    dropdownInput.dispatchEvent(event);

                    setTimeout(() => {
                        const menuItems = Array.from(document.querySelectorAll(`[role="listbox"] .MuiMenuItem-root`));
                        const option = menuItems.find(item => item.textContent.trim() === optionText);
                        if (option) {
                            option.click();
                            console.log(`Found and selected option: ${optionText}`);
                        } else {
                            console.error(`Dropdown option ${optionText} not found.`);
                        }
                    }, 500);
                } else {
                    console.error('Dropdown input field not found');
                }
            }, 500);
        } else {
            console.error(`Dropdown with selector ${dropdownSelector} not found.`);
        }
    }

    // Step 1: Check for Dahua Center camera (Priority for Powerloss)
    const dahuaCamera = document.querySelector('#unit-config__camera-Center_serial-and-model');
    if (dahuaCamera && dahuaCamera.textContent.includes('Dahua')) {
        console.log("Dahua Center camera detected, processing Powerloss...");

        const button = document.querySelector('#unit-config__camera-Center__presets__add-preset');
        if (button) {
            button.click();

            setTimeout(() => {
                selectDropdownOption('#unit-config__camera-Center__presets__modal__preset-type', 'Powerloss');

                const presetNameInput = document.querySelector('input[id^="unit-config__camera-Center__presets__modal__preset-name"]');
                if (presetNameInput) {
                    presetNameInput.value = "Powerloss";
                    presetNameInput.dispatchEvent(new Event('input', { bubbles: true }));
                    console.log('Preset name changed to Powerloss');
                }

                const tiltInput = document.querySelector('input[id^="unit-config__camera-Center__presets__modal__tilt"]');
                if (tiltInput) {
                    tiltInput.value = "90";
                    tiltInput.dispatchEvent(new Event('input', { bubbles: true }));
                    console.log('Tilt value changed to 90');
                }

                handleEditPresetDialog(false, true);
            }, 500);

            return 'Center Dahua camera found, button clicked, and fields updated!';
        } else {
            return 'Center Dahua camera found but button not found.';
        }
    }

    // Step 2: Prioritize Left Thermal Camera (if Dahua not found)
    const leftThermalElement = document.querySelector('#unit-config__camera-Left\\ Thermal_name');
    if (leftThermalElement && leftThermalElement.textContent.includes('Left Thermal')) {
        console.log("Left Thermal detected, processing...");

        const button = document.querySelector('#unit-config__camera-Left\\ Thermal__presets__add-preset');
        if (button) {
            button.click();

            setTimeout(() => {
                selectDropdownOption('#unit-config__camera-Left\\ Thermal__presets__modal__preset-type', 'Powerloss');

                const presetNameInput = document.querySelector('input[id^="unit-config__camera-Left\\ Thermal__presets__modal__preset-name"]');
                if (presetNameInput) {
                    presetNameInput.value = "Powerloss";
                    presetNameInput.dispatchEvent(new Event('input', { bubbles: true }));
                    console.log('Preset name changed to Powerloss');
                }

                const tiltInput = document.querySelector('input[id^="unit-config__camera-Left\\ Thermal__presets__modal__tilt"]');
                if (tiltInput) {
                    tiltInput.value = "900";
                    tiltInput.dispatchEvent(new Event('input', { bubbles: true }));
                    console.log('Tilt value changed to 900');
                }

                handleEditPresetDialog(true, false);
            }, 500);

            return 'Left Thermal found, button clicked, and fields updated!';
        } else {
            return 'Left Thermal found but button not found.';
        }
    }

    // Step 3: Check Left Camera only if Left Thermal and Dahua are not found
    const leftCameraElement = document.querySelector('#unit-config__camera-Left_name');
    if (leftCameraElement && leftCameraElement.textContent.includes('Left')) {
        const button = document.querySelector('#unit-config__camera-Left__presets__add-preset');
        if (button) {
            button.click();

            setTimeout(() => {
                selectDropdownOption('#unit-config__camera-Left__presets__modal__preset-type', 'Powerloss');

                const presetNameInput = document.querySelector('input[id^="unit-config__camera-Left__presets__modal__preset-name"]');
                if (presetNameInput) {
                    presetNameInput.value = "Powerloss";
                    presetNameInput.dispatchEvent(new Event('input', { bubbles: true }));
                    console.log('Preset name changed to Powerloss');
                }

                const tiltInput = document.querySelector('input[id^="unit-config__camera-Left__presets__modal__tilt"]');
                if (tiltInput) {
                    tiltInput.value = "-90";
                    tiltInput.dispatchEvent(new Event('input', { bubbles: true }));
                    console.log('Tilt value changed to -90');
                }

                handleEditPresetDialog(false, false);
            }, 500);

            return 'Left Camera found, button clicked, and fields updated!';
        } else {
            return 'Left Camera found but button not found.';
        }
    } else {
        return 'No suitable camera found (Left Thermal, Dahua, or Left Camera).';
    }
}
