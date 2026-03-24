const { execSync } = require('child_process');
try {
  const out = execSync('npx prisma validate', { encoding: 'utf-8', stdio: 'pipe' });
  console.log("SUCCESS:");
  console.log(out);
} catch (e) {
  console.log("ERROR:");
  console.log(e.stderr || e.stdout || e.message);
}
