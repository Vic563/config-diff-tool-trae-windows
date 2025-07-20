import { InvalidConfigError, ValidationError } from '../types';

/**
 * Validates the configuration content
 * @param content The configuration content to validate
 * @param configType The type of configuration ('pre' or 'post')
 * @throws {InvalidConfigError} If the configuration is invalid
 */
export function validateConfigContent(content: string, configType: 'pre' | 'post' = 'pre'): void {
  if (typeof content !== 'string') {
    throw new InvalidConfigError(
      `Configuration must be a string, got ${typeof content}`,
      configType === 'pre' ? 'preConfig' : 'postConfig',
      { type: typeof content }
    );
  }

  if (content.trim().length === 0) {
    throw new InvalidConfigError(
      'Configuration cannot be empty',
      configType === 'pre' ? 'preConfig' : 'postConfig',
      { length: 0 }
    );
  }

  // Check for common configuration issues
  const validationErrors: string[] = [];
  
  // Check for potential JSON parsing issues
  if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
    try {
      JSON.parse(content);
    } catch (error) {
      validationErrors.push('Invalid JSON format');
    }
  }

  // Check for common YAML issues
  const lines = content.split('\n');
  let hasYamlContent = false;
  let hasYamlStructure = false;
  let hasTabs = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for YAML structure
    if (line.includes(':') && !line.trim().startsWith('#')) {
      hasYamlStructure = true;
    }
    
    // Check for tabs which are not allowed in YAML
    if (line.includes('\t')) {
      hasTabs = true;
      validationErrors.push(`Line ${i + 1}: Tabs are not allowed in YAML, use spaces instead`);
    }
    
    // Check for common YAML content
    if (line.trim().startsWith('- ') || 
        line.trim().startsWith('  - ') || 
        line.match(/^\s*[a-zA-Z0-9_-]+\s*:/)) {
      hasYamlContent = true;
    }
  }

  // If it looks like YAML but has tabs, that's an error
  if ((hasYamlStructure || hasYamlContent) && hasTabs) {
    throw new InvalidConfigError(
      'Tabs are not allowed in YAML, use spaces instead',
      configType === 'pre' ? 'preConfig' : 'postConfig',
      { hasTabs: true, lineCount: lines.length }
    );
  }

  // If we found validation errors, throw them
  if (validationErrors.length > 0) {
    throw new ValidationError(
      `Configuration validation failed with ${validationErrors.length} error(s)`,
      validationErrors
    );
  }
}

/**
 * Validates the diff options
 * @param options The diff options to validate
 * @throws {InvalidConfigError} If the options are invalid
 */
export function validateDiffOptions(options: {
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
  ignoreEmptyLines?: boolean;
  contextLines?: number;
}): void {
  const validationErrors: string[] = [];
  
  if (options.contextLines !== undefined && 
      (typeof options.contextLines !== 'number' || options.contextLines < 0)) {
    validationErrors.push('contextLines must be a non-negative number');
  }
  
  if (options.ignoreWhitespace !== undefined && 
      typeof options.ignoreWhitespace !== 'boolean') {
    validationErrors.push('ignoreWhitespace must be a boolean');
  }
  
  if (options.ignoreCase !== undefined && 
      typeof options.ignoreCase !== 'boolean') {
    validationErrors.push('ignoreCase must be a boolean');
  }
  
  if (options.ignoreEmptyLines !== undefined && 
      typeof options.ignoreEmptyLines !== 'boolean') {
    validationErrors.push('ignoreEmptyLines must be a boolean');
  }
  
  if (validationErrors.length > 0) {
    throw new ValidationError(
      `Invalid diff options: ${validationErrors.join(', ')}`,
      validationErrors
    );
  }
}

/**
 * Validates that the configuration is a valid JSON or YAML string
 * @param content The configuration content to validate
 * @returns The parsed configuration if valid, or the original string if not
 */
export function validateJsonOrYaml(content: string): any | string {
  // Try to parse as JSON
  try {
    return JSON.parse(content);
  } catch (jsonError) {
    // If not JSON, try to parse as YAML
    try {
      // Simple YAML check - for full YAML parsing, you might want to use a YAML library
      if (content.includes(':')) {
        // This is a very basic check - in a real app, you'd use a YAML parser
        return content;
      }
      return content;
    } catch (yamlError) {
      // If neither JSON nor YAML, return the original string
      return content;
    }
  }
}
