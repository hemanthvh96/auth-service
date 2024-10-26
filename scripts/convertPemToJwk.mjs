import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import rsaPemToJwk from 'rsa-pem-to-jwk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const privateKey = fs.readFileSync(
    path.join(__dirname, '../certs/private.pem'),
);

// const privateKey = fs.readFileSync(
//     path.join(__dirname, '../certs/private.pem'), // THIS WAY OF USING __DIRNAME WONT WORK WITH .MJS MODULES
// );

const jwk = rsaPemToJwk(privateKey, { use: 'sig' }, 'public');

console.log(JSON.stringify(jwk)); // COPY THIS STRINGIFIED JWK and PASTE IN PUBLIC/.WELL-KNOWN/JWKS.JSON
