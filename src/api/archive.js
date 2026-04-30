const ARCHIVE_BASE = "https://archive.org";

export async function searchArchive(title) {
    const encoded = encodeURIComponent(title);

    const url= `${ARCHIVE_BASE}/advancedsearch.php?q=title:(${encoded})+AND+mediatype:movies&fl=identifier,title,year,description,subject&output=json&rows=5`;
    const res = await fetch(url);
    const data = await res.json();

    return data.response?.docs || [];
}

export function getArchiveEmbedUrl(identifier) {
    return `${ARCHIVE_BASE}/embed/${identifier}`;
}

export function getArchiveThumbnail(identifier) {
    return `${ARCHIVE_BASE}/services/img/${identifier}`;
}

export async function getFreeMovies(page = 1) {
    const start = (page - 1) * 20;
    const url = `${ARCHIVE_BASE}/advancedsearch.php?q=mediatype:movies+AND+subject:(feature+film)+AND+language:English&fl=identifier,title,year,description,subject,downloads&sort[]=downloads+desc&output=json&rows=20&start=${start}`;

    const res = await fetch(url);
    const data = await res.json();
    return {
        movies: data.response?.docs || [],
        total: data.response?.numFound || 0,
    };
}

export async function findMovieOnArchive(title, year) {
    const results = await searchArchive(`${title} ${year}`);

    if (!results.length) return null;

    const match = results.find(r =>
        r.title?.toLowerCase().includes(title.toLowerCase())
    );

    return match || results[0] || null;
}