// import.js - Simplified dynamic module loader

import Helper from './helper.js';

/**
 * Dynamically imports a module and returns its default export or the module itself if no default is found.
 * 
 * @template T
 * @param {string} modulePath The path to the module to be imported.
 * @returns {Promise<T>} The imported module or its default export.
 */
export default async function importModule(modulePath) {
  try {
    // Resolve the full path of the module
    const resolvedPath = Helper.__filename(modulePath);

    // Dynamically import the module
    const importedModule = await import(resolvedPath);

    // Return the default export if available, otherwise return the entire module
    return 'default' in importedModule ? importedModule.default : importedModule;
  } catch (error) {
    console.error(`Failed to import module at ${modulePath}:`, error);
    throw error;
  }
}