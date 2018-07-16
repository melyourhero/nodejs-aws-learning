/**
 * Singleton pattern implementation
 * @param  {Function} factory Instance factory
 * @return {Function} getInstance function with pattern implemented
 */
export function singleton(factory: any) {
  let instance: any = null;
  return (...args: any[]) => {
    if (!instance) {
      instance = factory(...args);
    }
    return instance;
  };
}
