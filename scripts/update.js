#!/usr/bin/env node

'use strict';

const assert = require('assert');
const os = require('os');
const path = require('path');
const util = require('util');
const childProcess = require('child_process');
const exec = util.promisify(childProcess.exec);
const fs = require('fs');
const fsp = fs.promises;

const PKG_ROOT = process.cwd();
const PKG_TYPES = path.join(PKG_ROOT, 'types');

(async () => {
  const pkg = require(path.join(PKG_ROOT, 'package.json'));
  const types = pkg.typeDependencies;
  const tmpdir = await randomTempDir();

  console.log(`Using tmpdir: ${tmpdir}`);

  for (const [name, info] of Object.entries(types)) {
    const version = info.version;
    const pkgName = info.pkgName;
    const url = await simpleExec(`npm view ${pkgName}@${version} dist.tarball`);
    const tmpPkgDir = path.join(tmpdir, name);
    await fsp.mkdir(tmpPkgDir);

    console.log(`Installing type ${name} - ${pkgName}@${version}...`);
    console.log(`  Fetching and extracting ${url}...`);
    await simpleExec(`curl -sL ${url} `
      + `| tar -zx -C ${tmpPkgDir} --strip-components=1`);

    const dest = path.join(PKG_ROOT, 'types', name);

    await rimraf(dest);
    console.log(`  Copying ${tmpPkgDir} to ${dest}...`);
    await mv(tmpPkgDir, dest);
    console.log(`  Installed type ${name} - ${pkgName}@${version}`);
  }

  await rimraf(tmpdir);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

async function simpleExec(cmd) {
  const {stdout, stderr} = await exec(cmd);

  if (stderr)
    throw new Error(stderr);

  return stdout.trim();
}

async function randomTempDir() {
  const tmpdir = os.tmpdir();
  const name = `type-install-${Math.random().toString(36).slice(2)}`;
  const dir = path.join(tmpdir, name);

  await fsp.mkdir(dir);

  return dir;
}

async function rimraf(dir) {
  assert(dir.startsWith(os.tmpdir()) || dir.startsWith(PKG_TYPES));

  if (!fs.existsSync(dir))
    return;

  const {stderr} = await exec(`rm -rf ${dir}`);

  if (stderr)
    throw new Error(stderr);

  return;
}

async function mv(src, dest) {
  assert(src.startsWith(os.tmpdir()) || dest.startsWith(PKG_TYPES));
  const {stdout, stderr} = await exec(`mv ${src} ${dest}`);

  if (stderr)
    throw new Error(stderr);

  return stdout.trim();
}
