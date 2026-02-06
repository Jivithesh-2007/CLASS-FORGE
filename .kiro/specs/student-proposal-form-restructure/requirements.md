# Requirements Document: Student Proposal Form Restructure

## Introduction

This document specifies the requirements for restructuring the student proposal form in the new proposal section. The form will be reorganized to prioritize Karunya Thrust Areas and Sustainable Development Goals (SDGs) alignment, with the project title moved to the bottom. The form will include new dropdown fields for Karunya Thrust Areas and SDG selection with dynamic preview of SDG highlights.

## Glossary

- **Karunya Thrust Areas**: Strategic focus areas defined by Karunya Deemed to be University: Water, Food, Healthcare, Energy
- **SDG (Sustainable Development Goals)**: United Nations' 17 global goals for sustainable development
- **SDG Highlights**: Key descriptive information and objectives associated with each SDG
- **Form Field**: Individual input element in the proposal submission form
- **Form State**: Current values and visibility status of all form fields
- **Proposal**: Student innovation idea submission containing title, domain, stage, description, tags, and SDG/Thrust Area alignment

## Requirements

### Requirement 1: Reorder Form Fields

**User Story:** As a student, I want the form fields to be organized in a logical flow that emphasizes alignment with institutional priorities, so that I can easily understand how my proposal connects to Karunya's strategic focus areas.

#### Acceptance Criteria

1. WHEN the proposal form is loaded, THE Form SHALL display fields in the following order:
   - Karunya Thrust Areas (dropdown)
   - SDG Selection (dropdown with preview)
   - Target Domain (dropdown)
   - Stage (dropdown)
   - Description (textarea)
   - Tags/Keywords (text input)
   - Project Title (text input)
   - Submission and Cancel buttons

2. WHEN the form is displayed, THE Form SHALL maintain this field order consistently across all page loads

3. WHEN a user scrolls through the form, THE Form SHALL present fields in a logical top-to-bottom sequence without reordering

### Requirement 2: Add Karunya Thrust Areas Dropdown

**User Story:** As a student, I want to select which Karunya Thrust Area my proposal aligns with, so that my innovation is categorized according to the university's strategic priorities.

#### Acceptance Criteria

1. WHEN the proposal form is loaded, THE Form SHALL display a "Karunya Thrust Areas" dropdown field as the first input field

2. WHEN the Karunya Thrust Areas dropdown is clicked, THE Form SHALL display exactly four options:
   - Water
   - Food
   - Healthcare
   - Energy

3. WHEN a student selects a Karunya Thrust Area, THE Form SHALL store the selected value in the form state

4. WHEN the form is submitted, THE Form SHALL include the selected Karunya Thrust Area in the submission payload

5. WHEN the form is loaded without a previous selection, THE Karunya Thrust Areas dropdown SHALL display a placeholder text "Select a thrust area"

### Requirement 3: Add SDG Selection Dropdown

**User Story:** As a student, I want to select which UN Sustainable Development Goal my proposal addresses, so that I can demonstrate alignment with global sustainability objectives.

#### Acceptance Criteria

1. WHEN the proposal form is loaded, THE Form SHALL display an "SDG Selection" dropdown field as the second input field

2. WHEN the SDG Selection dropdown is clicked, THE Form SHALL display all 17 UN Sustainable Development Goals:
   - SDG 1: No Poverty
   - SDG 2: Zero Hunger
   - SDG 3: Good Health and Well-Being
   - SDG 4: Quality Education
   - SDG 5: Gender Equality
   - SDG 6: Clean Water and Sanitation
   - SDG 7: Affordable and Clean Energy
   - SDG 8: Decent Work and Economic Growth
   - SDG 9: Industry, Innovation and Infrastructure
   - SDG 10: Reduced Inequalities
   - SDG 11: Sustainable Cities and Communities
   - SDG 12: Responsible Consumption and Production
   - SDG 13: Climate Action
   - SDG 14: Life Below Water
   - SDG 15: Life on Land
   - SDG 16: Peace, Justice and Strong Institutions
   - SDG 17: Partnerships for the Goals

3. WHEN a student selects an SDG, THE Form SHALL store the selected SDG value in the form state

4. WHEN the form is submitted, THE Form SHALL include the selected SDG in the submission payload

5. WHEN the form is loaded without a previous selection, THE SDG Selection dropdown SHALL display a placeholder text "Select an SDG"

### Requirement 4: Display SDG Highlights on Selection

**User Story:** As a student, I want to see key information about each SDG when I select it, so that I can better understand what each goal encompasses and make an informed selection.

#### Acceptance Criteria

1. WHEN a student selects an SDG from the dropdown, THE Form SHALL display a preview section below the SDG dropdown containing key highlights for that SDG

2. WHEN an SDG is selected, THE Preview Section SHALL display:
   - The SDG number and title
   - A brief description (2-3 sentences) of the SDG's objectives
   - Key focus areas or targets associated with that SDG

3. WHEN a different SDG is selected, THE Preview Section SHALL update immediately to show the highlights for the newly selected SDG

4. WHEN no SDG is selected, THE Preview Section SHALL not be displayed

5. WHEN the form is reset or cancelled, THE Preview Section SHALL be hidden

### Requirement 5: Maintain Existing Form Fields

**User Story:** As a student, I want all existing form functionality to remain intact, so that I can still provide all necessary information about my proposal.

#### Acceptance Criteria

1. WHEN the proposal form is displayed, THE Form SHALL include all existing fields:
   - Target Domain (dropdown with 9 options: Technology, Science, Education, Healthcare, Environment, Business, Arts, Social, Other)
   - Stage (dropdown with 4 options: Concept, Development, Testing, Implementation)
   - Description (textarea for proposal summary)
   - Tags/Keywords (text input for comma-separated tags)
   - Project Title (text input, now positioned at the bottom)

2. WHEN a student fills in existing fields, THE Form SHALL store values correctly in the form state

3. WHEN the form is submitted, THE Form SHALL include all existing field values in the submission payload

4. WHEN a student interacts with existing fields, THE Form SHALL maintain all validation rules and requirements

### Requirement 6: Form Submission with New Fields

**User Story:** As a student, I want to submit my proposal with all the new alignment information, so that my submission is complete and properly categorized.

#### Acceptance Criteria

1. WHEN a student clicks the Submit button, THE Form SHALL validate that all required fields are filled:
   - Karunya Thrust Area (required)
   - SDG Selection (required)
   - Target Domain (required)
   - Stage (required)
   - Description (required)
   - Project Title (required)

2. WHEN all required fields are filled, THE Form SHALL submit the proposal with the following data:
   - karunya_thrust_area (string)
   - sdg (string)
   - title (string)
   - domain (string)
   - stage (string)
   - description (string)
   - tags (array of strings)

3. WHEN the form is submitted successfully, THE Form SHALL display a success message and redirect to the My Ideas page

4. WHEN a submission error occurs, THE Form SHALL display an error message and remain on the form page

5. WHEN the Cancel button is clicked, THE Form SHALL discard all form data and navigate back to the student dashboard

### Requirement 7: SDG Data Completeness

**User Story:** As a system administrator, I want all 17 SDGs to be properly defined with accurate descriptions, so that students have reliable information for making their selections.

#### Acceptance Criteria

1. WHEN the form is loaded, THE System SHALL have all 17 SDGs defined with:
   - Unique SDG number (1-17)
   - Official SDG title
   - Comprehensive description (2-3 sentences)
   - Key focus areas or targets (3-5 bullet points)

2. WHEN a student selects any SDG, THE System SHALL display accurate and complete information for that SDG

3. WHEN the form is displayed, THE System SHALL ensure all SDG data is consistent and up-to-date with UN definitions

