
const stateSelectDropdown = document.createElement("select")
    stateSelectDropdown.setAttribute("id","stateSelector");
    document.getElementById("selectorDiv").append(stateSelectDropdown);

const populateStateDropdownList = (list) => {
    
    stateSelectChoices = list.map((entry) => {
        return `<option> ${entry.attributes.STATE_ABBR} </option>`
    });
    
    stateSelectDropdown.innerHTML = stateSelectChoices.sort();
};

