import { ParsedRequirement } from './types.js';

export class PromptParser {
  
  parsePrompt(prompt: string): ParsedRequirement {
    const lowerPrompt = prompt.toLowerCase();
    
    // extract fields from prompt
    const fields = this.extractFields(prompt);
    
    // extract config name (use a default if not specified)
    const configName = this.extractConfigName(prompt) || this.generateConfigName(fields);
    
    // extract description
    const description = this.extractDescription(prompt) || "Generated from prompt";
    
    // check for theme
    const theme = this.extractTheme(lowerPrompt) || "THEME_1";
    
    // check for logo url
    const logoUrl = this.extractLogoUrl(prompt) || "http://www.dummy-image-url.com/1.png";
    
    // check if summary screen is needed
    const hasDetailsScreen = lowerPrompt.includes('details') || 
                             lowerPrompt.includes('summary') || 
                             lowerPrompt.includes('review') ||
                             lowerPrompt.includes('confirm');
    
    // check if payment is needed
    const hasPayment = lowerPrompt.includes('payment') || 
                      lowerPrompt.includes('pay') || 
                      lowerPrompt.includes('amount') ||
                      lowerPrompt.includes('fee') ||
                      lowerPrompt.includes('charge');
    
    return {
      fields,
      configName,
      description,
      theme,
      logoUrl,
      hasDetailsScreen,
      hasPayment
    };
  }
  
  private extractFields(prompt: string): ParsedRequirement['fields'] {
    const fields: ParsedRequirement['fields'] = [];
    
    // common field patterns
    const fieldPatterns = [
      // name variations
      { pattern: /\b(name|full name|first name|last name)\b/gi, type: 'string' as const, maxLength: 50 },
      // id/number
      { pattern: /\b(roll number|roll no|id|student id|employee id|registration number)\b/gi, type: 'string' as const, maxLength: 20 },
      // contact
      { pattern: /\b(phone|mobile|contact|phone number|mobile number)\b/gi, type: 'phone' as const, maxLength: 15 },
      { pattern: /\b(email|email address|e-mail)\b/gi, type: 'email' as const, maxLength: 100 },
      // amount
      { pattern: /\b(amount|fee|charge|cost|price|payment)\b/gi, type: 'number' as const, maxLength: 12 },
      // address
      { pattern: /\b(address|location|street|city)\b/gi, type: 'string' as const, maxLength: 200 },
      // date
      { pattern: /\b(date|birth date|dob|appointment date)\b/gi, type: 'string' as const, maxLength: 10 },
      // generic text
      { pattern: /\b(description|comments|notes|remarks)\b/gi, type: 'string' as const, maxLength: 500 },
    ];
    
    fieldPatterns.forEach(({ pattern, type, maxLength }) => {
      const matches = [...prompt.matchAll(pattern)];
      matches.forEach(match => {
        const fieldName = match[1];
        const normalizedName = this.normalizeFieldName(fieldName);
        const label = this.capitalizeWords(fieldName);
        
        // duplicates
        if (!fields.find(f => f.name === normalizedName)) {
          fields.push({
            name: normalizedName,
            type,
            label,
            required: true,
            maxLength,
            minLength: type === 'number' ? 0 : 1
          });
        }
      });
    });
    
    // no specific fields found - extract generic field mentions
    if (fields.length === 0) {
      const genericPatterns = /\b(capture|collect|enter|input|get)\s+([a-zA-Z\s,]+)/gi;
      const matches = [...prompt.matchAll(genericPatterns)];
      
      matches.forEach(match => {
        const fieldsText = match[2];
        const fieldNames = fieldsText.split(/,|\sand\s/).map(s => s.trim()).filter(s => s.length > 0);
        
        fieldNames.forEach(fieldName => {
          const normalizedName = this.normalizeFieldName(fieldName);
          const label = this.capitalizeWords(fieldName);
          
          if (!fields.find(f => f.name === normalizedName)) {
            fields.push({
              name: normalizedName,
              type: 'string',
              label,
              required: true,
              maxLength: 100,
              minLength: 1
            });
          }
        });
      });
    }
    
    return fields;
  }
  
  private extractConfigName(prompt: string): string | null {
    const configNamePatterns = [
      /config name[:\s]+([^,.\n]+)/gi,
      /name[:\s]+([^,.\n]+)/gi,
      /called[:\s]+([^,.\n]+)/gi,
    ];
    
    for (const pattern of configNamePatterns) {
      const match = prompt.match(pattern);
      if (match && match[1]) {
        return match[1].trim().replace(/[^\w\s]/g, '').replace(/\s+/g, '_');
      }
    }
    
    return null;
  }
  
  private extractDescription(prompt: string): string | null {
    if (prompt.length > 100) {
      return prompt.substring(0, 100) + "...";
    }
    return prompt;
  }
  
  private extractTheme(prompt: string): string | null {
    const themePatterns = [
      /theme[:\s]+(\w+)/gi,
      /style[:\s]+(\w+)/gi,
    ];
    
    for (const pattern of themePatterns) {
      const match = prompt.match(pattern);
      if (match && match[1]) {
        const theme = match[1].toUpperCase();
        if (['THEME_1', 'THEME_2', 'THEME_3'].includes(`THEME_${theme}`)) {
          return `THEME_${theme}`;
        }
      }
    }
    
    return null;
  }
  
  private extractLogoUrl(prompt: string): string | null {
    const urlPattern = /https?:\/\/[^\s]+/gi;
    const match = prompt.match(urlPattern);
    return match ? match[0] : null;
  }
  
  private normalizeFieldName(name: string): string {
    return name.toLowerCase()
               .replace(/\s+/g, '')
               .replace(/[^\w]/g, '')
               .replace(/^(.)/, (match) => match.toLowerCase());
  }
  
  private capitalizeWords(text: string): string {
    return text.split(' ')
               .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
               .join(' ');
  }
  
  private generateConfigName(fields: ParsedRequirement['fields']): string {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fieldNames = fields.slice(0, 2).map(f => f.name).join('_');
    return fieldNames ? `${fieldNames}_config_${timestamp}` : `generated_config_${timestamp}`;
  }
} 