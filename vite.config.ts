import { defineConfig } from "vite";
import type { Plugin } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

interface CloudFunctionEvent {
  action?: string;
  payload?: Record<string, unknown>;
}

interface CloudFunctionResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

interface LocalProgressRecord {
  _id: string;
  clientId: string;
  progress: unknown;
  createdAt: string;
  updatedAt: string;
}

interface LocalProgressFile {
  records: LocalProgressRecord[];
}

type CloudFunctionMain = (event: CloudFunctionEvent) => Promise<CloudFunctionResponse>;

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [studyPetLocalProxy(), uni()],
});

function studyPetLocalProxy(): Plugin {
  const dataFile = path.join(projectRoot, ".local-data", "study-pet-progress.json");
  let invokeCloudFunction: CloudFunctionMain | null = null;

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
          invokeCloudFunction ||= loadStudyPetCloudFunction(dataFile);
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

function loadStudyPetCloudFunction(dataFile: string): CloudFunctionMain {
  const require = createRequire(import.meta.url);
  const functionPath = path.join(projectRoot, "uniCloud-alipay", "cloudfunctions", "study-pet", "index.js");
  const globalWithUniCloud = globalThis as typeof globalThis & {
    uniCloud?: { database: () => ReturnType<typeof createLocalUniCloudDatabase> };
  };
  const previousUniCloud = globalWithUniCloud.uniCloud;

  globalWithUniCloud.uniCloud = {
    database: () => createLocalUniCloudDatabase(dataFile),
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

function createLocalUniCloudDatabase(dataFile: string) {
  const progressCollection = createLocalProgressCollection(dataFile);

  return {
    collection(name: string) {
      if (name !== "study_pet_progress") {
        throw new Error(`Unsupported local collection: ${name}`);
      }

      return progressCollection;
    },
  };
}

function createLocalProgressCollection(dataFile: string) {
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
    where(query: Partial<LocalProgressRecord>) {
      return {
        limit(count: number) {
          return {
            async get() {
              const file = await readProgressFile(dataFile);
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
        update(patch: Partial<LocalProgressRecord>) {
          return withWriteLock(async () => {
            const file = await readProgressFile(dataFile);
            const index = file.records.findIndex((record) => record._id === id);

            if (index >= 0) {
              file.records[index] = {
                ...file.records[index],
                ...patch,
              };
              await writeProgressFile(dataFile, file);
            }
          });
        },

        remove() {
          return withWriteLock(async () => {
            const file = await readProgressFile(dataFile);
            const records = file.records.filter((record) => record._id !== id);

            if (records.length !== file.records.length) {
              await writeProgressFile(dataFile, { records });
            }
          });
        },
      };
    },

    add(record: Omit<LocalProgressRecord, "_id">) {
      return withWriteLock(async () => {
        const file = await readProgressFile(dataFile);
        const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        file.records.push({
          _id: id,
          ...record,
        });
        await writeProgressFile(dataFile, file);
        return { id };
      });
    },
  };
}

async function readProgressFile(dataFile: string): Promise<LocalProgressFile> {
  try {
    const content = await fs.readFile(dataFile, "utf8");
    const parsed = JSON.parse(content) as Partial<LocalProgressFile>;

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

async function writeProgressFile(dataFile: string, file: LocalProgressFile) {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  await fs.writeFile(dataFile, `${JSON.stringify(file, null, 2)}\n`, "utf8");
}

function matchesQuery(record: LocalProgressRecord, query: Partial<LocalProgressRecord>) {
  return Object.entries(query).every(([key, value]) => record[key as keyof LocalProgressRecord] === value);
}

function parseCloudFunctionEvent(body: string): CloudFunctionEvent {
  if (!body.trim()) {
    return {};
  }

  return JSON.parse(body) as CloudFunctionEvent;
}

function readRequestBody(req: NodeJS.ReadableStream) {
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
