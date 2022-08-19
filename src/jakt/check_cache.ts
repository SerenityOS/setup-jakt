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
    let shouldCache = core.getBooleanInput("cache");
    let revision = core.getInput("revision");
    let token: string = core.getInput("token");
    const octokit = github.getOctokit(token);

    if (revision == "main") revision = await getLatestRevision(octokit);
    core.setOutput("jakt-hash", revision);

    if (!shouldCache) {
        core.setOutput("cache_hit", false);
        return;
    }

    let trickSemverVersion = `0.0.0+${revision}`;

    let jaktPath: string;
    try {
        jaktPath = tc.find("jakt", trickSemverVersion);
        if (jaktPath == "") {
            let availableVersions = tc.findAllVersions("jakt");
            core.debug("Found cached versions: " + availableVersions);
            throw new Error("jakt not found");
        }
        core.debug(`Found cached version of jakt at ${jaktPath}`);
        core.endGroup();

        core.setOutput("cache_hit", true);
        core.setOutput("jakt-path", jaktPath);
    } catch {
        core.info(`Cache entry for ${revision} not found. Downloading...`);
        core.endGroup();

        core.setOutput("cache_hit", false);
        return;
    }

    core.addPath(path.join(jaktPath, "bin"));
    core.exportVariable("CMAKE_PREFIX_PATH", cmakePrefixPath(jaktPath));
}

function cmakePrefixPath(jaktPath: string): string {
    let appendedPath = core.toPlatformPath(jaktPath);
    let separator = os.platform() == "win32" ? ";" : ":";
    return `${appendedPath}${separator}${process.env["CMAKE_PREFIX_PATH"]}`;
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
