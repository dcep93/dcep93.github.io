const TMDB_API_KEY_STORAGE_KEY = "cinenerdle2.tmdbApiKey";
const PERSON_BOUND_ATTR = "data-cinenerdle2-person-bound";
const MOVIE_BOUND_ATTR = "data-cinenerdle2-movie-bound";
const PERSON_NAME_PATTERN = /^[\p{L}\p{M}0-9.'’ -]+$/u;
const INDEXED_DB_NAME = "cinenerdle2";
const INDEXED_DB_VERSION = 6;
const PEOPLE_STORE_NAME = "people";
const FILMS_STORE_NAME = "films";
const CINENERDLE_ICON_URL = "https://www.cinenerdle2.app/icon.png";
const TMDB_ICON_URL =
  "https://www.themoviedb.org/assets/2/favicon-32x32-543a21832c8931d3494a68881f6afcafc58e96c5d324345377f3197a37b367b5.png";

const practiceModeClickBound = new WeakSet();
let movieTitleClickDelegateBound = false;
let latestQueryResponseText = "No query response yet.";
let practiceModeClearInFlight = false;
let genericExtensionPopstateBound = false;
let genericExtensionRootRow = null;

function isVisible(element) {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  const style = window.getComputedStyle(element);
  if (
    style.display === "none" ||
    style.visibility === "hidden" ||
    style.opacity === "0"
  ) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function getText(element) {
  return element?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function normalizeName(name) {
  return name.trim().toLocaleLowerCase();
}

function normalizeTitle(title) {
  return title.trim().toLocaleLowerCase();
}

function getFilmKey(title, year) {
  return `${normalizeTitle(title)}::${year ?? ""}`;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function looksLikePersonName(text) {
  return (
    PERSON_NAME_PATTERN.test(text) &&
    !/^(cast|crew|director|directors|writer|writers|cinematographer|composer|featuring)$/i.test(
      text,
    )
  );
}

function findPracticeModeEl() {
  return Array.from(document.querySelectorAll("div")).find(
    (element) => isVisible(element) && getText(element) === "PRACTICE MODE",
  );
}

function bindPracticeModeClick(practiceModeEl) {
  if (!practiceModeEl || practiceModeClickBound.has(practiceModeEl)) {
    return;
  }

  practiceModeEl.addEventListener(
    "click",
    async (event) => {
      if (practiceModeClearInFlight) {
        return;
      }

      const shouldClearDb = window.confirm(
        "Clear the DB?",
      );
      if (!shouldClearDb) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      practiceModeClearInFlight = true;

      try {
        await clearIndexedDb();
        practiceModeEl.click();
      } catch (error) {
        console.error("cinenerdle2.clearIndexedDb", error);
        alert(`Failed to clear cinenerdle2 cache: ${error.message}`);
      } finally {
        practiceModeClearInFlight = false;
      }
    },
    true,
  );

  practiceModeClickBound.add(practiceModeEl);
}

function hasCastMarker(element) {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  if (getText(element) === "Cast") {
    return true;
  }

  return Array.from(element.querySelectorAll("div, span")).some(
    (child) => isVisible(child) && getText(child) === "Cast",
  );
}

function elementHasCastContext(element) {
  let current = element;

  for (let depth = 0; current && depth < 5; depth += 1) {
    if (hasCastMarker(current)) {
      return true;
    }

    const parent = current.parentElement;
    if (!parent) {
      return false;
    }

    const siblings = Array.from(parent.children).filter(
      (child) => child !== current && isVisible(child),
    );
    if (siblings.some((child) => hasCastMarker(child))) {
      return true;
    }

    current = parent;
  }

  return false;
}

function getTmdbApiKey() {
  const existingApiKey = localStorage.getItem(TMDB_API_KEY_STORAGE_KEY)?.trim();
  if (existingApiKey) {
    return existingApiKey;
  }

  const promptedApiKey = prompt("Enter your TMDb API key");
  const apiKey = promptedApiKey?.trim();

  if (!apiKey) {
    return null;
  }

  localStorage.setItem(TMDB_API_KEY_STORAGE_KEY, apiKey);
  return apiKey;
}

function indexedDbRequestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function transactionDonePromise(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction failed"));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
  });
}

function openIndexedDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);

    request.onupgradeneeded = (event) => {
      const database = request.result;
      const oldVersion = event.oldVersion ?? 0;

      if (oldVersion > 0 && oldVersion < INDEXED_DB_VERSION) {
        Array.from(database.objectStoreNames).forEach((storeName) => {
          database.deleteObjectStore(storeName);
        });
      }

      if (!database.objectStoreNames.contains(PEOPLE_STORE_NAME)) {
        const peopleStore = database.createObjectStore(PEOPLE_STORE_NAME, {
          keyPath: "id",
        });
        peopleStore.createIndex("nameLower", "nameLower", { unique: false });
        peopleStore.createIndex("movieConnectionKeys", "movieConnectionKeys", {
          unique: false,
          multiEntry: true,
        });
      } else {
        const peopleStore = request.transaction.objectStore(PEOPLE_STORE_NAME);
        if (!peopleStore.indexNames.contains("nameLower")) {
          peopleStore.createIndex("nameLower", "nameLower", { unique: false });
        }
        if (!peopleStore.indexNames.contains("movieConnectionKeys")) {
          peopleStore.createIndex("movieConnectionKeys", "movieConnectionKeys", {
            unique: false,
            multiEntry: true,
          });
        }
      }

      if (!database.objectStoreNames.contains(FILMS_STORE_NAME)) {
        const filmsStore = database.createObjectStore(FILMS_STORE_NAME, {
          keyPath: "id",
        });
        filmsStore.createIndex("titleYear", "titleYear", { unique: false });
        filmsStore.createIndex("titleLower", "titleLower", { unique: false });
      } else {
        const filmsStore = request.transaction.objectStore(FILMS_STORE_NAME);
        if (!filmsStore.indexNames.contains("titleYear")) {
          filmsStore.createIndex("titleYear", "titleYear", { unique: false });
        }
        if (!filmsStore.indexNames.contains("titleLower")) {
          filmsStore.createIndex("titleLower", "titleLower", { unique: false });
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Unable to open IndexedDB"));
  });
}

async function clearIndexedDb() {
  const database = await openIndexedDb();

  try {
    const transaction = database.transaction(
      [PEOPLE_STORE_NAME, FILMS_STORE_NAME],
      "readwrite",
    );
    await Promise.all([
      indexedDbRequestToPromise(transaction.objectStore(PEOPLE_STORE_NAME).clear()),
      indexedDbRequestToPromise(transaction.objectStore(FILMS_STORE_NAME).clear()),
    ]);
    await transactionDonePromise(transaction);
  } finally {
    database.close();
  }
}

function getFilmTitleAndYear(cardElement) {
  const titleElement = Array.from(cardElement.querySelectorAll("div")).find(
    (element) => / \(\d{4}\)$/.test(getText(element)),
  );

  if (!titleElement) {
    return null;
  }

  const match = getText(titleElement).match(/^(.*) \((\d{4})\)$/);
  if (!match) {
    return null;
  }

  return {
    title: match[1].trim(),
    year: match[2],
  };
}

function getNearestFilmCard(element) {
  let current = element;

  while (current) {
    if (
      current instanceof HTMLElement &&
      hasCastMarker(current) &&
      getFilmTitleAndYear(current)
    ) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}

function splitPeopleText(text) {
  return text
    .split(",")
    .map((person) => person.trim())
    .filter(Boolean)
    .filter(looksLikePersonName);
}

function getMovieTitleFromCredit(credit) {
  return credit?.title ?? credit?.original_title ?? "";
}

function getMovieYearFromCredit(credit) {
  return credit?.release_date?.slice(0, 4) ?? "";
}

function getMovieKeyFromCredit(credit) {
  return getFilmKey(getMovieTitleFromCredit(credit), getMovieYearFromCredit(credit));
}

function getTmdbMovieCredits(personRecord) {
  const credits = personRecord?.rawTmdbMovieCreditsResponse ?? {};
  return [
    ...(credits.cast ?? []).map((credit) => ({ ...credit, creditType: "cast" })),
    ...(credits.crew ?? []).map((credit) => ({ ...credit, creditType: "crew" })),
  ];
}

function getUniqueSortedTmdbMovieCredits(personRecord) {
  const seenIds = new Set();

  return getTmdbMovieCredits(personRecord)
    .filter((credit) => {
      if (!credit?.id || seenIds.has(credit.id)) {
        return false;
      }
      seenIds.add(credit.id);
      return true;
    })
    .sort((left, right) => (right.popularity ?? 0) - (left.popularity ?? 0));
}

function getTmdbCreditForMovie(personRecord, movieKey) {
  return getTmdbMovieCredits(personRecord)
    .filter((credit) => getMovieKeyFromCredit(credit) === movieKey)
    .sort((left, right) => {
      if (left.creditType === right.creditType) {
        return (right.popularity ?? 0) - (left.popularity ?? 0);
      }
      return left.creditType === "cast" ? -1 : 1;
    })[0] ?? null;
}

function getDomConnectionForMovie(personRecord, movieKey) {
  return (
    (personRecord?.domConnections ?? []).find(
      (connection) => getFilmKey(connection.title, connection.year) === movieKey,
    ) ?? null
  );
}

function getCinenerdleRoleFromSnapshot(domSnapshot, personName) {
  if (!domSnapshot || !personName) {
    return null;
  }

  return (
    Object.entries(domSnapshot.peopleByRole ?? {}).find(([, people]) =>
      people.some(
        (candidateName) => normalizeName(candidateName) === normalizeName(personName),
      ),
    )?.[0] ?? null
  );
}

function getTmdbCreditCategoryText(credit) {
  if (!credit) {
    return "";
  }

  if (credit.creditType === "cast") {
    return credit.character ? `Cast as ${credit.character}` : "Cast";
  }

  if (credit.job) {
    return credit.job;
  }

  if (credit.department) {
    return credit.department;
  }

  return "Crew";
}

function parseDomFilmSnapshotFromElement(element) {
  const cardElement = getNearestFilmCard(element);
  if (!cardElement) {
    return null;
  }

  const filmTitleAndYear = getFilmTitleAndYear(cardElement);
  if (!filmTitleAndYear) {
    return null;
  }

  const peopleByRole = {};

  Array.from(cardElement.querySelectorAll("div.flex")).forEach((row) => {
    const children = Array.from(row.children).filter(
      (child) => child instanceof HTMLElement,
    );

    if (children.length < 2) {
      return;
    }

    const role = getText(children[0]);
    const people = splitPeopleText(getText(children[1]));

    if (!role || people.length === 0) {
      return;
    }

    peopleByRole[role] = people;
  });

  return {
    title: filmTitleAndYear.title,
    titleLower: normalizeTitle(filmTitleAndYear.title),
    year: filmTitleAndYear.year,
    titleYear: getFilmKey(filmTitleAndYear.title, filmTitleAndYear.year),
    peopleByRole,
    domSavedAt: new Date().toISOString(),
  };
}

async function getPersonRecordByName(personName) {
  const database = await openIndexedDb();

  try {
    const transaction = database.transaction(PEOPLE_STORE_NAME, "readonly");
    const store = transaction.objectStore(PEOPLE_STORE_NAME);
    const index = store.index("nameLower");
    const personRecord = await indexedDbRequestToPromise(
      index.get(normalizeName(personName)),
    );
    await transactionDonePromise(transaction);
    return personRecord ?? null;
  } finally {
    database.close();
  }
}

async function getPersonRecordsByMovieKey(movieKey) {
  const database = await openIndexedDb();

  try {
    const transaction = database.transaction(PEOPLE_STORE_NAME, "readonly");
    const store = transaction.objectStore(PEOPLE_STORE_NAME);
    const index = store.index("movieConnectionKeys");
    const personRecords = await indexedDbRequestToPromise(index.getAll(movieKey));
    await transactionDonePromise(transaction);
    return personRecords ?? [];
  } finally {
    database.close();
  }
}

async function getFilmRecordsByTitle(title) {
  const database = await openIndexedDb();

  try {
    const transaction = database.transaction(FILMS_STORE_NAME, "readonly");
    const store = transaction.objectStore(FILMS_STORE_NAME);
    const index = store.index("titleLower");
    const filmRecords = await indexedDbRequestToPromise(
      index.getAll(normalizeTitle(title)),
    );
    await transactionDonePromise(transaction);
    return filmRecords ?? [];
  } finally {
    database.close();
  }
}

async function getFilmRecordsByIds(ids) {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) {
    return new Map();
  }

  const database = await openIndexedDb();

  try {
    const transaction = database.transaction(FILMS_STORE_NAME, "readonly");
    const store = transaction.objectStore(FILMS_STORE_NAME);
    const records = await Promise.all(
      uniqueIds.map((id) => indexedDbRequestToPromise(store.get(id))),
    );
    await transactionDonePromise(transaction);
    return new Map(records.filter(Boolean).map((record) => [record.id, record]));
  } finally {
    database.close();
  }
}

async function getFilmRecordById(id) {
  if (!id) {
    return null;
  }

  const database = await openIndexedDb();

  try {
    const transaction = database.transaction(FILMS_STORE_NAME, "readonly");
    const store = transaction.objectStore(FILMS_STORE_NAME);
    const record = await indexedDbRequestToPromise(store.get(id));
    await transactionDonePromise(transaction);
    return record ?? null;
  } finally {
    database.close();
  }
}

async function savePersonRecord(personRecord) {
  const database = await openIndexedDb();

  try {
    const transaction = database.transaction(PEOPLE_STORE_NAME, "readwrite");
    const store = transaction.objectStore(PEOPLE_STORE_NAME);
    await indexedDbRequestToPromise(store.put(withDerivedPersonFields(personRecord)));
    await transactionDonePromise(transaction);
  } finally {
    database.close();
  }
}

function withDerivedPersonFields(personRecord) {
  const tmdbMovieKeys = getTmdbMovieCredits(personRecord).map((credit) =>
    getMovieKeyFromCredit(credit),
  );
  const domMovieKeys = (personRecord?.domConnections ?? []).map((connection) =>
    getFilmKey(connection.title, connection.year),
  );

  return {
    ...personRecord,
    movieConnectionKeys: Array.from(new Set([...tmdbMovieKeys, ...domMovieKeys])),
  };
}

function buildFilmRecord(existingFilmRecord, tmdbFilm, domFilmSnapshot) {
  const tmdbYear = tmdbFilm.release_date?.slice(0, 4) ?? "";
  const title =
    domFilmSnapshot?.title ?? tmdbFilm.title ?? existingFilmRecord?.title ?? "";
  const year =
    domFilmSnapshot?.year ?? tmdbYear ?? existingFilmRecord?.year ?? "";

  return {
    ...existingFilmRecord,
    id: tmdbFilm.id,
    title,
    titleLower: normalizeTitle(title),
    year,
    titleYear: getFilmKey(title, year),
    popularity: tmdbFilm.popularity ?? existingFilmRecord?.popularity ?? 0,
    rawTmdbMovie: tmdbFilm,
    tmdbSavedAt: new Date().toISOString(),
    domSnapshot: domFilmSnapshot
      ? {
          ...existingFilmRecord?.domSnapshot,
          ...domFilmSnapshot,
        }
      : existingFilmRecord?.domSnapshot,
  };
}

function mergeDomConnection(existingConnections, connection) {
  const connections = existingConnections ?? [];
  const alreadyExists = connections.some(
    (existingConnection) =>
      existingConnection.title === connection.title &&
      existingConnection.year === connection.year &&
      existingConnection.role === connection.role,
  );

  return alreadyExists ? connections : [...connections, connection];
}

async function saveFilmRecordsFromCredits(creditsPayload, domFilmSnapshot) {
  const database = await openIndexedDb();

  try {
    const transaction = database.transaction(FILMS_STORE_NAME, "readwrite");
    const store = transaction.objectStore(FILMS_STORE_NAME);

    for (const tmdbFilm of creditsPayload.cast ?? []) {
      const tmdbYear = tmdbFilm.release_date?.slice(0, 4) ?? "";
      const matchesDomFilm =
        domFilmSnapshot &&
        getFilmKey(tmdbFilm.title ?? "", tmdbYear) === domFilmSnapshot.titleYear;
      const existingFilmRecord = await indexedDbRequestToPromise(
        store.get(tmdbFilm.id),
      );

      await indexedDbRequestToPromise(
        store.put(
          buildFilmRecord(
            existingFilmRecord ?? null,
            tmdbFilm,
            matchesDomFilm ? domFilmSnapshot : null,
          ),
        ),
      );
    }

    await transactionDonePromise(transaction);
  } finally {
    database.close();
  }
}

async function syncDomSnapshotToCachedRecords(domFilmSnapshot) {
  if (!domFilmSnapshot) {
    return;
  }

  const matchingFilmRecords = (await getFilmRecordsByTitle(domFilmSnapshot.title)).filter(
    (record) => record.year === domFilmSnapshot.year,
  );

  const database = await openIndexedDb();

  try {
    const transaction = database.transaction(
      [FILMS_STORE_NAME, PEOPLE_STORE_NAME],
      "readwrite",
    );
    const filmsStore = transaction.objectStore(FILMS_STORE_NAME);
    const peopleStore = transaction.objectStore(PEOPLE_STORE_NAME);
    const peopleIndex = peopleStore.index("nameLower");

    for (const filmRecord of matchingFilmRecords) {
      await indexedDbRequestToPromise(
        filmsStore.put({
          ...filmRecord,
          title: domFilmSnapshot.title,
          titleLower: domFilmSnapshot.titleLower,
          year: domFilmSnapshot.year,
          titleYear: domFilmSnapshot.titleYear,
          domSnapshot: {
            ...filmRecord.domSnapshot,
            ...domFilmSnapshot,
          },
        }),
      );
    }

    for (const [role, people] of Object.entries(domFilmSnapshot.peopleByRole)) {
      for (const personName of people) {
        const personRecord = await indexedDbRequestToPromise(
          peopleIndex.get(normalizeName(personName)),
        );

        if (!personRecord) {
          continue;
        }

        await indexedDbRequestToPromise(
          peopleStore.put(
            withDerivedPersonFields({
              ...personRecord,
              domConnections: mergeDomConnection(personRecord.domConnections, {
                title: domFilmSnapshot.title,
                year: domFilmSnapshot.year,
                role,
              }),
            }),
          ),
        );
      }
    }

    await transactionDonePromise(transaction);
  } finally {
    database.close();
  }
}

async function fetchAndCachePerson(personName, domFilmSnapshot) {
  const apiKey = getTmdbApiKey();
  if (!apiKey) {
    return null;
  }

  const searchUrl = new URL("https://api.themoviedb.org/3/search/person");
  searchUrl.searchParams.set("api_key", apiKey);
  searchUrl.searchParams.set("query", personName);

  const searchResponse = await fetch(searchUrl.toString());
  if (!searchResponse.ok) {
    throw new Error(`TMDb person search failed: ${searchResponse.status}`);
  }

  const searchPayload = await searchResponse.json();
  latestQueryResponseText = JSON.stringify(searchPayload, null, 2);
  const person =
    searchPayload.results?.find(
      (result) => normalizeName(result.name ?? "") === normalizeName(personName),
    ) ?? searchPayload.results?.[0];

  if (!person) {
    alert(`No TMDb person found for ${personName}`);
    return null;
  }

  const creditsUrl = new URL(
    `https://api.themoviedb.org/3/person/${person.id}/movie_credits`,
  );
  creditsUrl.searchParams.set("api_key", apiKey);

  const creditsResponse = await fetch(creditsUrl.toString());
  if (!creditsResponse.ok) {
    throw new Error(`TMDb credits lookup failed: ${creditsResponse.status}`);
  }

  const creditsPayload = await creditsResponse.json();
  latestQueryResponseText = JSON.stringify(creditsPayload, null, 2);
  const personRecord = {
    id: person.id,
    name: person.name,
    nameLower: normalizeName(person.name),
    rawTmdbPerson: person,
    rawTmdbPersonSearchResponse: searchPayload,
    rawTmdbMovieCreditsResponse: creditsPayload,
    savedAt: new Date().toISOString(),
    domConnections: domFilmSnapshot
      ? [
          {
            title: domFilmSnapshot.title,
            year: domFilmSnapshot.year,
            role: Object.entries(domFilmSnapshot.peopleByRole).find(([, people]) =>
              people.includes(personName),
            )?.[0],
          },
        ].filter((connection) => connection.role)
      : [],
  };

  try {
    await savePersonRecord(personRecord);
  } catch (error) {
    alert(`Failed to save TMDb person response: ${error.message}`);
    throw error;
  }

  try {
    await saveFilmRecordsFromCredits(creditsPayload, domFilmSnapshot);
  } catch (error) {
    alert(`Failed to save TMDb film response: ${error.message}`);
    throw error;
  }

  return personRecord;
}

function chooseBestMovieSearchResult(results, movieName, preferredYear = "") {
  const normalizedMovieName = normalizeTitle(movieName);
  const exactTitleMatches = (results ?? []).filter(
    (result) => normalizeTitle(result.title ?? "") === normalizedMovieName,
  );

  if (preferredYear) {
    const exactYearMatch =
      exactTitleMatches.find(
        (result) => (result.release_date?.slice(0, 4) ?? "") === preferredYear,
      ) ??
      (results ?? []).find(
        (result) =>
          normalizeTitle(result.title ?? "") === normalizedMovieName &&
          (result.release_date?.slice(0, 4) ?? "") === preferredYear,
      );
    if (exactYearMatch) {
      return exactYearMatch;
    }
  }

  return exactTitleMatches[0] ?? results?.[0] ?? null;
}

async function fetchAndCacheMovie(movieName, domFilmSnapshot = null, preferredYear = "") {
  const apiKey = getTmdbApiKey();
  if (!apiKey) {
    return null;
  }

  const searchUrl = new URL("https://api.themoviedb.org/3/search/movie");
  searchUrl.searchParams.set("api_key", apiKey);
  searchUrl.searchParams.set("query", movieName);

  const searchResponse = await fetch(searchUrl.toString());
  if (!searchResponse.ok) {
    throw new Error(`TMDb movie search failed: ${searchResponse.status}`);
  }

  const searchPayload = await searchResponse.json();
  latestQueryResponseText = JSON.stringify(searchPayload, null, 2);
  const movie = chooseBestMovieSearchResult(
    searchPayload.results,
    movieName,
    preferredYear,
  );

  if (!movie) {
    alert(`No TMDb movie found for ${movieName}`);
    return null;
  }

  const database = await openIndexedDb();

  try {
    const transaction = database.transaction(FILMS_STORE_NAME, "readwrite");
    const store = transaction.objectStore(FILMS_STORE_NAME);
    const existingFilmRecord = await indexedDbRequestToPromise(store.get(movie.id));

    await indexedDbRequestToPromise(
      store.put({
        ...buildFilmRecord(existingFilmRecord ?? null, movie, domFilmSnapshot),
        rawTmdbMovieSearchResponse: searchPayload,
      }),
    );
    await transactionDonePromise(transaction);
  } catch (error) {
    alert(`Failed to save TMDb movie response: ${error.message}`);
    throw error;
  } finally {
    database.close();
  }

  return movie;
}

async function fetchAndCacheMovieCredits(movieRecord) {
  if (!movieRecord?.id) {
    return movieRecord ?? null;
  }

  const apiKey = getTmdbApiKey();
  if (!apiKey) {
    return movieRecord;
  }

  const creditsUrl = new URL(
    `https://api.themoviedb.org/3/movie/${movieRecord.id}/credits`,
  );
  creditsUrl.searchParams.set("api_key", apiKey);

  const creditsResponse = await fetch(creditsUrl.toString());
  if (!creditsResponse.ok) {
    throw new Error(`TMDb movie credits lookup failed: ${creditsResponse.status}`);
  }

  const creditsPayload = await creditsResponse.json();
  latestQueryResponseText = JSON.stringify(creditsPayload, null, 2);

  const database = await openIndexedDb();

  try {
    const transaction = database.transaction(FILMS_STORE_NAME, "readwrite");
    const store = transaction.objectStore(FILMS_STORE_NAME);
    const existingFilmRecord = await indexedDbRequestToPromise(store.get(movieRecord.id));
    const updatedFilmRecord = {
      ...(existingFilmRecord ?? movieRecord),
      rawTmdbMovieCreditsResponse: creditsPayload,
      tmdbCreditsSavedAt: new Date().toISOString(),
    };
    await indexedDbRequestToPromise(store.put(updatedFilmRecord));
    await transactionDonePromise(transaction);
    return updatedFilmRecord;
  } finally {
    database.close();
  }
}

function getPosterUrl(path, size = "w185") {
  if (!path) {
    return null;
  }

  return `https://image.tmdb.org/t/p/${size}${path}`;
}

function createCardTitle(text, secondaryText = "") {
  const wrapper = document.createElement("div");

  const title = document.createElement("div");
  title.textContent = text;
  title.style.fontSize = "15px";
  title.style.fontWeight = "700";
  title.style.lineHeight = "1.25";
  title.style.color = "#f8fafc";
  title.style.height = "2em";
  title.style.overflowY = "hidden";
  title.style.overflowX = "auto";
  title.style.whiteSpace = "nowrap";

  wrapper.appendChild(title);

  return wrapper;
}

function createPosterCard({ imageUrl, title, subtitle, footer = null }) {
  const card = document.createElement("div");
  card.style.flex = "0 0 216px";
  card.style.width = "216px";
  card.style.minWidth = "216px";
  card.style.maxWidth = "216px";
  card.style.display = "flex";
  card.style.flexDirection = "column";
  card.style.padding = "14px";
  card.style.border = "1px solid #243041";
  card.style.borderRadius = "14px";
  card.style.backgroundColor = "#111827";
  card.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.35)";
  card.style.height = "100%";
  card.style.boxSizing = "border-box";

  const imageFrame = document.createElement("div");
  imageFrame.style.height = "270px";
  imageFrame.style.borderRadius = "10px";
  imageFrame.style.overflow = "hidden";
  imageFrame.style.background =
    "linear-gradient(135deg, rgb(31, 41, 55), rgb(17, 24, 39))";
  imageFrame.style.display = "flex";
  imageFrame.style.alignItems = "center";
  imageFrame.style.justifyContent = "center";
  imageFrame.style.flex = "0 0 auto";

  if (imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = title;
    image.style.width = "100%";
    image.style.height = "100%";
    image.style.objectFit = "cover";
    imageFrame.appendChild(image);
  } else {
    const fallback = document.createElement("div");
    fallback.textContent = title;
    fallback.style.padding = "12px";
    fallback.style.textAlign = "center";
    fallback.style.fontSize = "13px";
    fallback.style.color = "#cbd5e1";
    imageFrame.appendChild(fallback);
  }

  card.appendChild(imageFrame);

  const content = document.createElement("div");
  content.style.display = "flex";
  content.style.flexDirection = "column";
  content.style.flex = "1";
  content.style.gap = "8px";
  content.style.paddingTop = "8px";

  content.appendChild(createCardTitle(title, subtitle));

  const spacer = document.createElement("div");
  spacer.style.flex = "1";
  content.appendChild(spacer);

  if (subtitle) {
    const secondary = document.createElement("div");
    secondary.textContent = subtitle;
    secondary.style.fontSize = "12px";
    secondary.style.color = "#94a3b8";
    secondary.style.lineHeight = "1.35";
    secondary.style.height = "2.7em";
    secondary.style.overflowX = "auto";
    secondary.style.overflowY = "hidden";
    content.appendChild(secondary);
  }

  if (footer) {
    content.appendChild(footer);
  }

  card.appendChild(content);
  return card;
}

function createChip(text) {
  const chip = document.createElement("div");
  chip.textContent = text;
  chip.style.padding = "8px 12px";
  chip.style.borderRadius = "999px";
  chip.style.backgroundColor = "#1f2937";
  chip.style.fontSize = "12px";
  chip.style.color = "#dbeafe";
  chip.style.whiteSpace = "nowrap";
  return chip;
}

function createRowSection(titleText) {
  const section = document.createElement("section");
  section.style.display = "flex";
  section.style.flexDirection = "column";

  const title = document.createElement("div");
  title.textContent = titleText;
  title.style.fontSize = "13px";
  title.style.fontWeight = "700";
  title.style.letterSpacing = "0.08em";
  title.style.textTransform = "uppercase";
  title.style.color = "#94a3b8";
  title.style.marginBottom = "12px";

  const body = document.createElement("div");

  section.appendChild(title);
  section.appendChild(body);

  return { section, title, body };
}

function createSourceBadge(sources) {
  const badge = document.createElement("div");
  badge.style.display = "inline-flex";
  badge.style.alignItems = "center";
  badge.style.gap = "4px";

  sources.forEach(({ iconUrl, label, opacity = "1", filter = "none" }) => {
    const icon = document.createElement("img");
    icon.src = iconUrl;
    icon.alt = label;
    icon.title = label;
    icon.style.width = "14px";
    icon.style.height = "14px";
    icon.style.borderRadius = "3px";
    icon.style.opacity = opacity;
    icon.style.filter = filter;
    badge.appendChild(icon);
  });
  return badge;
}

function createStatusChip(text, tone = "info") {
  const chip = document.createElement("div");
  chip.textContent = text;
  chip.style.padding = "6px 8px";
  chip.style.borderRadius = "999px";
  chip.style.fontSize = "11px";
  chip.style.fontWeight = "600";
  chip.style.whiteSpace = "nowrap";

  if (tone === "danger") {
    chip.style.backgroundColor = "#3f1d1d";
    chip.style.color = "#fecaca";
    return chip;
  }

  if (tone === "success") {
    chip.style.backgroundColor = "#163223";
    chip.style.color = "#bbf7d0";
    return chip;
  }

  chip.style.backgroundColor = "#172033";
  chip.style.color = "#bfdbfe";
  return chip;
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createHeatMetricChip(label, value, maxValue) {
  const normalizedValue =
    typeof value === "number" && Number.isFinite(value)
      ? clampNumber(value / maxValue, 0, 1)
      : 0;
  const hue = 210 - normalizedValue * 210;
  const bgLightness = 20 + normalizedValue * 12;
  const borderLightness = 34 + normalizedValue * 18;

  const chip = document.createElement("div");
  chip.textContent = `${label} ${value}`;
  chip.style.padding = "6px 8px";
  chip.style.borderRadius = "999px";
  chip.style.fontSize = "11px";
  chip.style.fontWeight = "600";
  chip.style.whiteSpace = "nowrap";
  chip.style.backgroundColor = `hsl(${hue} 55% ${bgLightness}%)`;
  chip.style.border = `1px solid hsl(${hue} 70% ${borderLightness}%)`;
  chip.style.color = "#eff6ff";
  return chip;
}

function createMetricRow(metrics) {
  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.flexWrap = "wrap";
  row.style.gap = "8px";

  metrics.filter(Boolean).forEach((metric) => {
    const chip = document.createElement("div");
    chip.textContent = metric;
    chip.style.padding = "6px 8px";
    chip.style.borderRadius = "999px";
    chip.style.backgroundColor = "#172033";
    chip.style.color = "#bfdbfe";
    chip.style.fontSize = "11px";
    row.appendChild(chip);
  });

  return row;
}

function createMovieMetaBlock({
  popularity,
  voteAverage,
  voteCount,
  sources = [],
  status = null,
}) {
  const block = document.createElement("div");
  block.style.display = "flex";
  block.style.flexDirection = "column";
  block.style.gap = "4px";

  const sharedTextColor = "#94a3b8";
  const sharedFontSize = "11px";

  const topRow = document.createElement("div");
  topRow.style.display = "flex";
  topRow.style.alignItems = "center";
  topRow.style.justifyContent = "space-between";
  topRow.style.gap = "8px";

  if (sources.length > 0) {
    topRow.appendChild(createSourceBadge(sources));
  }

  if (typeof popularity === "number") {
    const popularityChip = createHeatMetricChip("Popularity", popularity, 100);
    popularityChip.style.marginLeft = "auto";
    topRow.appendChild(popularityChip);
  }

  if (topRow.childNodes.length > 0) {
    block.appendChild(topRow);
  }

  const bottomRow = document.createElement("div");
  bottomRow.style.display = "flex";
  bottomRow.style.alignItems = "center";
  bottomRow.style.flexWrap = "nowrap";
  bottomRow.style.gap = "8px";
  bottomRow.style.fontSize = sharedFontSize;
  bottomRow.style.color = sharedTextColor;
  bottomRow.style.overflowX = "auto";
  bottomRow.style.overflowY = "hidden";
  bottomRow.style.whiteSpace = "nowrap";

  if (typeof voteCount === "number") {
    bottomRow.appendChild(createHeatMetricChip("Votes", voteCount, 20000));
  }

  if (typeof voteAverage === "number") {
    const ratingChip = createHeatMetricChip("Rating", voteAverage, 10);
    ratingChip.style.marginLeft = bottomRow.childNodes.length > 0 ? "auto" : "";
    bottomRow.appendChild(ratingChip);
  }

  if (status?.text) {
    bottomRow.appendChild(createStatusChip(status.text, status.tone));
  }

  if (bottomRow.childNodes.length > 0) {
    block.appendChild(bottomRow);
  }

  return block;
}

function createPersonImage(personRecord) {
  const rawPerson =
    personRecord?.rawTmdbPerson ??
    personRecord?.rawTmdbPersonSearchResponse?.results?.find(
      (candidate) => normalizeName(candidate.name ?? "") === personRecord?.nameLower,
    );
  const imageUrl = getPosterUrl(rawPerson?.profile_path, "w300_and_h450_face");

  if (!imageUrl) {
    return null;
  }

  const image = document.createElement("img");
  image.src = imageUrl;
  image.alt = personRecord?.name ?? "Person";
  image.style.width = "180px";
  image.style.maxWidth = "100%";
  image.style.borderRadius = "18px";
  image.style.border = "1px solid #243041";
  image.style.boxShadow = "0 18px 40px rgba(0, 0, 0, 0.35)";
  return image;
}

function getPersonProfileImageUrl(personRecord) {
  const rawPerson =
    personRecord?.rawTmdbPerson ??
    personRecord?.rawTmdbPersonSearchResponse?.results?.find(
      (candidate) => normalizeName(candidate.name ?? "") === personRecord?.nameLower,
  );
  return getPosterUrl(rawPerson?.profile_path, "w300_and_h450_face");
}

function buildAssociationPresentation(personRecord, movieKey, filmRecord = null) {
  const tmdbCredit = getTmdbCreditForMovie(personRecord, movieKey);
  const cinenerdleRole =
    getDomConnectionForMovie(personRecord, movieKey)?.role ??
    getCinenerdleRoleFromSnapshot(filmRecord?.domSnapshot, personRecord?.name);
  const cinenerdleLoaded = !!filmRecord?.domSnapshot;
  const missingFromCinenerdle = cinenerdleLoaded && !!tmdbCredit && !cinenerdleRole;
  const sources = [];

  if (tmdbCredit) {
    sources.push({ iconUrl: TMDB_ICON_URL, label: "TMDb" });
  }

  if (cinenerdleRole) {
    sources.push({
      iconUrl: CINENERDLE_ICON_URL,
      label: cinenerdleRole,
    });
  } else if (cinenerdleLoaded) {
    sources.push({
      iconUrl: CINENERDLE_ICON_URL,
      label: "Cinenerdle loaded for parent, not associated here",
      filter: "grayscale(1)",
      opacity: "0.9",
    });
  }

  return {
    tmdbCredit,
    cinenerdleRole,
    cinenerdleLoaded,
    missingFromCinenerdle,
    sources,
    status: null,
  };
}

function createPersonCreditsCards(personRecord, filmRecordsById) {
  return getUniqueSortedTmdbMovieCredits(personRecord).map((credit) => {
      const filmRecord = filmRecordsById.get(credit.id);
      const association = buildAssociationPresentation(
        personRecord,
        getMovieKeyFromCredit(credit),
        filmRecord,
      );

      const card = createPosterCard({
        imageUrl: getPosterUrl(credit.poster_path),
        title: credit.title ?? "Untitled",
        subtitle: `${credit.creditType.toUpperCase()}${credit.release_date ? ` • ${credit.release_date.slice(0, 4)}` : ""}`,
        footer: createMovieMetaBlock({
          popularity: credit.popularity,
          voteAverage: credit.vote_average,
          voteCount: credit.vote_count,
          sources: association.sources,
          status: association.status,
        }),
      });
      return card;
    });
}

function createAssociatedPeopleCards(
  personRecords,
  { movieKey, filmRecord = null, selectedPersonId = null, selectedPersonName = "" },
) {
  const cards = [];
  const seenNames = new Set();

  personRecords
    .filter((personRecord) => personRecord?.id !== selectedPersonId)
    .forEach((personRecord) => {
      const association = buildAssociationPresentation(personRecord, movieKey, filmRecord);
      const personName = personRecord.name ?? "Unknown";
      const normalizedPersonName = normalizeName(personName);
      if (normalizedPersonName === normalizeName(selectedPersonName)) {
        return;
      }

      const subtitleParts = [
        association.tmdbCredit ? getTmdbCreditCategoryText(association.tmdbCredit) : "",
      ].filter(Boolean);

      cards.push(
        createPosterCard({
          imageUrl: getPersonProfileImageUrl(personRecord),
          title: personName,
          subtitle: subtitleParts.join(" • "),
          footer: createMovieMetaBlock({
            popularity: association.tmdbCredit?.popularity,
            voteAverage: association.tmdbCredit?.vote_average,
            voteCount: association.tmdbCredit?.vote_count,
            sources: association.sources,
            status: association.status,
          }),
        }),
      );
      seenNames.add(normalizedPersonName);
    });

  Object.entries(filmRecord?.domSnapshot?.peopleByRole ?? {}).forEach(([role, people]) => {
    people.forEach((personName) => {
      const normalizedPersonName = normalizeName(personName);
      if (
        normalizedPersonName === normalizeName(selectedPersonName) ||
        seenNames.has(normalizedPersonName)
      ) {
        return;
      }

      cards.push(
        createPosterCard({
          imageUrl: null,
          title: personName,
          subtitle: role,
          footer: createMovieMetaBlock({
            sources: [
              {
                iconUrl: CINENERDLE_ICON_URL,
                label: `Cinenerdle: ${role}`,
              },
            ],
            status: { text: "Cinenerdle only", tone: "success" },
          }),
        }),
      );
      seenNames.add(normalizedPersonName);
    });
  });

  return cards;
}

function getAssociatedPeopleFromMovieCredits(filmRecord) {
  const credits = filmRecord?.rawTmdbMovieCreditsResponse ?? {};
  const seenNames = new Set();

  return [
    ...(credits.cast ?? []).map((credit) => ({ ...credit, creditType: "cast" })),
    ...(credits.crew ?? []).map((credit) => ({ ...credit, creditType: "crew" })),
  ].filter((credit) => {
    const personName = credit?.name?.trim();
    if (!personName) {
      return false;
    }

    const normalizedPersonName = normalizeName(personName);
    if (seenNames.has(normalizedPersonName)) {
      return false;
    }

    seenNames.add(normalizedPersonName);
    return true;
  });
}

function createAssociatedPeopleCardsFromMovieCredits(
  credits,
  { filmRecord = null, selectedPersonName = "" },
) {
  const cards = [];
  const seenNames = new Set();

  credits.forEach((credit) => {
    const personName = credit?.name?.trim();
    if (!personName) {
      return;
    }

    const normalizedPersonName = normalizeName(personName);
    if (
      normalizedPersonName === normalizeName(selectedPersonName) ||
      seenNames.has(normalizedPersonName)
    ) {
      return;
    }

    const cinenerdleRole = getCinenerdleRoleFromSnapshot(
      filmRecord?.domSnapshot,
      personName,
    );
    const missingFromCinenerdle = !!filmRecord?.domSnapshot && !cinenerdleRole;
    const subtitleParts = [
      getTmdbCreditCategoryText(credit),
      cinenerdleRole ? `Cinenerdle: ${cinenerdleRole}` : "",
    ].filter(Boolean);

    cards.push(
      createPosterCard({
        imageUrl: getPosterUrl(credit.profile_path, "w300_and_h450_face"),
        title: personName,
        subtitle: subtitleParts.join(" • "),
        footer: createMovieMetaBlock({
          popularity: credit.popularity,
          sources: [
            { iconUrl: TMDB_ICON_URL, label: "TMDb" },
            ...(cinenerdleRole
              ? [
                  {
                    iconUrl: CINENERDLE_ICON_URL,
                    label: `Cinenerdle: ${cinenerdleRole}`,
                  },
                ]
              : []),
          ],
          status: missingFromCinenerdle
            ? { text: "Missing on Cinenerdle", tone: "danger" }
            : null,
        }),
      }),
    );
    seenNames.add(normalizedPersonName);
  });

  Object.entries(filmRecord?.domSnapshot?.peopleByRole ?? {}).forEach(([role, people]) => {
    people.forEach((personName) => {
      const normalizedPersonName = normalizeName(personName);
      if (
        normalizedPersonName === normalizeName(selectedPersonName) ||
        seenNames.has(normalizedPersonName)
      ) {
        return;
      }

      cards.push(
        createPosterCard({
          imageUrl: null,
          title: personName,
          subtitle: role,
          footer: createMovieMetaBlock({
            sources: [
              {
                iconUrl: CINENERDLE_ICON_URL,
                label: `Cinenerdle: ${role}`,
              },
            ],
            status: { text: "Cinenerdle only", tone: "success" },
          }),
        }),
      );
      seenNames.add(normalizedPersonName);
    });
  });

  return cards;
}

function createMoviePeopleCards(movieRecord) {
  const peopleByRole = movieRecord?.domSnapshot?.peopleByRole ?? {};
  return Object.entries(peopleByRole).flatMap(([role, people]) =>
    people.map((personName) =>
      createPosterCard({
        imageUrl: null,
        title: personName,
        subtitle: role,
      }),
    ),
  );
}

function createProfileDetailCard(titleText) {
  const card = document.createElement("div");
  card.style.display = "flex";
  card.style.flexDirection = "column";
  card.style.gap = "16px";
  card.style.padding = "24px";
  card.style.border = "1px solid #243041";
  card.style.borderRadius = "18px";
  card.style.backgroundColor = "#0f172a";
  card.style.boxShadow = "0 18px 40px rgba(0, 0, 0, 0.35)";

  const title = document.createElement("div");
  title.textContent = titleText;
  title.style.fontSize = "32px";
  title.style.fontWeight = "800";
  title.style.lineHeight = "1.1";
  title.style.color = "#f8fafc";

  card.appendChild(title);
  return card;
}

function createPathNode(kind, name, year = "") {
  return {
    kind,
    name: name?.trim() ?? "",
    year: year?.trim() ?? "",
  };
}

function parseMoviePathLabel(label) {
  const match = label.match(/^(.*) \((\d{4})\)$/);
  if (!match) {
    return createPathNode("movie", label, "");
  }

  return createPathNode("movie", match[1].trim(), match[2]);
}

function parseGenericExtensionValue(value) {
  const segments = value
    .split("|")
    .map((segment) => segment.trim())
    .filter(Boolean);
  if (segments.length === 0) {
    return [];
  }

  const firstSegment = segments[0];
  const separatorIndex = firstSegment.indexOf(":");
  if (separatorIndex === -1) {
    return [];
  }

  const rootKind = firstSegment.slice(0, separatorIndex).trim();
  const rootValue = decodeURIComponent(
    firstSegment.slice(separatorIndex + 1).trim().replaceAll("+", "%20"),
  );
  if (!rootKind || !rootValue) {
    return [];
  }

  const pathNodes = [
    rootKind === "movie"
      ? parseMoviePathLabel(rootValue)
      : createPathNode(rootKind, rootValue),
  ];

  let nextKind = rootKind === "person" ? "movie" : "person";
  segments.slice(1).forEach((segment) => {
    const decodedValue = decodeURIComponent(segment.replaceAll("+", "%20"));
    if (!decodedValue) {
      return;
    }

    pathNodes.push(
      nextKind === "movie"
        ? parseMoviePathLabel(decodedValue)
        : createPathNode("person", decodedValue),
    );
    nextKind = nextKind === "person" ? "movie" : "person";
  });

  return pathNodes;
}

function formatMoviePathLabel(name, year = "") {
  return year ? `${name} (${year})` : name;
}

function getPathNodeLabel(pathNode) {
  if (pathNode.kind === "movie") {
    return formatMoviePathLabel(pathNode.name, pathNode.year);
  }

  return pathNode.name;
}

function serializePathNode(pathNode) {
  return getPathNodeLabel(pathNode).trim().replace(/\s+/g, "+");
}

function serializeGenericExtensionPath(pathNodes) {
  if (pathNodes.length === 0) {
    return "";
  }

  const [rootNode, ...remainingNodes] = pathNodes;
  return [
    `${rootNode.kind}:${serializePathNode(rootNode)}`,
    ...remainingNodes.map(serializePathNode),
  ].join("|");
}

function buildGenericExtensionUrlFromPath(pathNodes) {
  return `https://www.cinenerdle2.app/icon.png?generic_extension=${serializeGenericExtensionPath(pathNodes)}`;
}

function getGenericExtensionUrl(kind, name, year = "") {
  return buildGenericExtensionUrlFromPath([createPathNode(kind, name, year)]);
}

function openGenericExtensionPage(kind, name, year = "") {
  return window.open(getGenericExtensionUrl(kind, name, year), "_blank");
}

function getMovieRecordYear(movieRecord) {
  return (
    movieRecord?.year ??
    movieRecord?.rawTmdbMovie?.release_date?.slice(0, 4) ??
    movieRecord?.rawTmdbMovieSearchResponse?.results?.find(
      (candidate) => normalizeTitle(candidate.title ?? "") === normalizeTitle(movieRecord?.title ?? ""),
    )?.release_date?.slice(0, 4) ??
    ""
  );
}

function getMoviePosterUrl(movieRecord) {
  return getPosterUrl(
    movieRecord?.rawTmdbMovie?.poster_path ??
      movieRecord?.rawTmdbMovieSearchResponse?.results?.find(
        (candidate) => normalizeTitle(candidate.title ?? "") === normalizeTitle(movieRecord?.title ?? ""),
      )?.poster_path,
  );
}

function getMovieCardKey(name, year = "", id = "") {
  return `movie:${id || getFilmKey(name, year)}`;
}

function getPersonCardKey(name, id = "") {
  return `person:${id || normalizeName(name)}`;
}

function getPathNodeFromCard(card) {
  return createPathNode(card.kind, card.name, card.kind === "movie" ? card.year : "");
}

function matchesPathNode(card, pathNode) {
  if (!card || !pathNode || card.kind !== pathNode.kind) {
    return false;
  }

  if (pathNode.kind === "movie") {
    return (
      normalizeTitle(card.name) === normalizeTitle(pathNode.name) &&
      (!pathNode.year || card.year === pathNode.year)
    );
  }

  return normalizeName(card.name) === normalizeName(pathNode.name);
}

function getSelectedCard(row) {
  return row?.cards?.find((card) => card.key === row.selectedCardKey) ?? null;
}

function getVisibleGenericExtensionRows(rootRow) {
  const rows = [];
  let currentRow = rootRow;

  while (currentRow) {
    rows.push(currentRow);
    const selectedCard = getSelectedCard(currentRow);
    currentRow = selectedCard?.childRow ?? null;
  }

  return rows;
}

function collectSelectedPathNodes(rootRow) {
  const pathNodes = [];
  let currentRow = rootRow;

  while (currentRow) {
    const selectedCard = getSelectedCard(currentRow);
    if (!selectedCard) {
      break;
    }

    pathNodes.push(getPathNodeFromCard(selectedCard));
    currentRow = selectedCard.childRow ?? null;
  }

  return pathNodes;
}

function getGenericExtensionEntryUrl() {
  const match = location.href.match(/[?&]generic_extension=([^&#]*)/);
  return match?.[1]?.trim() ?? "";
}

function updateGenericExtensionHistory(rootRow, mode = "push") {
  const serializedPath = serializeGenericExtensionPath(collectSelectedPathNodes(rootRow));
  const nextUrl = `${window.location.origin}${window.location.pathname}?generic_extension=${serializedPath}`;

  if (mode === "replace") {
    window.history.replaceState({}, "", nextUrl);
    return;
  }

  window.history.pushState({}, "", nextUrl);
}

async function ensurePersonRecordByName(personName) {
  let personRecord = await getPersonRecordByName(personName);

  if (!personRecord || !personRecord.rawTmdbMovieCreditsResponse) {
    personRecord = await fetchAndCachePerson(personName);
  }

  return personRecord;
}

async function getFilmRecordByTitleAndYear(title, year = "") {
  return (
    (await getFilmRecordsByTitle(title)).find(
      (record) =>
        normalizeTitle(record.title) === normalizeTitle(title) &&
        (!year || record.year === year),
    ) ?? null
  );
}

async function ensureMovieRecordByPathNode(pathNode) {
  let movieRecord = await getFilmRecordByTitleAndYear(pathNode.name, pathNode.year);

  if (!movieRecord) {
    movieRecord = await fetchAndCacheMovie(pathNode.name, null, pathNode.year);
  }

  return movieRecord;
}

async function ensureMovieRecordForCard(card) {
  if (card?.record?.id) {
    return (await getFilmRecordById(card.record.id)) ?? card.record;
  }

  return ensureMovieRecordByPathNode(getPathNodeFromCard(card));
}

async function ensureMovieCreditsRecord(movieRecord) {
  if (!movieRecord) {
    return null;
  }

  return movieRecord.rawTmdbMovieCreditsResponse
    ? movieRecord
    : fetchAndCacheMovieCredits(movieRecord);
}

function createMovieCardRecordFromCredit(credit) {
  const title = getMovieTitleFromCredit(credit);
  const year = getMovieYearFromCredit(credit);

  return {
    id: credit.id,
    title,
    titleLower: normalizeTitle(title),
    year,
    titleYear: getFilmKey(title, year),
    popularity: credit.popularity ?? 0,
    rawTmdbMovie: credit,
  };
}

function createPersonRootCard(personRecord, requestedName) {
  const personName = personRecord?.name ?? requestedName;
  const cinenerdleConnectionsCount = personRecord?.domConnections?.length ?? 0;

  return {
    key: getPersonCardKey(personName, personRecord?.id),
    kind: "person",
    name: personName,
    subtitle: "Person",
    imageUrl: getPersonProfileImageUrl(personRecord),
    metrics: [
      `TMDb ID: ${personRecord?.id ?? "unknown"}`,
      `Cinenerdle links: ${cinenerdleConnectionsCount}`,
    ],
    record: personRecord,
    childRow: null,
  };
}

function createMovieRootCard(movieRecord, requestedName) {
  const movieTitle = movieRecord?.title ?? requestedName;
  const movieYear = getMovieRecordYear(movieRecord);
  const sources = [];

  if (movieRecord?.rawTmdbMovie || movieRecord?.rawTmdbMovieSearchResponse) {
    sources.push({ iconUrl: TMDB_ICON_URL, label: "TMDb" });
  }

  if (movieRecord?.domSnapshot) {
    sources.push({ iconUrl: CINENERDLE_ICON_URL, label: "Cinenerdle" });
  }

  return {
    key: getMovieCardKey(movieTitle, movieYear, movieRecord?.id),
    kind: "movie",
    name: movieTitle,
    year: movieYear,
    subtitle: movieYear || "Movie",
    imageUrl: getMoviePosterUrl(movieRecord),
    popularity: movieRecord?.popularity,
    voteAverage: movieRecord?.rawTmdbMovie?.vote_average,
    voteCount: movieRecord?.rawTmdbMovie?.vote_count,
    sources,
    status: null,
    record: movieRecord,
    childRow: null,
  };
}

function createMovieAssociationCard(personRecord, credit, filmRecord = null) {
  const title = getMovieTitleFromCredit(credit);
  const year = getMovieYearFromCredit(credit);
  const movieRecord = filmRecord ?? createMovieCardRecordFromCredit(credit);
  const association = buildAssociationPresentation(
    personRecord,
    getMovieKeyFromCredit(credit),
    filmRecord,
  );

  return {
    key: getMovieCardKey(title, year, credit.id),
    kind: "movie",
    name: title,
    year,
    subtitle: `${credit.creditType.toUpperCase()}${year ? ` • ${year}` : ""}`,
    imageUrl: getPosterUrl(credit.poster_path),
    popularity: credit.popularity,
    voteAverage: credit.vote_average,
    voteCount: credit.vote_count,
    sources: association.sources,
    status: association.status,
    record: movieRecord,
    childRow: null,
  };
}

function createPersonAssociationCard(credit, movieRecord, cachedPersonRecord = null) {
  const personName = cachedPersonRecord?.name ?? credit?.name?.trim() ?? "Unknown";
  const cinenerdleRole = getCinenerdleRoleFromSnapshot(movieRecord?.domSnapshot, personName);
  const missingFromCinenerdle = !!movieRecord?.domSnapshot && !!credit && !cinenerdleRole;
  const sources = [{ iconUrl: TMDB_ICON_URL, label: "TMDb" }];

  if (cinenerdleRole) {
    sources.push({
      iconUrl: CINENERDLE_ICON_URL,
      label: cinenerdleRole,
    });
  } else if (movieRecord?.domSnapshot) {
    sources.push({
      iconUrl: CINENERDLE_ICON_URL,
      label: "Cinenerdle loaded for parent, not associated here",
      filter: "grayscale(1)",
      opacity: "0.9",
    });
  }

  return {
    key: getPersonCardKey(personName, cachedPersonRecord?.id ?? credit?.id),
    kind: "person",
    name: personName,
    subtitle: [
      getTmdbCreditCategoryText(credit),
    ]
      .filter(Boolean)
      .join(" • "),
    imageUrl:
      getPersonProfileImageUrl(cachedPersonRecord) ??
      getPosterUrl(credit?.profile_path, "w300_and_h450_face"),
    popularity: credit?.popularity,
    sources,
    status: null,
    record: cachedPersonRecord ?? null,
    childRow: null,
  };
}

function createCinenerdleOnlyPersonCard(personName, role) {
  return {
    key: getPersonCardKey(personName),
    kind: "person",
    name: personName,
    subtitle: role,
    imageUrl: null,
    sources: [
      {
        iconUrl: CINENERDLE_ICON_URL,
        label: role,
      },
    ],
    status: { text: "Cinenerdle only", tone: "success" },
    record: null,
    childRow: null,
  };
}

function createStackCardFooter(card) {
  if (card.metrics?.length) {
    return createMetricRow(card.metrics);
  }

  if (
    card.sources?.length ||
    typeof card.popularity === "number" ||
    typeof card.voteAverage === "number" ||
    typeof card.voteCount === "number" ||
    card.status?.text
  ) {
    return createMovieMetaBlock({
      popularity: card.popularity,
      voteAverage: card.voteAverage,
      voteCount: card.voteCount,
      sources: card.sources,
      status: card.status,
    });
  }

  return null;
}

function applyStackCardSelectionStyle(cardElement, isSelected, isLocked = false) {
  cardElement.style.transition = "box-shadow 120ms ease, border-color 120ms ease";
  cardElement.style.borderColor = isSelected ? "#fbbf24" : "#243041";
  cardElement.style.boxShadow = isSelected
    ? "0 18px 40px rgba(251, 191, 36, 0.18)"
    : "0 8px 24px rgba(0, 0, 0, 0.35)";
  cardElement.style.transform = "";
  if (isLocked) {
    cardElement.style.outline = "1px solid rgba(251, 191, 36, 0.5)";
    cardElement.style.outlineOffset = "2px";
  }
}

function createGenericExtensionCardElement(
  card,
  { isSelected = false, isLocked = false, onSelect = null } = {},
) {
  const cardElement = createPosterCard({
    imageUrl: card.imageUrl,
    title: card.name,
    subtitle: card.subtitle,
    footer: createStackCardFooter(card),
  });

  applyStackCardSelectionStyle(cardElement, isSelected, isLocked);
  cardElement.style.cursor = onSelect ? "pointer" : isLocked ? "default" : "pointer";

  if (onSelect) {
    cardElement.addEventListener("click", onSelect);
  }

  return cardElement;
}

function createGenericExtensionRowElement(row, rootRow) {
  const sectionRow = createRowSection(row.title);
  sectionRow.title.style.display = "none";
  sectionRow.body.style.display = "flex";
  sectionRow.body.style.alignItems = "flex-start";
  sectionRow.body.style.gap = "14px";
  sectionRow.body.style.overflowX = "auto";
  sectionRow.body.style.overflowY = "hidden";
  sectionRow.body.style.paddingBottom = "8px";

  if ((row.cards ?? []).length === 0) {
    sectionRow.body.appendChild(createChip("No associated items found"));
    return sectionRow.section;
  }

  row.cards.forEach((card) => {
    sectionRow.body.appendChild(
      createGenericExtensionCardElement(card, {
        isSelected: row.selectedCardKey === card.key,
        isLocked: row.isRoot,
        onSelect:
          row.isRoot
            ? null
            : () => {
                selectGenericExtensionCard(rootRow, row, card).catch((error) => {
                  console.error("cinenerdle2.selectGenericExtensionCard", error);
                  alert(error.message);
                });
              },
      }),
    );
  });

  return sectionRow.section;
}

function getCurrentGenericExtensionTitle(rootRow) {
  const visibleRows = getVisibleGenericExtensionRows(rootRow);
  for (let index = visibleRows.length - 1; index >= 0; index -= 1) {
    const selectedCard = getSelectedCard(visibleRows[index]);
    if (selectedCard) {
      return selectedCard.name;
    }
  }

  return "cinenerdle2";
}

function renderGenericExtensionStack(rootRow) {
  document.body.style.margin = "0";
  document.body.style.background =
    "linear-gradient(180deg, #020617 0%, #0f172a 100%)";
  document.body.style.color = "#f8fafc";
  document.body.style.fontFamily =
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  document.title = `${getCurrentGenericExtensionTitle(rootRow)} | cinenerdle2`;

  const appRoot = document.createElement("div");
  appRoot.style.display = "flex";
  appRoot.style.flexDirection = "column";
  appRoot.style.gap = "20px";
  appRoot.style.minHeight = "100vh";
  appRoot.style.padding = "24px";
  appRoot.style.boxSizing = "border-box";

  getVisibleGenericExtensionRows(rootRow)
    .slice()
    .reverse()
    .forEach((row) => {
      appRoot.appendChild(createGenericExtensionRowElement(row, rootRow));
    });

  document.body.replaceChildren(appRoot);
}

async function buildMovieRowForPersonCard(card) {
  const personRecord = await ensurePersonRecordByName(card.name);
  card.record = personRecord;

  const movieCredits = getUniqueSortedTmdbMovieCredits(personRecord);
  const filmRecordsById = await getFilmRecordsByIds(movieCredits.map((credit) => credit.id));

  return {
    title: "Movies",
    entityType: "movie",
    selectedCardKey: null,
    isRoot: false,
    cards: movieCredits.map((credit) =>
      createMovieAssociationCard(personRecord, credit, filmRecordsById.get(credit.id) ?? null),
    ),
  };
}

async function buildPersonRowForMovieCard(card) {
  const movieRecord = await ensureMovieCreditsRecord(await ensureMovieRecordForCard(card));
  card.record = movieRecord;

  const tmdbCredits = getAssociatedPeopleFromMovieCredits(movieRecord);
  const cachedPersonRecords = await Promise.all(
    tmdbCredits.map((credit) => getPersonRecordByName(credit.name ?? "")),
  );

  const cards = tmdbCredits.map((credit, index) =>
    createPersonAssociationCard(credit, movieRecord, cachedPersonRecords[index] ?? null),
  );

  const seenPersonNames = new Set(cards.map((personCard) => normalizeName(personCard.name)));
  Object.entries(movieRecord?.domSnapshot?.peopleByRole ?? {}).forEach(([role, people]) => {
    people.forEach((personName) => {
      const normalizedPersonName = normalizeName(personName);
      if (seenPersonNames.has(normalizedPersonName)) {
        return;
      }

      cards.push(createCinenerdleOnlyPersonCard(personName, role));
      seenPersonNames.add(normalizedPersonName);
    });
  });

  return {
    title: "People",
    entityType: "person",
    selectedCardKey: null,
    isRoot: false,
    cards,
  };
}

async function buildChildRowForCard(card) {
  if (card.kind === "person") {
    return buildMovieRowForPersonCard(card);
  }

  if (card.kind === "movie") {
    return buildPersonRowForMovieCard(card);
  }

  return null;
}

async function selectGenericExtensionCard(rootRow, row, card, historyMode = "push") {
  if (!row || !card || row.selectedCardKey === card.key) {
    return;
  }

  row.selectedCardKey = card.key;
  if (!card.childRow) {
    card.childRow = await buildChildRowForCard(card);
  }

  renderGenericExtensionStack(rootRow);
  updateGenericExtensionHistory(rootRow, historyMode);
}

async function createRootRowFromPathNode(pathNode) {
  if (pathNode.kind === "person") {
    const personRecord = await ensurePersonRecordByName(pathNode.name);
    const rootCard = createPersonRootCard(personRecord, pathNode.name);
    return {
      title: "Person",
      entityType: "person",
      selectedCardKey: rootCard.key,
      isRoot: true,
      cards: [rootCard],
    };
  }

  if (pathNode.kind === "movie") {
    const movieRecord = await ensureMovieRecordByPathNode(pathNode);
    const rootCard = createMovieRootCard(movieRecord, pathNode.name);
    return {
      title: "Movie",
      entityType: "movie",
      selectedCardKey: rootCard.key,
      isRoot: true,
      cards: [rootCard],
    };
  }

  return null;
}

async function ensureVisibleChildRow(row) {
  const selectedCard = getSelectedCard(row);
  if (!selectedCard) {
    return null;
  }

  if (!selectedCard.childRow) {
    selectedCard.childRow = await buildChildRowForCard(selectedCard);
  }

  return selectedCard.childRow;
}

async function applyPathToRootRow(rootRow, pathNodes) {
  let currentRow = rootRow;
  let currentChildRow = await ensureVisibleChildRow(currentRow);

  for (let index = 1; index < pathNodes.length; index += 1) {
    if (!currentChildRow) {
      return;
    }

    const matchingCard =
      currentChildRow.cards.find((card) => matchesPathNode(card, pathNodes[index])) ?? null;
    if (!matchingCard) {
      currentChildRow.selectedCardKey = null;
      return;
    }

    currentChildRow.selectedCardKey = matchingCard.key;
    currentRow = currentChildRow;
    currentChildRow = await ensureVisibleChildRow(currentRow);
  }

  if (currentChildRow) {
    currentChildRow.selectedCardKey = null;
  }
}

function sameRootPathNode(left, right) {
  return !!left && !!right && matchesPathNode({ ...left, key: "root" }, right);
}

async function buildGenericExtensionRootRow(pathNodes) {
  if (pathNodes.length === 0) {
    return null;
  }

  if (
    genericExtensionRootRow &&
    sameRootPathNode(getPathNodeFromCard(getSelectedCard(genericExtensionRootRow)), pathNodes[0])
  ) {
    return genericExtensionRootRow;
  }

  return createRootRowFromPathNode(pathNodes[0]);
}

async function maybeShowGenericExtensionEntry(historyMode = "replace") {
  const genericExtensionValue = getGenericExtensionEntryUrl();
  if (!genericExtensionValue) {
    return false;
  }

  const pathNodes = parseGenericExtensionValue(genericExtensionValue);
  if (pathNodes.length === 0) {
    return false;
  }

  const rootRow = await buildGenericExtensionRootRow(pathNodes);
  if (!rootRow) {
    return false;
  }

  genericExtensionRootRow = rootRow;
  await applyPathToRootRow(genericExtensionRootRow, pathNodes);
  renderGenericExtensionStack(genericExtensionRootRow);
  updateGenericExtensionHistory(genericExtensionRootRow, historyMode);

  if (!genericExtensionPopstateBound) {
    window.addEventListener("popstate", () => {
      maybeShowGenericExtensionEntry("replace").catch((error) => {
        console.error("cinenerdle2.popstate", error);
        alert(error.message);
      });
    });
    genericExtensionPopstateBound = true;
  }

  return true;
}

async function handlePersonClick(personName, sourceElement, targetWindow = null) {
  const domFilmSnapshot = parseDomFilmSnapshotFromElement(sourceElement);
  let personRecord = await getPersonRecordByName(personName);

  if (!personRecord) {
    personRecord = await fetchAndCachePerson(personName, domFilmSnapshot);
  } else {
    await syncDomSnapshotToCachedRecords(domFilmSnapshot);
  }

  if (!personRecord) {
    return;
  }

  const targetUrl = getGenericExtensionUrl("person", personName);
  if (targetWindow) {
    targetWindow.location.href = targetUrl;
    return;
  }

  openGenericExtensionPage("person", personName);
}

async function handleMovieClick(movieTitle, sourceElement, targetWindow = null) {
  const domFilmSnapshot = parseDomFilmSnapshotFromElement(sourceElement);
  const existingMovieRecord =
    (await getFilmRecordsByTitle(movieTitle)).find(
      (record) => normalizeTitle(record.title) === normalizeTitle(movieTitle),
    ) ?? null;

  if (existingMovieRecord) {
    await syncDomSnapshotToCachedRecords(domFilmSnapshot);
  } else {
    await fetchAndCacheMovie(movieTitle, domFilmSnapshot, domFilmSnapshot?.year ?? "");
  }

  const targetUrl = getGenericExtensionUrl(
    "movie",
    movieTitle,
    existingMovieRecord?.year ?? domFilmSnapshot?.year ?? "",
  );
  if (targetWindow) {
    targetWindow.location.href = targetUrl;
    return;
  }

  openGenericExtensionPage(
    "movie",
    movieTitle,
    existingMovieRecord?.year ?? domFilmSnapshot?.year ?? "",
  );
}

function applyLoadedStyle(element, existsInDb) {
  element.style.cursor = "pointer";
  element.style.textDecoration = existsInDb ? "none" : "underline";
  element.style.textUnderlineOffset = existsInDb ? "" : "3px";
  element.style.fontStyle = existsInDb ? "italic" : "normal";
}

function bindPersonSpan(span, personName) {
  if (span.getAttribute(PERSON_BOUND_ATTR) === "true") {
    return;
  }

  span.setAttribute(PERSON_BOUND_ATTR, "true");
  span.setAttribute("data-cinenerdle2-person-name", personName);
  applyLoadedStyle(span, false);
  span.addEventListener("click", () => {
    const targetWindow = window.open("about:blank", "_blank");
    handlePersonClick(personName, span, targetWindow).catch((error) => {
      console.error("cinenerdle2.handlePersonClick", error);
      targetWindow?.close();
      alert(error.message);
    });
  });

  getPersonRecordByName(personName)
    .then((personRecord) => applyLoadedStyle(span, !!personRecord))
    .catch((error) =>
      console.error("cinenerdle2.getPersonRecordByName", personName, error),
    );
}

function createPersonSpan(personName) {
  const span = document.createElement("span");
  span.textContent = personName;
  bindPersonSpan(span, personName);
  console.log("cinenerdle2 span created", personName);
  return span;
}

function bindExistingPersonSpans(container) {
  Array.from(container.querySelectorAll("span")).forEach((span) => {
    const personName = getText(span);
    if (!personName || !looksLikePersonName(personName)) {
      return;
    }

    bindPersonSpan(span, personName);
  });
}

function replaceCommaSeparatedTextNode(textNode) {
  const text = textNode.textContent ?? "";
  if (!text.includes(",")) {
    return;
  }

  const people = text
    .split(",")
    .map((person) => person.trim())
    .filter(Boolean);

  if (people.length < 2 || !people.every(looksLikePersonName)) {
    return;
  }

  const fragment = document.createDocumentFragment();

  people.forEach((person, index) => {
    if (index > 0) {
      fragment.appendChild(document.createTextNode(", "));
    }

    fragment.appendChild(createPersonSpan(person));
  });

  textNode.replaceWith(fragment);
}

function replaceSinglePersonTextNode(textNode) {
  const personName = (textNode.textContent ?? "").trim();
  if (!looksLikePersonName(personName)) {
    return;
  }

  textNode.replaceWith(createPersonSpan(personName));
}

function upgradeContainerPeople(container) {
  bindExistingPersonSpans(container);

  Array.from(container.childNodes).forEach((childNode) => {
    if (childNode.nodeType !== Node.TEXT_NODE) {
      return;
    }

    if ((childNode.textContent ?? "").includes(",")) {
      replaceCommaSeparatedTextNode(childNode);
      return;
    }

    replaceSinglePersonTextNode(childNode);
  });
}

function getVisibleCastContainers() {
  return Array.from(document.querySelectorAll("div.text-pretty.text-white"))
    .filter(isVisible)
    .filter(elementHasCastContext);
}

function getVisibleMovieTitleElements() {
  return Array.from(document.querySelectorAll("div")).filter(
    (element) =>
      isVisible(element) &&
      / \(\d{4}\)$/.test(getText(element)) &&
      element.children.length === 0 &&
      !!getNearestFilmCard(element),
  );
}

function findMovieTitleElement(startElement) {
  let current = startElement;

  while (current) {
    if (
      current instanceof HTMLElement &&
      current.tagName === "DIV" &&
      / \(\d{4}\)$/.test(getText(current)) &&
      current.children.length === 0 &&
      getNearestFilmCard(current)
    ) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}

function bindMovieTitleElement(titleElement) {
  if (titleElement.getAttribute(MOVIE_BOUND_ATTR) === "true") {
    return;
  }

  const cardElement = getNearestFilmCard(titleElement);
  const filmTitleAndYear = cardElement ? getFilmTitleAndYear(cardElement) : null;
  if (!filmTitleAndYear) {
    return;
  }

  titleElement.setAttribute(MOVIE_BOUND_ATTR, "true");
  applyLoadedStyle(titleElement, false);

  getFilmRecordsByTitle(filmTitleAndYear.title)
    .then((filmRecords) =>
      applyLoadedStyle(
        titleElement,
        filmRecords.some(
          (record) =>
            normalizeTitle(record.title) === normalizeTitle(filmTitleAndYear.title),
        ),
      ),
    )
    .catch((error) =>
      console.error("cinenerdle2.getFilmRecordsByTitle", filmTitleAndYear.title, error),
    );
}

function bindMovieTitleClickDelegate() {
  if (movieTitleClickDelegateBound) {
    return;
  }

  document.addEventListener(
    "click",
    (event) => {
      const titleElement = findMovieTitleElement(event.target);
      if (!titleElement) {
        return;
      }

      const cardElement = getNearestFilmCard(titleElement);
      const filmTitleAndYear = cardElement ? getFilmTitleAndYear(cardElement) : null;
      if (!filmTitleAndYear) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const targetWindow = window.open("about:blank", "_blank");
      handleMovieClick(filmTitleAndYear.title, titleElement, targetWindow).catch((error) => {
        console.error("cinenerdle2.handleMovieClick", error);
        targetWindow?.close();
        alert(error.message);
      });
    },
    true,
  );

  movieTitleClickDelegateBound = true;
}

function handlePractice() {
  const practiceModeEl = findPracticeModeEl();
  if (!practiceModeEl) {
    return;
  }

  bindPracticeModeClick(practiceModeEl);
  bindMovieTitleClickDelegate();
  getVisibleCastContainers().forEach(upgradeContainerPeople);
  getVisibleMovieTitleElements().forEach(bindMovieTitleElement);
  getVisibleMovieTitleElements()
    .map((titleElement) => parseDomFilmSnapshotFromElement(titleElement))
    .filter(Boolean)
    .forEach((domFilmSnapshot) => {
      syncDomSnapshotToCachedRecords(domFilmSnapshot).catch((error) => {
        console.error("cinenerdle2.syncDomSnapshotToCachedRecords", error);
      });
    });
}

function main() {
  maybeShowGenericExtensionEntry()
    .then((didRenderEntry) => {
      if (didRenderEntry) {
        return;
      }

      handlePractice();

      const observer = new MutationObserver(() => {
        handlePractice();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    })
    .catch((error) => {
      console.error("cinenerdle2.main", error);
      alert(error.message);
    });
}

main();
