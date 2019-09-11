const express = require('express');
const APP = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const MP = require('mercadopago');
const path = require('path');
const http = require('http');

const { PORT, HOST, ACCESS_TOKEN, MONGODB_URI } = require('./config'),
  { Buyer } = require('./lib/models');

const PUBLIC_APP = path.join(process.cwd(), 'dist', 'public');

const raffleItems = {
  'Playstation PS4 Pro': {
    title: 'Playstation PS4 Pro',
    unit_price: 250,
    offer_price: 200,
    quantity: 1,
    raffle_date: new Date(2019, 9, 30)
  }
}

APP.use(bodyParser.json());
APP.use(bodyParser.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  APP.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Request-With, Content-Type, Authorization, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,PUT,DELETE,OPTIONS');
    next();
  });
}

APP.options('/*', (_, res) => {
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.sendStatus(200);
});

APP.post('/MP/pay/PS4Pro', async (req, res) => {
  const { name, email, identification, phone, participations } = req.body;

  const init_point = await createPreference(name, email, identification, phone, participations, 'Playstation PS4 Pro');

  res.json({ init_point });
});

APP.get('/participations/:DNI', async (req, res) => {
  try {

    const { DNI } = req.params;

    const participations = await Buyer.find({ DNI, status: 'aproved' }, { item: 1, _id: -1 });

    res.json(participations);

  } catch (error) {
    console.error(error);
  }
});

APP.get('/active_raffles', (req, res) => {
  const baseRaffle = {
    participant: {
      name: '',
      email: '',
      phone: '',
      DNI: '',
      participations: 1
    },
    initPoint: '',
    showAlert: false
  };

  activeRaffles = [
    {
      ...baseRaffle,
      ...raffleItems["Playstation PS4 Pro"],
      beneficts: [
        'White edition.',
        '100 juegos.',
        '2 joysticks.',
        '1 tera de disco.',
      ],
      endpoint: 'PS4Pro'
    }
  ];

  res.json(activeRaffles);
})

APP.get('/MP/success', async (req, res) => {
  try {
    const { collection_id, preference_id } = req.query;

    const buyer = await Buyer.findOne({ preference_id });

    buyer.collection_id = collection_id;
    buyer.status = 'aproved';

    await buyer.save();

    res.redirect(`${HOST}`);
  } catch (error) {
    console.error(error)
  }
});

APP.get('/MP/failure', async (req, res) => {
  try {
    const buyer = await Buyer.find({ preference_id });

    buyer.status = 'rejected';

    await buyer.save();

    res.redirect(`${HOST}`);
  } catch (error) {
    console.error(error)
  }
});

APP.use(express.static(PUBLIC_APP));


async function start() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true
  });

  await APP.listen(PORT);

  keepAlive();
}

async function createPreference(name, email, identification, phone, participations, item) {

  if (!name || !email || !identification || !phone || !participations) {
    res.sendStatus(409);
    throw new Error('Data validation error.');
  }

  const preference = {
    items: [
      { ...raffleItems[item] }
    ],
    additional_info: JSON.stringify({ name, email, identification }),
    payer: {
      name,
      email,
      identification,
      phone
    },
    back_urls: {
      success: `${HOST}/MP/success`,
      failure: `${HOST}/MP/failure`
    },
    auto_return: "approved"
  };

  try {
    MP.configure({ access_token: ACCESS_TOKEN });

    const { response: { init_point, id } } = await MP.preferences.create(preference);

    const buyer = new Buyer;

    buyer.DNI = identification.number;
    buyer.item = item;
    buyer.phone = phone.number.toString();
    buyer.email = email;
    buyer.preference_id = id;
    buyer.participations = participations;

    await buyer.save();

    return init_point;

  } catch (error) {
    console.error(error);
    throw new Error('Unexpected error.');
  }
}

function keepAlive() {
  setTimeout(() => {
    http.get(`${HOST}`);
    keepAlive();
  }, 1000 * 60 * 5);
}

start();

