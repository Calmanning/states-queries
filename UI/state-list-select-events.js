
const updateStateDropdownSelector = (state) => {
        stateSelectDropdown.innerHTML = [
                `<option>${state}</option>`, 
                ...stateSelectChoices
            ]
    }

