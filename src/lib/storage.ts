import { get, set, del, keys } from 'idb-keyval'

const STORE_PREFIX = 'grantly:vault:'

/**
 * Save a file blob to IndexedDB and return its key.
 * @param {string} id
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
export async function saveBlob(id, blob) {
  const key = `${STORE_PREFIX}${id}`
  await set(key, blob)
  return key
}

/**
 * Retrieve a blob from IndexedDB by key.
 * @param {string} blobKey
 * @returns {Promise<Blob | undefined>}
 */
export async function getBlob(blobKey) {
  const key = blobKey.startsWith(STORE_PREFIX) ? blobKey : `${STORE_PREFIX}${blobKey}`
  return get(key)
}

/**
 * Create an object URL for a stored blob.
 * @param {string} blobKey
 * @returns {Promise<string | undefined>}
 */
export async function getBlobURL(blobKey) {
  const blob = await getBlob(blobKey)
  if (!blob) return undefined
  return URL.createObjectURL(blob)
}

/**
 * Delete a blob from IndexedDB.
 * @param {string} blobKey
 * @returns {Promise<void>}
 */
export async function deleteBlob(blobKey) {
  const key = blobKey.startsWith(STORE_PREFIX) ? blobKey : `${STORE_PREFIX}${blobKey}`
  await del(key)
}

/**
 * Approximate storage usage for our vault blobs.
 * @returns {Promise<number>}
 */
export async function vaultStorageBytes() {
  const allKeys = await keys()
  let total = 0
  for (const k of allKeys) {
    if (typeof k === 'string' && k.startsWith(STORE_PREFIX)) {
      const blob = await get(k)
      if (blob && blob.size) total += blob.size
    }
  }
  return total
}
