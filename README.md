# ref-angle

The source code for referenceangle.com (no longer active)

The website is a vanilla/jQuery Javascript frontend which makes API requests to the backend NodeJS server. 

The frontend takes the pitch/roll/yaw from the 3d model as well as other parameters from the checkboxes/sliders, and uses those to make an API request. The backend does a Postgres query to calculate the DIFFERENCE between the pitch/roll/yaw of the each image and the pitch/roll/yaw of the 3d model, and sorts by minimal difference (so finding images that are closest to the 3d model in terms of pitch/roll/yaw). 

The expected format of the postgres database is a row for each image containing a link to it stored in S3 along with the associated pitch/roll/yaw and other characteristics (sunglasses, emotion, etc). The database used in the original website was created by taking a dataset of face images and processing it (e.g via OpenCV or an AWS service) to calculate the pitch/roll/yaw of each image, along with the other characteristics.

The 3d model itself as well as other copyrighted assets are not included in the repository.