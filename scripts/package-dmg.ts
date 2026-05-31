import { cp, mkdir, readdir, rm, stat, symlink } from "node:fs/promises";
import { join, resolve } from "node:path";

type PackageJson = {
  version: string;
};

const packageJson = (await Bun.file("package.json").json()) as PackageJson;

const appName = process.env.APP_NAME ?? "LocMock";
const buildTarget = process.env.BUILD_TARGET ?? "macos-arm64";
const artifactArch = process.env.ARTIFACT_ARCH ?? "mac-arm64";
const buildDir = resolve(process.env.BUILD_DIR ?? `build/stable-${buildTarget}`);
const releaseDir = resolve(process.env.RELEASE_DIR ?? "release");
const stageDir = resolve(process.env.DMG_STAGE_DIR ?? ".dmg-stage");
const outputPath = join(releaseDir, `${appName}-${packageJson.version}-${artifactArch}.dmg`);

async function findApp(dir: string): Promise<string | undefined> {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.endsWith(".app")) {
      return join(dir, entry.name);
    }
  }

  return undefined;
}

const appPath = resolve(process.env.APP_PATH ?? (await findApp(buildDir)) ?? "");

if (!appPath) {
  throw new Error(`No .app bundle found in ${buildDir}. Run bun run build first.`);
}

try {
  const appStats = await stat(appPath);
  if (!appStats.isDirectory() || !appPath.endsWith(".app")) {
    throw new Error();
  }
} catch {
  throw new Error(`Invalid app bundle path: ${appPath}`);
}

await rm(stageDir, { recursive: true, force: true });
await mkdir(stageDir, { recursive: true });
await mkdir(releaseDir, { recursive: true });
await rm(outputPath, { force: true });

const stagedAppPath = join(stageDir, `${appName}.app`);
await cp(appPath, stagedAppPath, { recursive: true });
await symlink("/Applications", join(stageDir, "Applications"), "dir");

if (process.env.SKIP_CODESIGN !== "1") {
  await Bun.$`codesign --force --deep --sign - ${stagedAppPath}`;
}

await Bun.$`hdiutil create -volname ${appName} -srcfolder ${stageDir} -ov -format UDZO ${outputPath}`;
await rm(stageDir, { recursive: true, force: true });

console.log(`Created ${outputPath}`);
