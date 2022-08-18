"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var core = __importStar(require("@actions/core"));
var io = __importStar(require("@actions/io"));
var tc = __importStar(require("@actions/tool-cache"));
var github = __importStar(require("@actions/github"));
var path_1 = __importDefault(require("path"));
var child_process_1 = __importDefault(require("child_process"));
var process_1 = __importDefault(require("process"));
var os_1 = __importDefault(require("os"));
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var revision, shouldCache, token, octokit, jaktPath, availableVersions, downloadedPath, extractedPath, _a, _b, buildPath;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    revision = core.getInput("revision");
                    shouldCache = core.getBooleanInput("cache");
                    token = core.getInput("token");
                    octokit = github.getOctokit(token);
                    if (!(revision == "main")) return [3 /*break*/, 2];
                    return [4 /*yield*/, getLatestRevision(octokit)];
                case 1:
                    revision = _c.sent();
                    _c.label = 2;
                case 2:
                    core.setOutput("jakt-hash", revision);
                    core.startGroup("Pulling requested revision (".concat(revision, ")"));
                    jaktPath = undefined;
                    if (shouldCache) {
                        try {
                            jaktPath = tc.find("jakt", revision);
                            if (jaktPath == "") {
                                availableVersions = tc.findAllVersions("jakt");
                                jaktPath = undefined;
                                core.debug("Found cached versions: " + availableVersions);
                                console.log();
                                throw new Error("jakt not found");
                            }
                            core.exportVariable("cache-hit", true);
                            core.debug("Found cached version of jakt at ".concat(jaktPath));
                            core.endGroup();
                        }
                        catch (_d) {
                            core.info("Cache entry for ".concat(revision, " not found. Downloading..."));
                        }
                    }
                    if (!(jaktPath == undefined)) return [3 /*break*/, 10];
                    core.exportVariable("cache-hit", false);
                    return [4 /*yield*/, tc.downloadTool("https://github.com/SerenityOS/jakt/archive/".concat(revision, ".zip"))];
                case 3:
                    downloadedPath = _c.sent();
                    core.endGroup();
                    core.startGroup("Building jakt#".concat(revision));
                    core.info("Extracting jakt");
                    _b = (_a = path_1["default"]).join;
                    return [4 /*yield*/, tc.extractZip(downloadedPath)];
                case 4:
                    extractedPath = _b.apply(_a, [_c.sent(), "jakt-".concat(revision)]);
                    core.info("Building jakt");
                    buildPath = path_1["default"].join(extractedPath, "build");
                    return [4 /*yield*/, io.mkdirP(buildPath)];
                case 5:
                    _c.sent();
                    jaktPath = path_1["default"].join(extractedPath, "jakt");
                    return [4 /*yield*/, io.mkdirP(jaktPath)];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, runCommand(buildPath, "cmake", "-DCMAKE_CXX_COMPILER=clang++", "-DCMAKE_INSTALL_PREFIX=".concat(jaktPath), "-GNinja", "-S", "..")];
                case 7:
                    _c.sent();
                    return [4 /*yield*/, runCommand(buildPath, "cmake", "--build", ".")];
                case 8:
                    _c.sent();
                    return [4 /*yield*/, runCommand(buildPath, "cmake", "--install", ".")];
                case 9:
                    _c.sent();
                    _c.label = 10;
                case 10:
                    core.setOutput("jakt-path", jaktPath);
                    core.endGroup();
                    if (shouldCache) {
                        core.startGroup("Caching jakt#".concat(revision));
                        tc.cacheDir(jaktPath, "jakt", revision);
                        core.endGroup();
                    }
                    core.startGroup("Preparing jakt");
                    core.addPath(path_1["default"].join(jaktPath, "bin"));
                    core.exportVariable("CMAKE_PREFIX_PATH", cmakePrefixPath(jaktPath));
                    core.endGroup();
                    return [2 /*return*/];
            }
        });
    });
}
function cmakePrefixPath(jaktPath) {
    var appendedPath = core.toPlatformPath(jaktPath);
    var separator = os_1["default"].platform() == "win32" ? ";" : ":";
    return "".concat(appendedPath).concat(separator).concat(process_1["default"].env["CMAKE_PREFIX_PATH"]);
}
function runCommand(cwd, command) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, rej) {
                    try {
                        var process_2 = child_process_1["default"].spawn(command, args, {
                            cwd: cwd,
                            stdio: "inherit"
                        });
                        process_2.on("close", function (code) {
                            if (code == 0)
                                res();
                            else
                                rej(new Error("cmake exited with code ".concat(code)));
                        });
                    }
                    catch (e) {
                        rej(e);
                    }
                })];
        });
    });
}
function getLatestRevision(octokit) {
    return __awaiter(this, void 0, void 0, function () {
        var latest;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, octokit.rest.repos.getCommit({
                        owner: "SerenityOS",
                        repo: "jakt",
                        ref: "main"
                    })];
                case 1:
                    latest = _a.sent();
                    return [2 /*return*/, latest.data.sha];
            }
        });
    });
}
run();
