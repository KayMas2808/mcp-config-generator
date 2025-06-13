# Example Prompts for MCP Config Generator

## Basic Examples

### Student Registration
**Prompt:** "Create a form to capture Name, Roll Number, and Amount"

**Expected Output:**
- Name field (string input)
- Roll Number field (string input)
- Amount field (number input)
- Details screen with payment buttons
- Navigation between screens

### Employee Onboarding
**Prompt:** "Build an employee registration form with Name, Email, Phone, and Address"

**Expected Output:**
- Name field (string)
- Email field (email validation)
- Phone field (phone validation)  
- Address field (longer text)
- Single screen form

### Conference Registration
**Prompt:** "Make a conference registration form with Name, Email, Company, and Registration Fee"

**Expected Output:**
- Name field
- Email field with validation
- Company field
- Registration Fee (number with payment)
- Payment integration

## Advanced Examples

### Multi-Screen Flow
**Prompt:** "Create a student admission form with Name, Roll Number, Email, Phone, and Amount. Show a confirmation screen with all details before payment."

**Expected Features:**
- Input screen with all fields
- Confirmation screen displaying entered data
- Payment buttons on confirmation screen

### Custom Branding
**Prompt:** "Build a form for Maharishi College with student Name, ID, and Fee Amount using theme 1"

**Expected Features:**
- Custom heading with college name
- Theme 1 styling
- Standard student fields
- Payment integration

### Complex Form
**Prompt:** "Create a comprehensive registration form called 'TechConf2024_Registration' for a technology conference. Capture participant Name, Email, Phone, Company, Job Title, and Conference Fee of $299. Include a review screen and payment processing."

**Expected Features:**
- Custom config name
- Professional field set
- Review screen
- Fixed fee amount
- Complete payment flow

## Field Detection Tests

### Contact Information
**Prompt:** "Collect Name, Email Address, Mobile Number, and Home Address"

### Financial Information  
**Prompt:** "Capture Payment Amount, Processing Fee, and Total Charge"

### Academic Information
**Prompt:** "Get Student Name, Roll Number, Course, and Semester"

### Personal Information
**Prompt:** "Record Full Name, Date of Birth, Phone, and Email"

## Edge Cases

### Minimal Input
**Prompt:** "Simple form with Name"

### Ambiguous Fields
**Prompt:** "Create form with user info and payment details"

### Technical Keywords
**Prompt:** "Generate configuration for data collection including name and amount with validation"

## Testing Scenarios

1. **Basic Generation:** Use simple prompts to test field detection
2. **Schema Validation:** Generate config and validate with `validate_config` tool
3. **Requirement Analysis:** Use `analyze_prompt` to see parsing without generation
4. **Custom Parameters:** Test with different username/password combinations
5. **Error Handling:** Try malformed prompts or invalid inputs

## Expected Behaviors

### Automatic Features
- Payment buttons appear when amount/fee fields are detected
- Details screen is added when confirmation keywords are used
- Field types are automatically determined (string, number, email, phone)
- Error messages are generated for each field
- Navigation buttons are added between screens

### Smart Defaults
- Config names are generated from field names if not specified
- Descriptions are created from the prompt
- Default theme is THEME_1
- Default logo URL is provided
- Standard min/max lengths are applied based on field type

### Validation Rules
- Required fields have minLen > 0
- Number fields can have minLen = 0
- Email fields get email validation
- Phone fields get phone validation
- Amount fields are automatically stored as txnAmount for payment processing 