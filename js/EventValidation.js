// Validation for Event Management form
document.getElementById('eventForm').onsubmit = function(event) {
    const requiredSkillsCheckboxes = document.querySelectorAll('#required-skills input[type="checkbox"]');
    let isSkillsChecked = false;

    for (const checkbox of requiredSkillsCheckboxes) {
        if (checkbox.checked) {
            isSkillsChecked = true;
            break;
        }
    }

    if (!isSkillsChecked) {
        event.preventDefault();
        alert('Please select at least one required skill.');
        return;
    }

    if (!this.checkValidity()) {
        event.preventDefault();
        alert('Please fill in all required fields.');
    }
};
