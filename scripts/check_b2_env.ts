import * as fs from "fs";

const e = fs.readFileSync(".env", "utf8");
const ex = fs.readFileSync(".env.example", "utf8");

const getB2 = (c: string) => {
  const m1 = c.match(/B2_ACCESS_KEY_ID\s*=\s*([^\r\n]+)/);
  const m2 = c.match(/B2_SECRET_ACCESS_KEY\s*=\s*([^\r\n]+)/);
  const m3 = c.match(/B2_BUCKET_NAME\s*=\s*([^\r\n]+)/);
  const m4 = c.match(/B2_ENDPOINT\s*=\s*([^\r\n]+)/);
  return {
    endpoint: m4?.[1]?.trim(),
    bucket: m3?.[1]?.trim(),
    idPrefix: m1?.[1]?.trim().slice(0, 4) + "...",
    secretPrefix: m2?.[1]?.trim().slice(0, 4) + "...",
  };
};

console.log(".env:", getB2(e));
console.log(".env.example:", getB2(ex));
