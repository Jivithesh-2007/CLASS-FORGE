# Design Document: Student Proposal Form Restructure

## Overview

The student proposal form will be restructured to prioritize alignment with Karunya Thrust Areas and UN Sustainable Development Goals (SDGs). The form will be reorganized with new dropdown fields for Karunya Thrust Areas and SDG selection, featuring dynamic preview of SDG highlights. The project title field will be moved to the bottom of the form to emphasize strategic alignment over project naming.

## Architecture

The form will be implemented as a React component with the following architecture:

- **Form Container**: Main component managing form state and submission
- **Form Fields**: Individual field components for each input type
- **SDG Data Store**: Centralized data structure containing all 17 SDGs with descriptions and highlights
- **State Management**: React hooks (useState) for managing form data and UI state
- **API Integration**: Integration with existing ideaAPI for form submission

The form will follow a linear flow from strategic alignment (Karunya Thrust Areas and SDGs) through project details (domain, stage, description, tags) to project identification (title).

## Components and Interfaces

### FormData Interface

```typescript
interface FormData {
  karunyaThrustArea: string;      // Selected thrust area: Water, Food, Healthcare, Energy
  sdg: string;                     // Selected SDG (1-17)
  title: string;                   // Project title
  domain: string;                  // Target domain
  stage: string;                   // Project stage
  description: string;             // Project description
  tags: string;                    // Comma-separated tags
}
```

### SDG Data Structure

```typescript
interface SDG {
  id: number;                      // SDG number (1-17)
  title: string;                   // Official SDG title
  description: string;             // 2-3 sentence description
  highlights: string[];            // 3-5 key focus areas/targets
}
```

### Karunya Thrust Areas

```typescript
const KARUNYA_THRUST_AREAS = [
  'Water',
  'Food',
  'Healthcare',
  'Energy'
];
```

### SDG Definitions

All 17 SDGs will be defined with complete information:

1. **SDG 1: No Poverty** - End poverty in all its forms everywhere
2. **SDG 2: Zero Hunger** - End hunger, achieve food security and improved nutrition
3. **SDG 3: Good Health and Well-Being** - Ensure healthy lives and promote well-being for all
4. **SDG 4: Quality Education** - Ensure inclusive and equitable quality education for all
5. **SDG 5: Gender Equality** - Achieve gender equality and empower all women and girls
6. **SDG 6: Clean Water and Sanitation** - Ensure availability and sustainable management of water
7. **SDG 7: Affordable and Clean Energy** - Ensure access to affordable, reliable, sustainable energy
8. **SDG 8: Decent Work and Economic Growth** - Promote sustained, inclusive economic growth
9. **SDG 9: Industry, Innovation and Infrastructure** - Build resilient infrastructure and foster innovation
10. **SDG 10: Reduced Inequalities** - Reduce inequality within and among countries
11. **SDG 11: Sustainable Cities and Communities** - Make cities inclusive, safe, resilient
12. **SDG 12: Responsible Consumption and Production** - Ensure sustainable consumption and production
13. **SDG 13: Climate Action** - Take urgent action to combat climate change
14. **SDG 14: Life Below Water** - Conserve and sustainably use oceans, seas and marine resources
15. **SDG 15: Life on Land** - Protect, restore and promote sustainable use of terrestrial ecosystems
16. **SDG 16: Peace, Justice and Strong Institutions** - Promote peaceful and inclusive societies
17. **SDG 17: Partnerships for the Goals** - Strengthen implementation and global partnership

## Data Models

### Form State Model

The form will maintain the following state:

```javascript
{
  karunyaThrustArea: '',           // Current selection
  sdg: '',                         // Current selection
  title: '',                       // User input
  domain: '',                      // User selection
  stage: 'Concept',                // Default value
  description: '',                 // User input
  tags: '',                        // User input
  selectedSDGData: null,           // SDG object for preview
  loading: false,                  // Submission state
  errors: {}                       // Field validation errors
}
```

### Form Field Specifications

1. **Karunya Thrust Areas Dropdown**
   - Type: Select dropdown
   - Options: Water, Food, Healthcare, Energy
   - Required: Yes
   - Placeholder: "Select a thrust area"
   - Position: First field

2. **SDG Selection Dropdown**
   - Type: Select dropdown
   - Options: All 17 SDGs (SDG 1: No Poverty, SDG 2: Zero Hunger, etc.)
   - Required: Yes
   - Placeholder: "Select an SDG"
   - Position: Second field
   - Behavior: Triggers SDG preview display

3. **SDG Preview Section**
   - Type: Information display
   - Content: SDG number, title, description, highlights
   - Visibility: Shown only when SDG is selected
   - Position: Below SDG dropdown
   - Update: Real-time when SDG selection changes

4. **Target Domain Dropdown**
   - Type: Select dropdown
   - Options: Technology, Science, Education, Healthcare, Environment, Business, Arts, Social, Other
   - Required: Yes
   - Position: Third field

5. **Stage Dropdown**
   - Type: Select dropdown
   - Options: Concept, Development, Testing, Implementation
   - Required: Yes
   - Default: Concept
   - Position: Fourth field

6. **Description Textarea**
   - Type: Textarea
   - Placeholder: "Summarize the problem, solution, and impact in 2-3 sentences..."
   - Required: Yes
   - Rows: 4
   - Position: Fifth field

7. **Tags Input**
   - Type: Text input
   - Placeholder: "e.g., AI, Machine Learning, Innovation"
   - Required: No
   - Position: Sixth field

8. **Project Title Input**
   - Type: Text input
   - Placeholder: "e.g. Next-Gen Vertical Farming"
   - Required: Yes
   - Position: Seventh field (moved to bottom)

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Form Field Order Invariant

*For any* form render, the visual order of fields from top to bottom SHALL be: Karunya Thrust Areas, SDG Selection, Target Domain, Stage, Description, Tags, Project Title, Buttons.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Karunya Thrust Areas Completeness

*For any* form load, the Karunya Thrust Areas dropdown SHALL contain exactly four options: Water, Food, Healthcare, Energy.

**Validates: Requirements 2.2**

### Property 3: SDG Dropdown Completeness

*For any* form load, the SDG Selection dropdown SHALL contain all 17 UN Sustainable Development Goals with correct numbering (1-17) and titles.

**Validates: Requirements 3.2**

### Property 4: SDG Preview Display Invariant

*For any* SDG selection, if an SDG is selected, the preview section SHALL be visible; if no SDG is selected, the preview section SHALL not be visible.

**Validates: Requirements 4.1, 4.4**

### Property 5: SDG Preview Content Accuracy

*For any* selected SDG, the preview section SHALL display the correct SDG number, title, description, and highlights matching the SDG data store.

**Validates: Requirements 4.2, 4.3**

### Property 6: Form Data Persistence

*For any* form field input, the entered value SHALL be stored in form state and remain unchanged until explicitly modified by the user.

**Validates: Requirements 2.3, 3.3, 5.2**

### Property 7: Form Submission Payload Completeness

*For any* successful form submission, the submission payload SHALL include all required fields: karunyaThrustArea, sdg, title, domain, stage, description, and tags array.

**Validates: Requirements 6.2**

### Property 8: Form Validation Enforcement

*For any* form submission attempt with missing required fields, the form SHALL prevent submission and display validation errors.

**Validates: Requirements 6.1**

### Property 9: SDG Data Consistency

*For any* SDG in the data store, the SDG SHALL have a unique ID (1-17), official title, comprehensive description, and 3-5 key highlights.

**Validates: Requirements 7.1, 7.3**

### Property 10: Form Reset Behavior

*For any* form reset or cancel action, all form fields SHALL be cleared and the SDG preview section SHALL be hidden.

**Validates: Requirements 4.5**

## Error Handling

The form will implement the following error handling strategies:

1. **Validation Errors**: Display field-level error messages for required fields that are empty
2. **Submission Errors**: Display toast notification with error message from API response
3. **Network Errors**: Handle API failures gracefully with user-friendly error messages
4. **State Recovery**: Preserve form data on validation errors to prevent data loss

Error messages will be displayed:
- Inline below each field for validation errors
- As toast notifications for submission errors
- With clear guidance on how to resolve the issue

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and edge cases:

1. **Field Rendering Tests**
   - Verify all form fields render in correct order
   - Verify dropdown options are correct and complete
   - Verify placeholder text is displayed correctly

2. **User Interaction Tests**
   - Test selecting values from dropdowns
   - Test typing in text inputs
   - Test textarea input handling
   - Test form submission with valid data

3. **SDG Preview Tests**
   - Test SDG preview appears when SDG is selected
   - Test SDG preview disappears when no SDG is selected
   - Test SDG preview content updates when selection changes

4. **Validation Tests**
   - Test form prevents submission with empty required fields
   - Test form allows submission with all required fields filled
   - Test error messages display for invalid inputs

5. **Data Handling Tests**
   - Test form data is stored correctly in state
   - Test form data persists across field changes
   - Test form data is cleared on reset

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using a testing library like Vitest or Jest with fast-check:

1. **Property 1: Form Field Order Invariant**
   - Generate random form renders
   - Verify field order is always: Karunya Thrust Areas → SDG → Domain → Stage → Description → Tags → Title
   - Minimum 100 iterations

2. **Property 2: Karunya Thrust Areas Completeness**
   - Verify dropdown always contains exactly 4 options
   - Verify options are always: Water, Food, Healthcare, Energy
   - Minimum 100 iterations

3. **Property 3: SDG Dropdown Completeness**
   - Verify dropdown always contains 17 SDGs
   - Verify SDG IDs are sequential 1-17
   - Verify all SDG titles are present
   - Minimum 100 iterations

4. **Property 4: SDG Preview Display Invariant**
   - Generate random SDG selections
   - Verify preview is visible iff SDG is selected
   - Minimum 100 iterations

5. **Property 5: SDG Preview Content Accuracy**
   - For each SDG, verify preview displays correct data
   - Verify no data corruption or mixing between SDGs
   - Minimum 100 iterations

6. **Property 6: Form Data Persistence**
   - Generate random form inputs
   - Verify data persists in state until modified
   - Verify modifications update state correctly
   - Minimum 100 iterations

7. **Property 7: Form Submission Payload Completeness**
   - Generate valid form data
   - Verify submission payload includes all required fields
   - Verify no fields are missing or corrupted
   - Minimum 100 iterations

8. **Property 8: Form Validation Enforcement**
   - Generate form data with missing required fields
   - Verify submission is prevented
   - Verify validation errors are displayed
   - Minimum 100 iterations

9. **Property 9: SDG Data Consistency**
   - For each SDG in data store, verify structure is correct
   - Verify no duplicate IDs
   - Verify all required fields are present
   - Minimum 100 iterations

10. **Property 10: Form Reset Behavior**
    - Generate random form state
    - Perform reset action
    - Verify all fields are cleared
    - Verify preview is hidden
    - Minimum 100 iterations

