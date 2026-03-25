const TMDB_API_KEY_STORAGE_KEY = "cinenerdle2.tmdbApiKey";
const PERSON_BOUND_ATTR = "data-cinenerdle2-person-bound";
const MOVIE_BOUND_ATTR = "data-cinenerdle2-movie-bound";
const PERSON_NAME_PATTERN = /^[\p{L}\p{M}0-9.'’ -]+$/u;
const INDEXED_DB_NAME = "cinenerdle2";
const INDEXED_DB_VERSION = 7;
const PEOPLE_STORE_NAME = "people";
const FILMS_STORE_NAME = "films";
const CINENERDLE_ICON_URL = "https://www.cinenerdle2.app/icon.png";
const TMDB_ICON_URL =
    "https://www.themoviedb.org/assets/2/favicon-32x32-543a21832c8931d3494a68881f6afcafc58e96c5d324345377f3197a37b367b5.png";
const GENERIC_EXTENSION_BOOKMARKS_STORAGE_KEY =
    "cinenerdle2.genericExtensionBookmarks";
const GENERIC_EXTENSION_PAGE_PADDING_PX = 24;
const CINENERDLE_DAILY_STARTERS_URL =
    "https://www.cinenerdle2.app/api/battle-data/daily-starters?";

const practiceModeClickBound = new WeakSet();
let movieTitleClickDelegateBound = false;
let latestQueryResponseText = "No query response yet.";
let practiceModeClearInFlight = false;
let genericExtensionPopstateBound = false;
let genericExtensionRootRow = null;
let genericExtensionTooltipElement = null;
const genericExtensionSearchState = {
    query: "",
    suggestions: [],
    targetSelection: null,
    status: "",
    resultSummary: "",
    resultPath: null,
    resultPathMetadataByKey: {},
    resultPathNeighborCountsByKey: {},
    resultRows: [],
    excludedConnectionNodeKeys: [],
    excludedConnectionEdgeKeys: [],
    searching: false,
    shouldFocusInput: false,
    selectionStart: null,
    selectionEnd: null,
};

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
                filmsStore.createIndex("personConnectionKeys", "personConnectionKeys", {
                    unique: false,
                    multiEntry: true,
                });
            } else {
                const filmsStore = request.transaction.objectStore(FILMS_STORE_NAME);
                if (!filmsStore.indexNames.contains("titleYear")) {
                    filmsStore.createIndex("titleYear", "titleYear", { unique: false });
                }
                if (!filmsStore.indexNames.contains("titleLower")) {
                    filmsStore.createIndex("titleLower", "titleLower", { unique: false });
                }
                if (!filmsStore.indexNames.contains("personConnectionKeys")) {
                    filmsStore.createIndex("personConnectionKeys", "personConnectionKeys", {
                        unique: false,
                        multiEntry: true,
                    });
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

function formatByteCount(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return "0 B";
    }

    const units = ["B", "KB", "MB", "GB"];
    let unitIndex = 0;
    let value = bytes;
    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }

    const decimals = unitIndex === 0 ? 0 : value >= 10 ? 1 : 2;
    return `${value.toFixed(decimals)} ${units[unitIndex]}`;
}

async function estimateIndexedDbUsageBytes() {
    const [peopleRecords, filmRecords] = await Promise.all([
        getAllPersonRecords(),
        getAllFilmRecords(),
    ]);
    return new Blob([JSON.stringify({ peopleRecords, filmRecords })]).size;
}

function getGenericExtensionTrackWidth() {
    return `calc(100vw - ${GENERIC_EXTENSION_PAGE_PADDING_PX * 2}px)`;
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

function getCinenerdleMovieId(title, year = "") {
    return getFilmKey(title, year);
}

function getCinenerdlePersonId(name) {
    return normalizeName(name);
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

function isAllowedBfsTmdbCredit(credit) {
    if (!credit) {
        return false;
    }

    return credit.creditType === "cast" || credit.job === "Director";
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

async function getFilmRecordsByPersonConnectionKey(personName) {
    if (!personName) {
        return [];
    }

    const database = await openIndexedDb();

    try {
        const transaction = database.transaction(FILMS_STORE_NAME, "readonly");
        const store = transaction.objectStore(FILMS_STORE_NAME);
        const index = store.index("personConnectionKeys");
        const filmRecords = await indexedDbRequestToPromise(
            index.getAll(normalizeName(personName)),
        );
        await transactionDonePromise(transaction);
        return filmRecords ?? [];
    } finally {
        database.close();
    }
}

async function getAllPersonRecords() {
    const database = await openIndexedDb();

    try {
        const transaction = database.transaction(PEOPLE_STORE_NAME, "readonly");
        const store = transaction.objectStore(PEOPLE_STORE_NAME);
        const records = await indexedDbRequestToPromise(store.getAll());
        await transactionDonePromise(transaction);
        return records ?? [];
    } finally {
        database.close();
    }
}

async function getAllFilmRecords() {
    const database = await openIndexedDb();

    try {
        const transaction = database.transaction(FILMS_STORE_NAME, "readonly");
        const store = transaction.objectStore(FILMS_STORE_NAME);
        const records = await indexedDbRequestToPromise(store.getAll());
        await transactionDonePromise(transaction);
        return records ?? [];
    } finally {
        database.close();
    }
}

async function getPersonRecordById(id) {
    if (!id) {
        return null;
    }

    const database = await openIndexedDb();

    try {
        const transaction = database.transaction(PEOPLE_STORE_NAME, "readonly");
        const store = transaction.objectStore(PEOPLE_STORE_NAME);
        const record = await indexedDbRequestToPromise(store.get(id));
        await transactionDonePromise(transaction);
        return record ?? null;
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
        tmdbId: personRecord?.rawTmdbPerson?.id ?? personRecord?.id ?? null,
        cinenerdleId: getCinenerdlePersonId(personRecord?.name ?? ""),
        movieConnectionKeys: Array.from(new Set([...tmdbMovieKeys, ...domMovieKeys])),
    };
}

function withDerivedFilmFields(filmRecord, extraPersonNames = []) {
    const credits = filmRecord?.rawTmdbMovieCreditsResponse ?? {};
    const existingPersonKeys = (filmRecord?.personConnectionKeys ?? []).filter(Boolean);
    const tmdbPersonKeys = [...(credits.cast ?? []), ...(credits.crew ?? [])]
        .map((credit) => normalizeName(credit?.name ?? ""))
        .filter(Boolean);
    const domPersonKeys = Object.values(filmRecord?.domSnapshot?.peopleByRole ?? {})
        .flat()
        .map((personName) => normalizeName(personName))
        .filter(Boolean);
    const extraPersonKeys = extraPersonNames
        .map((personName) => normalizeName(personName))
        .filter(Boolean);

    return {
        ...filmRecord,
        tmdbId: filmRecord?.rawTmdbMovie?.id ?? filmRecord?.id ?? null,
        cinenerdleId: getCinenerdleMovieId(filmRecord?.title ?? "", filmRecord?.year ?? ""),
        personConnectionKeys: Array.from(
            new Set([...existingPersonKeys, ...tmdbPersonKeys, ...domPersonKeys, ...extraPersonKeys]),
        ),
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

async function saveFilmRecordsFromCredits(creditsPayload, domFilmSnapshot, connectedPersonName = "") {
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
                    withDerivedFilmFields(
                        buildFilmRecord(
                            existingFilmRecord ?? null,
                            tmdbFilm,
                            matchesDomFilm ? domFilmSnapshot : null,
                        ),
                        connectedPersonName ? [connectedPersonName] : [],
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
                filmsStore.put(withDerivedFilmFields({
                    ...filmRecord,
                    title: domFilmSnapshot.title,
                    titleLower: domFilmSnapshot.titleLower,
                    year: domFilmSnapshot.year,
                    titleYear: domFilmSnapshot.titleYear,
                    domSnapshot: {
                        ...filmRecord.domSnapshot,
                        ...domFilmSnapshot,
                    },
                })),
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
        await saveFilmRecordsFromCredits(creditsPayload, domFilmSnapshot, person.name);
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
            store.put(withDerivedFilmFields({
                ...buildFilmRecord(existingFilmRecord ?? null, movie, domFilmSnapshot),
                rawTmdbMovieSearchResponse: searchPayload,
            })),
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
    const tmdbId = movieRecord?.tmdbId ?? movieRecord?.id;
    if (!tmdbId) {
        return movieRecord ?? null;
    }

    const apiKey = getTmdbApiKey();
    if (!apiKey) {
        return movieRecord;
    }

    const creditsUrl = new URL(
        `https://api.themoviedb.org/3/movie/${tmdbId}/credits`,
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
        const existingFilmRecord = await indexedDbRequestToPromise(store.get(tmdbId));
        const updatedFilmRecord = {
            ...(existingFilmRecord ?? movieRecord),
            id: tmdbId,
            tmdbId,
            rawTmdbMovieCreditsResponse: creditsPayload,
            tmdbCreditsSavedAt: new Date().toISOString(),
        };
        await indexedDbRequestToPromise(store.put(withDerivedFilmFields(updatedFilmRecord)));
        await transactionDonePromise(transaction);
        return withDerivedFilmFields(updatedFilmRecord);
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

function createCardTitle(text) {
    const wrapper = document.createElement("div");

    const title = document.createElement("div");
    title.dataset.cinenerdle2CardTitle = "true";
    title.textContent = text;
    title.style.fontSize = "13px";
    title.style.fontWeight = "700";
    title.style.lineHeight = "1.25";
    title.style.color = "#f8fafc";
    title.style.height = "auto";
    title.style.overflowX = "auto";
    title.style.overflowY = "hidden";
    title.style.whiteSpace = "nowrap";

    wrapper.appendChild(title);

    return wrapper;
}

function createPosterCard({ imageUrl, title, subtitle, subtitleDetail = "", footer = null }) {
    const card = document.createElement("div");
    card.style.flex = "0 0 176px";
    card.style.width = "176px";
    card.style.minWidth = "176px";
    card.style.maxWidth = "176px";
    card.style.display = "flex";
    card.style.flexDirection = "column";
    card.style.padding = "10px";
    card.style.border = "1px solid #243041";
    card.style.borderRadius = "14px";
    card.style.backgroundColor = "#111827";
    card.style.boxShadow = "none";
    card.style.height = "100%";
    card.style.boxSizing = "border-box";

    const imageFrame = document.createElement("div");
    imageFrame.dataset.cinenerdle2CardImageFrame = "true";
    imageFrame.style.width = "100%";
    imageFrame.style.aspectRatio = "2 / 3";
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
        image.style.objectFit = "contain";
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
    content.style.gap = "6px";
    content.style.paddingTop = "6px";

    content.appendChild(createCardTitle(title));

    const spacer = document.createElement("div");
    spacer.style.flex = "1";
    content.appendChild(spacer);

    if (subtitle || subtitleDetail) {
        const secondary = document.createElement("div");
        secondary.style.display = "flex";
        secondary.style.flexDirection = "column";
        secondary.style.gap = "2px";
        secondary.style.minHeight = "2.7em";

        if (subtitle) {
            const secondaryTop = document.createElement("div");
            secondaryTop.textContent = subtitle;
            secondaryTop.style.fontSize = "10px";
            secondaryTop.style.color = "#94a3b8";
            secondaryTop.style.lineHeight = "1.35";
            secondaryTop.style.whiteSpace = "nowrap";
            secondaryTop.style.overflowX = "auto";
            secondaryTop.style.overflowY = "hidden";
            secondary.appendChild(secondaryTop);
        }

        if (subtitleDetail) {
            const secondaryBottom = document.createElement("div");
            secondaryBottom.textContent = subtitleDetail;
            secondaryBottom.style.fontSize = "10px";
            secondaryBottom.style.color = "#94a3b8";
            secondaryBottom.style.lineHeight = "1.35";
            secondaryBottom.style.whiteSpace = "nowrap";
            secondaryBottom.style.overflowX = "auto";
            secondaryBottom.style.overflowY = "hidden";
            secondary.appendChild(secondaryBottom);
        }

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

function createRowSection() {
    const section = document.createElement("section");
    section.style.display = "flex";
    section.style.flexDirection = "column";

    const body = document.createElement("div");
    section.appendChild(body);

    return { section, body };
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
    chip.style.padding = "3px 6px";
    chip.style.borderRadius = "999px";
    chip.style.fontSize = "9px";
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
    chip.style.padding = "3px 6px";
    chip.style.borderRadius = "999px";
    chip.style.fontSize = "9px";
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
        chip.style.padding = "3px 6px";
        chip.style.borderRadius = "999px";
        chip.style.backgroundColor = "#172033";
        chip.style.color = "#bfdbfe";
        chip.style.fontSize = "9px";
        row.appendChild(chip);
    });

    return row;
}

function createMovieMetaBlock({
    connectionCount = null,
    popularity,
    voteAverage,
    voteCount,
    sources = [],
    status = null,
    preserveEmptyBottomRow = false,
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
    topRow.style.minHeight = "32px";

    if (typeof connectionCount === "number" || sources.length > 0) {
        const sourcesRow = document.createElement("div");
        sourcesRow.style.display = "flex";
        sourcesRow.style.alignItems = "center";
        sourcesRow.style.gap = "8px";
        sourcesRow.style.flexWrap = "nowrap";
        sourcesRow.style.minWidth = "0";

        if (typeof connectionCount === "number") {
            const connectionCountText = document.createElement("div");
            connectionCountText.textContent = `${connectionCount}`;
            connectionCountText.style.fontSize = "11px";
            connectionCountText.style.fontWeight = "700";
            connectionCountText.style.color = sharedTextColor;
            connectionCountText.style.whiteSpace = "nowrap";
            sourcesRow.appendChild(connectionCountText);
        }

        if (sources.length > 0) {
            sourcesRow.appendChild(createSourceBadge(sources));
        }

        topRow.appendChild(sourcesRow);
    }

    if (typeof popularity === "number") {
        const popularityChip = createHeatMetricChip("Popularity", popularity, 100);
        popularityChip.style.marginLeft = "auto";
        topRow.appendChild(popularityChip);
    } else {
        const popularitySpacer = document.createElement("div");
        popularitySpacer.style.flex = "1 1 auto";
        topRow.appendChild(popularitySpacer);
    }

    block.appendChild(topRow);

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
    bottomRow.style.minHeight = "32px";

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

    if (preserveEmptyBottomRow || bottomRow.childNodes.length > 0) {
        block.appendChild(bottomRow);
    }

    return block;
}

function getMovieConnectionCountFromRecord(movieRecord) {
    if (!movieRecord) {
        return 1;
    }

    return Math.max(movieRecord.personConnectionKeys?.length ?? 0, 1);
}

function getPersonConnectionCountFromRecord(personRecord) {
    if (!personRecord) {
        return 1;
    }

    const uniqueMovies = new Set();
    getUniqueSortedTmdbMovieCredits(personRecord).forEach((credit) => {
        uniqueMovies.add(getMovieCardKey(getMovieTitleFromCredit(credit), getMovieYearFromCredit(credit), credit.id));
    });

    (personRecord.domConnections ?? []).forEach((connection) => {
        uniqueMovies.add(getMovieCardKey(connection.title, connection.year));
    });

    return Math.max(uniqueMovies.size, 1);
}

function getCardConnectionCount(card) {
    if (!card) {
        return null;
    }

    if (typeof card.connectionCount === "number") {
        return Math.max(card.connectionCount, 1);
    }

    if (card.kind === "movie") {
        return getMovieConnectionCountFromRecord(card.record);
    }

    if (card.kind === "person") {
        return getPersonConnectionCountFromRecord(card.record);
    }

    return null;
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

function createPathNode(kind, name, year = "") {
    return {
        kind,
        name: name?.trim() ?? "",
        year: year?.trim() ?? "",
    };
}

function getSearchEntityLabel(entity) {
    return entity.kind === "movie"
        ? formatMoviePathLabel(entity.name, entity.year)
        : entity.name;
}

function createPersonSearchEntity(personRecord) {
    return {
        kind: "person",
        id: personRecord?.id ?? "",
        name: personRecord?.name ?? "",
        key: getPersonCardKey(personRecord?.name ?? "", personRecord?.id),
        label: personRecord?.name ?? "",
    };
}

function createMovieSearchEntity(movieRecord) {
    const year = movieRecord?.year ?? getMovieRecordYear(movieRecord);
    const title = movieRecord?.title ?? "";
    return {
        kind: "movie",
        id: movieRecord?.id ?? "",
        name: title,
        year,
        key: getMovieCardKey(title, year, movieRecord?.id),
        label: formatMoviePathLabel(title, year),
    };
}

function createPersonSearchEntityFromCredit(credit) {
    const personName = credit?.name?.trim() ?? "";
    return {
        kind: "person",
        id: credit?.id ?? "",
        name: personName,
        key: getPersonCardKey(personName, credit?.id),
        label: personName,
    };
}

function createMovieSearchEntityFromCredit(credit) {
    const title = getMovieTitleFromCredit(credit);
    const year = getMovieYearFromCredit(credit);
    return {
        kind: "movie",
        id: credit?.id ?? "",
        name: title,
        year,
        key: getMovieCardKey(title, year, credit?.id),
        label: formatMoviePathLabel(title, year),
    };
}

function getSearchEntityPathNode(entity) {
    return createPathNode(entity.kind, entity.name, entity.kind === "movie" ? entity.year : "");
}

function parseMoviePathLabel(label) {
    const match = label.match(/^(.*) \((\d{4})\)$/);
    if (!match) {
        return createPathNode("movie", label, "");
    }

    return createPathNode("movie", match[1].trim(), match[2]);
}

function parseGenericExtensionSegments(value) {
    return value
        .split("|")
        .map((segment) => segment.trim())
        .filter(Boolean)
        .map((segment) => decodeURIComponent(segment.replaceAll("+", "%20")))
        .filter(Boolean);
}

function buildGenericExtensionPathNodes(rootKind, segments) {
    if (!rootKind || segments.length === 0) {
        return [];
    }

    const pathNodes = [
        rootKind === "cinenerdle"
            ? createPathNode("cinenerdle", segments[0])
            : rootKind === "movie"
                ? parseMoviePathLabel(segments[0])
                : createPathNode("person", segments[0]),
    ];

    let nextKind =
        rootKind === "cinenerdle"
            ? "movie"
            : rootKind === "person"
                ? "movie"
                : "person";
    segments.slice(1).forEach((segment) => {
        pathNodes.push(
            nextKind === "movie"
                ? parseMoviePathLabel(segment)
                : createPathNode("person", segment),
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
    return pathNodes.map(serializePathNode).join("|");
}

function buildGenericExtensionUrlFromPath(pathNodes) {
    const entryOrigin = window.location.origin || "https://dcep93.github.io";
    return `${entryOrigin}/etc/generic_extension/extensions/cinenerdle2.html?generic_extension=${serializeGenericExtensionPath(pathNodes)}`;
}

function getGenericExtensionUrl(kind, name, year = "") {
    return buildGenericExtensionUrlFromPath([createPathNode(kind, name, year)]);
}

function openGenericExtensionPage(kind, name, year = "") {
    return window.open(getGenericExtensionUrl(kind, name, year), "_blank");
}

function setCinenerdleFavicon() {
    let faviconLink = document.querySelector('link[rel="icon"]');
    if (!(faviconLink instanceof HTMLLinkElement)) {
        faviconLink = document.createElement("link");
        faviconLink.rel = "icon";
        document.head.appendChild(faviconLink);
    }

    faviconLink.href = CINENERDLE_ICON_URL;
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

    if (pathNode.kind === "cinenerdle") {
        return normalizeTitle(card.name) === normalizeTitle(pathNode.name);
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

function collectSelectedCardKeys(rootRow) {
    const selectedCardKeys = new Set();
    let currentRow = rootRow;

    while (currentRow) {
        const selectedCard = getSelectedCard(currentRow);
        if (!selectedCard) {
            break;
        }

        selectedCardKeys.add(selectedCard.key);
        currentRow = selectedCard.childRow ?? null;
    }

    return selectedCardKeys;
}

function collectAncestorSelectedCardKeys(rootRow, targetRow) {
    const ancestorSelectedCards = [];
    let currentRow = rootRow;

    while (currentRow && currentRow !== targetRow) {
        const selectedCard = getSelectedCard(currentRow);
        if (!selectedCard) {
            break;
        }

        ancestorSelectedCards.push(selectedCard);
        currentRow = selectedCard.childRow ?? null;
    }

    return ancestorSelectedCards;
}

function getGenericExtensionEntryUrl() {
    const match = location.href.match(/[?&]generic_extension=([^&#]*)/);
    return match?.[1]?.trim() ?? "";
}

function isGenericExtensionEntryPage() {
    return (
        window.location.pathname.endsWith("/cinenerdle2.html") ||
        window.location.pathname.endsWith("/icon.png")
    );
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

function getGenericExtensionBookmarks() {
    try {
        const rawBookmarks = localStorage.getItem(
            GENERIC_EXTENSION_BOOKMARKS_STORAGE_KEY,
        );
        if (!rawBookmarks) {
            return [];
        }

        const parsedBookmarks = JSON.parse(rawBookmarks);
        if (!Array.isArray(parsedBookmarks)) {
            return [];
        }

        return parsedBookmarks.filter(
            (bookmark) =>
                bookmark &&
                typeof bookmark.name === "string" &&
                typeof bookmark.path === "string" &&
                bookmark.name.trim() &&
                bookmark.path.trim(),
        );
    } catch (error) {
        console.error("cinenerdle2.getGenericExtensionBookmarks", error);
        return [];
    }
}

function saveGenericExtensionBookmarks(bookmarks) {
    localStorage.setItem(
        GENERIC_EXTENSION_BOOKMARKS_STORAGE_KEY,
        JSON.stringify(bookmarks),
    );
}

function getCurrentGenericExtensionBookmarkName(rootRow) {
    return collectSelectedPathNodes(rootRow)
        .map((pathNode) => getPathNodeLabel(pathNode))
        .join(" -> ");
}

function saveCurrentViewAsBookmark(rootRow) {
    const defaultBookmarkName = getCurrentGenericExtensionBookmarkName(rootRow);
    const promptedName = window.prompt("Bookmark name", defaultBookmarkName);
    const bookmarkName = promptedName?.trim();
    if (!bookmarkName) {
        return;
    }

    const bookmarkPath = serializeGenericExtensionPath(collectSelectedPathNodes(rootRow));
    const existingBookmarks = getGenericExtensionBookmarks().filter(
        (bookmark) => bookmark.name !== bookmarkName,
    );
    existingBookmarks.unshift({
        name: bookmarkName,
        path: bookmarkPath,
        savedAt: new Date().toISOString(),
    });
    saveGenericExtensionBookmarks(existingBookmarks);
}

async function searchLocalEntities(query, limit = 8) {
    const normalizedQuery = normalizeTitle(query);
    if (!normalizedQuery) {
        return [];
    }

    const [peopleRecords, filmRecords] = await Promise.all([
        getAllPersonRecords(),
        getAllFilmRecords(),
    ]);
    const suggestions = [];
    const seenEntityKeys = new Set();
    const seenSemanticKeys = new Set();
    const addSuggestion = (entity, normalizedLabel) => {
        if (!entity || !normalizedLabel.includes(normalizedQuery)) {
            return;
        }

        const semanticKey = getSearchEntityExclusionKey(entity);
        if (seenEntityKeys.has(entity.key) || seenSemanticKeys.has(semanticKey)) {
            return;
        }

        suggestions.push({
            ...entity,
            score: normalizedLabel.startsWith(normalizedQuery) ? 0 : 1,
        });
        seenEntityKeys.add(entity.key);
        seenSemanticKeys.add(semanticKey);
    };

    peopleRecords.forEach((personRecord) => {
        const entity = createPersonSearchEntity(personRecord);
        addSuggestion(entity, normalizeName(entity.name));
    });

    filmRecords.forEach((filmRecord) => {
        const entity = createMovieSearchEntity(filmRecord);
        addSuggestion(entity, normalizeTitle(entity.name));
    });

    filmRecords.forEach((filmRecord) => {
        const credits = filmRecord?.rawTmdbMovieCreditsResponse ?? {};
        const tmdbPeople = [
            ...(credits.cast ?? []).map((credit) => ({ ...credit, creditType: "cast" })),
            ...(credits.crew ?? []).map((credit) => ({ ...credit, creditType: "crew" })),
        ];
        tmdbPeople.forEach((credit) => {
            const entity = createPersonSearchEntityFromCredit(credit);
            addSuggestion(entity, normalizeName(entity.name));
        });

        Object.values(filmRecord?.domSnapshot?.peopleByRole ?? {})
            .flat()
            .forEach((personName) => {
                const entity = {
                    kind: "person",
                    id: "",
                    name: personName,
                    key: getPersonCardKey(personName),
                    label: personName,
                };
                addSuggestion(entity, normalizeName(entity.name));
            });
    });

    return suggestions
        .sort((left, right) => {
            if (left.score !== right.score) {
                return left.score - right.score;
            }

            return left.label.localeCompare(right.label);
        })
        .slice(0, limit);
}

function createNeighborEntityMap(entities) {
    const neighborsByKey = new Map();
    entities.forEach((entity) => {
        if (!neighborsByKey.has(entity.key)) {
            neighborsByKey.set(entity.key, entity);
        }
    });
    return Array.from(neighborsByKey.values());
}

async function getLocalNeighborsForEntity(entity, cache) {
    if (cache.has(entity.key)) {
        return cache.get(entity.key);
    }

    let neighbors = [];

    if (entity.kind === "person") {
        const personRecord =
            (entity.id ? await getPersonRecordById(entity.id) : null) ??
            (entity.name ? await getPersonRecordByName(entity.name) : null);

        if (personRecord) {
            neighbors = createNeighborEntityMap([
                ...getUniqueSortedTmdbMovieCredits(personRecord)
                    .filter(isAllowedBfsTmdbCredit)
                    .map((credit) => createMovieSearchEntityFromCredit(credit)),
                ...(personRecord.domConnections ?? []).map((connection) => ({
                    kind: "movie",
                    id: "",
                    name: connection.title,
                    year: connection.year,
                    key: getMovieCardKey(connection.title, connection.year),
                    label: formatMoviePathLabel(connection.title, connection.year),
                })),
            ]);
        }
    } else if (entity.kind === "movie") {
        const movieRecord =
            (entity.id ? await getFilmRecordById(entity.id) : null) ??
            (entity.name ? await getFilmRecordByTitleAndYear(entity.name, entity.year) : null);

        if (movieRecord) {
            const credits = movieRecord.rawTmdbMovieCreditsResponse ?? {};
            const creditPeople = [
                ...(credits.cast ?? []).map((credit) => ({ ...credit, creditType: "cast" })),
                ...(credits.crew ?? []).map((credit) => ({ ...credit, creditType: "crew" })),
            ].filter(isAllowedBfsTmdbCredit);
            const tmdbPeople = creditPeople
                .map((credit) => createPersonSearchEntityFromCredit(credit));
            const cinenerdlePeople = Object.values(movieRecord?.domSnapshot?.peopleByRole ?? {})
                .flat()
                .map((personName) => ({
                    kind: "person",
                    id: "",
                    name: personName,
                    key: getPersonCardKey(personName),
                    label: personName,
                }));

            neighbors = createNeighborEntityMap([...tmdbPeople, ...cinenerdlePeople]);
        }
    }

    cache.set(entity.key, neighbors);
    return neighbors;
}

async function getConnectionPathEntityMetadata(entity) {
    if (!entity) {
        return { sources: [] };
    }

    if (entity.kind === "movie") {
        const movieRecord =
            (entity.id ? await getFilmRecordById(entity.id) : null) ??
            (entity.name ? await getFilmRecordByTitleAndYear(entity.name, entity.year) : null);
        return {
            sources: [
                hasFetchedTmdbMovie(movieRecord)
                    ? { iconUrl: TMDB_ICON_URL, label: "TMDb" }
                    : {
                        iconUrl: TMDB_ICON_URL,
                        label: "TMDb reference only",
                        filter: "grayscale(1)",
                        opacity: "0.9",
                    },
                movieRecord?.domSnapshot
                    ? { iconUrl: CINENERDLE_ICON_URL, label: "Cinenerdle" }
                    : {
                        iconUrl: CINENERDLE_ICON_URL,
                        label: "Not loaded from Cinenerdle",
                        filter: "grayscale(1)",
                        opacity: "0.9",
                    },
            ],
        };
    }

    const personRecord =
        (entity.id ? await getPersonRecordById(entity.id) : null) ??
        (entity.name ? await getPersonRecordByName(entity.name) : null);
    return {
        sources: [
            hasFetchedTmdbPerson(personRecord)
                ? { iconUrl: TMDB_ICON_URL, label: "TMDb" }
                : {
                    iconUrl: TMDB_ICON_URL,
                    label: "TMDb reference only",
                    filter: "grayscale(1)",
                    opacity: "0.9",
                },
            personRecord?.domConnections?.length
                ? { iconUrl: CINENERDLE_ICON_URL, label: "Cinenerdle" }
                : {
                    iconUrl: CINENERDLE_ICON_URL,
                    label: "Not loaded from Cinenerdle",
                    filter: "grayscale(1)",
                    opacity: "0.9",
                },
        ],
    };
}

async function buildConnectionPathRenderState(path) {
    const neighborCache = new Map();
    const metadataEntries = await Promise.all(
        (path ?? []).map(async (entity) => {
            const [metadata, neighbors] = await Promise.all([
                getConnectionPathEntityMetadata(entity),
                getLocalNeighborsForEntity(entity, neighborCache),
            ]);
            return [entity.key, metadata, neighbors.length];
        }),
    );
    const metadataByKey = {};
    const neighborCountsByKey = {};
    metadataEntries.forEach(([key, metadata, neighborCount]) => {
        metadataByKey[key] = metadata;
        neighborCountsByKey[key] = Math.max(neighborCount, 1);
    });
    return { metadataByKey, neighborCountsByKey };
}

function reconstructBidirectionalPath(meetingKey, startParents, endParents, entityByKey) {
    const startKeys = [];
    let currentKey = meetingKey;
    while (currentKey) {
        startKeys.push(currentKey);
        currentKey = startParents.get(currentKey) ?? null;
    }
    startKeys.reverse();

    const endKeys = [];
    currentKey = endParents.get(meetingKey) ?? null;
    while (currentKey) {
        endKeys.push(currentKey);
        currentKey = endParents.get(currentKey) ?? null;
    }

    return [...startKeys, ...endKeys].map((key) => entityByKey.get(key));
}

function getSearchEntityExclusionKey(entity) {
    if (!entity) {
        return "";
    }

    if (entity.kind === "movie") {
        return `movie:${normalizeTitle(entity.name ?? "")}::${entity.year ?? ""}`;
    }

    return `person:${normalizeName(entity.name ?? "")}`;
}

function getSearchEdgeExclusionKey(leftEntity, rightEntity) {
    const leftKey = getSearchEntityExclusionKey(leftEntity);
    const rightKey = getSearchEntityExclusionKey(rightEntity);
    return [leftKey, rightKey].sort().join("||");
}

async function findLocalConnectionPath(
    startEntity,
    endEntity,
    timeoutMs = 5000,
    excludedNodeKeys = [],
    excludedEdgeKeys = [],
) {
    if (!startEntity || !endEntity) {
        return { path: null, timedOut: false, nodesRead: 0 };
    }

    const excludedNodeKeySet = new Set(excludedNodeKeys);
    const excludedEdgeKeySet = new Set(excludedEdgeKeys);
    if (
        excludedNodeKeySet.has(getSearchEntityExclusionKey(startEntity)) ||
        excludedNodeKeySet.has(getSearchEntityExclusionKey(endEntity))
    ) {
        return { path: null, timedOut: false, nodesRead: 0 };
    }

    if (startEntity.key === endEntity.key) {
        return { path: [startEntity], timedOut: false, nodesRead: 1 };
    }

    const deadline = Date.now() + timeoutMs;
    const neighborCache = new Map();
    const entityByKey = new Map([
        [startEntity.key, startEntity],
        [endEntity.key, endEntity],
    ]);
    const startParents = new Map([[startEntity.key, null]]);
    const endParents = new Map([[endEntity.key, null]]);
    let startFrontier = [startEntity];
    let endFrontier = [endEntity];
    let nodesRead = 0;

    while (startFrontier.length > 0 && endFrontier.length > 0) {
        if (Date.now() > deadline) {
            return { path: null, timedOut: true, nodesRead };
        }

        const expandStartSide = startFrontier.length <= endFrontier.length;
        const frontier = expandStartSide ? startFrontier : endFrontier;
        const ownParents = expandStartSide ? startParents : endParents;
        const otherParents = expandStartSide ? endParents : startParents;
        const nextFrontier = [];

        for (const entity of frontier) {
            if (Date.now() > deadline) {
                return { path: null, timedOut: true, nodesRead };
            }

            nodesRead += 1;
            const neighbors = await getLocalNeighborsForEntity(entity, neighborCache);
            for (const neighbor of neighbors) {
                if (
                    !neighbor?.key ||
                    ownParents.has(neighbor.key) ||
                    excludedNodeKeySet.has(getSearchEntityExclusionKey(neighbor)) ||
                    excludedEdgeKeySet.has(getSearchEdgeExclusionKey(entity, neighbor))
                ) {
                    continue;
                }

                ownParents.set(neighbor.key, entity.key);
                entityByKey.set(neighbor.key, neighbor);

                if (otherParents.has(neighbor.key)) {
                    return {
                        path: reconstructBidirectionalPath(
                            neighbor.key,
                            startParents,
                            endParents,
                            entityByKey,
                        ),
                        timedOut: false,
                        nodesRead,
                    };
                }

                nextFrontier.push(neighbor);
            }
        }

        if (expandStartSide) {
            startFrontier = nextFrontier;
        } else {
            endFrontier = nextFrontier;
        }
    }

    return { path: null, timedOut: false, nodesRead };
}

function createBookmarkActionButton(label, onClick, tone = "neutral") {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.style.border = `1px solid ${tone === "danger" ? "#5b2a2a" : "#334155"}`;
    button.style.borderRadius = "999px";
    button.style.padding = "9px 14px";
    button.style.fontSize = "13px";
    button.style.fontWeight = "600";
    button.style.cursor = "pointer";
    button.style.whiteSpace = "nowrap";
    button.style.background = tone === "danger"
        ? "linear-gradient(180deg, #412020 0%, #321818 100%)"
        : "linear-gradient(180deg, #1c2940 0%, #162237 100%)";
    button.style.color = tone === "danger" ? "#fecaca" : "#e2e8f0";
    button.style.boxShadow = "inset 0 1px 0 rgba(255, 255, 255, 0.05)";
    button.addEventListener("click", onClick);
    return button;
}

function applyHorizontalScrollableRowStyle(element, paddingBottom = "8px") {
    element.style.display = "flex";
    element.style.flexWrap = "nowrap";
    element.style.width = getGenericExtensionTrackWidth();
    element.style.maxWidth = getGenericExtensionTrackWidth();
    element.style.minWidth = getGenericExtensionTrackWidth();
    element.style.overflowX = "auto";
    element.style.overflowY = "visible";
    element.style.paddingBottom = paddingBottom;
    element.style.boxSizing = "border-box";
}

function restoreGenericExtensionSearchInputFocus() {
    if (!genericExtensionSearchState.shouldFocusInput) {
        return;
    }

    window.requestAnimationFrame(() => {
        const input = document.querySelector('[data-cinenerdle2-search-input="true"]');
        if (!(input instanceof HTMLInputElement)) {
            return;
        }

        input.focus({ preventScroll: true });
        const selectionStart =
            typeof genericExtensionSearchState.selectionStart === "number"
                ? genericExtensionSearchState.selectionStart
                : input.value.length;
        const selectionEnd =
            typeof genericExtensionSearchState.selectionEnd === "number"
                ? genericExtensionSearchState.selectionEnd
                : selectionStart;
        input.setSelectionRange(selectionStart, selectionEnd);
    });
}

function resetGenericExtensionSearchState() {
    genericExtensionSearchState.query = "";
    genericExtensionSearchState.suggestions = [];
    genericExtensionSearchState.targetSelection = null;
    genericExtensionSearchState.status = "";
    genericExtensionSearchState.resultSummary = "";
    genericExtensionSearchState.resultPath = null;
    genericExtensionSearchState.resultPathMetadataByKey = {};
    genericExtensionSearchState.resultPathNeighborCountsByKey = {};
    genericExtensionSearchState.resultRows = [];
    genericExtensionSearchState.excludedConnectionNodeKeys = [];
    genericExtensionSearchState.excludedConnectionEdgeKeys = [];
    genericExtensionSearchState.searching = false;
}

function syncGenericExtensionSearchExclusionsFromResultRows() {
    const excludedNodeKeys = new Set();
    const excludedEdgeKeys = new Set();

    genericExtensionSearchState.resultRows.forEach((resultRowState) => {
        const path = resultRowState?.path ?? [];
        (resultRowState?.dimmedNodeIndexes ?? []).forEach((index) => {
            const entity = path[index];
            if (entity) {
                excludedNodeKeys.add(getSearchEntityExclusionKey(entity));
            }
        });
        (resultRowState?.dimmedEdgeKeys ?? []).forEach((edgeKey) => {
            if (edgeKey) {
                excludedEdgeKeys.add(edgeKey);
            }
        });
    });

    genericExtensionSearchState.excludedConnectionNodeKeys = Array.from(excludedNodeKeys);
    genericExtensionSearchState.excludedConnectionEdgeKeys = Array.from(excludedEdgeKeys);
}

function insertGenericExtensionSearchResultRow(resultRowState, insertBeforeResultRowIndex = null) {
    const insertionIndex = Number.isInteger(insertBeforeResultRowIndex)
        ? Math.max(0, Math.min(insertBeforeResultRowIndex, genericExtensionSearchState.resultRows.length))
        : 0;
    genericExtensionSearchState.resultRows = [
        ...genericExtensionSearchState.resultRows.slice(0, insertionIndex),
        resultRowState,
        ...genericExtensionSearchState.resultRows.slice(insertionIndex),
    ];
}

async function updateGenericExtensionSearchSuggestions(query) {
    genericExtensionSearchState.query = query;
    genericExtensionSearchState.targetSelection = null;
    genericExtensionSearchState.resultPath = null;
    genericExtensionSearchState.status = "";
    genericExtensionSearchState.resultSummary = "";
    genericExtensionSearchState.resultRows = [];
    genericExtensionSearchState.excludedConnectionNodeKeys = [];
    genericExtensionSearchState.excludedConnectionEdgeKeys = [];

    if (!query.trim()) {
        genericExtensionSearchState.suggestions = [];
        return;
    }

    const suggestions = await searchLocalEntities(query, 8);
    if (genericExtensionSearchState.query !== query) {
        return;
    }

    genericExtensionSearchState.suggestions = suggestions;
}

async function selectGenericExtensionSearchSuggestion(rootRow, suggestion) {
    genericExtensionSearchState.targetSelection = suggestion;
    genericExtensionSearchState.query = suggestion.label;
    genericExtensionSearchState.suggestions = [];
    genericExtensionSearchState.resultPath = null;
    genericExtensionSearchState.status = "";
    genericExtensionSearchState.resultSummary = "";
    genericExtensionSearchState.resultRows = [];
    genericExtensionSearchState.excludedConnectionNodeKeys = [];
    genericExtensionSearchState.excludedConnectionEdgeKeys = [];
    await connectGenericExtensionSearchEndpoints(rootRow);
}

function createAutocompleteField(rootRow, placeholder) {
    let highlightedIndex = 0;
    let liveRefreshTimerId = null;

    function refreshSuggestionsForCurrentQuery() {
        if (!genericExtensionSearchState.query.trim()) {
            renderSuggestions();
            return;
        }

        updateGenericExtensionSearchSuggestions(genericExtensionSearchState.query)
            .then(() => {
                renderSuggestions();
            })
            .catch((error) => {
                console.error("cinenerdle2.refreshSuggestionsForCurrentQuery", error);
                alert(error.message);
            });
    }

    function startLiveSuggestionRefresh() {
        if (liveRefreshTimerId !== null) {
            return;
        }

        liveRefreshTimerId = window.setInterval(() => {
            if (document.activeElement !== input || !genericExtensionSearchState.query.trim()) {
                return;
            }

            refreshSuggestionsForCurrentQuery();
        }, 750);
    }

    function stopLiveSuggestionRefresh() {
        if (liveRefreshTimerId === null) {
            return;
        }

        window.clearInterval(liveRefreshTimerId);
        liveRefreshTimerId = null;
    }

    const fieldWrap = document.createElement("div");
    fieldWrap.style.position = "relative";
    fieldWrap.style.zIndex = "5";
    fieldWrap.style.display = "flex";
    fieldWrap.style.minWidth = "320px";
    fieldWrap.style.flex = "1 1 520px";
    fieldWrap.style.maxWidth = "100%";
    fieldWrap.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
    });
    fieldWrap.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    const inputShell = document.createElement("div");
    inputShell.style.display = "flex";
    inputShell.style.alignItems = "center";
    inputShell.style.gap = "10px";
    inputShell.style.width = "100%";
    inputShell.style.padding = "0 12px";
    inputShell.style.borderRadius = "12px";
    inputShell.style.border = "1px solid #334155";
    inputShell.style.backgroundColor = "#0f172a";
    inputShell.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
    });
    inputShell.addEventListener("click", (event) => {
        event.stopPropagation();
        input.focus();
    });

    const input = document.createElement("input");
    input.type = "text";
    input.dataset.cinenerdle2SearchInput = "true";
    input.value = genericExtensionSearchState.query;
    input.placeholder = placeholder;
    input.style.flex = "1 1 auto";
    input.style.minWidth = "0";
    input.style.height = "44px";
    input.style.padding = "0";
    input.style.border = "0";
    input.style.outline = "none";
    input.style.backgroundColor = "transparent";
    input.style.color = "#f8fafc";
    input.style.fontSize = "14px";
    input.autocomplete = "off";
    input.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
    });
    input.addEventListener("input", (event) => {
        highlightedIndex = 0;
        updateGenericExtensionSearchSuggestions(event.target.value)
            .then(() => {
                renderSuggestions();
            })
            .catch(
                (error) => {
                    console.error("cinenerdle2.updateGenericExtensionSearchSuggestions", error);
                    alert(error.message);
                },
            );
    });
    input.addEventListener("focus", () => {
        startLiveSuggestionRefresh();
        refreshSuggestionsForCurrentQuery();
    });
    input.addEventListener("pointerdown", () => {
        refreshSuggestionsForCurrentQuery();
    });
    input.addEventListener("click", (event) => {
        event.stopPropagation();
        refreshSuggestionsForCurrentQuery();
    });
    input.addEventListener("keydown", (event) => {
        const suggestions = genericExtensionSearchState.suggestions;
        if (event.key === "ArrowDown") {
            if (!suggestions.length) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            highlightedIndex = Math.min(highlightedIndex + 1, suggestions.length - 1);
            renderSuggestions();
            return;
        }

        if (event.key === "ArrowUp") {
            if (!suggestions.length) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            highlightedIndex = Math.max(highlightedIndex - 1, 0);
            renderSuggestions();
            return;
        }

        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const highlightedSuggestion = suggestions[highlightedIndex] ?? suggestions[0];
        if (!highlightedSuggestion) {
            return;
        }

        selectGenericExtensionSearchSuggestion(rootRow, highlightedSuggestion).catch((error) => {
            console.error("cinenerdle2.selectGenericExtensionSearchSuggestion.enter", error);
            alert(error.message);
        });
    });
    inputShell.appendChild(input);
    fieldWrap.appendChild(inputShell);

    const suggestionsWrap = document.createElement("div");
    suggestionsWrap.style.position = "absolute";
    suggestionsWrap.style.top = "calc(100% + 6px)";
    suggestionsWrap.style.left = "0";
    suggestionsWrap.style.right = "0";
    suggestionsWrap.style.zIndex = "20";
    suggestionsWrap.style.display = "none";
    suggestionsWrap.style.flexDirection = "column";
    suggestionsWrap.style.gap = "6px";
    suggestionsWrap.style.maxHeight = "180px";
    suggestionsWrap.style.overflowY = "auto";
    suggestionsWrap.style.padding = "8px";
    suggestionsWrap.style.border = "1px solid #243041";
    suggestionsWrap.style.borderRadius = "14px";
    suggestionsWrap.style.backgroundColor = "#0f172a";
    suggestionsWrap.style.boxShadow = "0 18px 40px rgba(0, 0, 0, 0.35)";
    fieldWrap.appendChild(suggestionsWrap);

    function clampHighlightedIndex() {
        const suggestions = genericExtensionSearchState.suggestions;
        if (!suggestions.length) {
            highlightedIndex = -1;
            return;
        }

        if (highlightedIndex < 0 || highlightedIndex >= suggestions.length) {
            highlightedIndex = 0;
        }
    }

    function renderSuggestions() {
        suggestionsWrap.replaceChildren();
        const suggestions = genericExtensionSearchState.suggestions;
        clampHighlightedIndex();
        suggestionsWrap.style.display =
            document.activeElement === input && suggestions.length > 0 ? "flex" : "none";
        suggestions.forEach((suggestion, index) => {
            const suggestionButton = document.createElement("button");
            suggestionButton.type = "button";
            suggestionButton.style.textAlign = "left";
            suggestionButton.style.padding = "8px 10px";
            suggestionButton.style.borderRadius = "10px";
            suggestionButton.style.border = "1px solid #243041";
            suggestionButton.style.backgroundColor = index === highlightedIndex ? "#1e293b" : "#111827";
            suggestionButton.style.color = "#e2e8f0";
            suggestionButton.style.cursor = "pointer";
            suggestionButton.textContent = suggestion.label;
            const handleSuggestionSelect = (event) => {
                event.preventDefault();
                event.stopPropagation();
                selectGenericExtensionSearchSuggestion(rootRow, suggestion).catch((error) => {
                    console.error("cinenerdle2.selectGenericExtensionSearchSuggestion", error);
                    alert(error.message);
                });
            };
            suggestionButton.addEventListener("mouseenter", () => {
                highlightedIndex = index;
                renderSuggestions();
            });
            suggestionButton.addEventListener("pointerdown", handleSuggestionSelect);
            suggestionButton.addEventListener("mousedown", handleSuggestionSelect);
            suggestionButton.addEventListener("click", handleSuggestionSelect);
            suggestionsWrap.appendChild(suggestionButton);
        });
    }

    input.addEventListener("blur", () => {
        stopLiveSuggestionRefresh();
        window.setTimeout(() => {
            renderSuggestions();
        }, 0);
    });

    renderSuggestions();

    return fieldWrap;
}

function loadGenericExtensionPath(pathNodes) {
    resetGenericExtensionSearchState();
    const nextUrl = `${window.location.origin}${window.location.pathname}?generic_extension=${serializeGenericExtensionPath(pathNodes)}`;
    window.history.pushState({}, "", nextUrl);
    maybeShowGenericExtensionEntry("replace").catch((error) => {
        console.error("cinenerdle2.loadGenericExtensionPath", error);
        alert(error.message);
    });
}

function getCurrentSearchSourceEntity(rootRow) {
    let currentRow = rootRow;
    let selectedCard = getSelectedCard(currentRow);
    while (currentRow && selectedCard?.childRow) {
        const childSelectedCard = getSelectedCard(selectedCard.childRow);
        if (!childSelectedCard) {
            break;
        }

        currentRow = selectedCard.childRow;
        selectedCard = childSelectedCard;
    }

    if (!selectedCard) {
        return null;
    }

    if (selectedCard.kind === "cinenerdle") {
        return null;
    }

    return selectedCard.kind === "movie"
        ? {
            kind: "movie",
            id: selectedCard.id ?? "",
            name: selectedCard.name ?? "",
            year: selectedCard.year ?? "",
            key: selectedCard.key ?? getMovieCardKey(selectedCard.name ?? "", selectedCard.year ?? ""),
            label: formatMoviePathLabel(selectedCard.name ?? "", selectedCard.year ?? ""),
        }
        : {
            kind: "person",
            id: selectedCard.id ?? "",
            name: selectedCard.name ?? "",
            key: selectedCard.key ?? getPersonCardKey(selectedCard.name ?? ""),
            label: selectedCard.name ?? "",
        };
}

async function connectGenericExtensionSearchEndpoints(
    rootRow,
    { appendResult = false, insertBeforeResultRowIndex = null } = {},
) {
    const sourceSelection = getCurrentSearchSourceEntity(rootRow);
    const { targetSelection } = genericExtensionSearchState;
    if (!sourceSelection) {
        genericExtensionSearchState.status = "No current source selected";
        renderGenericExtensionStack(rootRow);
        return;
    }

    if (!targetSelection) {
        genericExtensionSearchState.status = "Select a destination first";
        renderGenericExtensionStack(rootRow);
        return;
    }

    genericExtensionSearchState.searching = true;
    genericExtensionSearchState.resultPath = null;
    genericExtensionSearchState.resultPathMetadataByKey = {};
    genericExtensionSearchState.resultPathNeighborCountsByKey = {};
    genericExtensionSearchState.resultSummary = "";
    if (!appendResult) {
        genericExtensionSearchState.resultRows = [];
    }
    genericExtensionSearchState.status = "Searching...";
    renderGenericExtensionStack(rootRow);

    try {
        const startedAt = performance.now();
        const result = await findLocalConnectionPath(
            sourceSelection,
            targetSelection,
            5000,
            genericExtensionSearchState.excludedConnectionNodeKeys,
            genericExtensionSearchState.excludedConnectionEdgeKeys,
        );
        const elapsedSeconds = ((performance.now() - startedAt) / 1000).toFixed(1);
        if (result.path?.length) {
            genericExtensionSearchState.resultPath = result.path;
            const connectionPathRenderState = await buildConnectionPathRenderState(result.path);
            genericExtensionSearchState.resultPathMetadataByKey = connectionPathRenderState.metadataByKey;
            genericExtensionSearchState.resultPathNeighborCountsByKey =
                connectionPathRenderState.neighborCountsByKey;
            genericExtensionSearchState.resultSummary =
                `Found path with ${result.path.length} nodes after reading ${result.nodesRead} nodes in ${elapsedSeconds} seconds.`;
            const newResultRowState = {
                kind: "path",
                path: result.path,
                metadataByKey: connectionPathRenderState.metadataByKey,
                neighborCountsByKey: connectionPathRenderState.neighborCountsByKey,
                summary: genericExtensionSearchState.resultSummary,
                dimmedNodeIndexes: [],
                dimmedEdgeKeys: [],
            };
            if (appendResult) {
                insertGenericExtensionSearchResultRow(newResultRowState, insertBeforeResultRowIndex);
            } else {
                genericExtensionSearchState.resultRows = [newResultRowState];
            }
            genericExtensionSearchState.status = "";
        } else if (result.timedOut) {
            genericExtensionSearchState.status =
                `No connection found in ${elapsedSeconds} seconds after reading ${result.nodesRead} nodes. Searched locally only, no remote lookups.`;
            if (appendResult) {
                insertGenericExtensionSearchResultRow(
                    {
                        kind: "message",
                        summary: genericExtensionSearchState.status,
                    },
                    insertBeforeResultRowIndex,
                );
                genericExtensionSearchState.status = "";
            }
        } else {
            genericExtensionSearchState.status =
                `No connection found in ${elapsedSeconds} seconds after reading ${result.nodesRead} nodes. Searched locally only, no remote lookups.`;
            if (appendResult) {
                insertGenericExtensionSearchResultRow(
                    {
                        kind: "message",
                        summary: genericExtensionSearchState.status,
                    },
                    insertBeforeResultRowIndex,
                );
                genericExtensionSearchState.status = "";
            }
        }
    } catch (error) {
        console.error("cinenerdle2.connectGenericExtensionSearchEndpoints", error);
        genericExtensionSearchState.status = error.message;
    } finally {
        genericExtensionSearchState.searching = false;
        renderGenericExtensionStack(rootRow);
    }
}

function createGenericExtensionSearchBar(rootRow) {
    const wrapper = document.createElement("section");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.gap = "12px";
    wrapper.style.width = getGenericExtensionTrackWidth();
    wrapper.style.maxWidth = getGenericExtensionTrackWidth();
    wrapper.style.minWidth = getGenericExtensionTrackWidth();
    wrapper.style.boxSizing = "border-box";
    wrapper.style.overflow = "visible";
    wrapper.style.position = "relative";
    wrapper.style.zIndex = "3";

    const sourceSelection = getCurrentSearchSourceEntity(rootRow);
    const topRow = document.createElement("div");
    topRow.style.display = "flex";
    topRow.style.alignItems = "center";
    topRow.style.gap = "12px";
    topRow.style.flexWrap = "nowrap";
    topRow.style.width = "100%";
    topRow.style.maxWidth = "100%";
    topRow.style.minWidth = "0";
    topRow.style.boxSizing = "border-box";
    topRow.style.overflow = "visible";

    const sourceChip = document.createElement("div");
    sourceChip.style.display = "flex";
    sourceChip.style.alignItems = "center";
    sourceChip.style.flex = "0 0 280px";
    sourceChip.style.minHeight = "46px";
    sourceChip.style.padding = "0 16px";
    sourceChip.style.border = sourceSelection ? "1px solid #fbbf24" : "1px solid #334155";
    sourceChip.style.borderRadius = "14px";
    sourceChip.style.backgroundColor = "#111827";
    sourceChip.style.color = sourceSelection ? "#e2e8f0" : "#64748b";
    sourceChip.style.fontSize = "14px";
    sourceChip.style.fontWeight = "600";
    sourceChip.style.whiteSpace = "nowrap";
    sourceChip.style.overflowX = "auto";
    sourceChip.style.overflowY = "hidden";
    sourceChip.textContent = sourceSelection ? getSearchEntityLabel(sourceSelection) : "Current selection";
    topRow.appendChild(sourceChip);

    topRow.appendChild(createAutocompleteField(rootRow, "Connect to movie or person"));

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "8px";
    actions.style.flexWrap = "nowrap";
    actions.style.flex = "0 0 auto";
    actions.style.marginLeft = "auto";
    actions.appendChild(
        createBookmarkActionButton(
            "Clear DB",
            async () => {
                try {
                    const estimatedBytes = await estimateIndexedDbUsageBytes();
                    const shouldClearDb = window.confirm(
                        `Clear the DB and reclaim about ${formatByteCount(estimatedBytes)} of local cache?`,
                    );
                    if (!shouldClearDb) {
                        return;
                    }

                    await clearIndexedDb();
                    resetGenericExtensionSearchState();
                    renderGenericExtensionStack(rootRow);
                } catch (error) {
                    console.error("cinenerdle2.clearIndexedDbButton", error);
                    alert(`Failed to clear cinenerdle2 cache: ${error.message}`);
                }
            },
            "danger",
        ),
    );
    topRow.appendChild(actions);
    wrapper.appendChild(topRow);

    if (genericExtensionSearchState.status) {
        const statusRow = document.createElement("div");
        statusRow.style.display = "flex";
        statusRow.style.alignItems = "center";
        statusRow.style.gap = "10px";
        statusRow.style.flexWrap = "wrap";

        const status = document.createElement("div");
        status.textContent = genericExtensionSearchState.status;
        status.style.fontSize = "12px";
        status.style.color = "#94a3b8";
        statusRow.appendChild(status);

        wrapper.appendChild(statusRow);
    }

    genericExtensionSearchState.resultRows.forEach((resultRowState, resultRowIndex) => {
        if (resultRowState.kind === "message") {
            const messageRow = document.createElement("div");
            messageRow.style.display = "flex";
            messageRow.style.alignItems = "center";
            messageRow.style.gap = "8px";
            messageRow.style.padding = "10px 12px";
            messageRow.style.border = "1px solid #243041";
            messageRow.style.borderRadius = "14px";
            messageRow.style.backgroundColor = "#111827";
            messageRow.style.color = "#94a3b8";
            messageRow.style.fontSize = "12px";
            messageRow.textContent = resultRowState.summary ?? "";
            applyHorizontalScrollableRowStyle(messageRow, "4px");
            wrapper.appendChild(messageRow);
            return;
        }

        const resultRow = document.createElement("div");
        resultRow.tabIndex = 0;
        resultRow.style.display = "flex";
        resultRow.style.alignItems = "stretch";
        resultRow.style.gap = "8px";
        resultRow.style.flexWrap = "nowrap";
        resultRow.style.cursor = "pointer";
        applyHorizontalScrollableRowStyle(resultRow, "4px");
        resultRow.addEventListener("click", () => {
            loadGenericExtensionPath(
                resultRowState.path.map(getSearchEntityPathNode),
            );
        });
        const showResultSummaryTooltip = () => {
            if (!resultRowState.summary) {
                return;
            }

            showGenericExtensionTooltip(resultRow, resultRowState.summary);
        };
        resultRow.addEventListener("mouseenter", showResultSummaryTooltip);
        resultRow.addEventListener("focus", showResultSummaryTooltip);
        resultRow.addEventListener("mouseleave", hideGenericExtensionTooltip);
        resultRow.addEventListener("blur", hideGenericExtensionTooltip);

        resultRowState.path.forEach((entity, index) => {
            const isEndpoint = index === 0 || index === resultRowState.path.length - 1;
            const entityBubble = document.createElement("div");
            entityBubble.style.display = "flex";
            entityBubble.style.flexDirection = "column";
            entityBubble.style.alignItems = "flex-start";
            entityBubble.style.gap = "6px";
            entityBubble.style.padding = "8px 10px";
            entityBubble.style.borderRadius = "14px";
            entityBubble.style.border = "1px solid #243041";
            entityBubble.style.backgroundColor = "#111827";
            entityBubble.style.flex = "0 0 auto";
            entityBubble.style.transition = "opacity 120ms ease, background-color 120ms ease, transform 120ms ease";
            entityBubble.style.opacity =
                (resultRowState.dimmedNodeIndexes ?? []).includes(index) ? "0.25" : "1";
            entityBubble.style.cursor = isEndpoint ? "default" : "pointer";
            if (!isEndpoint) {
                entityBubble.addEventListener("mouseenter", () => {
                    entityBubble.style.backgroundColor = "#172033";
                    entityBubble.style.transform = "translateY(-1px)";
                });
                entityBubble.addEventListener("mouseleave", () => {
                    entityBubble.style.backgroundColor = "#111827";
                    entityBubble.style.transform = "none";
                });
                entityBubble.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const dimmedNodeIndexes = new Set(resultRowState.dimmedNodeIndexes ?? []);
                    if (dimmedNodeIndexes.has(index)) {
                        dimmedNodeIndexes.delete(index);
                        resultRowState.dimmedNodeIndexes = Array.from(dimmedNodeIndexes);
                        genericExtensionSearchState.resultRows =
                            genericExtensionSearchState.resultRows.slice(resultRowIndex);
                        syncGenericExtensionSearchExclusionsFromResultRows();
                        renderGenericExtensionStack(rootRow);
                        return;
                    }

                    entityBubble.style.opacity = "0.25";
                    dimmedNodeIndexes.add(index);
                    resultRowState.dimmedNodeIndexes = Array.from(dimmedNodeIndexes);
                    syncGenericExtensionSearchExclusionsFromResultRows();
                    renderGenericExtensionStack(rootRow);
                    connectGenericExtensionSearchEndpoints(
                        rootRow,
                        {
                            appendResult: true,
                            insertBeforeResultRowIndex: resultRowIndex,
                        },
                    ).catch((error) => {
                        console.error("cinenerdle2.excludeConnectionNode", error);
                        alert(error.message);
                    });
                });
            }

            const entityTitle = document.createElement("div");
            entityTitle.textContent = getSearchEntityLabel(entity);
            entityTitle.style.fontSize = "12px";
            entityTitle.style.fontWeight = "600";
            entityTitle.style.color = "#e2e8f0";
            entityTitle.style.whiteSpace = "nowrap";
            entityBubble.appendChild(entityTitle);

            const entitySources =
                resultRowState.metadataByKey[entity.key]?.sources ?? [];
            const sourcesRow = document.createElement("div");
            sourcesRow.style.display = "flex";
            sourcesRow.style.alignItems = "center";
            sourcesRow.style.gap = "8px";
            sourcesRow.style.flexWrap = "nowrap";

            const connectionCount = document.createElement("div");
            connectionCount.textContent =
                `${resultRowState.neighborCountsByKey[entity.key] ?? 0}`;
            connectionCount.style.fontSize = "11px";
            connectionCount.style.fontWeight = "700";
            connectionCount.style.color = "#94a3b8";
            connectionCount.style.whiteSpace = "nowrap";
            sourcesRow.appendChild(connectionCount);
            sourcesRow.appendChild(createSourceBadge(entitySources));
            entityBubble.appendChild(sourcesRow);
            resultRow.appendChild(entityBubble);

            if (index < resultRowState.path.length - 1) {
                const edgeExclusionKey = getSearchEdgeExclusionKey(entity, resultRowState.path[index + 1]);
                const arrowWrap = document.createElement("div");
                arrowWrap.style.display = "flex";
                arrowWrap.style.alignItems = "center";
                arrowWrap.style.justifyContent = "center";
                arrowWrap.style.flex = "0 0 auto";
                arrowWrap.style.alignSelf = "center";
                arrowWrap.style.minWidth = "24px";
                arrowWrap.style.borderRadius = "999px";
                arrowWrap.style.transition = "opacity 120ms ease, background-color 120ms ease, transform 120ms ease";
                arrowWrap.style.opacity =
                    (resultRowState.dimmedEdgeKeys ?? []).includes(edgeExclusionKey) ? "0.25" : "1";
                arrowWrap.style.cursor = "pointer";

                const arrow = document.createElement("div");
                arrow.textContent = "→";
                arrow.style.color = "#94a3b8";
                arrow.style.fontSize = "18px";
                arrow.style.lineHeight = "1";
                arrowWrap.appendChild(arrow);
                arrowWrap.addEventListener("mouseenter", () => {
                    arrowWrap.style.backgroundColor = "rgba(148, 163, 184, 0.12)";
                    arrowWrap.style.transform = "scale(1.05)";
                });
                arrowWrap.addEventListener("mouseleave", () => {
                    arrowWrap.style.backgroundColor = "transparent";
                    arrowWrap.style.transform = "none";
                });
                arrowWrap.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const dimmedEdgeKeys = new Set(resultRowState.dimmedEdgeKeys ?? []);
                    if (dimmedEdgeKeys.has(edgeExclusionKey)) {
                        dimmedEdgeKeys.delete(edgeExclusionKey);
                        resultRowState.dimmedEdgeKeys = Array.from(dimmedEdgeKeys);
                        genericExtensionSearchState.resultRows =
                            genericExtensionSearchState.resultRows.slice(resultRowIndex);
                        syncGenericExtensionSearchExclusionsFromResultRows();
                        renderGenericExtensionStack(rootRow);
                        return;
                    }

                    arrowWrap.style.opacity = "0.25";
                    dimmedEdgeKeys.add(edgeExclusionKey);
                    resultRowState.dimmedEdgeKeys = Array.from(dimmedEdgeKeys);
                    syncGenericExtensionSearchExclusionsFromResultRows();
                    renderGenericExtensionStack(rootRow);
                    connectGenericExtensionSearchEndpoints(
                        rootRow,
                        {
                            appendResult: true,
                            insertBeforeResultRowIndex: resultRowIndex,
                        },
                    ).catch((error) => {
                        console.error("cinenerdle2.excludeConnectionEdge", error);
                        alert(error.message);
                    });
                });
                resultRow.appendChild(arrowWrap);
            }
        });

        wrapper.appendChild(resultRow);
    });

    return wrapper;
}

function createGenericExtensionBookmarksBar(rootRow) {
    const wrapper = document.createElement("section");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "12px";
    wrapper.style.width = getGenericExtensionTrackWidth();
    wrapper.style.maxWidth = getGenericExtensionTrackWidth();
    wrapper.style.minWidth = getGenericExtensionTrackWidth();
    wrapper.style.boxSizing = "border-box";
    wrapper.style.overflow = "visible";

    const homeLink = document.createElement("a");
    homeLink.href = `${window.location.origin}${window.location.pathname}`;
    homeLink.style.display = "inline-flex";
    homeLink.style.alignItems = "center";
    homeLink.style.justifyContent = "center";
    homeLink.style.width = "32px";
    homeLink.style.height = "32px";
    homeLink.style.borderRadius = "10px";
    homeLink.style.border = "1px solid #334155";
    homeLink.style.backgroundColor = "#111827";
    homeLink.style.flex = "0 0 auto";
    homeLink.title = "Reset view";

    const homeIcon = document.createElement("img");
    homeIcon.src = CINENERDLE_ICON_URL;
    homeIcon.alt = "Cinenerdle";
    homeIcon.style.width = "18px";
    homeIcon.style.height = "18px";
    homeIcon.style.borderRadius = "4px";
    homeLink.appendChild(homeIcon);
    wrapper.appendChild(homeLink);

    const title = document.createElement("div");
    title.textContent = "Bookmarks";
    title.style.flex = "0 0 auto";
    title.style.fontSize = "12px";
    title.style.fontWeight = "700";
    title.style.letterSpacing = "0.08em";
    title.style.textTransform = "uppercase";
    title.style.color = "#94a3b8";
    wrapper.appendChild(title);

    const bookmarks = getGenericExtensionBookmarks();

    const bookmarkSelect = document.createElement("select");
    bookmarkSelect.style.flex = "0 0 360px";
    bookmarkSelect.style.maxWidth = "360px";
    bookmarkSelect.style.minWidth = "260px";
    bookmarkSelect.style.height = "46px";
    bookmarkSelect.style.padding = "0 14px";
    bookmarkSelect.style.border = "1px solid #334155";
    bookmarkSelect.style.borderRadius = "14px";
    bookmarkSelect.style.backgroundColor = "#111827";
    bookmarkSelect.style.color = bookmarks.length ? "#e2e8f0" : "#64748b";
    bookmarkSelect.style.fontSize = "14px";
    bookmarkSelect.style.outline = "none";

    if (bookmarks.length === 0) {
        const emptyOption = document.createElement("option");
        emptyOption.textContent = "No bookmarks saved";
        emptyOption.value = "";
        bookmarkSelect.appendChild(emptyOption);
        bookmarkSelect.disabled = true;
    } else {
        const placeholderOption = document.createElement("option");
        placeholderOption.textContent = "Select a bookmark";
        placeholderOption.value = "";
        placeholderOption.selected = true;
        bookmarkSelect.appendChild(placeholderOption);

        bookmarks.forEach((bookmark, index) => {
            const option = document.createElement("option");
            option.value = bookmark.path;
            option.textContent = bookmark.name;
            bookmarkSelect.appendChild(option);
        });
    }
    wrapper.appendChild(bookmarkSelect);

    const getSelectedBookmark = () =>
        bookmarks.find((bookmark) => bookmark.path === bookmarkSelect.value) ?? null;

    wrapper.appendChild(
        createBookmarkActionButton("Save Current View", () => {
            saveCurrentViewAsBookmark(rootRow);
            renderGenericExtensionStack(rootRow);
        }),
    );
    wrapper.appendChild(
        createBookmarkActionButton("Load", () => {
            const bookmark = getSelectedBookmark();
            if (!bookmark) {
                return;
            }

            const nextUrl = `${window.location.origin}${window.location.pathname}?generic_extension=${bookmark.path}`;
            window.history.pushState({}, "", nextUrl);
            maybeShowGenericExtensionEntry("replace").catch((error) => {
                console.error("cinenerdle2.loadBookmark", error);
                alert(error.message);
            });
        }),
    );
    wrapper.appendChild(
        createBookmarkActionButton(
            "Remove",
            () => {
                const bookmark = getSelectedBookmark();
                if (!bookmark) {
                    return;
                }

                saveGenericExtensionBookmarks(
                    getGenericExtensionBookmarks().filter(
                        (existingBookmark) => existingBookmark.path !== bookmark.path,
                    ),
                );
                renderGenericExtensionStack(rootRow);
            },
            "danger",
        ),
    );
    return wrapper;
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
    const tmdbId = card?.record?.tmdbId ?? card?.record?.id;
    if (tmdbId) {
        return (await getFilmRecordById(tmdbId)) ?? card.record;
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
        tmdbId: credit.id ?? null,
        cinenerdleId: getCinenerdleMovieId(title, year),
        title,
        titleLower: normalizeTitle(title),
        year,
        titleYear: getFilmKey(title, year),
        popularity: credit.popularity ?? 0,
        rawTmdbMovie: credit,
    };
}

async function fetchCinenerdleDailyStarterMovies() {
    const response = await fetch(CINENERDLE_DAILY_STARTERS_URL);
    if (!response.ok) {
        throw new Error(`Cinenerdle daily starters lookup failed: ${response.status}`);
    }

    const payload = await response.json();
    return Array.isArray(payload?.data) ? payload.data : [];
}

function createCinenerdleStarterRow(starterMovies) {
    return {
        title: "Daily starters",
        entityType: "movie",
        selectedCardKey: null,
        isRoot: false,
        cards: starterMovies.map(createDailyStarterMovieCard),
    };
}

function createCinenerdleRootCard(connectionCount = null) {
    return {
        key: "cinenerdle",
        kind: "cinenerdle",
        name: "cinenerdle",
        subtitle: "Daily starters",
        imageUrl: CINENERDLE_ICON_URL,
        connectionCount,
        sources: [{ iconUrl: CINENERDLE_ICON_URL, label: "Cinenerdle" }],
        status: null,
        record: null,
        childRow: null,
    };
}

function createDailyStarterMovieCard(starterMovie) {
    const parsedMovie = parseMoviePathLabel(starterMovie?.title ?? "");

    return {
        key: getMovieCardKey(parsedMovie.name, parsedMovie.year, starterMovie?.id),
        kind: "movie",
        name: parsedMovie.name,
        year: parsedMovie.year,
        subtitle: parsedMovie.year || "Movie",
        subtitleDetail: (starterMovie?.genres ?? []).slice(0, 2).join(" • "),
        imageUrl: starterMovie?.posterUrl ?? null,
        connectionCount:
            Math.max(
                new Set(
                    [
                        ...(starterMovie?.cast ?? []),
                        ...(starterMovie?.directors ?? []),
                        ...(starterMovie?.writers ?? []),
                        ...(starterMovie?.composers ?? []),
                    ]
                        .map((personName) => normalizeName(personName))
                        .filter(Boolean),
                ).size,
                1,
            ),
        sources: [{ iconUrl: CINENERDLE_ICON_URL, label: "Cinenerdle daily starter" }],
        status: null,
        record: {
            id: null,
            tmdbId: null,
            cinenerdleId: starterMovie?.id ?? getCinenerdleMovieId(parsedMovie.name, parsedMovie.year),
            title: parsedMovie.name,
            year: parsedMovie.year,
            titleLower: normalizeTitle(parsedMovie.name),
            titleYear: getFilmKey(parsedMovie.name, parsedMovie.year),
            rawCinenerdleDailyStarter: starterMovie,
        },
        childRow: null,
    };
}

async function buildCinenerdleStarterRow() {
    const starterMovies = await fetchCinenerdleDailyStarterMovies();
    return createCinenerdleStarterRow(starterMovies);
}

function createPersonRootCard(personRecord, requestedName) {
    const personName = personRecord?.name ?? requestedName;

    return {
        key: getPersonCardKey(personName, personRecord?.id),
        kind: "person",
        name: personName,
        subtitle: "Person",
        imageUrl: getPersonProfileImageUrl(personRecord),
        popularity: personRecord?.rawTmdbPerson?.popularity,
        connectionCount: getPersonConnectionCountFromRecord(personRecord),
        sources: getPersonSources(personRecord, null, personName),
        status: null,
        record: personRecord,
        childRow: null,
    };
}

function createMovieRootCard(movieRecord, requestedName, connectionCount = null) {
    const movieTitle = movieRecord?.title ?? requestedName;
    const movieYear = getMovieRecordYear(movieRecord);

    return {
        key: getMovieCardKey(movieTitle, movieYear, movieRecord?.id),
        kind: "movie",
        name: movieTitle,
        year: movieYear,
        subtitle: movieYear || "Movie",
        subtitleDetail: "",
        imageUrl: getMoviePosterUrl(movieRecord),
        popularity: movieRecord?.popularity,
        voteAverage: movieRecord?.rawTmdbMovie?.vote_average,
        voteCount: movieRecord?.rawTmdbMovie?.vote_count,
        connectionCount,
        sources: getMovieSources(movieRecord),
        status: null,
        record: movieRecord,
        childRow: null,
    };
}

function createMovieAssociationCard(personRecord, credit, filmRecord = null, connectionCount = null) {
    const title = getMovieTitleFromCredit(credit);
    const year = getMovieYearFromCredit(credit);
    const movieRecord = filmRecord ?? createMovieCardRecordFromCredit(credit);
    const association = buildAssociationPresentation(
        personRecord,
        getMovieKeyFromCredit(credit),
        filmRecord,
    );
    const subtitlePrefix =
        credit.creditType === "cast"
            ? `${year || "Movie"} • Cast as`
            : `${year || "Movie"} • ${credit.job || credit.department || "Crew"}`;
    const subtitleDetail =
        credit.creditType === "cast"
            ? credit.character ?? ""
            : "";

    return {
        key: getMovieCardKey(title, year, credit.id),
        kind: "movie",
        name: title,
        year,
        subtitle: subtitlePrefix,
        subtitleDetail,
        imageUrl: getPosterUrl(credit.poster_path),
        popularity: credit.popularity,
        voteAverage: credit.vote_average,
        voteCount: credit.vote_count,
        connectionCount,
        sources: [
            ...getMovieSources(movieRecord, association.sources.some((source) => source.iconUrl === CINENERDLE_ICON_URL)),
            ...association.sources.filter((source) => source.iconUrl === CINENERDLE_ICON_URL),
        ],
        status: association.status,
        record: movieRecord,
        childRow: null,
    };
}

function hasFetchedTmdbMovie(movieRecord) {
    return !!(
        movieRecord?.rawTmdbMovieSearchResponse ||
        movieRecord?.rawTmdbMovieCreditsResponse
    );
}

function getMovieSources(movieRecord, forceCinenerdle = false) {
    const sources = [];

    if (movieRecord?.rawTmdbMovie || movieRecord?.rawTmdbMovieSearchResponse || movieRecord?.rawTmdbMovieCreditsResponse) {
        sources.push(
            hasFetchedTmdbMovie(movieRecord)
                ? { iconUrl: TMDB_ICON_URL, label: "TMDb" }
                : {
                    iconUrl: TMDB_ICON_URL,
                    label: "TMDb reference only",
                    filter: "grayscale(1)",
                    opacity: "0.9",
                },
        );
    }

    if (forceCinenerdle || movieRecord?.domSnapshot) {
        sources.push({ iconUrl: CINENERDLE_ICON_URL, label: "Cinenerdle" });
    }

    return sources;
}

function updateMovieCardPresentationFromRecord(card, movieRecord) {
    if (!card || !movieRecord) {
        return;
    }

    card.record = movieRecord;
    card.year = getMovieRecordYear(movieRecord) || card.year;
    card.imageUrl = getMoviePosterUrl(movieRecord) ?? card.imageUrl;
    card.popularity = movieRecord?.popularity ?? card.popularity;
    card.voteAverage = movieRecord?.rawTmdbMovie?.vote_average ?? card.voteAverage;
    card.voteCount = movieRecord?.rawTmdbMovie?.vote_count ?? card.voteCount;
    card.connectionCount = getMovieConnectionCountFromRecord(movieRecord);
    const hasCinenerdleSource = (card.sources ?? []).some((source) => source.iconUrl === CINENERDLE_ICON_URL);
    card.sources = getMovieSources(movieRecord, hasCinenerdleSource);
}

function createPersonAssociationCard(credit, movieRecord, cachedPersonRecord = null, connectionCount = null) {
    const personName = cachedPersonRecord?.name ?? credit?.name?.trim() ?? "Unknown";
    const isCastCredit = credit?.creditType === "cast";

    return {
        key: getPersonCardKey(personName, cachedPersonRecord?.id ?? credit?.id),
        kind: "person",
        name: personName,
        subtitle: isCastCredit ? "Cast as" : getTmdbCreditCategoryText(credit),
        subtitleDetail: isCastCredit ? credit?.character ?? "" : "",
        imageUrl:
            getPersonProfileImageUrl(cachedPersonRecord) ??
            getPosterUrl(credit?.profile_path, "w300_and_h450_face"),
        popularity: credit?.popularity,
        connectionCount,
        sources: getPersonSources(cachedPersonRecord, movieRecord, personName),
        status: null,
        record: cachedPersonRecord ?? null,
        childRow: null,
    };
}

function hasFetchedTmdbPerson(personRecord) {
    return !!(
        personRecord?.rawTmdbPerson ||
        personRecord?.rawTmdbPersonSearchResponse ||
        personRecord?.rawTmdbMovieCreditsResponse
    );
}

function getPersonSources(personRecord, movieRecord = null, personName = "") {
    const cinenerdleRole = getCinenerdleRoleFromSnapshot(movieRecord?.domSnapshot, personName);
    const sources = [];

    if (personRecord || personName) {
        sources.push(
            hasFetchedTmdbPerson(personRecord)
                ? { iconUrl: TMDB_ICON_URL, label: "TMDb" }
                : {
                    iconUrl: TMDB_ICON_URL,
                    label: "TMDb reference only",
                    filter: "grayscale(1)",
                    opacity: "0.9",
                },
        );
    }

    if (cinenerdleRole) {
        sources.push({
            iconUrl: CINENERDLE_ICON_URL,
            label: cinenerdleRole,
        });
    } else if ((personRecord?.domConnections?.length ?? 0) > 0) {
        sources.push({
            iconUrl: CINENERDLE_ICON_URL,
            label: "Cinenerdle",
        });
    } else if (movieRecord?.domSnapshot) {
        sources.push({
            iconUrl: CINENERDLE_ICON_URL,
            label: "Cinenerdle loaded for parent, not associated here",
            filter: "grayscale(1)",
            opacity: "0.9",
        });
    }

    return sources;
}

function updatePersonCardPresentationFromRecord(card, personRecord, movieRecord = null) {
    if (!card || !personRecord) {
        return;
    }

    card.record = personRecord;
    card.name = personRecord?.name ?? card.name;
    card.imageUrl = getPersonProfileImageUrl(personRecord) ?? card.imageUrl;
    card.popularity = personRecord?.rawTmdbPerson?.popularity ?? card.popularity;
    card.connectionCount = getPersonConnectionCountFromRecord(personRecord);
    card.sources = getPersonSources(personRecord, movieRecord, card.name);
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
            connectionCount: getCardConnectionCount(card),
            popularity: card.popularity,
            voteAverage: card.voteAverage,
            voteCount: card.voteCount,
            sources: card.sources,
            status: card.status,
            preserveEmptyBottomRow: card.kind === "movie",
        });
    }

    return null;
}

function applyStackCardSelectionStyle(cardElement, isSelected, isLocked = false) {
    cardElement.style.transition = "box-shadow 120ms ease, border-color 120ms ease";
    cardElement.style.borderWidth = isSelected ? "3px" : "1px";
    cardElement.style.borderStyle = "solid";
    cardElement.style.borderColor = isSelected ? "#fbbf24" : "#243041";
    cardElement.style.boxShadow = isSelected
        ? "0 0 0 2px rgba(251, 191, 36, 0.35)"
        : "none";
    cardElement.style.transform = "";
    cardElement.style.outline = "none";
    if (isLocked) {
        cardElement.style.boxShadow = isSelected
            ? "0 0 0 3px rgba(251, 191, 36, 0.5)"
            : "0 0 0 2px rgba(251, 191, 36, 0.35)";
    }
}

function createGenericExtensionCardElement(
    card,
    { isSelected = false, isLocked = false, isAncestorSelected = false, onSelect = null } = {},
) {
    const cardElement = createPosterCard({
        imageUrl: card.imageUrl,
        title: card.name,
        subtitle: card.subtitle,
        subtitleDetail: card.subtitleDetail,
        footer: createStackCardFooter(card),
    });

    applyStackCardSelectionStyle(cardElement, isSelected, isLocked);
    const imageFrame = cardElement.querySelector('[data-cinenerdle2-card-image-frame="true"]');
    if (imageFrame instanceof HTMLElement) {
        imageFrame.style.opacity = isAncestorSelected ? "0.25" : "1";
    }
    cardElement.style.cursor = onSelect ? "pointer" : isLocked ? "default" : "pointer";

    const titleElement = cardElement.querySelector('[data-cinenerdle2-card-title="true"]');
    if (titleElement instanceof HTMLElement) {
        titleElement.style.cursor = "pointer";
        titleElement.style.textDecorationLine = "underline";
        titleElement.style.textDecorationColor = "rgba(148, 163, 184, 0.45)";
        titleElement.style.textDecorationThickness = "1px";
        titleElement.style.textUnderlineOffset = "2px";
        bindGenericExtensionCardTitleTooltip(titleElement, card);
        titleElement.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            loadGenericExtensionPath([getPathNodeFromCard(card)]);
        });
    }

    if (onSelect) {
        cardElement.addEventListener("click", onSelect);
    }

    return cardElement;
}

function createGenericExtensionGenerationBadge(generationNumber) {
    const generationBadge = document.createElement("div");
    generationBadge.textContent = `Gen ${generationNumber}`;
    generationBadge.style.display = "inline-flex";
    generationBadge.style.alignItems = "center";
    generationBadge.style.justifyContent = "center";
    generationBadge.style.alignSelf = "center";
    generationBadge.style.flex = "0 0 auto";
    generationBadge.style.minWidth = "0";
    generationBadge.style.padding = "2px 5px";
    generationBadge.style.marginLeft = "0";
    generationBadge.style.borderRadius = "999px";
    generationBadge.style.border = "1px solid #334155";
    generationBadge.style.background =
        "linear-gradient(180deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.92) 100%)";
    generationBadge.style.color = "#e2e8f0";
    generationBadge.style.boxShadow = "inset 0 1px 0 rgba(255, 255, 255, 0.04)";
    generationBadge.style.fontSize = "9px";
    generationBadge.style.fontWeight = "700";
    generationBadge.style.letterSpacing = "0.02em";
    generationBadge.style.whiteSpace = "nowrap";
    return generationBadge;
}

function createGenericExtensionRowElement(row, rootRow, generationNumber) {
    const sectionRow = createRowSection();
    const ancestorSelectedCards = collectAncestorSelectedCardKeys(rootRow, row);
    sectionRow.section.style.marginLeft = "-8px";
    sectionRow.body.style.display = "flex";
    sectionRow.body.style.alignItems = "flex-start";
    sectionRow.body.style.gap = "8px";
    sectionRow.body.style.flex = "1 1 auto";
    sectionRow.body.style.minWidth = "0";
    sectionRow.body.style.overflow = "visible";
    applyHorizontalScrollableRowStyle(sectionRow.body, "8px");
    sectionRow.body.appendChild(createGenericExtensionGenerationBadge(generationNumber));

    if ((row.cards ?? []).length === 0) {
        sectionRow.body.appendChild(createChip("No associated items found"));
        return sectionRow.section;
    }

    row.cards.forEach((card) => {
        sectionRow.body.appendChild(
            createGenericExtensionCardElement(card, {
                isSelected: row.selectedCardKey === card.key,
                isLocked: row.isRoot,
                isAncestorSelected: ancestorSelectedCards.some((ancestorCard) =>
                    matchesPathNode(card, getPathNodeFromCard(ancestorCard))),
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
    const pageBackground =
        "linear-gradient(180deg, #020617 0%, #08111f 24%, #0d1730 58%, #172554 100%)";


    document.documentElement.style.margin = "0";
    document.documentElement.style.height = "100%";
    document.documentElement.style.minHeight = "100%";
    document.documentElement.style.background = pageBackground;
    document.body.style.margin = "0";
    document.body.style.height = "100%";
    document.body.style.minHeight = "100vh";
    document.body.style.background = pageBackground;
    document.body.style.overflowY = "hidden";
    document.body.style.overflowX = "hidden";
    document.body.style.color = "#f8fafc";
    document.body.style.fontFamily =
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    document.title = `${getCurrentGenericExtensionTitle(rootRow)} | cinenerdle2`;
    setCinenerdleFavicon();

    const appRoot = document.createElement("div");
    appRoot.style.display = "flex";
    appRoot.style.flexDirection = "column";
    appRoot.style.gap = "20px";
    appRoot.style.height = "100vh";
    appRoot.style.overflowY = "scroll";
    appRoot.style.overflowX = "hidden";
    appRoot.style.padding = `${GENERIC_EXTENSION_PAGE_PADDING_PX}px`;
    appRoot.style.boxSizing = "border-box";
    appRoot.style.background = "transparent";

    appRoot.appendChild(createGenericExtensionBookmarksBar(rootRow));
    appRoot.appendChild(createGenericExtensionSearchBar(rootRow));

    const visibleRows = getVisibleGenericExtensionRows(rootRow);
    visibleRows
        .slice()
        .reverse()
        .forEach((row) => {
            const generationNumber = visibleRows.indexOf(row);
            appRoot.appendChild(createGenericExtensionRowElement(row, rootRow, generationNumber));
        });

    document.body.replaceChildren(appRoot);
    restoreGenericExtensionSearchInputFocus();
}

async function buildMovieRowForPersonCard(card) {
    const personRecord = await ensurePersonRecordByName(card.name);
    updatePersonCardPresentationFromRecord(card, personRecord);

    const movieCredits = getUniqueSortedTmdbMovieCredits(personRecord);
    const filmRecordsById = await getFilmRecordsByIds(movieCredits.map((credit) => credit.id));
    const connectionCountsByMovieKey = new Map(
        await Promise.all(
            movieCredits.map(async (credit) => {
                const matchingPeople = await getPersonRecordsByMovieKey(getMovieKeyFromCredit(credit));
                return [getMovieKeyFromCredit(credit), Math.max(matchingPeople.length, 1)];
            }),
        ),
    );

    return {
        title: "Movies",
        entityType: "movie",
        selectedCardKey: null,
        isRoot: false,
        cards: movieCredits.map((credit) =>
            createMovieAssociationCard(
                personRecord,
                credit,
                filmRecordsById.get(credit.id) ?? null,
                connectionCountsByMovieKey.get(getMovieKeyFromCredit(credit)) ?? 1,
            ),
        ),
    };
}

async function buildPersonRowForMovieCard(card) {
    const movieRecord = await ensureMovieCreditsRecord(await ensureMovieRecordForCard(card));
    updateMovieCardPresentationFromRecord(card, movieRecord);

    const tmdbCredits = getAssociatedPeopleFromMovieCredits(movieRecord);
    const cachedPersonRecords = await Promise.all(
        tmdbCredits.map((credit) => getPersonRecordByName(credit.name ?? "")),
    );
    const connectionCountsByPersonName = new Map(
        await Promise.all(
            tmdbCredits.map(async (credit) => {
                const personName = credit.name ?? "";
                const matchingFilms = await getFilmRecordsByPersonConnectionKey(personName);
                return [normalizeName(personName), Math.max(matchingFilms.length, 1)];
            }),
        ),
    );

    const cards = tmdbCredits.map((credit, index) =>
        createPersonAssociationCard(
            credit,
            movieRecord,
            cachedPersonRecords[index] ?? null,
            connectionCountsByPersonName.get(normalizeName(credit.name ?? "")) ?? 1,
        ),
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
    if (card.kind === "cinenerdle") {
        return buildCinenerdleStarterRow();
    }

    if (card.kind === "person") {
        return buildMovieRowForPersonCard(card);
    }

    if (card.kind === "movie") {
        return buildPersonRowForMovieCard(card);
    }

    return null;
}

async function selectGenericExtensionCard(rootRow, row, card, historyMode = "push") {
    if (!row || !card) {
        return;
    }

    resetGenericExtensionSearchState();

    if (row.selectedCardKey === card.key) {
        row.selectedCardKey = null;
        renderGenericExtensionStack(rootRow);
        updateGenericExtensionHistory(rootRow, historyMode);
        return;
    }

    row.selectedCardKey = card.key;
    renderGenericExtensionStack(rootRow);
    updateGenericExtensionHistory(rootRow, historyMode);

    if (!card.childRow) {
        card.childRow = await buildChildRowForCard(card);
    }

    renderGenericExtensionStack(rootRow);
}

async function createRootRowFromPathNode(pathNode) {
    if (pathNode.kind === "cinenerdle") {
        const starterMovies = await fetchCinenerdleDailyStarterMovies();
        const rootCard = createCinenerdleRootCard(Math.max(starterMovies.length, 1));
        rootCard.childRow = createCinenerdleStarterRow(starterMovies);
        return {
            title: "Cinenerdle",
            entityType: "cinenerdle",
            selectedCardKey: rootCard.key,
            isRoot: true,
            cards: [rootCard],
        };
    }

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
        const rootConnectionCount = Math.max(
            movieRecord?.personConnectionKeys?.length ?? 0,
            (await getPersonRecordsByMovieKey(getFilmKey(pathNode.name, pathNode.year))).length,
            1,
        );
        const rootCard = createMovieRootCard(movieRecord, pathNode.name, rootConnectionCount);
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

async function createRootRowFromSegment(segment) {
    if (normalizeTitle(segment) === "cinenerdle") {
        return createRootRowFromPathNode(createPathNode("cinenerdle", "cinenerdle"));
    }

    const prefersMovie = /\(\d{4}\)$/.test(segment);
    const attempts = prefersMovie
        ? [
            () => createRootRowFromPathNode(parseMoviePathLabel(segment)),
            () => createRootRowFromPathNode(createPathNode("person", segment)),
        ]
        : [
            () => createRootRowFromPathNode(createPathNode("person", segment)),
            () => createRootRowFromPathNode(parseMoviePathLabel(segment)),
        ];

    for (const attempt of attempts) {
        try {
            const rootRow = await attempt();
            if (rootRow) {
                return rootRow;
            }
        } catch (error) {
            console.warn("cinenerdle2.createRootRowFromSegment", segment, error);
        }
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

async function buildGenericExtensionRootRow(rootSegment) {
    if (!rootSegment) {
        return null;
    }

    if (
        genericExtensionRootRow &&
        normalizeTitle(getPathNodeLabel(getPathNodeFromCard(getSelectedCard(genericExtensionRootRow)))) ===
        normalizeTitle(rootSegment)
    ) {
        return genericExtensionRootRow;
    }

    return createRootRowFromSegment(rootSegment);
}

async function maybeShowGenericExtensionEntry(historyMode = "replace") {
    const genericExtensionValue = getGenericExtensionEntryUrl();
    if (!genericExtensionValue) {
        return false;
    }

    const pathSegments = parseGenericExtensionSegments(genericExtensionValue);
    if (pathSegments.length === 0) {
        return false;
    }

    const rootRow = await buildGenericExtensionRootRow(pathSegments[0]);
    if (!rootRow) {
        return false;
    }

    const resolvedRootCard = getSelectedCard(rootRow);
    const pathNodes = buildGenericExtensionPathNodes(resolvedRootCard?.kind, pathSegments);
    if (pathNodes.length === 0) {
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

async function handleMovieClick(movieTitle, movieYear = "", sourceElement, targetWindow = null) {
    const domFilmSnapshot = parseDomFilmSnapshotFromElement(sourceElement);
    const resolvedMovieYear = movieYear || domFilmSnapshot?.year || "";
    const existingMovieRecord =
        (await getFilmRecordByTitleAndYear(movieTitle, resolvedMovieYear)) ??
        (await getFilmRecordsByTitle(movieTitle)).find(
            (record) =>
                normalizeTitle(record.title) === normalizeTitle(movieTitle) &&
                (!resolvedMovieYear || record.year === resolvedMovieYear),
        ) ??
        null;

    if (existingMovieRecord) {
        await syncDomSnapshotToCachedRecords(domFilmSnapshot);
    } else {
        await fetchAndCacheMovie(movieTitle, domFilmSnapshot, resolvedMovieYear);
    }

    const targetUrl = getGenericExtensionUrl(
        "movie",
        movieTitle,
        existingMovieRecord?.year ?? resolvedMovieYear,
    );
    if (targetWindow) {
        targetWindow.location.href = targetUrl;
        return;
    }

    openGenericExtensionPage(
        "movie",
        movieTitle,
        existingMovieRecord?.year ?? resolvedMovieYear,
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

function buildMovieDatabaseTooltip(filmTitleAndYear, filmRecords, domFilmSnapshot = null) {
    const matchingFilmRecords = (filmRecords ?? []).filter(
        (record) =>
            normalizeTitle(record?.title ?? "") === normalizeTitle(filmTitleAndYear.title) &&
            (!filmTitleAndYear.year || record?.year === filmTitleAndYear.year),
    );

    const mergedPeopleByRole = {};
    matchingFilmRecords.forEach((record) => {
        Object.entries(record?.domSnapshot?.peopleByRole ?? {}).forEach(([role, people]) => {
            mergedPeopleByRole[role] = Array.from(
                new Set([...(mergedPeopleByRole[role] ?? []), ...people]),
            );
        });
    });
    Object.entries(domFilmSnapshot?.peopleByRole ?? {}).forEach(([role, people]) => {
        mergedPeopleByRole[role] = Array.from(
            new Set([...(mergedPeopleByRole[role] ?? []), ...people]),
        );
    });

    const combinedEntry = {
        title: filmTitleAndYear.title,
        year: filmTitleAndYear.year,
        ids: {
            tmdb: Array.from(
                new Set(
                    matchingFilmRecords
                        .map((record) => record?.tmdbId ?? record?.id)
                        .filter(Boolean),
                ),
            ),
            cinenerdle: getCinenerdleMovieId(filmTitleAndYear.title, filmTitleAndYear.year) || null,
        },
        popularity:
            matchingFilmRecords.find((record) => typeof record?.popularity === "number")?.popularity ??
            null,
        tmdbMovie: matchingFilmRecords.some((record) => !!record?.rawTmdbMovie),
        tmdbSearch: matchingFilmRecords.some((record) => !!record?.rawTmdbMovieSearchResponse),
        tmdbCredits: matchingFilmRecords.some((record) => !!record?.rawTmdbMovieCreditsResponse),
        cinenerdleDom:
            matchingFilmRecords.some((record) => !!record?.domSnapshot) || !!domFilmSnapshot,
        peopleByRole: mergedPeopleByRole,
        tmdbSavedAt:
            matchingFilmRecords.find((record) => record?.tmdbSavedAt)?.tmdbSavedAt ?? null,
        tmdbCreditsSavedAt:
            matchingFilmRecords.find((record) => record?.tmdbCreditsSavedAt)?.tmdbCreditsSavedAt ?? null,
        domSavedAt:
            matchingFilmRecords.find((record) => record?.domSnapshot?.domSavedAt)?.domSnapshot?.domSavedAt ??
            domFilmSnapshot?.domSavedAt ??
            null,
    };

    return JSON.stringify(combinedEntry, null, 2);
}

function buildPersonDatabaseTooltip(personName, personRecord = null) {
    const combinedEntry = {
        name: personName,
        ids: {
            tmdb: personRecord?.tmdbId ?? personRecord?.id ?? null,
            cinenerdle: getCinenerdlePersonId(personName) || null,
        },
        popularity: personRecord?.rawTmdbPerson?.popularity ?? null,
        tmdbPerson: !!personRecord?.rawTmdbPerson,
        tmdbSearch: !!personRecord?.rawTmdbPersonSearchResponse,
        tmdbCredits: !!personRecord?.rawTmdbMovieCreditsResponse,
        cinenerdleDom: (personRecord?.domConnections?.length ?? 0) > 0,
        movieConnectionKeys:
            Array.isArray(personRecord?.movieConnectionKeys)
                ? personRecord.movieConnectionKeys.length
                : null,
        domConnections:
            Array.isArray(personRecord?.domConnections)
                ? personRecord.domConnections.length
                : null,
        savedAt: personRecord?.savedAt ?? null,
    };

    return JSON.stringify(combinedEntry, null, 2);
}

function getGenericExtensionTooltipElement() {
    if (genericExtensionTooltipElement?.isConnected) {
        return genericExtensionTooltipElement;
    }

    const tooltip = document.createElement("div");
    tooltip.style.position = "fixed";
    tooltip.style.zIndex = "9999";
    tooltip.style.display = "none";
    tooltip.style.maxWidth = "min(520px, calc(100vw - 24px))";
    tooltip.style.maxHeight = "min(60vh, 520px)";
    tooltip.style.overflow = "auto";
    tooltip.style.padding = "12px 14px";
    tooltip.style.border = "1px solid #334155";
    tooltip.style.borderRadius = "14px";
    tooltip.style.background = "rgba(15, 23, 42, 0.98)";
    tooltip.style.boxShadow = "0 20px 48px rgba(0, 0, 0, 0.45)";
    tooltip.style.backdropFilter = "blur(10px)";
    tooltip.style.pointerEvents = "none";
    tooltip.style.whiteSpace = "pre-wrap";
    tooltip.style.fontFamily =
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';
    tooltip.style.fontSize = "12px";
    tooltip.style.lineHeight = "1.45";
    tooltip.style.color = "#e2e8f0";
    document.body.appendChild(tooltip);
    genericExtensionTooltipElement = tooltip;
    return tooltip;
}

function positionGenericExtensionTooltip(anchorElement) {
    const tooltip = getGenericExtensionTooltipElement();
    const anchorRect = anchorElement.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportPadding = 12;
    let left = anchorRect.left;
    let top = anchorRect.bottom + 8;

    if (left + tooltipRect.width > window.innerWidth - viewportPadding) {
        left = window.innerWidth - tooltipRect.width - viewportPadding;
    }
    if (left < viewportPadding) {
        left = viewportPadding;
    }

    if (top + tooltipRect.height > window.innerHeight - viewportPadding) {
        top = anchorRect.top - tooltipRect.height - 8;
    }
    if (top < viewportPadding) {
        top = viewportPadding;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
}

function showGenericExtensionTooltip(anchorElement, text) {
    const tooltip = getGenericExtensionTooltipElement();
    tooltip.textContent = text;
    tooltip.style.display = "block";
    positionGenericExtensionTooltip(anchorElement);
}

function hideGenericExtensionTooltip() {
    const tooltip = getGenericExtensionTooltipElement();
    tooltip.style.display = "none";
}

function bindGenericExtensionCardTitleTooltip(titleElement, card) {
    if (!(titleElement instanceof HTMLElement) || !card) {
        return;
    }

    const updateTooltip = async () => {
        if (card.kind === "cinenerdle") {
            return JSON.stringify(
                {
                    name: "cinenerdle",
                    kind: "cinenerdle",
                    source: CINENERDLE_DAILY_STARTERS_URL,
                    connectionCount: card.connectionCount ?? null,
                },
                null,
                2,
            );
        }

        if (card.kind === "movie") {
            const filmRecords = await getFilmRecordsByTitle(card.name);
            return buildMovieDatabaseTooltip(
                { title: card.name, year: card.year ?? "" },
                card.record ? [card.record, ...filmRecords] : filmRecords,
                card.record?.domSnapshot ?? null,
            );
        }

        const personRecord =
            card.record ??
            await getPersonRecordByName(card.name);
        return buildPersonDatabaseTooltip(card.name, personRecord);
    };

    titleElement.addEventListener("mouseenter", () => {
        updateTooltip().then((tooltipText) => {
            showGenericExtensionTooltip(titleElement, tooltipText);
        }).catch((error) => {
            console.error("cinenerdle2.bindGenericExtensionCardTitleTooltip", error);
        });
    });
    titleElement.addEventListener("focus", () => {
        updateTooltip().then((tooltipText) => {
            showGenericExtensionTooltip(titleElement, tooltipText);
        }).catch((error) => {
            console.error("cinenerdle2.bindGenericExtensionCardTitleTooltip", error);
        });
    });
    titleElement.addEventListener("mouseleave", hideGenericExtensionTooltip);
    titleElement.addEventListener("blur", hideGenericExtensionTooltip);
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
    const domFilmSnapshot = parseDomFilmSnapshotFromElement(titleElement);

    titleElement.setAttribute(MOVIE_BOUND_ATTR, "true");
    applyLoadedStyle(titleElement, false);
    titleElement.title = buildMovieDatabaseTooltip(filmTitleAndYear, [], domFilmSnapshot);

    getFilmRecordsByTitle(filmTitleAndYear.title)
        .then((filmRecords) => {
            titleElement.title = buildMovieDatabaseTooltip(
                filmTitleAndYear,
                filmRecords,
                domFilmSnapshot,
            );
            applyLoadedStyle(
                titleElement,
                filmRecords.some(
                    (record) =>
                        normalizeTitle(record.title) === normalizeTitle(filmTitleAndYear.title) &&
                        (!filmTitleAndYear.year || record.year === filmTitleAndYear.year),
                ),
            );
        })
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
            handleMovieClick(
                filmTitleAndYear.title,
                filmTitleAndYear.year,
                titleElement,
                targetWindow,
            ).catch((error) => {
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
    if (practiceModeEl) {
        bindPracticeModeClick(practiceModeEl);
    }

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
    if (!document.body) {
        return;
    }

    console.log(
        "cinenerdle2.tmdbApiKey",
        localStorage.getItem(TMDB_API_KEY_STORAGE_KEY)?.trim() ?? null,
    );

    if (isGenericExtensionEntryPage() && !getGenericExtensionEntryUrl()) {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete("generic_extension");
        const baseHref = `${currentUrl.origin}${currentUrl.pathname}${currentUrl.search}`;
        const separator = baseHref.includes("?") ? "&" : "?";
        window.location.replace(`${baseHref}${separator}generic_extension=cinenerdle`);
        return;
    }

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

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main, { once: true });
} else {
    main();
}
