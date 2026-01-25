const https = require('https');

const API_KEY = 'AIzaSyCuYfeLfCEUy8m6pq5zT_C_SvU2f8IeNvo';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

const fs = require('fs');

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        try {
            const json = JSON.parse(data);
            fs.writeFileSync('models_output.json', JSON.stringify(json, null, 2));
            console.log('Wrote to models_output.json');
        } catch (e) {
            console.log(data);
        }
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
