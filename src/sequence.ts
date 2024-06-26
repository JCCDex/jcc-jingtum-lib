export const swtcSequence = (() => {
  // sequence cache for address
  const cache: Map<string, number> = new Map();

  /**
   * get sequence
   *
   * the value is from callback function if the cache is empty, otherwise is from memory
   *
   * @param {(...args) => Promise<number>} callback
   * @param {*} args
   * @returns {Promise<number>}
   */
  const get = async (callback: (...args) => Promise<number>, address): Promise<number> => {
    let sequence = cache.get(address);
    if (sequence === undefined) {
      sequence = await callback.apply(null, [address]);
      cache.set(address, sequence);
    }
    return sequence;
  };

  /**
   * sequence add 1 for the given address
   *
   */
  const rise = (address: string) => {
    const sequence = cache.get(address);
    if (sequence !== undefined) {
      cache.set(address, sequence + 1);
    }
  };

  /**
   * delete sequence cache for the given address
   *
   */
  const reset = (address: string) => {
    cache.delete(address);
  };

  /**
   * clear cache
   *
   */
  const clear = () => {
    cache.clear();
  };

  return {
    clear,
    get,
    reset,
    rise
  };
})();
