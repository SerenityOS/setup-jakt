import * as core from "@actions/core";
import * as io from "@actions/io";
import * as tc from "@actions/tool-cache";
import * as github from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";
import path from "path";
import child_process from "child_process";
import process from "process";
import os from "os";
import glob from "glob";

async function run() {
    let revision = core.getInput("revision");
    let shouldCache = core.getBooleanInput("cache");
    let token: string = core.getInput("token");
    const octokit = github.getOctokit(token);

    if (revision == "main") revision = await getLatestRevision(octokit);

    core.setOutput("jakt-hash", revision);

    core.startGroup(`Pulling requested revision (${revision})`);
    let jaktPath: string | undefined = undefined;

    if (shouldCache) {
        try {
            jaktPath = tc.find("jakt", revision);
            if (jaktPath == "") {
                let availableVersions = tc.findAllVersions("jakt");
                jaktPath = undefined;
                core.debug("Found cached versions: " + availableVersions);
                console.log();
                throw new Error("jakt not found");
            }
            core.debug(`Found cached version of jakt at ${jaktPath}`);
            core.endGroup();

            core.setOutput("cache_hit", true);
        } catch {
            core.info(`Cache entry for ${revision} not found. Downloading...`);
        }
    }

    if (jaktPath == undefined) {
        let downloadedPath = await tc.downloadTool(
            `https://github.com/SerenityOS/jakt/archive/${revision}.zip`
        );
        core.endGroup();

        core.setOutput("cache_hit", false);

        core.startGroup(`Building jakt#${revision}`);
        core.info(`Extracting jakt`);
        let extractedPath = path.join(await tc.extractZip(downloadedPath), `jakt-${revision}`);

        core.info(`Building jakt`);
        let buildPath = path.join(extractedPath, "build");
        await io.mkdirP(buildPath);

        jaktPath = path.join(extractedPath, "jakt");
        await io.mkdirP(jaktPath);

        if (process.env["JAKT_ACTION_CACHE_HIT"] == "true") {
            core.info(`Setting up toolchain paths`);
            let cmakeBinPath = await new Promise<string>((res, rej) =>
                glob(`${process.env["JAKT_ACTION_CACHE_PATH"]}/*/bin`, (err, matches) => {
                    if (err) return rej(err);
                    res(matches[0]);
                })
            );

            for (const p of ["llvm/bin", "ninja"]) {
                core.addPath(path.join(process.env["JAKT_ACTION_CACHE_PATH"]!, p));
            }

            core.addPath(cmakeBinPath);
        }

        await runCommand(
            buildPath,
            "cmake",
            "-DCMAKE_CXX_COMPILER=clang++",
            `-DCMAKE_INSTALL_PREFIX=${jaktPath}`,
            "-GNinja",
            "-S",
            ".."
        );
        await runCommand(buildPath, "cmake", "--build", ".");
        await runCommand(buildPath, "cmake", "--install", ".");
    }

    core.endGroup();

    core.setOutput("jakt-path", jaktPath);

    if (shouldCache) {
        core.startGroup(`Caching jakt#${revision}`);
        let cachedPath = await tc.cacheDir(jaktPath, "jakt", revision);
        core.info(`Cached jakt at ${cachedPath}`);
        core.endGroup();
    }

    core.addPath(path.join(jaktPath, "bin"));
    core.exportVariable("CMAKE_PREFIX_PATH", cmakePrefixPath(jaktPath));
    core.exportVariable("JAKT_COMPILER", path.join(jaktPath, "bin/jakt"));
    core.exportVariable("JAKT_RUNTIME", path.join(jaktPath, "include/runtime"));
}

function cmakePrefixPath(jaktPath: string): string {
    let appendedPath = core.toPlatformPath(jaktPath);
    let existingPath = process.env["CMAKE_PREFIX_PATH"];
    if (existingPath == undefined)
        return appendedPath;

    let separator = os.platform() == "win32" ? ";" : ":";
    return `${appendedPath}${separator}${existingPath}`;
}

async function runCommand(cwd: string, command: string, ...args: string[]): Promise<void> {
    return new Promise((res, rej) => {
        try {
            let process = child_process.spawn(command, args, {
                cwd,
                stdio: "inherit",
            });
            process.on("close", code => {
                if (code == 0) res();
                else rej(new Error(`cmake exited with code ${code}`));
            });
        } catch (e) {
            rej(e);
        }
    });
}

async function getLatestRevision(octokit: InstanceType<typeof GitHub>): Promise<string> {
    let latest = await octokit.rest.repos.getCommit({
        owner: "SerenityOS",
        repo: "jakt",
        ref: "main",
    });
    return latest.data.sha;
}

run();
