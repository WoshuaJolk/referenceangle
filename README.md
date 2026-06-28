# ref-angle

The source code for referenceangle.com (no longer active)

The website is a vanilla/jQuery Javascript frontend which makes API requests to the backend NodeJS server. 

The frontend takes the pitch/roll/yaw from the 3d model as well as other parameters from the checkboxes/sliders, and uses those to make an API request. The backend does a Postgres query to calculate the DIFFERENCE between the pitch/roll/yaw of the each image and the pitch/roll/yaw of the 3d model, and sorts by minimal difference (so finding images that are closest to the 3d model in terms of pitch/roll/yaw). 

The expected format of the postgres database is a row for each image containing a link to it stored in S3 along with the associated pitch/roll/yaw and other characteristics (sunglasses, emotion, etc). The database used in the original website was created by taking a dataset of face images and processing it (e.g via OpenCV or an AWS service) to calculate the pitch/roll/yaw of each image, along with the other characteristics.

The 3d model itself as well as other copyrighted assets are not included in the repository.

## Stack (revival)

The app is an Express server (EJS views, static assets in `public/`) deployed on
Vercel (Hobby) as a serverless function via `api/index.js` + `vercel.json`. It
talks to a Neon Postgres database through the `@neondatabase/serverless` Pool.

### Configuration

Set a single environment variable:

- `DATABASE_URL` — Postgres connection string (e.g. your Neon pooled connection string).

On Vercel, add `DATABASE_URL` under Project Settings → Environment Variables. The
target table is `reference` with columns: `pitch, yaw, roll, url, gender, lowAge,
highAge, emotions`, and booleans `isSmiling, sunGlasses, eyeGlasses, beard,
mustache, eyesOpen, mouthOpen`. The database still needs to be seeded with image
data (not included in this repo).

### Run locally

```bash
npm install
export DATABASE_URL="postgres://user:pass@host/dbname"
npm start   # serves on http://localhost:7050 (or $PORT)
```

The home page renders without a database; the `/api/facePoses` endpoint requires
`DATABASE_URL` to be set and the `reference` table to be populated.