import { CoreCartComponent, ComponentSchema, ValidationResult } from './types';

export class ComponentRegistryService {
  private registry = new Map<string, CoreCartComponent>();

  register(component: CoreCartComponent) {
    this.registry.set(component.type, component);
  }

  resolve(type: string): CoreCartComponent | undefined {
    return this.registry.get(type);
  }

  validate(type: string, props: any): ValidationResult {
    const comp = this.resolve(type);
    if (!comp) {
      return { valid: false, errors: [`Component type "${type}" is not registered.`] };
    }
    return comp.validate(props);
  }
}

export const componentRegistry = new ComponentRegistryService();

export function validatePropsAgainstSchema(props: any, schema: ComponentSchema): ValidationResult {
  const errors: string[] = [];
  for (const [key, rules] of Object.entries(schema.properties)) {
    const val = props[key];
    if (rules.required && (val === undefined || val === null || val === '')) {
      errors.push(`Property "${key}" is required.`);
      continue;
    }
    if (val !== undefined && val !== null) {
      if (rules.type === 'number' && typeof val !== 'number' && isNaN(Number(val))) {
        errors.push(`Property "${key}" must be a number.`);
      } else if (rules.type === 'boolean' && typeof val !== 'boolean' && val !== 'true' && val !== 'false') {
        errors.push(`Property "${key}" must be a boolean.`);
      } else if (rules.type === 'enum' && rules.enumOptions && !rules.enumOptions.includes(val)) {
        errors.push(`Property "${key}" must be one of: ${rules.enumOptions.join(', ')}.`);
      }
    }
  }
  return { valid: errors.length === 0, errors };
}
