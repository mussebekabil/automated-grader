import { existsSync } from "./deps/deno_test_deps.ts";
import whitelistedLibraries from "./whitelisted_libraries.ts";

const getFilesInFolder = (folder: string) => {
  let files: string[] = [];

  if(!existsSync(folder)) {
    return files;
  }

  for (const dirEntry of Deno.readDirSync(folder)) {
    const entryPath = `${folder}/${dirEntry.name}`;

    if (
      entryPath.endsWith(".js") || entryPath.endsWith(".ts") ||
      entryPath.endsWith(".jsx") || entryPath.endsWith(".tsx")
    ) {
      files.push(entryPath);
    }

    if (dirEntry.isDirectory) {
      files = files.concat(getFilesInFolder(entryPath));
    }
  }

  return files;
};

const getLibraryUrlsFromFiles = (files: string[]) => {
  const importExportRegex = /from.*[\'|"](?<url>http.*)[\'|"]/g;

  let urls: string[] = [];

  for (const file of files) {
    const fileContent = (Deno.readTextFileSync(file)).toLowerCase();

    for (const match of fileContent.matchAll(importExportRegex)) {
      if (match && match.groups && match.groups.url) {
        urls.push(match.groups.url);
      }
    }
  }

  return urls;
};

const listNonWhitelistedLibraries = (folder: string) => {
  const files = getFilesInFolder(folder);

  let libraryUrls: string[] = getLibraryUrlsFromFiles(files);
  libraryUrls = [...new Set(libraryUrls)];

  const blacklistedLibraries = [];

  for (const url of libraryUrls) {
    if (!whitelistedLibraries.includes(url)) {
      blacklistedLibraries.push(url);
    }
  }

  return blacklistedLibraries;
};

export { listNonWhitelistedLibraries };
