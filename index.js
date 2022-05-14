require('dotenv').config();
const fetch = require('node-fetch');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.URL;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1
});
exports.getCurrency = async (req, res) => {
	await client.connect();
	const db = client.db('eshop');
	const collection = db.collection('currency');
	console.log('db connected');
	let myHeaders = new fetch.Headers();
	myHeaders.append('apikey', process.env.API_KEY);

	let requestOptions = {
		method: 'GET',
		redirect: 'follow',
		headers: myHeaders
	};

	try {
		const results = await fetch(
			'https://api.apilayer.com/fixer/latest?symbols=&base=USD',
			requestOptions
		).then((response) => {
			return response.json();
		});
		const { rates } = results;
		for (let [key, value] of Object.entries(rates)) {
			await collection.findOneAndUpdate(
				{ id: key },
				{
					$set: {
						rate: value
					}
				},
				{ upsert: true }
			);
		}
		console.log('Currency Updated');
	} catch (error) {
		console.log(error);
	}
};
