/**
 * Windows EISDIR readlink patch.
 *
 * On Windows (especially Node 22+), calling fs.readlink / fs.readlinkSync
 * on a regular file throws EISDIR instead of the EINVAL/ENOENT that POSIX
 * systems return. Webpack and enhanced-resolve call readlink on every file
 * they encounter to check whether it is a symlink; when the call throws
 * EISDIR, the webpack build crashes.
 *
 * This module monkey-patches fs.readlink and fs.readlinkSync to convert
 * EISDIR → EINVAL so that webpack treats the file as a non-symlink (which
 * is the correct behaviour) and continues without error.
 *
 * Loaded via `node -r ./windows-readlink-patch.js` in the build script
 * so that the patch is active before any webpack code is required.
 */

"use strict";

if (process.platform !== "win32") return; // no-op on Linux/macOS

const fs = require("fs");

// ── readlinkSync ──────────────────────────────────────────────────────────────
const _readlinkSync = fs.readlinkSync.bind(fs);
fs.readlinkSync = function readlinkSync(path, options) {
  try {
    return _readlinkSync(path, options);
  } catch (err) {
    if (err && err.code === "EISDIR") {
      const e = new Error(`EINVAL: invalid argument, readlink '${path}'`);
      e.code = "EINVAL";
      e.syscall = "readlink";
      e.path = String(path);
      throw e;
    }
    throw err;
  }
};

// ── readlink (callback) ───────────────────────────────────────────────────────
const _readlink = fs.readlink.bind(fs);
fs.readlink = function readlink(path, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = undefined;
  }
  _readlink(path, options, function (err, linkString) {
    if (err && err.code === "EISDIR") {
      const e = new Error(`EINVAL: invalid argument, readlink '${path}'`);
      e.code = "EINVAL";
      e.syscall = "readlink";
      e.path = String(path);
      return callback(e);
    }
    callback(err, linkString);
  });
};

// ── readlink (promise) ────────────────────────────────────────────────────────
const fsPromises = fs.promises;
if (fsPromises) {
  const _readlinkPromise = fsPromises.readlink.bind(fsPromises);
  fsPromises.readlink = async function readlink(path, options) {
    try {
      return await _readlinkPromise(path, options);
    } catch (err) {
      if (err && err.code === "EISDIR") {
        const e = new Error(`EINVAL: invalid argument, readlink '${path}'`);
        e.code = "EINVAL";
        e.syscall = "readlink";
        e.path = String(path);
        throw e;
      }
      throw err;
    }
  };
}
