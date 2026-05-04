import { spawn } from "node:child_process";

const processes = [];
let shuttingDown = false;

function run(name, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;

    shuttingDown = true;
    shutdown(signal ? 0 : code ?? 0);
  });

  processes.push({ name, child });
}

function shutdown(exitCode = 0) {
  for (const { child } of processes) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  process.exit(exitCode);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

run("client", "npm", ["run", "dev:client"], process.cwd());
run("api", "npm", ["run", "dev:api"], process.cwd());
