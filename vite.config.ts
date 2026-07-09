import { defineConfig } from "vite";
import type { Plugin } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import fs from "node:fs/promises";
import type { IncomingMessage } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

export interface CloudFunctionEvent {
  action?: string;
  payload?: Record<string, unknown>;
}

export interface CloudFunctionResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

interface LocalCollectionRecord {
  _id: string;
  [key: string]: unknown;
}

interface LocalCollectionFile {
  records: LocalCollectionRecord[];
}

type CloudFunctionMain = (event: CloudFunctionEvent) => Promise<CloudFunctionResponse>;

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [studyPetLocalProxy(), uni()],
});

function studyPetLocalProxy(): Plugin {
  const dataDir = path.join(projectRoot, ".local-data");
  const functionPath = getStudyPetCloudFunctionPath();
  const invokeCloudFunction = createReloadingCloudFunctionInvoker({
    getVersion: () => getFileVersion(functionPath),
    load: () => loadStudyPetCloudFunction(dataDir),
  });

  return {
    name: "study-pet-local-proxy",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/study-pet", async (req, res) => {
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ success: false, message: "Only POST is supported" }));
          return;
        }

        try {
          const event = parseCloudFunctionEvent(await readRequestBody(req));
          const result = await invokeCloudFunction(event);
          res.end(JSON.stringify(result));
        } catch (error) {
          res.statusCode = 500;
          res.end(
            JSON.stringify({
              success: false,
              message: error instanceof Error ? error.message : "Local debug proxy failed",
            }),
          );
        }
      });
    },
  };
}

export function createReloadingCloudFunctionInvoker(options: {
  getVersion: () => string | number | Promise<string | number>;
  load: () => CloudFunctionMain;
}): CloudFunctionMain {
  let cachedVersion: string | number | null = null;
  let cachedMain: CloudFunctionMain | null = null;

  return async (event) => {
    const nextVersion = await options.getVersion();

    if (!cachedMain || cachedVersion !== nextVersion) {
      cachedMain = options.load();
      cachedVersion = nextVersion;
    }

    return cachedMain(event);
  };
}

function loadStudyPetCloudFunction(dataDir: string): CloudFunctionMain {
  const require = createRequire(import.meta.url);
  const functionPath = getStudyPetCloudFunctionPath();
  const globalWithUniCloud = globalThis as typeof globalThis & {
    uniCloud?: { database: () => ReturnType<typeof createLocalUniCloudDatabase> };
  };
  const previousUniCloud = globalWithUniCloud.uniCloud;

  globalWithUniCloud.uniCloud = {
    database: () => createLocalUniCloudDatabase(dataDir),
  };

  try {
    delete require.cache[require.resolve(functionPath)];
    const cloudFunction = require(functionPath) as { main: CloudFunctionMain };
    return cloudFunction.main;
  } finally {
    if (previousUniCloud) {
      globalWithUniCloud.uniCloud = previousUniCloud;
    } else {
      delete globalWithUniCloud.uniCloud;
    }
  }
}

function getStudyPetCloudFunctionPath() {
  return path.join(projectRoot, "uniCloud-alipay", "cloudfunctions", "study-pet", "index.js");
}

async function getFileVersion(filePath: string) {
  const stats = await fs.stat(filePath);
  return `${stats.mtimeMs}:${stats.size}`;
}

function createLocalUniCloudDatabase(dataDir: string) {
  const collections = new Map<string, ReturnType<typeof createLocalCollection>>();

  return {
    collection(name: string) {
      if (!["study_pet_progress", "study_pet_users"].includes(name)) {
        throw new Error(`Unsupported local collection: ${name}`);
      }

      if (!collections.has(name)) {
        collections.set(name, createLocalCollection(getCollectionFile(dataDir, name)));
      }

      return collections.get(name);
    },
  };
}

function createLocalCollection(dataFile: string) {
  let writeQueue = Promise.resolve();

  const withWriteLock = <T>(task: () => Promise<T>) => {
    const current = writeQueue.then(task, task);
    writeQueue = current.then(
      () => undefined,
      () => undefined,
    );
    return current;
  };

  return {
    where(query: Partial<LocalCollectionRecord>) {
      return {
        limit(count: number) {
          return {
            async get() {
              const file = await readCollectionFile(dataFile);
              return {
                data: file.records.filter((record) => matchesQuery(record, query)).slice(0, count),
              };
            },
          };
        },
      };
    },

    doc(id: string) {
      return {
        update(patch: Partial<LocalCollectionRecord>) {
          return withWriteLock(async () => {
            const file = await readCollectionFile(dataFile);
            const index = file.records.findIndex((record) => record._id === id);

            if (index >= 0) {
              file.records[index] = {
                ...file.records[index],
                ...patch,
              };
              await writeCollectionFile(dataFile, file);
            }
          });
        },

        remove() {
          return withWriteLock(async () => {
            const file = await readCollectionFile(dataFile);
            const records = file.records.filter((record) => record._id !== id);

            if (records.length !== file.records.length) {
              await writeCollectionFile(dataFile, { records });
            }
          });
        },
      };
    },

    add(record: Omit<LocalCollectionRecord, "_id">) {
      return withWriteLock(async () => {
        const file = await readCollectionFile(dataFile);
        const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        file.records.push({
          _id: id,
          ...record,
        });
        await writeCollectionFile(dataFile, file);
        return { id };
      });
    },
  };
}

function getCollectionFile(dataDir: string, collectionName: string) {
  if (collectionName === "study_pet_progress") {
    return path.join(dataDir, "study-pet-progress.json");
  }

  return path.join(dataDir, "study-pet-users.json");
}

async function readCollectionFile(dataFile: string): Promise<LocalCollectionFile> {
  try {
    const content = await fs.readFile(dataFile, "utf8");
    const parsed = JSON.parse(content) as Partial<LocalCollectionFile>;

    if (Array.isArray(parsed.records)) {
      return { records: parsed.records };
    }
  } catch (error) {
    if (!isMissingFileError(error)) {
      throw error;
    }
  }

  return { records: [] };
}

async function writeCollectionFile(dataFile: string, file: LocalCollectionFile) {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  await fs.writeFile(dataFile, `${JSON.stringify(file, null, 2)}\n`, "utf8");
}

function matchesQuery(record: LocalCollectionRecord, query: Partial<LocalCollectionRecord>) {
  return Object.entries(query).every(([key, value]) => record[key] === value);
}

function parseCloudFunctionEvent(body: string): CloudFunctionEvent {
  if (!body.trim()) {
    return {};
  }

  return JSON.parse(body) as CloudFunctionEvent;
}

function readRequestBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = "";

    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;

      if (body.length > 1024 * 1024) {
        reject(new Error("Request body is too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function isMissingFileError(error: unknown) {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
