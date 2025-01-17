import { createBucketClient } from "@cosmicjs/sdk";
import jwt from "jsonwebtoken";
import Cryptr from 'cryptr';
import moment from "moment";
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';


const createLicense = async () => {

  const BUCKET_SLUG = process.env.GYMCONTROL_COSMIC_BUCKET_SLUG || '';
  const READ_KEY = process.env.GYMCONTROL_COSMIC_READ_KEY || '';
  const WRITE_KEY = process.env.GYMCONTROL_COSMIC_WRITE_KEY || '';
  const ACTIVATION_SECRET = process.env.GYMCONTROL_ACTIVATION_SECRET || '';
  const ACTIVATION_SALT = process.env.GYMCONTROL_ACTIVATION_SALT || '';
  const ACTIVATION_NAME = process.env.GYMCONTROL_ACTIVATION_NAME || '';
  const ACTIVATION_TYPE = process.env.GYMCONTROL_ACTIVATION_TYPE || '';
  const ACTIVATION_EXPIRATION = moment().add(10, 'years').format('DD/MM/YYYY');

  const cosmic = createBucketClient({
    bucketSlug: BUCKET_SLUG,
    readKey: READ_KEY,
    writeKey: WRITE_KEY,
  });

  const cryptr = new Cryptr(ACTIVATION_SECRET);
  const ACTIVATION_KEY = cryptr.encrypt(jwt.sign({ type: ACTIVATION_TYPE, name: ACTIVATION_NAME, expiration: ACTIVATION_EXPIRATION }, ACTIVATION_SALT));
  const password = randomBytes(32).toString('hex');
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  cosmic.objects.insertOne({
    title: ACTIVATION_NAME,
    type: 'licenses',
    metadata: {
      "activation-key": ACTIVATION_KEY,
      "password": hashedPassword,
    },
  }).then((response) => {
    console.log(`Activation Key: ${response.object.metadata['activation-key']}`);
    console.log(`Username: ${response.object.slug}`);
    console.log(`Password: ${password}`);
  }).catch((error) => {
    console.error(error);
  });
};

createLicense();
