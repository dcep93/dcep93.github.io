(() => {
  const app = window.KTV420 || (window.KTV420 = {});
  const STORAGE_VERSION = 1;

  async function getRootDirectory() {
    if (typeof navigator.storage?.getDirectory !== "function") {
      throw new Error("This browser does not expose OPFS.");
    }

    return navigator.storage.getDirectory();
  }

  async function getTrackDirectory(trackId, create = false) {
    const normalizedTrackId = app.trackId.requireTrackId(trackId);
    const rootDirectory = await getRootDirectory();
    return rootDirectory.getDirectoryHandle(normalizedTrackId, { create });
  }

  async function hasTrackDirectory(trackId) {
    try {
      await getTrackDirectory(trackId, false);
      return true;
    } catch (error) {
      if (error?.name === "NotFoundError") {
        return false;
      }
      throw error;
    }
  }

  async function readTrackMetadata(trackId) {
    const directory = await getTrackDirectory(trackId, false);
    let file;

    try {
      const handle = await directory.getFileHandle("metadata.txt", { create: false });
      file = await handle.getFile();
    } catch (error) {
      throw new Error(`Stored metadata for "${trackId}" is missing or unreadable.`);
    }

    let parsed;
    try {
      parsed = JSON.parse(await file.text());
    } catch (_error) {
      throw new Error(`Stored metadata for "${trackId}" is not valid JSON.`);
    }

    if (!parsed || typeof parsed !== "object") {
      throw new Error(`Stored metadata for "${trackId}" is not a JSON object.`);
    }
    if (parsed.storageVersion !== STORAGE_VERSION) {
      const error = new Error(
        `Stored metadata for "${trackId}" uses storage version ${String(parsed.storageVersion || "")}, expected ${STORAGE_VERSION}.`,
      );
      error.code = "KTV420_STORAGE_VERSION_MISMATCH";
      throw error;
    }

    return parsed;
  }

  async function writeTrackFiles(trackId, result) {
    const directory = await getTrackDirectory(trackId, true);
    await writeTextFile(directory, "audioDataBase64.txt", String(result?.audioDataBase64 || ""));
    await writeTextFile(directory, "metadata.txt", JSON.stringify(result?.metadata || null, null, 2));
  }

  async function writeTextFile(directory, fileName, text) {
    const handle = await directory.getFileHandle(fileName, { create: true });
    const writable = await handle.createWritable();

    try {
      await writable.write(String(text || ""));
      await writable.close();
    } catch (error) {
      try {
        await writable.abort();
      } catch (_abortError) {}
      throw error;
    }
  }

  app.storage = {
    hasTrackDirectory,
    readTrackMetadata,
    writeTrackFiles,
  };
})();
