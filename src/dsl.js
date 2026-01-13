/**
 * DSL (Domain Specific Language) for declarative data extraction
 * Provides helper functions for common extraction patterns
 */

/**
 * Extract text content from an element
 * @param {string} selector - CSS selector relative to current element
 * @param {Object} options - Extraction options
 * @param {boolean} [options.trim=true] - Trim whitespace
 * @param {string} [options.default=null] - Default value if not found
 * @returns {Function} Extractor function for DSL
 */
export function text (selector, options = {}) {
  const { trim = true, default: defaultValue = null } = options
  return {
    __dsl: 'text',
    selector,
    trim,
    default: defaultValue
  }
}

/**
 * Extract attribute value from an element
 * @param {string} selector - CSS selector relative to current element
 * @param {string} attribute - Attribute name to extract
 * @param {Object} options - Extraction options
 * @param {string} [options.default=null] - Default value if not found
 * @returns {Function} Extractor function for DSL
 */
export function attr (selector, attribute, options = {}) {
  const { default: defaultValue = null } = options
  return {
    __dsl: 'attr',
    selector,
    attribute,
    default: defaultValue
  }
}

/**
 * Extract array of elements matching selector
 * @param {string} selector - CSS selector relative to current element
 * @param {Object|Function} extractor - Extractor for each array item (DSL or function)
 * @returns {Function} Extractor function for DSL
 */
export function array (selector, extractor) {
  return {
    __dsl: 'array',
    selector,
    extractor
  }
}

/**
 * Check if element exists
 * @param {string} selector - CSS selector relative to current element
 * @returns {Function} Extractor function for DSL
 */
export function exists (selector) {
  return {
    __dsl: 'exists',
    selector
  }
}

/**
 * Extract HTML content from an element
 * @param {string} selector - CSS selector relative to current element
 * @param {Object} options - Extraction options
 * @param {string} [options.default=null] - Default value if not found
 * @returns {Function} Extractor function for DSL
 */
export function html (selector, options = {}) {
  const { default: defaultValue = null } = options
  return {
    __dsl: 'html',
    selector,
    default: defaultValue
  }
}

/**
 * Count elements matching selector
 * @param {string} selector - CSS selector relative to current element
 * @returns {Function} Extractor function for DSL
 */
export function count (selector) {
  return {
    __dsl: 'count',
    selector
  }
}

/**
 * Check if a DSL extractor definition
 * @param {*} value - Value to check
 * @returns {boolean} True if DSL definition
 * @private
 */
export function isDSL (value) {
  return value && typeof value === 'object' && '__dsl' in value
}

/**
 * Execute a single DSL extraction
 * @param {Element} element - DOM element to extract from
 * @param {Object} dslDef - DSL definition object
 * @returns {*} Extracted value
 * @private
 */
function executeDSLExtraction (element, dslDef) {
  const targetElement = dslDef.selector
    ? element.querySelector(dslDef.selector)
    : element

  switch (dslDef.__dsl) {
    case 'text': {
      const textContent = targetElement?.textContent
      if (textContent === null || textContent === undefined) {
        return dslDef.default
      }
      return dslDef.trim ? textContent.trim() : textContent
    }

    case 'attr': {
      const attrValue = targetElement?.getAttribute(dslDef.attribute)
      return attrValue !== null ? attrValue : dslDef.default
    }

    case 'html': {
      const htmlContent = targetElement?.innerHTML
      return htmlContent !== null && htmlContent !== undefined
        ? htmlContent
        : dslDef.default
    }

    case 'exists': {
      return targetElement !== null && targetElement !== undefined
    }

    case 'count': {
      return element.querySelectorAll(dslDef.selector).length
    }

    case 'array': {
      const elements = element.querySelectorAll(dslDef.selector)
      return Array.from(elements).map(el => {
        if (isDSL(dslDef.extractor)) {
          return executeDSLExtraction(el, dslDef.extractor)
        } else if (typeof dslDef.extractor === 'object') {
          return executeDSLObject(el, dslDef.extractor)
        } else if (typeof dslDef.extractor === 'function') {
          return dslDef.extractor(el)
        }
        // Default: return element itself
        return el
      })
    }

    default:
      return null
  }
}

/**
 * Execute DSL object extraction
 * @param {Element} element - DOM element to extract from
 * @param {Object} schema - DSL schema object
 * @returns {Object} Extracted data object
 * @private
 */
function executeDSLObject (element, schema) {
  const result = {}

  for (const [key, value] of Object.entries(schema)) {
    if (isDSL(value)) {
      result[key] = executeDSLExtraction(element, value)
    } else if (typeof value === 'object' && value !== null) {
      // Nested object
      result[key] = executeDSLObject(element, value)
    } else if (typeof value === 'function') {
      // Custom function
      result[key] = value(element)
    } else {
      // Static value
      result[key] = value
    }
  }

  return result
}

/**
 * Check if schema contains custom functions (mixed mode)
 * @param {Object} schema - DSL schema to check
 * @returns {boolean} True if schema contains custom functions
 * @private
 */
function hasMixedMode (schema) {
  for (const value of Object.values(schema)) {
    if (typeof value === 'function') {
      return true
    }
    if (typeof value === 'object' && value !== null && !isDSL(value)) {
      // Recursively check nested objects
      if (hasMixedMode(value)) {
        return true
      }
    }
  }
  return false
}

/**
 * Generate self-contained extractor code for mixed mode
 * Inlines DSL execution functions and custom functions
 * @param {Object} schema - DSL schema with custom functions
 * @returns {string} JavaScript code as string
 */
export function generateMixedModeCode (schema) {
  // Collect all custom functions and create a mapping
  const functions = {}
  let functionIndex = 0

  // Replace functions with markers
  function replaceFunctions (obj) {
    if (typeof obj === 'function') {
      const key = `__FUNC_${functionIndex++}__`
      functions[key] = obj
      return key
    }
    if (isDSL(obj)) {
      return obj
    }
    if (typeof obj === 'object' && obj !== null) {
      const result = {}
      for (const [k, v] of Object.entries(obj)) {
        result[k] = replaceFunctions(v)
      }
      return result
    }
    return obj
  }

  const schemaWithMarkers = replaceFunctions(schema)
  const schemaStr = JSON.stringify(schemaWithMarkers)

  // Build the function reconstruction code
  const functionDefs = Object.entries(functions)
    .map(([key, fn]) => `    const ${key} = ${fn.toString()};`)
    .join('\n')

  // Build the schema reconstruction code
  let schemaReconstruction = schemaStr
  for (const key of Object.keys(functions)) {
    schemaReconstruction = schemaReconstruction.replace(`"${key}"`, key)
  }

  return `(function(element) {
${functionDefs}
    const schema = ${schemaReconstruction};

    function isDSL(value) {
      return value && typeof value === 'object' && '__dsl' in value;
    }

    function executeDSLExtraction(element, dslDef) {
      const targetElement = dslDef.selector
        ? element.querySelector(dslDef.selector)
        : element;

      switch (dslDef.__dsl) {
        case 'text': {
          const textContent = targetElement?.textContent;
          if (textContent === null || textContent === undefined) {
            return dslDef.default;
          }
          return dslDef.trim ? textContent.trim() : textContent;
        }

        case 'attr': {
          const attrValue = targetElement?.getAttribute(dslDef.attribute);
          return attrValue !== null ? attrValue : dslDef.default;
        }

        case 'html': {
          const htmlContent = targetElement?.innerHTML;
          return htmlContent !== null && htmlContent !== undefined
            ? htmlContent
            : dslDef.default;
        }

        case 'exists': {
          return targetElement !== null && targetElement !== undefined;
        }

        case 'count': {
          return element.querySelectorAll(dslDef.selector).length;
        }

        case 'array': {
          const elements = element.querySelectorAll(dslDef.selector);
          return Array.from(elements).map(el => {
            if (isDSL(dslDef.extractor)) {
              return executeDSLExtraction(el, dslDef.extractor);
            } else if (typeof dslDef.extractor === 'object') {
              return executeDSLObject(el, dslDef.extractor);
            } else if (typeof dslDef.extractor === 'function') {
              return dslDef.extractor(el);
            }
            return el;
          });
        }

        default:
          return null;
      }
    }

    function executeDSLObject(element, schema) {
      const result = {};

      for (const [key, value] of Object.entries(schema)) {
        if (isDSL(value)) {
          result[key] = executeDSLExtraction(element, value);
        } else if (typeof value === 'object' && value !== null) {
          result[key] = executeDSLObject(element, value);
        } else if (typeof value === 'function') {
          result[key] = value(element);
        } else {
          result[key] = value;
        }
      }

      return result;
    }

    return executeDSLObject(element, schema);
  })`
}

/**
 * Convert DSL schema to extractor function
 * This is the main entry point for using DSL in harvest()
 *
 * @param {Object|Function} extractorOrSchema - DSL schema object or function
 * @returns {Function|Object} Extractor function compatible with harvest(), or DSL object with metadata
 * @example
 * const schema = {
 *   title: text('h2'),
 *   link: attr('a', 'href'),
 *   tags: array('.tag', text())
 * }
 * const extractor = createExtractor(schema)
 * await harvester.harvest(url, '.item', extractor)
 */
export function createExtractor (extractorOrSchema) {
  // If already a function, return as-is (backward compatibility)
  if (typeof extractorOrSchema === 'function') {
    return extractorOrSchema
  }

  // If DSL object, mark it as such for special handling
  if (typeof extractorOrSchema === 'object' && extractorOrSchema !== null) {
    // Check if it contains DSL definitions
    if (isUsingDSL(extractorOrSchema)) {
      // Check for mixed mode (DSL + custom functions)
      if (hasMixedMode(extractorOrSchema)) {
        // Mixed mode: return special marker with mixed mode code
        return {
          __isDSLSchema: true,
          __isMixedMode: true,
          schema: extractorOrSchema
        }
      }
      // Pure DSL: use optimized browser-side execution
      return {
        __isDSLSchema: true,
        schema: extractorOrSchema
      }
    }
    // Otherwise treat as regular function extractor
    return (element) => executeDSLObject(element, extractorOrSchema)
  }

  // Fallback: return identity
  return (element) => element
}

/**
 * Check if extractor uses DSL
 * @param {*} extractor - Extractor to check
 * @returns {boolean} True if DSL-based
 */
export function isUsingDSL (extractor) {
  if (typeof extractor === 'function') {
    return false
  }
  if (typeof extractor === 'object' && extractor !== null) {
    // Check if any value is a DSL definition
    return Object.values(extractor).some(
      value => isDSL(value) || (typeof value === 'object' && isUsingDSL(value))
    )
  }
  return false
}

/**
 * Generate inline DSL executor code as string
 * This is used to inject DSL execution logic into page context
 * @param {Object} schema - DSL schema
 * @returns {string} JavaScript code as string
 * @private
 */
export function generateDSLCode (schema) {
  const schemaStr = JSON.stringify(schema)

  return `(function(element) {
    const schema = ${schemaStr};

    function isDSL(value) {
      return value && typeof value === 'object' && '__dsl' in value;
    }

    function executeDSLExtraction(element, dslDef) {
      const targetElement = dslDef.selector
        ? element.querySelector(dslDef.selector)
        : element;

      switch (dslDef.__dsl) {
        case 'text': {
          const textContent = targetElement?.textContent;
          if (textContent === null || textContent === undefined) {
            return dslDef.default;
          }
          return dslDef.trim ? textContent.trim() : textContent;
        }

        case 'attr': {
          const attrValue = targetElement?.getAttribute(dslDef.attribute);
          return attrValue !== null ? attrValue : dslDef.default;
        }

        case 'html': {
          const htmlContent = targetElement?.innerHTML;
          return htmlContent !== null && htmlContent !== undefined
            ? htmlContent
            : dslDef.default;
        }

        case 'exists': {
          return targetElement !== null && targetElement !== undefined;
        }

        case 'count': {
          return element.querySelectorAll(dslDef.selector).length;
        }

        case 'array': {
          const elements = element.querySelectorAll(dslDef.selector);
          return Array.from(elements).map(el => {
            if (isDSL(dslDef.extractor)) {
              return executeDSLExtraction(el, dslDef.extractor);
            } else if (typeof dslDef.extractor === 'object') {
              return executeDSLObject(el, dslDef.extractor);
            } else if (typeof dslDef.extractor === 'function') {
              return dslDef.extractor(el);
            }
            return el;
          });
        }

        default:
          return null;
      }
    }

    function executeDSLObject(element, schema) {
      const result = {};

      for (const [key, value] of Object.entries(schema)) {
        if (isDSL(value)) {
          result[key] = executeDSLExtraction(element, value);
        } else if (typeof value === 'object' && value !== null) {
          result[key] = executeDSLObject(element, value);
        } else if (typeof value === 'function') {
          result[key] = value(element);
        } else {
          result[key] = value;
        }
      }

      return result;
    }

    return executeDSLObject(element, schema);
  })`
}
